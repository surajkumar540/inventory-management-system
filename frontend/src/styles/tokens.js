export const colors = {
  primary: "#6366f1",
  primaryBg: "rgba(99,102,241,0.12)",
  success: "#22c55e",
  successBg: "rgba(34,197,94,0.12)",
  warning: "#f59e0b",
  warningBg: "rgba(245,158,11,0.12)",
  danger: "#ef4444",
  dangerBg: "rgba(239,68,68,0.12)",
};

export const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#0f172a",
      titleColor: "#94a3b8",
      bodyColor: "#f1f5f9",
      padding: 10,
      borderColor: "rgba(99,102,241,0.3)",
      borderWidth: 1,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: "#94a3b8", font: { size: 11 } },
    },
    y: {
      grid: { color: "rgba(148,163,184,0.08)", drawBorder: false },
      border: { display: false },
      ticks: { color: "#94a3b8", font: { size: 11 } },
    },
  },
};