import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import _ from "lodash";

/* ═══════════════════════════════════════════════════════════════
   PUBLINK DESIGN SYSTEM TOKENS
   Based on common-npm-package/packages/ui/src/theme/publinkPalette.ts
   ═══════════════════════════════════════════════════════════════ */
const DS = {
  // Primary (navy)
  primaryLighter: "#E1ECFF",
  primaryLight: "#AAB5D1",
  primaryMain: "#1A2569",
  primaryDark: "#141C4F",
  primaryDarker: "#0A0F2A",
  // Secondary (cyan)
  secondaryLighter: "#D3F5FF",
  secondaryLight: "#24CEFF",
  secondaryMain: "#21B9E5",
  // Neutral
  neutralWhite: "#FFFFFF",
  neutralLighter: "#F5F9FF",
  neutralLight: "#EAF1FC",
  neutralMain: "#BACBE3",
  neutralDark: "#93ACCE",
  neutralDarker: "#506B90",
  // Accent - Umowy (purple)
  accentUmowyLighter: "#EEE3FD",
  accentUmowyLight: "#CBAAFA",
  accentUmowyMain: "#A971F6",
  accentUmowyDark: "#7045AB",
  // Success
  successLighter: "#A6F7E5",
  successLight: "#57E3C3",
  successMain: "#00B087",
  successDark: "#18846B",
  // Warning
  warningLighter: "#FEFBEC",
  warningLight: "#FFF0A5",
  warningMain: "#FBDC41",
  warningDark: "#ECC500",
  // Error
  errorLighter: "#FFB1B5",
  errorLight: "#FF7880",
  errorMain: "#FB414C",
  errorDark: "#D62C36",
  // Disabled
  disabledLighter: "#EBEDF3",
  disabledLight: "#C4CAD5",
  disabledMain: "#949CB0",
  // Border
  borderLight: "#E1ECFF",
  borderMedium: "#BACBE3",
  // Text
  textPrimary: "#1A2569",
  textSecondary: "#506B90",
  textDisabled: "#949CB0",
  // Font
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
};

/* ═══════════════════════════════════════════════════════════════
   TYPOGRAPHY SCALE (from designSystemTypography.ts)
   ═══════════════════════════════════════════════════════════════ */
const typo = {
  titleLarge: { fontSize: 20, fontWeight: 600, lineHeight: 1.3 },
  titleMedium: { fontSize: 16, fontWeight: 600, lineHeight: 1.3 },
  titleSmall: { fontSize: 14, fontWeight: 600, lineHeight: 1.3 },
  labelLarge: { fontSize: 14, fontWeight: 700, lineHeight: 1.3 },
  labelMedium: { fontSize: 12, fontWeight: 600, lineHeight: 1.3 },
  labelSmall: { fontSize: 10, fontWeight: 400, lineHeight: 1.3 },
  bodyLarge: { fontSize: 16, fontWeight: 400, lineHeight: 1.5 },
  bodyMedium: { fontSize: 14, fontWeight: 400, lineHeight: 1.5 },
  bodySmall: { fontSize: 12, fontWeight: 400, lineHeight: 1.5 },
};

/* ═══════════════════════════════════════════════════════════════
   SVG ICON PATHS
   ═══════════════════════════════════════════════════════════════ */
const iconPaths = {
  home: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  file: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  plus: "M12 5v14 M5 12h14",
  x: "M18 6L6 18 M6 6l12 12",
  check: "M20 6L9 17l-5-5",
  search: "M11 17.25a6.25 6.25 0 110-12.5 6.25 6.25 0 010 12.5z M16 16l4.5 4.5",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54z",
  chevDown: "M6 9l6 6 6-6",
  chevRight: "M9 18l6-6-6-6",
  chevLeft: "M15 18l-6-6 6-6",
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01",
  receipt: "M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z",
  wallet: "M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4 M4 6v12c0 1.1.9 2 2 2h14v-4 M18 12a2 2 0 000 4h4v-4h-4z",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  clock: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2",
  trending: "M23 6l-9.5 9.5-5-5L1 18",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6z",
  layers: "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
  dollar: "M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
  upload: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  alert: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
  inbox: "M22 12h-6l-2 3h-4l-2-3H2",
  building: "M3 21h18 M3 7v14 M21 7v14 M6 11h.01 M6 15h.01 M10 11h.01 M10 15h.01 M14 11h.01 M14 15h.01 M18 11h.01 M18 15h.01 M6 7l6-4 6 4",
  sortAsc: "M12 19V5 M5 12l7-7 7 7",
  sortDesc: "M12 5v14 M19 12l-7 7-7-7",
  columns: "M12 3v18 M4 3h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z",
  arrowRight: "M5 12h14 M12 5l7 7-7 7",
  clip: "M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  grip: "M9 4h.01M9 9h.01M9 14h.01M9 19h.01M15 4h.01M15 9h.01M15 14h.01M15 19h.01",
};

const Icon = ({ name, size = 16, color, style = {} }) => {
  const paths = (iconPaths[name] || "").split(" M");
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color || "currentColor"} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" style={style}>
      {paths.map((p, i) => <path key={i} d={(i > 0 ? "M" : "") + p} />)}
    </svg>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */
const DOC_TYPES = {
  umowa: { label: "Umowa", color: DS.accentUmowyMain, bg: DS.accentUmowyLighter, icon: "file" },
  faktura: { label: "Faktura", color: "#0A7BE5", bg: "#E0EEFF", icon: "receipt" },
  zlecenie: { label: "Zlecenie", color: DS.secondaryMain, bg: DS.secondaryLighter, icon: "file" },
  aneks: { label: "Aneks", color: "#059669", bg: "#D1FAE5", icon: "edit" },
  inne: { label: "Inny dokument", color: DS.neutralDarker, bg: DS.neutralLight, icon: "file" },
};

const DOC_STATUSES = {
  draft: { label: "Szkic", color: DS.textDisabled, bg: DS.disabledLighter },
  aktywny: { label: "Aktywny", color: DS.successDark, bg: DS.successLighter },
  do_kontrasygnaty: { label: "Do kontrasygnaty", color: DS.warningDark, bg: DS.warningLighter },
  do_zatwierdzenia: { label: "Do zatwierdzenia", color: "#D97706", bg: "#FEF3C7" },
  zatwierdzony: { label: "Zatwierdzony", color: DS.successMain, bg: DS.successLighter },
  archiwalny: { label: "Archiwalny", color: DS.neutralDarker, bg: DS.neutralLight },
  anulowany: { label: "Anulowany", color: DS.errorDark, bg: "#FFEEEF" },
};

const DEPARTMENTS = [
  "Wydział Finansowy", "Wydział Inwestycji", "Wydział Administracyjny",
  "Wydział Kultury i Sportu", "Wydział Ochrony Środowiska", "Kierownictwo",
];

