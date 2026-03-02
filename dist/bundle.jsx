
// ──── 01-design-tokens.js ────
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

// ──── 02-data.js ────
/* ═══════════════════════════════════════════════════════════════
   DATA DEFINITIONS
   ═══════════════════════════════════════════════════════════════ */
const DOC_TYPES = {
  umowa: { label: "Umowa", color: DS.primaryLight, bg: DS.primaryLighter, icon: "file" },
  faktura: { label: "Faktura", color: "#0A7BE5", bg: "#E0EEFF", icon: "receipt" },
  zlecenie: { label: "Zlecenie", color: "#E5850A", bg: "#FFF4E0", icon: "zap" },
  aneks: { label: "Aneks", color: "#7C3AED", bg: "#F0E7FF", icon: "gitBranch" },
  inne: { label: "Inne", color: DS.neutralDark, bg: DS.neutralLighter, icon: "file" },
  zalacznik: { label: "Załącznik", color: "#0EA5E9", bg: "#E0F2FE", icon: "paperclip" },
};

const DOC_STATUSES = {
  // umowa, zlecenie, aneks
  w_przygotowaniu: { label: "W przygotowaniu", color: DS.textDisabled, bg: DS.disabledLighter },
  w_realizacji: { label: "W realizacji", color: DS.infoDark, bg: DS.infoLighter },
  zakonczone: { label: "Zakończone", color: DS.successDark, bg: DS.successLighter },
  // faktura
  do_weryfikacji: { label: "Do weryfikacji", color: DS.warningDark, bg: DS.warningLighter },
  zweryfikowana: { label: "Zweryfikowana", color: DS.infoDark, bg: DS.infoLighter },
  oplacona: { label: "Opłacona", color: DS.successDark, bg: DS.successLighter },
};

// Statusy dostępne per typ dokumentu
const DOC_TYPE_STATUSES = {
  umowa: ["w_przygotowaniu", "w_realizacji", "zakonczone"],
  zlecenie: ["w_przygotowaniu", "w_realizacji", "zakonczone"],
  aneks: ["w_przygotowaniu", "w_realizacji", "zakonczone"],
  faktura: ["do_weryfikacji", "zweryfikowana", "oplacona"],
  zalacznik: [],
  inne: [],
};

// Alert types — extracted to dedicated column
const ALERT_TYPES = {
  ZA: { label: "Do zaangażowania — dokument wymaga zaangażowania środków budżetowych", icon: "coins", color: "#4A7EBF", bg: "#EBF2FA" },
  KT: { label: "Kończący się termin — umowa 30 dni, faktura 7 dni przed terminem", icon: "clock", color: "#B8960C", bg: "#FDF6E3" },
  WU: { label: "Wymaga uzupełnienia — brakuje wymaganych danych dokumentu", icon: "alert", color: "#8C8C8C", bg: "#F3F3F3" },
};

// Auto-detect alerts from doc data
const computeAlerts = (doc) => {
  const alerts = [];
  const today = new Date();
  // WU: brakuje wymaganych danych (numer, contractor, classification, grossValue)
  if (!doc.number || !doc.contractor || !doc.classification || !doc.grossValue) alerts.push("WU");
  // KT: kończący się termin — 30 dni dla umowy, 7 dni dla faktury
  if (doc.dateEnd) {
    const end = new Date(doc.dateEnd);
    const daysLeft = Math.ceil((end - today) / 86400000);
    const threshold = (doc.type === "faktura") ? 7 : 30;
    if (daysLeft >= 0 && daysLeft <= threshold) alerts.push("KT");
  }
  // ZA: do zaangażowania — aktywny dokument z kwotą ale bez zaangażowania (zlecenie/umowa)
  if ((doc.type === "zlecenie" || doc.type === "umowa") && doc.grossValue > 0 && doc.status === "w_realizacji" && !doc.engaged) alerts.push("ZA");
  return [...new Set([...(doc.alerts || []).filter(a => a !== "KS"), ...alerts])];
};

const DEPARTMENTS = ["Wydział Finansowy", "Wydział Infrastruktury", "Wydział Oświaty", "Wydział Środowiska", "Wydział Organizacyjny"];
const USERS_LIST = [
  { id: 1, name: "Anna Kowalska", initials: "AK", dept: "Wydział Finansowy" },
  { id: 2, name: "Jan Nowak", initials: "JN", dept: "Wydział Infrastruktury" },
  { id: 3, name: "Maria Wiśniewska", initials: "MW", dept: "Wydział Oświaty" },
  { id: 4, name: "Piotr Zieliński", initials: "PZ", dept: "Wydział Środowiska" },
  { id: 5, name: "Zuzanna Jędrzejewska", initials: "ZJ", dept: "Wydział Organizacyjny" },
];

const CLASSIFICATIONS = [
  { code: "600-60016-4270", label: "Drogi publiczne gminne — remonty", budget: 2500000, used: 1875000 },
  { code: "750-75023-4300", label: "Urzędy gmin — zakup usług", budget: 800000, used: 520000 },
  { code: "801-80101-4210", label: "Szkoły podstawowe — materiały", budget: 350000, used: 105000 },
  { code: "900-90003-4300", label: "Oczyszczanie — zakup usług", budget: 1200000, used: 960000 },
  { code: "921-92109-4270", label: "Domy i ośrodki kultury — remonty", budget: 450000, used: 180000 },
];

const TAGS = [
  { id: "pilne", label: "Pilne", color: DS.errorMain },
  { id: "inwestycja", label: "Inwestycja", color: DS.primaryLight },
  { id: "dotacja", label: "Dotacja", color: DS.successMain },
  { id: "przetarg", label: "Przetarg", color: DS.infoMain },
  { id: "ksef", label: "KSeF", color: "#7C3AED" },
  { id: "wieloletnia", label: "Wieloletnia", color: DS.warningMain },
];

const CONTRACTORS = [
  "BudDrog Sp. z o.o.", "EduSerwis Polska S.A.", "GreenTech Ochrona Środowiska",
  "InfraBud S.A.", "IT Solutions Sp. z o.o.", "Kancelaria Prawna Nowakowski",
  "MediCare Sp. z o.o.", "OdpadyCo Sp. z o.o.", "TransGmina Sp. z o.o.",
  "ZielonaEnergia Sp. z o.o.",
];

const INIT_DOCS = [
  { id: 1, type: "umowa", status: "w_realizacji", title: "Remont drogi gminnej ul. Lipowa", number: "UM/2025/001", nrEwidencyjny: "CRU 1/2026", rodzajUmowy: "wydatkowa", contractor: "BudDrog Sp. z o.o.", dept: "Wydział Infrastruktury", assignee: 2, netValue: 425000, grossValue: 522750, classification: "600-60016-4270", dateCreated: "2025-01-15", dateStart: "2025-02-01", dateEnd: "2025-06-30", tags: ["inwestycja"], alerts: ["KT"], notes: "Termin realizacji do końca czerwca", history: [
    { date: "2025-01-15", user: "Anna Kowalska", action: "Utworzenie dokumentu", details: "Nowa umowa — wersja robocza" },
    { date: "2025-01-17", user: "Marek Wiśniewski", action: "Zmiana statusu", details: "w przygotowaniu → w realizacji" },
    { date: "2025-01-20", user: "Ewa Nowak", action: "Zatwierdzenie budżetu", details: "Zatwierdzono budżet 522 750 PLN" },
    { date: "2025-02-01", user: "Anna Kowalska", action: "Zmiana statusu", details: "w przygotowaniu → w realizacji" },
  ] },
  { id: 2, type: "faktura", status: "do_weryfikacji", title: "Faktura za usługi IT — styczeń", number: "FV/2025/042", nrEwidencyjny: "REF 1/2026", rodzajUmowy: "wydatkowa", contractor: "IT Solutions Sp. z o.o.", dept: "Wydział Organizacyjny", assignee: 5, netValue: 12500, grossValue: 15375, classification: "750-75023-4300", dateCreated: "2025-02-01", tags: ["ksef"], alerts: [], notes: "" },
  { id: 3, type: "umowa", status: "w_przygotowaniu", title: "Dostawa materiałów dydaktycznych", number: "UM/2025/008", nrEwidencyjny: "CRU 2/2026", rodzajUmowy: "wydatkowa", contractor: "EduSerwis Polska S.A.", dept: "Wydział Oświaty", assignee: 3, netValue: 67800, grossValue: 83394, classification: "801-80101-4210", dateCreated: "2025-01-28", dateStart: "2025-02-15", dateEnd: "2025-12-31", tags: ["przetarg"], alerts: [], notes: "", history: [
    { date: "2025-01-28", user: "Piotr Zieliński", action: "Utworzenie dokumentu", details: "Rejestracja umowy z przetargu" },
    { date: "2025-01-30", user: "Anna Kowalska", action: "Edycja wartości", details: "Zmiana kwoty netto: 65 000 → 67 800 PLN" },
    { date: "2025-02-01", user: "Piotr Zieliński", action: "Zmiana statusu", details: "w przygotowaniu" },
  ] },
  { id: 4, type: "zlecenie", status: "w_realizacji", title: "Odbiór odpadów wielkogabarytowych — luty", number: "ZL/2025/015", nrEwidencyjny: "RZ 1/2026", rodzajUmowy: "wydatkowa", contractor: "OdpadyCo Sp. z o.o.", dept: "Wydział Środowiska", assignee: 4, netValue: 28000, grossValue: 34440, classification: "900-90003-4300", dateCreated: "2025-02-03", tags: [], alerts: ["ZA"], notes: "" },
  { id: 5, type: "umowa", status: "w_przygotowaniu", title: "Modernizacja oświetlenia ul. Parkowa", number: "", nrEwidencyjny: "", rodzajUmowy: "wydatkowa", contractor: "ZielonaEnergia Sp. z o.o.", dept: "Wydział Infrastruktury", assignee: 2, netValue: 185000, grossValue: 227550, classification: "", dateCreated: "2025-02-05", tags: ["inwestycja", "dotacja"], alerts: ["WU"], notes: "Czeka na decyzję o dofinansowaniu", history: [
    { date: "2025-02-05", user: "Marek Wiśniewski", action: "Utworzenie dokumentu", details: "Wersja robocza — brak klasyfikacji" },
  ] },
  { id: 6, type: "faktura", status: "zweryfikowana", title: "Faktura za energię — styczeń 2025", number: "FV/2025/039", nrEwidencyjny: "REF 2/2026", rodzajUmowy: "wydatkowa", contractor: "ZielonaEnergia Sp. z o.o.", dept: "Wydział Organizacyjny", assignee: 1, netValue: 8400, grossValue: 10332, classification: "750-75023-4300", dateCreated: "2025-01-20", tags: ["ksef"], alerts: [], notes: "" },
  { id: 7, type: "aneks", status: "w_przygotowaniu", title: "Aneks nr 2 — drogi Lipowa (zmiana terminu)", number: "AN/2025/002", nrEwidencyjny: "AN 1/2026", rodzajUmowy: "wydatkowa", contractor: "BudDrog Sp. z o.o.", dept: "Wydział Infrastruktury", assignee: 2, netValue: 0, grossValue: 0, classification: "600-60016-4270", dateCreated: "2025-02-06", tags: [], alerts: [], notes: "Przesunięcie terminu o 3 miesiące" },
  { id: 8, type: "umowa", status: "w_realizacji", title: "Obsługa prawna gminy 2025", number: "UM/2025/003", nrEwidencyjny: "CRU 3/2026", rodzajUmowy: "wydatkowa", contractor: "Kancelaria Prawna Nowakowski", dept: "Wydział Organizacyjny", assignee: 5, netValue: 96000, grossValue: 118080, classification: "750-75023-4300", dateCreated: "2025-01-10", dateStart: "2025-01-01", dateEnd: "2025-12-31", tags: ["wieloletnia"], alerts: [], notes: "" },
  { id: 9, type: "zlecenie", status: "w_przygotowaniu", title: "Remont dachu Domu Kultury", number: "", nrEwidencyjny: "", rodzajUmowy: "wydatkowa", contractor: "", dept: "Wydział Infrastruktury", assignee: 2, netValue: 0, grossValue: 0, classification: "921-92109-4270", dateCreated: "2025-02-07", tags: [], alerts: ["WU"], notes: "Wstępna wycena w trakcie" },
  { id: 10, type: "faktura", status: "do_weryfikacji", title: "Transport pracowników — luty", number: "FV/2025/055", nrEwidencyjny: "REF 3/2026", rodzajUmowy: "wydatkowa", contractor: "TransGmina Sp. z o.o.", dept: "Wydział Organizacyjny", assignee: 1, netValue: 5200, grossValue: 6396, classification: "750-75023-4300", dateCreated: "2025-02-08", tags: [], alerts: [], notes: "" },
];

// --- CHILD DOCUMENTS (hierarchical structure) ---
// Types: faktura, aneks, zalacznik (attachment), plik (file)
const CHILD_DOCS = {
  1: [ // Umowa: Remont drogi gminnej ul. Lipowa
    { id: "c1-1", parentId: 1, childType: "faktura", type: "faktura", title: "Faktura zaliczkowa — roboty ziemne", number: "FV/2025/078", contractor: "BudDrog Sp. z o.o.", grossValue: 104550, status: "zweryfikowana", dateCreated: "2025-03-10" },
    { id: "c1-2", parentId: 1, childType: "faktura", type: "faktura", title: "Faktura częściowa — nawierzchnia", number: "FV/2025/112", contractor: "BudDrog Sp. z o.o.", grossValue: 209100, status: "do_weryfikacji", dateCreated: "2025-04-15" },
    { id: "c1-3", parentId: 1, childType: "aneks", type: "aneks", title: "Aneks nr 1 — zmiana harmonogramu", number: "AN/2025/001", contractor: "BudDrog Sp. z o.o.", grossValue: 0, status: "w_realizacji", dateCreated: "2025-03-20" },
    { id: "c1-4", parentId: 1, childType: "zalacznik", type: "inne", title: "Protokół odbioru robót etap I", number: "ZAŁ/1/1", grossValue: null, status: null, dateCreated: "2025-04-01", fileName: "protokol_odbioru_etap1.pdf", fileSize: "2.1 MB" },
    { id: "c1-5", parentId: 1, childType: "plik", type: "inne", title: "Umowa — skan podpisany", number: null, grossValue: null, status: null, dateCreated: "2025-01-15", fileName: "umowa_UM2025001.pdf", fileSize: "3.4 MB" },
    { id: "c1-6", parentId: 1, childType: "zalacznik", type: "inne", title: "Harmonogram robót", number: "ZAŁ/1/2", grossValue: null, status: null, dateCreated: "2025-02-01", fileName: "harmonogram_lipowa.xlsx", fileSize: "0.8 MB" },
  ],
  3: [ // Umowa: Dostawa materiałów dydaktycznych
    { id: "c3-1", parentId: 3, childType: "faktura", type: "faktura", title: "Faktura za podręczniki", number: "FV/2025/091", contractor: "EduSerwis Polska S.A.", grossValue: 41697, status: "do_weryfikacji", dateCreated: "2025-03-15" },
    { id: "c3-2", parentId: 3, childType: "plik", type: "inne", title: "Specyfikacja zamówienia", number: null, grossValue: null, status: null, dateCreated: "2025-01-28", fileName: "specyfikacja_edu.pdf", fileSize: "1.2 MB" },
  ],
  5: [ // Umowa: Modernizacja oświetlenia
    { id: "c5-1", parentId: 5, childType: "plik", type: "inne", title: "Kosztorys wstępny", number: null, grossValue: null, status: null, dateCreated: "2025-02-05", fileName: "kosztorys_parkowa.pdf", fileSize: "0.5 MB" },
  ],
  8: [ // Umowa: Obsługa prawna
    { id: "c8-1", parentId: 8, childType: "faktura", type: "faktura", title: "Faktura za usługi prawne — styczeń", number: "FV/2025/035", contractor: "Kancelaria Prawna Nowakowski", grossValue: 9840, status: "zweryfikowana", dateCreated: "2025-02-05" },
    { id: "c8-2", parentId: 8, childType: "faktura", type: "faktura", title: "Faktura za usługi prawne — luty", number: "FV/2025/068", contractor: "Kancelaria Prawna Nowakowski", grossValue: 9840, status: "do_weryfikacji", dateCreated: "2025-03-04" },
    { id: "c8-3", parentId: 8, childType: "aneks", type: "aneks", title: "Aneks nr 1 — rozszerzenie zakresu", number: "AN/2025/003", contractor: "Kancelaria Prawna Nowakowski", grossValue: 0, status: "w_realizacji", dateCreated: "2025-02-20" },
    { id: "c8-4", parentId: 8, childType: "plik", type: "inne", title: "Umowa — skan", number: null, grossValue: null, status: null, dateCreated: "2025-01-10", fileName: "umowa_prawna_2025.pdf", fileSize: "1.8 MB" },
  ],
  4: [ // Zlecenie: Odbiór odpadów
    { id: "c4-1", parentId: 4, childType: "faktura", type: "faktura", title: "Faktura za odbiór odpadów — luty", number: "FV/2025/095", contractor: "OdpadyCo Sp. z o.o.", grossValue: 17220, status: "do_weryfikacji", dateCreated: "2025-03-01" },
    { id: "c4-2", parentId: 4, childType: "zalacznik", type: "inne", title: "Protokół odbioru odpadów", number: "ZAŁ/4/1", grossValue: null, status: null, dateCreated: "2025-02-28", fileName: "protokol_odpady_luty.pdf", fileSize: "0.3 MB" },
  ],
};

// Child type labels for grouping
const CHILD_TYPE_LABELS = {
  faktura: { label: "FAKTURY", icon: "receipt", color: "#0A7BE5" },
  aneks: { label: "ANEKSY", icon: "gitBranch", color: "#7C3AED" },
  zalacznik: { label: "ZAŁĄCZNIKI", icon: "paperclip", color: DS.neutralDark },
  plik: { label: "PLIKI", icon: "file", color: DS.neutralDark },
};

// --- FOLDERS / TECZKI (Iter 4) ---
const INIT_FOLDERS = [
  { id: "f1", name: "Inwestycja Drogi Powiatowej", color: "#A971F6", icon: "trendingUp", docIds: [1, 2, 4, 7], description: "Dokumenty dotyczące modernizacji drogi powiatowej nr 1234", createdAt: "2026-01-15" },
  { id: "f2", name: "Anna Kowalska — dokumenty", color: "#21B9E5", icon: "users", docIds: [3, 8], description: "Umowy i faktury kontrahenta Anna Kowalska", createdAt: "2026-02-01" },
  { id: "f3", name: "REGULAMINY", color: "#38A169", icon: "file", docIds: [5, 6], description: "Obowiązujące regulaminy i dokumenty wewnętrzne", createdAt: "2026-01-20" },
  { id: "f4", name: "Dokumenty w przygotowaniu", color: "#E53E3E", icon: "alert", docIds: [3, 10], description: "Dokumenty wymagające uzupełnienia", createdAt: "2026-02-10" },
];

// ──── 03-ksef-data.js ────
/* ═══════════════════════════════════════════════════════════════
   KSEF — MOCK INVOICES (inbox from Krajowy System e-Faktur)
   ═══════════════════════════════════════════════════════════════ */
const KSEF_STATUSES = {
  nowy: { label: "Nowy", color: "#2563EB", bg: "#DBEAFE", icon: "inbox" },
  przypisany: { label: "Przypisany", color: "#7C3AED", bg: "#EDE9FE", icon: "user" },
  zweryfikowany: { label: "Zweryfikowany", color: "#16A34A", bg: "#DCFCE7", icon: "check" },
  odrzucony: { label: "Odrzucony", color: "#DC2626", bg: "#FEE2E2", icon: "x" },
};

const INIT_KSEF_INVOICES = [
  {
    id: "ks1", nrKsef: "5265877635-20260204-0200A0D6723E-C2", status: "nowy",
    seller: { nip: "526-025-09-95", name: "Orange Polska S.A.", address: "Al. Jerozolimskie 160, 02-326 Warszawa" },
    buyer: { nip: "631-10-00-640", name: "Powiat Gliwicki", address: "ul. Zygmunta Starego 17, 44-100 Gliwice" },
    invoiceNumber: "11-106205-02267", issueDate: "2026-02-04", sellDate: "2026-01-31",
    dueDate: "2026-03-04", paymentMethod: "przelew",
    items: [
      { nr: 1, name: "Abonament telefoniczny — pakiet urzędowy", unit: "szt.", qty: 5, unitPrice: 23.00, netValue: 115.00, vatRate: "23%", vatAmount: 26.45, grossValue: 141.45 },
    ],
    netTotal: 115.00, vatTotal: 26.45, grossTotal: 141.45, currency: "PLN",
    receivedAt: "2026-02-04T08:12:33Z", isCorrection: false,
  },
  {
    id: "ks2", nrKsef: "2310014012-20260210-4FA82B1C90DE-A1", status: "nowy",
    seller: { nip: "231-001-40-12", name: "TAURON Dystrybucja S.A.", address: "ul. Podgórska 25A, 31-035 Kraków" },
    buyer: { nip: "631-10-00-640", name: "Powiat Gliwicki", address: "ul. Zygmunta Starego 17, 44-100 Gliwice" },
    invoiceNumber: "D/DO/BN009193/0045/26", issueDate: "2026-02-10", sellDate: "2026-01-31",
    dueDate: "2026-03-10", paymentMethod: "przelew",
    items: [
      { nr: 1, name: "Energia elektryczna — taryfa C11 (budynek główny)", unit: "kWh", qty: 4200, unitPrice: 0.0685, netValue: 287.70, vatRate: "23%", vatAmount: 66.17, grossValue: 353.87 },
      { nr: 2, name: "Opłata dystrybucyjna stała", unit: "mies.", qty: 1, unitPrice: 100.00, netValue: 100.00, vatRate: "23%", vatAmount: 23.00, grossValue: 123.00 },
    ],
    netTotal: 387.70, vatTotal: 89.17, grossTotal: 476.87, currency: "PLN",
    receivedAt: "2026-02-10T10:45:12Z", isCorrection: false,
  },
  {
    id: "ks3", nrKsef: "6211766191-20260210-8BC1DE4F5A67-B3", status: "nowy",
    seller: { nip: "621-176-61-91", name: "Dino Polska S.A.", address: "ul. Ostrowska 122, 63-700 Krotoszyn" },
    buyer: { nip: "631-10-00-640", name: "Powiat Gliwicki", address: "ul. Zygmunta Starego 17, 44-100 Gliwice" },
    invoiceNumber: "P/10459/2026/00015", issueDate: "2026-02-10", sellDate: "2026-02-10",
    dueDate: "2026-02-24", paymentMethod: "przelew",
    items: [
      { nr: 1, name: "Artykuły spożywcze — catering narada", unit: "kpl.", qty: 1, unitPrice: 159.00, netValue: 159.00, vatRate: "8%", vatAmount: 12.72, grossValue: 171.72 },
      { nr: 2, name: "Woda mineralna 0,5l (karton 24 szt.)", unit: "krt.", qty: 2, unitPrice: 18.155, netValue: 36.31, vatRate: "23%", vatAmount: 8.35, grossValue: 44.66 },
    ],
    netTotal: 195.31, vatTotal: 9.77, grossTotal: 205.08, currency: "PLN",
    receivedAt: "2026-02-10T14:22:05Z", isCorrection: false,
  },
  {
    id: "ks4", nrKsef: "5830018931-20260206-C1D2E3F4A5B6-D4", status: "nowy",
    seller: { nip: "583-001-89-31", name: "Wolters Kluwer Polska Sp. z o.o.", address: "ul. Przyokopowa 33, 01-208 Warszawa" },
    buyer: { nip: "631-10-00-640", name: "Powiat Gliwicki", address: "ul. Zygmunta Starego 17, 44-100 Gliwice" },
    invoiceNumber: "1526054239", issueDate: "2026-02-06", sellDate: "2026-02-01",
    dueDate: "2026-03-06", paymentMethod: "przelew",
    items: [
      { nr: 1, name: "Lex Omega — dostęp roczny (licencja stanowiskowa x3)", unit: "szt.", qty: 3, unitPrice: 174.963, netValue: 524.89, vatRate: "23%", vatAmount: 120.72, grossValue: 645.61 },
    ],
    netTotal: 524.89, vatTotal: 120.72, grossTotal: 645.61, currency: "PLN",
    receivedAt: "2026-02-06T09:33:18Z", isCorrection: false,
  },
  {
    id: "ks5", nrKsef: "7792369461-20260208-A1B2C3D4E5F6-E5", status: "nowy",
    seller: { nip: "779-236-94-61", name: "ACS Audika Sp. z o.o.", address: "ul. Batorego 18, 02-591 Warszawa" },
    buyer: { nip: "631-10-00-640", name: "Powiat Gliwicki", address: "ul. Zygmunta Starego 17, 44-100 Gliwice" },
    invoiceNumber: "FV/KOR/2026/02/001", issueDate: "2026-02-08", sellDate: "2026-02-01",
    dueDate: "2026-02-22", paymentMethod: "przelew",
    items: [
      { nr: 1, name: "Korekta — serwis aparatów słuchowych (nadpłata)", unit: "usł.", qty: 1, unitPrice: -81.30, netValue: -81.30, vatRate: "23%", vatAmount: -18.70, grossValue: -100.00 },
    ],
    netTotal: -81.30, vatTotal: -18.70, grossTotal: -100.00, currency: "PLN",
    receivedAt: "2026-02-08T11:05:44Z", isCorrection: true,
  },
  {
    id: "ks6", nrKsef: "9111234567-20260218-F6E5D4C3B2A1-F6", status: "przypisany",
    seller: { nip: "911-123-45-67", name: "Hurt-Pap Sp. z o.o.", address: "ul. Magazynowa 7, 44-100 Gliwice" },
    buyer: { nip: "631-10-00-640", name: "Powiat Gliwicki", address: "ul. Zygmunta Starego 17, 44-100 Gliwice" },
    invoiceNumber: "FV/HP/2026/0234", issueDate: "2026-02-18", sellDate: "2026-02-18",
    dueDate: "2026-03-18", paymentMethod: "przelew",
    items: [
      { nr: 1, name: "Papier ksero A4 80g (karton 5 ryz)", unit: "krt.", qty: 10, unitPrice: 28.50, netValue: 285.00, vatRate: "23%", vatAmount: 65.55, grossValue: 350.55 },
      { nr: 2, name: "Tonery do drukarek HP LaserJet", unit: "szt.", qty: 4, unitPrice: 31.90, netValue: 127.60, vatRate: "23%", vatAmount: 29.35, grossValue: 156.95 },
    ],
    netTotal: 412.60, vatTotal: 94.90, grossTotal: 507.50, currency: "PLN",
    receivedAt: "2026-02-18T07:48:22Z", isCorrection: false, assignedTo: "Wydział Organizacyjny",
  },
  {
    id: "ks7", nrKsef: "2310003993-20260205-1A2B3C4D5E6F-G7", status: "przypisany",
    seller: { nip: "231-000-39-93", name: "TAURON Sprzedaż Sp. z o.o.", address: "ul. Łagiewnicka 60, 30-417 Kraków" },
    buyer: { nip: "631-10-00-640", name: "Powiat Gliwicki", address: "ul. Zygmunta Starego 17, 44-100 Gliwice" },
    invoiceNumber: "S/FA/02/2026/004512", issueDate: "2026-02-05", sellDate: "2026-01-31",
    dueDate: "2026-03-05", paymentMethod: "przelew",
    items: [
      { nr: 1, name: "Sprzedaż energii elektrycznej — I 2026", unit: "kWh", qty: 3580, unitPrice: 0.0686, netValue: 245.53, vatRate: "23%", vatAmount: 56.47, grossValue: 302.00 },
    ],
    netTotal: 245.53, vatTotal: 56.57, grossTotal: 302.10, currency: "PLN",
    receivedAt: "2026-02-05T12:15:41Z", isCorrection: false, assignedTo: "Wydział Organizacyjny",
  },
  {
    id: "ks8", nrKsef: "8131234567-20260222-7G8H9I0J1K2L-H8", status: "nowy",
    seller: { nip: "813-123-45-67", name: "Softres Sp. z o.o.", address: "ul. Cicha 3, 35-326 Rzeszów" },
    buyer: { nip: "631-10-00-640", name: "Powiat Gliwicki", address: "ul. Zygmunta Starego 17, 44-100 Gliwice" },
    invoiceNumber: "FV/2026/02/0089", issueDate: "2026-02-22", sellDate: "2026-02-01",
    dueDate: "2026-03-22", paymentMethod: "przelew",
    items: [
      { nr: 1, name: "Licencja roczna — system KSAT (moduł budżet)", unit: "szt.", qty: 1, unitPrice: 850.00, netValue: 850.00, vatRate: "23%", vatAmount: 195.50, grossValue: 1045.50 },
      { nr: 2, name: "Licencja roczna — system KSAT (moduł kadry)", unit: "szt.", qty: 1, unitPrice: 650.00, netValue: 650.00, vatRate: "23%", vatAmount: 149.50, grossValue: 799.50 },
      { nr: 3, name: "Wsparcie techniczne 24/7 (abonament miesięczny x2)", unit: "mies.", qty: 2, unitPrice: 175.00, netValue: 350.00, vatRate: "23%", vatAmount: 80.50, grossValue: 430.50 },
    ],
    netTotal: 1850.00, vatTotal: 425.50, grossTotal: 2275.50, currency: "PLN",
    receivedAt: "2026-02-22T06:30:09Z", isCorrection: false,
  },
  {
    id: "ks9", nrKsef: "6341234567-20260215-2M3N4O5P6Q7R-I9", status: "zweryfikowany",
    seller: { nip: "634-123-45-67", name: "MediCare Sp. z o.o.", address: "ul. Szpitalna 12, 44-100 Gliwice" },
    buyer: { nip: "631-10-00-640", name: "Powiat Gliwicki", address: "ul. Zygmunta Starego 17, 44-100 Gliwice" },
    invoiceNumber: "FV/MC/2026/00142", issueDate: "2026-02-15", sellDate: "2026-02-14",
    dueDate: "2026-03-15", paymentMethod: "przelew",
    items: [
      { nr: 1, name: "Badania okresowe pracowników (pakiet podstawowy)", unit: "os.", qty: 12, unitPrice: 95.00, netValue: 1140.00, vatRate: "zw.", vatAmount: 0, grossValue: 1140.00 },
      { nr: 2, name: "Badania kierowców (kat. B)", unit: "os.", qty: 5, unitPrice: 150.00, netValue: 750.00, vatRate: "zw.", vatAmount: 0, grossValue: 750.00 },
    ],
    netTotal: 1890.00, vatTotal: 0, grossTotal: 1890.00, currency: "PLN",
    receivedAt: "2026-02-15T09:22:33Z", isCorrection: false, assignedTo: "Wydział Organizacyjny",
  },
  {
    id: "ks10", nrKsef: "5261234567-20260212-3S4T5U6V7W8X-J0", status: "zweryfikowany",
    seller: { nip: "526-123-45-67", name: "Budimex S.A.", address: "ul. Siedmiogrodzka 9, 01-204 Warszawa" },
    buyer: { nip: "631-10-00-640", name: "Powiat Gliwicki", address: "ul. Zygmunta Starego 17, 44-100 Gliwice" },
    invoiceNumber: "FV/BDX/2026/003318", issueDate: "2026-02-12", sellDate: "2026-02-10",
    dueDate: "2026-03-12", paymentMethod: "przelew",
    items: [
      { nr: 1, name: "Roboty budowlane — etap II remont drogi powiatowej nr 2945S", unit: "kpl.", qty: 1, unitPrice: 185000.00, netValue: 185000.00, vatRate: "23%", vatAmount: 42550.00, grossValue: 227550.00 },
    ],
    netTotal: 185000.00, vatTotal: 42550.00, grossTotal: 227550.00, currency: "PLN",
    receivedAt: "2026-02-12T14:58:07Z", isCorrection: false, assignedTo: "Wydział Infrastruktury",
  },
  {
    id: "ks11", nrKsef: "6451234567-20260220-4Y5Z6A7B8C9D-K1", status: "zweryfikowany",
    seller: { nip: "645-123-45-67", name: "Auto-Serwis Gliwice Sp. z o.o.", address: "ul. Mechaników 5, 44-100 Gliwice" },
    buyer: { nip: "631-10-00-640", name: "Powiat Gliwicki", address: "ul. Zygmunta Starego 17, 44-100 Gliwice" },
    invoiceNumber: "FV/AS/2026/0078", issueDate: "2026-02-20", sellDate: "2026-02-20",
    dueDate: "2026-03-06", paymentMethod: "przelew",
    items: [
      { nr: 1, name: "Przegląd techniczny — Skoda Octavia (GLC 12345)", unit: "usł.", qty: 1, unitPrice: 350.00, netValue: 350.00, vatRate: "23%", vatAmount: 80.50, grossValue: 430.50 },
      { nr: 2, name: "Wymiana oleju silnikowego + filtr", unit: "kpl.", qty: 1, unitPrice: 220.00, netValue: 220.00, vatRate: "23%", vatAmount: 50.60, grossValue: 270.60 },
      { nr: 3, name: "Wymiana klocków hamulcowych (przód)", unit: "kpl.", qty: 1, unitPrice: 180.00, netValue: 180.00, vatRate: "23%", vatAmount: 41.40, grossValue: 221.40 },
    ],
    netTotal: 750.00, vatTotal: 172.50, grossTotal: 922.50, currency: "PLN",
    receivedAt: "2026-02-20T15:30:12Z", isCorrection: false, assignedTo: "Wydział Organizacyjny",
  },
  {
    id: "ks12", nrKsef: "5471234567-20260225-5E6F7G8H9I0J-L2", status: "odrzucony",
    seller: { nip: "547-123-45-67", name: "PHU Kowalski Jan Kowalski", address: "ul. Rzemieślnicza 44, 44-100 Gliwice" },
    buyer: { nip: "631-10-00-640", name: "Powiat Gliwicki", address: "ul. Zygmunta Starego 17, 44-100 Gliwice" },
    invoiceNumber: "FV/01/02/2026", issueDate: "2026-02-25", sellDate: "2026-02-25",
    dueDate: "2026-03-11", paymentMethod: "przelew",
    items: [
      { nr: 1, name: "Usługa sprzątania — luty 2026", unit: "usł.", qty: 1, unitPrice: 3200.00, netValue: 3200.00, vatRate: "23%", vatAmount: 736.00, grossValue: 3936.00 },
    ],
    netTotal: 3200.00, vatTotal: 736.00, grossTotal: 3936.00, currency: "PLN",
    receivedAt: "2026-02-25T10:12:55Z", isCorrection: false, rejectionReason: "Brak umowy — faktura niezamówiona",
  },
  {
    id: "ks13", nrKsef: "8991234567-20260226-6K7L8M9N0O1P-M3", status: "odrzucony",
    seller: { nip: "899-123-45-67", name: "DataCenter Solutions Sp. z o.o.", address: "ul. Serwerowa 1, 53-333 Wrocław" },
    buyer: { nip: "631-10-00-640", name: "Powiat Gliwicki", address: "ul. Zygmunta Starego 17, 44-100 Gliwice" },
    invoiceNumber: "FV/DCS/2026/0445", issueDate: "2026-02-26", sellDate: "2026-02-01",
    dueDate: "2026-03-26", paymentMethod: "przelew",
    items: [
      { nr: 1, name: "Hosting serwerów — luty 2026 (pomyłka adresata)", unit: "mies.", qty: 1, unitPrice: 1200.00, netValue: 1200.00, vatRate: "23%", vatAmount: 276.00, grossValue: 1476.00 },
    ],
    netTotal: 1200.00, vatTotal: 276.00, grossTotal: 1476.00, currency: "PLN",
    receivedAt: "2026-02-26T08:45:30Z", isCorrection: false, rejectionReason: "Pomyłka — faktura wystawiona na niewłaściwy podmiot",
  },
];

