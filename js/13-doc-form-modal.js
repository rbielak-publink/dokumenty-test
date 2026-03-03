/* ═══════════════════════════════════════════════════════════════
   DOC FORM MODAL — main shell (state, stepper, routing, footer)
   Sub-components: DocFormStepType, DocFormStepBasic (12),
                   DocFormStepClassification, DocFormStepFormalities (13)
   ═══════════════════════════════════════════════════════════════ */
const DocFormModal = ({ onClose, onSave, docs, editDoc }) => {
  const isEdit = !!editDoc;
  const isSimple = (type) => DOC_TYPE_META[type]?.simpleForm;
  const getStepLabels = (type) => isSimple(type) ? ["Typ dokumentu", "Dane dokumentu"] : ["Typ dokumentu", "Dane podstawowe", "Zaangażowanie", "Pozostałe"];
  const [step, setStep] = useState(isEdit ? 1 : 0);
  const [form, setForm] = useState(() => {
    if (editDoc) return { ...editDoc };
    return {
      type: "", status: "w_przygotowaniu", title: "", number: "", nrEwidencyjny: "", rodzajUmowy: "wydatkowa",
      contractor: "", dept: DEPARTMENTS[0], assignee: 1, netValue: 0, grossValue: 0,
      classification: "", budgetTask: "", dateCreated: new Date().toISOString().split("T")[0],
      dateStart: "", dateEnd: "", tags: [], alerts: [], notes: "",
      linkedTo: null, uploadedFile: null,
      zamowieniePubliczne: false, tryb_pzp: "", nr_postepowania: "",
      dofinansowanie: false, zrodloDofinansowania: "",
      podpisStonn: false, kontrasygnatSkarbnika: false,
      harmonogram: [],
    };
  });
  const [ocrStep, setOcrStep] = useState(null);

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

  return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(10,15,42,0.35)", zIndex: 200, animation: "fadeIn 0.15s ease", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 780, maxHeight: "90vh", background: DS.neutralWhite, borderRadius: 16,
        boxShadow: "0 24px 64px rgba(10,15,42,0.18)", zIndex: 201,
        animation: "modalIn 0.2s ease", overflow: "hidden", ...S.col,
      }}>
        {/* ── Header ── */}
        <div style={{
          padding: "16px 20px", ...S.row, gap: 10,
          borderBottom: `1px solid ${DS.borderLight}`,
          background: `linear-gradient(135deg, ${DS.primaryLighter}, ${DS.neutralWhite})`,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, ...S.row, justifyContent: "center",
            background: `linear-gradient(135deg, ${DS.primaryLight}, ${DS.primaryDark})`,
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

        {/* ── Step indicator — circle style ── */}
        <div style={{ display: "flex", alignItems: "center", padding: "12px 20px", background: DS.neutralLighter, gap: 0 }}>
          {stepLabels.map((label, i) => {
            const isDone = i < step;
            const isCurrent = i === step;
            const circleSize = 28;
            return (
              <React.Fragment key={i}>
                {i > 0 && <div style={{ flex: 1, height: 2, background: isDone || isCurrent ? DS.primaryLight : DS.borderLight, transition: "background 0.3s" }} />}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  <div style={{
                    width: circleSize, height: circleSize, borderRadius: "50%",
                    background: isDone ? DS.successMain : isCurrent ? DS.primaryLight : DS.neutralWhite,
                    border: `2px solid ${isDone ? DS.successMain : isCurrent ? DS.primaryLight : DS.borderLight}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.3s",
                  }}>
                    {isDone ? <Icon name="check" size={14} color="#fff" /> :
                      <span style={{ ...typo.labelSmall, fontWeight: 700, color: isCurrent ? "#fff" : DS.textDisabled }}>{i + 1}</span>}
                  </div>
                  <span style={{
                    ...typo.labelSmall, fontSize: 11, color: isDone ? DS.successDark : isCurrent ? DS.primaryDark : DS.textDisabled,
                    maxWidth: 100, textAlign: "center", lineHeight: "1.2",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>{label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* ── Content — route to step sub-components ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {step === 0 && !ocrStep && <DocFormStepType form={form} set={set} />}
          {step === 1 && <DocFormStepBasic form={form} set={set} docs={docs} ocrStep={ocrStep} setOcrStep={setOcrStep} />}
          {step === 2 && !isSimple(form.type) && <DocFormStepClassification form={form} set={set} />}
          {step === 3 && !isSimple(form.type) && <DocFormStepFormalities form={form} set={set} />}
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