const USERS_LIST = [
  { id: 1, name: "Jan Czerwiński", dept: "Wydział Finansowy", init: "JC" },
  { id: 2, name: "Maria Krawiec", dept: "Wydział Inwestycji", init: "MK" },
  { id: 3, name: "Tomasz Jakubczyk", dept: "Wydział Kultury i Sportu", init: "TJ" },
  { id: 4, name: "Agnieszka Kauch", dept: "Wydział Inwestycji", init: "AK" },
  { id: 7, name: "Zofia Skarbnik", dept: "Kierownictwo", init: "ZS" },
];

const CLASSIFICATIONS = [
  { code: "75023/§605", label: "Urzędy gmin — Wydatki majątkowe", budget: 50000, used: 28169 },
  { code: "75023/§430", label: "Urzędy gmin — Zakup usług", budget: 60000, used: 36000 },
  { code: "900/§426", label: "Gosp. komunalna — Energia", budget: 200000, used: 151209 },
  { code: "600/§430", label: "Transport — Usługi", budget: 30000, used: 20000 },
  { code: "801/§421", label: "Oświata — Materiały", budget: 18000, used: 843 },
];

const TAGS = [
  { id: "uslugi", label: "Usługi", color: "#6366f1" },
  { id: "roboty", label: "Roboty budowlane", color: "#d97706" },
  { id: "dostawy", label: "Dostawy", color: "#059669" },
  { id: "pzp", label: "Zamówienie publ.", color: "#2563eb" },
  { id: "pilne", label: "Pilne", color: "#dc2626" },
  { id: "eu", label: "Środki UE", color: "#0284c7" },
];

const CONTRACTORS = [
  { id: 1, name: "SOTEL Beata Soliwoda", nip: "6340123456" },
  { id: 2, name: "USŁUGI LEŚNE DĄB Stanowski Jan", nip: "6120987654" },
  { id: 3, name: "MTM PROJEKT Tomasz Musielak", nip: "7534567890" },
  { id: 7, name: "Budmat Roboty Drogowe Sp. z o.o.", nip: "6012345678" },
  { id: 9, name: "Hydro-Project Sp. z o.o.", nip: "8912345678" },
  { id: 11, name: "Orange Polska S.A.", nip: "5260215088" },
  { id: 12, name: "TAURON Dystrybucja S.A.", nip: "6781455667" },
];

const INIT_DOCS = [
  { id: 1, type: "umowa", number: "OR.273.1.2026", title: "Obsługa prawna Urzędu Gminy 2026", contractor: "Kancelaria Nowak & Wspólnicy", contractorId: 5, status: "aktywny", dept: "Wydział Administracyjny", assignee: 1, dateCreated: "2026-01-10", dateStart: "2026-01-15", dateEnd: "2026-12-31", netValue: 36000, grossValue: 44280, classification: "75023/§430", tags: ["uslugi"], attachments: 2, notes: "Umowa stała, aneks do końca roku", alerts: [] },
  { id: 2, type: "umowa", number: "IN.273.2.2026", title: "Przebudowa drogi gminnej ul. Polnej", contractor: "Budmat Roboty Drogowe Sp. z o.o.", contractorId: 7, status: "aktywny", dept: "Wydział Inwestycji", assignee: 2, dateCreated: "2025-12-10", dateStart: "2026-01-15", dateEnd: "2026-08-31", netValue: 450000, grossValue: 553500, classification: "600/§430", tags: ["roboty", "pzp"], attachments: 5, notes: "Inwestycja RFIL", alerts: [] },
  { id: 3, type: "umowa", number: "IN.273.3.2026", title: "Modernizacja sieci wodociągowej etap II", contractor: "Hydro-Project Sp. z o.o.", contractorId: 9, status: "do_kontrasygnaty", dept: "Wydział Inwestycji", assignee: 2, dateCreated: "2026-02-01", dateStart: "2026-03-01", dateEnd: "2028-06-30", netValue: 1200000, grossValue: 1476000, classification: "900/§426", tags: ["roboty", "eu", "pzp"], attachments: 3, notes: "Dofinansowanie PROW", alerts: ["Wymaga kontrasygnaty skarbnika"] },
  { id: 4, type: "faktura", number: "FV/OR/2026/001", title: "Abonament telekomunikacyjny — luty 2026", contractor: "Orange Polska S.A.", contractorId: 11, status: "aktywny", dept: "Wydział Administracyjny", assignee: 1, dateCreated: "2026-02-04", dateStart: "2026-02-01", dateEnd: "2026-02-28", netValue: 115, grossValue: 141.45, classification: "75023/§430", tags: ["uslugi"], attachments: 1, notes: "", alerts: [] },
  { id: 5, type: "faktura", number: "FV/IN/2026/002", title: "Energia elektryczna — budynki gminne", contractor: "TAURON Dystrybucja S.A.", contractorId: 12, status: "aktywny", dept: "Wydział Inwestycji", assignee: 4, dateCreated: "2026-02-12", dateStart: "2026-01-01", dateEnd: "2026-01-31", netValue: 2174.51, grossValue: 2675.65, classification: "900/§426", tags: [], attachments: 1, notes: "3 PPE", alerts: [] },
  { id: 6, type: "zlecenie", number: "ZLC/KS/2026/001", title: "Organizacja Dnia Babci i Dziadka", contractor: "Studio Foto-Tech Marek Wiśniewski", contractorId: 15, status: "zatwierdzony", dept: "Wydział Kultury i Sportu", assignee: 3, dateCreated: "2026-01-20", dateStart: "2026-01-22", dateEnd: "2026-01-22", netValue: 2500, grossValue: 3075, classification: "801/§421", tags: [], attachments: 1, notes: "", alerts: [] },
  { id: 7, type: "umowa", number: "IN.273.4.2026", title: "Nadzór inwestorski — ul. Polna", contractor: "Nadzory Bud. mgr inż. W. Szymański", contractorId: 8, status: "aktywny", dept: "Wydział Inwestycji", assignee: 2, dateCreated: "2026-01-12", dateStart: "2026-01-15", dateEnd: "2026-08-31", netValue: 18000, grossValue: 22140, classification: "600/§430", tags: ["uslugi"], attachments: 2, notes: "", alerts: [] },
  { id: 8, type: "umowa", number: "", title: "", contractor: "", contractorId: null, status: "draft", dept: "Wydział Finansowy", assignee: 1, dateCreated: "2026-02-27", dateStart: "", dateEnd: "", netValue: 0, grossValue: 0, classification: "", tags: [], attachments: 0, notes: "Szkic — do uzupełnienia", alerts: ["Brak numeru", "Brak tytułu", "Brak kontrahenta"] },
  { id: 9, type: "faktura", number: "FV/ADM/2026/003", title: "Materiały biurowe Q1", contractor: "Hurt-Pap Sp. z o.o.", contractorId: null, status: "do_zatwierdzenia", dept: "Wydział Administracyjny", assignee: 1, dateCreated: "2026-02-18", dateStart: "2026-02-18", dateEnd: "", netValue: 412.60, grossValue: 507.50, classification: "75023/§605", tags: ["dostawy"], attachments: 1, notes: "", alerts: ["Brak klasyfikacji budżetowej"] },
  { id: 10, type: "aneks", number: "AN/IN.273.2/1", title: "Aneks nr 1 — przedłużenie terminu", contractor: "Budmat Roboty Drogowe Sp. z o.o.", contractorId: 7, status: "do_kontrasygnaty", dept: "Wydział Inwestycji", assignee: 2, dateCreated: "2026-02-25", dateStart: "2026-02-25", dateEnd: "2026-10-31", netValue: 0, grossValue: 0, classification: "600/§430", tags: ["roboty"], attachments: 1, notes: "Przedłużenie do 31.10.2026", alerts: ["Wymaga kontrasygnaty"] },
];

