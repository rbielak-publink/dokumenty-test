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
              border: `1.5px solid ${checked ? DS.accentUmowyMain : DS.borderLight}`,
              background: checked ? DS.accentUmowyMain : "transparent",
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
              background: active ? DS.accentUmowyLighter : "transparent",
              color: active ? DS.accentUmowyDark : DS.textSecondary,
              fontFamily: DS.fontFamily, fontSize: 12, fontWeight: active ? 600 : 400,
              cursor: "pointer", transition: "all 0.12s", whiteSpace: "nowrap",
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = DS.neutralLighter; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? DS.accentUmowyLighter : "transparent"; }}
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
              onFocus={e => e.target.style.borderColor = DS.accentUmowyMain}
              onBlur={e => e.target.style.borderColor = DS.borderLight}
            />
          </Field>
          <div style={{ ...S.col, gap: 8 }}>
            <span style={{ ...typo.labelSmall, color: DS.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 }}>Aktywne filtry</span>
            {activeFilters.length > 0 ? (
              <div style={{ ...S.row, gap: 6, flexWrap: "wrap" }}>
                {activeFilters.map(([key, val]) => (
                  <Badge key={key} color={DS.accentUmowyDark} bg={DS.accentUmowyLighter} small>
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
