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
