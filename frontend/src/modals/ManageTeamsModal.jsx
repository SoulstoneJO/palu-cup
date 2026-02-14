import React, { useState } from 'react';
import Modal from './Modal';
import AddTeamModal from './AddTeamModal';
import EditTeamModal from './EditTeamModal';

export default function ManageTeamsModal({ onClose, teams = [], onSave }) {
  const [localTeams, setLocalTeams] = useState(teams || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddSubmit = (newTeamData) => {
    // TODO: name可能有重复问题
    const newTeam = {
      ...newTeamData,
      id: newTeamData.name,
      players: []
    };
    setLocalTeams(prev => [...prev, newTeam]);
    setShowAddModal(false);
  };

  const handleEditSubmit = (updatedTeam) => {
    setLocalTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));
    setEditingTeam(null);
  };

  const handleDelete = (teamToDelete) => {
    setLocalTeams(prev => prev.filter(t => t.id !== teamToDelete.id));
    setEditingTeam(null);
  };

  const handleFinish = async () => {
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave(localTeams);
        onClose();
      } catch (error) {
        // 错误已在父组件处理（alert），这里只需停止 loading
      } finally {
        setIsSaving(false);
      }
    } else {
      onClose();
    }
  };

  return (
    <>
      <Modal isOpen={true} onClose={onClose} title="参赛队伍管理">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {localTeams.map(team => (
            <div key={team.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#374151', borderRadius: '0.375rem' }}>
              <span style={{ color: team.color || '#fff', fontWeight: '500' }}>{team.name}</span>
              <button
                className="btn-secondary"
                onClick={() => setEditingTeam(team)}
              >
                编辑
              </button>
            </div>
          ))}
          {localTeams.length === 0 && <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem 0' }}>暂无队伍，请添加。</p>}
        </div>
        <div className="modal-footer" style={{ justifyContent: 'space-between', marginTop: '1.5rem' }}>
          <button type="button" className="btn-confirm" onClick={() => setShowAddModal(true)}>
            + 添加新队伍
          </button>
          <button type="button" className="btn-confirm" onClick={handleFinish} disabled={isSaving}>
            {isSaving ? '保存中...' : '完成'}
          </button>
        </div>
      </Modal>

      {showAddModal && (
        <AddTeamModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSubmit}
        />
      )}

      {editingTeam && (
        <EditTeamModal
          team={editingTeam}
          onClose={() => setEditingTeam(null)}
          onSubmit={handleEditSubmit}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}