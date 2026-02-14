const BASE_URL = import.meta.env.VITE_API_URL || ""; // 优先使用环境变量，生产环境留空走相对路径

async function request(url, options = {}) {
    const token = localStorage.getItem("token");
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await fetch(BASE_URL + url, {
        headers: {
            "Content-Type": "application/json",
            ...authHeaders,
            ...options.headers,
        },
        ...options,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`API 错误 ${res.status}: ${text}`);
    }

    return res.json();
}

// ===== 通用方法 =====

export const apiGet = (url) => request(url, { method: "GET" });
export const apiPost = (url, data) =>
    request(url, { method: "POST", body: JSON.stringify(data) });
export const apiPut = (url, data) =>
    request(url, { method: "PUT", body: JSON.stringify(data) });
export const apiPatch = (url, data) =>
    request(url, { method: "PATCH", body: JSON.stringify(data) });
export const apiDelete = (url) => request(url, { method: "DELETE" });

// ===== 具体接口 =====

export const getConfig = () => apiGet("/api/config");
export const getMatchData = async (id) => {
    const url = id ? `/api/match/${id}` : "/api/match";
    const res = await apiGet(url);
    return res.content;
};
export const saveMatchTeamData = (data) => apiPost("/api/match/team", data);
export const saveMatchPoolData = (data) => apiPost("/api/match/pool", data);
export const saveMatchDraftOrder = (data) => apiPost("/api/match/draftOrder", data);
export const saveMatchStateData = (data) => apiPost("/api/match/state", data);
export const generateMatchReport = (data) => apiPost("/api/match/report", data);
export const getMatchReport = (id) => apiGet(`/api/match/${id}/report`);
export const getMatchesList = async () => {
    const res = await apiGet("/api/matches");
    return res.content || [];
};
export const saveMatchesList = (data) => apiPut("/api/matches", data);
export const addMatch = async (data) => await apiPost("/api/matches", data);
export const updateMatch = (data) => apiPatch("/api/matches", data);
export const deleteMatch = (id) => apiDelete(`/api/matches/${id}`);
export const updateMatchTeams = (id, teams) => apiPut(`/api/match/${id}/teams`, teams);

export const login = async (account, password) => {
    // 调用通用的 post 方法请求登录接口
    const data = await apiPost("/login", { account, password });
    // 如果登录成功且返回了 token，则存入 localStorage
    if (data.success && data.token) {
        localStorage.setItem("token", data.token);
    }
    return data;
};
