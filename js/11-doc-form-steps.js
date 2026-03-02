/* ═══════════════════════════════════════════════════════════════
   DOC FORM — Step 0 (type selection) + Step 1 (basic data)
   ═══════════════════════════════════════════════════════════════ */

/* ── Step 0: wybór typu dokumentu ── */
const DocFormStepType = ({ form, set }) => (
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
);

/* ── Step 1: dane podstawowe + plik ── */
const DocFormStepBasic = ({ form, set, docs, ocrStep, setOcrStep }) => {
  const [ocrFile, setOcrFile] = useState(null);
  const curMeta = DOC_TYPE_META[form.type] || {};
  const isSimple = (type) => DOC_TYPE_META[type]?.simpleForm;
  const linkableDocs = (docs || []).filter(d => {
    const allowed = LINK_TYPES[form.type];
    return allowed && allowed.includes(d.type);
  });

  const ocrResults = form.type === "faktura" ? {
    title: "Faktura za materiały biurowe", contractor: "BiuroPlus Sp. z o.o.",
    number: "FV/2025/OCR-001", grossValue: 4243.50,
    dateCreated: "2025-02-10", confidence: 87,
  } : {
    title: "Umowa na dostawę sprzętu IT", contractor: "TechSolutions Sp. z o.o.",
    number: "UM/2025/OCR-042", grossValue: 58900,
    dateStart: "2025-03-01", dateEnd: "2025-12-31", confidence: 82,
  };

  const handleOcrAccept = () => {
    Object.entries(ocrResults).forEach(([k,v]) => { if (k !== "confidence") set(k, v); });
    setOcrStep(null);
  };

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
  );
};
