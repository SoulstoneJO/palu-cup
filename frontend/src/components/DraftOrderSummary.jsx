import React from "react";

export default function DraftOrderSummary({
  draftOrder = [],
  teams = [],
  currentOrderIndex = 0,
}) {
  const totalSteps = draftOrder.length;
  const currentStep = totalSteps
    ? (currentOrderIndex % totalSteps) + 1
    : 0;

  return (
    <div className="draft-status-bar">
      <div className="draft-order-summary">
        <div className="draft-order-summary-header">
          <span className="draft-order-summary-title">选人顺序</span>
          <span className="draft-order-summary-progress">
            {totalSteps ? `${currentStep}/${totalSteps}` : "未设置"}
          </span>
        </div>

        {draftOrder.length === 0 ? (
          <div className="draft-order-placeholder">
            未确定选人顺序，请先点击右侧「选人顺序设定」按钮进行配置。
          </div>
        ) : (
          <div className="draft-order-grid">
            {draftOrder.map((teamId, index) => {
              const team = teams.find((t) => t.id === teamId);
              const isActive = index === currentOrderIndex;
              return (
                <div
                  key={`${teamId}-${index}`}
                  className={
                    "draft-order-cell" +
                    (isActive ? " draft-order-cell--active" : "")
                  }
                >
                  <span className="draft-order-step">
                    第{index + 1}顺位
                  </span>
                  <span
                    className="draft-order-team"
                    style={{ color: team?.color || "#e5e7eb" }}
                  >
                    {team ? team.name : "待分配"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
