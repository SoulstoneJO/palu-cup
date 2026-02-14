import React, { useState } from 'react';
import Modal from './Modal';

export default function AddTeamModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    color: '#ffffff',
    slots: 5,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('队伍名称不能为空');
      return;
    }
    onSubmit(form);
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="新增队伍">
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
        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>
            取消
          </button>
          <button type="submit" className="btn-confirm">
            确认新增
          </button>
        </div>
      </form>
    </Modal>
  );
}