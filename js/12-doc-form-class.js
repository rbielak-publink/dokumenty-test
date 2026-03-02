/* ═══════════════════════════════════════════════════════════════
   DOC FORM — Step 2 (Klasyfikacja) + Step 3 (Formalności)
   ═══════════════════════════════════════════════════════════════ */
const DocFormStepClassification = ({ form, set }) => {
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

  const selectedClassification = CLASSIFICATIONS.find(c => c.code === form.classification);
  const budgetPct = selectedClassification ? Math.round(((selectedClassification.used + form.grossValue) / selectedClassification.budget) * 100) : null;
  const budgetColor = budgetPct === null ? DS.textDisabled : budgetPct >= 85 ? DS.errorMain : budgetPct >= 60 ? DS.warningMain : DS.successMain;

  return (
    <div>
      {/* AI suggestions banner */}
      {hasSuggestions && (
        <div style={{ padding: "16px", borderRadius: 12, background: `linear-gradient(135deg, ${DS.primaryLighter}, ${DS.secondaryLighter})`, border: `1px solid ${DS.primaryLight}`, marginBottom: 16 }}>
          <div style={{ ...S.row, gap: 8, marginBottom: 12 }}>
            <Icon name="sparkles" size={16} color={DS.primaryLight} />
            <span style={{ ...typo.bodySmall, fontWeight: 600, color: DS.primaryDark }}>Na podstawie danych dokumentu — prawdopodobnie pasują:</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {suggestions.map(sg => {
              const pct = Math.round((sg.used / sg.budget) * 100);
              const free = sg.budget - sg.used;
              return (
                <div key={sg.code} onClick={() => set("classification", sg.code)} style={{
                  padding: "12px 14px", borderRadius: 10, cursor: "pointer", transition: "all 0.15s",
                  border: `1.5px solid ${form.classification === sg.code ? DS.primaryLight : DS.borderLight}`,
                  background: form.classification === sg.code ? DS.primaryLighter : DS.neutralWhite,
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
          const barColor = pct >= 85 ? DS.errorMain : pct >= 60 ? DS.warningMain : DS.primaryLight;
          return (
            <div key={c.code} onClick={() => set("classification", c.code)} style={{
              padding: "14px 16px", borderRadius: 12, cursor: "pointer", transition: "all 0.15s",
              border: `2px solid ${isSelected ? DS.primaryLight : DS.borderLight}`,
              background: isSelected ? DS.primaryLighter : DS.neutralWhite,
            }}>
              <div style={{ ...S.rowBetween, marginBottom: 6 }}>
                <div>
                  <span style={{ ...typo.bodySmall, fontWeight: 700, color: DS.textPrimary }}>{c.code}</span>
                  {isSelected && <Icon name="check" size={14} color={DS.primaryLight} style={{ marginLeft: 8 }} />}
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
};

/* ═══════════════════════════════════════════════════════════════
   DOC FORM — Step 3: Formalności
   ═══════════════════════════════════════════════════════════════ */
const DocFormStepFormalities = ({ form, set }) => {
  const addScheduleRow = () => set("harmonogram", [...form.harmonogram, { date: "", amount: 0, label: "" }]);
  const updateScheduleRow = (i, k, v) => {
    const h = [...form.harmonogram]; h[i] = { ...h[i], [k]: v }; set("harmonogram", h);
  };
  const removeScheduleRow = (i) => set("harmonogram", form.harmonogram.filter((_, idx) => idx !== i));

  return (
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
            border: `2px solid ${form.zamowieniePubliczne ? DS.primaryLight : DS.borderLight}`,
            background: form.zamowieniePubliczne ? DS.primaryLighter : DS.neutralWhite, cursor: "pointer",
            borderBottomLeftRadius: form.zamowieniePubliczne ? 0 : 10, borderBottomRightRadius: form.zamowieniePubliczne ? 0 : 10,
          }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, marginTop: 2, flexShrink: 0,
              border: `2px solid ${form.zamowieniePubliczne ? DS.primaryLight : DS.borderLight}`,
              background: form.zamowieniePubliczne ? DS.primaryLight : "#fff",
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
            <div style={{ border: `2px solid ${DS.primaryLight}`, borderTop: "none", borderRadius: "0 0 10px 10px", padding: 14, background: DS.neutralLighter, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ ...typo.labelSmall, fontWeight: 600, color: DS.textSecondary, marginBottom: 2 }}>Tryb zamówienia</div>
              {TRYBY_PZP.map(t => (
                <button key={t.id} onClick={() => set("tryb_pzp", t.id)} style={{
                  textAlign: "left", padding: "9px 12px", borderRadius: 8, width: "100%", fontFamily: DS.fontFamily,
                  border: `1.5px solid ${form.tryb_pzp === t.id ? DS.primaryLight : DS.borderLight}`,
                  background: form.tryb_pzp === t.id ? DS.primaryLighter : DS.neutralWhite, cursor: "pointer", transition: "all 0.15s",
                }}>
                  <div style={{ ...S.rowBetween }}>
                    <span style={{ ...typo.bodySmall, fontWeight: 600, color: form.tryb_pzp === t.id ? DS.primaryDark : DS.textPrimary }}>{t.label}</span>
                    <span style={{ ...typo.labelSmall, fontSize: 9, padding: "2px 7px", borderRadius: 999,
                      background: t.threshold.includes("poniżej") ? DS.successLighter : t.threshold.includes("wymaga") ? DS.warningLighter : DS.primaryLighter,
                      color: t.threshold.includes("poniżej") ? DS.successDark : t.threshold.includes("wymaga") ? DS.warningDark : DS.primaryDark,
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
              border: `2px solid ${form.dofinansowanie ? DS.primaryLight : DS.borderLight}`,
              background: form.dofinansowanie ? DS.primaryLighter : DS.neutralWhite, cursor: "pointer",
            }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, marginTop: 2, flexShrink: 0,
                border: `2px solid ${form.dofinansowanie ? DS.primaryLight : DS.borderLight}`,
                background: form.dofinansowanie ? DS.primaryLight : "#fff",
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
              <div style={{ padding: "10px 14px", marginTop: -2, borderRadius: "0 0 10px 10px", border: `2px solid ${DS.primaryLight}`, borderTop: "none", background: DS.neutralLighter }}>
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
  );
};