/* ═══════════════════════════════════════════════════════════════
   UTILITY COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
const Badge = ({ children, color, bg, style = {} }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "2px 10px", borderRadius: 9999, ...typo.labelMedium,
    color, backgroundColor: bg, whiteSpace: "nowrap", ...style,
  }}>{children}</span>
);

const Avatar = ({ initials, size = 28, color = DS.accentUmowyMain }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: DS.accentUmowyLighter, color,
    display: "flex", alignItems: "center", justifyContent: "center",
    ...typo.labelMedium, fontSize: size * 0.38, fontWeight: 600,
    flexShrink: 0,
  }}>{initials}</div>
);

const Btn = ({ children, variant = "default", icon, onClick, style = {}, small, disabled }) => {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontFamily: DS.fontFamily, fontWeight: 600, border: "none",
    borderRadius: 8, cursor: disabled ? "default" : "pointer",
    transition: "all 0.15s", opacity: disabled ? 0.5 : 1,
    padding: small ? "5px 12px" : "8px 16px",
    fontSize: small ? 12 : 13, lineHeight: 1.3,
  };
  const variants = {
    primary: { background: DS.primaryMain, color: "#fff" },
    secondary: { background: DS.neutralLight, color: DS.primaryMain },
    accent: { background: DS.accentUmowyMain, color: "#fff" },
    ghost: { background: "transparent", color: DS.textSecondary },
    danger: { background: DS.errorMain, color: "#fff" },
    default: { background: DS.neutralLighter, color: DS.primaryMain, border: `1px solid ${DS.borderLight}` },
  };
  return (
    <button style={{ ...base, ...variants[variant], ...style }} onClick={onClick} disabled={disabled}>
      {icon && <Icon name={icon} size={small ? 14 : 15} />}
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, icon, style = {}, type = "text" }) => (
  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
    {icon && <Icon name={icon} size={15} color={DS.textDisabled} style={{ position: "absolute", left: 10, pointerEvents: "none" }} />}
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", padding: icon ? "8px 12px 8px 34px" : "8px 12px",
        border: `1px solid ${DS.borderLight}`, borderRadius: 8,
        fontSize: 13, fontFamily: DS.fontFamily, color: DS.textPrimary,
        background: DS.neutralWhite, outline: "none",
        transition: "border-color 0.15s", ...style,
      }}
      onFocus={e => e.target.style.borderColor = DS.accentUmowyMain}
      onBlur={e => e.target.style.borderColor = DS.borderLight}
    />
  </div>
);

const Select = ({ value, onChange, options, placeholder, style = {} }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    style={{
      width: "100%", padding: "8px 12px", border: `1px solid ${DS.borderLight}`,
      borderRadius: 8, fontSize: 13, fontFamily: DS.fontFamily,
      color: value ? DS.textPrimary : DS.textDisabled,
      background: DS.neutralWhite, outline: "none", appearance: "none",
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23949CB0' stroke-width='2' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
      paddingRight: 30, ...style,
    }}>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const formatCurrency = (v) => {
  if (!v && v !== 0) return "—";
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", minimumFractionDigits: 2 }).format(v);
};

const formatDate = (d) => {
  if (!d) return "—";
  const parts = d.split("-");
  if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
  return d;
};

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR
   ═══════════════════════════════════════════════════════════════ */
