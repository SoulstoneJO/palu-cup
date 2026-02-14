const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const logger = require('koa-logger');
const fs = require('fs-extra');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { Level } = require('level');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = new Koa();
const router = new Router();
const CONFIG_PATH = path.join(__dirname, 'config.json');
const DB_PATH = path.join(__dirname, 'leveldb');
const REPORTS_PATH = path.join(__dirname, 'reports');
fs.ensureDirSync(REPORTS_PATH);
const JWT_SECRET = process.env.JWT_SECRET;
const db = new Level(DB_PATH, { valueEncoding: 'json' });



// 日志中间件：记录请求方法、URL、状态码和响应时间
app.use(logger());
app.use(cors());
app.use(bodyParser());


const server = http.createServer(app.callback());
const wss = new WebSocket.Server({ server });

const broadcast = (data) => {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};

// JWT 认证中间件
const authMiddleware = async (ctx, next) => {
    // 放行登录接口
    if (ctx.path === '/login') {
        await next();
        return;
    }
    // 从 Authorization 头获取 Token (格式: Bearer <token>)
    const authHeader = ctx.headers.authorization;
    if (!authHeader) {
        ctx.status = 401;
        ctx.body = { error: '未提供认证令牌 (No token provided)' };
        return;
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        ctx.state.user = decoded; // 将解码后的用户信息存入 ctx.state
    } catch (err) {
        ctx.status = 401;
        ctx.body = { error: '无效或过期的令牌 (Invalid or expired token)' };
        return;
    }
    await next();
};

router.get('/api/config', async (ctx) => {
    const config = await fs.readJson(CONFIG_PATH);
    const filteredConfig = {
        matchDate: config.matchDate,
        slotsPerTeam: config.slotsPerTeam,
        initialTeams: config.initialTeams,
        playerPool: config.playerPool
    };
    ctx.body = filteredConfig;
});

// 获取当前比赛数据
router.get('/api/match', async (ctx) => {
    try {
        const content = await db.get('matchData');
        ctx.body = { result: true, content };
    } catch (error) {
        if (error.code === 'LEVEL_NOT_FOUND') {
            // If data does not exist, return null which is a valid state for the frontend.
            ctx.body = { result: true, content: null };
        } else {
            // For other DB errors, return a server error.
            console.error('Failed to read match data from LevelDB:', error);
            ctx.status = 500;
            ctx.body = { result: false, error: 'Internal Server Error' };
        }
    }
});

// 获取指定比赛的 Draft 数据
router.get('/api/match/:id', async (ctx) => {
    const id = ctx.params.id;
    try {
        const mainKey = `matchData:${id}`;
        const teamKey = `${id}:team`;
        const poolKey = `${id}:pool`;
        const draftOrderKey = `${id}:draftOrder`;
        const stateKey = `${id}:state`;
        const reportKey = `${id}:report`;

        const [mainData, teamsData, poolData, draftOrderData, stateData, matchesList, reportData] = await Promise.all([
            db.get(mainKey).catch(e => {
                if (e.code === 'LEVEL_NOT_FOUND') return null;
                throw e;
            }),
            db.get(teamKey).catch(e => {
                if (e.code === 'LEVEL_NOT_FOUND') return [];
                throw e;
            }),
            db.get(poolKey).catch(e => {
                if (e.code === 'LEVEL_NOT_FOUND') return [];
                throw e;
            }),
            db.get(draftOrderKey).catch(e => {
                if (e.code === 'LEVEL_NOT_FOUND') return [];
                throw e;
            }),
            db.get(stateKey).catch(e => {
                if (e.code === 'LEVEL_NOT_FOUND') return {};
                throw e;
            }),
            db.get('matchesList').catch(e => {
                if (e.code === 'LEVEL_NOT_FOUND') return [];
                throw e;
            }),
            db.get(reportKey).catch(e => {
                if (e.code === 'LEVEL_NOT_FOUND') return null;
                throw e;
            })
        ]);

        if (!mainData && !teamsData && !poolData && !draftOrderData && !stateData && !matchesList.find(m => m.id === id) && !reportData) {
            ctx.body = { result: true, content: null };
            return;
        }

        const content = {
            ...(mainData || {}),
            teams: teamsData || [],
            pool: poolData || [],
            draftOrder: draftOrderData || [],
            ...(matchesList.find(m => m.id === id) || {}),
            ...stateData,
            report: reportData
        };
        // Ensure ID is present
        content.id = id;

        ctx.body = { result: true, content };
    } catch (error) {
        console.error('Failed to read match data:', error);
        ctx.status = 500;
        ctx.body = { result: false, error: 'Internal Server Error' };
    }
});

