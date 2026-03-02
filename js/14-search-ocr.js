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