const Sidebar = ({ activeView, onViewChange, collapsed, onToggle, docCounts }) => {
  const navItems = [
    { id: "all", label: "Wszystkie dokumenty", icon: "layers", count: docCounts.all },
    { id: "umowy", label: "Umowy", icon: "file", count: docCounts.umowy },
    { id: "faktury", label: "Faktury", icon: "receipt", count: docCounts.faktury },
    { id: "zlecenia", label: "Zlecenia", icon: "file", count: docCounts.zlecenia },
    { id: "inne", label: "Inne dokumenty", icon: "file", count: docCounts.inne },
  ];
  const systemViews = [
    { id: "do_kontrasygnaty", label: "Do kontrasygnaty", icon: "alert", count: docCounts.doKontrasygnaty, accent: true },
    { id: "do_zatwierdzenia", label: "Do zatwierdzenia", icon: "clock", count: docCounts.doZatwierdzenia },
    { id: "drafts", label: "Szkice", icon: "edit", count: docCounts.drafts },
    { id: "bez_klasyfikacji", label: "Bez klasyfikacji", icon: "alert", count: docCounts.bezKlasyfikacji },
  ];

  const itemStyle = (active) => ({
    display: "flex", alignItems: "center", gap: 10,
    padding: "9px 14px", borderRadius: 8, cursor: "pointer",
    fontSize: 13, fontWeight: active ? 600 : 400,
    color: active ? DS.primaryMain : DS.textSecondary,
    background: active ? DS.neutralLight : "transparent",
    transition: "all 0.15s", marginBottom: 2,
  });

  return (
    <div style={{
      width: collapsed ? 56 : 240, minWidth: collapsed ? 56 : 240,
      height: "100vh", background: DS.neutralWhite,
      borderRight: `1px solid ${DS.borderLight}`,
      display: "flex", flexDirection: "column",
      transition: "width 0.2s, min-width 0.2s",
      overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{
        padding: "16px 14px", display: "flex", alignItems: "center", gap: 10,
        borderBottom: `1px solid ${DS.borderLight}`,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: `linear-gradient(135deg, ${DS.accentUmowyMain}, ${DS.primaryMain})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 700, fontSize: 12, flexShrink: 0,
        }}>eP</div>
        {!collapsed && <span style={{ ...typo.titleSmall, color: DS.primaryMain }}>Dokumenty</span>}
      </div>

      {/* Nav */}
      <div style={{ padding: "12px 8px", flex: 1, overflowY: "auto" }}>
        {!collapsed && <div style={{ ...typo.labelSmall, color: DS.textDisabled, padding: "0 8px 6px", textTransform: "uppercase", letterSpacing: 1 }}>Dokumenty</div>}
        {navItems.map(item => (
          <div key={item.id} style={itemStyle(activeView === item.id)}
            onClick={() => onViewChange(item.id)}
            onMouseEnter={e => { if (activeView !== item.id) e.currentTarget.style.background = DS.neutralLighter; }}
            onMouseLeave={e => { if (activeView !== item.id) e.currentTarget.style.background = "transparent"; }}
          >
            <Icon name={item.icon} size={16} color={activeView === item.id ? DS.accentUmowyMain : DS.neutralDarker} />
            {!collapsed && <>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.count > 0 && <span style={{ ...typo.labelMedium, color: DS.textDisabled }}>{item.count}</span>}
            </>}
          </div>
        ))}

        <div style={{ height: 1, background: DS.borderLight, margin: "12px 8px" }} />

        {!collapsed && <div style={{ ...typo.labelSmall, color: DS.textDisabled, padding: "0 8px 6px", textTransform: "uppercase", letterSpacing: 1 }}>Widoki robocze</div>}
        {systemViews.map(item => (
          <div key={item.id} style={itemStyle(activeView === item.id)}
            onClick={() => onViewChange(item.id)}
            onMouseEnter={e => { if (activeView !== item.id) e.currentTarget.style.background = DS.neutralLighter; }}
            onMouseLeave={e => { if (activeView !== item.id) e.currentTarget.style.background = "transparent"; }}
          >
            <Icon name={item.icon} size={16} color={item.accent && item.count > 0 ? DS.warningDark : DS.neutralDarker} />
            {!collapsed && <>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.count > 0 && <Badge color={item.accent ? DS.warningDark : DS.textDisabled} bg={item.accent ? DS.warningLighter : DS.disabledLighter}>{item.count}</Badge>}
            </>}
          </div>
        ))}

        <div style={{ height: 1, background: DS.borderLight, margin: "12px 8px" }} />

        {!collapsed && <div style={{ ...typo.labelSmall, color: DS.textDisabled, padding: "0 8px 6px", textTransform: "uppercase", letterSpacing: 1 }}>Narzędzia</div>}
        {[
          { id: "podsumowanie", label: "Podsumowanie", icon: "trending" },
          { id: "kontrahenci", label: "Kontrahenci", icon: "users" },
        ].map(item => (
          <div key={item.id} style={itemStyle(activeView === item.id)}
            onClick={() => onViewChange(item.id)}
            onMouseEnter={e => { if (activeView !== item.id) e.currentTarget.style.background = DS.neutralLighter; }}
            onMouseLeave={e => { if (activeView !== item.id) e.currentTarget.style.background = "transparent"; }}
          >
            <Icon name={item.icon} size={16} color={DS.neutralDarker} />
            {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
          </div>
        ))}
      </div>

      {/* Collapse toggle */}
      <div style={{ padding: "8px 8px 12px", borderTop: `1px solid ${DS.borderLight}` }}>
        <div style={{ ...itemStyle(false), justifyContent: "center" }} onClick={onToggle}>
          <Icon name={collapsed ? "chevRight" : "chevLeft"} size={16} />
          {!collapsed && <span style={{ flex: 1 }}>Zwiń</span>}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DOCUMENT TABLE
   ═══════════════════════════════════════════════════════════════ */
const DocTable = ({ docs, onSelectDoc, onInlineAdd, selectedId, sortConfig, onSort }) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const columns = [
    { key: "type", label: "Typ", width: 100 },
    { key: "number", label: "Numer", width: 150 },
    { key: "title", label: "Tytuł / Przedmiot", width: "auto" },
    { key: "contractor", label: "Kontrahent", width: 200 },
    { key: "status", label: "Status", width: 140 },
    { key: "dept", label: "Wydział", width: 160 },
    { key: "grossValue", label: "Wartość brutto", width: 130, align: "right" },
    { key: "dateEnd", label: "Termin", width: 100 },
  ];

  const thStyle = {
    padding: "10px 12px", textAlign: "left",
    ...typo.labelMedium, color: DS.textSecondary,
    borderBottom: `2px solid ${DS.borderLight}`,
    background: DS.neutralLighter,
    position: "sticky", top: 0, zIndex: 2,
    cursor: "pointer", userSelect: "none",
    whiteSpace: "nowrap",
  };

  const tdStyle = (align) => ({
    padding: "10px 12px", textAlign: align || "left",
    ...typo.bodySmall, color: DS.textPrimary,
    borderBottom: `1px solid ${DS.borderLight}`,
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  });

  // Summary row
  const totalGross = docs.reduce((s, d) => s + (d.grossValue || 0), 0);
  const totalNet = docs.reduce((s, d) => s + (d.netValue || 0), 0);

  return (
    <div style={{ flex: 1, overflow: "auto", background: DS.neutralWhite }}>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <colgroup>
          {columns.map(c => <col key={c.key} style={{ width: c.width === "auto" ? undefined : c.width }} />)}
        </colgroup>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={{ ...thStyle, textAlign: col.align || "left" }}
                onClick={() => onSort(col.key)}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  {col.label}
                  {sortConfig.key === col.key && (
                    <Icon name={sortConfig.dir === "asc" ? "sortAsc" : "sortDesc"} size={12} color={DS.accentUmowyMain} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {docs.map(doc => {
            const typeInfo = DOC_TYPES[doc.type] || DOC_TYPES.inne;
            const statusInfo = DOC_STATUSES[doc.status] || DOC_STATUSES.draft;
            const isSelected = selectedId === doc.id;
            const isHovered = hoveredRow === doc.id;
            const isDraft = doc.status === "draft";
            const hasAlerts = doc.alerts && doc.alerts.length > 0;

            return (
              <tr key={doc.id}
                onClick={() => onSelectDoc(doc)}
                onMouseEnter={() => setHoveredRow(doc.id)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  cursor: "pointer",
                  background: isSelected ? DS.accentUmowyLighter : isHovered ? DS.neutralLighter : DS.neutralWhite,
                  transition: "background 0.1s",
                  borderLeft: isSelected ? `3px solid ${DS.accentUmowyMain}` : "3px solid transparent",
                  opacity: isDraft ? 0.7 : 1,
                }}>
                <td style={tdStyle()}>
                  <Badge color={typeInfo.color} bg={typeInfo.bg}>{typeInfo.label}</Badge>
                </td>
                <td style={{ ...tdStyle(), fontWeight: 500, fontFamily: "monospace", fontSize: 12 }}>
                  {doc.number || <span style={{ color: DS.textDisabled, fontStyle: "italic", fontFamily: DS.fontFamily }}>brak numeru</span>}
                </td>
                <td style={{ ...tdStyle(), maxWidth: 300 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {hasAlerts && <Icon name="alert" size={14} color={DS.warningDark} />}
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", fontWeight: 500 }}>
                      {doc.title || <span style={{ color: DS.textDisabled, fontStyle: "italic" }}>Bez tytułu</span>}
                    </span>
                  </div>
                  {doc.tags && doc.tags.length > 0 && (
                    <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
                      {doc.tags.map(t => {
                        const tag = TAGS.find(tt => tt.id === t);
                        return tag ? <span key={t} style={{ fontSize: 10, color: tag.color, background: tag.color + "18", padding: "1px 6px", borderRadius: 4 }}>{tag.label}</span> : null;
                      })}
                    </div>
                  )}
                </td>
                <td style={{ ...tdStyle(), fontSize: 12 }}>
                  {doc.contractor || <span style={{ color: DS.textDisabled }}>—</span>}
                </td>
                <td style={tdStyle()}>
                  <Badge color={statusInfo.color} bg={statusInfo.bg}>{statusInfo.label}</Badge>
                </td>
                <td style={{ ...tdStyle(), fontSize: 12, color: DS.textSecondary }}>{doc.dept}</td>
                <td style={{ ...tdStyle("right"), fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  {doc.grossValue ? formatCurrency(doc.grossValue) : "—"}
                </td>
                <td style={{ ...tdStyle(), fontSize: 12, color: doc.dateEnd ? DS.textSecondary : DS.textDisabled }}>
                  {formatDate(doc.dateEnd)}
                </td>
              </tr>
            );
          })}

          {/* Inline add row */}
          <tr onClick={onInlineAdd}
            onMouseEnter={e => e.currentTarget.style.background = DS.neutralLighter}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            style={{ cursor: "pointer", transition: "background 0.1s" }}>
            <td colSpan={columns.length} style={{
              ...tdStyle(), color: DS.accentUmowyMain, fontWeight: 500,
              borderBottom: "none", padding: "12px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6,
                  border: `1.5px dashed ${DS.accentUmowyLight}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon name="plus" size={13} color={DS.accentUmowyMain} />
                </div>
                Dodaj dokument...
              </div>
            </td>
          </tr>
        </tbody>

        {/* Summary footer */}
        <tfoot>
          <tr style={{ background: DS.neutralLighter }}>
            <td style={{ ...tdStyle(), fontWeight: 600 }} colSpan={2}>
              <span style={{ ...typo.labelMedium }}>{docs.length} dokumentów</span>
            </td>
            <td style={tdStyle()} colSpan={4}>
              <div style={{ display: "flex", gap: 16 }}>
                {Object.entries(DOC_TYPES).map(([k, v]) => {
                  const count = docs.filter(d => d.type === k).length;
                  return count > 0 ? <span key={k} style={{ ...typo.bodySmall, color: DS.textSecondary }}>{v.label}: {count}</span> : null;
                })}
              </div>
            </td>
            <td style={{ ...tdStyle("right"), fontWeight: 700, ...typo.titleSmall }}>
              {formatCurrency(totalGross)}
            </td>
            <td style={tdStyle()} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DOCUMENT FORM (Drawer / Side Panel)
   Inspired by Stripe's clean form layout + YNAB's clarity
   ═══════════════════════════════════════════════════════════════ */
const DocFormDrawer = ({ doc, onClose, onSave, isNew }) => {
  const [form, setForm] = useState(doc ? { ...doc } : {
    type: "umowa", number: "", title: "", contractor: "", contractorId: null,
    status: "draft", dept: DEPARTMENTS[0], assignee: null, dateCreated: new Date().toISOString().slice(0, 10),
    dateStart: "", dateEnd: "", netValue: 0, grossValue: 0, classification: "",
    tags: [], attachments: 0, notes: "", alerts: [],
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const Field = ({ label, required, children, hint }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", ...typo.labelMedium, color: DS.textSecondary, marginBottom: 4 }}>
        {label}{required && <span style={{ color: DS.errorMain }}> *</span>}
      </label>
      {children}
      {hint && <div style={{ ...typo.bodySmall, color: DS.textDisabled, marginTop: 3 }}>{hint}</div>}
    </div>
  );

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ ...typo.titleSmall, color: DS.primaryMain, marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid ${DS.borderLight}` }}>{title}</div>
      {children}
    </div>
  );

  // Auto-calculate gross from net (assuming 23% VAT default)
  const handleNetChange = (val) => {
    const net = parseFloat(val) || 0;
    set("netValue", net);
    set("grossValue", Math.round(net * 1.23 * 100) / 100);
  };

  return (
    <div style={{
      position: "fixed", top: 0, right: 0, bottom: 0,
      width: 520, maxWidth: "100vw",
      background: DS.neutralWhite,
      boxShadow: "-4px 0 24px rgba(26,37,105,0.12)",
      zIndex: 100, display: "flex", flexDirection: "column",
      animation: "slideIn 0.2s ease",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: `1px solid ${DS.borderLight}`,
      }}>
        <div>
          <div style={{ ...typo.titleMedium, color: DS.primaryMain }}>
            {isNew ? "Nowy dokument" : "Edytuj dokument"}
          </div>
          {!isNew && doc?.number && <div style={{ ...typo.bodySmall, color: DS.textSecondary, marginTop: 2 }}>{doc.number}</div>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" icon="x" onClick={onClose} small />
        </div>
      </div>

      {/* Form body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        {/* Document type selector - prominent like YNAB category */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {Object.entries(DOC_TYPES).map(([key, info]) => (
            <button key={key} onClick={() => set("type", key)} style={{
              flex: 1, padding: "10px 8px", borderRadius: 8,
              border: form.type === key ? `2px solid ${info.color}` : `1px solid ${DS.borderLight}`,
              background: form.type === key ? info.bg : DS.neutralWhite,
              cursor: "pointer", textAlign: "center", fontFamily: DS.fontFamily,
              transition: "all 0.15s",
            }}>
              <Icon name={info.icon} size={18} color={info.color} style={{ display: "block", margin: "0 auto 4px" }} />
              <div style={{ ...typo.labelMedium, color: form.type === key ? info.color : DS.textSecondary }}>{info.label}</div>
            </button>
          ))}
        </div>

        <Section title="Dane podstawowe">
          <Field label="Tytuł / Przedmiot" required>
            <Input value={form.title} onChange={v => set("title", v)} placeholder="np. Obsługa prawna Urzędu Gminy" />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Numer dokumentu">
              <Input value={form.number} onChange={v => set("number", v)} placeholder="np. OR.273.1.2026" />
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={v => set("status", v)}
                options={Object.entries(DOC_STATUSES).map(([k, v]) => ({ value: k, label: v.label }))} />
            </Field>
          </div>

          <Field label="Kontrahent" required>
            <Select value={form.contractorId || ""} onChange={v => {
              const c = CONTRACTORS.find(cc => cc.id === parseInt(v));
              set("contractorId", c ? c.id : null);
              set("contractor", c ? c.name : "");
            }}
              placeholder="Wybierz kontrahenta..."
              options={CONTRACTORS.map(c => ({ value: c.id, label: `${c.name} (${c.nip})` }))} />
          </Field>

          <Field label="Wydział">
            <Select value={form.dept} onChange={v => set("dept", v)}
              options={DEPARTMENTS.map(d => ({ value: d, label: d }))} />
          </Field>

          <Field label="Osoba odpowiedzialna">
            <Select value={form.assignee || ""} onChange={v => set("assignee", parseInt(v) || null)}
              placeholder="Wybierz..."
              options={USERS_LIST.map(u => ({ value: u.id, label: `${u.name} (${u.dept})` }))} />
          </Field>
        </Section>

        <Section title="Terminy">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Data zawarcia / utworzenia">
              <Input type="date" value={form.dateCreated} onChange={v => set("dateCreated", v)} />
            </Field>
            <Field label="Data rozpoczęcia">
              <Input type="date" value={form.dateStart} onChange={v => set("dateStart", v)} />
            </Field>
          </div>
          <Field label="Data zakończenia / termin">
            <Input type="date" value={form.dateEnd} onChange={v => set("dateEnd", v)} />
          </Field>
        </Section>

        <Section title="Finanse">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Wartość netto" hint="Brutto oblicza się automatycznie (23% VAT)">
              <Input type="number" value={form.netValue || ""} onChange={handleNetChange} placeholder="0,00" />
            </Field>
            <Field label="Wartość brutto">
              <div style={{
                padding: "8px 12px", border: `1px solid ${DS.borderLight}`,
                borderRadius: 8, background: DS.neutralLighter, ...typo.titleSmall,
                color: DS.primaryMain, fontVariantNumeric: "tabular-nums",
              }}>
                {formatCurrency(form.grossValue)}
              </div>
            </Field>
          </div>

          <Field label="Klasyfikacja budżetowa">
            <Select value={form.classification} onChange={v => set("classification", v)}
              placeholder="Wybierz klasyfikację..."
              options={CLASSIFICATIONS.map(c => ({ value: c.code, label: `${c.code} — ${c.label}` }))} />
            {form.classification && (() => {
              const cls = CLASSIFICATIONS.find(c => c.code === form.classification);
              if (!cls) return null;
              const pct = Math.round((cls.used / cls.budget) * 100);
              return (
                <div style={{ marginTop: 8, padding: "8px 12px", background: DS.neutralLighter, borderRadius: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", ...typo.bodySmall, color: DS.textSecondary }}>
                    <span>Wykonanie: {formatCurrency(cls.used)}</span>
                    <span>Plan: {formatCurrency(cls.budget)}</span>
                  </div>
                  <div style={{ height: 6, background: DS.neutralLight, borderRadius: 3, marginTop: 6, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 3, width: `${Math.min(pct, 100)}%`, background: pct > 90 ? DS.errorMain : pct > 70 ? DS.warningMain : DS.successMain, transition: "width 0.3s" }} />
                  </div>
                  <div style={{ ...typo.labelSmall, color: pct > 90 ? DS.errorDark : DS.textSecondary, marginTop: 4 }}>
                    {pct}% wykonania planu
                    {form.grossValue > 0 && <span> • po dodaniu: {Math.round(((cls.used + form.grossValue) / cls.budget) * 100)}%</span>}
                  </div>
                </div>
              );
            })()}
          </Field>
        </Section>

        <Section title="Tagi i załączniki">
          <Field label="Tagi">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {TAGS.map(tag => {
                const isActive = form.tags.includes(tag.id);
                return (
                  <button key={tag.id} onClick={() => {
                    set("tags", isActive ? form.tags.filter(t => t !== tag.id) : [...form.tags, tag.id]);
                  }} style={{
                    padding: "5px 12px", borderRadius: 9999, border: `1px solid ${isActive ? tag.color : DS.borderLight}`,
                    background: isActive ? tag.color + "18" : DS.neutralWhite, color: isActive ? tag.color : DS.textSecondary,
                    cursor: "pointer", ...typo.labelMedium, fontFamily: DS.fontFamily, transition: "all 0.15s",
                  }}>{tag.label}</button>
                );
              })}
            </div>
          </Field>

          <Field label="Załączniki">
            <div style={{
              border: `2px dashed ${DS.borderLight}`, borderRadius: 8, padding: "20px",
              textAlign: "center", cursor: "pointer",
              background: DS.neutralLighter, transition: "border-color 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = DS.accentUmowyLight}
              onMouseLeave={e => e.currentTarget.style.borderColor = DS.borderLight}
            >
              <Icon name="upload" size={24} color={DS.accentUmowyMain} style={{ margin: "0 auto 8px", display: "block" }} />
              <div style={{ ...typo.bodySmall, color: DS.textSecondary }}>
                Przeciągnij pliki lub <span style={{ color: DS.accentUmowyMain, fontWeight: 600 }}>kliknij aby wybrać</span>
              </div>
              <div style={{ ...typo.labelSmall, color: DS.textDisabled, marginTop: 4 }}>PDF, DOCX, JPG do 20 MB</div>
            </div>
          </Field>

          <Field label="Notatki">
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
              placeholder="Dodatkowe informacje o dokumencie..."
              rows={3} style={{
                width: "100%", padding: "8px 12px", border: `1px solid ${DS.borderLight}`,
                borderRadius: 8, fontSize: 13, fontFamily: DS.fontFamily, color: DS.textPrimary,
                resize: "vertical", outline: "none",
              }} />
          </Field>
        </Section>
      </div>

      {/* Footer actions - Stripe-like */}
      <div style={{
        padding: "14px 20px", borderTop: `1px solid ${DS.borderLight}`,
        display: "flex", alignItems: "center", gap: 8,
        background: DS.neutralLighter,
      }}>
        <Btn variant="accent" icon="check" onClick={() => onSave(form)} style={{ flex: 1 }}>
          {isNew ? "Dodaj dokument" : "Zapisz zmiany"}
        </Btn>
        <Btn variant="ghost" onClick={onClose}>Anuluj</Btn>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DOCUMENT DETAIL PANEL
   ═══════════════════════════════════════════════════════════════ */
const DocDetailPanel = ({ doc, onClose, onEdit }) => {
  if (!doc) return null;
  const typeInfo = DOC_TYPES[doc.type] || DOC_TYPES.inne;
  const statusInfo = DOC_STATUSES[doc.status] || DOC_STATUSES.draft;
  const user = USERS_LIST.find(u => u.id === doc.assignee);

  return (
    <div style={{
      width: 380, minWidth: 380, borderLeft: `1px solid ${DS.borderLight}`,
      background: DS.neutralWhite, display: "flex", flexDirection: "column",
      height: "100%", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px", borderBottom: `1px solid ${DS.borderLight}`,
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <Badge color={typeInfo.color} bg={typeInfo.bg}>{typeInfo.label}</Badge>
            <Badge color={statusInfo.color} bg={statusInfo.bg}>{statusInfo.label}</Badge>
          </div>
          <div style={{ ...typo.titleSmall, color: DS.primaryMain }}>{doc.title || "Bez tytułu"}</div>
          {doc.number && <div style={{ ...typo.bodySmall, color: DS.textSecondary, fontFamily: "monospace", marginTop: 2 }}>{doc.number}</div>}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <Btn variant="ghost" icon="edit" onClick={() => onEdit(doc)} small />
          <Btn variant="ghost" icon="x" onClick={onClose} small />
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {/* Alerts */}
        {doc.alerts && doc.alerts.length > 0 && (
          <div style={{
            background: DS.warningLighter, border: `1px solid ${DS.warningLight}`,
            borderRadius: 8, padding: "10px 14px", marginBottom: 16,
          }}>
            <div style={{ ...typo.labelMedium, color: DS.warningDark, marginBottom: 4 }}>
              <Icon name="alert" size={14} color={DS.warningDark} style={{ verticalAlign: -2, marginRight: 6 }} />
              Wymagana uwaga
            </div>
            {doc.alerts.map((a, i) => (
              <div key={i} style={{ ...typo.bodySmall, color: DS.textPrimary, paddingLeft: 22 }}>• {a}</div>
            ))}
          </div>
        )}

        {/* Info rows */}
        {[
          { label: "Kontrahent", value: doc.contractor, icon: "users" },
          { label: "Wydział", value: doc.dept, icon: "building" },
          { label: "Osoba odpowiedzialna", value: user?.name, icon: "users" },
          { label: "Data utworzenia", value: formatDate(doc.dateCreated), icon: "clock" },
          { label: "Okres obowiązywania", value: doc.dateStart || doc.dateEnd ? `${formatDate(doc.dateStart)} — ${formatDate(doc.dateEnd)}` : "—", icon: "clock" },
          { label: "Klasyfikacja", value: doc.classification || "—", icon: "tag" },
        ].map((row, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0",
            borderBottom: `1px solid ${DS.borderLight}`,
          }}>
            <Icon name={row.icon} size={14} color={DS.neutralDarker} style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ ...typo.labelSmall, color: DS.textDisabled, textTransform: "uppercase", letterSpacing: 0.5 }}>{row.label}</div>
              <div style={{ ...typo.bodySmall, color: DS.textPrimary, marginTop: 1 }}>{row.value || "—"}</div>
            </div>
          </div>
        ))}

        {/* Financial summary */}
        <div style={{
          marginTop: 16, padding: "14px", background: DS.neutralLighter,
          borderRadius: 8, border: `1px solid ${DS.borderLight}`,
        }}>
          <div style={{ ...typo.labelMedium, color: DS.primaryMain, marginBottom: 10 }}>Finanse</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <div style={{ ...typo.labelSmall, color: DS.textDisabled }}>NETTO</div>
              <div style={{ ...typo.titleSmall, color: DS.textPrimary, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(doc.netValue)}</div>
            </div>
            <div>
              <div style={{ ...typo.labelSmall, color: DS.textDisabled }}>BRUTTO</div>
              <div style={{ ...typo.titleSmall, color: DS.primaryMain, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(doc.grossValue)}</div>
            </div>
          </div>
          {doc.classification && (() => {
            const cls = CLASSIFICATIONS.find(c => c.code === doc.classification);
            if (!cls) return null;
            const pct = Math.round((cls.used / cls.budget) * 100);
            return (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${DS.borderLight}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", ...typo.bodySmall, color: DS.textSecondary }}>
                  <span>{cls.code}</span>
                  <span>{pct}% planu</span>
                </div>
                <div style={{ height: 5, background: DS.neutralLight, borderRadius: 3, marginTop: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, borderRadius: 3, background: pct > 90 ? DS.errorMain : pct > 70 ? DS.warningMain : DS.successMain }} />
                </div>
              </div>
            );
          })()}
        </div>

        {/* Tags */}
        {doc.tags && doc.tags.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ ...typo.labelSmall, color: DS.textDisabled, marginBottom: 6 }}>TAGI</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {doc.tags.map(t => {
                const tag = TAGS.find(tt => tt.id === t);
                return tag ? <Badge key={t} color={tag.color} bg={tag.color + "18"}>{tag.label}</Badge> : null;
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        {doc.notes && (
          <div style={{ marginTop: 16 }}>
            <div style={{ ...typo.labelSmall, color: DS.textDisabled, marginBottom: 6 }}>NOTATKI</div>
            <div style={{ ...typo.bodySmall, color: DS.textPrimary, background: DS.neutralLighter, padding: 10, borderRadius: 8 }}>{doc.notes}</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 20px", borderTop: `1px solid ${DS.borderLight}`, display: "flex", gap: 8 }}>
        <Btn variant="secondary" icon="edit" onClick={() => onEdit(doc)} style={{ flex: 1 }} small>Edytuj</Btn>
        <Btn variant="ghost" icon="eye" small>Podgląd</Btn>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SKARBNIK SUMMARY VIEW
   ═══════════════════════════════════════════════════════════════ */
const SkarbnikSummary = ({ docs }) => {
  const totalGross = docs.reduce((s, d) => s + (d.grossValue || 0), 0);
  const totalNet = docs.reduce((s, d) => s + (d.netValue || 0), 0);
  const byType = {};
  docs.forEach(d => { byType[d.type] = (byType[d.type] || 0) + (d.grossValue || 0); });
  const byDept = {};
  docs.forEach(d => { byDept[d.dept] = (byDept[d.dept] || 0) + (d.grossValue || 0); });
  const byStatus = {};
  docs.forEach(d => { byStatus[d.status] = (byStatus[d.status] || 0) + 1; });
  const doKontr = docs.filter(d => d.status === "do_kontrasygnaty").length;
  const doZatw = docs.filter(d => d.status === "do_zatwierdzenia").length;
  const alertDocs = docs.filter(d => d.alerts && d.alerts.length > 0);

  const Card = ({ children, style = {} }) => (
    <div style={{
      background: DS.neutralWhite, borderRadius: 12,
      border: `1px solid ${DS.borderLight}`, padding: "16px 20px",
      ...style,
    }}>{children}</div>
  );

  const Metric = ({ label, value, sub, color }) => (
    <div>
      <div style={{ ...typo.labelSmall, color: DS.textDisabled, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
      <div style={{ ...typo.titleLarge, color: color || DS.primaryMain, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      {sub && <div style={{ ...typo.bodySmall, color: DS.textSecondary, marginTop: 2 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", background: DS.neutralLighter }}>
      <div style={{ ...typo.titleLarge, color: DS.primaryMain, marginBottom: 4 }}>Podsumowanie dokumentów</div>
      <div style={{ ...typo.bodyMedium, color: DS.textSecondary, marginBottom: 24 }}>Stan na {new Date().toLocaleDateString("pl-PL")} • Gmina Publink</div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <Card>
          <Metric label="Łączna wartość brutto" value={formatCurrency(totalGross)} sub={`Netto: ${formatCurrency(totalNet)}`} />
        </Card>
        <Card>
          <Metric label="Liczba dokumentów" value={docs.length} sub={Object.entries(byType).map(([k, v]) => `${DOC_TYPES[k]?.label || k}: ${docs.filter(d => d.type === k).length}`).join(" • ")} />
        </Card>
        <Card style={doKontr > 0 ? { borderColor: DS.warningLight, background: DS.warningLighter } : {}}>
          <Metric label="Do kontrasygnaty" value={doKontr} color={doKontr > 0 ? DS.warningDark : DS.successMain} sub={doKontr > 0 ? "Wymaga Twojej uwagi" : "Brak oczekujących"} />
        </Card>
        <Card style={alertDocs.length > 0 ? { borderColor: DS.errorLight } : {}}>
          <Metric label="Dokumenty z alertami" value={alertDocs.length} color={alertDocs.length > 0 ? DS.errorDark : DS.successMain} sub={alertDocs.length > 0 ? "Do uzupełnienia" : "Wszystko OK"} />
        </Card>
      </div>

      {/* By department */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ ...typo.titleSmall, color: DS.primaryMain, marginBottom: 16 }}>Wartość dokumentów wg wydziałów</div>
        {Object.entries(byDept).sort((a, b) => b[1] - a[1]).map(([dept, val]) => {
          const pct = totalGross > 0 ? (val / totalGross) * 100 : 0;
          return (
            <div key={dept} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", ...typo.bodySmall, marginBottom: 3 }}>
                <span style={{ color: DS.textPrimary }}>{dept}</span>
                <span style={{ color: DS.textSecondary, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(val)} ({Math.round(pct)}%)</span>
              </div>
              <div style={{ height: 8, background: DS.neutralLight, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 4, width: `${pct}%`, background: DS.accentUmowyMain, transition: "width 0.3s" }} />
              </div>
            </div>
          );
        })}
      </Card>

      {/* Documents requiring attention */}
      {(doKontr > 0 || doZatw > 0) && (
        <Card>
          <div style={{ ...typo.titleSmall, color: DS.primaryMain, marginBottom: 12 }}>Dokumenty wymagające uwagi</div>
          {docs.filter(d => d.status === "do_kontrasygnaty" || d.status === "do_zatwierdzenia" || (d.alerts && d.alerts.length > 0)).map(doc => {
            const statusInfo = DOC_STATUSES[doc.status];
            return (
              <div key={doc.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 0", borderBottom: `1px solid ${DS.borderLight}`,
              }}>
                <Badge color={statusInfo.color} bg={statusInfo.bg}>{statusInfo.label}</Badge>
                <div style={{ flex: 1 }}>
                  <div style={{ ...typo.bodySmall, fontWeight: 500, color: DS.textPrimary }}>{doc.title || "Bez tytułu"}</div>
                  <div style={{ ...typo.labelSmall, color: DS.textSecondary }}>{doc.number} • {doc.contractor}</div>
                </div>
                <div style={{ ...typo.titleSmall, color: DS.primaryMain, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(doc.grossValue)}</div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════ */
const App = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState("all");
  const [docs, setDocs] = useState(INIT_DOCS);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "dateCreated", dir: "desc" });

  // Filter logic
  const filteredDocs = useMemo(() => {
    let result = [...docs];

    // View filter
    switch (activeView) {
      case "umowy": result = result.filter(d => d.type === "umowa"); break;
      case "faktury": result = result.filter(d => d.type === "faktura"); break;
      case "zlecenia": result = result.filter(d => d.type === "zlecenie"); break;
      case "inne": result = result.filter(d => d.type === "aneks" || d.type === "inne"); break;
      case "do_kontrasygnaty": result = result.filter(d => d.status === "do_kontrasygnaty"); break;
      case "do_zatwierdzenia": result = result.filter(d => d.status === "do_zatwierdzenia"); break;
      case "drafts": result = result.filter(d => d.status === "draft"); break;
      case "bez_klasyfikacji": result = result.filter(d => !d.classification); break;
    }

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
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortConfig.dir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.dir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [docs, activeView, searchQuery, sortConfig]);

  // Counts for sidebar
  const docCounts = useMemo(() => ({
    all: docs.length,
    umowy: docs.filter(d => d.type === "umowa").length,
    faktury: docs.filter(d => d.type === "faktura").length,
    zlecenia: docs.filter(d => d.type === "zlecenie").length,
    inne: docs.filter(d => d.type === "aneks" || d.type === "inne").length,
    doKontrasygnaty: docs.filter(d => d.status === "do_kontrasygnaty").length,
    doZatwierdzenia: docs.filter(d => d.status === "do_zatwierdzenia").length,
    drafts: docs.filter(d => d.status === "draft").length,
    bezKlasyfikacji: docs.filter(d => !d.classification).length,
  }), [docs]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc",
    }));
  };

  const handleSave = (formData) => {
    if (editDoc) {
      setDocs(prev => prev.map(d => d.id === editDoc.id ? { ...d, ...formData } : d));
    } else {
      setDocs(prev => [...prev, { ...formData, id: Math.max(...prev.map(d => d.id)) + 1 }]);
    }
    setShowForm(false);
    setEditDoc(null);
  };

  const handleInlineAdd = () => {
    setEditDoc(null);
    setShowForm(true);
  };

  const handleEditDoc = (doc) => {
    setEditDoc(doc);
    setShowForm(true);
    setSelectedDoc(null);
  };

  const viewLabel = {
    all: "Wszystkie dokumenty",
    umowy: "Umowy",
    faktury: "Faktury",
    zlecenia: "Zlecenia",
    inne: "Inne dokumenty",
    do_kontrasygnaty: "Do kontrasygnaty",
    do_zatwierdzenia: "Do zatwierdzenia",
    drafts: "Szkice",
    bez_klasyfikacji: "Bez klasyfikacji",
    podsumowanie: "Podsumowanie",
    kontrahenci: "Kontrahenci",
  };

  return (
    <div style={{
      display: "flex", height: "100vh", overflow: "hidden",
      fontFamily: DS.fontFamily, color: DS.textPrimary, fontSize: 13,
      WebkitFontSmoothing: "antialiased",
    }}>
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={v => { setActiveView(v); setSelectedDoc(null); }}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(p => !p)}
        docCounts={docCounts}
      />

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{
          padding: "12px 24px", display: "flex", alignItems: "center", gap: 16,
          borderBottom: `1px solid ${DS.borderLight}`, background: DS.neutralWhite,
          minHeight: 56,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ ...typo.titleMedium, color: DS.primaryMain }}>{viewLabel[activeView] || "Dokumenty"}</div>
            <div style={{ ...typo.bodySmall, color: DS.textSecondary }}>
              {filteredDocs.length} {filteredDocs.length === 1 ? "dokument" : filteredDocs.length < 5 ? "dokumenty" : "dokumentów"}
              {searchQuery && ` • wyszukiwanie: "${searchQuery}"`}
            </div>
          </div>

          <Input value={searchQuery} onChange={setSearchQuery} placeholder="Szukaj dokumentów..." icon="search" style={{ width: 260 }} />

          <Btn variant="accent" icon="plus" onClick={handleInlineAdd}>
            Nowy dokument
          </Btn>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {activeView === "podsumowanie" ? (
            <SkarbnikSummary docs={docs} />
          ) : (
            <>
              <DocTable
                docs={filteredDocs}
                onSelectDoc={doc => { setSelectedDoc(doc); setShowForm(false); }}
                onInlineAdd={handleInlineAdd}
                selectedId={selectedDoc?.id}
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              {selectedDoc && !showForm && (
                <DocDetailPanel
                  doc={selectedDoc}
                  onClose={() => setSelectedDoc(null)}
                  onEdit={handleEditDoc}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Form drawer overlay */}
      {showForm && (
        <>
          <div style={{
            position: "fixed", inset: 0, background: "rgba(10,15,42,0.3)",
            zIndex: 99, animation: "fadeIn 0.15s ease",
          }} onClick={() => { setShowForm(false); setEditDoc(null); }} />
          <DocFormDrawer
            doc={editDoc}
            isNew={!editDoc}
            onClose={() => { setShowForm(false); setEditDoc(null); }}
            onSave={handleSave}
          />
        </>
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow: hidden; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${DS.neutralMain}; border-radius: 3px; }
        input, select, textarea, button { font-family: ${DS.fontFamily}; }
        input:focus, select:focus, textarea:focus { border-color: ${DS.accentUmowyMain} !important; }
      `}</style>
    </div>
  );
};

export default App;