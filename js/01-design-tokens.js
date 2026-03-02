const { useState, useMemo, useCallback, useRef, useEffect } = React;

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM TOKENS (Publink DS)
   ═══════════════════════════════════════════════════════════════ */
const DS = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  primaryMain: "#1A2569", primaryDark: "#0F174A", primaryLight: "#2E3B8C",
  primaryLighter: "#E8EAFF",
  secondaryMain: "#21B9E5", secondaryDark: "#0E8DB3", secondaryLight: "#4BD0F5",
  secondaryLighter: "#E0F7FD",
  accentUmowyMain: "#A971F6", accentUmowyDark: "#7B4CC7", accentUmowyLight: "#C9A6FF",
  accentUmowyLighter: "#F3ECFF",
  successMain: "#16A34A", successDark: "#15803D", successLight: "#4ADE80", successLighter: "#DCFCE7",
  warningMain: "#F59E0B", warningDark: "#B45309", warningLight: "#FCD34D", warningLighter: "#FEF3C7",
  errorMain: "#DC2626", errorDark: "#B91C1C", errorLight: "#F87171", errorLighter: "#FEE2E2",
  infoMain: "#2563EB", infoDark: "#1E40AF", infoLight: "#60A5FA", infoLighter: "#DBEAFE",
  neutralWhite: "#FFFFFF", neutralLighter: "#F8F9FC", neutralLight: "#E5E7EB",
  neutralMain: "#9CA3AF", neutralDark: "#4B5563", neutralDarker: "#374151",
  textPrimary: "#0F172A", textSecondary: "#64748B", textDisabled: "#94A3B8",
  borderLight: "#E2E8F0", borderMedium: "#CBD5E1",
  disabledMain: "#9CA3AF", disabledLighter: "#F1F5F9",
  shadowSm: "0 1px 2px rgba(0,0,0,0.05)",
  shadowMd: "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)",
  shadowLg: "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)",
  shadowXl: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.06)",
};

const typo = {
  titleLarge: { fontSize: 20, fontWeight: 700, lineHeight: "28px", letterSpacing: "-0.02em" },
  titleMedium: { fontSize: 16, fontWeight: 600, lineHeight: "24px", letterSpacing: "-0.01em" },
  titleSmall: { fontSize: 14, fontWeight: 600, lineHeight: "20px" },
  bodyMedium: { fontSize: 14, fontWeight: 400, lineHeight: "20px" },
  bodySmall: { fontSize: 13, fontWeight: 400, lineHeight: "18px" },
  labelMedium: { fontSize: 13, fontWeight: 500, lineHeight: "18px" },
  labelSmall: { fontSize: 11, fontWeight: 500, lineHeight: "16px" },
};

/* ═══ STYLE HELPERS (reusable layout combos) ═══ */
const S = {
  row: { display: "flex", alignItems: "center" },
  rowBetween: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  col: { display: "flex", flexDirection: "column" },
  card: { background: DS.neutralWhite, borderRadius: 8, border: `1px solid ${DS.borderLight}` },
  cardShadow: { background: DS.neutralWhite, borderRadius: 8, border: `1px solid ${DS.borderLight}`, boxShadow: DS.shadowSm },
  pill: { borderRadius: 9999 },
  truncate: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  overlay: { position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" },
};

/* ═══════════════════════════════════════════════════════════════
   ICONS (SVG paths)
   ═══════════════════════════════════════════════════════════════ */
const ICONS = {
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6",
  receipt: "M4 2v20l4-2 4 2 4-2 4 2V2L16 4l-4-2L8 4Z",
  folder: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  folderPlus: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z M12 11v6 M9 14h6",
  search: "M11 17.25a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5z M16 16l4.5 4.5",
  plus: "M12 5v14 M5 12h14", x: "M18 6L6 18 M6 6l12 12", check: "M20 6L9 17l-5-5",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  alert: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
  chevronDown: "M6 9l6 6 6-6", chevronRight: "M9 18l6-6-6-6", chevronLeft: "M15 18l-6-6 6-6",
  link: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  clock: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  building: "M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-4 M9 9v.01 M9 12v.01 M9 15v.01 M9 18v.01",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  menu: "M3 12h18 M3 6h18 M3 18h18",
  settings: "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z M12 2C6.5 2 2 6.5 2 12h2a8 8 0 0 1 16 0h2c0-5.5-4.5-10-10-10z",
  barChart: "M18 20V10 M12 20V4 M6 20v-6",
  inbox: "M22 12h-6l-2 3H10l-2-3H2 M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
  maximize: "M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3",
  arrowUpDown: "M7 3v18 M3 7l4-4 4 4 M17 21V3 M13 17l4 4 4-4",
  trash: "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
  copy: "M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2z M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1",
  paperclip: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48",
  history: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  dollarSign: "M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  sparkles: "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z",
  command: "M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  trendingUp: "M23 6l-9.5 9.5-5-5L1 18",
  refreshCw: "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  camera: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  gitBranch: "M6 3v12 M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 9a9 9 0 0 1-9 9",
  layers: "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
  list: "M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01",
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
  checkSquare: "M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  coins: "M9 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10z M15 20a5 5 0 1 0 0-10 5 5 0 0 0 0 10z",
  columns: "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18v18",
  move: "M5 9l-3 3 3 3 M9 5l3-3 3 3 M15 19l3 3 3-3 M19 9l3 3-3 3 M2 12h20 M12 2v20",
  help: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3 M12 17h.01",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  orgChart: "M12 2v6 M2 12h4 M18 12h4 M6 12v6 M18 12v6 M6 18h12 M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M6 22a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M18 22a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  chevR: "M9 18l6-6-6-6",
  calendar: "M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M16 2v4 M8 2v4 M3 10h18",
  sort: "M3 6h18 M6 12h12 M9 18h6",
};

const Icon = ({ name, size = 16, color = "currentColor", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}>
    {(ICONS[name] || "").split(" M").map((seg, i) => (
      <path key={i} d={i === 0 ? seg : "M" + seg} />
    ))}
  </svg>
);
