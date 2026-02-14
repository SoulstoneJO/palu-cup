import React, { useState, useEffect } from 'react';
import Modal from './Modal';

export default function DraftOrderModal({ onClose, teams, initialOrderSlots, onApply }) {
  // 计算总人数（所有队伍 slots 之和）
  const totalSlots = teams.reduce((sum, team) => sum + (team.slots || 5), 0);
  
  // 初始化 orderSlots，长度为 totalSlots
  const [orderSlots, setOrderSlots] = useState(() => {
    if (initialOrderSlots && initialOrderSlots.length === totalSlots) {
      return initialOrderSlots;
    }
    return Array(totalSlots).fill(null);
  });

  const handleSelectTeamForOrder = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    const maxSlots = team.slots || 5;
    const currentCount = orderSlots.filter(id => id === teamId).length;

    if (currentCount >= maxSlots) return;

    setOrderSlots(prev => {
      const next = [...prev];
      const emptyIndex = next.findIndex(id => id === null);
      if (emptyIndex === -1) return prev;
      next[emptyIndex] = teamId;
      return next;
    });
  };

  const handleClearOrder = () => {
    setOrderSlots(Array(totalSlots).fill(null));
  };

  const handleApply = () => {
    onApply(orderSlots);
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="选人顺序设定">
      <div className="draft-order-panel" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <div className="draft-order-slots">
          {orderSlots.map((teamId, index) => {
            const team = teams.find((t) => t.id === teamId);
            return (
              <div
                key={index}
                className={
                  "draft-order-slot" +
                  (team ? " draft-order-slot--filled" : "")
                }
              >
                <span className="draft-order-slot-label">
                  第{index + 1}顺位
                </span>
                <span className="draft-order-slot-team">
                  {team ? team.name : "待分配"}
                </span>
              </div>
            );
          })}
        </div>

        <div className="draft-order-teams">
          {teams.map((team) => {
            const count = orderSlots.filter((id) => id === team.id).length;
            const maxSlots = team.slots || 5;
            const isFull = count >= maxSlots;
            return (
              <button
                key={team.id}
                type="button"
                className="draft-order-team-btn"
                style={{
                  "--team-color": team.color,
                  opacity: isFull ? 0.5 : 1,
                  cursor: isFull ? "not-allowed" : "pointer",
                }}
                onClick={() => handleSelectTeamForOrder(team.id)}
                disabled={isFull}
              >
                {team.name} ({count}/{maxSlots})
              </button>
            );
          })}
        </div>
      </div>

      <div className="modal-footer" style={{ justifyContent: 'space-between', marginTop: '1rem' }}>
        <button
          type="button"
          className="draft-order-clear"
          onClick={handleClearOrder}
          style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '0.375rem', cursor: 'pointer' }}
        >
          清除
        </button>
        <button
          type="button"
          className="btn-confirm"
          onClick={handleApply}
          disabled={orderSlots.includes(null)}
          style={
            orderSlots.includes(null)
              ? { opacity: 0.5, cursor: "not-allowed", backgroundColor: "#9ca3af" }
              : {}
          }
        >
          确认应用
        </button>
      </div>
    </Modal>
  );
}