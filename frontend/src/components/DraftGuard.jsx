import React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DraftGuard = ({ matches, children }) => {
  const { matchId } = useParams();
  const { user } = useAuth();
  
  // 如果 matches 还没加载完，或者为空，显示 Loading
  if (matches.length === 0) {
     return <div style={{ color: '#fff', padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  const match = matches.find(m => String(m.id) === String(matchId));

  if (!match) {
    return <div style={{ color: '#fff', padding: '2rem', textAlign: 'center' }}>Match not found</div>;
  }

  const { status } = match;
  const role = user?.role;

  if (status === "筹备中") {
    if (role === "admin") {
      return children;
    }
    return (
      <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#9ca3af', fontSize: '1.5rem' }}>
        比赛仍在筹备中
      </div>
    );
  }

  // 选位中：所有人可见
  return children;
};

export default DraftGuard;