// ──── 04-ui-primitives.js ────
/* ═══════════════════════════════════════════════════════════════
   UTILITY COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
const formatCurrency = (v) => v != null ? v.toLocaleString("pl-PL", { style: "currency", currency: "PLN" }) : "—";
const formatDate = (d) => d ? new Date(d).toLocaleDateString("pl-PL") : "—";

const Badge = ({ children, color, bg, style = {}, small }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", padding: small ? "1px 6px" : "2px 8px",
    ...S.pill, fontSize: small ? 10 : 11, fontWeight: 600, lineHeight: small ? "16px" : "18px",
    color, background: bg, whiteSpace: "nowrap", letterSpacing: 0.2, ...style,
  }}>{children}</span>
);

const AlertBadge = ({ code }) => {
  const alert = ALERT_TYPES[code];
  if (!alert) return null;
  const [hover, setHover] = React.useState(false);
  const s = 18;
  return (
    <div style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div style={{
        width: s, height: s, borderRadius: "50%",
        border: `1.5px solid ${alert.color}40`, background: alert.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "default", flexShrink: 0,
      }}>
        <Icon name={alert.icon} size={9} color={alert.color} />
      </div>
      {hover && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 5px)", left: "50%", transform: "translateX(-50%)",
          background: DS.primaryDark, color: "#fff", padding: "5px 9px", borderRadius: 5,
          fontSize: 11, lineHeight: "15px", whiteSpace: "nowrap", zIndex: 50, pointerEvents: "none",
          boxShadow: DS.shadowMd,
        }}>
          {alert.label}
          <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
            width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent",
            borderTop: `4px solid ${DS.primaryDark}`,
          }} />
        </div>
      )}
    </div>
  );
};

const Avatar = ({ name, size = 28 }) => {
  const initials = (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: DS.primaryLighter, color: DS.primaryMain,
      ...S.row, justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 600, flexShrink: 0,
    }}>{initials}</div>
  );
};

const Btn = ({ children, variant = "secondary", icon, onClick, style = {}, small, disabled, title }) => {
  const styles = {
    accent: { bg: DS.primaryLight, color: "#fff", hoverBg: DS.primaryDark, border: "none" },
    primary: { bg: DS.primaryMain, color: "#fff", hoverBg: DS.primaryDark, border: "none" },
    secondary: { bg: DS.neutralWhite, color: DS.textPrimary, hoverBg: DS.neutralLighter, border: `1px solid ${DS.borderLight}` },
    ghost: { bg: "transparent", color: DS.textSecondary, hoverBg: DS.neutralLighter, border: "none" },
    danger: { bg: DS.errorLighter, color: DS.errorDark, hoverBg: DS.errorLight, border: "none" },
    success: { bg: DS.successLighter, color: DS.successDark, hoverBg: DS.successLight, border: "none" },
  }[variant];
  return (
    <button title={title} disabled={disabled} onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: small ? "4px 10px" : "7px 14px",
      borderRadius: 8, fontSize: small ? 12 : 13, fontWeight: 500,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
      background: styles.bg, color: styles.color, border: styles.border || "none",
      fontFamily: DS.fontFamily, transition: "all 0.15s", whiteSpace: "nowrap", ...style,
    }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = styles.hoverBg; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = styles.bg; }}
    >
      {icon && <Icon name={icon} size={small ? 13 : 15} />}
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, icon, style = {}, type = "text" }) => (
  <div style={{ position: "relative", ...style }}>
    {icon && <Icon name={icon} size={14} color={DS.textDisabled} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />}
    <input type={type} value={value} onChange={e => onChange(type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
      placeholder={placeholder} style={{
        width: "100%", padding: `8px ${icon ? "12px" : "12px"} 8px ${icon ? "32px" : "12px"}`,
        border: `1px solid ${DS.borderLight}`, borderRadius: 8,
        fontSize: 13, fontFamily: DS.fontFamily, color: DS.textPrimary,
        background: DS.neutralWhite, outline: "none", transition: "border-color 0.15s",
      }} />
  </div>
);

const Select = ({ value, onChange, options, placeholder, style = {} }) => (
  <select value={value || ""} onChange={e => onChange(e.target.value)} style={{
    width: "100%", padding: "8px 12px", border: `1px solid ${DS.borderLight}`,
    borderRadius: 8, fontSize: 13, fontFamily: DS.fontFamily,
    color: value ? DS.textPrimary : DS.textDisabled, background: DS.neutralWhite,
    outline: "none", appearance: "auto", cursor: "pointer", ...style,
  }}>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const Field = ({ label, children, hint }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ ...typo.labelMedium, color: DS.textSecondary, marginBottom: 5 }}>{label}</div>
    {children}
    {hint && <div style={{ ...typo.labelSmall, color: DS.textDisabled, marginTop: 3 }}>{hint}</div>}
  </div>
);

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ ...typo.titleSmall, color: DS.primaryMain, marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid ${DS.borderLight}` }}>{title}</div>
    {children}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR — enhanced with working views + counters (P1/P4)
   ═══════════════════════════════════════════════════════════════ */
