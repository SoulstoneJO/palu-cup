import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { updateMatch, deleteMatch } from '../api';

export default function EditMatchModal({ onClose, onSubmit, onDelete, match }) {
  const [form, setForm] = useState({
    title: "",
    date: "",
    status: "筹备中",
    description: ""
  });

  useEffect(() => {
    if (match) {
      setForm({
        title: match.title || "",
        date: match.date || "",
        status: match.status || "筹备中",
        description: match.description || ""
      });
    }
  }, [match]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedMatch = { ...match, ...form };
    try {
      await updateMatch(updatedMatch);
      onSubmit(updatedMatch);
      onClose();
    } catch (error) {
      console.error("Failed to update match:", error);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="编辑比赛">
      <form onSubmit={handleSubmit}>
        <div className="modal-form-group">
          <label>比赛 ID</label>
          <input
            type="text"
            value={match.id || ""}
            disabled
            style={{ opacity: 0.7, cursor: 'not-allowed' }}
          />
        </div>
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
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          {onDelete && (
            <button
              type="button"
              className="btn-danger"
              onClick={async () => {
                if (window.confirm('确定要删除这场比赛吗？此操作无法撤销。')) {
                  try {
                    await deleteMatch(match.id);
                    onDelete(match);
                    onClose();
                  } catch (error) {
                    console.error("Failed to delete match:", error);
                  }
                }
              }}
            >
              删除比赛
            </button>
          )}
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