const { Level } = require('level');
const fs = require('fs-extra');
const path = require('path');

const DB_PATH = path.join(__dirname, 'leveldb');
const CONFIG_PATH = path.join(__dirname, 'config.json');

async function init() {
    console.log('正在初始化 LevelDB...');
    const db = new Level(DB_PATH, { valueEncoding: 'json' });

    try {
        if (await fs.pathExists(CONFIG_PATH)) {
            console.log('读取 config.json 文件，正在初始化比赛数据...');
            const config = await fs.readJson(CONFIG_PATH);

            const initData = {
                pool: config.playerPool || []
            };

            await db.put('initData', initData);
            console.log('✅ 数据初始化成功！(基于 config.json)');
        } else {
            console.log('未发现 config.json，无法初始化。');
        }
    } catch (err) {
        console.error('❌ 初始化失败:', err);
    } finally {
        await db.close();
    }
}

init();
