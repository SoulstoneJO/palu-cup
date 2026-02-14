import React, { useState, useEffect } from 'react';
import Modal from './Modal';

export default function EditTeamModal({ onClose, onSubmit, onDelete, team }) {
  const [form, setForm] = useState({ name: '', color: '#ffffff', slots: 5 });

  useEffect(() => {
    if (team) {
      setForm({ name: team.name, color: team.color, slots: team.slots || 5 });
    }
  }, [team]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('队伍名称不能为空');
      return;
    }
    onSubmit({ ...team, ...form });
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="编辑队伍">
      <form onSubmit={handleSubmit}>
        <div className="modal-form-group">
          <label>队伍名称</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="modal-form-group">
          <label>队伍颜色</label>
          <input
            type="color"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            style={{ padding: '0.2rem', height: '2.5rem', cursor: 'pointer' }}
          />
        </div>
        <div className="modal-form-group">
          <label>队伍人数</label>
          <input
            type="number"
            min="1"
            value={form.slots}
            onChange={(e) => setForm({ ...form, slots: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn-danger"
            onClick={() => {
              if (window.confirm(`确定要删除队伍 "${team.name}" 吗？`)) {
                onDelete(team);
                onClose();
              }
            }}
          >
            删除队伍
          </button>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" className="btn-cancel" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn-confirm">
              保存修改
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}