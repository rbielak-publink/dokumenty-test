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
              <span style={{
                ...typo.labelSmall, padding: "0 5px", ...S.pill,
                background: active ? DS.accentUmowyLighter : DS.neutralLighter,
                color: active ? DS.accentUmowyDark : DS.textDisabled,
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
                  onMouseEnter={e => { e.currentTarget.style.borderColor = DS.accentUmowyMain; e.currentTarget.style.color = DS.accentUmowyMain; }}
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
