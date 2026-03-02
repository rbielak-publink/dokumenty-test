const DocFormModal = ({ onClose, onSave, docs, editDoc }) => {
  const isEdit = !!editDoc;
  const meta = DOC_TYPE_META[editDoc?.type] || {};
  const isSimple = (type) => DOC_TYPE_META[type]?.simpleForm;
  const getStepLabels = (type) => isSimple(type) ? ["Typ dokumentu", "Dane dokumentu"] : ["Typ dokumentu", "Dane podstawowe", "Klasyfikacja", "Formalności"];
  const [step, setStep] = useState(isEdit ? 1 : 0);
  const [form, setForm] = useState(() => {
    if (editDoc) return { ...editDoc };
    return {
      type: "", status: "draft", title: "", number: "", nrEwidencyjny: "", rodzajUmowy: "wydatkowa",
      contractor: "", dept: DEPARTMENTS[0], assignee: 1, netValue: 0, grossValue: 0,
      classification: "", dateCreated: new Date().toISOString().split("T")[0],
      dateStart: "", dateEnd: "", tags: [], alerts: [], notes: "",
      linkedTo: null, uploadedFile: null,
      zamowieniePubliczne: false, tryb_pzp: "", nr_postepowania: "",
      dofinansowanie: false, zrodloDofinansowania: "",
      podpisStonn: false, kontrasygnatSkarbnika: false,
      harmonogram: [],
    };
  });
  const [ocrStep, setOcrStep] = useState(null);
  const [ocrFile, setOcrFile] = useState(null);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const curMeta = DOC_TYPE_META[form.type] || {};
  const stepLabels = getStepLabels(form.type);
  const maxStep = stepLabels.length - 1;

  const canNext = () => {
    if (step === 0) return !!form.type;
    if (step === 1) {
      if (!form.title) return false;
      if (curMeta.linkRequired && !form.linkedTo) return false;
      return true;
    }
    return true;
  };

  const linkableDocs = (docs || []).filter(d => {
    const allowed = LINK_TYPES[form.type];
    return allowed && allowed.includes(d.type);
  });

  /* simulated OCR — only for umowa & faktura */
  const ocrResults = form.type === "faktura" ? {
    title: "Faktura za materiały biurowe", contractor: "BiuroPlus Sp. z o.o.",
    number: "FV/2025/OCR-001", grossValue: 4243.50,
    dateCreated: "2025-02-10", confidence: 87,
  } : {
    title: "Umowa na dostawę sprzętu IT", contractor: "TechSolutions Sp. z o.o.",
    number: "UM/2025/OCR-042", grossValue: 58900,
    dateStart: "2025-03-01", dateEnd: "2025-12-31", confidence: 82,
  };

  const handleOcrUpload = () => {
    setOcrFile("skan_dokument.pdf");
    setOcrStep("processing");
    setTimeout(() => setOcrStep("results"), 1800);
  };
  const handleOcrAccept = () => {
    Object.entries(ocrResults).forEach(([k,v]) => { if (k !== "confidence") set(k, v); });
    setOcrStep(null);
    setStep(1);
  };

  /* budget context */
  const selectedClassification = CLASSIFICATIONS.find(c => c.code === form.classification);
  const budgetPct = selectedClassification ? Math.round(((selectedClassification.used + form.grossValue) / selectedClassification.budget) * 100) : null;
  const budgetColor = budgetPct === null ? DS.textDisabled : budgetPct >= 85 ? DS.errorMain : budgetPct >= 60 ? DS.warningMain : DS.successMain;

  /* payment schedule helpers */
  const addScheduleRow = () => set("harmonogram", [...form.harmonogram, { date: "", amount: 0, label: "" }]);
  const updateScheduleRow = (i, k, v) => {
    const h = [...form.harmonogram]; h[i] = { ...h[i], [k]: v }; set("harmonogram", h);
  };
  const removeScheduleRow = (i) => set("harmonogram", form.harmonogram.filter((_, idx) => idx !== i));

  /* Registry number auto-assign: PREFIX NN/RRRR per document type */
  const REGISTRY_PREFIXES = { umowa: "CRU", faktura: "REF", aneks: "AN", zlecenie: "RZ" };

  const getNextNrEwidencyjny = (type) => {
    const prefix = REGISTRY_PREFIXES[type];
    if (!prefix) return "";
    const existing = (docs || []).filter(d => d.type === type && d.nrEwidencyjny).map(d => {
      const m = d.nrEwidencyjny.match(/(\d+)\/(\d{4})$/);
      return m ? parseInt(m[1]) : 0;
    });
    const maxNum = existing.length > 0 ? Math.max(...existing) : 0;
    return `${prefix} ${maxNum + 1}/2026`;
  };

  return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(10,15,42,0.35)", zIndex: 200, animation: "fadeIn 0.15s ease", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 600, maxHeight: "85vh", background: DS.neutralWhite, borderRadius: 16,
        boxShadow: "0 24px 64px rgba(10,15,42,0.18)", zIndex: 201,
        animation: "modalIn 0.2s ease", overflow: "hidden", ...S.col,
      }}>
        {/* ── Header ── */}
        <div style={{
          padding: "16px 20px", ...S.row, gap: 10,
          borderBottom: `1px solid ${DS.borderLight}`,
          background: `linear-gradient(135deg, ${DS.accentUmowyLighter}, ${DS.neutralWhite})`,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, ...S.row, justifyContent: "center",
            background: `linear-gradient(135deg, ${DS.accentUmowyMain}, ${DS.accentUmowyDark})`,
          }}>
            <Icon name={isEdit ? "edit" : "plus"} size={18} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ ...typo.titleSmall, color: DS.primaryMain }}>{isEdit ? "Edycja dokumentu" : "Nowy dokument"}</div>
            <div style={{ ...typo.bodySmall, color: DS.textSecondary }}>
              {isEdit ? DOC_TYPES[form.type]?.label : stepLabels[step]}
              {isEdit && <span style={{ ...typo.labelSmall, color: DS.textDisabled, marginLeft: 6 }}>• typ zablokowany</span>}
            </div>
          </div>
          <Btn variant="ghost" icon="x" onClick={onClose} small />
        </div>

        {/* ── Step indicator — circle style like prototype ── */}
        <div style={{ display: "flex", alignItems: "center", padding: "12px 20px", background: DS.neutralLighter, gap: 0 }}>
          {stepLabels.map((label, i) => {
            const isDone = i < step;
            const isCurrent = i === step;
            const circleSize = 28;
            return (
              <React.Fragment key={i}>
                {i > 0 && <div style={{ flex: 1, height: 2, background: isDone || isCurrent ? DS.accentUmowyMain : DS.borderLight, transition: "background 0.3s" }} />}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  <div style={{
                    width: circleSize, height: circleSize, borderRadius: "50%",
                    background: isDone ? DS.successMain : isCurrent ? DS.accentUmowyMain : DS.neutralWhite,
                    border: `2px solid ${isDone ? DS.successMain : isCurrent ? DS.accentUmowyMain : DS.borderLight}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.3s",
                  }}>
                    {isDone ? <Icon name="check" size={14} color="#fff" /> :
                      <span style={{ ...typo.labelSmall, fontWeight: 700, color: isCurrent ? "#fff" : DS.textDisabled }}>{i + 1}</span>}
                  </div>
                  <span style={{
                    ...typo.labelSmall, fontSize: 9, color: isDone ? DS.successDark : isCurrent ? DS.accentUmowyDark : DS.textDisabled,
                    maxWidth: 64, textAlign: "center", lineHeight: "1.2",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>{label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* ── Content ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {/* ────────── STEP 0: Type selection ────────── */}
          {step === 0 && !ocrStep && (
            <div>
              <div style={{ ...typo.bodyMedium, color: DS.textPrimary, marginBottom: 16 }}>Wybierz typ dokumentu</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {Object.entries(DOC_TYPES).map(([key, dt]) => {
                  const active = form.type === key;
                  return (
                    <div key={key} onClick={() => set("type", key)} style={{
                      padding: "14px 16px", borderRadius: 12, cursor: "pointer", transition: "all 0.15s",
                      border: `2px solid ${active ? dt.color : DS.borderLight}`,
                      background: active ? dt.bg : DS.neutralWhite,
                    }}>
                      <div style={{ ...S.row, gap: 10, marginBottom: 4 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8, ...S.row, justifyContent: "center",
                          background: active ? dt.color : DS.neutralLighter,
                        }}>
                          <Icon name={dt.icon} size={16} color={active ? "#fff" : dt.color} />
                        </div>
                        <span style={{ ...typo.titleSmall, color: active ? dt.color : DS.textPrimary }}>{dt.label}</span>
                      </div>
                      <div style={{ ...typo.bodySmall, color: DS.textSecondary }}>{DOC_TYPE_META[key]?.desc}</div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ────────── STEP 1: Basic data + file ────────── */}
          {step === 1 && (
            <div>
              {/* type badge */}
              <div style={{ ...S.row, gap: 8, marginBottom: 16 }}>
                {form.type && (() => {
                  const dt = DOC_TYPES[form.type];
                  return (
                    <div style={{ ...S.row, gap: 8, padding: "6px 14px", borderRadius: 8, background: dt.bg, border: `1px solid ${dt.color}22` }}>
                      <Icon name={dt.icon} size={14} color={dt.color} />
                      <span style={{ ...typo.labelMedium, color: dt.color, fontWeight: 600 }}>{dt.label}</span>
                    </div>
                  );
                })()}
              </div>

              {/* ── INNE: simplified — only name ── */}
              {form.type === "inne" && (
                <Section title="Dane dokumentu">
                  <Field label="Nazwa dokumentu *">
                    <Input value={form.title} onChange={v => set("title", v)} placeholder="np. Regulamin JST, Zarządzenie Wójta..." />
                  </Field>
                  <Field label="Notatki">
                    <textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} placeholder="Opcjonalny opis..."
                      rows={2} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${DS.borderLight}`, borderRadius: 8, fontSize: 13, fontFamily: DS.fontFamily, color: DS.textPrimary, resize: "vertical", outline: "none" }} />
                  </Field>
                </Section>
              )}

              {/* ── ZAŁĄCZNIK: name + linked doc ── */}
              {form.type === "zalacznik" && (
                <Section title="Dane załącznika">
                  <Field label="Nazwa załącznika *">
                    <Input value={form.title} onChange={v => set("title", v)} placeholder="np. Protokół odbioru, Pismo przewodnie..." />
                  </Field>
                  <Field label={curMeta.linkLabel}>
                    <Select value={form.linkedTo ? String(form.linkedTo) : ""} onChange={v => set("linkedTo", Number(v) || null)}
                      placeholder="Wyszukaj dokument..." options={linkableDocs.map(d => ({ value: String(d.id), label: `${DOC_TYPES[d.type]?.label}: ${d.title}` }))} />
                  </Field>
                  {form.linkedTo && (() => {
                    const ld = (docs||[]).find(d => d.id === form.linkedTo);
                    return ld ? (
                      <div style={{ ...S.row, gap: 8, padding: "8px 12px", borderRadius: 8, background: DS.successLighter }}>
                        <Icon name="link" size={14} color={DS.successDark} />
                        <span style={{ ...typo.bodySmall, color: DS.successDark }}>{ld.title}</span>
                        <span style={{ ...typo.labelSmall, color: DS.textDisabled }}>• {ld.contractor}</span>
                      </div>
                    ) : null;
                  })()}
                </Section>
              )}

              {/* ── FULL FORM: umowa, faktura, zlecenie, aneks ── */}
              {!isSimple(form.type) && (
                <>
                  {/* ── FILE UPLOAD at top (drag & drop + OCR) ── */}
                  <Section title="Plik dokumentu">
                    {form.uploadedFile ? (
                      <div style={{ ...S.row, gap: 10, padding: "12px 14px", borderRadius: 10, background: DS.neutralLighter, border: `1px solid ${DS.borderLight}` }}>
                        <Icon name="file" size={20} color={DS.accentUmowyMain} />
                        <div style={{ flex: 1 }}>
                          <div style={{ ...typo.bodySmall, fontWeight: 600, color: DS.textPrimary }}>{form.uploadedFile}</div>
                          <div style={{ ...typo.labelSmall, color: DS.textDisabled }}>PDF • 2.4 MB</div>
                        </div>
                        <button onClick={() => set("uploadedFile", null)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                          <Icon name="x" size={14} color={DS.textDisabled} />
                        </button>
                      </div>
                    ) : ocrStep === "processing" ? (
                      <div style={{ textAlign: "center", padding: "20px 0" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", margin: "0 auto 12px", border: `3px solid ${DS.borderLight}`, borderTopColor: DS.accentUmowyMain, animation: "spin 1s linear infinite" }} />
                        <div style={{ ...typo.bodySmall, color: DS.textPrimary }}>Rozpoznawanie tekstu...</div>
                        <div style={{ ...typo.labelSmall, color: DS.textDisabled }}>{ocrFile}</div>
                      </div>
                    ) : ocrStep === "results" ? (
                      <div>
                        <div style={{ ...S.row, gap: 8, marginBottom: 12 }}>
                          <Icon name="sparkles" size={16} color={DS.successMain} />
                          <span style={{ ...typo.bodySmall, color: DS.successDark, fontWeight: 600 }}>Rozpoznano {ocrResults.confidence}% pól</span>
                        </div>
                        <div style={{ ...S.row, gap: 10, padding: "10px 14px", borderRadius: 10, background: DS.neutralLighter, marginBottom: 10 }}>
                          <Icon name="file" size={18} color={DS.accentUmowyMain} />
                          <div style={{ flex: 1 }}>
                            <div style={{ ...typo.bodySmall, fontWeight: 600, color: DS.textPrimary }}>{ocrFile}</div>
                            <div style={{ ...typo.labelSmall, color: DS.textDisabled }}>PDF • 2.4 MB</div>
                          </div>
                          <Icon name="check" size={14} color={DS.successMain} />
                        </div>
                        {Object.entries(ocrResults).filter(([k]) => k !== "confidence").map(([k, v]) => (
                          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${DS.borderLight}` }}>
                            <span style={{ ...typo.labelSmall, color: DS.textSecondary }}>{k === "title" ? "Przedmiot" : k === "contractor" ? "Kontrahent" : k === "number" ? "Numer" : k === "grossValue" ? "Kwota brutto" : k === "dateCreated" ? "Data" : k === "dateStart" ? "Od" : k === "dateEnd" ? "Do" : k}</span>
                            <span style={{ ...typo.bodySmall, color: DS.textPrimary, fontWeight: 500 }}>{typeof v === "number" ? formatCurrency(v) : v}</span>
                          </div>
                        ))}
                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                          <Btn variant="accent" icon="sparkles" onClick={() => { handleOcrAccept(); set("uploadedFile", ocrFile); }} small style={{ flex: 1 }}>Zastosuj dane</Btn>
                          <Btn variant="ghost" onClick={() => { setOcrStep(null); set("uploadedFile", ocrFile); }} small>Tylko plik</Btn>
                        </div>
                      </div>
                    ) : (
                      <div onClick={() => {
                        if (curMeta.hasOcr) { setOcrFile("skan_dokument.pdf"); setOcrStep("processing"); setTimeout(() => setOcrStep("results"), 1800); }
                        else { set("uploadedFile", "dokument_skan.pdf"); }
                      }} style={{
                        border: `2px dashed ${DS.borderLight}`, borderRadius: 10, padding: "20px", textAlign: "center",
                        cursor: "pointer", transition: "all 0.15s", background: DS.neutralWhite,
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = DS.accentUmowyMain; e.currentTarget.style.background = DS.neutralLighter; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = DS.borderLight; e.currentTarget.style.background = DS.neutralWhite; }}
                      >
                        <Icon name="upload" size={20} color={DS.textDisabled} />
                        <div style={{ ...typo.bodySmall, color: DS.textSecondary, marginTop: 6 }}>Przeciągnij plik lub kliknij</div>
                        <div style={{ ...typo.labelSmall, color: DS.textDisabled }}>PDF, JPG, PNG, DOCX • max 10 MB</div>
                        {curMeta.hasOcr && (
                          <div style={{ ...S.row, gap: 6, justifyContent: "center", marginTop: 8 }}>
                            <Icon name="sparkles" size={12} color={DS.accentUmowyMain} />
                            <span style={{ ...typo.labelSmall, color: DS.accentUmowyMain }}>Autouzupełnianie dostępne</span>
                          </div>
                        )}
                      </div>
                    )}
                  </Section>

                  {/* linked document (for faktura, aneks) */}
                  {curMeta.needsLink && (
                    <div style={{ marginBottom: 16 }}>
                      <Field label={curMeta.linkLabel + (curMeta.linkRequired ? " *" : "")}>
                        <Select value={form.linkedTo ? String(form.linkedTo) : ""} onChange={v => set("linkedTo", Number(v) || null)}
                          placeholder="Wyszukaj dokument..." options={linkableDocs.map(d => ({ value: String(d.id), label: `${DOC_TYPES[d.type]?.label}: ${d.title}` }))} />
                      </Field>
                      {form.linkedTo && (() => {
                        const ld = (docs||[]).find(d => d.id === form.linkedTo);
                        return ld ? (
                          <div style={{ ...S.row, gap: 8, padding: "8px 12px", borderRadius: 8, background: DS.successLighter, marginTop: 6 }}>
                            <Icon name="link" size={14} color={DS.successDark} />
                            <span style={{ ...typo.bodySmall, color: DS.successDark }}>{ld.title}</span>
                            <span style={{ ...typo.labelSmall, color: DS.textDisabled }}>• {ld.contractor}</span>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}

                  <Section title="Informacje podstawowe">
                    <Field label="Przedmiot *">
                      <Input value={form.title} onChange={v => set("title", v)} placeholder={
                        form.type === "faktura" ? "np. Faktura za materiały biurowe" :
                        form.type === "aneks" ? "np. Aneks nr 1 do umowy na dostawę sprzętu" :
                        form.type === "zlecenie" ? "np. Zlecenie na usługę transportową" :
                        "np. Umowa na dostawę sprzętu IT"
                      } />
                    </Field>

                    {/* Rodzaj umowy toggle */}
                    <Field label="Rodzaj">
                      <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: `1px solid ${DS.borderLight}` }}>
                        {[{v: "wydatkowa", l: "Wydatkowa", icon: "upload"}, {v: "dochodowa", l: "Dochodowa", icon: "download"}].map(opt => (
                          <button key={opt.v} onClick={() => set("rodzajUmowy", opt.v)} style={{
                            flex: 1, padding: "8px 12px", border: "none", cursor: "pointer",
                            fontFamily: DS.fontFamily, ...typo.bodySmall, fontWeight: 600, transition: "all 0.15s",
                            ...S.row, gap: 6, justifyContent: "center",
                            background: form.rodzajUmowy === opt.v ? (opt.v === "wydatkowa" ? DS.errorLighter : DS.successLighter) : DS.neutralWhite,
                            color: form.rodzajUmowy === opt.v ? (opt.v === "wydatkowa" ? DS.errorDark : DS.successDark) : DS.textDisabled,
                          }}>
                            <Icon name={opt.icon} size={13} color={form.rodzajUmowy === opt.v ? (opt.v === "wydatkowa" ? DS.errorDark : DS.successDark) : DS.textDisabled} />
                            {opt.l}
                          </button>
                        ))}
                      </div>
                    </Field>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <Field label="Kwota brutto (zł)">
                        <Input type="number" value={form.grossValue || ""} onChange={v => set("grossValue", Number(v) || 0)} placeholder="0,00" />
                      </Field>
                      <Field label="Kwota netto (zł)">
                        <Input type="number" value={form.netValue || ""} onChange={v => set("netValue", Number(v) || 0)} placeholder="0,00" />
                      </Field>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <Field label="Numer dokumentu">
                        <Input value={form.number} onChange={v => set("number", v)} placeholder={
                          form.type === "faktura" ? "FV/2025/..." :
                          form.type === "aneks" ? "AN/2025/..." :
                          form.type === "zlecenie" ? "ZL/2025/..." :
                          "UM/2025/..."
                        } />
                      </Field>
                      <Field label={`Nr ewidencyjny${REGISTRY_PREFIXES[form.type] ? ` (${REGISTRY_PREFIXES[form.type]})` : ""}`}>
                        <div style={{ ...S.row, gap: 6 }}>
                          <div style={{ flex: 1 }}>
                            <Input value={form.nrEwidencyjny} onChange={v => set("nrEwidencyjny", v)} placeholder={REGISTRY_PREFIXES[form.type] ? `${REGISTRY_PREFIXES[form.type]} NN/RRRR` : "NN/RRRR"} />
                          </div>
                          {REGISTRY_PREFIXES[form.type] && (
                            <button onClick={() => set("nrEwidencyjny", getNextNrEwidencyjny(form.type))} title="Nadaj kolejny numer ewidencyjny" style={{
                              padding: "8px 12px", borderRadius: 8, border: `1px solid ${DS.accentUmowyMain}`,
                              background: DS.accentUmowyLighter, cursor: "pointer", ...S.row, gap: 4,
                              fontFamily: DS.fontFamily, ...typo.labelSmall, color: DS.accentUmowyDark, fontWeight: 600, whiteSpace: "nowrap",
                            }}>
                              <Icon name="zap" size={12} color={DS.accentUmowyMain} />
                              Nadaj
                            </button>
                          )}
                        </div>
                      </Field>
                    </div>
                    <Field label="Kontrahent">
                      <Select value={form.contractor} onChange={v => set("contractor", v)} placeholder="Wybierz kontrahenta..."
                        options={CONTRACTORS.map(c => ({ value: c, label: c }))} />
                    </Field>

                    {/* dates — type-specific */}
                    {(form.type === "umowa" || form.type === "aneks") && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                        <Field label="Data zawarcia">
                          <Input type="date" value={form.dateCreated} onChange={v => set("dateCreated", v)} />
                        </Field>
                        <Field label="Obowiązuje od">
                          <Input type="date" value={form.dateStart} onChange={v => set("dateStart", v)} />
                        </Field>
                        <Field label="Obowiązuje do">
                          <Input type="date" value={form.dateEnd} onChange={v => set("dateEnd", v)} />
                        </Field>
                      </div>
                    )}
                    {form.type === "faktura" && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <Field label="Data wystawienia">
                          <Input type="date" value={form.dateCreated} onChange={v => set("dateCreated", v)} />
                        </Field>
                        <Field label="Termin płatności">
                          <Input type="date" value={form.paymentDue || ""} onChange={v => set("paymentDue", v)} />
                        </Field>
                      </div>
                    )}
                    {form.type === "zlecenie" && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <Field label="Data zlecenia">
                          <Input type="date" value={form.dateCreated} onChange={v => set("dateCreated", v)} />
                        </Field>
                        <Field label="Termin wykonania">
                          <Input type="date" value={form.executionDeadline || ""} onChange={v => set("executionDeadline", v)} />
                        </Field>
                      </div>
                    )}
                    {form.type === "aneks" && (
                      <Field label="Opis zmian">
                        <textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} placeholder="Jakie zmiany wprowadza aneks..."
                          rows={2} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${DS.borderLight}`, borderRadius: 8, fontSize: 13, fontFamily: DS.fontFamily, color: DS.textPrimary, resize: "vertical", outline: "none" }} />
                      </Field>
                    )}
                  </Section>
                </>
              )}

            </div>
          )}

          {/* ────────── STEP 2: Klasyfikacja budżetowa ────────── */}
          {step === 2 && !isSimple(form.type) && (() => {
            /* AI suggestion heuristic */
            const t = ((form.title || "") + " " + (form.contractor || "")).toLowerCase();
            const suggestions = CLASSIFICATIONS.map(c => {
              let score = 0;
              const cl = c.label.toLowerCase();
              const words = t.split(/\s+/).filter(w => w.length > 3);
              words.forEach(w => { if (cl.includes(w)) score += 30; });
              if (t.includes("drog") || t.includes("remont")) { if (c.code.startsWith("600")) score += 40; }
              if (t.includes("it") || t.includes("usług") || t.includes("obsług") || t.includes("prawn")) { if (c.code.includes("4300") || c.code.startsWith("750")) score += 40; }
              if (t.includes("szkoł") || t.includes("eduk")) { if (c.code.startsWith("801")) score += 40; }
              if (t.includes("odpad") || t.includes("oczyszcz")) { if (c.code.startsWith("900")) score += 40; }
              if (t.includes("kultur")) { if (c.code.startsWith("921")) score += 40; }
              return { ...c, score: Math.min(score, 99) };
            }).filter(c => c.score > 0).sort((a, b) => b.score - a.score).slice(0, 2);
            const hasSuggestions = suggestions.length > 0 && t.length > 4;

            return (
            <div>
              {/* AI suggestions banner */}
              {hasSuggestions && (
                <div style={{ padding: "16px", borderRadius: 12, background: `linear-gradient(135deg, ${DS.accentUmowyLighter}, ${DS.secondaryLighter})`, border: `1px solid ${DS.accentUmowyLight}`, marginBottom: 16 }}>
                  <div style={{ ...S.row, gap: 8, marginBottom: 12 }}>
                    <Icon name="sparkles" size={16} color={DS.accentUmowyMain} />
                    <span style={{ ...typo.bodySmall, fontWeight: 600, color: DS.accentUmowyDark }}>Na podstawie danych dokumentu — prawdopodobnie pasują:</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {suggestions.map(sg => {
                      const pct = Math.round((sg.used / sg.budget) * 100);
                      const free = sg.budget - sg.used;
                      return (
                        <div key={sg.code} onClick={() => set("classification", sg.code)} style={{
                          padding: "12px 14px", borderRadius: 10, cursor: "pointer", transition: "all 0.15s",
                          border: `1.5px solid ${form.classification === sg.code ? DS.accentUmowyMain : DS.borderLight}`,
                          background: form.classification === sg.code ? DS.accentUmowyLighter : DS.neutralWhite,
                        }}>
                          <div style={{ ...S.rowBetween }}>
                            <div>
                              <span style={{ ...typo.bodySmall, fontWeight: 700, color: DS.textPrimary }}>{sg.code}</span>
                              <span style={{ ...typo.bodySmall, color: DS.textSecondary, marginLeft: 8 }}>{sg.label}</span>
                            </div>
                            <span style={{
                              ...typo.labelSmall, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
                              background: sg.score >= 80 ? DS.successLighter : DS.warningLighter,
                              color: sg.score >= 80 ? DS.successDark : DS.warningDark,
                            }}>{sg.score}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ ...typo.labelSmall, color: DS.textDisabled, marginTop: 8 }}>Możesz też wybrać inną klasyfikację poniżej:</div>
                </div>
              )}

              {/* Classification cards — all options */}
              <div style={{ ...typo.labelSmall, fontWeight: 600, color: DS.textSecondary, marginBottom: 10 }}>Klasyfikacja budżetowa:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {CLASSIFICATIONS.map(c => {
                  const isSelected = form.classification === c.code;
                  const pct = Math.round((c.used / c.budget) * 100);
                  const free = c.budget - c.used;
                  const barColor = pct >= 85 ? DS.errorMain : pct >= 60 ? DS.warningMain : DS.accentUmowyMain;
                  return (
                    <div key={c.code} onClick={() => set("classification", c.code)} style={{
                      padding: "14px 16px", borderRadius: 12, cursor: "pointer", transition: "all 0.15s",
                      border: `2px solid ${isSelected ? DS.accentUmowyMain : DS.borderLight}`,
                      background: isSelected ? DS.accentUmowyLighter : DS.neutralWhite,
                    }}>
                      <div style={{ ...S.rowBetween, marginBottom: 6 }}>
                        <div>
                          <span style={{ ...typo.bodySmall, fontWeight: 700, color: DS.textPrimary }}>{c.code}</span>
                          {isSelected && <Icon name="check" size={14} color={DS.accentUmowyMain} style={{ marginLeft: 8 }} />}
                        </div>
                      </div>
                      <div style={{ ...typo.bodySmall, color: DS.textSecondary, marginBottom: 8 }}>{c.label}</div>
                      {/* budget bar */}
                      <div style={{ height: 6, borderRadius: 3, background: DS.borderLight, overflow: "hidden", marginBottom: 6 }}>
                        <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, borderRadius: 3, background: barColor, transition: "width 0.4s ease" }} />
                      </div>
                      <div style={{ ...S.rowBetween }}>
                        <span style={{ ...typo.labelSmall, color: DS.textDisabled }}>{pct}% zaangażowane</span>
                        <span style={{ ...typo.labelSmall, fontWeight: 600, color: free > 0 ? DS.successDark : DS.errorDark }}>
                          {formatCurrency(free)} wolne
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* budget impact after selection */}
              {budgetPct !== null && form.grossValue > 0 && (
                <div style={{ padding: "12px 14px", borderRadius: 10, marginTop: 12, background: budgetColor === DS.errorMain ? "#FEF2F2" : budgetColor === DS.warningMain ? "#FFFBEB" : DS.successLighter, border: `1px solid ${budgetColor}33` }}>
                  <div style={{ ...S.rowBetween, marginBottom: 4 }}>
                    <span style={{ ...typo.bodySmall, color: DS.textPrimary }}>Po dodaniu dokumentu ({formatCurrency(form.grossValue)})</span>
                    <span style={{ ...typo.bodySmall, fontWeight: 700, color: budgetColor }}>{budgetPct}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: DS.borderLight, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(budgetPct, 100)}%`, borderRadius: 3, background: budgetColor, transition: "width 0.4s ease" }} />
                  </div>
                  <div style={{ ...typo.labelSmall, color: DS.textDisabled, marginTop: 4 }}>
                    {formatCurrency(selectedClassification.used + form.grossValue)} z {formatCurrency(selectedClassification.budget)}
                  </div>
                </div>
              )}

              {/* ── Zadanie budżetowe — disabled, connects to zaangażowanie module ── */}
              {form.classification && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ ...typo.labelSmall, fontWeight: 600, color: DS.textSecondary, marginBottom: 8 }}>Zadanie budżetowe:</div>
                  <div style={{ position: "relative" }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10,
                      border: `1px solid ${DS.borderLight}`, background: DS.disabledLighter, opacity: 0.7, cursor: "not-allowed",
                    }}>
                      <Icon name="search" size={16} color={DS.textDisabled} />
                      <span style={{ ...typo.bodySmall, color: DS.textDisabled }}>Wyszukaj zadanie budżetowe...</span>
                    </div>
                    <div style={{ ...S.row, gap: 6, marginTop: 8, padding: "8px 12px", borderRadius: 8, background: DS.infoLighter, border: `1px solid ${DS.infoLight}` }}>
                      <Icon name="info" size={14} color={DS.infoMain} />
                      <span style={{ ...typo.labelSmall, color: DS.infoDark }}>
                        Powiązanie z zadaniem budżetowym będzie dostępne w module Zaangażowania
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            );
          })()}

          {/* ────────── STEP 3: Formalności ────────── */}
          {step === 3 && !isSimple(form.type) && (
            <div>
              <Section title="Organizacja">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Wydział">
                    <Select value={form.dept} onChange={v => set("dept", v)}
                      options={DEPARTMENTS.map(d => ({ value: d, label: d }))} />
                  </Field>
                  <Field label="Osoba odpowiedzialna">
                    <Select value={String(form.assignee)} onChange={v => set("assignee", Number(v))}
                      options={USERS_LIST.map(u => ({ value: String(u.id), label: u.name }))} />
                  </Field>
                </div>
              </Section>

              {/* ── Zamówienia publiczne toggle + PZP list ── */}
              {(form.type === "umowa" || form.type === "zlecenie") && (
                <Section title="Zamówienia publiczne i dofinansowanie">
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 12, borderRadius: 10,
                    border: `2px solid ${form.zamowieniePubliczne ? DS.accentUmowyMain : DS.borderLight}`,
                    background: form.zamowieniePubliczne ? DS.accentUmowyLighter : DS.neutralWhite, cursor: "pointer",
                    borderBottomLeftRadius: form.zamowieniePubliczne ? 0 : 10, borderBottomRightRadius: form.zamowieniePubliczne ? 0 : 10,
                  }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, marginTop: 2, flexShrink: 0,
                      border: `2px solid ${form.zamowieniePubliczne ? DS.accentUmowyMain : DS.borderLight}`,
                      background: form.zamowieniePubliczne ? DS.accentUmowyMain : "#fff",
                      ...S.row, justifyContent: "center",
                    }}>
                      {form.zamowieniePubliczne && <Icon name="check" size={10} color="#fff" />}
                    </div>
                    <input type="checkbox" checked={form.zamowieniePubliczne} onChange={e => { set("zamowieniePubliczne", e.target.checked); if (!e.target.checked) { set("tryb_pzp", ""); set("nr_postepowania", ""); }}} style={{ display: "none" }} />
                    <div>
                      <div style={{ ...typo.bodySmall, fontWeight: 600, color: DS.textPrimary }}>Zamówienie publiczne</div>
                      <div style={{ ...typo.labelSmall, color: DS.textSecondary, marginTop: 2 }}>Umowa w trybie ustawy Prawo Zamówień Publicznych</div>
                    </div>
                  </label>
                  {form.zamowieniePubliczne && (
                    <div style={{ border: `2px solid ${DS.accentUmowyMain}`, borderTop: "none", borderRadius: "0 0 10px 10px", padding: 14, background: DS.neutralLighter, display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ ...typo.labelSmall, fontWeight: 600, color: DS.textSecondary, marginBottom: 2 }}>Tryb zamówienia</div>
                      {TRYBY_PZP.map(t => (
                        <button key={t.id} onClick={() => set("tryb_pzp", t.id)} style={{
                          textAlign: "left", padding: "9px 12px", borderRadius: 8, width: "100%", fontFamily: DS.fontFamily,
                          border: `1.5px solid ${form.tryb_pzp === t.id ? DS.accentUmowyMain : DS.borderLight}`,
                          background: form.tryb_pzp === t.id ? DS.accentUmowyLighter : DS.neutralWhite, cursor: "pointer", transition: "all 0.15s",
                        }}>
                          <div style={{ ...S.rowBetween }}>
                            <span style={{ ...typo.bodySmall, fontWeight: 600, color: form.tryb_pzp === t.id ? DS.accentUmowyDark : DS.textPrimary }}>{t.label}</span>
                            <span style={{ ...typo.labelSmall, fontSize: 9, padding: "2px 7px", borderRadius: 999,
                              background: t.threshold.includes("poniżej") ? DS.successLighter : t.threshold.includes("wymaga") ? DS.warningLighter : DS.accentUmowyLighter,
                              color: t.threshold.includes("poniżej") ? DS.successDark : t.threshold.includes("wymaga") ? DS.warningDark : DS.accentUmowyDark,
                              fontWeight: 600,
                            }}>{t.threshold}</span>
                          </div>
                          <div style={{ ...typo.labelSmall, color: DS.textDisabled, marginTop: 2 }}>{t.desc}</div>
                        </button>
                      ))}
                      <Field label="Numer postępowania">
                        <Input value={form.nr_postepowania || ""} onChange={v => set("nr_postepowania", v)} placeholder="ZP.271.X.2025" />
                      </Field>
                    </div>
                  )}

                  <div style={{ marginTop: 10 }}>
                    <label style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 12, borderRadius: 10,
                      border: `2px solid ${form.dofinansowanie ? DS.accentUmowyMain : DS.borderLight}`,
                      background: form.dofinansowanie ? DS.accentUmowyLighter : DS.neutralWhite, cursor: "pointer",
                    }}>
                      <div style={{ width: 16, height: 16, borderRadius: 4, marginTop: 2, flexShrink: 0,
                        border: `2px solid ${form.dofinansowanie ? DS.accentUmowyMain : DS.borderLight}`,
                        background: form.dofinansowanie ? DS.accentUmowyMain : "#fff",
                        ...S.row, justifyContent: "center",
                      }}>
                        {form.dofinansowanie && <Icon name="check" size={10} color="#fff" />}
                      </div>
                      <input type="checkbox" checked={form.dofinansowanie} onChange={e => set("dofinansowanie", e.target.checked)} style={{ display: "none" }} />
                      <div>
                        <div style={{ ...typo.bodySmall, fontWeight: 600, color: DS.textPrimary }}>Umowa z dofinansowaniem</div>
                        <div style={{ ...typo.labelSmall, color: DS.textSecondary, marginTop: 2 }}>Dofinansowanie UE, dotacja, grant lub inne źródło</div>
                      </div>
                    </label>
                    {form.dofinansowanie && (
                      <div style={{ padding: "10px 14px", marginTop: -2, borderRadius: "0 0 10px 10px", border: `2px solid ${DS.accentUmowyMain}`, borderTop: "none", background: DS.neutralLighter }}>
                        <Field label="Źródło dofinansowania">
                          <Input value={form.zrodloDofinansowania || ""} onChange={v => set("zrodloDofinansowania", v)} placeholder="np. Program Regionalny, PROW, dotacja celowa..." />
                        </Field>
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* ── Status realizacji: podpisy, kontrasyganta ── */}
              <Section title="Status realizacji">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8,
                    border: `1px solid ${form.podpisStonn ? DS.successMain : DS.borderLight}`,
                    background: form.podpisStonn ? DS.successLighter : DS.neutralWhite, cursor: "pointer",
                  }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                      border: `2px solid ${form.podpisStonn ? DS.successMain : DS.borderLight}`,
                      background: form.podpisStonn ? DS.successMain : "#fff", ...S.row, justifyContent: "center",
                    }}>
                      {form.podpisStonn && <Icon name="check" size={10} color="#fff" />}
                    </div>
                    <input type="checkbox" checked={form.podpisStonn} onChange={e => set("podpisStonn", e.target.checked)} style={{ display: "none" }} />
                    <div style={{ ...typo.bodySmall, color: DS.textPrimary }}>Podpisana przez strony</div>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8,
                    border: `1px solid ${form.kontrasygnatSkarbnika ? DS.successMain : DS.borderLight}`,
                    background: form.kontrasygnatSkarbnika ? DS.successLighter : DS.neutralWhite, cursor: "pointer",
                  }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                      border: `2px solid ${form.kontrasygnatSkarbnika ? DS.successMain : DS.borderLight}`,
                      background: form.kontrasygnatSkarbnika ? DS.successMain : "#fff", ...S.row, justifyContent: "center",
                    }}>
                      {form.kontrasygnatSkarbnika && <Icon name="check" size={10} color="#fff" />}
                    </div>
                    <input type="checkbox" checked={form.kontrasygnatSkarbnika} onChange={e => set("kontrasygnatSkarbnika", e.target.checked)} style={{ display: "none" }} />
                    <div>
                      <div style={{ ...typo.bodySmall, color: DS.textPrimary }}>Kontrasygnata skarbnika</div>
                      <div style={{ ...typo.labelSmall, color: DS.textDisabled }}>Art. 262 ust. 3 ustawy o finansach publicznych</div>
                    </div>
                  </label>
                </div>
              </Section>

              {/* ── Harmonogram płatności ── */}
              {(form.type === "umowa" || form.type === "faktura") && (
                <Section title="Harmonogram płatności">
                  {form.harmonogram.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                      {form.harmonogram.map((row, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr auto", gap: 8, alignItems: "center" }}>
                          <Input type="date" value={row.date} onChange={v => updateScheduleRow(i, "date", v)} />
                          <Input type="number" value={row.amount || ""} onChange={v => updateScheduleRow(i, "amount", Number(v) || 0)} placeholder="Kwota" />
                          <Input value={row.label} onChange={v => updateScheduleRow(i, "label", v)} placeholder="Opis (opcjonalny)" />
                          <button onClick={() => removeScheduleRow(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                            <Icon name="x" size={14} color={DS.textDisabled} />
                          </button>
                        </div>
                      ))}
                      <div style={{ ...typo.labelSmall, color: DS.textDisabled, textAlign: "right" }}>
                        Suma: {formatCurrency(form.harmonogram.reduce((s, r) => s + (r.amount || 0), 0))}
                      </div>
                    </div>
                  )}
                  <Btn variant="ghost" icon="plus" onClick={addScheduleRow} small>Dodaj pozycję</Btn>
                </Section>
              )}

              {/* ── Tags ── */}
              <Section title="Tagi i notatki">
                <Field label="Tagi">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {TAGS.map(tag => {
                      const isActive = form.tags.includes(tag.id);
                      return (
                        <button key={tag.id} onClick={() => set("tags", isActive ? form.tags.filter(t => t !== tag.id) : [...form.tags, tag.id])}
                          style={{
                            padding: "5px 12px", ...S.pill, border: `1px solid ${isActive ? tag.color : DS.borderLight}`,
                            background: isActive ? tag.color + "18" : DS.neutralWhite, color: isActive ? tag.color : DS.textSecondary,
                            cursor: "pointer", ...typo.labelMedium, fontFamily: DS.fontFamily, transition: "all 0.15s",
                          }}>{tag.label}</button>
                      );
                    })}
                  </div>
                </Field>
                <Field label="Notatki">
                  <textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} placeholder="Dodatkowe informacje..."
                    rows={2} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${DS.borderLight}`, borderRadius: 8, fontSize: 13, fontFamily: DS.fontFamily, color: DS.textPrimary, resize: "vertical", outline: "none" }} />
                </Field>
              </Section>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: "12px 20px", borderTop: `1px solid ${DS.borderLight}`,
          display: "flex", justifyContent: "space-between", alignItems: "center", background: DS.neutralLighter,
        }}>
          <div>
            {step > (isEdit ? 1 : 0) && (
              <Btn variant="ghost" icon="chevronLeft" onClick={() => setStep(s => s - 1)} small>Wstecz</Btn>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="ghost" onClick={onClose} small>Anuluj</Btn>
            {step < maxStep ? (
              <Btn variant="accent" icon="chevronRight" onClick={() => setStep(s => s + 1)} small
                style={{ opacity: canNext() ? 1 : 0.5, pointerEvents: canNext() ? "auto" : "none" }}>Dalej</Btn>
            ) : (
              <Btn variant="accent" icon="check" onClick={() => onSave(form)} small>{isEdit ? "Zapisz zmiany" : "Dodaj dokument"}</Btn>
            )}
          </div>
        </div>
      </div>
      </div>
  );
};
