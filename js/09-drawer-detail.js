/* ═══════════════════════════════════════════════════════════════
   DRAWER DETAIL — dual mode: preview (read-only) vs edit
   with 4 tabs: Szczegóły / Faktury / Załączniki / Zaangażowanie (P3)
   ═══════════════════════════════════════════════════════════════ */
const DrawerDetail = ({ doc, onClose, onSave, onNavigate, hasPrev, hasNext }) => {
  const [mode, setMode] = useState("preview"); // preview | edit
  const [activeTab, setActiveTab] = useState("details");
  const [rightTab, setRightTab] = useState("budget"); // budget | preview
  const [form, setForm] = useState(null);

  useEffect(() => {
    setMode("preview");
    setActiveTab("details");
    setRightTab("budget");
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
  const statusInfo = DOC_STATUSES[doc.status] || DOC_STATUSES.draft;
  const user = USERS_LIST.find(u => u.id === doc.assignee);
  const cls = CLASSIFICATIONS.find(c => c.code === doc.classification);
  const docAlerts = computeAlerts(doc);
  const children = CHILD_DOCS[doc.id] || [];

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
  const FieldRow = ({ label, value, icon }) => (
    <div style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: `1px solid ${DS.borderLight}` }}>
      <div style={{ width: 150, flexShrink: 0 }}>
        <span style={{ ...typo.labelSmall, color: DS.textDisabled, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
      </div>
      <div style={{ flex: 1, ...typo.bodySmall, color: DS.textPrimary }}>{value || "—"}</div>
    </div>
  );

  /* ---- Budget sidebar ---- */
  const BudgetSidebar = () => {
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

  return (
    <div style={{ ...S.overlay, zIndex: 100, background: "rgba(15,23,74,0.35)", backdropFilter: "blur(2px)" }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{
      position: "absolute", top: 0, right: 0, bottom: 0,
      width: "min(1100px, 85vw)", background: DS.neutralWhite, ...S.col,
      boxShadow: "-8px 0 30px rgba(0,0,0,0.12)", overflow: "hidden",
    }}>
      {/* ===== Header ===== */}
      <div style={{
        padding: "16px 24px", borderBottom: `1px solid ${DS.borderLight}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ ...S.row, gap: 12, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, background: DS.accentUmowyLighter,
            ...S.row, justifyContent: "center", alignItems: "center", flexShrink: 0,
          }}>
            <Icon name={typeInfo.icon} size={18} color={DS.accentUmowyMain} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ ...S.row, gap: 8 }}>
              <span style={{ ...typo.titleSmall, color: DS.primaryMain, fontWeight: 700, fontSize: 16 }}>{doc.number || "Bez numeru"}</span>
              <Badge color={statusInfo.color} bg={statusInfo.bg}>{statusInfo.label}</Badge>
              {docAlerts.map(a => <AlertBadge key={a} code={a} />)}
            </div>
            <div style={{ ...typo.bodySmall, color: DS.textSecondary, marginTop: 2 }}>
              {typeInfo.label} &bull; {doc.contractor || "Brak kontrahenta"}
            </div>
          </div>
        </div>
        <div style={{ ...S.row, gap: 4, flexShrink: 0, marginLeft: 16 }}>
          <Btn variant="ghost" icon="chevronLeft" small disabled={!hasPrev} onClick={() => onNavigate(-1)} title="Poprzedni" />
          <Btn variant="ghost" icon="chevronRight" small disabled={!hasNext} onClick={() => onNavigate(1)} title="Następny" />
          <div style={{ width: 1, height: 20, background: DS.borderLight, margin: "0 4px" }} />
          <Btn variant="ghost" icon="x" small onClick={onClose} title="Zamknij" />
        </div>
      </div>

      {/* ===== Two-column body ===== */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ---- LEFT: Dane dokumentu ---- */}
        <div style={{ flex: 1, ...S.col, borderRight: `1px solid ${DS.borderLight}`, overflow: "hidden" }}>
          {/* Left header label */}
          <div style={{ padding: "10px 24px", borderBottom: `1px solid ${DS.borderLight}`, ...S.row, gap: 8 }}>
            <span style={{ ...typo.labelMedium, color: DS.primaryMain, fontWeight: 600 }}>Dane dokumentu</span>
            {mode === "preview" && (
              <button onClick={() => setMode("edit")} style={{
                marginLeft: "auto", ...S.row, gap: 4, padding: "3px 10px", borderRadius: 5,
                border: `1px solid ${DS.borderLight}`, background: DS.neutralWhite,
                color: DS.textSecondary, cursor: "pointer", ...typo.labelSmall,
                fontFamily: DS.fontFamily, fontWeight: 500, fontSize: 11,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = DS.accentUmowyMain; e.currentTarget.style.color = DS.accentUmowyMain; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = DS.borderLight; e.currentTarget.style.color = DS.textSecondary; }}
              >
                <Icon name="edit" size={11} /> Edytuj
              </button>
            )}
            {mode === "edit" && (
              <div style={{ marginLeft: "auto", ...S.row, gap: 6 }}>
                <Btn variant="accent" icon="check" onClick={handleSaveEdit} small>Zapisz</Btn>
                <Btn variant="ghost" onClick={() => setMode("preview")} small>Anuluj</Btn>
              </div>
            )}
          </div>

          {/* Left scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
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

                {/* Field rows — form-like layout */}
                <FieldRow label="Numer" value={doc.number} />
                <FieldRow label="Typ" value={typeInfo.label} />
                <FieldRow label="Kontrahent" value={doc.contractor} />
                <FieldRow label="Przedmiot / Opis" value={doc.title || "Bez tytułu"} />
                <FieldRow label="Kwota" value={doc.grossValue ? formatCurrency(doc.grossValue) : "—"} />
                <FieldRow label="Kwota netto" value={doc.netValue ? formatCurrency(doc.netValue) : "—"} />
                <FieldRow label="Data" value={formatDate(doc.dateCreated)} />
                <FieldRow label="Okres" value={doc.dateStart ? `${formatDate(doc.dateStart)} — ${formatDate(doc.dateEnd)}` : "—"} />
                <FieldRow label="Klasyfikacja budżetowa" value={cls ? `${cls.code} — ${cls.label}` : "—"} />
                <FieldRow label="Wydział" value={doc.dept} />
                <FieldRow label="Osoba odpowiedzialna" value={user?.name} />
                <FieldRow label="Status" value={<Badge color={statusInfo.color} bg={statusInfo.bg}>{statusInfo.label}</Badge>} />

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

                {/* Podpięte dokumenty (children) */}
                {children.length > 0 && (
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${DS.borderLight}` }}>
                    <div style={{ ...S.row, gap: 6, marginBottom: 10 }}>
                      <Icon name="layers" size={14} color={DS.primaryMain} />
                      <span style={{ ...typo.labelMedium, color: DS.primaryMain, fontWeight: 600 }}>Podpięte dokumenty ({children.length})</span>
                    </div>
                    {children.map(ch => {
                      const ctInfo = CHILD_TYPE_LABELS[ch.childType] || { label: ch.childType, icon: "file", color: DS.neutralDark };
                      return (
                        <div key={ch.id} style={{ ...S.row, gap: 10, padding: "8px 0", borderBottom: `1px solid ${DS.borderLight}` }}>
                          <Icon name={ctInfo.icon} size={13} color={ctInfo.color} />
                          <span style={{ ...typo.bodySmall, color: DS.textPrimary, flex: 1 }}>{ch.title}</span>
                          {ch.grossValue > 0 && <span style={{ ...typo.labelSmall, fontWeight: 500, color: DS.textPrimary, fontVariantNumeric: "tabular-nums" }}>{formatCurrency(ch.grossValue)}</span>}
                          {ch.fileName && <span style={{ ...typo.labelSmall, color: DS.textDisabled }}>{ch.fileName}</span>}
                        </div>
                      );
                    })}
                  </div>
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
                          <div style={{ position: "absolute", left: -17, top: 6, width: 10, height: 10, borderRadius: "50%", background: idx === 0 ? DS.accentUmowyMain : DS.neutralMain, border: `2px solid ${DS.neutralWhite}` }} />
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
          </div>
        </div>

        {/* ---- RIGHT: Context panel ---- */}
        <div style={{ width: 380, minWidth: 380, ...S.col, overflow: "hidden", background: DS.neutralWhite }}>
          {/* Right tabs */}
          <div style={{ padding: "0 16px", borderBottom: `1px solid ${DS.borderLight}`, ...S.row }}>
            {[
              { id: "budget", label: "Kontekst budżetowy" },
              { id: "preview", label: "Podgląd załącznika" },
            ].map(t => (
              <button key={t.id} onClick={() => setRightTab(t.id)} style={{
                padding: "10px 14px", border: "none", background: "transparent", cursor: "pointer",
                fontFamily: DS.fontFamily, fontSize: 12, fontWeight: rightTab === t.id ? 600 : 400,
                color: rightTab === t.id ? DS.primaryMain : DS.textSecondary,
                borderBottom: rightTab === t.id ? `2px solid ${DS.accentUmowyMain}` : "2px solid transparent",
                transition: "all 0.15s",
              }}>{t.label}</button>
            ))}
          </div>
          {/* Right content */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            {rightTab === "budget" && <BudgetSidebar />}
            {rightTab === "preview" && (
              <div style={{ textAlign: "center", padding: "40px 16px" }}>
                <Icon name="file" size={40} color={DS.neutralLight} style={{ margin: "0 auto 12px", display: "block" }} />
                <div style={{ ...typo.titleSmall, color: DS.textSecondary, marginBottom: 4 }}>Podgląd pliku</div>
                <div style={{ ...typo.bodySmall, color: DS.textDisabled }}>Wybierz załącznik aby zobaczyć podgląd</div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
    </div>
  );
};