// 保存当前比赛数据
router.post('/api/match', async (ctx) => {
    const partialUpdate = ctx.request.body;
    const id = partialUpdate.id;

    if (id) {
        const mainKey = `matchData:${id}`;
        const teamKey = `${id}:team`;
        const poolKey = `${id}:pool`;
        const draftOrderKey = `${id}:draftOrder`;
        const { teams, pool, draftOrder, id: _id, ...rest } = partialUpdate;

        if (teams) {
            await db.put(teamKey, teams);
        }

        if (pool) {
            await db.put(poolKey, pool);
        }

        if (draftOrder) {
            await db.put(draftOrderKey, draftOrder);
        }

        if (Object.keys(rest).length > 0) {
            const oldData = await db.get(mainKey).catch(() => ({}));
            const newData = { ...oldData, ...rest };
            delete newData.teams; // Ensure teams/pool are not in main data
            delete newData.pool;
            delete newData.draftOrder;
            await db.put(mainKey, newData);
        }

        broadcast(partialUpdate);
    } else {
        // Legacy support for no-id
        const key = 'matchData';
        const oldData = await db.get(key).catch(() => ({}));
        const newData = { ...oldData, ...partialUpdate };
        await db.put(key, newData);
        broadcast(newData);
    }

    ctx.body = { result: true };
});

// 保存当前比赛人员池数据
router.post('/api/match/pool', async (ctx) => {
    const { id, pool } = ctx.request.body;
    console.log('Received pool update for match ID:', id, pool?.length);
    if (id && pool) {
        await db.put(`${id}:pool`, pool);
        broadcast({ id, pool });
    }
    ctx.body = { result: true };
});

// 保存当前比赛选人顺序数据
router.post('/api/match/draftOrder', async (ctx) => {
    const { id, draftOrder } = ctx.request.body;
    if (id && draftOrder) {
        await db.put(`${id}:draftOrder`, draftOrder);
        broadcast({ id, draftOrder });
    }
    ctx.body = { result: true };
});

// 保存当前比赛状态数据 (currentOrderIndex, activeTeamId, etc.)
router.post('/api/match/state', async (ctx) => {
    const { id, ...state } = ctx.request.body;
    if (id) {
        await db.put(`${id}:state`, state);
        broadcast({ id, ...state });
    }
    ctx.body = { result: true };
});

// 生成战报
router.post('/api/match/report', async (ctx) => {
    const { id, teams } = ctx.request.body;
    if (!id || !teams) {
        ctx.status = 400;
        ctx.body = { error: 'Missing id or teams' };
        return;
    }

    // Save report data to LevelDB
    await db.put(`${id}:report`, { teams });
    await db.del(`${id}:team`);
    await db.del(`${id}:pool`);
    await db.del(`${id}:draftOrder`);
    await db.del(`${id}:state`);

    // Update match status to "进行中"
    let matches = [];
    try {
        matches = await db.get('matchesList');
    } catch (err) {
        if (err.code !== 'LEVEL_NOT_FOUND') throw err;
    }
    if (!Array.isArray(matches)) matches = [];

    const index = matches.findIndex(m => m.id === id);
    if (index !== -1) {
        matches[index].status = "进行中";
        await db.put('matchesList', matches);
    }

    broadcast({ id, report: { teams }, status: "进行中" });

    ctx.body = { result: true };
});

