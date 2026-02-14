import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMatchReport } from "../api";
 
export default function StatsBoard({ matchData, matchDate }) {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const fetchReport = async () => {
      if (matchData?.id) {
        try {
          const res = await getMatchReport(matchData.id);
          if (res.result && res.content && res.content.teams) {
            setTeams(res.content.teams);
          }
        } catch (error) {
          console.error("Failed to fetch match report:", error);
        }
      }
    };
    fetchReport();
  }, [matchData]);
 
  return (
    <div className="stats-shell">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, color: '#fff' }}>比赛统计 - {matchDate}</h2>
        <button 
          onClick={() => navigate("/")} 
          style={{ 
            padding: "0.5rem 1rem", 
            backgroundColor: "#374151", 
            color: "white", 
            border: "1px solid #4b5563", 
            borderRadius: "0.5rem",
            cursor: "pointer"
          }}
        >
          返回列表
        </button>
      </div>
      
      <div className="stats-teams-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {teams.map(team => (
          <div key={team.id} className="stats-team-card" style={{ backgroundColor: '#1f2937', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid #374151' }}>
            <div style={{ 
              backgroundColor: team.color || '#4f46e5', 
              padding: '0.75rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ color: '#fff', margin: 0, fontSize: '1.1rem', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{team.name}</h3>
              <span style={{ backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff', padding: '0.1rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem' }}>
                {team.players?.length || 0} 人
              </span>
            </div>
            
            <div className="stats-players-list" style={{ padding: '1rem' }}>
              {team.players && team.players.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {team.players.map(player => (
                    <div key={player.name} style={{ 
                      backgroundColor: '#111827', 
                      borderRadius: '0.5rem', 
                      padding: '0.75rem',
                      border: '1px solid #374151'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: '#e5e7eb', fontWeight: '600' }}>{player.name}</span>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            padding: '0.1rem 0.4rem', 
                            borderRadius: '0.25rem', 
                            backgroundColor: player.type === 'P' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                            color: player.type === 'P' ? '#34d399' : '#60a5fa',
                            border: `1px solid ${player.type === 'P' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                          }}>
                            {player.type === 'P' ? '帕鲁' : '导师'}
                          </span>
                        </div>
                        <span style={{ color: '#9ca3af', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                          MMR: <span style={{ color: '#d1d5db' }}>{player.mmr || '-'}</span>
                        </span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                        <div style={{ backgroundColor: '#1f2937', padding: '0.25rem', borderRadius: '0.25rem', textAlign: 'center' }}>
                          MVP: <span style={{ color: '#fbbf24' }}>{player.mvps || 0}</span>
                        </div>
                        <div style={{ backgroundColor: '#1f2937', padding: '0.25rem', borderRadius: '0.25rem', textAlign: 'center' }}>
                          KD: <span style={{ color: '#e5e7eb' }}>{player.kd || 0}</span>
                        </div>
                        <div style={{ backgroundColor: '#1f2937', padding: '0.25rem', borderRadius: '0.25rem', textAlign: 'center' }}>
                          胜率: <span style={{ color: '#e5e7eb' }}>{player.winRate || '0%'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#6b7280', textAlign: 'center', padding: '2rem 0', fontStyle: 'italic' }}>暂无队员数据</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
