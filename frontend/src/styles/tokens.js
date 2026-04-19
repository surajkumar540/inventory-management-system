export const colors = {
  primary:    "#6366f1",
  primaryBg:  "rgba(99,102,241,0.08)",
  success:    "#22c55e",
  warning:    "#f59e0b",
  danger:     "#ef4444",
};

export const chart = {
  gridColor: "rgba(0,0,0,0.05)",
  tickColor: "#94a3b8",
  font:      { size: 11, family: "Inter" },
};

export const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      grid: { color: "rgba(0,0,0,0.05)" },
      ticks: { color: "#94a3b8", font: { size: 11, family: "Inter" } },
    },
    y: {
      grid: { color: "rgba(0,0,0,0.05)" },
      ticks: { color: "#94a3b8", font: { size: 11, family: "Inter" } },
    },
  },
};