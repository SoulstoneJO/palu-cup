import React, { useState } from 'react';
import Modal from './Modal';
import { addMatch } from '../api';

export default function AddMatchModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: `PALU CUP SEASON X`,
    date: new Date().toISOString().split("T")[0],
    status: "筹备中",
    description: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newMatch = { ...form };
    try {
      const res = await addMatch(newMatch);
      // 后端返回了生成的 ID
      onSubmit({ ...newMatch, id: res.id });
      onClose();
    } catch (error) {
      console.error("Failed to add match:", error);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="新增比赛">
      <form onSubmit={handleSubmit}>
        <div className="modal-form-group">
          <label>比赛标题</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div className="modal-form-group">
          <label>比赛日期</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </div>
        <div className="modal-form-group">
          <label>比赛简介</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows="3"
          />
        </div>
        <div className="modal-form-group">
          <label>状态</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="筹备中">筹备中</option>
            <option value="选位中">选位中</option>
            <option value="进行中">进行中</option>
            <option value="已结束">已结束</option>
          </select>
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