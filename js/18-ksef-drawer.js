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