// 获取战报
router.get('/api/match/:id/report', async (ctx) => {
    const id = ctx.params.id;
    try {
        const content = await db.get(`${id}:report`);
        ctx.body = { result: true, content };
    } catch (error) {
        // If report not found, return null content but success true (or handle as 404 if preferred)
        ctx.body = { result: true, content: null };
    }
});

// 获取比赛列表
router.get('/api/matches', async (ctx) => {
    try {
        const content = await db.get('matchesList');
        ctx.body = { result: true, content };
    } catch (error) {
        if (error.code === 'LEVEL_NOT_FOUND') {
            ctx.body = { result: true, content: [] };
        } else {
            console.error('Failed to read matches list:', error);
            ctx.status = 500;
            ctx.body = { result: false, error: 'Internal Server Error' };
        }
    }
});

// 新增比赛 (追加单个对象)
router.post('/api/matches', async (ctx) => {
    const newMatch = ctx.request.body;
    newMatch.id = uuidv4(); // 生成 UUID

    let matches = [];
    try {
        matches = await db.get('matchesList');
    } catch (err) {
        if (err.code !== 'LEVEL_NOT_FOUND') {
            throw err;
        }
    }
    if (!Array.isArray(matches)) matches = [];

    matches.push(newMatch);
    await db.put('matchesList', matches);

    ctx.body = { result: true, id: newMatch.id }; // 返回生成的 ID
});

// 更新比赛队伍
router.put('/api/match/:id/teams', async (ctx) => {
    const id = ctx.params.id;
    const teams = ctx.request.body;
    await db.put(`${id}:team`, teams);
    broadcast({ id, teams });
    ctx.body = { result: true };
});


// 更新单个比赛
router.patch('/api/matches', async (ctx) => {
    const updatedMatch = ctx.request.body;

    let matches = [];
    try {
        matches = await db.get('matchesList');
    } catch (err) {
        if (err.code !== 'LEVEL_NOT_FOUND') {
            throw err;
        }
    }
    if (!Array.isArray(matches)) matches = [];

    const index = matches.findIndex(m => m.id === updatedMatch.id);
    if (index !== -1) {
        matches[index] = updatedMatch;
        await db.put('matchesList', matches);
        broadcast(updatedMatch);
        ctx.body = { result: true };
    } else {
        ctx.status = 404;
        ctx.body = { error: 'Match not found' };
    }
});

// 删除单个比赛
router.delete('/api/matches/:id', async (ctx) => {
    const id = ctx.params.id;

    let matches = [];
    try {
        matches = await db.get('matchesList');
    } catch (err) {
        if (err.code !== 'LEVEL_NOT_FOUND') {
            throw err;
        }
    }
    if (!Array.isArray(matches)) matches = [];

    console.log('Deleting match with ID:', id);
    console.log('Current matches:', matches);

    const initialLength = matches.length;
    matches = matches.filter(m => m.id !== id);

    if (matches.length !== initialLength) {
        await db.put('matchesList', matches);

        // Delete all associated match data
        await db.del(`${id}:team`);
        await db.del(`${id}:pool`);
        await db.del(`${id}:draftOrder`);
        await db.del(`${id}:state`);
        await db.del(`${id}:report`);

        ctx.body = { result: true };
    } else {
        ctx.status = 404;
        ctx.body = { error: 'Match not found' };
    }
});

// 保存比赛列表 (全量覆盖，用于删除等操作)
router.put('/api/matches', async (ctx) => {
    await db.put('matchesList', ctx.request.body);
    ctx.body = { result: true };
});

// 登录接口：颁发 Token
router.post('/login', async (ctx) => {
    const { account, password } = ctx.request.body;

    const config = await fs.readJson(CONFIG_PATH);
    const user = config.members.find(m => m.account === account && m.password === password);

    if (user) {
        // 签发 Token，有效期 1周
        const token = jwt.sign({ role: user.role, account: user.account }, JWT_SECRET, { expiresIn: '7d' });
        ctx.body = { success: true, token };
    } else {
        ctx.status = 401;
        ctx.body = { success: false, message: '账号或密码错误' };
    }
});

app.use(authMiddleware).use(router.routes());

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ 后端运行: http://localhost:${PORT}`);
});