import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DraftOrderSummary from "./DraftOrderSummary";
import { useAuth } from '../context/AuthContext';
import { deleteMatch, updateMatchTeams, saveMatchPoolData, saveMatchDraftOrder, saveMatchStateData, generateMatchReport } from "../api";
import useModal from "../hooks/useModal";
export default function Draftboard({ config, matchData }) {
  if (!config) return null;
  const { matchId: routeMatchId } = useParams();
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [slotsPerTeam, setSlotsPerTeam] = useState(0);
  const [pool, setPool] = useState([]);
  const [draftOrder, setDraftOrder] = useState([]);
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [matchId, setMatchId] = useState(null);
  const [orderSlots, setOrderSlots] = useState([]);
  const { user } = useAuth();
  const { showModal } = useModal();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (matchData) {
      setTeams(matchData.teams || []);
      setSlotsPerTeam(matchData.slotsPerTeam || 0);
      setPool(matchData.pool ?? (config?.playerPool || []));
      setDraftOrder(matchData.draftOrder || []);
      setMatchId(matchData.id ?? routeMatchId);
      setCurrentOrderIndex(matchData.currentOrderIndex || 0);
      setActiveTeamId(matchData.activeTeamId ?? null);
      setOrderSlots(matchData.orderSlots ?? matchData.draftOrder ?? []);
    }
  }, [matchData, config, routeMatchId]);


  const totalPlayers = teams.reduce((sum, t) => sum + t.players.length, 0);
  const lastPickIndex = draftOrder?.length > 0 ? (currentOrderIndex - 1 + draftOrder.length) % draftOrder.length : -1;
  const lastTeamId = (totalPlayers > 0 && lastPickIndex !== -1) ? draftOrder[lastPickIndex] : null;

  const removePlayer = (teamId, player) => {
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? { ...t, players: t.players.filter((p) => p.name !== player.name) }
          : t
      )
    );
    setPool((prev) => [...prev, player]);
    let newCurrentOrderIndex = currentOrderIndex;
    let newActiveTeamId = activeTeamId;

    if (draftOrder.length > 0) {
      setCurrentOrderIndex((prevIndex) => {
        const newIndex = (prevIndex - 1 + draftOrder.length) % draftOrder.length;
        const nextTeamId = draftOrder[newIndex];
        setActiveTeamId(nextTeamId);
        return newIndex;
      });
      newCurrentOrderIndex = (currentOrderIndex - 1 + draftOrder.length) % draftOrder.length;
      const nextTeamId = draftOrder[newCurrentOrderIndex];
      newActiveTeamId = nextTeamId;
      
      setCurrentOrderIndex(newCurrentOrderIndex);
      setActiveTeamId(newActiveTeamId);
    }

    // Save teams
    updateMatchTeams(matchId || routeMatchId, newTeams).catch(console.error);

    // Save pool
    saveMatchPoolData({
      id: matchId || routeMatchId,
      pool: newPool
    }).catch(console.error);

    // Save state
    saveMatchStateData({
      id: matchId || routeMatchId,
      currentOrderIndex: newCurrentOrderIndex,
      activeTeamId: newActiveTeamId
    }).catch(console.error);
  };

  const handleAssignToActive = (player) => {
    const orderLength = draftOrder.length;

    // 如果没有设置选人顺序，则不执行任何操作
    if (orderLength === 0) {
      return;
    }

    const index = currentOrderIndex % orderLength;
    const teamId = draftOrder[index];
    
    const newTeams = teams.map((t) =>
      t.id === teamId ? { ...t, players: [...t.players, player] } : t
    );
    const newPool = pool.filter((p) => p.name !== player.name);

    setTeams(newTeams);
    setPool(newPool);

    const nextIndex = (index + 1) % orderLength;
    setCurrentOrderIndex(nextIndex);
    const nextTeamId = draftOrder[nextIndex % orderLength];
    setActiveTeamId(nextTeamId);

    // Save teams
    updateMatchTeams(matchId || routeMatchId, newTeams).catch(console.error);

    // Save pool
    saveMatchPoolData({
      id: matchId || routeMatchId,
      pool: newPool
    }).catch(console.error);

    // Save state
    saveMatchStateData({
      id: matchId || routeMatchId,
      currentOrderIndex: nextIndex,
      activeTeamId: nextTeamId
    }).catch(console.error);
  };

  const handleOpenOrderModal = () => {
    showModal('draftOrder', {
      teams,
      initialOrderSlots: orderSlots,
      onApply: (newOrderSlots) => {
        setOrderSlots(newOrderSlots);

        // 应用新的顺序
        // 这里直接使用 newOrderSlots 作为最终顺序，因为它已经包含了所有 slots
        // 如果 newOrderSlots 中有 null (虽然 Modal 中做了校验)，则过滤掉
        const finalOrder = newOrderSlots.filter(id => id !== null);

        setDraftOrder(finalOrder);
        setCurrentOrderIndex(0);
        setActiveTeamId(finalOrder[0] || null);

        saveMatchDraftOrder({
          id: matchId || routeMatchId,
          draftOrder: finalOrder
        }).catch(err => {
          console.error('Failed to save draft order:', err);
        });

        saveMatchStateData({
          id: matchId || routeMatchId,
          currentOrderIndex: 0,
          activeTeamId: finalOrder[0] || null
        }).catch(err => {
          console.error('Failed to save match state:', err);
        });
      }
    });
  };

  const handleOpenTeamsModal = () => {
    showModal('manageTeams', {
      teams: teams,
      onSave: async (newTeams) => {
        // 检测是否有队伍被删除
        const teamDeleted = teams.some(t => !newTeams.find(nt => nt.id === t.id));
        
        setTeams(newTeams);
        try {
          await updateMatchTeams(matchId || routeMatchId, newTeams);

          if (teamDeleted) {
            setDraftOrder([]);
            setCurrentOrderIndex(0);
            setActiveTeamId(null);
            setOrderSlots([]);

            await Promise.all([
              saveMatchDraftOrder({
                id: matchId || routeMatchId,
                draftOrder: []
              }),
              saveMatchStateData({
                id: matchId || routeMatchId,
                currentOrderIndex: 0,
                activeTeamId: null
              })
            ]);
          }
        } catch (error) {
          console.error('保存队伍失败:', error);
          alert('保存队伍失败，请重试。');
          throw error; // 抛出错误以便 Modal 保持打开状态
        }
      }
    });
  };

  const handleSave = async () => {
    if (!window.confirm("确定要保存当前阵容并生成战报吗？")) {
      return;
    }

    try {
      await generateMatchReport({ id: matchId, teams });
      alert('阵容已保存并生成战报！');
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请查看控制台。');
    }
  };

  const handleOpenPlayersModal = () => {
    showModal('managePlayers', {
      pool: pool,
      allPlayers: config.playerPool || [], // 从 config 获取总库
      onSave: async (newPool) => {
        setPool(newPool);
        try {
          await saveMatchPoolData({
            id: matchId || routeMatchId,
            pool: newPool
          });
        } catch (err) {
          console.error('Failed to save pool:', err);
          alert('保存人员失败，请重试。');
        }
      }
    });
  };
  console.log('Match Data:', { matchData });

  return (
    <div className="draft-shell">
      <header className="draft-header">
        <div className="draft-header-left">
          <span className="draft-title">Draft Board</span>
          {matchId && (
            <span style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
              {matchId}
            </span>
          )}
          <span className="draft-date">
            比赛日期 · {matchData.date}
          </span>
        </div>

        <div className="draft-header-actions">
          {isAdmin && (
            <>
              <button className="btn-primary" onClick={handleOpenTeamsModal}>参赛队伍</button>
              <button className="btn-primary" onClick={handleOpenPlayersModal}>参赛人员</button>
              <button
                className="btn-primary"
                type="button"
                onClick={handleOpenOrderModal}
              >
                选人顺序设定
              </button>
              <button className="btn-green" onClick={handleSave}>保存阵容</button>
            </>
          )}
        </div>
      </header>

      {/* 选人顺序组件 */}
      <DraftOrderSummary
        draftOrder={draftOrder}
        teams={teams}
        currentOrderIndex={currentOrderIndex}
      />

      <section className="draft-grid">
        {teams.map((team) => (
          <article
            key={team.id}
            className={
              "draft-card" +
              (team.id === activeTeamId ? " draft-card--active" : "")
            }
          >
            <div className="draft-card-header">
              <div
                className="draft-card-title"
                style={{ color: team.color || "#e5e7eb" }}
              >
                {team.name}
              </div>
              <span className="draft-card-badge">
                SLOTS · {team.players.length}/{team.slots || slotsPerTeam || 5}
              </span>
            </div>

            <div className="draft-card-body">
              {team.players.map((player, index) => (
                <div key={player.name} className="draft-player-row">
                  <span>{player.name}</span>
                  {isAdmin && team.id === lastTeamId && index === team.players.length - 1 && (
                    <button
                      className="draft-remove"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePlayer(team.id, player);
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              {team.players.length === 0 && isAdmin && (
                <div className="draft-empty">
                  点击下方玩家，将其分配到本队
                </div>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="draft-pool">
        <div className="draft-pool-title">待选玩家池</div>
        <div className="draft-pool-grid">
          {
            pool.map((player) => (
              <button
                key={player.name}
                type="button"
                className="draft-pool-card"
                disabled={!isAdmin || draftOrder.length === 0}
                style={
                  !isAdmin || draftOrder.length === 0
                    ? { opacity: 0.6, cursor: "not-allowed" }
                    : {}
                }
                onClick={() => handleAssignToActive(player)}
              >
                <div className="pool-avatar">
                  <div className="pool-avatar-main">{player.name?.slice(0, 3)}</div>
                  <div className="pool-avatar-sub">{player.region}</div>
                </div>

                <div className="pool-main">
                  <div className="pool-name">
                    <span className="pool-name-text">
                      {player.name || "未命名玩家"}
                    </span>
                    <span
                      className={
                        "pool-type-badge " +
                        (player.type === "P"
                          ? "pool-type-palu"
                          : player.type === "C"
                            ? "pool-type-coach"
                            : "")
                      }
                    >
                      {player.type === "P"
                        ? "帕鲁"
                        : player.type === "C"
                          ? "导师"
                          : ""}
                    </span>
                  </div>
                  <div className="pool-tags">
                    {["优", "中", "劣", "游", "辅"].map((tag, index) => {
                      const isActive =
                        typeof player === "object" &&
                        Array.isArray(player.subs) &&
                        player.subs.includes(String(index + 1));

                      return (
                        <span
                          key={tag}
                          className={isActive ? "pool-tag-active" : "pool-tag-disabled"}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>

                  <div className="pool-stats">
                    <span>
                      最佳 <span className="pool-stat-highlight">{player.mvps}</span>
                    </span>
                    <span>
                      KD <span className="pool-stat-highlight">{player.kd}</span>
                    </span>
                    <span>
                      胜场 <span className="pool-stat-highlight">{player.wins}</span>
                    </span>
                    <span>
                      胜率 <span className="pool-stat-highlight">{player.winRate}</span>
                    </span>
                  </div>
                </div>
              </button>
            ))}

          {pool.length === 0 && (
            <span className="draft-empty">所有玩家都已被分配。</span>
          )}
        </div>
      </section>
    </div>
  );
}
