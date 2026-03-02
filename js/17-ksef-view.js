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