const Sidebar = ({ activeView, onViewChange, onOpenCmd, collapsed, onToggle }) => {
  const w = collapsed ? 56 : 220;
  const NavItem = ({ id, label, icon }) => {
    const active = activeView === id;
    return (
      <button onClick={() => onViewChange(id)} title={collapsed ? label : undefined} style={{
        ...S.row, gap: 10, width: "100%",
        padding: collapsed ? "9px 0" : "9px 14px",
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: 8, border: "none", cursor: "pointer", fontFamily: DS.fontFamily,
        background: active ? DS.primaryLighter : "transparent",
        color: active ? DS.primaryMain : DS.textSecondary,
        fontSize: 13, fontWeight: active ? 600 : 400,
        transition: "all 0.15s", textAlign: "left",
      }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = DS.neutralLighter; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
      >
        <Icon name={icon} size={18} color={active ? DS.primaryMain : DS.neutralMain} />
        {!collapsed && <span>{label}</span>}
      </button>
    );
  };

  return (
    <div style={{
      width: w, minWidth: w, background: DS.neutralWhite,
      borderRight: `1px solid ${DS.borderLight}`,
      ...S.col, transition: "width 0.2s, min-width 0.2s", overflow: "hidden",
    }}>
      {/* Search trigger */}
      {!collapsed ? (
        <div style={{ padding: "8px 10px 2px" }}>
          <button onClick={onOpenCmd} style={{
            ...S.row, gap: 8, width: "100%", padding: "7px 10px",
            borderRadius: 8, border: `1px solid ${DS.borderLight}`,
            background: DS.neutralLighter, cursor: "pointer",
            color: DS.textDisabled, fontSize: 12, fontFamily: DS.fontFamily,
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = DS.primaryLight}
            onMouseLeave={e => e.currentTarget.style.borderColor = DS.borderLight}
          >
            <Icon name="search" size={14} color={DS.textDisabled} />
            <span style={{ flex: 1, textAlign: "left" }}>Szukaj...</span>
            <kbd style={{
              ...typo.labelSmall, padding: "1px 5px", borderRadius: 4, fontSize: 10,
              border: `1px solid ${DS.borderLight}`, color: DS.textDisabled, background: DS.neutralWhite,
            }}>Ctrl K</kbd>
          </button>
        </div>
      ) : (
        <div style={{ padding: "8px 0 2px", ...S.row, justifyContent: "center" }}>
          <button onClick={onOpenCmd} title="Szukaj (Ctrl K)" style={{
            width: 34, height: 34, borderRadius: 8, border: `1px solid ${DS.borderLight}`,
            background: DS.neutralLighter, cursor: "pointer", ...S.row, justifyContent: "center", padding: 0,
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = DS.primaryLight}
            onMouseLeave={e => e.currentTarget.style.borderColor = DS.borderLight}
          >
            <Icon name="search" size={14} color={DS.textDisabled} />
          </button>
        </div>
      )}

      {/* Main navigation */}
      <div style={{ flex: 1, overflowY: "auto", padding: collapsed ? "6px 6px" : "6px 10px", ...S.col, gap: 2 }}>
        <NavItem id="podsumowanie" label="Monitor" icon="barChart" />
        <NavItem id="all" label="Dokumenty" icon="file" />
        <NavItem id="ksef" label="KSeF" icon="inbox" />
        <NavItem id="kontrahenci" label="Kontrahenci" icon="users" />
        <NavItem id="foldery" label="Foldery" icon="folder" />
        <NavItem id="inwestycje" label="Inwestycje" icon="trendingUp" />
        <NavItem id="ustawienia" label="Ustawienia" icon="settings" />
      </div>

      {/* Footer + collapse toggle */}
      <div style={{ borderTop: `1px solid ${DS.borderLight}`, padding: collapsed ? "8px 6px" : "8px 10px", ...S.col, gap: 6 }}>
        {!collapsed && <div style={{ padding: "4px 4px" }}>
          <div style={{ ...typo.labelSmall, color: DS.textDisabled }}>Gmina Publink</div>
          <div style={{ fontSize: 10, color: DS.neutralMain }}>Urząd Gminy · skarbnik</div>
        </div>}
        <button onClick={onToggle} title={collapsed ? "Rozwiń menu" : "Zwiń menu"} style={{
          ...S.row, justifyContent: "center", width: "100%", padding: 6,
          borderRadius: 6, border: "none", background: "transparent",
          cursor: "pointer", color: DS.textDisabled, transition: "background 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = DS.neutralLighter}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <Icon name={collapsed ? "chevronRight" : "chevronLeft"} size={16} />
        </button>
      </div>
    </div>
  );
};

// ──── 05-filters.js ────
/* ═══════════════════════════════════════════════════════════════
   VIEW TABS — system (non-deletable) + user custom (P3)
   ═══════════════════════════════════════════════════════════════ */
const ViewTabs = ({ activeTab, onTabChange, tabs, onAddTab, onRemoveTab }) => (
  <div style={{
    ...S.row, gap: 2, padding: "0 16px",
    borderBottom: `1px solid ${DS.borderLight}`, background: DS.neutralWhite,
    minHeight: 38, overflowX: "auto",
  }}>
    {tabs.map(tab => {
      const active = activeTab === tab.id;
      return (
        <button key={tab.id} onClick={() => onTabChange(tab.id)} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 14px", border: "none", borderRadius: 0,
          borderBottom: active ? `2px solid ${DS.primaryLight}` : "2px solid transparent",
          background: "transparent", cursor: "pointer", fontFamily: DS.fontFamily,
          fontSize: 13, fontWeight: active ? 600 : 400,
          color: active ? DS.primaryMain : DS.textSecondary,
          whiteSpace: "nowrap", transition: "all 0.15s",
        }}
          onMouseEnter={e => { if (!active) e.currentTarget.style.color = DS.textPrimary; }}
          onMouseLeave={e => { if (!active) e.currentTarget.style.color = active ? DS.primaryMain : DS.textSecondary; }}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span style={{
              ...typo.labelSmall, padding: "0 5px", ...S.pill,
              background: active ? DS.primaryLighter : DS.neutralLighter,
              color: active ? DS.primaryDark : DS.textDisabled,
            }}>{tab.count}</span>
          )}
          {tab.removable && active && (
            <span onClick={e => { e.stopPropagation(); onRemoveTab(tab.id); }} style={{
              marginLeft: 2, cursor: "pointer", display: "inline-flex",
              padding: 2, borderRadius: 4,
            }}
              onMouseEnter={e => e.currentTarget.style.background = DS.errorLighter}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <Icon name="x" size={11} color={DS.textDisabled} />
            </span>
          )}
        </button>
      );
    })}
    <button onClick={onAddTab} title="Dodaj widok" style={{
      display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 10px",
      border: `1px dashed ${DS.borderLight}`, borderRadius: 6,
      background: "transparent", cursor: "pointer", fontFamily: DS.fontFamily,
      fontSize: 12, color: DS.textDisabled, marginLeft: 4, transition: "all 0.15s",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = DS.primaryLight; e.currentTarget.style.color = DS.primaryLight; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = DS.borderLight; e.currentTarget.style.color = DS.textDisabled; }}
    >
      <Icon name="plus" size={12} />Dodaj widok
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   FILTER BAR — slide-under with summary (P3)
   ═══════════════════════════════════════════════════════════════ */
const MultiSelect = ({ values, onChange, options, placeholder, style }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);
  const toggle = (val) => {
    const next = values.includes(val) ? values.filter(v => v !== val) : [...values, val];
    onChange(next);
  };
  const display = values.length === 0 ? placeholder : values.length <= 2 ? values.map(v => options.find(o => o.value === v)?.label).join(", ") : `${values.length} wybrano`;
  return (
    <div ref={ref} style={{ position: "relative", ...style }}>
      <div onClick={() => setOpen(p => !p)} style={{
        padding: "7px 10px", border: `1px solid ${open ? DS.primaryLight : DS.borderLight}`,
        borderRadius: 8, ...S.row, gap: 6, cursor: "pointer", background: DS.neutralWhite,
        fontSize: 13, fontFamily: DS.fontFamily, color: values.length > 0 ? DS.textPrimary : DS.textDisabled,
        transition: "border-color 0.15s", minHeight: 34,
      }}>
        <span style={{ flex: 1, ...S.truncate }}>{display}</span>
        <Icon name="chevronDown" size={12} color={DS.textDisabled} />
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, zIndex: 30,
          background: DS.neutralWhite, borderRadius: 8, border: `1px solid ${DS.borderLight}`,
          boxShadow: DS.shadowMd, maxHeight: 220, overflowY: "auto", padding: "4px 0",
        }}>
          {options.map(opt => {
            const checked = values.includes(opt.value);
            return (
              <div key={opt.value} onClick={() => toggle(opt.value)} style={{
                padding: "6px 12px", ...S.row, gap: 8, cursor: "pointer",
                background: checked ? DS.primaryLighter : "transparent",
              }}
                onMouseEnter={e => { if (!checked) e.currentTarget.style.background = DS.neutralLighter; }}
                onMouseLeave={e => e.currentTarget.style.background = checked ? DS.primaryLighter : "transparent"}
              >
                <div style={{
                  width: 14, height: 14, borderRadius: 3,
                  border: `1.5px solid ${checked ? DS.primaryLight : DS.borderLight}`,
                  background: checked ? DS.primaryLight : "transparent",
                  ...S.row, justifyContent: "center", alignItems: "center", flexShrink: 0,
                }}>
                  {checked && <Icon name="check" size={9} color="#fff" />}
                </div>
                <span style={{ ...typo.bodySmall, color: DS.textPrimary }}>{opt.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const FilterBar = ({ filters, onFiltersChange, visible, onToggle }) => {
  if (!visible) return null;
  return (
    <div style={{
      padding: "12px 20px", background: DS.neutralLighter,
      borderBottom: `1px solid ${DS.borderLight}`,
      animation: "slideDown 0.15s ease",
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Field label="Status">
          <MultiSelect values={filters.status || []} onChange={v => onFiltersChange({ ...filters, status: v })}
            placeholder="Wszystkie statusy"
            options={Object.entries(DOC_STATUSES).map(([k, v]) => ({ value: k, label: v.label }))}
            style={{ width: 190 }} />
        </Field>
        <Field label="Wydział">
          <MultiSelect values={filters.dept || []} onChange={v => onFiltersChange({ ...filters, dept: v })}
            placeholder="Wszystkie wydziały"
            options={DEPARTMENTS.map(d => ({ value: d, label: d }))}
            style={{ width: 220 }} />
        </Field>
        <Field label="Osoba">
          <MultiSelect values={filters.assignee || []} onChange={v => onFiltersChange({ ...filters, assignee: v })}
            placeholder="Wszyscy"
            options={USERS_LIST.map(u => ({ value: String(u.id), label: u.name }))}
            style={{ width: 200 }} />
        </Field>
        <Btn variant="ghost" icon="x" small onClick={() => onFiltersChange({ status: [], dept: [], assignee: [] })}>Wyczyść</Btn>
      </div>
    </div>
  );
};

const FilterSummary = ({ filters, typeFilter }) => {
  const labels = {
    status: v => DOC_STATUSES[v]?.label,
    dept: v => v,
    assignee: v => USERS_LIST.find(u => String(u.id) === v)?.name,
  };
  const badges = [];
  if (typeFilter) badges.push({ key: "type", label: DOC_TYPES[typeFilter]?.label || typeFilter });
  Object.entries(filters).forEach(([key, val]) => {
    if (Array.isArray(val) && val.length > 0) {
      val.forEach((v, i) => badges.push({ key: key + i, label: labels[key]?.(v) || v }));
    } else if (val && !Array.isArray(val)) {
      badges.push({ key, label: labels[key]?.(val) || val });
    }
  });
  if (badges.length === 0) return null;
  return (
    <div style={{
      display: "flex", gap: 6, padding: "6px 20px", flexWrap: "wrap", alignItems: "center",
      borderBottom: `1px solid ${DS.borderLight}`, background: DS.neutralWhite,
    }}>
      <Icon name="filter" size={12} color={DS.textDisabled} />
      <span style={{ ...typo.labelSmall, color: DS.textDisabled }}>Filtry:</span>
      {badges.map(b => (
        <Badge key={b.key} color={DS.primaryDark} bg={DS.primaryLighter} small>
          {b.label}
        </Badge>
      ))}
    </div>
  );
};

// ──── 06-toolbar.js ────
/* ═══════════════════════════════════════════════════════════════
   COLUMN SELECTOR — popover to toggle column visibility
   ═══════════════════════════════════════════════════════════════ */
const ColumnSelector = ({ allColumns, visibleColumns, onChange, open, onToggle }) => {
  if (!open) return null;
  return (
    <div style={{
      position: "absolute", top: "100%", right: 0, marginTop: 4, zIndex: 40,
      background: DS.neutralWhite, borderRadius: 10, padding: "10px 0",
      boxShadow: DS.shadowLg, border: `1px solid ${DS.borderLight}`, width: 220,
      animation: "slideDown 0.12s ease",
    }}>
      <div style={{ padding: "0 14px 8px", ...typo.labelSmall, color: DS.textDisabled, textTransform: "uppercase", letterSpacing: 0.5 }}>Widoczne kolumny</div>
      {allColumns.map(col => {
        const checked = visibleColumns.includes(col.key);
        return (
          <div key={col.key} onClick={() => {
            const next = checked ? visibleColumns.filter(k => k !== col.key) : [...visibleColumns, col.key];
            if (next.length >= 1) onChange(next);
          }} style={{
            padding: "6px 14px", ...S.row, gap: 8, cursor: "pointer",
            background: "transparent", transition: "background 0.1s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = DS.neutralLighter}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{
              width: 16, height: 16, borderRadius: 4,
              border: `1.5px solid ${checked ? DS.primaryLight : DS.borderLight}`,
              background: checked ? DS.primaryLight : "transparent",
              ...S.row, justifyContent: "center", alignItems: "center", flexShrink: 0,
            }}>
              {checked && <Icon name="check" size={10} color="#fff" />}
            </div>
            <span style={{ ...typo.bodySmall, color: DS.textPrimary }}>{col.label}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DOC TYPE FILTER BAR — type tabs + Filtry + Kolumny (Iter 5)
   ═══════════════════════════════════════════════════════════════ */
const DOC_TYPE_TABS = [
  { key: "", label: "Wszystkie" },
  { key: "umowa", label: "Umowy" },
  { key: "faktura", label: "Faktury" },
  { key: "zlecenie", label: "Zlecenia" },
  { key: "zalacznik", label: "Zał." },
  { key: "inne", label: "Inne" },
];

const DocTypeFilterBar = ({ activeType, onTypeChange, filterCount, onToggleFilters, showFilters, allColumns, visibleColumns, onColumnsChange }) => {
  const [showColSelector, setShowColSelector] = useState(false);
  const colBtnRef = useRef(null);
  // close on outside click
  useEffect(() => {
    if (!showColSelector) return;
    const handler = (e) => { if (colBtnRef.current && !colBtnRef.current.contains(e.target)) setShowColSelector(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showColSelector]);
  return (
    <div style={{
      padding: "6px 20px", ...S.row, gap: 8, alignItems: "center",
      borderBottom: `1px solid ${DS.borderLight}`, background: DS.neutralWhite, minHeight: 40,
    }}>
      <div style={{ ...S.row, gap: 2, flex: 1 }}>
        {DOC_TYPE_TABS.map(tab => {
          const active = activeType === tab.key;
          return (
            <button key={tab.key} onClick={() => onTypeChange(tab.key)} style={{
              padding: "5px 12px", border: "none", borderRadius: 6,
              background: active ? DS.primaryLighter : "transparent",
              color: active ? DS.primaryDark : DS.textSecondary,
              fontFamily: DS.fontFamily, fontSize: 12, fontWeight: active ? 600 : 400,
              cursor: "pointer", transition: "all 0.12s", whiteSpace: "nowrap",
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = DS.neutralLighter; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? DS.primaryLighter : "transparent"; }}
            >{tab.label}</button>
          );
        })}
      </div>
      <div style={{ ...S.row, gap: 6 }}>
        <Btn variant={showFilters || filterCount > 0 ? "accent" : "secondary"} icon="filter" small onClick={onToggleFilters}>
          Filtry{filterCount > 0 ? ` (${filterCount})` : ""}
        </Btn>
        <div ref={colBtnRef} style={{ position: "relative" }}>
          <Btn variant="secondary" icon="columns" small onClick={() => setShowColSelector(p => !p)}>Kolumny</Btn>
          <ColumnSelector allColumns={allColumns} visibleColumns={visibleColumns} onChange={onColumnsChange} open={showColSelector} onToggle={() => setShowColSelector(p => !p)} />
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SAVE VIEW MODAL — replaces prompt() for adding custom views
   ═══════════════════════════════════════════════════════════════ */
const SaveViewModal = ({ open, onClose, onSave, filters, visibleColumns, allColumns }) => {
  const [name, setName] = useState("");
  if (!open) return null;
  const activeFilters = Object.entries(filters).filter(([, v]) => Array.isArray(v) ? v.length > 0 : !!v);
  const filterLabels = {
    type: v => Array.isArray(v) ? v.map(t => DOC_TYPES[t]?.label).filter(Boolean).join(", ") : DOC_TYPES[v]?.label,
    status: v => Array.isArray(v) ? v.map(s => DOC_STATUSES[s]?.label).filter(Boolean).join(", ") : DOC_STATUSES[v]?.label,
    dept: v => Array.isArray(v) ? v.join(", ") : v,
    assignee: v => { const u = USERS_LIST.find(u => String(u.id) === v); return u ? u.name : v; },
  };
  const visColNames = allColumns.filter(c => visibleColumns.includes(c.key)).map(c => c.label);
  return (
    <div style={{ ...S.overlay, zIndex: 100 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: DS.neutralWhite, borderRadius: 12, padding: 0, width: 460,
        boxShadow: DS.shadowLg, border: `1px solid ${DS.borderLight}`, overflow: "hidden",
      }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${DS.borderLight}` }}>
          <div style={{ ...typo.titleMedium, color: DS.primaryMain }}>Zapisz nowy widok</div>
          <div style={{ ...typo.bodySmall, color: DS.textSecondary, marginTop: 2 }}>Nadaj nazwę i sprawdź ustawienia widoku</div>
        </div>
        <div style={{ padding: "18px 24px", ...S.col, gap: 16 }}>
          <Field label="Nazwa widoku">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="np. Moje umowy aktywne"
              autoFocus style={{
              width: "100%", padding: "8px 12px", border: `1px solid ${DS.borderLight}`,
              borderRadius: 8, fontFamily: DS.fontFamily, fontSize: 13, outline: "none", boxSizing: "border-box",
            }}
              onFocus={e => e.target.style.borderColor = DS.primaryLight}
              onBlur={e => e.target.style.borderColor = DS.borderLight}
            />
          </Field>
          <div style={{ ...S.col, gap: 8 }}>
            <span style={{ ...typo.labelSmall, color: DS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 }}>Aktywne filtry</span>
            {activeFilters.length > 0 ? (
              <div style={{ ...S.row, gap: 6, flexWrap: "wrap" }}>
                {activeFilters.map(([key, val]) => (
                  <Badge key={key} color={DS.primaryDark} bg={DS.primaryLighter} small>
                    {filterLabels[key]?.(val) || val}
                  </Badge>
                ))}
              </div>
            ) : <span style={{ ...typo.bodySmall, color: DS.textDisabled }}>Brak aktywnych filtrów</span>}
          </div>
          <div style={{ ...S.col, gap: 8 }}>
            <span style={{ ...typo.labelSmall, color: DS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 }}>Widoczne kolumny ({visColNames.length})</span>
            <div style={{ ...S.row, gap: 4, flexWrap: "wrap" }}>
              {visColNames.map(n => <Badge key={n} color={DS.textSecondary} bg={DS.neutralLighter} small>{n}</Badge>)}
            </div>
          </div>
        </div>
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${DS.borderLight}`, ...S.row, justifyContent: "flex-end", gap: 8 }}>
          <Btn variant="ghost" onClick={onClose}>Anuluj</Btn>
          <Btn variant="accent" onClick={() => { if (name.trim()) { onSave(name.trim()); setName(""); } }} disabled={!name.trim()}>Zapisz widok</Btn>
        </div>
      </div>
    </div>
  );
};

// ──── 07-doc-table.js ────
/* ═══════════════════════════════════════════════════════════════
   DOC TABLE — zebra striping, alerts inline, tags +N (merge P1+P2)
   ═══════════════════════════════════════════════════════════════ */
const Checkbox = ({ checked, onChange, indeterminate }) => {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = indeterminate; }, [indeterminate]);
  return (
    <input ref={ref} type="checkbox" checked={checked} onChange={onChange} style={{
      width: 16, height: 16, cursor: "pointer", accentColor: DS.primaryLight,
    }} />
  );
};

const DocTable = ({ docs, onSelectDoc, onInlineAdd, selectedId, sortConfig, onSort, selectedIds, onToggleSelect, onSelectAll, onOpenExport, onOpenFolders, visibleColumns, multiSelectMode, onToggleMultiSelect, onUpdateDoc }) => {
  const [titleColWidth, setTitleColWidth] = useState(null);
  const titleDragRef = useRef(null);
  const handleTitleResize = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    const startX = e.clientX;
    const startW = titleDragRef.current?.parentElement?.offsetWidth || 240;
    const onMove = (ev) => { const diff = ev.clientX - startX; setTitleColWidth(Math.max(180, startW + diff)); };
    const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, []);

  const GROUP_BY_OPTIONS = [
    { id: "dept", label: "Wydziały", icon: "building", extract: d => d.dept || "Bez wydziału" },
    { id: "assignee", label: "Osoby odpowiedzialne", icon: "users", extract: d => { const u = USERS_LIST.find(u => u.id === d.assignee); return u ? u.name : "Nieprzypisane"; } },
    { id: "classification", label: "Klasyfikacja", icon: "barChart", extract: d => d.classification || "Bez klasyfikacji" },
    { id: "contractor", label: "Kontrahent", icon: "building", extract: d => d.contractor || "Bez kontrahenta" },
    { id: "status", label: "Status", icon: "zap", extract: d => { const s = DOC_STATUSES[d.status]; return s ? s.label : d.status || "Brak"; } },
  ];
  const [groupBy, setGroupBy] = useState(null);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const groupByRef = useRef(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [hoveredRow, setHoveredRow] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const toggleExpand = useCallback((docId, e) => {
    e.stopPropagation();
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId); else next.add(docId);
      return next;
    });
  }, []);

  const groupedData = useMemo(() => {
    if (!groupBy) return null;
    const opt = GROUP_BY_OPTIONS.find(o => o.id === groupBy);
    if (!opt) return null;
    const groups = {};
    docs.forEach(d => {
      const key = opt.extract(d);
      if (!groups[key]) groups[key] = [];
      groups[key].push(d);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [docs, groupBy]);

  useEffect(() => {
    if (!showGroupMenu) return;
    const handler = (e) => { if (groupByRef.current && !groupByRef.current.contains(e.target)) setShowGroupMenu(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showGroupMenu]);

  const cols = [
    { key: "type", label: "Typ", w: 100 },
    { key: "alerts", label: "Alerty", w: 60 },
    { key: "number", label: "Numer", w: 126 },
    { key: "nrEwidencyjny", label: "Nr ewid.", w: 100 },
    { key: "title", label: "Przedmiot", flex: 1, min: 180 },
    { key: "contractor", label: "Kontrahent", w: 190 },
    { key: "assignee", label: "Odpow.", w: 56 },
    { key: "dept", label: "Wydział", w: 170 },
    { key: "dateEnd", label: "Data końca", w: 92 },
    { key: "grossValue", label: "Wartość", w: 110 },
    { key: "classification", label: "Klasyfik.", w: 96 },
    { key: "tags", label: "Tagi", w: 120 },
    { key: "status", label: "Status", w: 130 },
  ];

  const filteredCols = cols.filter(c => !visibleColumns || visibleColumns.includes(c.key));
  const colMap = {};
  cols.forEach(c => { colMap[c.key] = c; });
  const colStyle = (colOrKey) => {
    const col = typeof colOrKey === "string" ? colMap[colOrKey] : colOrKey;
    if (!col) return {};
    if (col.flex) {
      if (titleColWidth) return { width: titleColWidth, minWidth: 180, flex: `0 0 ${titleColWidth}px` };
      return { flex: "1 1 180px", minWidth: 180 };
    }
    return { width: col.w, minWidth: col.w, flex: "0 0 auto" };
  };

  const totalGrossValue = useMemo(() => docs.reduce((s, d) => s + (d.grossValue || 0), 0), [docs]);

  const SortIcon = ({ colKey }) => {
    if (sortConfig.key !== colKey) return <Icon name="arrowUpDown" size={11} color={DS.neutralMain} style={{ opacity: 0.4 }} />;
    return <Icon name={sortConfig.dir === "asc" ? "chevronDown" : "chevronDown"} size={11} color={DS.primaryLight}
      style={{ transform: sortConfig.dir === "asc" ? "rotate(180deg)" : "none" }} />;
  };

  const allSelected = docs.length > 0 && docs.every(d => selectedIds.has(d.id));
  const someSelected = docs.some(d => selectedIds.has(d.id)) && !allSelected;

  /* shared props for DocTableRow */
  const rowProps = { selectedId, selectedIds, visibleColumns, multiSelectMode, expandedRows, toggleExpand, hoveredRow, setHoveredRow, setFilePreview, onToggleSelect, onSelectDoc, colStyle, onUpdateDoc };

  return (
    <div style={{ flex: 1, ...S.col, overflow: "hidden" }}>
      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div style={{
          ...S.row, gap: 12, padding: "8px 20px",
          background: DS.primaryLighter, borderBottom: `1px solid ${DS.primaryLight}`,
          animation: "slideDown 0.15s ease",
        }}>
          <span style={{ ...typo.labelMedium, color: DS.primaryDark }}>
            Zaznaczono: {selectedIds.size}
          </span>
          <Btn variant="secondary" icon="edit" small>Zmień status</Btn>
          <Btn variant="secondary" icon="tag" small>Zmień tagi</Btn>
          <Btn variant="secondary" icon="folder" small onClick={onOpenFolders}>Dodaj do folderu</Btn>
          <Btn variant="secondary" icon="download" small onClick={onOpenExport}>Eksport</Btn>
          <div style={{ flex: 1 }} />
          <Btn variant="ghost" icon="x" small onClick={() => onSelectAll(false)}>Odznacz</Btn>
        </div>
      )}

      {/* View bar with Grupuj dropdown */}
      <div style={{
        ...S.row, gap: 6, padding: "6px 20px",
        borderBottom: `1px solid ${DS.borderLight}`, background: DS.neutralLighter,
      }}>
        <span style={{ ...typo.labelSmall, color: DS.textSecondary, marginRight: 4 }}>Widok:</span>
        <button onClick={onToggleMultiSelect} style={{
          ...S.row, gap: 4, padding: "3px 10px", borderRadius: 6,
          border: `1px solid ${multiSelectMode ? DS.primaryLight : DS.borderLight}`,
          background: multiSelectMode ? DS.primaryLighter : DS.neutralWhite,
          color: multiSelectMode ? DS.primaryDark : DS.textSecondary,
          cursor: "pointer", ...typo.labelSmall, fontFamily: DS.fontFamily, transition: "all 0.15s",
        }}>
          <Icon name="check" size={12} color={multiSelectMode ? DS.primaryLight : DS.textDisabled} />
          Zaznacz wiele
        </button>
        <div style={{ position: "relative" }} ref={groupByRef}>
          <button onClick={() => setShowGroupMenu(p => !p)} style={{
            ...S.row, gap: 4, padding: "3px 10px", borderRadius: 6,
            border: `1px solid ${groupBy ? DS.primaryLight : DS.borderLight}`,
            background: groupBy ? DS.primaryLighter : DS.neutralWhite,
            color: groupBy ? DS.primaryDark : DS.textSecondary,
            cursor: "pointer", ...typo.labelSmall, fontFamily: DS.fontFamily, transition: "all 0.15s",
          }}>
            <Icon name="layers" size={12} color={groupBy ? DS.primaryLight : DS.textDisabled} />
            {groupBy ? ("Grupuj: " + (GROUP_BY_OPTIONS.find(o => o.id === groupBy)?.label || "")) : "Grupuj"}
            <Icon name="chevronDown" size={10} color={groupBy ? DS.primaryLight : DS.textDisabled} />
          </button>
          {showGroupMenu && <div style={{
            position: "absolute", top: "100%", left: 0, marginTop: 4, zIndex: 100,
            background: DS.neutralWhite, borderRadius: 8, border: `1px solid ${DS.borderLight}`,
            boxShadow: DS.shadow2, minWidth: 200, padding: "4px 0",
          }}>
            {GROUP_BY_OPTIONS.map(opt => (
              <div key={opt.id} onClick={() => { setGroupBy(opt.id); setShowGroupMenu(false); }} style={{
                ...S.row, gap: 8, padding: "8px 14px", cursor: "pointer",
                background: groupBy === opt.id ? DS.primaryLighter : "transparent",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = DS.neutralLighter}
              onMouseLeave={e => e.currentTarget.style.background = groupBy === opt.id ? DS.primaryLighter : "transparent"}
              >
                <Icon name={opt.icon} size={13} color={groupBy === opt.id ? DS.primaryLight : DS.textSecondary} />
                <span style={{ ...typo.bodySmall, color: groupBy === opt.id ? DS.primaryDark : DS.textPrimary }}>{opt.label}</span>
                {groupBy === opt.id && <Icon name="check" size={12} color={DS.primaryLight} style={{ marginLeft: "auto" }} />}
              </div>
            ))}
            {groupBy && <>
              <div style={{ height: 1, background: DS.borderLight, margin: "4px 0" }} />
              <div onClick={() => { setGroupBy(null); setShowGroupMenu(false); }} style={{
                ...S.row, gap: 8, padding: "8px 14px", cursor: "pointer", transition: "background 0.1s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = DS.neutralLighter}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <Icon name="x" size={13} color={DS.textSecondary} />
                <span style={{ ...typo.bodySmall, color: DS.textSecondary }}>Wyłącz grupowanie</span>
              </div>
            </>}
          </div>}
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ ...typo.labelSmall, color: DS.textDisabled }}>{docs.length} dok.</span>
      </div>

      {/* Table header + body with horizontal scroll */}
      <div style={{ flex: 1, overflowX: "auto", overflowY: "auto" }}>
      <div style={{ minWidth: filteredCols.reduce((s, c) => s + (c.w || c.min || 100), 0) + 40 + 28 + 60 }}>
      <div style={{
        ...S.row, padding: "0 20px",
        borderBottom: `2px solid ${DS.borderLight}`, background: DS.neutralWhite,
        minHeight: 38, position: "sticky", top: 0, zIndex: 2,
      }}>
        <div style={{ width: 28, minWidth: 28, flex: "0 0 auto" }} />
        {multiSelectMode && <div style={{ width: 36, padding: "8px 6px" }}>
          <Checkbox checked={allSelected} indeterminate={someSelected}
            onChange={() => onSelectAll(!allSelected)} />
        </div>}
        {filteredCols.map(col => (
          <div key={col.key} style={{
            ...colStyle(col), padding: col.key === "grossValue" ? "4px 6px" : "8px 6px", position: "relative",
            ...(col.key === "grossValue" ? { ...S.col, alignItems: "flex-end", justifyContent: "center", cursor: "pointer", userSelect: "none" } : { ...S.row, gap: 4, cursor: "pointer", userSelect: "none" }),
          }} onClick={() => onSort(col.key)}>
            {col.key === "grossValue" ? <>
              <div style={{ ...S.row, gap: 4 }}>
                <span style={{ ...typo.labelSmall, color: DS.textDisabled, textTransform: "uppercase", letterSpacing: 0.5 }}>{col.label}</span>
                <SortIcon colKey={col.key} />
              </div>
              <span style={{ ...typo.labelSmall, color: DS.primaryMain, fontWeight: 600, fontSize: 11, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(totalGrossValue)}</span>
            </> : <>
              <span style={{ ...typo.labelSmall, color: DS.textDisabled, textTransform: "uppercase", letterSpacing: 0.5 }}>{col.label}</span>
              <SortIcon colKey={col.key} />
            </>}
            {col.key === "title" && <div ref={titleDragRef} onMouseDown={handleTitleResize} onClick={e => e.stopPropagation()}
              style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 5, cursor: "col-resize", background: "transparent", zIndex: 3 }}
              onMouseEnter={e => e.currentTarget.style.background = DS.primaryLight + "40"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"} />}
          </div>
        ))}
        <div style={{ width: 60, minWidth: 60, flex: "0 0 auto", padding: "8px 6px" }} />
      </div>

      {/* Table body — rows via DocTableRow */}
      <div>
        {(() => {
          if (groupBy && groupedData) {
            let globalIdx = 0;
            return groupedData.map(([groupLabel, groupDocs]) => {
              const totalValue = groupDocs.reduce((s, d) => s + (d.grossValue || 0), 0);
              return (
              <div key={groupLabel}>
                <div style={{
                  ...S.row, gap: 8, padding: "8px 20px",
                  background: DS.primaryLighter, borderBottom: `1px solid ${DS.borderLight}`,
                  position: "sticky", top: 0, zIndex: 1,
                }}>
                  <Icon name="layers" size={13} color={DS.primaryMain} />
                  <span style={{ ...typo.labelMedium, color: DS.primaryMain, fontWeight: 600 }}>{groupLabel}</span>
                  <Badge color={DS.textDisabled} bg={DS.neutralLight} small>{groupDocs.length} dok.</Badge>
                  {totalValue > 0 && <span style={{ ...typo.labelSmall, color: DS.primaryMain, fontWeight: 500, marginLeft: 4 }}>
                    {formatCurrency(totalValue)}
                  </span>}
                </div>
                {groupDocs.map(doc => <DocTableRow key={doc.id} doc={doc} idx={globalIdx++} {...rowProps} />)}
              </div>
            );});
          }
          return docs.map((doc, idx) => <DocTableRow key={doc.id} doc={doc} idx={idx} {...rowProps} />);
        })()}
      </div>

      {/* Inline add row */}
      <div onClick={onInlineAdd} style={{
        ...S.row, padding: "0 20px",
        minHeight: 44, cursor: "pointer", transition: "background 0.1s",
        background: DS.neutralWhite, borderTop: `1px dashed ${DS.primaryLight}`,
        flexShrink: 0,
      }}
        onMouseEnter={e => e.currentTarget.style.background = DS.primaryLighter}
        onMouseLeave={e => e.currentTarget.style.background = DS.neutralWhite}
      >
        {multiSelectMode && <div style={{ width: 36 }} />}
        <div style={{ ...S.row, gap: 8, padding: "8px 8px" }}>
          <Icon name="plus" size={15} color={DS.primaryLight} />
          <span style={{ ...typo.bodySmall, color: DS.primaryLight, fontWeight: 500 }}>Dodaj dokument</span>
        </div>
      </div>
      </div>{/* close minWidth wrapper */}
      </div>{/* close scroll container */}

      {/* File preview modal */}
      {filePreview && (
        <div style={{ ...S.overlay, zIndex: 200 }} onClick={() => setFilePreview(null)}>
          <div style={{
            background: DS.neutralWhite, borderRadius: 12, width: 560, maxWidth: "90vw",
            maxHeight: "80vh", ...S.col, boxShadow: DS.shadow3,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ ...S.rowBetween, padding: "16px 20px", borderBottom: `1px solid ${DS.borderLight}` }}>
              <div style={{ ...S.col, gap: 2 }}>
                <span style={{ ...typo.h4, color: DS.textPrimary }}>{filePreview.title}</span>
                {filePreview.number && <span style={{ ...typo.bodySmall, color: DS.textSecondary }}>{filePreview.number}</span>}
              </div>
              <button onClick={() => setFilePreview(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <Icon name="x" size={18} color={DS.textSecondary} />
              </button>
            </div>
            <div style={{ flex: 1, padding: 20, ...S.col, alignItems: "center", justifyContent: "center", gap: 16, minHeight: 300 }}>
              {filePreview.fileName ? (
                <>
                  <div style={{ width: 80, height: 80, borderRadius: 12, background: DS.neutralLighter, ...S.row, justifyContent: "center", alignItems: "center" }}>
                    <Icon name={filePreview.fileName.endsWith(".pdf") ? "file" : "paperclip"} size={32} color={DS.textDisabled} />
                  </div>
                  <div style={{ ...S.col, alignItems: "center", gap: 4 }}>
                    <span style={{ ...typo.bodyMedium, fontWeight: 600, color: DS.textPrimary }}>{filePreview.fileName}</span>
                    <span style={{ ...typo.bodySmall, color: DS.textDisabled }}>{filePreview.fileSize}</span>
                  </div>
                  <div style={{ ...S.row, gap: 8, marginTop: 8 }}>
                    <button style={{
                      ...S.row, gap: 6, padding: "8px 20px", borderRadius: 8,
                      background: DS.primaryLight, color: "#fff", border: "none",
                      cursor: "pointer", ...typo.labelMedium, fontFamily: DS.fontFamily, fontWeight: 600,
                    }}>
                      <Icon name="eye" size={14} color="#fff" /> Otwórz
                    </button>
                    <button style={{
                      ...S.row, gap: 6, padding: "8px 20px", borderRadius: 8,
                      background: DS.neutralWhite, color: DS.textSecondary, border: `1px solid ${DS.borderLight}`,
                      cursor: "pointer", ...typo.labelMedium, fontFamily: DS.fontFamily, fontWeight: 500,
                    }}>
                      <Icon name="download" size={14} color={DS.textSecondary} /> Pobierz
                    </button>
                  </div>
                  <span style={{ ...typo.labelSmall, color: DS.textDisabled, marginTop: 8 }}>
                    Podgląd pliku — prototyp
                  </span>
                </>
              ) : (
                <div style={{ ...S.col, alignItems: "center", gap: 8, padding: 20 }}>
                  <span style={{ ...typo.bodyMedium, color: DS.textPrimary }}>Szczegóły dokumentu</span>
                  {filePreview.grossValue > 0 && <span style={{ ...typo.bodySmall, color: DS.textSecondary }}>Wartość: {formatCurrency(filePreview.grossValue)}</span>}
                  {filePreview.contractor && <span style={{ ...typo.bodySmall, color: DS.textSecondary }}>Kontrahent: {filePreview.contractor}</span>}
                  {filePreview.status && <span style={{ ...typo.bodySmall, color: DS.textSecondary }}>Status: {(DOC_STATUSES[filePreview.status] || {}).label || filePreview.status}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ──── 08-doc-table-row.js ────
/* ═══════════════════════════════════════════════════════════════
   DOC TABLE ROW — single row + expanded children (extracted from DocTable)
   ═══════════════════════════════════════════════════════════════ */
const EDITABLE_COLS = ["type", "number", "nrEwidencyjny", "title", "contractor", "dept", "dateEnd", "grossValue", "status"];

const DocTableRow = ({ doc, idx, selectedId, selectedIds, visibleColumns, multiSelectMode, expandedRows, toggleExpand, hoveredRow, setHoveredRow, setFilePreview, onToggleSelect, onSelectDoc, colStyle, onUpdateDoc }) => {
  const typeInfo = DOC_TYPES[doc.type] || DOC_TYPES.inne;
  const statusInfo = DOC_STATUSES[doc.status] || null;
  const isSelected = selectedId === doc.id;
  const isChecked = selectedIds.has(doc.id);
  const isZebra = idx % 2 === 1;
  const docAlerts = computeAlerts(doc);
  const docTags = (doc.tags || []).map(t => TAGS.find(tt => tt.id === t)).filter(Boolean);
  const visibleTags = docTags.slice(0, 2);
  const extraTags = docTags.length - 2;
  const vc = visibleColumns || [];
  const showCol = (key) => !visibleColumns || vc.includes(key);
  const children = CHILD_DOCS[doc.id] || [];
  const hasChildren = children.length > 0;
  const isExpanded = expandedRows.has(doc.id);
  const isHovered = hoveredRow === doc.id;

  // Inline editing state
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState(null);
  const tabMovingRef = useRef(false);

  const visibleEditableCols = EDITABLE_COLS.filter(k => showCol(k));

  const commitEdit = useCallback((key, value) => {
    if (onUpdateDoc && value !== doc[key]) {
      const finalValue = key === "grossValue" ? (parseFloat(value) || 0) : value;
      onUpdateDoc(doc.id, key, finalValue);
    }
  }, [doc, onUpdateDoc]);

  const startEdit = useCallback((key, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    setEditingCell(key);
    setEditValue(key === "grossValue" ? (doc[key] || 0) : (doc[key] || ""));
  }, [doc]);

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue(null);
  }, []);

  const handleKeyDown = useCallback((e, key) => {
    if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit(key, editValue);
      setEditingCell(null);
      setEditValue(null);
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      commitEdit(key, editValue);
      const curIdx = visibleEditableCols.indexOf(key);
      const nextIdx = e.shiftKey ? curIdx - 1 : curIdx + 1;
      if (nextIdx >= 0 && nextIdx < visibleEditableCols.length) {
        const nextKey = visibleEditableCols[nextIdx];
        tabMovingRef.current = true;
        setEditingCell(nextKey);
        setEditValue(nextKey === "grossValue" ? (doc[nextKey] || 0) : (doc[nextKey] || ""));
      } else {
        setEditingCell(null);
        setEditValue(null);
      }
    }
  }, [editValue, visibleEditableCols, commitEdit, cancelEdit, doc]);

  const handleBlur = useCallback((key) => {
    // Small delay to allow Tab handler to set tabMovingRef first
    setTimeout(() => {
      if (tabMovingRef.current) {
        tabMovingRef.current = false;
        return;
      }
      commitEdit(key, editValue);
      setEditingCell(null);
      setEditValue(null);
    }, 0);
  }, [editValue, commitEdit]);

  const inputStyle = {
    width: "100%", padding: "2px 4px", border: `1px solid ${DS.primaryLight}`,
    borderRadius: 4, background: DS.neutralWhite, fontFamily: DS.fontFamily,
    fontSize: 13, color: DS.textPrimary, outline: "none", boxSizing: "border-box",
  };

  const renderEditInput = (key) => {
    // Select for type
    if (key === "type") {
      return <select value={editValue} onChange={e => setEditValue(e.target.value)}
        onKeyDown={e => handleKeyDown(e, key)} onBlur={() => handleBlur(key)}
        autoFocus style={{ ...inputStyle, cursor: "pointer" }}>
        {Object.entries(DOC_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
      </select>;
    }
    // Select for contractor
    if (key === "contractor") {
      return <select value={editValue} onChange={e => setEditValue(e.target.value)}
        onKeyDown={e => handleKeyDown(e, key)} onBlur={() => handleBlur(key)}
        autoFocus style={{ ...inputStyle, cursor: "pointer" }}>
        <option value="">— brak —</option>
        {CONTRACTORS.map(c => <option key={c} value={c}>{c}</option>)}
      </select>;
    }
    // Select for dept
    if (key === "dept") {
      return <select value={editValue} onChange={e => setEditValue(e.target.value)}
        onKeyDown={e => handleKeyDown(e, key)} onBlur={() => handleBlur(key)}
        autoFocus style={{ ...inputStyle, cursor: "pointer" }}>
        <option value="">— brak —</option>
        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
      </select>;
    }
    // Select for status — filtered by document type
    if (key === "status") {
      const allowedStatuses = DOC_TYPE_STATUSES[doc.type] || [];
      if (allowedStatuses.length === 0) return <span style={{ ...typo.bodySmall, color: DS.textDisabled }}>—</span>;
      return <select value={editValue} onChange={e => setEditValue(e.target.value)}
        onKeyDown={e => handleKeyDown(e, key)} onBlur={() => handleBlur(key)}
        autoFocus style={{ ...inputStyle, cursor: "pointer" }}>
        {allowedStatuses.map(k => <option key={k} value={k}>{DOC_STATUSES[k]?.label || k}</option>)}
      </select>;
    }
    // Date input
    if (key === "dateEnd") {
      return <input type="date" value={editValue || ""} onChange={e => setEditValue(e.target.value)}
        onKeyDown={e => handleKeyDown(e, key)} onBlur={() => handleBlur(key)}
        autoFocus style={inputStyle} />;
    }
    // Number input
    if (key === "grossValue") {
      return <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)}
        onKeyDown={e => handleKeyDown(e, key)} onBlur={() => handleBlur(key)}
        autoFocus onFocus={e => e.target.select()} step="0.01" style={{ ...inputStyle, textAlign: "right" }} />;
    }
    // Default text input
    return <input type="text" value={editValue} onChange={e => setEditValue(e.target.value)}
      onKeyDown={e => handleKeyDown(e, key)} onBlur={() => handleBlur(key)}
      autoFocus onFocus={e => e.target.select()} style={inputStyle} />;
  };

  const editableCellProps = (key) => {
    if (!onUpdateDoc || !EDITABLE_COLS.includes(key)) return {};
    return {
      onDoubleClick: (e) => startEdit(key, e),
    };
  };

  const editCellBg = DS.primaryLighter;

  return (
    <React.Fragment>
    <div onClick={() => onSelectDoc(doc)}
      draggable onDragStart={e => { e.dataTransfer.setData("text/plain", String(doc.id)); e.dataTransfer.effectAllowed = "move"; }}
      onMouseEnter={e => { setHoveredRow(doc.id); if (!isSelected && !isExpanded) e.currentTarget.style.background = DS.primaryLighter; }}
      onMouseLeave={e => { setHoveredRow(null); if (!isSelected && !isExpanded) e.currentTarget.style.background = isChecked ? `${DS.primaryLight}08` : isZebra ? DS.neutralLighter : DS.neutralWhite; }}
      style={{
      ...S.row, padding: "0 20px", position: "relative",
      minHeight: 48, cursor: "pointer", transition: "background 0.1s",
      background: isSelected ? DS.primaryLighter : isExpanded ? `${DS.primaryMain}06` : isChecked ? `${DS.primaryLight}08` : isZebra ? DS.neutralLighter : DS.neutralWhite,
      borderBottom: `1px solid ${DS.borderLight}`,
      borderLeft: isSelected ? `3px solid ${DS.primaryLight}` : isExpanded ? `3px solid ${DS.primaryMain}40` : "3px solid transparent",
    }}
    >
        {/* Expand chevron column */}
      <div style={{ width: 28, minWidth: 28, flex: "0 0 auto", padding: "8px 2px 8px 0", ...S.row, justifyContent: "center" }}>
        {hasChildren && (
          <div onClick={(e) => { e.stopPropagation(); toggleExpand(doc.id, e); }}
            onMouseEnter={e => { e.currentTarget.style.background = DS.primaryLighter; e.currentTarget.style.border = `1px solid ${DS.primaryLight}`; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.border = "1px solid transparent"; }}
            style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 4, border: "1px solid transparent", transition: "all 0.15s" }}>
            <Icon name={isExpanded ? "chevronDown" : "chevronRight"} size={13} color={DS.primaryMain} style={{ transition: "transform 0.15s" }} />
          </div>
        )}
      </div>
      {multiSelectMode && <div style={{ width: 36, padding: "8px 6px" }} onClick={e => e.stopPropagation()}>
        <Checkbox checked={isChecked} onChange={() => onToggleSelect(doc.id)} />
      </div>}
      {showCol("type") && <div style={{ ...colStyle("type"), padding: "8px 6px", ...S.row, gap: 4, background: editingCell === "type" ? editCellBg : undefined }} {...editableCellProps("type")}>
        {editingCell === "type" ? renderEditInput("type") : <>
          <Icon name={typeInfo.icon} size={14} color={DS.neutralMain} />
          <span style={{ ...typo.bodySmall, color: DS.textSecondary, ...S.truncate }}>{typeInfo.label}</span>
        </>}
      </div>}
      {showCol("alerts") && <div style={{ ...colStyle("alerts"), padding: "8px 4px", ...S.row, gap: 3, justifyContent: "center" }}>
        {docAlerts.length > 0 ? docAlerts.map(code => <AlertBadge key={code} code={code} />) : <span style={{ color: DS.textDisabled }}>—</span>}
      </div>}
      {showCol("number") && <div style={{ ...colStyle("number"), padding: "8px 6px", background: editingCell === "number" ? editCellBg : undefined }} {...editableCellProps("number")}>
        {editingCell === "number" ? renderEditInput("number") :
          <span style={{ ...typo.bodySmall, color: DS.textSecondary, fontFamily: "monospace", ...S.truncate, display: "block", fontSize: 12 }}>{doc.number || "—"}</span>}
      </div>}
      {showCol("nrEwidencyjny") && <div style={{ ...colStyle("nrEwidencyjny"), padding: "8px 6px", background: editingCell === "nrEwidencyjny" ? editCellBg : undefined }} {...editableCellProps("nrEwidencyjny")}>
        {editingCell === "nrEwidencyjny" ? renderEditInput("nrEwidencyjny") :
          <span style={{ ...typo.bodySmall, color: doc.nrEwidencyjny ? DS.primaryDark : DS.textDisabled, fontFamily: "monospace", ...S.truncate, display: "block", fontSize: 11, fontWeight: doc.nrEwidencyjny ? 600 : 400 }}>{doc.nrEwidencyjny || "—"}</span>}
      </div>}
      {showCol("title") && <div style={{ ...colStyle("title"), padding: "8px 6px", background: editingCell === "title" ? editCellBg : undefined }} {...editableCellProps("title")}>
        {editingCell === "title" ? renderEditInput("title") :
          <span style={{ ...typo.bodySmall, fontWeight: 500, color: DS.textPrimary, ...S.truncate, display: "block" }}>
            {doc.title || "Bez tytułu"}
          </span>}
      </div>}
      {showCol("contractor") && <div style={{ ...colStyle("contractor"), padding: "8px 6px", background: editingCell === "contractor" ? editCellBg : undefined }} {...editableCellProps("contractor")}>
        {editingCell === "contractor" ? renderEditInput("contractor") :
          <span style={{ ...typo.bodySmall, color: DS.textSecondary, ...S.truncate, display: "block" }}>
            {doc.contractor || "—"}
          </span>}
      </div>}
      {showCol("assignee") && <div style={{ ...colStyle("assignee"), padding: "8px 4px", ...S.row, justifyContent: "center" }}>
        {(() => { const u = USERS_LIST.find(u => u.id === doc.assignee); return u ? (
          <div title={u.name} style={{ width: 26, height: 26, borderRadius: "50%", background: DS.primaryLighter, ...S.row, justifyContent: "center", alignItems: "center" }}>
            <span style={{ ...typo.labelSmall, color: DS.primaryDark, fontWeight: 600, fontSize: 10 }}>{u.initials}</span>
          </div>
        ) : <span style={{ ...typo.labelSmall, color: DS.textDisabled }}>—</span>; })()}
      </div>}
      {showCol("dept") && <div style={{ ...colStyle("dept"), padding: "8px 6px", background: editingCell === "dept" ? editCellBg : undefined }} {...editableCellProps("dept")}>
        {editingCell === "dept" ? renderEditInput("dept") :
          <span style={{ ...typo.bodySmall, color: DS.textSecondary, ...S.truncate, display: "block" }}>
            {doc.dept}
          </span>}
      </div>}
      {showCol("dateEnd") && <div style={{ ...colStyle("dateEnd"), padding: "8px 6px", background: editingCell === "dateEnd" ? editCellBg : undefined }} {...editableCellProps("dateEnd")}>
        {editingCell === "dateEnd" ? renderEditInput("dateEnd") :
          <span style={{ ...typo.bodySmall, color: DS.textSecondary }}>{doc.dateEnd ? formatDate(doc.dateEnd) : "—"}</span>}
      </div>}
      {showCol("grossValue") && <div style={{ ...colStyle("grossValue"), padding: "8px 6px", textAlign: "right", background: editingCell === "grossValue" ? editCellBg : undefined }} {...editableCellProps("grossValue")}>
        {editingCell === "grossValue" ? renderEditInput("grossValue") :
          <span style={{ ...typo.bodySmall, fontWeight: 500, color: DS.textPrimary, fontVariantNumeric: "tabular-nums" }}>
            {doc.grossValue ? formatCurrency(doc.grossValue) : "—"}
          </span>}
      </div>}
      {showCol("classification") && <div style={{ ...colStyle("classification"), padding: "8px 6px" }}>
        <span style={{ ...typo.labelSmall, color: DS.textSecondary, ...S.truncate, display: "block" }}>
          {doc.classification || "—"}
        </span>
      </div>}
      {showCol("tags") && <div style={{ ...colStyle("tags"), padding: "8px 4px", ...S.row, gap: 3, flexWrap: "wrap" }}>
        {visibleTags.map(tag => (
          <Badge key={tag.id} color={tag.color} bg={tag.color + "18"} small>{tag.label}</Badge>
        ))}
        {extraTags > 0 && <span style={{ ...typo.labelSmall, color: DS.textDisabled, fontWeight: 500 }}>+{extraTags}</span>}
      </div>}
      {showCol("status") && <div style={{ ...colStyle("status"), padding: "8px 6px", background: editingCell === "status" ? editCellBg : undefined }} {...editableCellProps("status")}>
        {editingCell === "status" ? renderEditInput("status") :
          statusInfo ? <Badge color={statusInfo.color} bg={statusInfo.bg}>{statusInfo.label}</Badge> : <span style={{ ...typo.bodySmall, color: DS.textDisabled }}>—</span>}
      </div>}
      {/* Actions column — children counter only */}
      <div style={{ width: 60, minWidth: 60, flex: "0 0 auto", padding: "8px 6px", ...S.row, gap: 6, justifyContent: "flex-end" }}>
        {hasChildren && !isExpanded && (
          <span style={{
            ...typo.labelSmall, color: DS.primaryMain, fontWeight: 500,
            background: DS.primaryLighter, padding: "2px 7px", borderRadius: 10,
            whiteSpace: "nowrap", fontSize: 10,
          }}>
            <Icon name="paperclip" size={9} color={DS.primaryMain} style={{ marginRight: 2 }} />
            {children.length}
          </span>
        )}
      </div>
    </div>
    {/* Expanded children area */}
    {isExpanded && hasChildren && (() => {
      const grouped = {};
      children.forEach(c => {
        const ct = c.childType || "inne";
        if (!grouped[ct]) grouped[ct] = [];
        grouped[ct].push(c);
      });
      const typeOrder = ["faktura", "aneks", "zalacznik", "plik"];
      return (
        <div style={{ background: `${DS.primaryMain}04`, borderLeft: `3px solid ${DS.primaryMain}30`, borderBottom: `1px solid ${DS.borderLight}` }}>
          {/* Podpięte dokumenty header */}
          <div style={{ ...S.row, gap: 6, padding: "8px 20px 4px 40px" }}>
            <span style={{ ...typo.labelSmall, color: DS.textDisabled, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, fontSize: 10 }}>
              Podpięte dokumenty ({children.length})
            </span>
          </div>
          {typeOrder.filter(t => grouped[t]).map(ct => {
            const ctInfo = CHILD_TYPE_LABELS[ct] || { label: ct.toUpperCase(), icon: "file", color: DS.neutralDark };
            return (
              <div key={ct}>
                <div style={{ ...S.row, gap: 6, padding: "6px 20px 2px 48px" }}>
                  <span style={{ ...typo.labelSmall, color: ctInfo.color, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, fontSize: 10 }}>
                    {ctInfo.label} ({grouped[ct].length})
                  </span>
                </div>
                {grouped[ct].map(child => {
                  const childStatus = DOC_STATUSES[child.status] || null;
                  const childType = DOC_TYPES[child.type] || DOC_TYPES.inne;
                  return (
                    <div key={child.id} style={{
                      ...S.row, padding: "0 20px 0 56px", minHeight: 40,
                      borderBottom: `1px solid ${DS.borderLight}08`, transition: "background 0.1s",
                      cursor: child.fileName ? "pointer" : "default",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = `${DS.primaryMain}08`}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    onClick={child.fileName ? () => setFilePreview(child) : undefined}
                    >
                      <div style={{ width: 28, ...S.row, justifyContent: "center", flexShrink: 0 }}>
                        <Icon name={ct === "plik" ? "file" : ctInfo.icon} size={13} color={ctInfo.color + "90"} />
                      </div>
                      {child.number && (
                        <div style={{ width: 140, padding: "6px 6px", flexShrink: 0 }}>
                          <span style={{ ...typo.bodySmall, color: DS.textSecondary, fontFamily: "monospace", fontSize: 11 }}>{child.number}</span>
                        </div>
                      )}
                      <div style={{ flex: 1, padding: "6px 6px", minWidth: 0 }}>
                        <span style={{ ...typo.bodySmall, color: DS.textPrimary, ...S.truncate, display: "block", fontSize: 12.5 }}>
                          {child.title}
                        </span>
                      </div>
                      {child.grossValue > 0 && (
                        <div style={{ width: 110, padding: "6px 6px", textAlign: "right", flexShrink: 0 }}>
                          <span style={{ ...typo.bodySmall, fontWeight: 500, color: DS.textPrimary, fontVariantNumeric: "tabular-nums", fontSize: 12 }}>
                            {formatCurrency(child.grossValue)}
                          </span>
                        </div>
                      )}
                      {child.fileName && (
                        <div style={{ ...S.row, gap: 4, padding: "6px 6px", flexShrink: 0 }}>
                          <Icon name="eye" size={11} color={DS.textDisabled} />
                          <span style={{ ...typo.labelSmall, color: DS.textDisabled, fontSize: 10 }}>{child.fileSize}</span>
                        </div>
                      )}
                      {childStatus && (
                        <div style={{ width: 120, padding: "6px 6px", textAlign: "right", flexShrink: 0 }}>
                          <Badge color={childStatus.color} bg={childStatus.bg} small>{childStatus.label}</Badge>
                        </div>
                      )}
                      {/* Szczegóły link for child */}
                      <div style={{ width: 70, padding: "6px 4px", textAlign: "right", flexShrink: 0 }}>
                        <span onClick={(e) => { e.stopPropagation(); if (child.fileName) setFilePreview(child); }}
                          style={{ ...typo.labelSmall, color: DS.primaryLight, cursor: "pointer", fontWeight: 500, fontSize: 11 }}>
                          {child.fileName ? "Podgląd" : "Szczeg."}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      );
    })()}
    </React.Fragment>
  );
};

// ──── 09-drawer-detail.js ────
/* ═══════════════════════════════════════════════════════════════
   DRAWER DETAIL — inline side panel with tabs
   Szczegóły | Faktury | Załączniki | Zaangażowanie
   ═══════════════════════════════════════════════════════════════ */
const DrawerDetail = ({ doc, onClose, onSave }) => {
  const [mode, setMode] = useState("preview"); // preview | edit
  const [activeTab, setActiveTab] = useState("details");
  const [form, setForm] = useState(null);

  useEffect(() => {
    setMode("preview");
    setActiveTab("details");
    if (doc) setForm({ ...doc });
  }, [doc?.id]);

  // Close on Escape
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  if (!doc) return null;

  const typeInfo = DOC_TYPES[doc.type] || DOC_TYPES.inne;
  const statusInfo = DOC_STATUSES[doc.status] || null;
  const user = USERS_LIST.find(u => u.id === doc.assignee);
  const cls = CLASSIFICATIONS.find(c => c.code === doc.classification);
  const docAlerts = computeAlerts(doc);
  const children = CHILD_DOCS[doc.id] || [];

  // Categorize children
  const childFaktury = children.filter(c => c.childType === "faktura");
  const childZalaczniki = children.filter(c => c.childType === "zalacznik" || c.childType === "plik");

  const set = (key, val) => setForm(prev => {
    const next = { ...prev, [key]: val };
    if (key === "netValue") next.grossValue = Math.round(val * 1.23 * 100) / 100;
    return next;
  });

  const handleSaveEdit = () => {
    onSave(form);
    setMode("preview");
  };

  /* ---- Field row helper ---- */
  const FieldRow = ({ label, value }) => (
    <div style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: `1px solid ${DS.borderLight}` }}>
      <div style={{ width: 140, flexShrink: 0 }}>
        <span style={{ ...typo.labelSmall, color: DS.textDisabled, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
      </div>
      <div style={{ flex: 1, ...typo.bodySmall, color: DS.textPrimary }}>{value || "—"}</div>
    </div>
  );

  /* ---- Tabs definition ---- */
  const tabs = [
    { id: "details", label: "Szczegóły" },
    { id: "faktury", label: "Faktury", count: childFaktury.length },
    { id: "zalaczniki", label: "Załączniki", count: childZalaczniki.length },
    { id: "zaangazowanie", label: "Zaangażowanie" },
  ];

  /* ---- Budget / Zaangażowanie content ---- */
  const BudgetContent = () => {
    if (!cls) return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <Icon name="dollarSign" size={36} color={DS.neutralLight} style={{ margin: "0 auto 12px", display: "block" }} />
        <div style={{ ...typo.titleSmall, color: DS.textSecondary }}>Brak klasyfikacji</div>
        <div style={{ ...typo.bodySmall, color: DS.textDisabled, marginTop: 4 }}>Przypisz klasyfikację budżetową</div>
      </div>
    );
    const pct = Math.round((cls.used / cls.budget) * 100);
    const remaining = cls.budget - cls.used;
    const trafficColor = pct > 90 ? DS.errorMain : pct > 70 ? DS.warningMain : DS.successMain;
    const trafficBg = pct > 90 ? DS.errorLighter : pct > 70 ? DS.warningLighter : DS.successLighter;
    return (
      <>
        {/* Top summary card */}
        <div style={{ padding: "16px", background: DS.neutralLighter, borderRadius: 10, border: `1px solid ${DS.borderLight}`, marginBottom: 16 }}>
          <div style={{ ...S.row, gap: 8, marginBottom: 10, justifyContent: "space-between" }}>
            <span style={{ ...typo.labelMedium, color: DS.primaryMain, fontWeight: 600 }}>Kontekst budżetowy: {cls.code}</span>
            <Badge color={trafficColor} bg={trafficBg}>{pct <= 70 ? "OK" : pct <= 90 ? "Uwaga" : "Przekroczenie"}</Badge>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ ...typo.labelSmall, color: DS.textDisabled, marginBottom: 2 }}>Plan</div>
              <div style={{ ...typo.titleSmall, color: DS.primaryMain, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(cls.budget)}</div>
            </div>
            <div>
              <div style={{ ...typo.labelSmall, color: DS.textDisabled, marginBottom: 2 }}>Zaangażowane</div>
              <div style={{ ...typo.titleSmall, color: DS.textPrimary, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(cls.used)}</div>
            </div>
            <div>
              <div style={{ ...typo.labelSmall, color: remaining > 0 ? DS.successDark : DS.errorDark, marginBottom: 2 }}>Zostaje</div>
              <div style={{ ...typo.titleSmall, color: remaining > 0 ? DS.successDark : DS.errorDark, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(remaining)}</div>
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ padding: "14px 16px", background: DS.neutralLighter, borderRadius: 10, border: `1px solid ${DS.borderLight}` }}>
          <div style={{ ...S.row, justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ ...typo.labelSmall, color: DS.textSecondary }}>{cls.code} — {cls.label}</span>
            <span style={{ ...typo.labelSmall, color: DS.textPrimary, fontWeight: 600 }}>{pct}%</span>
          </div>
          <div style={{ height: 8, background: DS.neutralLight, borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, borderRadius: 4, background: trafficColor, transition: "width 0.3s" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, ...typo.labelSmall }}>
            <div><span style={{ color: DS.textDisabled }}>Plan: </span><span style={{ color: DS.textPrimary }}>{formatCurrency(cls.budget)}</span></div>
            <div><span style={{ color: DS.textDisabled }}>Zaangażowane: </span><span style={{ color: DS.textPrimary }}>{formatCurrency(cls.used)}</span></div>
            <div><span style={{ color: DS.textDisabled }}>Pozostaje: </span><span style={{ color: remaining > 0 ? DS.successDark : DS.errorDark }}>{formatCurrency(remaining)}</span></div>
          </div>
        </div>
      </>
    );
  };

  /* ---- Child list helper ---- */
  const ChildList = ({ items, emptyIcon, emptyLabel }) => {
    if (items.length === 0) return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <Icon name={emptyIcon} size={36} color={DS.neutralLight} style={{ margin: "0 auto 12px", display: "block" }} />
        <div style={{ ...typo.bodySmall, color: DS.textDisabled }}>{emptyLabel}</div>
      </div>
    );
    return items.map(ch => {
      const ctInfo = CHILD_TYPE_LABELS[ch.childType] || { label: ch.childType, icon: "file", color: DS.neutralDark };
      const childStatus = DOC_STATUSES[ch.status] || null;
      return (
        <div key={ch.id} style={{
          ...S.row, gap: 10, padding: "10px 0", borderBottom: `1px solid ${DS.borderLight}`,
        }}>
          <Icon name={ctInfo.icon} size={13} color={ctInfo.color} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ ...typo.bodySmall, color: DS.textPrimary, ...S.truncate, display: "block" }}>{ch.title}</span>
            {ch.number && <span style={{ ...typo.labelSmall, color: DS.textDisabled, fontFamily: "monospace", fontSize: 10 }}>{ch.number}</span>}
          </div>
          {ch.grossValue > 0 && <span style={{ ...typo.labelSmall, fontWeight: 500, color: DS.textPrimary, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{formatCurrency(ch.grossValue)}</span>}
          {ch.fileName && <span style={{ ...typo.labelSmall, color: DS.textDisabled, flexShrink: 0 }}>{ch.fileName}</span>}
          {childStatus && <Badge color={childStatus.color} bg={childStatus.bg} small>{childStatus.label}</Badge>}
        </div>
      );
    });
  };

  return (
    <div style={{
      width: 480, minWidth: 480, ...S.col, borderLeft: `1px solid ${DS.borderLight}`,
      background: DS.neutralWhite, overflow: "hidden",
      animation: "slideIn 0.2s ease-out",
    }}>
      {/* ===== Header ===== */}
      <div style={{
        padding: "14px 20px", borderBottom: `1px solid ${DS.borderLight}`,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
      }}>
        <div style={{ ...S.row, gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: DS.primaryLighter,
            ...S.row, justifyContent: "center", alignItems: "center", flexShrink: 0,
          }}>
            <Icon name={typeInfo.icon} size={16} color={DS.primaryLight} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ ...S.row, gap: 6 }}>
              <span style={{ ...typo.titleSmall, color: DS.primaryMain, fontWeight: 700, fontSize: 14, ...S.truncate }}>{doc.number || "Bez numeru"}</span>
              {statusInfo && <Badge color={statusInfo.color} bg={statusInfo.bg}>{statusInfo.label}</Badge>}
            </div>
            <div style={{ ...typo.bodySmall, color: DS.textSecondary, fontSize: 11, marginTop: 1, ...S.truncate }}>
              {typeInfo.label} &bull; {doc.contractor || "Brak kontrahenta"}
            </div>
          </div>
        </div>
        <Btn variant="ghost" icon="x" small onClick={onClose} title="Zamknij" style={{ flexShrink: 0, marginLeft: 8 }} />
      </div>

      {/* ===== Tabs ===== */}
      <div style={{ padding: "0 20px", borderBottom: `1px solid ${DS.borderLight}`, ...S.row, flexShrink: 0, overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "9px 12px", border: "none", background: "transparent", cursor: "pointer",
            fontFamily: DS.fontFamily, fontSize: 12, fontWeight: activeTab === t.id ? 600 : 400,
            color: activeTab === t.id ? DS.primaryMain : DS.textSecondary,
            borderBottom: activeTab === t.id ? `2px solid ${DS.primaryLight}` : "2px solid transparent",
            transition: "all 0.15s", whiteSpace: "nowrap", ...S.row, gap: 4,
          }}>
            {t.label}
            {t.count != null && t.count > 0 && (
              <span style={{
                ...typo.labelSmall, fontSize: 10, fontWeight: 600,
                background: activeTab === t.id ? DS.primaryLighter : DS.neutralLighter,
                color: activeTab === t.id ? DS.primaryLight : DS.textDisabled,
                padding: "1px 5px", borderRadius: 8, marginLeft: 2,
              }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ===== Tab content ===== */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>

        {/* --- Szczegóły tab --- */}
        {activeTab === "details" && (
          <>
            {/* Edit/Save bar */}
            {mode === "preview" && (
              <div style={{ ...S.row, justifyContent: "flex-end", marginBottom: 12 }}>
                <button onClick={() => setMode("edit")} style={{
                  ...S.row, gap: 4, padding: "4px 12px", borderRadius: 6,
                  border: `1px solid ${DS.borderLight}`, background: DS.neutralWhite,
                  color: DS.textSecondary, cursor: "pointer", ...typo.labelSmall,
                  fontFamily: DS.fontFamily, fontWeight: 500, fontSize: 11, transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = DS.primaryLight; e.currentTarget.style.color = DS.primaryLight; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = DS.borderLight; e.currentTarget.style.color = DS.textSecondary; }}
                >
                  <Icon name="edit" size={11} /> Edytuj
                </button>
              </div>
            )}
            {mode === "edit" && (
              <div style={{ ...S.row, justifyContent: "flex-end", gap: 6, marginBottom: 12 }}>
                <Btn variant="accent" icon="check" onClick={handleSaveEdit} small>Zapisz</Btn>
                <Btn variant="ghost" onClick={() => setMode("preview")} small>Anuluj</Btn>
              </div>
            )}

            {mode === "preview" && (
              <>
                {/* Alerts box */}
                {docAlerts.length > 0 && (
                  <div style={{ ...S.col, gap: 6, background: DS.warningLighter, border: `1px solid ${DS.warningLight}`, borderRadius: 8, padding: "10px 12px", marginBottom: 16 }}>
                    {docAlerts.map(code => {
                      const a = ALERT_TYPES[code];
                      return a ? (
                        <div key={code} style={{ ...S.row, gap: 8, padding: "2px 0" }}>
                          <div style={{ width: 18, height: 18, borderRadius: "50%", border: `1.5px solid ${a.color}40`, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Icon name={a.icon} size={9} color={a.color} />
                          </div>
                          <span style={{ ...typo.bodySmall, color: DS.textSecondary }}>{a.label}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}

                {/* Field rows */}
                <FieldRow label="Numer" value={doc.number} />
                <FieldRow label="Typ" value={typeInfo.label} />
                <FieldRow label="Kontrahent" value={doc.contractor} />
                <FieldRow label="Przedmiot / Opis" value={doc.title || "Bez tytułu"} />
                <FieldRow label="Kwota" value={doc.grossValue ? formatCurrency(doc.grossValue) : "—"} />
                <FieldRow label="Kwota netto" value={doc.netValue ? formatCurrency(doc.netValue) : "—"} />
                <FieldRow label="Data" value={formatDate(doc.dateCreated)} />
                <FieldRow label="Okres" value={doc.dateStart ? `${formatDate(doc.dateStart)} — ${formatDate(doc.dateEnd)}` : "—"} />
                <FieldRow label="Klasyfikacja" value={cls ? `${cls.code} — ${cls.label}` : "—"} />
                <FieldRow label="Wydział" value={doc.dept} />
                <FieldRow label="Osoba odpow." value={user?.name} />
                <FieldRow label="Status" value={statusInfo ? <Badge color={statusInfo.color} bg={statusInfo.bg}>{statusInfo.label}</Badge> : "—"} />

                {/* Tags */}
                {doc.tags && doc.tags.length > 0 && (
                  <div style={{ padding: "9px 0" }}>
                    <span style={{ ...typo.labelSmall, color: DS.textDisabled, textTransform: "uppercase", letterSpacing: 0.5 }}>Tagi</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                      {doc.tags.map(t => { const tag = TAGS.find(tt => tt.id === t); return tag ? <Badge key={t} color={tag.color} bg={tag.color + "18"}>{tag.label}</Badge> : null; })}
                    </div>
                  </div>
                )}

                {doc.notes && (
                  <div style={{ marginTop: 8, padding: 12, background: DS.neutralLighter, borderRadius: 8, ...typo.bodySmall, color: DS.textPrimary }}>{doc.notes}</div>
                )}

                {/* Historia */}
                {doc.history && doc.history.length > 0 && (
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${DS.borderLight}` }}>
                    <div style={{ ...S.row, gap: 6, marginBottom: 12 }}>
                      <Icon name="clock" size={14} color={DS.primaryMain} />
                      <span style={{ ...typo.labelMedium, color: DS.primaryMain, fontWeight: 600 }}>Historia</span>
                    </div>
                    <div style={{ position: "relative", paddingLeft: 20 }}>
                      <div style={{ position: "absolute", left: 7, top: 8, bottom: 8, width: 2, background: DS.borderLight, borderRadius: 1 }} />
                      {doc.history.slice().reverse().map((entry, idx) => (
                        <div key={idx} style={{ position: "relative", paddingBottom: 14, paddingLeft: 16 }}>
                          <div style={{ position: "absolute", left: -17, top: 6, width: 10, height: 10, borderRadius: "50%", background: idx === 0 ? DS.primaryLight : DS.neutralMain, border: `2px solid ${DS.neutralWhite}` }} />
                          <div style={{ ...S.row, justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <span style={{ ...typo.bodySmall, fontWeight: 500, color: DS.textPrimary }}>{entry.user}</span>
                              <span style={{ ...typo.bodySmall, color: DS.textSecondary, marginLeft: 6 }}>{entry.action}</span>
                            </div>
                            <span style={{ ...typo.labelSmall, color: DS.textDisabled, flexShrink: 0, marginLeft: 12 }}>{formatDate(entry.date)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {mode === "edit" && form && (
              <>
                <Section title="Podstawowe">
                  <Field label="Typ dokumentu">
                    <Select value={form.type} onChange={v => set("type", v)}
                      options={Object.entries(DOC_TYPES).map(([k, v]) => ({ value: k, label: v.label }))} />
                  </Field>
                  <Field label="Tytuł">
                    <Input value={form.title || ""} onChange={v => set("title", v)} placeholder="Nazwa dokumentu" />
                  </Field>
                  <Field label="Numer">
                    <Input value={form.number || ""} onChange={v => set("number", v)} placeholder="UM/2025/..." />
                  </Field>
                  <Field label="Kontrahent">
                    <Select value={form.contractor} onChange={v => set("contractor", v)} placeholder="Wybierz..."
                      options={CONTRACTORS.map(c => ({ value: c, label: c }))} />
                  </Field>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Wydział">
                      <Select value={form.dept} onChange={v => set("dept", v)}
                        options={DEPARTMENTS.map(d => ({ value: d, label: d }))} />
                    </Field>
                    <Field label="Osoba">
                      <Select value={String(form.assignee || "")} onChange={v => set("assignee", Number(v))}
                        options={USERS_LIST.map(u => ({ value: String(u.id), label: u.name }))} />
                    </Field>
                  </div>
                </Section>
                <Section title="Finanse">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="Wartość netto">
                      <Input type="number" value={form.netValue || ""} onChange={v => set("netValue", Number(v) || 0)} placeholder="0,00" />
                    </Field>
                    <Field label="Wartość brutto">
                      <div style={{ padding: "8px 12px", border: `1px solid ${DS.borderLight}`, borderRadius: 8, background: DS.neutralLighter, ...typo.titleSmall, color: DS.primaryMain, fontVariantNumeric: "tabular-nums" }}>
                        {formatCurrency(form.grossValue)}
                      </div>
                    </Field>
                  </div>
                  <Field label="Klasyfikacja budżetowa">
                    <Select value={form.classification} onChange={v => set("classification", v)} placeholder="Wybierz..."
                      options={CLASSIFICATIONS.map(c => ({ value: c.code, label: `${c.code} — ${c.label}` }))} />
                  </Field>
                </Section>
              </>
            )}
          </>
        )}

        {/* --- Faktury tab --- */}
        {activeTab === "faktury" && (
          <ChildList items={childFaktury} emptyIcon="file" emptyLabel="Brak podpiętych faktur" />
        )}

        {/* --- Załączniki tab --- */}
        {activeTab === "zalaczniki" && (
          <ChildList items={childZalaczniki} emptyIcon="paperclip" emptyLabel="Brak załączników" />
        )}

        {/* --- Zaangażowanie tab --- */}
        {activeTab === "zaangazowanie" && (
          <BudgetContent />
        )}
      </div>
    </div>
  );
};

// ──── 10-doc-form-meta.js ────
/* ═══════════════════════════════════════════════════════════════
   DOC FORM — constants & metadata
   ═══════════════════════════════════════════════════════════════ */
const DOC_TYPE_META = {
  umowa: { desc: "Umowa, kontrakt lub porozumienie", needsLink: false, hasOcr: true },
  faktura: { desc: "Faktura VAT lub rachunek", needsLink: true, linkLabel: "Powiąż z umową", hasOcr: true },
  zlecenie: { desc: "Zlecenie lub zamówienie", needsLink: false },
  aneks: { desc: "Aneks do istniejącej umowy", needsLink: true, linkLabel: "Wybierz umowę", linkRequired: true },
  inne: { desc: "Dowolny dokument — np. regulamin, zarządzenie", needsLink: false, simpleForm: true },
  zalacznik: { desc: "Plik powiązany z dokumentem (protokół, pismo, decyzja)", needsLink: true, linkLabel: "Powiąż z dokumentem", simpleForm: true },
};
const LINK_TYPES = { faktura: ["umowa"], aneks: ["umowa"], zalacznik: ["umowa", "faktura", "zlecenie", "aneks", "inne"] };
const TRYBY_PZP = [
  { id: "tp_podst", label: "Tryb podstawowy", desc: "Art. 275 PZP — poniżej progów unijnych", threshold: "do 221 000 €" },
  { id: "pn", label: "Przetarg nieograniczony", desc: "Art. 132 PZP — otwarty dla wszystkich wykonawców", threshold: "powyżej progów UE" },
  { id: "po", label: "Przetarg ograniczony", desc: "Art. 141 PZP — dwuetapowy z prekwalifikacją", threshold: "powyżej progów UE" },
  { id: "no", label: "Negocjacje z ogłoszeniem", desc: "Art. 153 PZP — negocjacje po ofertach wstępnych", threshold: "powyżej progów UE" },
  { id: "dialog", label: "Dialog konkurencyjny", desc: "Art. 169 PZP — dialog w celu określenia rozwiązań", threshold: "powyżej progów UE" },
  { id: "wolna_reka", label: "Zamówienie z wolnej ręki", desc: "Art. 214 PZP — wymaga uzasadnienia", threshold: "wymaga przesłanki" },
  { id: "zapytanie", label: "Zapytanie ofertowe", desc: "Procedura wewnętrzna JST", threshold: "poniżej 130 000 zł" },
  { id: "bez_pzp", label: "Bez stosowania PZP", desc: "Art. 2 ust. 1 PZP — poniżej progu", threshold: "poniżej 130 000 zł" },
];
const REGISTRY_PREFIXES = { umowa: "CRU", faktura: "REF", aneks: "AN", zlecenie: "RZ" };

// ──── 11-doc-form-steps.js ────
/* ═══════════════════════════════════════════════════════════════
   DOC FORM — Step 0 (type selection) + Step 1 (basic data)
   ═══════════════════════════════════════════════════════════════ */

/* ── Step 0: wybór typu dokumentu ── */
const DocFormStepType = ({ form, set }) => (
  <div>
    <div style={{ ...typo.bodyMedium, color: DS.textPrimary, marginBottom: 16 }}>Wybierz typ dokumentu</div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {Object.entries(DOC_TYPES).map(([key, dt]) => {
        const active = form.type === key;
        return (
          <div key={key} onClick={() => set("type", key)} style={{
            padding: "14px 16px", borderRadius: 12, cursor: "pointer", transition: "all 0.15s",
            border: `2px solid ${active ? dt.color : DS.borderLight}`,
            background: active ? dt.bg : DS.neutralWhite,
          }}>
            <div style={{ ...S.row, gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, ...S.row, justifyContent: "center",
                background: active ? dt.color : DS.neutralLighter,
              }}>
                <Icon name={dt.icon} size={16} color={active ? "#fff" : dt.color} />
              </div>
              <span style={{ ...typo.titleSmall, color: active ? dt.color : DS.textPrimary }}>{dt.label}</span>
            </div>
            <div style={{ ...typo.bodySmall, color: DS.textSecondary }}>{DOC_TYPE_META[key]?.desc}</div>
          </div>
        );
      })}
    </div>
  </div>
);

/* ── Step 1: dane podstawowe + plik ── */
const DocFormStepBasic = ({ form, set, docs, ocrStep, setOcrStep }) => {
  const [ocrFile, setOcrFile] = useState(null);
  const curMeta = DOC_TYPE_META[form.type] || {};
  const isSimple = (type) => DOC_TYPE_META[type]?.simpleForm;
  const linkableDocs = (docs || []).filter(d => {
    const allowed = LINK_TYPES[form.type];
    return allowed && allowed.includes(d.type);
  });

  const ocrResults = form.type === "faktura" ? {
    title: "Faktura za materiały biurowe", contractor: "BiuroPlus Sp. z o.o.",
    number: "FV/2025/OCR-001", grossValue: 4243.50,
    dateCreated: "2025-02-10", confidence: 87,
  } : {
    title: "Umowa na dostawę sprzętu IT", contractor: "TechSolutions Sp. z o.o.",
    number: "UM/2025/OCR-042", grossValue: 58900,
    dateStart: "2025-03-01", dateEnd: "2025-12-31", confidence: 82,
  };

  const handleOcrAccept = () => {
    Object.entries(ocrResults).forEach(([k,v]) => { if (k !== "confidence") set(k, v); });
    setOcrStep(null);
  };

  const getNextNrEwidencyjny = (type) => {
    const prefix = REGISTRY_PREFIXES[type];
    if (!prefix) return "";
    const existing = (docs || []).filter(d => d.type === type && d.nrEwidencyjny).map(d => {
      const m = d.nrEwidencyjny.match(/(\d+)\/(\d{4})$/);
      return m ? parseInt(m[1]) : 0;
    });
    const maxNum = existing.length > 0 ? Math.max(...existing) : 0;
    return `${prefix} ${maxNum + 1}/2026`;
  };

  return (
    <div>
      {/* type badge */}
      <div style={{ ...S.row, gap: 8, marginBottom: 16 }}>
        {form.type && (() => {
          const dt = DOC_TYPES[form.type];
          return (
            <div style={{ ...S.row, gap: 8, padding: "6px 14px", borderRadius: 8, background: dt.bg, border: `1px solid ${dt.color}22` }}>
              <Icon name={dt.icon} size={14} color={dt.color} />
              <span style={{ ...typo.labelMedium, color: dt.color, fontWeight: 600 }}>{dt.label}</span>
            </div>
          );
        })()}
      </div>

      {/* ── INNE: simplified — only name ── */}
      {form.type === "inne" && (
        <Section title="Dane dokumentu">
          <Field label="Nazwa dokumentu *">
            <Input value={form.title} onChange={v => set("title", v)} placeholder="np. Regulamin JST, Zarządzenie Wójta..." />
          </Field>
          <Field label="Notatki">
            <textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} placeholder="Opcjonalny opis..."
              rows={2} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${DS.borderLight}`, borderRadius: 8, fontSize: 13, fontFamily: DS.fontFamily, color: DS.textPrimary, resize: "vertical", outline: "none" }} />
          </Field>
        </Section>
      )}

      {/* ── ZAŁĄCZNIK: name + linked doc ── */}
      {form.type === "zalacznik" && (
        <Section title="Dane załącznika">
          <Field label="Nazwa załącznika *">
            <Input value={form.title} onChange={v => set("title", v)} placeholder="np. Protokół odbioru, Pismo przewodnie..." />
          </Field>
          <Field label={curMeta.linkLabel}>
            <Select value={form.linkedTo ? String(form.linkedTo) : ""} onChange={v => set("linkedTo", Number(v) || null)}
              placeholder="Wyszukaj dokument..." options={linkableDocs.map(d => ({ value: String(d.id), label: `${DOC_TYPES[d.type]?.label}: ${d.title}` }))} />
          </Field>
          {form.linkedTo && (() => {
            const ld = (docs||[]).find(d => d.id === form.linkedTo);
            return ld ? (
              <div style={{ ...S.row, gap: 8, padding: "8px 12px", borderRadius: 8, background: DS.successLighter }}>
                <Icon name="link" size={14} color={DS.successDark} />
                <span style={{ ...typo.bodySmall, color: DS.successDark }}>{ld.title}</span>
                <span style={{ ...typo.labelSmall, color: DS.textDisabled }}>• {ld.contractor}</span>
              </div>
            ) : null;
          })()}
        </Section>
      )}

      {/* ── FULL FORM: umowa, faktura, zlecenie, aneks ── */}
      {!isSimple(form.type) && (
        <>
          {/* ── FILE UPLOAD at top (drag & drop + OCR) ── */}
          <Section title="Plik dokumentu">
            {form.uploadedFile ? (
              <div style={{ ...S.row, gap: 10, padding: "12px 14px", borderRadius: 10, background: DS.neutralLighter, border: `1px solid ${DS.borderLight}` }}>
                <Icon name="file" size={20} color={DS.primaryLight} />
                <div style={{ flex: 1 }}>
                  <div style={{ ...typo.bodySmall, fontWeight: 600, color: DS.textPrimary }}>{form.uploadedFile}</div>
                  <div style={{ ...typo.labelSmall, color: DS.textDisabled }}>PDF • 2.4 MB</div>
                </div>
                <button onClick={() => set("uploadedFile", null)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  <Icon name="x" size={14} color={DS.textDisabled} />
                </button>
              </div>
            ) : ocrStep === "processing" ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", margin: "0 auto 12px", border: `3px solid ${DS.borderLight}`, borderTopColor: DS.primaryLight, animation: "spin 1s linear infinite" }} />
                <div style={{ ...typo.bodySmall, color: DS.textPrimary }}>Rozpoznawanie tekstu...</div>
                <div style={{ ...typo.labelSmall, color: DS.textDisabled }}>{ocrFile}</div>
              </div>
            ) : ocrStep === "results" ? (
              <div>
                <div style={{ ...S.row, gap: 8, marginBottom: 12 }}>
                  <Icon name="sparkles" size={16} color={DS.successMain} />
                  <span style={{ ...typo.bodySmall, color: DS.successDark, fontWeight: 600 }}>Rozpoznano {ocrResults.confidence}% pól</span>
                </div>
                <div style={{ ...S.row, gap: 10, padding: "10px 14px", borderRadius: 10, background: DS.neutralLighter, marginBottom: 10 }}>
                  <Icon name="file" size={18} color={DS.primaryLight} />
                  <div style={{ flex: 1 }}>
                    <div style={{ ...typo.bodySmall, fontWeight: 600, color: DS.textPrimary }}>{ocrFile}</div>
                    <div style={{ ...typo.labelSmall, color: DS.textDisabled }}>PDF • 2.4 MB</div>
                  </div>
                  <Icon name="check" size={14} color={DS.successMain} />
                </div>
                {Object.entries(ocrResults).filter(([k]) => k !== "confidence").map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${DS.borderLight}` }}>
                    <span style={{ ...typo.labelSmall, color: DS.textSecondary }}>{k === "title" ? "Przedmiot" : k === "contractor" ? "Kontrahent" : k === "number" ? "Numer" : k === "grossValue" ? "Kwota brutto" : k === "dateCreated" ? "Data" : k === "dateStart" ? "Od" : k === "dateEnd" ? "Do" : k}</span>
                    <span style={{ ...typo.bodySmall, color: DS.textPrimary, fontWeight: 500 }}>{typeof v === "number" ? formatCurrency(v) : v}</span>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <Btn variant="accent" icon="sparkles" onClick={() => { handleOcrAccept(); set("uploadedFile", ocrFile); }} small style={{ flex: 1 }}>Zastosuj dane</Btn>
                  <Btn variant="ghost" onClick={() => { setOcrStep(null); set("uploadedFile", ocrFile); }} small>Tylko plik</Btn>
                </div>
              </div>
            ) : (
              <div onClick={() => {
                if (curMeta.hasOcr) { setOcrFile("skan_dokument.pdf"); setOcrStep("processing"); setTimeout(() => setOcrStep("results"), 1800); }
                else { set("uploadedFile", "dokument_skan.pdf"); }
              }} style={{
                border: `2px dashed ${DS.borderLight}`, borderRadius: 10, padding: "20px", textAlign: "center",
                cursor: "pointer", transition: "all 0.15s", background: DS.neutralWhite,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = DS.primaryLight; e.currentTarget.style.background = DS.neutralLighter; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = DS.borderLight; e.currentTarget.style.background = DS.neutralWhite; }}
              >
                <Icon name="upload" size={20} color={DS.textDisabled} />
                <div style={{ ...typo.bodySmall, color: DS.textSecondary, marginTop: 6 }}>Przeciągnij plik lub kliknij</div>
                <div style={{ ...typo.labelSmall, color: DS.textDisabled }}>PDF, JPG, PNG, DOCX • max 10 MB</div>
                {curMeta.hasOcr && (
                  <div style={{ ...S.row, gap: 6, justifyContent: "center", marginTop: 8 }}>
                    <Icon name="sparkles" size={12} color={DS.primaryLight} />
                    <span style={{ ...typo.labelSmall, color: DS.primaryLight }}>Autouzupełnianie dostępne</span>
                  </div>
                )}
              </div>
            )}
          </Section>

          {/* linked document (for faktura, aneks) */}
          {curMeta.needsLink && (
            <div style={{ marginBottom: 16 }}>
              <Field label={curMeta.linkLabel + (curMeta.linkRequired ? " *" : "")}>
                <Select value={form.linkedTo ? String(form.linkedTo) : ""} onChange={v => set("linkedTo", Number(v) || null)}
                  placeholder="Wyszukaj dokument..." options={linkableDocs.map(d => ({ value: String(d.id), label: `${DOC_TYPES[d.type]?.label}: ${d.title}` }))} />
              </Field>
              {form.linkedTo && (() => {
                const ld = (docs||[]).find(d => d.id === form.linkedTo);
                return ld ? (
                  <div style={{ ...S.row, gap: 8, padding: "8px 12px", borderRadius: 8, background: DS.successLighter, marginTop: 6 }}>
                    <Icon name="link" size={14} color={DS.successDark} />
                    <span style={{ ...typo.bodySmall, color: DS.successDark }}>{ld.title}</span>
                    <span style={{ ...typo.labelSmall, color: DS.textDisabled }}>• {ld.contractor}</span>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <Section title="Informacje podstawowe">
            <Field label="Przedmiot *">
              <Input value={form.title} onChange={v => set("title", v)} placeholder={
                form.type === "faktura" ? "np. Faktura za materiały biurowe" :
                form.type === "aneks" ? "np. Aneks nr 1 do umowy na dostawę sprzętu" :
                form.type === "zlecenie" ? "np. Zlecenie na usługę transportową" :
                "np. Umowa na dostawę sprzętu IT"
              } />
            </Field>

            {/* Rodzaj umowy toggle */}
            <Field label="Rodzaj">
              <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: `1px solid ${DS.borderLight}` }}>
                {[{v: "wydatkowa", l: "Wydatkowa", icon: "upload"}, {v: "dochodowa", l: "Dochodowa", icon: "download"}].map(opt => (
                  <button key={opt.v} onClick={() => set("rodzajUmowy", opt.v)} style={{
                    flex: 1, padding: "8px 12px", border: "none", cursor: "pointer",
                    fontFamily: DS.fontFamily, ...typo.bodySmall, fontWeight: 600, transition: "all 0.15s",
                    ...S.row, gap: 6, justifyContent: "center",
                    background: form.rodzajUmowy === opt.v ? (opt.v === "wydatkowa" ? DS.errorLighter : DS.successLighter) : DS.neutralWhite,
                    color: form.rodzajUmowy === opt.v ? (opt.v === "wydatkowa" ? DS.errorDark : DS.successDark) : DS.textDisabled,
                  }}>
                    <Icon name={opt.icon} size={13} color={form.rodzajUmowy === opt.v ? (opt.v === "wydatkowa" ? DS.errorDark : DS.successDark) : DS.textDisabled} />
                    {opt.l}
                  </button>
                ))}
              </div>
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Kwota brutto (zł)">
                <Input type="number" value={form.grossValue || ""} onChange={v => set("grossValue", Number(v) || 0)} placeholder="0,00" />
              </Field>
              <Field label="Kwota netto (zł)">
                <Input type="number" value={form.netValue || ""} onChange={v => set("netValue", Number(v) || 0)} placeholder="0,00" />
              </Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Numer dokumentu">
                <Input value={form.number} onChange={v => set("number", v)} placeholder={
                  form.type === "faktura" ? "FV/2025/..." :
                  form.type === "aneks" ? "AN/2025/..." :
                  form.type === "zlecenie" ? "ZL/2025/..." :
                  "UM/2025/..."
                } />
              </Field>
              <Field label={`Nr ewidencyjny${REGISTRY_PREFIXES[form.type] ? ` (${REGISTRY_PREFIXES[form.type]})` : ""}`}>
                <div style={{ ...S.row, gap: 6 }}>
                  <div style={{ flex: 1 }}>
                    <Input value={form.nrEwidencyjny} onChange={v => set("nrEwidencyjny", v)} placeholder={REGISTRY_PREFIXES[form.type] ? `${REGISTRY_PREFIXES[form.type]} NN/RRRR` : "NN/RRRR"} />
                  </div>
                  {REGISTRY_PREFIXES[form.type] && (
                    <button onClick={() => set("nrEwidencyjny", getNextNrEwidencyjny(form.type))} title="Nadaj kolejny numer ewidencyjny" style={{
                      padding: "8px 12px", borderRadius: 8, border: `1px solid ${DS.primaryLight}`,
                      background: DS.primaryLighter, cursor: "pointer", ...S.row, gap: 4,
                      fontFamily: DS.fontFamily, ...typo.labelSmall, color: DS.primaryDark, fontWeight: 600, whiteSpace: "nowrap",
                    }}>
                      <Icon name="zap" size={12} color={DS.primaryLight} />
                      Nadaj
                    </button>
                  )}
                </div>
              </Field>
            </div>
            <Field label="Kontrahent">
              <Select value={form.contractor} onChange={v => set("contractor", v)} placeholder="Wybierz kontrahenta..."
                options={CONTRACTORS.map(c => ({ value: c, label: c }))} />
            </Field>

            {/* dates — type-specific */}
            {(form.type === "umowa" || form.type === "aneks") && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <Field label="Data zawarcia">
                  <Input type="date" value={form.dateCreated} onChange={v => set("dateCreated", v)} />
                </Field>
                <Field label="Obowiązuje od">
                  <Input type="date" value={form.dateStart} onChange={v => set("dateStart", v)} />
                </Field>
                <Field label="Obowiązuje do">
                  <Input type="date" value={form.dateEnd} onChange={v => set("dateEnd", v)} />
                </Field>
              </div>
            )}
            {form.type === "faktura" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Data wystawienia">
                  <Input type="date" value={form.dateCreated} onChange={v => set("dateCreated", v)} />
                </Field>
                <Field label="Termin płatności">
                  <Input type="date" value={form.paymentDue || ""} onChange={v => set("paymentDue", v)} />
                </Field>
              </div>
            )}
            {form.type === "zlecenie" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Data zlecenia">
                  <Input type="date" value={form.dateCreated} onChange={v => set("dateCreated", v)} />
                </Field>
                <Field label="Termin wykonania">
                  <Input type="date" value={form.executionDeadline || ""} onChange={v => set("executionDeadline", v)} />
                </Field>
              </div>
            )}
            {form.type === "aneks" && (
              <Field label="Opis zmian">
                <textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} placeholder="Jakie zmiany wprowadza aneks..."
                  rows={2} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${DS.borderLight}`, borderRadius: 8, fontSize: 13, fontFamily: DS.fontFamily, color: DS.textPrimary, resize: "vertical", outline: "none" }} />
              </Field>
            )}
          </Section>
        </>
      )}
    </div>
  );
};

// ──── 12-doc-form-class.js ────
/* ═══════════════════════════════════════════════════════════════
   DOC FORM — Step 2 (Klasyfikacja) + Step 3 (Formalności)
   ═══════════════════════════════════════════════════════════════ */
const DocFormStepClassification = ({ form, set }) => {
  /* AI suggestion heuristic */
  const t = ((form.title || "") + " " + (form.contractor || "")).toLowerCase();
  const suggestions = CLASSIFICATIONS.map(c => {
    let score = 0;
    const cl = c.label.toLowerCase();
    const words = t.split(/\s+/).filter(w => w.length > 3);
    words.forEach(w => { if (cl.includes(w)) score += 30; });
    if (t.includes("drog") || t.includes("remont")) { if (c.code.startsWith("600")) score += 40; }
    if (t.includes("it") || t.includes("usług") || t.includes("obsług") || t.includes("prawn")) { if (c.code.includes("4300") || c.code.startsWith("750")) score += 40; }
    if (t.includes("szkoł") || t.includes("eduk")) { if (c.code.startsWith("801")) score += 40; }
    if (t.includes("odpad") || t.includes("oczyszcz")) { if (c.code.startsWith("900")) score += 40; }
    if (t.includes("kultur")) { if (c.code.startsWith("921")) score += 40; }
    return { ...c, score: Math.min(score, 99) };
  }).filter(c => c.score > 0).sort((a, b) => b.score - a.score).slice(0, 2);
  const hasSuggestions = suggestions.length > 0 && t.length > 4;

  const selectedClassification = CLASSIFICATIONS.find(c => c.code === form.classification);
  const budgetPct = selectedClassification ? Math.round(((selectedClassification.used + form.grossValue) / selectedClassification.budget) * 100) : null;
  const budgetColor = budgetPct === null ? DS.textDisabled : budgetPct >= 85 ? DS.errorMain : budgetPct >= 60 ? DS.warningMain : DS.successMain;

  return (
    <div>
      {/* AI suggestions banner */}
      {hasSuggestions && (
        <div style={{ padding: "16px", borderRadius: 12, background: `linear-gradient(135deg, ${DS.primaryLighter}, ${DS.secondaryLighter})`, border: `1px solid ${DS.primaryLight}`, marginBottom: 16 }}>
          <div style={{ ...S.row, gap: 8, marginBottom: 12 }}>
            <Icon name="sparkles" size={16} color={DS.primaryLight} />
            <span style={{ ...typo.bodySmall, fontWeight: 600, color: DS.primaryDark }}>Na podstawie danych dokumentu — prawdopodobnie pasują:</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {suggestions.map(sg => {
              const pct = Math.round((sg.used / sg.budget) * 100);
              const free = sg.budget - sg.used;
              return (
                <div key={sg.code} onClick={() => set("classification", sg.code)} style={{
                  padding: "12px 14px", borderRadius: 10, cursor: "pointer", transition: "all 0.15s",
                  border: `1.5px solid ${form.classification === sg.code ? DS.primaryLight : DS.borderLight}`,
                  background: form.classification === sg.code ? DS.primaryLighter : DS.neutralWhite,
                }}>
                  <div style={{ ...S.rowBetween }}>
                    <div>
                      <span style={{ ...typo.bodySmall, fontWeight: 700, color: DS.textPrimary }}>{sg.code}</span>
                      <span style={{ ...typo.bodySmall, color: DS.textSecondary, marginLeft: 8 }}>{sg.label}</span>
                    </div>
                    <span style={{
                      ...typo.labelSmall, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
                      background: sg.score >= 80 ? DS.successLighter : DS.warningLighter,
                      color: sg.score >= 80 ? DS.successDark : DS.warningDark,
                    }}>{sg.score}%</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ ...typo.labelSmall, color: DS.textDisabled, marginTop: 8 }}>Możesz też wybrać inną klasyfikację poniżej:</div>
        </div>
      )}

      {/* Classification cards — all options */}
      <div style={{ ...typo.labelSmall, fontWeight: 600, color: DS.textSecondary, marginBottom: 10 }}>Klasyfikacja budżetowa:</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {CLASSIFICATIONS.map(c => {
          const isSelected = form.classification === c.code;
          const pct = Math.round((c.used / c.budget) * 100);
          const free = c.budget - c.used;
          const barColor = pct >= 85 ? DS.errorMain : pct >= 60 ? DS.warningMain : DS.primaryLight;
          return (
            <div key={c.code} onClick={() => set("classification", c.code)} style={{
              padding: "14px 16px", borderRadius: 12, cursor: "pointer", transition: "all 0.15s",
              border: `2px solid ${isSelected ? DS.primaryLight : DS.borderLight}`,
              background: isSelected ? DS.primaryLighter : DS.neutralWhite,
            }}>
              <div style={{ ...S.rowBetween, marginBottom: 6 }}>
                <div>
                  <span style={{ ...typo.bodySmall, fontWeight: 700, color: DS.textPrimary }}>{c.code}</span>
                  {isSelected && <Icon name="check" size={14} color={DS.primaryLight} style={{ marginLeft: 8 }} />}
                </div>
              </div>
              <div style={{ ...typo.bodySmall, color: DS.textSecondary, marginBottom: 8 }}>{c.label}</div>
              {/* budget bar */}
              <div style={{ height: 6, borderRadius: 3, background: DS.borderLight, overflow: "hidden", marginBottom: 6 }}>
                <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, borderRadius: 3, background: barColor, transition: "width 0.4s ease" }} />
              </div>
              <div style={{ ...S.rowBetween }}>
                <span style={{ ...typo.labelSmall, color: DS.textDisabled }}>{pct}% zaangażowane</span>
                <span style={{ ...typo.labelSmall, fontWeight: 600, color: free > 0 ? DS.successDark : DS.errorDark }}>
                  {formatCurrency(free)} wolne
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* budget impact after selection */}
      {budgetPct !== null && form.grossValue > 0 && (
        <div style={{ padding: "12px 14px", borderRadius: 10, marginTop: 12, background: budgetColor === DS.errorMain ? "#FEF2F2" : budgetColor === DS.warningMain ? "#FFFBEB" : DS.successLighter, border: `1px solid ${budgetColor}33` }}>
          <div style={{ ...S.rowBetween, marginBottom: 4 }}>
            <span style={{ ...typo.bodySmall, color: DS.textPrimary }}>Po dodaniu dokumentu ({formatCurrency(form.grossValue)})</span>
            <span style={{ ...typo.bodySmall, fontWeight: 700, color: budgetColor }}>{budgetPct}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: DS.borderLight, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(budgetPct, 100)}%`, borderRadius: 3, background: budgetColor, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ ...typo.labelSmall, color: DS.textDisabled, marginTop: 4 }}>
            {formatCurrency(selectedClassification.used + form.grossValue)} z {formatCurrency(selectedClassification.budget)}
          </div>
        </div>
      )}

      {/* ── Zadanie budżetowe — disabled, connects to zaangażowanie module ── */}
      {form.classification && (
        <div style={{ marginTop: 16 }}>
          <div style={{ ...typo.labelSmall, fontWeight: 600, color: DS.textSecondary, marginBottom: 8 }}>Zadanie budżetowe:</div>
          <div style={{ position: "relative" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10,
              border: `1px solid ${DS.borderLight}`, background: DS.disabledLighter, opacity: 0.7, cursor: "not-allowed",
            }}>
              <Icon name="search" size={16} color={DS.textDisabled} />
              <span style={{ ...typo.bodySmall, color: DS.textDisabled }}>Wyszukaj zadanie budżetowe...</span>
            </div>
            <div style={{ ...S.row, gap: 6, marginTop: 8, padding: "8px 12px", borderRadius: 8, background: DS.infoLighter, border: `1px solid ${DS.infoLight}` }}>
              <Icon name="info" size={14} color={DS.infoMain} />
              <span style={{ ...typo.labelSmall, color: DS.infoDark }}>
                Powiązanie z zadaniem budżetowym będzie dostępne w module Zaangażowania
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DOC FORM — Step 3: Formalności
   ═══════════════════════════════════════════════════════════════ */
const DocFormStepFormalities = ({ form, set }) => {
  const addScheduleRow = () => set("harmonogram", [...form.harmonogram, { date: "", amount: 0, label: "" }]);
  const updateScheduleRow = (i, k, v) => {
    const h = [...form.harmonogram]; h[i] = { ...h[i], [k]: v }; set("harmonogram", h);
  };
  const removeScheduleRow = (i) => set("harmonogram", form.harmonogram.filter((_, idx) => idx !== i));

  return (
    <div>
      <Section title="Organizacja">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Wydział">
            <Select value={form.dept} onChange={v => set("dept", v)}
              options={DEPARTMENTS.map(d => ({ value: d, label: d }))} />
          </Field>
          <Field label="Osoba odpowiedzialna">
            <Select value={String(form.assignee)} onChange={v => set("assignee", Number(v))}
              options={USERS_LIST.map(u => ({ value: String(u.id), label: u.name }))} />
          </Field>
        </div>
      </Section>

      {/* ── Zamówienia publiczne toggle + PZP list ── */}
      {(form.type === "umowa" || form.type === "zlecenie") && (
        <Section title="Zamówienia publiczne i dofinansowanie">
          <label style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 12, borderRadius: 10,
            border: `2px solid ${form.zamowieniePubliczne ? DS.primaryLight : DS.borderLight}`,
            background: form.zamowieniePubliczne ? DS.primaryLighter : DS.neutralWhite, cursor: "pointer",
            borderBottomLeftRadius: form.zamowieniePubliczne ? 0 : 10, borderBottomRightRadius: form.zamowieniePubliczne ? 0 : 10,
          }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, marginTop: 2, flexShrink: 0,
              border: `2px solid ${form.zamowieniePubliczne ? DS.primaryLight : DS.borderLight}`,
              background: form.zamowieniePubliczne ? DS.primaryLight : "#fff",
              ...S.row, justifyContent: "center",
            }}>
              {form.zamowieniePubliczne && <Icon name="check" size={10} color="#fff" />}
            </div>
            <input type="checkbox" checked={form.zamowieniePubliczne} onChange={e => { set("zamowieniePubliczne", e.target.checked); if (!e.target.checked) { set("tryb_pzp", ""); set("nr_postepowania", ""); }}} style={{ display: "none" }} />
            <div>
              <div style={{ ...typo.bodySmall, fontWeight: 600, color: DS.textPrimary }}>Zamówienie publiczne</div>
              <div style={{ ...typo.labelSmall, color: DS.textSecondary, marginTop: 2 }}>Umowa w trybie ustawy Prawo Zamówień Publicznych</div>
            </div>
          </label>
          {form.zamowieniePubliczne && (
            <div style={{ border: `2px solid ${DS.primaryLight}`, borderTop: "none", borderRadius: "0 0 10px 10px", padding: 14, background: DS.neutralLighter, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ ...typo.labelSmall, fontWeight: 600, color: DS.textSecondary, marginBottom: 2 }}>Tryb zamówienia</div>
              {TRYBY_PZP.map(t => (
                <button key={t.id} onClick={() => set("tryb_pzp", t.id)} style={{
                  textAlign: "left", padding: "9px 12px", borderRadius: 8, width: "100%", fontFamily: DS.fontFamily,
                  border: `1.5px solid ${form.tryb_pzp === t.id ? DS.primaryLight : DS.borderLight}`,
                  background: form.tryb_pzp === t.id ? DS.primaryLighter : DS.neutralWhite, cursor: "pointer", transition: "all 0.15s",
                }}>
                  <div style={{ ...S.rowBetween }}>
                    <span style={{ ...typo.bodySmall, fontWeight: 600, color: form.tryb_pzp === t.id ? DS.primaryDark : DS.textPrimary }}>{t.label}</span>
                    <span style={{ ...typo.labelSmall, fontSize: 9, padding: "2px 7px", borderRadius: 999,
                      background: t.threshold.includes("poniżej") ? DS.successLighter : t.threshold.includes("wymaga") ? DS.warningLighter : DS.primaryLighter,
                      color: t.threshold.includes("poniżej") ? DS.successDark : t.threshold.includes("wymaga") ? DS.warningDark : DS.primaryDark,
                      fontWeight: 600,
                    }}>{t.threshold}</span>
                  </div>
                  <div style={{ ...typo.labelSmall, color: DS.textDisabled, marginTop: 2 }}>{t.desc}</div>
                </button>
              ))}
              <Field label="Numer postępowania">
                <Input value={form.nr_postepowania || ""} onChange={v => set("nr_postepowania", v)} placeholder="ZP.271.X.2025" />
              </Field>
            </div>
          )}

          <div style={{ marginTop: 10 }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 12, borderRadius: 10,
              border: `2px solid ${form.dofinansowanie ? DS.primaryLight : DS.borderLight}`,
              background: form.dofinansowanie ? DS.primaryLighter : DS.neutralWhite, cursor: "pointer",
            }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, marginTop: 2, flexShrink: 0,
                border: `2px solid ${form.dofinansowanie ? DS.primaryLight : DS.borderLight}`,
                background: form.dofinansowanie ? DS.primaryLight : "#fff",
                ...S.row, justifyContent: "center",
              }}>
                {form.dofinansowanie && <Icon name="check" size={10} color="#fff" />}
              </div>
              <input type="checkbox" checked={form.dofinansowanie} onChange={e => set("dofinansowanie", e.target.checked)} style={{ display: "none" }} />
              <div>
                <div style={{ ...typo.bodySmall, fontWeight: 600, color: DS.textPrimary }}>Umowa z dofinansowaniem</div>
                <div style={{ ...typo.labelSmall, color: DS.textSecondary, marginTop: 2 }}>Dofinansowanie UE, dotacja, grant lub inne źródło</div>
              </div>
            </label>
            {form.dofinansowanie && (
              <div style={{ padding: "10px 14px", marginTop: -2, borderRadius: "0 0 10px 10px", border: `2px solid ${DS.primaryLight}`, borderTop: "none", background: DS.neutralLighter }}>
                <Field label="Źródło dofinansowania">
                  <Input value={form.zrodloDofinansowania || ""} onChange={v => set("zrodloDofinansowania", v)} placeholder="np. Program Regionalny, PROW, dotacja celowa..." />
                </Field>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ── Status realizacji: podpisy, kontrasyganta ── */}
      <Section title="Status realizacji">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8,
            border: `1px solid ${form.podpisStonn ? DS.successMain : DS.borderLight}`,
            background: form.podpisStonn ? DS.successLighter : DS.neutralWhite, cursor: "pointer",
          }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0,
              border: `2px solid ${form.podpisStonn ? DS.successMain : DS.borderLight}`,
              background: form.podpisStonn ? DS.successMain : "#fff", ...S.row, justifyContent: "center",
            }}>
              {form.podpisStonn && <Icon name="check" size={10} color="#fff" />}
            </div>
            <input type="checkbox" checked={form.podpisStonn} onChange={e => set("podpisStonn", e.target.checked)} style={{ display: "none" }} />
            <div style={{ ...typo.bodySmall, color: DS.textPrimary }}>Podpisana przez strony</div>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8,
            border: `1px solid ${form.kontrasygnatSkarbnika ? DS.successMain : DS.borderLight}`,
            background: form.kontrasygnatSkarbnika ? DS.successLighter : DS.neutralWhite, cursor: "pointer",
          }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0,
              border: `2px solid ${form.kontrasygnatSkarbnika ? DS.successMain : DS.borderLight}`,
              background: form.kontrasygnatSkarbnika ? DS.successMain : "#fff", ...S.row, justifyContent: "center",
            }}>
              {form.kontrasygnatSkarbnika && <Icon name="check" size={10} color="#fff" />}
            </div>
            <input type="checkbox" checked={form.kontrasygnatSkarbnika} onChange={e => set("kontrasygnatSkarbnika", e.target.checked)} style={{ display: "none" }} />
            <div>
              <div style={{ ...typo.bodySmall, color: DS.textPrimary }}>Kontrasygnata skarbnika</div>
              <div style={{ ...typo.labelSmall, color: DS.textDisabled }}>Art. 262 ust. 3 ustawy o finansach publicznych</div>
            </div>
          </label>
        </div>
      </Section>

      {/* ── Harmonogram płatności ── */}
      {(form.type === "umowa" || form.type === "faktura") && (
        <Section title="Harmonogram płatności">
          {form.harmonogram.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
              {form.harmonogram.map((row, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr auto", gap: 8, alignItems: "center" }}>
                  <Input type="date" value={row.date} onChange={v => updateScheduleRow(i, "date", v)} />
                  <Input type="number" value={row.amount || ""} onChange={v => updateScheduleRow(i, "amount", Number(v) || 0)} placeholder="Kwota" />
                  <Input value={row.label} onChange={v => updateScheduleRow(i, "label", v)} placeholder="Opis (opcjonalny)" />
                  <button onClick={() => removeScheduleRow(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                    <Icon name="x" size={14} color={DS.textDisabled} />
                  </button>
                </div>
              ))}
              <div style={{ ...typo.labelSmall, color: DS.textDisabled, textAlign: "right" }}>
                Suma: {formatCurrency(form.harmonogram.reduce((s, r) => s + (r.amount || 0), 0))}
              </div>
            </div>
          )}
          <Btn variant="ghost" icon="plus" onClick={addScheduleRow} small>Dodaj pozycję</Btn>
        </Section>
      )}

      {/* ── Tags ── */}
      <Section title="Tagi i notatki">
        <Field label="Tagi">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {TAGS.map(tag => {
              const isActive = form.tags.includes(tag.id);
              return (
                <button key={tag.id} onClick={() => set("tags", isActive ? form.tags.filter(t => t !== tag.id) : [...form.tags, tag.id])}
                  style={{
                    padding: "5px 12px", ...S.pill, border: `1px solid ${isActive ? tag.color : DS.borderLight}`,
                    background: isActive ? tag.color + "18" : DS.neutralWhite, color: isActive ? tag.color : DS.textSecondary,
                    cursor: "pointer", ...typo.labelMedium, fontFamily: DS.fontFamily, transition: "all 0.15s",
                  }}>{tag.label}</button>
              );
            })}
          </div>
        </Field>
        <Field label="Notatki">
          <textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} placeholder="Dodatkowe informacje..."
            rows={2} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${DS.borderLight}`, borderRadius: 8, fontSize: 13, fontFamily: DS.fontFamily, color: DS.textPrimary, resize: "vertical", outline: "none" }} />
        </Field>
      </Section>
    </div>
  );
};

// ──── 13-doc-form-modal.js ────
/* ═══════════════════════════════════════════════════════════════
   DOC FORM MODAL — main shell (state, stepper, routing, footer)
   Sub-components: DocFormStepType, DocFormStepBasic (12),
                   DocFormStepClassification, DocFormStepFormalities (13)
   ═══════════════════════════════════════════════════════════════ */
const DocFormModal = ({ onClose, onSave, docs, editDoc }) => {
  const isEdit = !!editDoc;
  const isSimple = (type) => DOC_TYPE_META[type]?.simpleForm;
  const getStepLabels = (type) => isSimple(type) ? ["Typ dokumentu", "Dane dokumentu"] : ["Typ dokumentu", "Dane podstawowe", "Klasyfikacja", "Formalności"];
  const [step, setStep] = useState(isEdit ? 1 : 0);
  const [form, setForm] = useState(() => {
    if (editDoc) return { ...editDoc };
    return {
      type: "", status: "w_przygotowaniu", title: "", number: "", nrEwidencyjny: "", rodzajUmowy: "wydatkowa",
      contractor: "", dept: DEPARTMENTS[0], assignee: 1, netValue: 0, grossValue: 0,
      classification: "", dateCreated: new Date().toISOString().split("T")[0],
      dateStart: "", dateEnd: "", tags: [], alerts: [], notes: "",
      linkedTo: null, uploadedFile: null,
      zamowieniePubliczne: false, tryb_pzp: "", nr_postepowania: "",
      dofinansowanie: false, zrodloDofinansowania: "",
      podpisStonn: false, kontrasygnatSkarbnika: false,
      harmonogram: [],
    };
  });
  const [ocrStep, setOcrStep] = useState(null);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const curMeta = DOC_TYPE_META[form.type] || {};
  const stepLabels = getStepLabels(form.type);
  const maxStep = stepLabels.length - 1;

  const canNext = () => {
    if (step === 0) return !!form.type;
    if (step === 1) {
      if (!form.title) return false;
      if (curMeta.linkRequired && !form.linkedTo) return false;
      return true;
    }
    return true;
  };

  return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(10,15,42,0.35)", zIndex: 200, animation: "fadeIn 0.15s ease", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 600, maxHeight: "85vh", background: DS.neutralWhite, borderRadius: 16,
        boxShadow: "0 24px 64px rgba(10,15,42,0.18)", zIndex: 201,
        animation: "modalIn 0.2s ease", overflow: "hidden", ...S.col,
      }}>
        {/* ── Header ── */}
        <div style={{
          padding: "16px 20px", ...S.row, gap: 10,
          borderBottom: `1px solid ${DS.borderLight}`,
          background: `linear-gradient(135deg, ${DS.primaryLighter}, ${DS.neutralWhite})`,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, ...S.row, justifyContent: "center",
            background: `linear-gradient(135deg, ${DS.primaryLight}, ${DS.primaryDark})`,
          }}>
            <Icon name={isEdit ? "edit" : "plus"} size={18} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ ...typo.titleSmall, color: DS.primaryMain }}>{isEdit ? "Edycja dokumentu" : "Nowy dokument"}</div>
            <div style={{ ...typo.bodySmall, color: DS.textSecondary }}>
              {isEdit ? DOC_TYPES[form.type]?.label : stepLabels[step]}
              {isEdit && <span style={{ ...typo.labelSmall, color: DS.textDisabled, marginLeft: 6 }}>• typ zablokowany</span>}
            </div>
          </div>
          <Btn variant="ghost" icon="x" onClick={onClose} small />
        </div>

        {/* ── Step indicator — circle style ── */}
        <div style={{ display: "flex", alignItems: "center", padding: "12px 20px", background: DS.neutralLighter, gap: 0 }}>
          {stepLabels.map((label, i) => {
            const isDone = i < step;
            const isCurrent = i === step;
            const circleSize = 28;
            return (
              <React.Fragment key={i}>
                {i > 0 && <div style={{ flex: 1, height: 2, background: isDone || isCurrent ? DS.primaryLight : DS.borderLight, transition: "background 0.3s" }} />}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  <div style={{
                    width: circleSize, height: circleSize, borderRadius: "50%",
                    background: isDone ? DS.successMain : isCurrent ? DS.primaryLight : DS.neutralWhite,
                    border: `2px solid ${isDone ? DS.successMain : isCurrent ? DS.primaryLight : DS.borderLight}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.3s",
                  }}>
                    {isDone ? <Icon name="check" size={14} color="#fff" /> :
                      <span style={{ ...typo.labelSmall, fontWeight: 700, color: isCurrent ? "#fff" : DS.textDisabled }}>{i + 1}</span>}
                  </div>
                  <span style={{
                    ...typo.labelSmall, fontSize: 9, color: isDone ? DS.successDark : isCurrent ? DS.primaryDark : DS.textDisabled,
                    maxWidth: 64, textAlign: "center", lineHeight: "1.2",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>{label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* ── Content — route to step sub-components ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {step === 0 && !ocrStep && <DocFormStepType form={form} set={set} />}
          {step === 1 && <DocFormStepBasic form={form} set={set} docs={docs} ocrStep={ocrStep} setOcrStep={setOcrStep} />}
          {step === 2 && !isSimple(form.type) && <DocFormStepClassification form={form} set={set} />}
          {step === 3 && !isSimple(form.type) && <DocFormStepFormalities form={form} set={set} />}
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: "12px 20px", borderTop: `1px solid ${DS.borderLight}`,
          display: "flex", justifyContent: "space-between", alignItems: "center", background: DS.neutralLighter,
        }}>
          <div>
            {step > (isEdit ? 1 : 0) && (
              <Btn variant="ghost" icon="chevronLeft" onClick={() => setStep(s => s - 1)} small>Wstecz</Btn>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="ghost" onClick={onClose} small>Anuluj</Btn>
            {step < maxStep ? (
              <Btn variant="accent" icon="chevronRight" onClick={() => setStep(s => s + 1)} small
                style={{ opacity: canNext() ? 1 : 0.5, pointerEvents: canNext() ? "auto" : "none" }}>Dalej</Btn>
            ) : (
              <Btn variant="accent" icon="check" onClick={() => onSave(form)} small>{isEdit ? "Zapisz zmiany" : "Dodaj dokument"}</Btn>
            )}
          </div>
        </div>
      </div>
      </div>
  );
};

// ──── 14-search-ocr.js ────
/* ═══════════════════════════════════════════════════════════════
   GLOBAL SEARCH MODAL — Cmd+K (P1 pattern)
   ═══════════════════════════════════════════════════════════════ */
const GlobalSearchModal = ({ visible, onClose, docs, onSelectDoc }) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => { if (visible && inputRef.current) inputRef.current.focus(); }, [visible]);
  useEffect(() => { if (!visible) setQuery(""); }, [visible]);

  if (!visible) return null;

  const q = query.toLowerCase();
  const matchedDocs = q ? docs.filter(d =>
    (d.title || "").toLowerCase().includes(q) ||
    (d.number || "").toLowerCase().includes(q) ||
    (d.contractor || "").toLowerCase().includes(q)
  ).slice(0, 6) : [];

  const matchedClass = q ? CLASSIFICATIONS.filter(c =>
    c.code.toLowerCase().includes(q) || c.label.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const matchedContractors = q ? CONTRACTORS.filter(c =>
    c.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const hasResults = matchedDocs.length + matchedClass.length + matchedContractors.length > 0;

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(10,15,42,0.4)", zIndex: 200 }} onClick={onClose} />
      <div style={{
        position: "fixed", top: "15%", left: "50%", transform: "translateX(-50%)",
        width: 560, maxHeight: "60vh", background: DS.neutralWhite, borderRadius: 16,
        boxShadow: DS.shadowXl, zIndex: 201, ...S.col,
        overflow: "hidden", animation: "slideDown 0.15s ease",
      }}>
        {/* Search input */}
        <div style={{ ...S.row, gap: 10, padding: "14px 18px", borderBottom: `1px solid ${DS.borderLight}` }}>
          <Icon name="search" size={18} color={DS.neutralMain} />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Szukaj dokumentów, klasyfikacji, kontrahentów..."
            onKeyDown={e => e.key === "Escape" && onClose()}
            style={{
              flex: 1, border: "none", outline: "none", fontSize: 15, fontFamily: DS.fontFamily,
              color: DS.textPrimary, background: "transparent",
            }} />
          <kbd style={{
            ...typo.labelSmall, padding: "2px 6px", borderRadius: 4,
            border: `1px solid ${DS.borderLight}`, color: DS.textDisabled, background: DS.neutralLighter,
          }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{ flex: 1, overflowY: "auto", padding: query ? "8px 0" : "20px", maxHeight: 400 }}>
          {!query && (
            <div style={{ textAlign: "center", color: DS.textDisabled, ...typo.bodySmall }}>
              <Icon name="command" size={24} color={DS.neutralLight} style={{ display: "block", margin: "0 auto 8px" }} />
              Zacznij pisać aby wyszukać...
            </div>
          )}
          {query && !hasResults && (
            <div style={{ textAlign: "center", padding: 20, color: DS.textDisabled, ...typo.bodySmall }}>
              Brak wyników dla „{query}"
            </div>
          )}

          {matchedDocs.length > 0 && (
            <>
              <div style={{ ...typo.labelSmall, color: DS.textDisabled, textTransform: "uppercase", letterSpacing: 0.8, padding: "6px 18px" }}>Dokumenty</div>
              {matchedDocs.map(doc => {
                const t = DOC_TYPES[doc.type] || DOC_TYPES.inne;
                return (
                  <div key={doc.id} onClick={() => { onSelectDoc(doc); onClose(); }} style={{
                    ...S.row, gap: 10, padding: "8px 18px", cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = DS.neutralLighter}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <Icon name={t.icon} size={14} color={t.color} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ ...typo.bodySmall, fontWeight: 500, color: DS.textPrimary, ...S.truncate }}>{doc.title}</div>
                      <div style={{ ...typo.labelSmall, color: DS.textDisabled }}>{doc.number || "brak numeru"} · {doc.contractor || "—"}</div>
                    </div>
                    <Badge color={t.color} bg={t.bg} small>{t.label}</Badge>
                  </div>
                );
              })}
            </>
          )}

          {matchedClass.length > 0 && (
            <>
              <div style={{ ...typo.labelSmall, color: DS.textDisabled, textTransform: "uppercase", letterSpacing: 0.8, padding: "10px 18px 6px" }}>Klasyfikacje</div>
              {matchedClass.map(c => (
                <div key={c.code} style={{ ...S.row, gap: 10, padding: "8px 18px", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = DS.neutralLighter}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <Icon name="tag" size={14} color={DS.textDisabled} />
                  <div style={{ flex: 1 }}>
                    <div style={{ ...typo.bodySmall, fontWeight: 500, color: DS.textPrimary, fontFamily: "monospace" }}>{c.code}</div>
                    <div style={{ ...typo.labelSmall, color: DS.textDisabled }}>{c.label}</div>
                  </div>
                  <span style={{ ...typo.labelSmall, color: DS.textDisabled }}>{Math.round((c.used/c.budget)*100)}% planu</span>
                </div>
              ))}
            </>
          )}

          {matchedContractors.length > 0 && (
            <>
              <div style={{ ...typo.labelSmall, color: DS.textDisabled, textTransform: "uppercase", letterSpacing: 0.8, padding: "10px 18px 6px" }}>Kontrahenci</div>
              {matchedContractors.map(c => (
                <div key={c} style={{ ...S.row, gap: 10, padding: "8px 18px", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = DS.neutralLighter}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <Icon name="users" size={14} color={DS.textDisabled} />
                  <span style={{ ...typo.bodySmall, color: DS.textPrimary }}>{c}</span>
                  <span style={{ ...typo.labelSmall, color: DS.textDisabled }}>{docs.filter(d => d.contractor === c).length} dok.</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   BUDGET CONTEXT BAR — traffic light in drawer (P1 pattern)
   ═══════════════════════════════════════════════════════════════ */
const BudgetContextBar = ({ classification, docGrossValue }) => {
  const cls = CLASSIFICATIONS.find(c => c.code === classification);
  if (!cls) return null;

  const currentPct = cls.used / cls.budget;
  const afterPct = (cls.used + (docGrossValue || 0)) / cls.budget;
  const remaining = cls.budget - cls.used - (docGrossValue || 0);

  const trafficColor = afterPct >= 0.85 ? DS.errorMain : afterPct >= 0.60 ? DS.warningMain : DS.successMain;
  const trafficBg = afterPct >= 0.85 ? DS.errorLighter : afterPct >= 0.60 ? DS.warningLighter : DS.successLighter;
  const trafficLabel = afterPct >= 0.85 ? "Przekroczenie ryzyka" : afterPct >= 0.60 ? "Zbliża się do limitu" : "W normie";

  return (
    <div style={{
      margin: "0 -16px", padding: "10px 16px", background: trafficBg,
      borderBottom: `1px solid ${trafficColor}30`, ...S.row, gap: 10,
    }}>
      <div style={{
        width: 10, height: 10, borderRadius: "50%", background: trafficColor, flexShrink: 0,
        boxShadow: `0 0 6px ${trafficColor}60`,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...typo.labelSmall, color: trafficColor, fontWeight: 600 }}>{trafficLabel}</div>
        <div style={{ ...typo.labelSmall, color: DS.textSecondary }}>
          {cls.code} · Pozostało: {formatCurrency(remaining)} ({Math.round((1 - afterPct) * 100)}%)
        </div>
      </div>
      <div style={{
        width: 60, height: 6, background: `${trafficColor}30`, borderRadius: 3, overflow: "hidden",
      }}>
        <div style={{ height: "100%", width: `${Math.min(afterPct * 100, 100)}%`, background: trafficColor, borderRadius: 3 }} />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   AI SUGGESTION BANNER — heuristic classification (P3 pattern)
   ═══════════════════════════════════════════════════════════════ */
const AiSuggestionBanner = ({ title, contractor, onAccept }) => {
  const [visible, setVisible] = useState(false);
  const [suggestion, setSuggestion] = useState(null);

  useEffect(() => {
    if (!title || title.length < 5) { setVisible(false); return; }
    // Heuristic: suggest classification based on keywords
    const t = (title + " " + (contractor || "")).toLowerCase();
    let match = null;
    let confidence = 0;
    if (t.includes("drog") || t.includes("remont") || t.includes("infrastruktur")) {
      match = CLASSIFICATIONS[0]; confidence = t.includes("drog") ? 92 : 78;
    } else if (t.includes("it") || t.includes("usług") || t.includes("obsług")) {
      match = CLASSIFICATIONS[1]; confidence = 85;
    } else if (t.includes("szkoł") || t.includes("eduk") || t.includes("dydaktyczn")) {
      match = CLASSIFICATIONS[2]; confidence = 88;
    } else if (t.includes("odpad") || t.includes("środowisk") || t.includes("oczyszczan")) {
      match = CLASSIFICATIONS[3]; confidence = 90;
    } else if (t.includes("kultur") || t.includes("dom kultury")) {
      match = CLASSIFICATIONS[4]; confidence = 82;
    }
    if (match) {
      setSuggestion({ classification: match, confidence });
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [title, contractor]);

  if (!visible || !suggestion) return null;

  return (
    <div style={{
      ...S.row, gap: 10, padding: "10px 14px",
      background: `linear-gradient(135deg, ${DS.primaryLighter}, ${DS.secondaryLighter})`,
      borderRadius: 10, border: `1px solid ${DS.primaryLight}`, marginBottom: 14,
    }}>
      <Icon name="sparkles" size={16} color={DS.primaryLight} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...typo.labelSmall, color: DS.primaryDark, fontWeight: 600 }}>
          Sugestia AI · {suggestion.confidence}% pewności
        </div>
        <div style={{ ...typo.bodySmall, color: DS.textPrimary, marginTop: 2 }}>
          {suggestion.classification.code} — {suggestion.classification.label}
        </div>
      </div>
      <Btn variant="accent" small onClick={() => { onAccept(suggestion.classification.code); setVisible(false); }}>
        Zastosuj
      </Btn>
      <Btn variant="ghost" icon="x" small onClick={() => setVisible(false)} />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   OCR WIZARD — scan → auto-prefill (Iter 3, from P1)
   ═══════════════════════════════════════════════════════════════ */
const OcrWizard = ({ visible, onClose, onPrefill }) => {
  const [step, setStep] = useState(0); // 0=upload, 1=processing, 2=results
  const [fileName, setFileName] = useState("");

  // Simulated OCR results
  const ocrResults = {
    title: "Faktura za materiały biurowe",
    contractor: "BiuroPlus Sp. z o.o.",
    number: "FV/2025/OCR-001",
    netValue: 3450,
    grossValue: 4243.50,
    dateCreated: "2025-02-10",
    classification: "750-75023-4210",
    confidence: 87,
  };

  const handleUpload = () => {
    setFileName("skan_faktura_2025_02.pdf");
    setStep(1);
    setTimeout(() => setStep(2), 1800); // simulate OCR
  };

  const handleAccept = () => {
    onPrefill(ocrResults);
    onClose();
    setStep(0);
  };

  if (!visible) return null;

  return (
    <>
      <div style={{
        position: "fixed", inset: 0, background: "rgba(10,15,42,0.35)",
        zIndex: 200, animation: "fadeIn 0.15s ease",
      }} onClick={onClose} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: 520, background: DS.neutralWhite, borderRadius: 16,
        boxShadow: "0 24px 64px rgba(10,15,42,0.18)", zIndex: 201,
        animation: "modalIn 0.2s ease", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px", ...S.row, gap: 10,
          borderBottom: `1px solid ${DS.borderLight}`,
          background: `linear-gradient(135deg, ${DS.primaryLighter}, ${DS.neutralWhite})`,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, ...S.row, justifyContent: "center",
            background: `linear-gradient(135deg, ${DS.primaryLight}, ${DS.primaryDark})`,
          }}>
            <Icon name="camera" size={18} color="#fff" />
          </div>
          <div>
            <div style={{ ...typo.titleSmall, color: DS.primaryMain }}>OCR Wizard</div>
            <div style={{ ...typo.bodySmall, color: DS.textSecondary }}>Skanuj dokument i wypełnij automatycznie</div>
          </div>
          <div style={{ flex: 1 }} />
          <Btn variant="ghost" icon="x" onClick={onClose} small />
        </div>

        {/* Steps indicator */}
        <div style={{ display: "flex", gap: 4, padding: "12px 20px", background: DS.neutralLighter }}>
          {["Wgraj skan", "Rozpoznawanie", "Wyniki OCR"].map((label, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{
                height: 4, borderRadius: 2, marginBottom: 6,
                background: i <= step ? DS.primaryLight : DS.borderLight,
                transition: "background 0.3s",
              }} />
              <span style={{ ...typo.labelSmall, color: i <= step ? DS.primaryDark : DS.textDisabled }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: "20px" }}>
          {step === 0 && (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div onClick={handleUpload} style={{
                border: `2px dashed ${DS.primaryLight}`, borderRadius: 12, padding: "32px 24px",
                cursor: "pointer", transition: "all 0.15s",
                background: DS.neutralLighter,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = DS.primaryLight; e.currentTarget.style.background = DS.primaryLighter; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = DS.primaryLight; e.currentTarget.style.background = DS.neutralLighter; }}
              >
                <Icon name="upload" size={32} color={DS.primaryLight} style={{ marginBottom: 12 }} />
                <div style={{ ...typo.bodyMedium, color: DS.textPrimary, marginBottom: 4 }}>Przeciągnij plik lub kliknij</div>
                <div style={{ ...typo.bodySmall, color: DS.textDisabled }}>PDF, JPG, PNG • max 10 MB</div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%", margin: "0 auto 16px",
                border: `3px solid ${DS.borderLight}`, borderTopColor: DS.primaryLight,
                animation: "spin 1s linear infinite",
              }} />
              <div style={{ ...typo.bodyMedium, color: DS.textPrimary, marginBottom: 4 }}>Rozpoznawanie tekstu...</div>
              <div style={{ ...typo.bodySmall, color: DS.textSecondary }}>{fileName}</div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ ...S.row, gap: 8, marginBottom: 16 }}>
                <Icon name="sparkles" size={16} color={DS.successMain} />
                <span style={{ ...typo.bodyMedium, color: DS.successDark }}>Rozpoznano {ocrResults.confidence}% pól</span>
              </div>
              {[
                { label: "Tytuł", value: ocrResults.title },
                { label: "Kontrahent", value: ocrResults.contractor },
                { label: "Numer", value: ocrResults.number },
                { label: "Wartość netto", value: formatCurrency(ocrResults.netValue) },
                { label: "Wartość brutto", value: formatCurrency(ocrResults.grossValue) },
                { label: "Klasyfikacja", value: ocrResults.classification },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between", padding: "8px 0",
                  borderBottom: `1px solid ${DS.borderLight}`,
                }}>
                  <span style={{ ...typo.labelMedium, color: DS.textSecondary }}>{label}</span>
                  <span style={{ ...typo.bodySmall, color: DS.textPrimary, fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 2 && (
          <div style={{
            padding: "12px 20px", display: "flex", justifyContent: "flex-end", gap: 8,
            borderTop: `1px solid ${DS.borderLight}`, background: DS.neutralLighter,
          }}>
            <Btn variant="secondary" onClick={() => { setStep(0); }} small>Skanuj ponownie</Btn>
            <Btn variant="accent" icon="sparkles" onClick={handleAccept} small>Zastosuj dane OCR</Btn>
          </div>
        )}
      </div>
    </>
  );
};

// ──── 15-skarbnik-export.js ────
/* ═══════════════════════════════════════════════════════════════
   SKARBNIK SUMMARY VIEW
   ═══════════════════════════════════════════════════════════════ */
const SkarbnikSummary = ({ docs, onSelectDoc, onNavigateFiltered }) => {
  const [showPct, setShowPct] = useState(false);

  /* ── data ── */
  const totalGross = docs.reduce((s, d) => s + (d.grossValue || 0), 0);
  const activeUmowy = docs.filter(d => d.type === "umowa" && d.status === "w_realizacji");
  const umowyVal = activeUmowy.reduce((s,d) => s + (d.grossValue||0), 0);
  const fakturyAll = docs.filter(d => d.type === "faktura");
  const fakturyVal = fakturyAll.reduce((s,d) => s + (d.grossValue||0), 0);
  const allUmowy = docs.filter(d => d.type === "umowa");
  const allUmowyVal = allUmowy.reduce((s,d) => s + (d.grossValue||0), 0);
  const allAlertDocs = [];
  docs.forEach(d => { (d.alerts || []).forEach(code => { if (ALERT_TYPES[code]) allAlertDocs.push({ doc: d, code }); }); });
  const recentDocs = [...docs].sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated)).slice(0, 10);
  const totalBudget = CLASSIFICATIONS.reduce((s,c) => s + c.budget, 0);
  const totalUsed = CLASSIFICATIONS.reduce((s,c) => s + c.used, 0);

  /* ── KPI config ── */
  const kpis = [
    { label: "Umowy w realizacji", value: activeUmowy.length, sub: formatCurrency(umowyVal), icon: "file", color: DS.primaryLightUmowyMain, bg: DS.primaryLightUmowyLighter,
      onClick: () => onNavigateFiltered("umowa", { status: ["w_realizacji"] }) },
    { label: "Faktury", value: fakturyAll.length, sub: formatCurrency(fakturyVal), icon: "receipt", color: "#0A7BE5", bg: "#E0EEFF",
      onClick: () => onNavigateFiltered("faktura", { status: ["zweryfikowana"] }) },
    { label: "Wartość umów", value: formatCurrency(allUmowyVal), sub: `${allUmowy.length} umów`, icon: "trendingUp", color: DS.successDark, bg: DS.successLighter,
      onClick: () => onNavigateFiltered("umowa", {}), isAmount: true },
    { label: "Alerty", value: allAlertDocs.length, sub: `${new Set(allAlertDocs.map(a=>a.doc.id)).size} dok.`, icon: "zap", color: DS.errorDark, bg: DS.errorLighter,
      onClick: null },
  ];

  /* ── toggle switch helper ── */
  const Toggle = ({ on, onToggle, label }) => (
    <div style={{ ...S.row, gap: 6, cursor: "pointer", userSelect: "none" }} onClick={onToggle}>
      <div style={{ width: 32, height: 18, borderRadius: 9, background: on ? DS.primaryLightUmowyMain : DS.neutralMain, transition: "background 0.2s", position: "relative", flexShrink: 0 }}>
        <div style={{ width: 14, height: 14, borderRadius: 7, background: DS.neutralWhite, position: "absolute", top: 2, left: on ? 16 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
      </div>
      <span style={{ ...typo.labelSmall, color: DS.textSecondary }}>{label}</span>
    </div>
  );

  /* ── AlertBadge with tooltip ── */
  const AlertBadge = ({ code, style: extraStyle = {} }) => {
    const [tip, setTip] = useState(false);
    const a = ALERT_TYPES[code]; if (!a) return null;
    return (
      <span style={{ position: "relative", display: "inline-flex" }}
        onMouseEnter={() => setTip(true)} onMouseLeave={() => setTip(false)}>
        <span style={{ width: 20, height: 20, borderRadius: 5, background: a.bg, display: "inline-flex", alignItems: "center", justifyContent: "center", ...extraStyle }}>
          <Icon name={a.icon} size={11} color={a.color} />
        </span>
        {tip && <div style={{ position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
          background: DS.primaryMain, color: DS.neutralWhite, padding: "5px 10px", borderRadius: 6, whiteSpace: "nowrap",
          ...typo.labelSmall, fontSize: 10, zIndex: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.18)", pointerEvents: "none" }}>
          {a.label}
          <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", width: 0, height: 0,
            borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `5px solid ${DS.primaryMain}` }} />
        </div>}
      </span>
    );
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", background: DS.neutralLighter }}>
      {/* Header */}
      <div style={{ ...S.rowBetween, marginBottom: 20 }}>
        <div>
          <div style={{ ...typo.titleLarge, color: DS.primaryMain }}>Monitor skarbnika</div>
          <div style={{ ...typo.bodySmall, color: DS.textDisabled, marginTop: 2 }}>Stan na {new Date().toLocaleDateString("pl-PL")} • Gmina Publink</div>
        </div>
      </div>

      {/* ═══ ROW 1 — KPI Widgets ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        {kpis.map((kpi, i) => (
          <div key={i} onClick={kpi.onClick || undefined}
            style={{
              background: DS.neutralWhite, borderRadius: 10, border: `1px solid ${kpi.color}40`,
              padding: "14px 16px", cursor: kpi.onClick ? "pointer" : "default",
              transition: "all 0.15s", position: "relative",
            }}
            onMouseEnter={e => { if (kpi.onClick) { e.currentTarget.style.borderColor = kpi.color; e.currentTarget.style.boxShadow = `0 2px 8px ${kpi.color}15`; }}}
            onMouseLeave={e => { e.currentTarget.style.borderColor = kpi.color + "40"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ ...S.row, gap: 8, marginBottom: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: kpi.bg, ...S.row, justifyContent: "center" }}>
                <Icon name={kpi.icon} size={15} color={kpi.color} />
              </div>
              <span style={{ ...typo.labelSmall, color: DS.textDisabled, textTransform: "uppercase", letterSpacing: 0.4, fontSize: 10 }}>{kpi.label}</span>
            </div>
            <div style={{ ...typo.titleLarge, color: kpi.color, fontSize: kpi.isAmount ? 18 : 26, fontVariantNumeric: "tabular-nums", lineHeight: 1.1, marginBottom: 2 }}>{kpi.value}</div>
            <div style={{ ...typo.labelSmall, color: DS.textSecondary, fontSize: 11 }}>{kpi.sub}</div>
            {kpi.onClick && <Icon name="chevronRight" size={12} color={DS.textDisabled} style={{ position: "absolute", top: 14, right: 12 }} />}
          </div>
        ))}
      </div>

      {/* ═══ ROW 2 — Alerty + Wydatki side by side ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        {/* LEFT — Alerty */}
        <div style={{ background: DS.neutralWhite, borderRadius: 10, border: `1px solid ${DS.borderLightLight}`, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ ...S.rowBetween, padding: "12px 16px", borderBottom: `1px solid ${DS.borderLightLight}` }}>
            <div style={{ ...S.row, gap: 6 }}>
              <Icon name="zap" size={14} color={DS.warningMain} />
              <span style={{ ...typo.labelMedium, color: DS.primaryMain, fontWeight: 600 }}>Alerty</span>
              <span style={{ ...typo.labelSmall, color: DS.textDisabled, background: DS.neutralLight, padding: "0 6px", borderRadius: 8, fontSize: 10 }}>{allAlertDocs.length}</span>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", maxHeight: 280 }}>
            {allAlertDocs.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", ...typo.bodySmall, color: DS.successMain }}>
                <Icon name="checkCircle" size={16} color={DS.successMain} style={{ verticalAlign: "text-bottom", marginRight: 4 }} />Brak alertów
              </div>
            ) : allAlertDocs.map((item, idx) => {
              const info = ALERT_TYPES[item.code];
              return (
                <div key={`${item.doc.id}-${item.code}-${idx}`}
                  onClick={() => onSelectDoc(item.doc)}
                  style={{
                    ...S.row, gap: 10, padding: "9px 14px", cursor: "pointer",
                    borderBottom: idx < allAlertDocs.length - 1 ? `1px solid ${DS.borderLightLight}` : "none",
                    borderLeft: `3px solid ${info.color}`, background: info.bg + "30",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = info.bg + "70"}
                  onMouseLeave={e => e.currentTarget.style.background = info.bg + "30"}
                >
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: info.color + "18", ...S.row, justifyContent: "center", flexShrink: 0 }}>
                    <Icon name={info.icon} size={12} color={info.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...typo.labelSmall, color: DS.textPrimary, fontWeight: 500, ...S.truncate, fontSize: 11 }}>
                      {item.doc.number || "—"} • {item.doc.title}
                    </div>
                    <div style={{ ...typo.labelSmall, color: DS.textDisabled, fontSize: 10 }}>{item.doc.contractor}</div>
                  </div>
                  <span style={{ ...typo.labelSmall, color: info.color, fontWeight: 600, fontSize: 10, background: info.color + "15", padding: "1px 6px", borderRadius: 4, flexShrink: 0 }}>{item.code}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT — Wydatki */}
        <div style={{ background: DS.neutralWhite, borderRadius: 10, border: `1px solid ${DS.borderLightLight}`, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ ...S.rowBetween, padding: "12px 16px", borderBottom: `1px solid ${DS.borderLightLight}` }}>
            <div style={{ ...S.row, gap: 6 }}>
              <Icon name="pieChart" size={14} color={DS.primaryMain} />
              <span style={{ ...typo.labelMedium, color: DS.primaryMain, fontWeight: 600 }}>Wydatki</span>
              <span style={{ ...typo.labelSmall, color: DS.textDisabled, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(totalUsed)}</span>
            </div>
            <Toggle on={showPct} onToggle={() => setShowPct(p => !p)} label="% planu" />
          </div>
          <div style={{ flex: 1, overflowY: "auto", maxHeight: 280, padding: "12px 16px" }}>
            {CLASSIFICATIONS.sort((a, b) => (b.used/b.budget) - (a.used/a.budget)).map(c => {
              const pct = Math.round((c.used / c.budget) * 100);
              const barColor = pct >= 85 ? DS.errorMain : pct >= 60 ? DS.warningMain : DS.successMain;
              return (
                <div key={c.code} style={{ marginBottom: 12 }}>
                  <div style={{ ...S.rowBetween, marginBottom: 3 }}>
                    <div style={{ ...S.row, gap: 6, minWidth: 0, flex: 1 }}>
                      <span style={{ ...typo.labelSmall, color: DS.primaryMain, fontFamily: DS.fontFamily, fontWeight: 600, fontSize: 10 }}>{c.code}</span>
                      <span style={{ ...typo.labelSmall, color: DS.textSecondary, ...S.truncate, fontSize: 10 }}>{c.label}</span>
                    </div>
                    <span style={{ ...typo.labelSmall, fontWeight: 600, fontVariantNumeric: "tabular-nums", flexShrink: 0, color: showPct ? barColor : DS.textPrimary, fontSize: 11 }}>
                      {showPct ? `${pct}%` : formatCurrency(c.used)}
                    </span>
                  </div>
                  {showPct && (
                    <div style={{ height: 6, background: DS.neutralLight, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 3, width: `${Math.min(pct, 100)}%`, background: barColor, transition: "width 0.3s" }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ ROW 3 — Ostatnio dodane dokumenty ═══ */}
      <div style={{ background: DS.neutralWhite, borderRadius: 10, border: `1px solid ${DS.borderLightLight}`, overflow: "hidden" }}>
        <div style={{ ...S.rowBetween, padding: "12px 16px", borderBottom: `1px solid ${DS.borderLightLight}` }}>
          <div style={{ ...S.row, gap: 6 }}>
            <Icon name="clock" size={14} color={DS.primaryMain} />
            <span style={{ ...typo.labelMedium, color: DS.primaryMain, fontWeight: 600 }}>Ostatnio dodane dokumenty</span>
          </div>
        </div>
        {recentDocs.map((doc, idx) => {
          const typeInfo = DOC_TYPES[doc.type] || DOC_TYPES.inne;
          const hasAlerts = doc.alerts && doc.alerts.length > 0;
          return (
            <div key={doc.id}
              onClick={() => onSelectDoc(doc)}
              style={{
                ...S.row, gap: 10, padding: "8px 14px", cursor: "pointer",
                borderBottom: idx < recentDocs.length - 1 ? `1px solid ${DS.borderLightLight}` : "none",
                transition: "background 0.12s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = DS.neutralLighter}
              onMouseLeave={e => e.currentTarget.style.background = DS.neutralWhite}
            >
              <div style={{ width: 26, height: 26, borderRadius: 6, background: typeInfo.bg, ...S.row, justifyContent: "center", flexShrink: 0 }}>
                <Icon name={typeInfo.icon} size={12} color={typeInfo.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...S.row, gap: 5 }}>
                  <span style={{ ...typo.labelSmall, color: DS.textPrimary, fontWeight: 500, fontSize: 11 }}>{doc.number || "—"}</span>
                  <span style={{ ...typo.labelSmall, color: typeInfo.color, background: typeInfo.bg, padding: "0 5px", borderRadius: 3, fontSize: 9 }}>{typeInfo.label}</span>
                  {hasAlerts && doc.alerts.map(code => <AlertBadge key={code} code={code} />)}
                </div>
                <div style={{ ...typo.labelSmall, color: DS.textDisabled, fontSize: 10, ...S.truncate }}>{doc.title}</div>
              </div>
              <div style={{ ...S.col, alignItems: "flex-end", flexShrink: 0 }}>
                <span style={{ ...typo.labelSmall, color: DS.textPrimary, fontVariantNumeric: "tabular-nums", fontSize: 11 }}>{doc.grossValue ? formatCurrency(doc.grossValue) : "—"}</span>
                <span style={{ ...typo.labelSmall, color: DS.textDisabled, fontSize: 10 }}>{doc.dateCreated}</span>
              </div>
              <Icon name="chevronRight" size={12} color={DS.textDisabled} style={{ flexShrink: 0 }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   EXPORT MODAL — export widoku do PDF/Excel (Iter 4)
   ═══════════════════════════════════════════════════════════════ */
const ExportModal = ({ visible, onClose, docs, selectedIds }) => {
  const [format, setFormat] = useState("pdf");
  const [scope, setScope] = useState(selectedIds.size > 0 ? "selected" : "all");
  const [includeValues, setIncludeValues] = useState(true);
  const [includeClassification, setIncludeClassification] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  if (!visible) return null;
  const count = scope === "selected" ? selectedIds.size : docs.length;

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => { setExporting(false); setDone(true); }, 1500);
  };

  const handleClose = () => { setDone(false); setExporting(false); onClose(); };

  return (
    <div onClick={handleClose} style={{
      position: "fixed", inset: 0, background: "rgba(26,37,105,0.3)", zIndex: 200,
      ...S.row, justifyContent: "center", animation: "fadeIn 0.2s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: DS.neutralWhite, borderRadius: 14, width: 440, boxShadow: "0 20px 60px rgba(26,37,105,0.18)",
        animation: "modalIn 0.25s ease",
      }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${DS.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ ...S.row, gap: 8 }}>
            <Icon name="download" size={18} color={DS.primaryLight} />
            <span style={{ fontSize: 16, fontWeight: 700, color: DS.textPrimary }}>Eksport dokumentów</span>
          </div>
          <Btn variant="ghost" icon="x" onClick={handleClose} small />
        </div>

        <div style={{ padding: 24 }}>
          {done ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#DCFCE7", ...S.row, justifyContent: "center", margin: "0 auto 12px" }}>
                <Icon name="check" size={24} color="#16A34A" />
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: DS.text, marginBottom: 4 }}>Eksport gotowy!</div>
              <div style={{ fontSize: 13, color: DS.textSecondary }}>
                Plik {format === "pdf" ? "zestawienie-dokumentow.pdf" : "zestawienie-dokumentow.xlsx"} ({count} dokumentów) został wygenerowany.
              </div>
              <Btn variant="primary" icon="download" onClick={handleClose} style={{ marginTop: 16 }}>Pobierz plik</Btn>
            </div>
          ) : (
            <>
              {/* Format */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: DS.textSecondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Format</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { id: "pdf", label: "PDF", desc: "Zestawienie do druku" },
                    { id: "xlsx", label: "Excel", desc: "Edytowalny arkusz" },
                  ].map(f => (
                    <div key={f.id} onClick={() => setFormat(f.id)} style={{
                      flex: 1, padding: 12, borderRadius: 8, cursor: "pointer",
                      border: `2px solid ${format === f.id ? DS.primaryLight : DS.borderLight}`,
                      background: format === f.id ? DS.primaryLight + "08" : DS.neutralWhite,
                    }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: DS.textPrimary }}>{f.label}</div>
                      <div style={{ fontSize: 12, color: DS.textSecondary, marginTop: 2 }}>{f.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scope */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: DS.textSecondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Zakres</div>
                {[
                  { id: "all", label: `Wszystkie dokumenty (${docs.length})` },
                  { id: "selected", label: `Zaznaczone (${selectedIds.size})`, disabled: selectedIds.size === 0 },
                ].map(s => (
                  <label key={s.id} style={{
                    ...S.row, gap: 8, padding: "6px 0", cursor: s.disabled ? "not-allowed" : "pointer",
                    opacity: s.disabled ? 0.4 : 1,
                  }}>
                    <input type="radio" name="scope" checked={scope === s.id} onChange={() => !s.disabled && setScope(s.id)}
                      style={{ accentColor: DS.primaryLight }} disabled={s.disabled} />
                    <span style={{ fontSize: 13, color: DS.textPrimary }}>{s.label}</span>
                  </label>
                ))}
              </div>

              {/* Options */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: DS.textSecondary, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Opcje</div>
                {[
                  { id: "values", label: "Kwoty netto/brutto", checked: includeValues, set: setIncludeValues },
                  { id: "classification", label: "Klasyfikacja budżetowa", checked: includeClassification, set: setIncludeClassification },
                ].map(opt => (
                  <label key={opt.id} style={{ ...S.row, gap: 8, padding: "4px 0", cursor: "pointer" }}>
                    <input type="checkbox" checked={opt.checked} onChange={() => opt.set(!opt.checked)} style={{ accentColor: DS.primaryLight }} />
                    <span style={{ fontSize: 13, color: DS.textPrimary }}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        {!done && (
          <div style={{ padding: "12px 24px 20px", display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Btn variant="ghost" onClick={handleClose}>Anuluj</Btn>
            <Btn variant="primary" icon={exporting ? null : "download"} onClick={handleExport} disabled={exporting}>
              {exporting ? "Generowanie…" : `Eksportuj ${count} dok.`}
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
};

// ──── 16-folders.js ────
/* ═══════════════════════════════════════════════════════════════
   FOLDER PANEL — teczki z drag & drop (Iter 4)
   ═══════════════════════════════════════════════════════════════ */
const FoldersView = ({ folders, setFolders, docs, onSelectDoc, activeFolderId, setActiveFolderId, viewMode, setViewMode, search, setSearch }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#A971F6");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [folderDocSearch, setFolderDocSearch] = useState("");

  const COLORS = ["#A971F6", "#21B9E5", "#38A169", "#E53E3E", "#DD6B20", "#1A2569"];

  const createFolder = () => {
    if (!newName.trim()) return;
    const id = "f" + Date.now();
    setFolders(prev => [...prev, { id, name: newName.trim(), color: newColor, icon: "folder", docIds: [], description: "", createdAt: new Date().toISOString().split("T")[0] }]);
    setNewName(""); setNewColor("#A971F6"); setShowCreate(false);
  };

  const deleteFolder = (folderId) => {
    setFolders(prev => prev.filter(f => f.id !== folderId));
    if (activeFolderId === folderId) setActiveFolderId(null);
  };

  const renameFolder = (folderId) => {
    if (!editName.trim()) return;
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name: editName.trim() } : f));
    setEditingId(null); setEditName("");
  };

  const removeDocFromFolder = (folderId, docId) => {
    setFolders(prev => prev.map(f =>
      f.id === folderId ? { ...f, docIds: f.docIds.filter(id => id !== docId) } : f
    ));
  };

  // FOLDER DETAIL VIEW
  const activeFolder = activeFolderId ? folders.find(f => f.id === activeFolderId) : null;
  if (activeFolder) {
    let folderDocs = activeFolder.docIds.map(id => docs.find(d => d.id === id)).filter(Boolean);
    if (folderDocSearch) {
      const q = folderDocSearch.toLowerCase();
      folderDocs = folderDocs.filter(d =>
        (d.title || "").toLowerCase().includes(q) || (d.number || "").toLowerCase().includes(q) ||
        (d.contractor || "").toLowerCase().includes(q) || (d.type || "").toLowerCase().includes(q)
      );
    }
    return (
      <div style={{ flex: 1, ...S.col, overflow: "hidden" }}>
        {/* Folder detail header */}
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${DS.borderLight}`, background: DS.neutralWhite }}>
          <div style={{ ...S.row, gap: 10, marginBottom: 10 }}>
            <button onClick={() => { setActiveFolderId(null); setFolderDocSearch(""); }} style={{ ...S.row, gap: 4, border: "none", background: "none", cursor: "pointer", color: DS.primaryLight, fontSize: 13, fontWeight: 500, fontFamily: DS.fontFamily, padding: 0 }}>
              <Icon name="chevronLeft" size={14} color={DS.primaryLight} /> Foldery
            </button>
          </div>
          <div style={{ ...S.row, gap: 12, justifyContent: "space-between" }}>
            <div style={{ ...S.row, gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: activeFolder.color + "18", ...S.row, justifyContent: "center" }}>
                <Icon name={activeFolder.icon || "folder"} size={18} color={activeFolder.color} />
              </div>
              <div>
                {editingId === activeFolder.id ? (
                  <div style={{ ...S.row, gap: 6 }}>
                    <input value={editName} onChange={e => setEditName(e.target.value)} autoFocus
                      onKeyDown={e => { if (e.key === "Enter") renameFolder(activeFolder.id); if (e.key === "Escape") setEditingId(null); }}
                      style={{ ...typo.titleMedium, color: DS.textPrimary, border: `1px solid ${DS.primaryLight}`, borderRadius: 6, padding: "2px 8px", outline: "none", fontFamily: DS.fontFamily, width: 300 }} />
                    <Btn variant="primary" icon="check" onClick={() => renameFolder(activeFolder.id)} small>OK</Btn>
                  </div>
                ) : (
                  <div style={{ ...typo.titleMedium, color: DS.textPrimary }}>{activeFolder.name}</div>
                )}
                {activeFolder.description && <div style={{ ...typo.bodySmall, color: DS.textSecondary, marginTop: 2 }}>{activeFolder.description}</div>}
              </div>
              <Badge color={DS.primaryDark} bg={DS.primaryLighter} small>{activeFolder.docIds.length} dok.</Badge>
            </div>
            <div style={{ ...S.row, gap: 6 }}>
              <Btn variant="ghost" icon="edit" small onClick={() => { setEditingId(activeFolder.id); setEditName(activeFolder.name); }}>Zmień nazwę</Btn>
              <Btn variant="ghost" icon="x" small onClick={() => deleteFolder(activeFolder.id)} style={{ color: DS.errorMain }}>Usuń folder</Btn>
            </div>
          </div>
          {/* Doc search within folder */}
          <div style={{ marginTop: 12, position: "relative", maxWidth: 340 }}>
            <Icon name="search" size={14} color={DS.textDisabled} style={{ position: "absolute", left: 10, top: 9 }} />
            <input value={folderDocSearch} onChange={e => setFolderDocSearch(e.target.value)}
              placeholder="Filtruj dokumenty w folderze…"
              style={{ width: "100%", padding: "7px 12px 7px 32px", borderRadius: 8, border: `1px solid ${DS.borderLight}`, fontSize: 13, fontFamily: DS.fontFamily, outline: "none" }} />
          </div>
        </div>
        {/* Document list inside folder */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 24px" }}>
          {folderDocs.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, color: DS.textDisabled }}>
              <Icon name="folder" size={40} color={DS.borderLight} />
              <div style={{ marginTop: 12, ...typo.bodyMedium }}>
                {folderDocSearch ? "Brak dokumentów pasujących do wyszukiwania" : "Ten folder jest pusty"}
              </div>
              <div style={{ ...typo.bodySmall, color: DS.textDisabled, marginTop: 4 }}>
                Zaznacz dokumenty w widoku Dokumenty i użyj „Dodaj do folderu"
              </div>
            </div>
          ) : (
            <div style={{ ...S.col, gap: 2 }}>
              {/* Table header */}
              <div style={{ ...S.row, padding: "8px 12px", borderBottom: `1px solid ${DS.borderLight}`, ...typo.labelSmall, color: DS.textSecondary }}>
                <div style={{ width: 90 }}>Typ</div>
                <div style={{ width: 120 }}>Numer</div>
                <div style={{ flex: 1 }}>Przedmiot</div>
                <div style={{ width: 160 }}>Kontrahent</div>
                <div style={{ width: 100 }}>Wartość</div>
                <div style={{ width: 100 }}>Status</div>
                <div style={{ width: 40 }} />
              </div>
              {folderDocs.map(doc => {
                const st = DOC_STATUSES[doc.status] || {};
                const tp = DOC_TYPES[doc.type] || {};
                return (
                  <div key={doc.id} onClick={() => onSelectDoc(doc)}
                    style={{ ...S.row, padding: "10px 12px", borderRadius: 8, cursor: "pointer", transition: "background 0.1s", borderBottom: `1px solid ${DS.borderLight}` }}
                    onMouseEnter={e => e.currentTarget.style.background = DS.neutralLighter}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ width: 90 }}>
                      <Badge color={tp.color || DS.textSecondary} bg={(tp.color || DS.textSecondary) + "14"} small>{tp.label || doc.type}</Badge>
                    </div>
                    <div style={{ width: 120, ...typo.bodySmall, color: DS.textSecondary, fontFamily: "monospace", fontSize: 11 }}>{doc.number || "—"}</div>
                    <div style={{ flex: 1, ...typo.bodySmall, color: DS.textPrimary, ...S.truncate, paddingRight: 12 }}>{doc.title}</div>
                    <div style={{ width: 160, ...typo.bodySmall, color: DS.textSecondary, ...S.truncate }}>{doc.contractor || "—"}</div>
                    <div style={{ width: 100, ...typo.bodySmall, color: DS.textPrimary, fontWeight: 500, textAlign: "right", paddingRight: 12 }}>{doc.grossValue ? formatCurrency(doc.grossValue) : "—"}</div>
                    <div style={{ width: 100 }}>
                      {st.label ? <Badge color={st.color} bg={st.bg} small>{st.label}</Badge> : <span style={{ ...typo.bodySmall, color: DS.textDisabled }}>—</span>}
                    </div>
                    <div style={{ width: 40, ...S.row, justifyContent: "center" }}>
                      <button onClick={e => { e.stopPropagation(); removeDocFromFolder(activeFolder.id, doc.id); }}
                        title="Usuń z folderu" style={{ border: "none", background: "none", cursor: "pointer", padding: 4, borderRadius: 4 }}
                        onMouseEnter={e => e.currentTarget.style.background = DS.errorLighter}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}>
                        <Icon name="x" size={14} color={DS.errorMain} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // FOLDER LIST VIEW (main)
  const filtered = folders.filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ flex: 1, ...S.col, overflow: "hidden" }}>
      {/* Header bar */}
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${DS.borderLight}`, background: DS.neutralWhite, ...S.row, gap: 12, justifyContent: "space-between" }}>
        <div style={{ ...S.row, gap: 12, flex: 1 }}>
          {/* Search */}
          <div style={{ position: "relative", maxWidth: 300, flex: 1 }}>
            <Icon name="search" size={14} color={DS.textDisabled} style={{ position: "absolute", left: 10, top: 9 }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Szukaj folderów…"
              style={{ width: "100%", padding: "7px 12px 7px 32px", borderRadius: 8, border: `1px solid ${DS.borderLight}`, fontSize: 13, fontFamily: DS.fontFamily, outline: "none" }} />
          </div>
          <Badge color={DS.textSecondary} bg={DS.neutralLighter}>{filtered.length} {filtered.length === 1 ? "folder" : "folderów"}</Badge>
        </div>
        <div style={{ ...S.row, gap: 8 }}>
          {/* View toggle */}
          <div style={{ ...S.row, borderRadius: 8, border: `1px solid ${DS.borderLight}`, overflow: "hidden" }}>
            {[{ id: "tiles", icon: "grid" }, { id: "list", icon: "list" }].map(v => (
              <button key={v.id} onClick={() => setViewMode(v.id)} style={{
                padding: "6px 10px", border: "none", cursor: "pointer",
                background: viewMode === v.id ? DS.primaryLighter : DS.neutralWhite,
                color: viewMode === v.id ? DS.primaryDark : DS.textSecondary,
              }}>
                <Icon name={v.icon} size={14} color={viewMode === v.id ? DS.primaryLight : DS.textDisabled} />
              </button>
            ))}
          </div>
          <Btn variant="primary" icon="folderPlus" small onClick={() => setShowCreate(true)}>Nowy folder</Btn>
        </div>
      </div>

      {/* Create folder form */}
      {showCreate && (
        <div style={{ margin: "12px 24px 0", background: DS.neutralLighter, borderRadius: 10, padding: 16, border: `1px solid ${DS.borderLight}` }}>
          <div style={{ ...typo.labelMedium, color: DS.textPrimary, marginBottom: 8 }}>Utwórz nowy folder</div>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nazwa folderu…" autoFocus
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${DS.borderLight}`, fontSize: 13, fontFamily: DS.fontFamily, marginBottom: 8, outline: "none", boxSizing: "border-box" }}
            onKeyDown={e => { if (e.key === "Enter") createFolder(); if (e.key === "Escape") setShowCreate(false); }} />
          <div style={{ ...S.row, gap: 6, marginBottom: 12 }}>
            {COLORS.map(c => (
              <div key={c} onClick={() => setNewColor(c)}
                style={{ width: 24, height: 24, borderRadius: 6, background: c, cursor: "pointer", border: newColor === c ? `2px solid ${DS.textPrimary}` : "2px solid transparent", transition: "border 0.1s" }} />
            ))}
          </div>
          <div style={{ ...S.row, gap: 8 }}>
            <Btn variant="primary" icon="check" onClick={createFolder} small>Utwórz</Btn>
            <Btn variant="ghost" onClick={() => { setShowCreate(false); setNewName(""); }} small>Anuluj</Btn>
          </div>
        </div>
      )}

      {/* Folder list content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48, color: DS.textDisabled }}>
            <Icon name="folder" size={48} color={DS.borderLight} />
            <div style={{ marginTop: 12, ...typo.bodyMedium }}>
              {search ? "Brak folderów pasujących do wyszukiwania" : "Brak folderów — utwórz pierwszy"}
            </div>
          </div>
        ) : viewMode === "tiles" ? (
          /* TILES VIEW */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {filtered.map(folder => {
              const count = folder.docIds.length;
              const folderDocs = folder.docIds.slice(0, 3).map(id => docs.find(d => d.id === id)).filter(Boolean);
              return (
                <div key={folder.id} onClick={() => setActiveFolderId(folder.id)}
                  style={{
                    background: DS.neutralWhite, borderRadius: 12, padding: 16,
                    border: `1px solid ${DS.borderLight}`, cursor: "pointer", transition: "all 0.15s",
                    boxShadow: DS.shadowSm,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = folder.color; e.currentTarget.style.boxShadow = DS.shadowMd; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = DS.borderLight; e.currentTarget.style.boxShadow = DS.shadowSm; }}>
                  <div style={{ ...S.row, gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: folder.color + "18", ...S.row, justifyContent: "center", flexShrink: 0 }}>
                      <Icon name={folder.icon || "folder"} size={20} color={folder.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ ...typo.titleSmall, color: DS.textPrimary, ...S.truncate }}>{folder.name}</div>
                      <div style={{ ...typo.labelSmall, color: DS.textSecondary, marginTop: 2 }}>{count} {count === 1 ? "dokument" : count < 5 ? "dokumenty" : "dokumentów"}</div>
                    </div>
                  </div>
                  {folder.description && <div style={{ ...typo.bodySmall, color: DS.textSecondary, ...S.truncate, marginBottom: 8 }}>{folder.description}</div>}
                  {folderDocs.length > 0 && (
                    <div style={{ ...S.col, gap: 2 }}>
                      {folderDocs.map(doc => (
                        <div key={doc.id} style={{ ...S.row, gap: 6, padding: "3px 0" }}>
                          <div style={{ width: 4, height: 4, borderRadius: 2, background: folder.color, flexShrink: 0, marginTop: 6 }} />
                          <span style={{ ...typo.labelSmall, color: DS.textSecondary, ...S.truncate }}>{doc.title}</span>
                        </div>
                      ))}
                      {count > 3 && <div style={{ ...typo.labelSmall, color: DS.textDisabled, paddingLeft: 10 }}>+{count - 3} więcej…</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div style={{ ...S.col, gap: 2 }}>
            <div style={{ ...S.row, padding: "8px 12px", borderBottom: `1px solid ${DS.borderLight}`, ...typo.labelSmall, color: DS.textSecondary }}>
              <div style={{ width: 36 }} />
              <div style={{ flex: 1 }}>Nazwa folderu</div>
              <div style={{ width: 80, textAlign: "center" }}>Dokumenty</div>
              <div style={{ width: 100 }}>Utworzono</div>
              <div style={{ width: 80 }} />
            </div>
            {filtered.map(folder => (
              <div key={folder.id} onClick={() => setActiveFolderId(folder.id)}
                style={{ ...S.row, padding: "10px 12px", borderRadius: 8, cursor: "pointer", transition: "background 0.1s", borderBottom: `1px solid ${DS.borderLight}` }}
                onMouseEnter={e => e.currentTarget.style.background = DS.neutralLighter}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ width: 36, ...S.row, justifyContent: "center" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: folder.color + "18", ...S.row, justifyContent: "center" }}>
                    <Icon name={folder.icon || "folder"} size={14} color={folder.color} />
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                  <div style={{ ...typo.bodySmall, color: DS.textPrimary, fontWeight: 600, ...S.truncate }}>{folder.name}</div>
                  {folder.description && <div style={{ ...typo.labelSmall, color: DS.textDisabled, ...S.truncate, marginTop: 1 }}>{folder.description}</div>}
                </div>
                <div style={{ width: 80, textAlign: "center" }}>
                  <Badge color={DS.primaryDark} bg={DS.primaryLighter} small>{folder.docIds.length}</Badge>
                </div>
                <div style={{ width: 100, ...typo.labelSmall, color: DS.textSecondary }}>{folder.createdAt ? formatDate(folder.createdAt) : "—"}</div>
                <div style={{ width: 80, ...S.row, gap: 4, justifyContent: "flex-end" }}>
                  <button onClick={e => { e.stopPropagation(); deleteFolder(folder.id); }} title="Usuń folder"
                    style={{ border: "none", background: "none", cursor: "pointer", padding: 4, borderRadius: 4 }}
                    onMouseEnter={e => e.currentTarget.style.background = DS.errorLighter}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <Icon name="trash" size={14} color={DS.errorMain} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   FOLDER PICKER MODAL — select folder to add documents to
   ═══════════════════════════════════════════════════════════════ */
const FolderPickerModal = ({ visible, folders, setFolders, selectedIds, onConfirm, onClose }) => {
  const [pickedFolderId, setPickedFolderId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  if (!visible) return null;

  const handleAdd = () => {
    if (!pickedFolderId) return;
    onConfirm(pickedFolderId);
  };

  const handleCreateAndAdd = () => {
    if (!newName.trim()) return;
    const id = "f" + Date.now();
    setFolders(prev => [...prev, { id, name: newName.trim(), color: "#A971F6", icon: "folder", docIds: [], description: "", createdAt: new Date().toISOString().split("T")[0] }]);
    setNewName(""); setCreating(false);
    setPickedFolderId(id);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(2px)" }} onClick={onClose} />
      <div style={{
        position: "relative", width: 440, maxHeight: "70vh", background: DS.neutralWhite,
        borderRadius: 14, boxShadow: DS.shadowXl, ...S.col, animation: "modalIn 0.2s ease",
      }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${DS.borderLight}`, ...S.row, justifyContent: "space-between" }}>
          <div style={{ ...S.row, gap: 8 }}>
            <Icon name="folder" size={18} color={DS.primaryLight} />
            <span style={{ ...typo.titleSmall, color: DS.textPrimary }}>Dodaj do folderu</span>
            <Badge color={DS.primaryDark} bg={DS.primaryLighter} small>{selectedIds.size} dok.</Badge>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", padding: 4 }}>
            <Icon name="x" size={16} color={DS.textSecondary} />
          </button>
        </div>

        {/* Folder list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px", maxHeight: 340 }}>
          {folders.map(f => (
            <div key={f.id} onClick={() => setPickedFolderId(f.id)}
              style={{
                ...S.row, gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                background: pickedFolderId === f.id ? DS.primaryLighter : "transparent",
                border: `1px solid ${pickedFolderId === f.id ? DS.primaryLight : "transparent"}`,
                transition: "all 0.1s", marginBottom: 2,
              }}
              onMouseEnter={e => { if (pickedFolderId !== f.id) e.currentTarget.style.background = DS.neutralLighter; }}
              onMouseLeave={e => { if (pickedFolderId !== f.id) e.currentTarget.style.background = "transparent"; }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: f.color + "18", ...S.row, justifyContent: "center", flexShrink: 0 }}>
                <Icon name={f.icon || "folder"} size={14} color={f.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...typo.bodySmall, color: DS.textPrimary, fontWeight: 500 }}>{f.name}</div>
                <div style={{ ...typo.labelSmall, color: DS.textDisabled }}>{f.docIds.length} dok.</div>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${pickedFolderId === f.id ? DS.primaryLight : DS.borderMedium}`, ...S.row, justifyContent: "center" }}>
                {pickedFolderId === f.id && <div style={{ width: 10, height: 10, borderRadius: "50%", background: DS.primaryLight }} />}
              </div>
            </div>
          ))}

          {/* Create new folder inline */}
          {creating ? (
            <div style={{ padding: "10px 12px", borderRadius: 8, background: DS.neutralLighter, border: `1px solid ${DS.borderLight}`, marginTop: 4 }}>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nazwa nowego folderu…" autoFocus
                onKeyDown={e => { if (e.key === "Enter") handleCreateAndAdd(); if (e.key === "Escape") setCreating(false); }}
                style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: `1px solid ${DS.borderLight}`, fontSize: 13, fontFamily: DS.fontFamily, outline: "none", boxSizing: "border-box" }} />
              <div style={{ ...S.row, gap: 6, marginTop: 8 }}>
                <Btn variant="primary" icon="check" onClick={handleCreateAndAdd} small>Utwórz i dodaj</Btn>
                <Btn variant="ghost" onClick={() => { setCreating(false); setNewName(""); }} small>Anuluj</Btn>
              </div>
            </div>
          ) : (
            <button onClick={() => setCreating(true)}
              style={{ ...S.row, gap: 8, padding: "10px 12px", borderRadius: 8, border: `1px dashed ${DS.borderMedium}`, background: "transparent", cursor: "pointer", width: "100%", color: DS.textSecondary, fontSize: 13, fontFamily: DS.fontFamily, marginTop: 4 }}
              onMouseEnter={e => e.currentTarget.style.background = DS.neutralLighter}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <Icon name="folderPlus" size={14} color={DS.textDisabled} />
              <span>Utwórz nowy folder</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${DS.borderLight}`, ...S.row, gap: 8, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onClose}>Anuluj</Btn>
          <Btn variant="primary" icon="folderPlus" onClick={handleAdd} disabled={!pickedFolderId}>Dodaj do folderu</Btn>
        </div>
      </div>
    </div>
  );
};

// ──── 17-ksef-view.js ────
/* ═══════════════════════════════════════════════════════════════
   KSEF VIEW — Krajowy System e-Faktur inbox
   ═══════════════════════════════════════════════════════════════ */
const KsefView = ({ invoices, setInvoices, onSelectInvoice }) => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("niezweryfikowane"); // niezweryfikowane | zweryfikowane | all

  const counts = useMemo(() => {
    const c = { all: invoices.length, niezweryfikowane: 0, zweryfikowane: 0, totalGross: 0 };
    invoices.forEach(inv => {
      if (inv.status === "nowy") c.niezweryfikowane++;
      else if (inv.status === "zweryfikowany") c.zweryfikowane++;
      c.totalGross += inv.grossTotal;
    });
    return c;
  }, [invoices]);

  const filtered = useMemo(() => {
    let list = invoices;
    if (activeTab === "niezweryfikowane") list = list.filter(i => i.status === "nowy");
    else if (activeTab === "zweryfikowane") list = list.filter(i => i.status === "zweryfikowany");
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.seller.name.toLowerCase().includes(q) ||
        i.seller.nip.includes(q) ||
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.nrKsef.toLowerCase().includes(q)
      );
    }
    return list;
  }, [invoices, activeTab, search]);

  const StatCard = ({ icon, label, value, sub, color, bg, border, isAmount }) => (
    <div style={{
      background: DS.neutralWhite, borderRadius: 10, border: `1px solid ${border || DS.borderLight}`,
      padding: "14px 16px", transition: "all 0.15s", position: "relative",
    }}>
      <div style={{ ...S.row, gap: 8, marginBottom: 8 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: bg || DS.neutralLighter, ...S.row, justifyContent: "center" }}>
          <Icon name={icon} size={15} color={color || DS.textSecondary} />
        </div>
        <span style={{ ...typo.labelSmall, color: DS.textDisabled, textTransform: "uppercase", letterSpacing: 0.4, fontSize: 10 }}>{label}</span>
      </div>
      <div style={{ ...typo.titleLarge, color: color || DS.textPrimary, fontSize: isAmount ? 18 : 26, fontVariantNumeric: "tabular-nums", lineHeight: 1.1, marginBottom: 2 }}>{value}</div>
      {sub && <div style={{ ...typo.labelSmall, color: DS.textSecondary, fontSize: 11 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ flex: 1, ...S.col, overflow: "hidden" }}>
      {/* Header bar */}
      <div style={{ padding: "10px 20px", ...S.row, gap: 12, borderBottom: `1px solid ${DS.borderLight}`, background: DS.neutralWhite, minHeight: 52 }}>
        <div style={{ flex: 1 }}>
          <div style={{ ...typo.titleMedium, color: DS.primaryMain }}>KSeF — Krajowy System e-Faktur</div>
          <div style={{ ...typo.bodySmall, color: DS.textSecondary }}>
            {counts.all} {counts.all === 1 ? "faktura" : counts.all < 5 ? "faktury" : "faktur"} • {counts.niezweryfikowane} do weryfikacji
          </div>
        </div>
        <div style={{ position: "relative", width: 300 }}>
          <Icon name="search" size={14} color={DS.textDisabled} style={{ position: "absolute", left: 10, top: 9 }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Szukaj po nazwie, NIP, nr faktury…"
            style={{ width: "100%", padding: "7px 12px 7px 32px", borderRadius: 8, border: `1px solid ${DS.borderLight}`, fontSize: 13, fontFamily: DS.fontFamily, outline: "none", boxSizing: "border-box" }} />
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", background: DS.neutralLighter }}>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <StatCard icon="inbox" label="Wszystkie" value={counts.all} color={DS.primaryMain} bg={DS.primaryLighter} sub="faktur w systemie" />
        <StatCard icon="clock" label="Niezweryfikowane" value={counts.niezweryfikowane} color={DS.errorMain} bg={DS.errorLighter || "#FEE2E2"} sub="wymaga weryfikacji" />
        <StatCard icon="check" label="Zweryfikowane" value={counts.zweryfikowane} color={DS.successMain} bg={DS.successLighter || "#DCFCE7"} sub="zweryfikowanych" />
        <StatCard icon="coins" label="Wartość brutto" value={formatCurrency(counts.totalGross)} color={DS.primaryMain} bg={DS.primaryLighter} isAmount />
      </div>

      {/* Tabs */}
      <div style={{ ...S.row, gap: 2, marginBottom: 16, borderBottom: `1px solid ${DS.borderLight}`, background: DS.neutralWhite, borderRadius: "8px 8px 0 0", padding: "0 12px", minHeight: 38 }}>
        {[
          { id: "niezweryfikowane", label: "Niezweryfikowane", count: counts.niezweryfikowane },
          { id: "zweryfikowane", label: "Zweryfikowane", count: counts.zweryfikowane },
        ].map(tab => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 14px", border: "none", borderRadius: 0,
              borderBottom: active ? `2px solid ${DS.primaryLight}` : "2px solid transparent",
              background: "transparent", cursor: "pointer", fontFamily: DS.fontFamily,
              fontSize: 13, fontWeight: active ? 600 : 400,
              color: active ? DS.primaryMain : DS.textSecondary,
              whiteSpace: "nowrap", transition: "all 0.15s",
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = DS.textPrimary; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = active ? DS.primaryMain : DS.textSecondary; }}
            >
              {tab.label}
              <span style={{
                ...typo.labelSmall, padding: "0 5px", ...S.pill,
                background: active ? DS.primaryLighter : DS.neutralLighter,
                color: active ? DS.primaryDark : DS.textDisabled,
              }}>{tab.count}</span>
            </button>
          );
        })}
      </div>

      {/* Invoice table */}
      <div style={{ overflow: "hidden" }}>
        {/* Table header */}
        <div style={{
          display: "grid", gridTemplateColumns: "1.4fr 1fr 1.1fr 0.8fr 0.7fr 0.8fr 1.2fr",
          padding: "0 20px", minHeight: 38, alignItems: "center",
          borderBottom: `2px solid ${DS.borderLight}`, background: DS.neutralWhite,
          position: "sticky", top: 0, zIndex: 2,
        }}>
          {["Sprzedawca", "NIP sprzedawcy", "Nr faktury", "Data wyst.", "Netto", "Brutto", "Akcje"].map(h => (
            <div key={h} style={{ padding: "8px 6px", ...typo.labelSmall, color: DS.textDisabled, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</div>
          ))}
        </div>

        {/* Table rows */}
        {filtered.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <Icon name="inbox" size={36} color={DS.neutralLight} style={{ margin: "0 auto 10px", display: "block" }} />
            <div style={{ ...typo.bodyMedium, color: DS.textSecondary }}>Brak faktur w tej kategorii</div>
          </div>
        ) : filtered.map((inv, idx) => {
          const st = KSEF_STATUSES[inv.status];
          const isZebra = idx % 2 === 1;
          return (
            <div key={inv.id} style={{
              display: "grid", gridTemplateColumns: "1.4fr 1fr 1.1fr 0.8fr 0.7fr 0.8fr 1.2fr",
              padding: "0 20px", minHeight: 48, alignItems: "center",
              borderBottom: `1px solid ${DS.borderLight}`,
              transition: "background 0.1s",
              background: isZebra ? DS.neutralLighter : DS.neutralWhite,
              borderLeft: inv.isCorrection ? `3px solid ${DS.warningMain}` : "3px solid transparent",
            }}
              onMouseEnter={e => e.currentTarget.style.background = DS.primaryLighter}
              onMouseLeave={e => e.currentTarget.style.background = isZebra ? DS.neutralLighter : DS.neutralWhite}
            >
              <div style={{ padding: "8px 6px" }}>
                <span style={{ ...typo.bodySmall, fontWeight: 500, color: DS.textPrimary, ...S.truncate, display: "block" }}>{inv.seller.name}</span>
                {inv.isCorrection && (
                  <span style={{
                    display: "inline-block", marginTop: 2, padding: "1px 6px", borderRadius: 4,
                    background: DS.warningLighter, color: DS.warningDark, ...typo.labelSmall, fontWeight: 600, fontSize: 10,
                  }}>KOREKTA</span>
                )}
              </div>
              <div style={{ padding: "8px 6px" }}>
                <span style={{ ...typo.bodySmall, color: DS.textSecondary, fontVariantNumeric: "tabular-nums", ...S.truncate, display: "block" }}>{inv.seller.nip}</span>
              </div>
              <div style={{ padding: "8px 6px" }}>
                <span style={{ ...typo.bodySmall, color: DS.textSecondary, fontFamily: "monospace", fontSize: 12, ...S.truncate, display: "block" }}>{inv.invoiceNumber}</span>
              </div>
              <div style={{ padding: "8px 6px" }}>
                <span style={{ ...typo.bodySmall, color: DS.textSecondary }}>{formatDate(inv.issueDate)}</span>
              </div>
              <div style={{ padding: "8px 6px", textAlign: "right" }}>
                <span style={{ ...typo.bodySmall, color: DS.textSecondary, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(inv.netTotal)}</span>
              </div>
              <div style={{ padding: "8px 6px", textAlign: "right" }}>
                <span style={{ ...typo.bodySmall, fontWeight: 500, color: inv.grossTotal < 0 ? DS.errorMain : DS.textPrimary, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(inv.grossTotal)}</span>
              </div>
              <div style={{ ...S.row, gap: 6, justifyContent: "flex-end" }}>
                <button onClick={() => onSelectInvoice(inv)} style={{
                  ...S.row, gap: 3, padding: "3px 10px", borderRadius: 5, border: `1px solid ${DS.borderLight}`,
                  background: DS.neutralWhite, cursor: "pointer", ...typo.labelSmall, color: DS.textSecondary,
                  fontWeight: 500, fontSize: 11, transition: "all 0.15s", whiteSpace: "nowrap",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = DS.primaryLight; e.currentTarget.style.color = DS.primaryLight; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = DS.borderLight; e.currentTarget.style.color = DS.textSecondary; }}
                >
                  <Icon name="eye" size={11} /> Szczegóły
                </button>
                <button disabled style={{
                  ...S.row, gap: 3, padding: "3px 10px", borderRadius: 5, border: "none",
                  background: DS.successLighter || "#DCFCE7", cursor: "not-allowed", ...typo.labelSmall, color: DS.successMain,
                  fontWeight: 500, fontSize: 11, opacity: 0.5,
                }}>
                  <Icon name="check" size={11} /> Zweryfikuj
                </button>
              </div>
            </div>
          );
        })}
      </div>
      </div>{/* close scrollable content */}
    </div>
  );
};

// ──── 18-ksef-drawer.js ────
/* ═══════════════════════════════════════════════════════════════
   KSEF INVOICE DETAIL DRAWER
   ═══════════════════════════════════════════════════════════════ */
const KsefInvoiceDrawer = ({ invoice, onClose }) => {
  const [activeTab, setActiveTab] = useState("dane");

  useEffect(() => {
    setActiveTab("dane");
  }, [invoice?.id]);

  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  if (!invoice) return null;

  const st = KSEF_STATUSES[invoice.status];

  const Field = ({ label, value, mono }) => (
    <div style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: `1px solid ${DS.borderLight}` }}>
      <div style={{ width: 160, flexShrink: 0 }}>
        <span style={{ ...typo.labelSmall, color: DS.textDisabled, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
      </div>
      <div style={{ flex: 1, ...typo.bodySmall, color: DS.textPrimary, fontVariantNumeric: mono ? "tabular-nums" : "normal" }}>{value || "—"}</div>
    </div>
  );

  const SubjectCard = ({ title, icon, data }) => (
    <div style={{ padding: 16, borderRadius: 10, border: `1px solid ${DS.borderLight}`, background: DS.neutralLighter, marginBottom: 12 }}>
      <div style={{ ...S.row, gap: 8, marginBottom: 10 }}>
        <Icon name={icon} size={16} color={DS.primaryMain} />
        <span style={{ ...typo.titleSmall, color: DS.primaryMain }}>{title}</span>
      </div>
      <div style={{ ...typo.bodyMedium, fontWeight: 600, color: DS.textPrimary, marginBottom: 4 }}>{data.name}</div>
      <div style={{ ...typo.bodySmall, color: DS.textSecondary }}>NIP: {data.nip}</div>
      <div style={{ ...typo.bodySmall, color: DS.textSecondary }}>{data.address}</div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.3)", zIndex: 200 }} />

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "min(780px, 70vw)", zIndex: 201,
        background: DS.neutralWhite, boxShadow: DS.shadowXl, display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 24px", borderBottom: `1px solid ${DS.borderLight}`,
          background: DS.neutralWhite,
        }}>
          <div style={{ ...S.row, justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ ...S.row, gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EDE9FE", ...S.row, justifyContent: "center" }}>
                <Icon name="receipt" size={18} color="#7C3AED" />
              </div>
              <div>
                <div style={{ ...typo.titleMedium, color: DS.primaryMain }}>Faktura KSeF</div>
                <div style={{ ...typo.bodySmall, color: DS.textSecondary }}>{invoice.seller.name}</div>
              </div>
            </div>
            <div style={{ ...S.row, gap: 8 }}>
              <Badge color={st.color} bg={st.bg}>{st.label}</Badge>
              <button onClick={onClose} style={{
                width: 32, height: 32, borderRadius: 8, border: `1px solid ${DS.borderLight}`,
                background: DS.neutralWhite, cursor: "pointer", ...S.row, justifyContent: "center",
              }}>
                <Icon name="x" size={16} color={DS.textSecondary} />
              </button>
            </div>
          </div>
          {/* KSeF number bar */}
          <div style={{
            padding: "8px 14px", borderRadius: 8, background: "#F5F3FF", border: "1px solid #E9E5FF",
            ...S.row, gap: 8,
          }}>
            <Icon name="link" size={13} color="#7C3AED" />
            <span style={{ ...typo.labelSmall, color: "#7C3AED" }}>Nr KSeF:</span>
            <span style={{ ...typo.bodySmall, fontWeight: 600, color: DS.textPrimary, fontFamily: "monospace", fontSize: 12 }}>{invoice.nrKsef}</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ ...S.row, gap: 0, borderBottom: `1px solid ${DS.borderLight}`, padding: "0 24px" }}>
          {[
            { id: "dane", label: "Dane faktury", icon: "file" },
            { id: "pozycje", label: `Pozycje (${invoice.items.length})`, icon: "list" },
            { id: "podglad", label: "Podgląd PDF", icon: "eye" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              ...S.row, gap: 6, padding: "10px 16px", background: "none", border: "none", cursor: "pointer",
              borderBottom: activeTab === tab.id ? `2px solid ${DS.primaryMain}` : "2px solid transparent",
              marginBottom: -1, color: activeTab === tab.id ? DS.primaryMain : DS.textSecondary,
              ...typo.labelMedium, fontWeight: activeTab === tab.id ? 600 : 500,
            }}>
              <Icon name={tab.icon} size={13} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {activeTab === "dane" && (
            <>
              <SubjectCard title="Sprzedawca (Podmiot1)" icon="building" data={invoice.seller} />
              <SubjectCard title="Nabywca (Podmiot2)" icon="users" data={invoice.buyer} />

              <div style={{ marginTop: 16 }}>
                <div style={{ ...typo.titleSmall, color: DS.primaryMain, marginBottom: 8 }}>Dane faktury</div>
                <Field label="Nr faktury" value={invoice.invoiceNumber} />
                <Field label="Data wystawienia" value={formatDate(invoice.issueDate)} />
                <Field label="Data sprzedaży" value={formatDate(invoice.sellDate)} />
                <Field label="Termin płatności" value={formatDate(invoice.dueDate)} />
                <Field label="Forma płatności" value={invoice.paymentMethod} />
                <Field label="Waluta" value={invoice.currency} />
                {invoice.isCorrection && <Field label="Typ" value={<Badge color={DS.warningDark} bg={DS.warningLighter}>Faktura korygująca</Badge>} />}
                {invoice.assignedTo && <Field label="Przypisano do" value={invoice.assignedTo} />}
                {invoice.rejectionReason && <Field label="Powód odrzucenia" value={<span style={{ color: DS.errorMain }}>{invoice.rejectionReason}</span>} />}
              </div>

              {/* Summary */}
              <div style={{ marginTop: 20, padding: 16, borderRadius: 10, background: DS.primaryLighter, border: `1px solid ${DS.borderMedium}` }}>
                <div style={{ ...typo.titleSmall, color: DS.primaryMain, marginBottom: 10 }}>Podsumowanie kwot</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <div>
                    <div style={{ ...typo.labelSmall, color: DS.textDisabled }}>Netto</div>
                    <div style={{ ...typo.titleMedium, color: DS.textPrimary, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(invoice.netTotal)}</div>
                  </div>
                  <div>
                    <div style={{ ...typo.labelSmall, color: DS.textDisabled }}>VAT</div>
                    <div style={{ ...typo.titleMedium, color: DS.textPrimary, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(invoice.vatTotal)}</div>
                  </div>
                  <div>
                    <div style={{ ...typo.labelSmall, color: DS.textDisabled }}>Brutto</div>
                    <div style={{ ...typo.titleMedium, color: invoice.grossTotal < 0 ? DS.errorMain : DS.primaryMain, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(invoice.grossTotal)}</div>
                  </div>
                </div>
              </div>

              {/* Received timestamp */}
              <div style={{ marginTop: 16, ...S.row, gap: 6, ...typo.bodySmall, color: DS.textDisabled }}>
                <Icon name="clock" size={12} />
                Odebrano z KSeF: {new Date(invoice.receivedAt).toLocaleString("pl-PL")}
              </div>
            </>
          )}

          {activeTab === "pozycje" && (
            <>
              <div style={{ background: DS.neutralWhite, borderRadius: 10, border: `1px solid ${DS.borderLight}`, overflow: "hidden" }}>
                <div style={{
                  display: "grid", gridTemplateColumns: "0.3fr 2.5fr 0.5fr 0.5fr 0.7fr 0.7fr 0.5fr 0.7fr 0.8fr",
                  padding: "10px 14px", borderBottom: `1px solid ${DS.borderLight}`, background: DS.neutralLighter,
                }}>
                  {["Lp", "Nazwa", "Jm.", "Ilość", "Cena jed.", "Netto", "VAT", "Kwota VAT", "Brutto"].map(h => (
                    <div key={h} style={{ ...typo.labelSmall, color: DS.textDisabled, textTransform: "uppercase", letterSpacing: 0.3, textAlign: h !== "Nazwa" && h !== "Lp" && h !== "Jm." ? "right" : "left" }}>{h}</div>
                  ))}
                </div>
                {invoice.items.map((item, idx) => (
                  <div key={idx} style={{
                    display: "grid", gridTemplateColumns: "0.3fr 2.5fr 0.5fr 0.5fr 0.7fr 0.7fr 0.5fr 0.7fr 0.8fr",
                    padding: "10px 14px", borderBottom: `1px solid ${DS.borderLight}`, alignItems: "center",
                  }}>
                    <div style={{ ...typo.bodySmall, color: DS.textSecondary }}>{item.nr}</div>
                    <div style={{ ...typo.bodySmall, color: DS.textPrimary, fontWeight: 500 }}>{item.name}</div>
                    <div style={{ ...typo.bodySmall, color: DS.textSecondary }}>{item.unit}</div>
                    <div style={{ ...typo.bodySmall, color: DS.textPrimary, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{item.qty}</div>
                    <div style={{ ...typo.bodySmall, color: DS.textSecondary, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(item.unitPrice)}</div>
                    <div style={{ ...typo.bodySmall, color: DS.textPrimary, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(item.netValue)}</div>
                    <div style={{ ...typo.bodySmall, color: DS.textSecondary, textAlign: "right" }}>{item.vatRate}</div>
                    <div style={{ ...typo.bodySmall, color: DS.textSecondary, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(item.vatAmount)}</div>
                    <div style={{ ...typo.bodySmall, fontWeight: 600, color: item.grossValue < 0 ? DS.errorMain : DS.textPrimary, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(item.grossValue)}</div>
                  </div>
                ))}
                {/* Totals row */}
                <div style={{
                  display: "grid", gridTemplateColumns: "0.3fr 2.5fr 0.5fr 0.5fr 0.7fr 0.7fr 0.5fr 0.7fr 0.8fr",
                  padding: "12px 14px", background: DS.primaryLighter,
                }}>
                  <div></div>
                  <div style={{ ...typo.labelMedium, color: DS.primaryMain, fontWeight: 700 }}>RAZEM</div>
                  <div></div><div></div><div></div>
                  <div style={{ ...typo.labelMedium, color: DS.primaryMain, textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(invoice.netTotal)}</div>
                  <div></div>
                  <div style={{ ...typo.labelMedium, color: DS.primaryMain, textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(invoice.vatTotal)}</div>
                  <div style={{ ...typo.labelMedium, color: DS.primaryMain, textAlign: "right", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(invoice.grossTotal)}</div>
                </div>
              </div>
            </>
          )}

          {activeTab === "podglad" && (
            <div style={{ textAlign: "center", padding: "30px 20px" }}>
              {/* Simulated KSeF PDF preview */}
              <div style={{
                maxWidth: 600, margin: "0 auto", background: DS.neutralWhite,
                border: `1px solid ${DS.borderMedium}`, borderRadius: 2,
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)", padding: "40px 48px", textAlign: "left",
              }}>
                {/* Header bar */}
                <div style={{ ...S.row, justifyContent: "space-between", marginBottom: 24, paddingBottom: 16, borderBottom: `2px solid ${DS.primaryMain}` }}>
                  <div>
                    <div style={{ ...typo.labelSmall, color: DS.textDisabled, marginBottom: 2 }}>FAKTURA VAT{invoice.isCorrection ? " KORYGUJĄCA" : ""}</div>
                    <div style={{ ...typo.titleLarge, color: DS.primaryMain }}>{invoice.invoiceNumber}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ ...typo.labelSmall, color: DS.textDisabled }}>Data wystawienia</div>
                    <div style={{ ...typo.bodyMedium, fontWeight: 600, color: DS.textPrimary }}>{formatDate(invoice.issueDate)}</div>
                  </div>
                </div>

                {/* KSeF bar */}
                <div style={{ padding: "8px 12px", background: "#F5F3FF", borderRadius: 4, marginBottom: 20, ...S.row, gap: 6 }}>
                  <Icon name="link" size={12} color="#7C3AED" />
                  <span style={{ fontFamily: "monospace", fontSize: 10, color: "#7C3AED" }}>{invoice.nrKsef}</span>
                </div>

                {/* Seller / Buyer */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                  <div>
                    <div style={{ ...typo.labelSmall, color: DS.textDisabled, marginBottom: 6, textTransform: "uppercase" }}>Sprzedawca</div>
                    <div style={{ ...typo.bodyMedium, fontWeight: 600, color: DS.textPrimary }}>{invoice.seller.name}</div>
                    <div style={{ ...typo.bodySmall, color: DS.textSecondary }}>NIP: {invoice.seller.nip}</div>
                    <div style={{ ...typo.bodySmall, color: DS.textSecondary }}>{invoice.seller.address}</div>
                  </div>
                  <div>
                    <div style={{ ...typo.labelSmall, color: DS.textDisabled, marginBottom: 6, textTransform: "uppercase" }}>Nabywca</div>
                    <div style={{ ...typo.bodyMedium, fontWeight: 600, color: DS.textPrimary }}>{invoice.buyer.name}</div>
                    <div style={{ ...typo.bodySmall, color: DS.textSecondary }}>NIP: {invoice.buyer.nip}</div>
                    <div style={{ ...typo.bodySmall, color: DS.textSecondary }}>{invoice.buyer.address}</div>
                  </div>
                </div>

                {/* Line items mini-table */}
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${DS.borderMedium}` }}>
                      {["Lp", "Nazwa towaru / usługi", "Jm.", "Ilość", "Netto", "VAT", "Brutto"].map(h => (
                        <th key={h} style={{ ...typo.labelSmall, color: DS.textDisabled, padding: "6px 4px", textAlign: h === "Nazwa towaru / usługi" ? "left" : "right", fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${DS.borderLight}` }}>
                        <td style={{ ...typo.bodySmall, padding: "5px 4px", color: DS.textSecondary }}>{item.nr}</td>
                        <td style={{ ...typo.bodySmall, padding: "5px 4px", color: DS.textPrimary }}>{item.name}</td>
                        <td style={{ ...typo.bodySmall, padding: "5px 4px", textAlign: "right", color: DS.textSecondary }}>{item.unit}</td>
                        <td style={{ ...typo.bodySmall, padding: "5px 4px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{item.qty}</td>
                        <td style={{ ...typo.bodySmall, padding: "5px 4px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{formatCurrency(item.netValue)}</td>
                        <td style={{ ...typo.bodySmall, padding: "5px 4px", textAlign: "right", color: DS.textSecondary }}>{item.vatRate}</td>
                        <td style={{ ...typo.bodySmall, padding: "5px 4px", textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(item.grossValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ width: 260, padding: 14, background: DS.primaryLighter, borderRadius: 6 }}>
                    <div style={{ ...S.row, justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ ...typo.bodySmall, color: DS.textSecondary }}>Netto:</span>
                      <span style={{ ...typo.bodySmall, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(invoice.netTotal)}</span>
                    </div>
                    <div style={{ ...S.row, justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ ...typo.bodySmall, color: DS.textSecondary }}>VAT:</span>
                      <span style={{ ...typo.bodySmall, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(invoice.vatTotal)}</span>
                    </div>
                    <div style={{ ...S.row, justifyContent: "space-between", paddingTop: 6, borderTop: `1px solid ${DS.borderMedium}` }}>
                      <span style={{ ...typo.titleSmall, color: DS.primaryMain }}>Do zapłaty:</span>
                      <span style={{ ...typo.titleMedium, color: DS.primaryMain, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(invoice.grossTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment info */}
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${DS.borderLight}` }}>
                  <div style={{ ...typo.bodySmall, color: DS.textSecondary }}>
                    Termin płatności: <strong>{formatDate(invoice.dueDate)}</strong> · Forma: <strong>{invoice.paymentMethod}</strong>
                  </div>
                  {invoice.sellDate !== invoice.issueDate && (
                    <div style={{ ...typo.bodySmall, color: DS.textSecondary, marginTop: 4 }}>
                      Data sprzedaży: <strong>{formatDate(invoice.sellDate)}</strong>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div style={{ marginTop: 24, paddingTop: 12, borderTop: `1px solid ${DS.borderLight}`, textAlign: "center" }}>
                  <div style={{ ...typo.labelSmall, color: DS.textDisabled }}>Dokument wygenerowany z danych KSeF — wizualizacja FA(3)</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div style={{
          padding: "14px 24px", borderTop: `1px solid ${DS.borderLight}`,
          ...S.row, justifyContent: "space-between", background: DS.neutralLighter,
        }}>
          <button disabled style={{
            ...S.row, gap: 6, padding: "8px 20px", borderRadius: 8, border: "none",
            background: DS.errorLighter || "#FEE2E2", color: DS.errorMain, cursor: "not-allowed", opacity: 0.5,
            ...typo.labelMedium, fontWeight: 600,
          }}>
            <Icon name="x" size={14} /> Odrzuć
          </button>
          <button disabled style={{
            ...S.row, gap: 6, padding: "8px 20px", borderRadius: 8, border: "none",
            background: DS.successLighter || "#DCFCE7", color: DS.successMain, cursor: "not-allowed", opacity: 0.5,
            ...typo.labelMedium, fontWeight: 600,
          }}>
            <Icon name="check" size={14} /> Zweryfikuj
          </button>
        </div>
      </div>
    </>
  );
};

// ──── 19-views.js ────
/* ═══════════════════════════════════════════════════════════════
   CONTRACTORS VIEW — list of contractors with linked docs (Iter 3)
   ═══════════════════════════════════════════════════════════════ */
const ContractorsView = ({ docs, onSelectDoc }) => {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  const contractors = useMemo(() => {
    const map = {};
    docs.forEach(d => {
      if (!d.contractor) return;
      if (!map[d.contractor]) map[d.contractor] = { name: d.contractor, docs: [], totalGross: 0 };
      map[d.contractor].docs.push(d);
      map[d.contractor].totalGross += d.grossValue || 0;
    });
    let list = Object.values(map).sort((a, b) => b.totalGross - a.totalGross);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q));
    }
    return list;
  }, [docs, search]);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", background: DS.neutralLighter }}>
      <div style={{ ...S.row, justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ ...typo.titleLarge, color: DS.primaryMain }}>Kontrahenci</div>
          <div style={{ ...typo.bodySmall, color: DS.textSecondary }}>{contractors.length} kontrahentów z dokumentami</div>
        </div>
        <div style={{ width: 260 }}>
          <Input value={search} onChange={setSearch} placeholder="Szukaj kontrahenta..." icon="search" />
        </div>
      </div>

      {contractors.map(c => (
        <div key={c.name} style={{
          background: DS.neutralWhite, borderRadius: 10, border: `1px solid ${DS.borderLight}`,
          marginBottom: 10, overflow: "hidden", transition: "box-shadow 0.15s",
          boxShadow: expanded === c.name ? DS.shadowMd : "none",
        }}>
          {/* Contractor header */}
          <div onClick={() => setExpanded(expanded === c.name ? null : c.name)} style={{
            ...S.row, gap: 12, padding: "14px 18px",
            cursor: "pointer", transition: "background 0.1s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = DS.neutralLighter}
            onMouseLeave={e => e.currentTarget.style.background = DS.neutralWhite}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10, ...S.row, justifyContent: "center",
              background: DS.primaryLighter, flexShrink: 0,
            }}>
              <Icon name="users" size={18} color={DS.primaryMain} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...typo.bodyMedium, fontWeight: 600, color: DS.textPrimary }}>{c.name}</div>
              <div style={{ ...typo.bodySmall, color: DS.textSecondary }}>
                {c.docs.length} {c.docs.length === 1 ? "dokument" : c.docs.length < 5 ? "dokumenty" : "dokumentów"}
                {" · "}{formatCurrency(c.totalGross)}
              </div>
            </div>
            <Icon name={expanded === c.name ? "chevronDown" : "chevronRight"} size={16} color={DS.textDisabled} />
          </div>

          {/* Expanded doc list */}
          {expanded === c.name && (
            <div style={{ borderTop: `1px solid ${DS.borderLight}`, padding: "4px 0" }}>
              {c.docs.map(doc => {
                const typeInfo = DOC_TYPES[doc.type] || DOC_TYPES.inne;
                const statusInfo = DOC_STATUSES[doc.status] || null;
                return (
                  <div key={doc.id} onClick={() => onSelectDoc(doc)} style={{
                    ...S.row, gap: 10, padding: "10px 18px 10px 66px",
                    cursor: "pointer", transition: "background 0.1s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = DS.primaryLighter}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ ...S.row, gap: 4, ...typo.labelSmall, color: DS.textSecondary }}><Icon name={typeInfo.icon} size={12} color={DS.neutralMain} />{typeInfo.label}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ ...typo.bodySmall, fontWeight: 500, color: DS.textPrimary, ...S.truncate }}>
                        {doc.title}
                      </div>
                      {doc.number && <div style={{ ...typo.labelSmall, color: DS.textDisabled, fontFamily: "monospace" }}>{doc.number}</div>}
                    </div>
                    {statusInfo ? <Badge color={statusInfo.color} bg={statusInfo.bg} small>{statusInfo.label}</Badge> : <span style={{ ...typo.bodySmall, color: DS.textDisabled }}>—</span>}
                    <span style={{ ...typo.bodySmall, color: DS.textSecondary, fontVariantNumeric: "tabular-nums", width: 90, textAlign: "right" }}>
                      {doc.grossValue ? formatCurrency(doc.grossValue) : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {contractors.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 20px" }}>
          <Icon name="users" size={48} color={DS.neutralLight} style={{ margin: "0 auto 12px", display: "block" }} />
          <div style={{ ...typo.titleSmall, color: DS.textSecondary }}>Brak kontrahentów</div>
          <div style={{ ...typo.bodySmall, color: DS.textDisabled, marginTop: 4 }}>Nie znaleziono kontrahentów pasujących do wyszukiwania</div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   APP TOP BAR — global application bar (stub)
   ═══════════════════════════════════════════════════════════════ */
const AppTopBar = () => {
  const [orgHover, setOrgHover] = useState(false);
  return (
    <div style={{
      ...S.rowBetween, height: 44, padding: "0 16px",
      background: DS.neutralWhite, color: DS.textPrimary, flexShrink: 0,
      borderBottom: `1px solid ${DS.borderLight}`,
    }}>
      <div style={{ ...S.row, gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: `linear-gradient(135deg, ${DS.primaryMain}, ${DS.primaryLight})`,
          ...S.row, justifyContent: "center", alignItems: "center", flexShrink: 0,
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>eP</span>
        </div>
        <span style={{ fontWeight: 600, fontSize: 14, color: DS.primaryMain, letterSpacing: "-0.01em" }}>ePublink Dokumenty</span>
      </div>
      <div style={{ ...S.row, gap: 4 }}>
        <div
          onMouseEnter={() => setOrgHover(true)}
          onMouseLeave={() => setOrgHover(false)}
          style={{
            ...S.row, gap: 6, padding: "5px 10px", borderRadius: 6,
            border: `1px solid ${orgHover ? DS.borderMedium : DS.borderLight}`,
            background: orgHover ? DS.neutralLighter : DS.neutralWhite,
            cursor: "default", transition: "all 0.15s",
          }}
          title="Struktura organizacyjna (wkrótce)"
        >
          <Icon name="building" size={13} color={DS.textSecondary} />
          <span style={{ ...typo.bodySmall, color: DS.textSecondary, fontWeight: 500 }}>Gmina Przykładów</span>
          <Icon name="chevR" size={10} color={DS.textDisabled} />
        </div>
        <button style={{
          width: 32, height: 32, borderRadius: 6, border: "none",
          background: "transparent", cursor: "pointer", ...S.row,
          justifyContent: "center", alignItems: "center",
        }} title="Powiadomienia">
          <Icon name="bell" size={16} color={DS.textSecondary} />
        </button>
        <button style={{
          width: 32, height: 32, borderRadius: 6, border: "none",
          background: "transparent", cursor: "pointer", ...S.row,
          justifyContent: "center", alignItems: "center",
        }} title="Pomoc">
          <Icon name="help" size={16} color={DS.textSecondary} />
        </button>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: DS.primaryLighter, ...S.row,
          justifyContent: "center", alignItems: "center",
          marginLeft: 4,
        }} title="Jan Kowalski">
          <span style={{ fontSize: 11, fontWeight: 600, color: DS.primaryDark }}>JK</span>
        </div>
      </div>
    </div>
  );
};

// ──── 20-app.js ────
/* ═══════════════════════════════════════════════════════════════
   MAIN APP — orchestrating all Iteration 1 features
   ═══════════════════════════════════════════════════════════════ */
const App = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState("all");
  const [docs, setDocs] = useState(INIT_DOCS);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "dateCreated", dir: "desc" });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ status: [], dept: [], assignee: [] });
  const [showSearch, setShowSearch] = useState(false); // Iter 2 — Cmd+K
  const [showOcr, setShowOcr] = useState(false); // Iter 3 — OCR wizard
  const [showExport, setShowExport] = useState(false); // Iter 4 — eksport
  const [folders, setFolders] = useState(INIT_FOLDERS); // Iter 4 — teczki
  const [folderViewMode, setFolderViewMode] = useState("tiles"); // "list" | "tiles"
  const [activeFolderId, setActiveFolderId] = useState(null); // null = folder list, "fX" = folder detail
  const [showFolderPicker, setShowFolderPicker] = useState(false); // Iter 4 — modal dodaj do folderu
  const [folderSearch, setFolderSearch] = useState(""); // search within folders view
  const [ksefInvoices, setKsefInvoices] = useState(INIT_KSEF_INVOICES); // KSeF inbox
  const [selectedKsefInvoice, setSelectedKsefInvoice] = useState(null); // KSeF detail drawer
  const [showSaveView, setShowSaveView] = useState(false); // Iter 5 — modal zapisu widoku
  const [typeFilter, setTypeFilter] = useState(""); // Iter 5 — quick type filter tabs
  const ALL_COLUMNS = [
    { key: "type", label: "Typ" }, { key: "alerts", label: "Alerty" }, { key: "number", label: "Numer" }, { key: "nrEwidencyjny", label: "Nr ewid." }, { key: "title", label: "Przedmiot" },
    { key: "contractor", label: "Kontrahent" }, { key: "assignee", label: "Odpow." }, { key: "dept", label: "Wydział" },
    { key: "dateEnd", label: "Data końca" }, { key: "grossValue", label: "Wartość" },
    { key: "classification", label: "Klasyfik." }, { key: "tags", label: "Tagi" }, { key: "status", label: "Status" },
  ];
  const [visibleColumns, setVisibleColumns] = useState(["type","alerts","number","nrEwidencyjny","title","contractor","dept","grossValue","status"]);

  // Cmd+K global shortcut (Iter 2)
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // View tabs state (P3 — system + custom)
  const [viewTabs, setViewTabs] = useState([
    { id: "all", label: "Wszystkie", system: true },
    { id: "w_przygotowaniu", label: "W przygotowaniu", system: true },
    { id: "w_realizacji", label: "W realizacji", system: true },
    { id: "do_weryfikacji", label: "Do weryfikacji", system: true },
    { id: "zakonczone", label: "Zakończone", system: true },
  ]);
  const [activeTab, setActiveTab] = useState("all");

  const filteredDocs = useMemo(() => {
    let result = [...docs];

    // Apply sidebar view
    switch (activeView) {
      case "umowy": result = result.filter(d => d.type === "umowa"); break;
      case "faktury": result = result.filter(d => d.type === "faktura"); break;
      case "zlecenia": result = result.filter(d => d.type === "zlecenie"); break;
      case "inne": result = result.filter(d => d.type === "aneks" || d.type === "inne"); break;
      case "bez_klasyfikacji": result = result.filter(d => !d.classification); break;
      case "z_alertami": result = result.filter(d => d.alerts && d.alerts.length > 0); break;
    }

    // Apply tab filter (on top of sidebar)
    switch (activeTab) {
      case "w_przygotowaniu": result = result.filter(d => d.status === "w_przygotowaniu"); break;
      case "w_realizacji": result = result.filter(d => d.status === "w_realizacji"); break;
      case "do_weryfikacji": result = result.filter(d => d.status === "do_weryfikacji"); break;
      case "zakonczone": result = result.filter(d => d.status === "zakonczone" || d.status === "oplacona"); break;
    }

    // Apply type filter from DocTypeFilterBar
    if (typeFilter) result = result.filter(d => d.type === typeFilter);
    // Apply multiselect filters
    if (filters.status?.length > 0) result = result.filter(d => filters.status.includes(d.status));
    if (filters.dept?.length > 0) result = result.filter(d => filters.dept.includes(d.dept));
    if (filters.assignee?.length > 0) result = result.filter(d => filters.assignee.includes(String(d.assignee)));

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        (d.title || "").toLowerCase().includes(q) ||
        (d.number || "").toLowerCase().includes(q) ||
        (d.contractor || "").toLowerCase().includes(q) ||
        (d.dept || "").toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortConfig.key], bVal = b[sortConfig.key];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortConfig.dir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.dir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [docs, activeView, activeTab, filters, searchQuery, sortConfig, typeFilter]);

  const docCounts = useMemo(() => ({
    all: docs.length,
    umowy: docs.filter(d => d.type === "umowa").length,
    faktury: docs.filter(d => d.type === "faktura").length,
    zlecenia: docs.filter(d => d.type === "zlecenie").length,
    inne: docs.filter(d => d.type === "aneks" || d.type === "inne").length,
    wPrzygotowaniu: docs.filter(d => d.status === "w_przygotowaniu").length,
    wRealizacji: docs.filter(d => d.status === "w_realizacji").length,
    doWeryfikacji: docs.filter(d => d.status === "do_weryfikacji").length,
    zakonczone: docs.filter(d => d.status === "zakonczone" || d.status === "oplacona").length,
    bezKlasyfikacji: docs.filter(d => !d.classification).length,
    zAlertami: docs.filter(d => d.alerts && d.alerts.length > 0).length,
  }), [docs]);

  // Tabs with counts
  const tabsWithCounts = viewTabs.map(t => ({
    ...t,
    count: t.id === "all" ? docs.length
      : t.id === "w_przygotowaniu" ? docCounts.wPrzygotowaniu
      : t.id === "w_realizacji" ? docCounts.wRealizacji
      : t.id === "do_weryfikacji" ? docCounts.doWeryfikacji
      : t.id === "zakonczone" ? docCounts.zakonczone
      : undefined,
    removable: !t.system,
  }));

  const handleSort = (key) => setSortConfig(prev => ({ key, dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc" }));

  const handleUpdateDoc = (docId, key, value) => {
    setDocs(prev => prev.map(d => d.id === docId ? { ...d, [key]: value } : d));
  };

  const handleSave = (formData) => {
    if (formData.id) {
      setDocs(prev => prev.map(d => d.id === formData.id ? { ...d, ...formData } : d));
    } else {
      setDocs(prev => [...prev, { ...formData, id: Math.max(...prev.map(d => d.id)) + 1 }]);
    }
    setShowForm(false);
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSelectAll = (select) => {
    setSelectedIds(select ? new Set(filteredDocs.map(d => d.id)) : new Set());
  };

  const handleAddTab = () => { setShowSaveView(true); };
  const handleSaveView = (name) => {
    const id = "custom_" + Date.now();
    setViewTabs(prev => [...prev, { id, label: name, system: false, removable: true }]);
    setActiveTab(id);
    setShowSaveView(false);
  };

  const handleRemoveTab = (id) => {
    setViewTabs(prev => prev.filter(t => t.id !== id));
    if (activeTab === id) setActiveTab("all");
  };

  const viewLabel = {
    all: "Dokumenty", umowy: "Umowy", faktury: "Faktury",
    zlecenia: "Zlecenia", inne: "Inne dokumenty",
    bez_klasyfikacji: "Bez klasyfikacji", z_alertami: "Z alertami",
    podsumowanie: "Monitor", kontrahenci: "Kontrahenci", foldery: "Foldery",
    ksef: "KSeF — Krajowy System e-Faktur", inwestycje: "Inwestycje", ustawienia: "Ustawienia",
  };

  const filterCount = Object.values(filters).reduce((acc, v) => acc + (Array.isArray(v) ? v.length : (v ? 1 : 0)), 0);
  const hasActiveFilters = filterCount > 0 || !!typeFilter;
  const isDocView = !["podsumowanie","kontrahenci","foldery","ksef","inwestycje","ustawienia"].includes(activeView);

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden",
      fontFamily: DS.fontFamily, color: DS.textPrimary, fontSize: 13,
      WebkitFontSmoothing: "antialiased",
    }}>
      <AppTopBar />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      <Sidebar
        activeView={activeView}
        onViewChange={v => { setActiveView(v); setSelectedDoc(null); setSelectedIds(new Set()); }}
        onOpenCmd={() => setShowSearch(true)}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(p => !p)}
      />

      <div style={{ flex: 1, ...S.col, overflow: "hidden" }}>
        {/* Top bar – only for doc views */}
        {isDocView && <div style={{
          padding: "10px 20px", ...S.row, gap: 12,
          borderBottom: `1px solid ${DS.borderLight}`, background: DS.neutralWhite, minHeight: 52,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ ...typo.titleMedium, color: DS.primaryMain }}>{viewLabel[activeView] || "Dokumenty"}</div>
            <div style={{ ...typo.bodySmall, color: DS.textSecondary }}>
              {filteredDocs.length} {filteredDocs.length === 1 ? "dokument" : filteredDocs.length < 5 ? "dokumenty" : "dokumentów"}
              {searchQuery && ` • "${searchQuery}"`}
            </div>
          </div>
          <div onClick={() => setShowSearch(true)} style={{
            ...S.row, gap: 8, padding: "7px 12px",
            border: `1px solid ${DS.borderLight}`, borderRadius: 8, width: 260,
            cursor: "pointer", background: DS.neutralWhite, transition: "border-color 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = DS.primaryLight}
            onMouseLeave={e => e.currentTarget.style.borderColor = DS.borderLight}
          >
            <Icon name="search" size={14} color={DS.textDisabled} />
            <span style={{ ...typo.bodySmall, color: DS.textDisabled, flex: 1 }}>Szukaj dokumentów...</span>
            <kbd style={{
              ...typo.labelSmall, padding: "1px 5px", borderRadius: 4,
              border: `1px solid ${DS.borderLight}`, color: DS.textDisabled, background: DS.neutralLighter, fontSize: 10,
            }}>⌘K</kbd>
          </div>
          <Btn variant="secondary" icon="download" onClick={() => setShowExport(true)} small>Eksport</Btn>
          <Btn variant="accent" icon="plus" onClick={() => setShowForm(true)}>Nowy dokument</Btn>
        </div>}

        {/* View tabs (P3) */}
        {isDocView && (
          <ViewTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={tabsWithCounts}
            onAddTab={handleAddTab}
            onRemoveTab={handleRemoveTab}
          />
        )}

        {/* Doc type filter bar (Iter 5) */}
        {isDocView && (
          <DocTypeFilterBar
            activeType={typeFilter}
            onTypeChange={setTypeFilter}
            filterCount={filterCount}
            onToggleFilters={() => setShowFilters(p => !p)}
            showFilters={showFilters}
            allColumns={ALL_COLUMNS}
            visibleColumns={visibleColumns}
            onColumnsChange={setVisibleColumns}
          />
        )}

        {/* Filter panel (slides under) */}
        {isDocView && <FilterBar filters={filters} onFiltersChange={setFilters} visible={showFilters} onToggle={() => setShowFilters(p => !p)} />}
        {isDocView && <FilterSummary filters={filters} typeFilter={typeFilter} />}

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {activeView === "podsumowanie" ? (
            <SkarbnikSummary docs={docs}
              onSelectDoc={doc => { setSelectedDoc(doc); setShowForm(false); }}
              onNavigateFiltered={(type, filterOverrides) => {
                setTypeFilter(type || "");
                if (filterOverrides) {
                  setFilters(prev => ({ ...prev, ...filterOverrides }));
                }
                setActiveView("all");
              }}
            />
          ) : activeView === "kontrahenci" ? (
            <ContractorsView docs={docs} onSelectDoc={doc => { setSelectedDoc(doc); setActiveView("all"); }} />
          ) : activeView === "foldery" ? (
            <FoldersView folders={folders} setFolders={setFolders} docs={docs}
              onSelectDoc={doc => { setSelectedDoc(doc); setActiveView("all"); }}
              activeFolderId={activeFolderId} setActiveFolderId={setActiveFolderId}
              viewMode={folderViewMode} setViewMode={setFolderViewMode}
              search={folderSearch} setSearch={setFolderSearch} />
          ) : activeView === "ksef" ? (
            <KsefView
              invoices={ksefInvoices}
              setInvoices={setKsefInvoices}
              onSelectInvoice={inv => setSelectedKsefInvoice(inv)}
            />
          ) : ["inwestycje", "ustawienia"].includes(activeView) ? (
            <div style={{ flex: 1, ...S.row, justifyContent: "center", ...S.col, gap: 12 }}>
              <Icon name={activeView === "inwestycje" ? "trendingUp" : "settings"} size={40} color={DS.neutralMain} />
              <div style={{ ...typo.titleMedium, color: DS.textSecondary }}>{viewLabel[activeView]}</div>
              <div style={{ ...typo.bodySmall, color: DS.textDisabled }}>Moduł w przygotowaniu</div>
            </div>
          ) : (
            <>
              <DocTable
                docs={filteredDocs}
                onSelectDoc={doc => { setSelectedDoc(doc); setShowForm(false); }}
                onInlineAdd={() => setShowForm(true)}
                selectedId={selectedDoc?.id}
                sortConfig={sortConfig}
                onSort={handleSort}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onSelectAll={handleSelectAll}
                onOpenExport={() => setShowExport(true)}
                onOpenFolders={() => setShowFolderPicker(true)}
                visibleColumns={visibleColumns}
                multiSelectMode={multiSelectMode}
                onToggleMultiSelect={() => { setMultiSelectMode(m => !m); if (multiSelectMode) setSelectedIds(new Set()); }}
                onUpdateDoc={handleUpdateDoc}
              />
              {selectedDoc && !showForm && (
                <DrawerDetail
                  doc={selectedDoc}
                  onClose={() => setSelectedDoc(null)}
                  onSave={handleSave}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Cmd+K Global Search (Iter 2) */}
      <GlobalSearchModal
        visible={showSearch}
        onClose={() => setShowSearch(false)}
        docs={docs}
        onSelectDoc={doc => { setSelectedDoc(doc); setShowSearch(false); setShowForm(false); }}
      />

      {/* Export Modal (Iter 4) */}
      <ExportModal
        visible={showExport}
        onClose={() => setShowExport(false)}
        docs={filteredDocs}
        selectedIds={selectedIds}
      />

      {/* Folder Picker Modal (Iter 4) */}
      <FolderPickerModal
        visible={showFolderPicker}
        folders={folders}
        setFolders={setFolders}
        selectedIds={selectedIds}
        onConfirm={(folderId) => {
          setFolders(prev => prev.map(f => {
            if (f.id !== folderId) return f;
            const newDocIds = [...f.docIds];
            selectedIds.forEach(id => { if (!newDocIds.includes(id)) newDocIds.push(id); });
            return { ...f, docIds: newDocIds };
          }));
          setShowFolderPicker(false);
          setSelectedIds(new Set());
          setMultiSelectMode(false);
        }}
        onClose={() => setShowFolderPicker(false)}
      />

      {/* KSeF Invoice Detail Drawer */}
      {selectedKsefInvoice && (
        <KsefInvoiceDrawer
          invoice={selectedKsefInvoice}
          onClose={() => setSelectedKsefInvoice(null)}
        />
      )}

      {/* Save View Modal (Iter 5) */}
      <SaveViewModal
        open={showSaveView}
        onClose={() => setShowSaveView(false)}
        onSave={handleSaveView}
        filters={filters}
        visibleColumns={visibleColumns}
        allColumns={ALL_COLUMNS}
      />

      {/* New/edit document modal */}
      {showForm && (
        <DocFormModal
          onClose={() => setShowForm(false)}
          onSave={handleSave}
          docs={docs}
        />
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes modalIn { from { opacity: 0; transform: translateY(-16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow: hidden; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${DS.neutralMain}; border-radius: 3px; }
        input, select, textarea, button { font-family: ${DS.fontFamily}; }
        input:focus, select:focus, textarea:focus { border-color: ${DS.primaryLight} !important; }
      `}</style>
    </div>
    </div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return React.createElement("pre", {style:{padding:20,color:"red",whiteSpace:"pre-wrap"}}, "ERROR: " + this.state.error.message + "\n\n" + this.state.error.stack);
    return this.props.children;
  }
}
ReactDOM.createRoot(document.getElementById("root")).render(<ErrorBoundary><App /></ErrorBoundary>);
