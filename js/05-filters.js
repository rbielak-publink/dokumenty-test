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
          borderBottom: active ? `2px solid ${DS.accentUmowyMain}` : "2px solid transparent",
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
              background: active ? DS.accentUmowyLighter : DS.neutralLighter,
              color: active ? DS.accentUmowyDark : DS.textDisabled,
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
      onMouseEnter={e => { e.currentTarget.style.borderColor = DS.accentUmowyLight; e.currentTarget.style.color = DS.accentUmowyMain; }}
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
        padding: "7px 10px", border: `1px solid ${open ? DS.accentUmowyMain : DS.borderLight}`,
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
                background: checked ? DS.accentUmowyLighter : "transparent",
              }}
                onMouseEnter={e => { if (!checked) e.currentTarget.style.background = DS.neutralLighter; }}
                onMouseLeave={e => e.currentTarget.style.background = checked ? DS.accentUmowyLighter : "transparent"}
              >
                <div style={{
                  width: 14, height: 14, borderRadius: 3,
                  border: `1.5px solid ${checked ? DS.accentUmowyMain : DS.borderLight}`,
                  background: checked ? DS.accentUmowyMain : "transparent",
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
        <Badge key={b.key} color={DS.accentUmowyDark} bg={DS.accentUmowyLighter} small>
          {b.label}
        </Badge>
      ))}
    </div>
  );
};
