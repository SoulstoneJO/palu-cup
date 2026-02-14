import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Matches({ matches, onAddMatch, onEditMatch, onSelectMatch }) {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [hoveredMatchId, setHoveredMatchId] = useState(null);

    return (
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
            {/* Toolbar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#fff", margin: 0 }}>赛事列表</h2>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                        onClick={onAddMatch}
                        style={{
                            display: "flex", alignItems: "center", gap: "0.5rem",
                            padding: "0.5rem 1rem", backgroundColor: "#10b981", color: "white",
                            border: "none", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "600",
                            boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.3)",
                            transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                    >
                        <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>+</span> 新增比赛
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                {matches.map((match) => (
                    <div
                        key={match.id}
                        style={{
                            backgroundColor: "#1f2937", borderRadius: "1rem", padding: "1.5rem",
                            border: "1px solid #374151", display: "flex", flexDirection: "column", gap: "1rem",
                            transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
                            cursor: "default",
                            position: "relative",
                            overflow: "hidden"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-4px)";
                            e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.3)";
                            e.currentTarget.style.borderColor = "#6366f1";
                            setHoveredMatchId(match.id);
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.borderColor = "#374151";
                            setHoveredMatchId(null);
                        }}
                    >
                        {isAdmin && hoveredMatchId === match.id && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onEditMatch) onEditMatch(match);
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    padding: '0.25rem 0.75rem',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    zIndex: 10
                                }}
                            >
                                编辑
                            </button>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{
                                padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: "bold",
                                backgroundColor: match.status === "进行中" ? "rgba(16, 185, 129, 0.2)" : "rgba(107, 114, 128, 0.2)",
                                color: match.status === "进行中" ? "#34d399" : "#9ca3af"
                            }}>
                                {match.status}
                            </span>
                            <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>{match.date}</span>
                        </div>

                        <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#f3f4f6", margin: 0 }}>
                            {match.title}
                        </h3>

                        <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: 0, flexGrow: 1 }}>
                            {match.description || "暂无简介"}
                        </p>

                        <button
                            onClick={() => onSelectMatch(match)}
                            style={{
                                marginTop: "0.5rem", width: "100%", padding: "0.75rem",
                                backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "0.5rem",
                                fontWeight: "600", cursor: "pointer", transition: "background-color 0.2s"
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = "#4338ca"}
                            onMouseLeave={(e) => e.target.style.backgroundColor = "#4f46e5"}
                        >
                            进入详情
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
