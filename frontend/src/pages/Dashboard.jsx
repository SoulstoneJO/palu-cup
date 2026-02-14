import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Matches from "../components/Matches";
import Header from "../components/Header";
import MatchRoom from "../components/MatchRoom";
import { getConfig, getMatchesList, saveMatchesList } from "../api";
import useModal from "../hooks/useModal";

/**
 * Dashboard 组件包含了应用的主界面，登录后可见。
 * 现在它自己负责管理 config 数据。
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    matchDate: new Date().toISOString().split("T")[0],
    slotsPerTeam: 5,
  });
  const [matches, setMatches] = useState([]);
  const { showModal } = useModal();

  useEffect(() => {
    const initData = async () => {
      try {
        const [configData, matchesData] = await Promise.all([
          getConfig(),
          getMatchesList()
        ]);
        if (configData) setConfig(configData);
        if (matchesData) {
          setMatches(matchesData);
        }
      } catch (err) {
        console.error("初始化数据失败:", err);
      }
    };
    initData();
  }, []);

  const handleOpenAddModal = () => {
    showModal("addMatch", {
      onSubmit: (newMatch) => {
        setMatches((prev) => [...prev, newMatch]);
      }
    });
  };

  const handleOpenEditModal = (match) => {
    showModal("editMatch", {
      match,
      onDelete: (updatedMatch) => {
        setMatches((prev) => prev.filter((m) => m.id !== updatedMatch.id));
      },
      onSubmit: (updatedMatch) => {
        setMatches((prev) => {
          const newMatches = prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m));
          saveMatchesList(newMatches).catch(console.error);
          return newMatches;
        });
      }
    });
  };

  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Matches matches={matches} onAddMatch={handleOpenAddModal} onSelectMatch={(match) => navigate(`/match/${match.id}`)} onEditMatch={handleOpenEditModal} />} />
          <Route path="/match/:matchId" element={<MatchRoom config={config} />} />
        </Routes>
      </main>
    </div>
  );
}