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
    accent: { bg: DS.accentUmowyMain, color: "#fff", hoverBg: DS.accentUmowyDark, border: "none" },
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
