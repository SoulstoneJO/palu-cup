import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMatchData } from "../api";
import Draftboard from "./DraftBoard";
import StatsBoard from "./StatsBoard";

export default function MatchRoom({ config }) {
  const { matchId } = useParams();
  const { user } = useAuth();
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // WebSocket connection
  useEffect(() => {
    let ws;
    let timeoutId;

    const connect = () => {
      // 优先使用环境变量，生产环境默认为当前域名的 /ws 路径 (适配 Caddy)
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const defaultWsUrl = `${protocol}//${window.location.host}/ws`;
      const wsUrl = import.meta.env.VITE_WS_URL || defaultWsUrl;

      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          if (JSON.parse(event.data).id === matchId) setRefreshTrigger(p => p + 1);
        } catch (error) {
          console.error('WebSocket error:', error);
        }
      };

      ws.onclose = () => {
        timeoutId = setTimeout(connect, 3000);
      };
    };

    connect();
    return () => {
      ws?.close();
      clearTimeout(timeoutId);
    };
  }, [matchId]);

  // Fetch match data
  useEffect(() => {
    getMatchData(matchId)
      .then(setMatchData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [matchId, refreshTrigger]);

  if (loading) {
    return <div style={{ color: '#fff', padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (!matchData) {
    return <div style={{ color: '#fff', padding: '2rem', textAlign: 'center' }}>Match not found</div>;
  }

  const { status } = matchData;
  const isAdmin = user?.role === 'admin';

  if (status === "筹备中" && !isAdmin) {
    return (
      <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#9ca3af', fontSize: '1.5rem' }}>
        比赛仍在筹备中
      </div>
    );
  }

  if (status === "进行中" || status === "已结束") {
    return <StatsBoard matchData={matchData} />;
  }

  // Default: 选位中
  return <Draftboard config={config} matchData={matchData} />;
}