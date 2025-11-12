import React, { useState } from "react";

export default function Planner({ plan }){
  const [currentWeek, setCurrentWeek] = useState(0);

  if(!plan || plan.length === 0) {
    return (
      <div style={styles.emptyState}>
        <p>No revision plan yet. Upload a PDF to generate study materials.</p>
      </div>
    );
  }

  // Parse plan items and organize by week
  const today = new Date();
  const plannedDays = plan.map((p, i) => {
    const date = new Date(today);
    // Assuming revise_on is a day offset or date string
    const dayOffset = i; // Simplified: distribute over time
    date.setDate(date.getDate() + dayOffset);
    return {
      ...p,
      date,
      dayOfWeek: date.getDay(),
      dateStr: date.toLocaleDateString(),
    };
  });

  // Get week dates
  const weekStartDate = new Date(today);
  weekStartDate.setDate(today.getDate() + currentWeek * 7 - today.getDay());
  
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStartDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Get items for this week
  const weekItems = weekDates.map(date => {
    return plannedDays.filter(item => 
      item.date.toDateString() === date.toDateString()
    );
  });

  // Calculate completion stats
  const completedCount = plan.filter(p => p.status === "completed" || p.status === "done").length;
  const completionPercent = Math.round((completedCount / plan.length) * 100);

  const handlePrevWeek = () => setCurrentWeek(currentWeek - 1);
  const handleNextWeek = () => setCurrentWeek(currentWeek + 1);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Revision Plan</h2>

      {/* Progress Summary */}
      <div style={styles.summaryBox}>
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Topics Planned</span>
            <span style={styles.statValue}>{plan.length}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Completed</span>
            <span style={styles.statValue}>{completedCount}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Progress</span>
            <span style={styles.statValue}>{completionPercent}%</span>
          </div>
        </div>
        <div style={styles.progressBar}>
          <div style={{...styles.progressFill, width: `${completionPercent}%`}}></div>
        </div>
      </div>

      {/* Week Calendar */}
      <div style={styles.calendarSection}>
        <div style={styles.weekHeader}>
          <button onClick={handlePrevWeek} style={styles.weekNavBtn}>← Previous</button>
          <div style={styles.weekLabel}>
            {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
          </div>
          <button onClick={handleNextWeek} style={styles.weekNavBtn}>Next →</button>
        </div>

        <div style={styles.calendarGrid}>
          {dayLabels.map((label, idx) => (
            <div key={`label-${idx}`} style={styles.dayLabelCell}>
              {label}
            </div>
          ))}
          
          {weekDates.map((date, idx) => {
            const items = weekItems[idx];
            const isToday = date.toDateString() === today.toDateString();
            
            return (
              <div 
                key={idx}
                style={{
                  ...styles.dayCell,
                  ...(isToday ? styles.dayCellToday : {}),
                }}
              >
                <div style={styles.dayNumber}>{date.getDate()}</div>
                <div style={styles.dayItems}>
                  {items.length > 0 ? (
                    items.map((item, i) => (
                      <div key={i} style={{...styles.dayItem, ...getStatusStyle(item.status)}}>
                        <span style={styles.dayItemText}>{item.topic.substring(0, 12)}</span>
                        {getStatusIcon(item.status)}
                      </div>
                    ))
                  ) : (
                    <div style={styles.dayItemEmpty}>-</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div style={styles.upcomingSection}>
        <h3 style={styles.sectionTitle}>Upcoming Sessions</h3>
        <div style={styles.sessionsList}>
          {plannedDays.slice(0, 5).map((item, i) => (
            <div key={i} style={styles.sessionItem}>
              <div style={styles.sessionDate}>
                {item.date.toLocaleDateString()}
              </div>
              <div style={styles.sessionTopic}>{item.topic}</div>
              <div style={{...styles.sessionBadge, ...getStatusStyle(item.status)}}>
                {item.status || "pending"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getStatusStyle(status) {
  if(status === "completed" || status === "done") {
    return { backgroundColor: "#d4edda", color: "#155724" };
  } else if(status === "in-progress") {
    return { backgroundColor: "#cfe2ff", color: "#084298" };
  }
  return { backgroundColor: "#f0f0f0", color: "#666" };
}

function getStatusIcon(status) {
  if(status === "completed" || status === "done") return <span style={{ fontSize: "12px", marginLeft: "4px" }}>✓</span>;
  if(status === "in-progress") return <span style={{ fontSize: "12px", marginLeft: "4px" }}>⏳</span>;
  return null;
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "20px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: "24px",
    margin: "0 0 24px 0",
  },
  summaryBox: {
    backgroundColor: "#f9f9f9",
    padding: "24px",
    borderRadius: "8px",
    marginBottom: "32px",
    border: "1px solid #e0e0e0",
  },
  statsRow: {
    display: "flex",
    gap: "24px",
    marginBottom: "16px",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0066ff",
  },
  progressBar: {
    height: "8px",
    backgroundColor: "#e0e0e0",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0066ff",
    transition: "width 0.3s ease",
  },
  calendarSection: {
    marginBottom: "32px",
  },
  weekHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  weekNavBtn: {
    padding: "8px 16px",
    backgroundColor: "#f0f0f0",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    color: "#333",
    transition: "all 0.2s ease",
  },
  weekLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#666",
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "8px",
  },
  dayLabelCell: {
    padding: "12px",
    textAlign: "center",
    fontWeight: "600",
    fontSize: "12px",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  dayCell: {
    minHeight: "120px",
    padding: "12px",
    backgroundColor: "white",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    display: "flex",
    flexDirection: "column",
  },
  dayCellToday: {
    backgroundColor: "#e8f0ff",
    border: "2px solid #0066ff",
  },
  dayNumber: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "8px",
  },
  dayItems: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  dayItem: {
    padding: "4px 8px",
    borderRadius: "3px",
    fontSize: "11px",
    fontWeight: "500",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayItemText: {
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  dayItemEmpty: {
    color: "#ddd",
    textAlign: "center",
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  upcomingSection: {
    backgroundColor: "#f9f9f9",
    padding: "24px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 0 16px 0",
  },
  sessionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  sessionItem: {
    padding: "12px",
    backgroundColor: "white",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  sessionDate: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#666",
    minWidth: "100px",
  },
  sessionTopic: {
    flex: 1,
    fontSize: "14px",
    fontWeight: "500",
    color: "#1a1a1a",
  },
  sessionBadge: {
    padding: "4px 12px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#999",
  },
};
