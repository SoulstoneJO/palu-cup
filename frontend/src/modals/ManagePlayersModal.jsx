import React, { useState, useMemo, useRef, useEffect } from 'react';
import Modal from './Modal';

export default function ManagePlayersModal({ onClose, pool, allPlayers, onSave }) {
  const [localPool, setLocalPool] = useState(pool || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  // 过滤出尚未在 pool 中的人员
  const availablePlayers = useMemo(() => {
    const lowerTerm = searchTerm.toLowerCase();
    return allPlayers.filter(p => 
      !localPool.some(existing => existing.name === p.name) && 
      p.name.toLowerCase().includes(lowerTerm)
    );
  }, [allPlayers, localPool, searchTerm]);

  const handleAdd = (player) => {
    // 双重检查，防止重复添加
    if (localPool.some(p => p.name === player.name)) {
      alert("该选手已在参赛列表中！");
      return;
    }
    setLocalPool(prev => [...prev, player]);
    setSearchTerm('');
    setIsFocused(false);
  };

  const handleRemove = (player) => {
    setLocalPool(prev => prev.filter(p => p.name !== player.name));
  };

  const handleFinish = async () => {
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave(localPool);
        onClose();
      } catch (error) {
        // Error handled in parent
      } finally {
        setIsSaving(false);
      }
    } else {
      onClose();
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="参赛人员管理">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* 搜索添加区域 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db', fontSize: '0.875rem' }}>
            添加人员 (从总库搜索)
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }} ref={wrapperRef}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder="输入名字搜索..."
                value={searchTerm}
                onFocus={() => setIsFocused(true)}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '0.375rem',
                  color: 'white',
                  boxSizing: 'border-box'
                }}
              />
              {/* 搜索结果下拉 */}
              {isFocused && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#1f2937',
                  border: '1px solid #4b5563',
                  borderRadius: '0.375rem',
                  marginTop: '0.25rem',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 10,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}>
                  {availablePlayers.length > 0 ? (
                    availablePlayers.map(player => (
                      <div
                        key={player.name}
                        onClick={() => {
                          setSearchTerm(player.name);
                          setIsFocused(false);
                        }}
                        style={{
                          padding: '0.5rem',
                          cursor: 'pointer',
                          borderBottom: '1px solid #374151',
                          color: '#e5e7eb',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <span>{player.name}</span>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af', backgroundColor: '#4b5563', padding: '2px 6px', borderRadius: '4px' }}>
                          {player.type === 'P' ? '帕鲁' : '导师'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '0.5rem', color: '#9ca3af', textAlign: 'center' }}>无匹配人员</div>
                  )}
                </div>
              )}
            </div>
            <button 
              type="button" 
              className="btn-confirm" 
              onClick={() => {
                // 如果输入框有完全匹配的名字，直接添加
                const match = availablePlayers.find(p => p.name.toLowerCase() === searchTerm.toLowerCase());
                if (match) {
                  handleAdd(match);
                }
              }}
              disabled={!searchTerm || !availablePlayers.some(p => p.name.toLowerCase() === searchTerm.toLowerCase())}
              style={{ whiteSpace: 'nowrap' }}
            >
              添加
            </button>
          </div>
        </div>

        {/* 已选人员标签区域 */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#d1d5db', fontSize: '0.875rem' }}>
            当前参赛人员 ({localPool.length})
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
            {localPool.map(player => (
              <span 
                key={player.name} 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#374151',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  color: '#e5e7eb',
                  transition: 'background-color 0.2s, color 0.2s',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4b5563';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#374151';
                  e.currentTarget.style.color = '#e5e7eb';
                }}
              >
                {player.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 防止冒泡
                    handleRemove(player);
                  }}
                  style={{
                    marginLeft: '0.5rem',
                    background: 'transparent',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '1.1rem',
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                  title="移除"
                >
                  &times;
                </button>
              </span>
            ))}
            {localPool.length === 0 && <span style={{ color: '#6b7280', fontSize: '0.875rem', padding: '0.5rem' }}>暂无参赛人员</span>}
          </div>
        </div>

      </div>
      <div className="modal-footer">
        <button type="button" className="btn-confirm" onClick={handleFinish} disabled={isSaving}>
          {isSaving ? '保存中...' : '完成'}
        </button>
      </div>
    </Modal>
  );
}