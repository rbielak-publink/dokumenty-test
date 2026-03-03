/* ═══════════════════════════════════════════════════════════════
   DOC FORM — Step 2 (Zaangażowanie) + Step 3 (Pozostałe)
   ═══════════════════════════════════════════════════════════════ */
const DocFormStepClassification = ({ form, set }) => {
  const [taskSearch, setTaskSearch] = useState("");

  /* AI suggestion heuristic */
  const t = ((form.title || "") + " " + (form.contractor || "")).toLowerCase();
  const suggestedCodes = useMemo(() => {
    return CLASSIFICATIONS.map(c => {
      let score = 0;
      const cl = c.label.toLowerCase();
      const words = t.split(/\s+/).filter(w => w.length > 3);
      words.forEach(w => { if (cl.includes(w)) score += 30; });
      if (t.includes("drog") || t.includes("remont")) { if (c.code.startsWith("600")) score += 40; }
      if (t.includes("it") || t.includes("usług") || t.includes("obsług") || t.includes("prawn")) { if (c.code.includes("4300") || c.code.startsWith("750")) score += 40; }
      if (t.includes("szkoł") || t.includes("eduk")) { if (c.code.startsWith("801")) score += 40; }
      if (t.includes("odpad") || t.includes("oczyszcz")) { if (c.code.startsWith("900")) score += 40; }
      if (t.includes("kultur")) { if (c.code.startsWith("921")) score += 40; }
      return { code: c.code, score: Math.min(score, 99) };
    }).filter(s => s.score > 0 && t.length > 4).reduce((m, s) => { m[s.code] = s.score; return m; }, {});
  }, [t]);

  const selectedClassification = CLASSIFICATIONS.find(c => c.code === form.classification);
  const budgetPct = selectedClassification ? Math.round(((selectedClassification.used + form.grossValue) / selectedClassification.budget) * 100) : null;
  const budgetColor = budgetPct === null ? DS.textDisabled : budgetPct >= 85 ? DS.errorMain : budgetPct >= 60 ? DS.warningMain : DS.successMain;

  /* tasks for selected classification */
  const allTasks = form.classification ? (BUDGET_TASKS[form.classification] || []) : [];
  const filteredTasks = taskSearch
    ? allTasks.filter(t => t.name.toLowerCase().includes(taskSearch.toLowerCase()) || t.id.toLowerCase().includes(taskSearch.toLowerCase()))
    : allTasks;

  return (
    <div>
      {/* ── Two-column layout: Classification | Budget Tasks ── */}
      <div style={{ display: "grid", gridTemplateColumns: form.classification ? "1fr 1fr" : "1fr", gap: 16 }}>

        {/* ── LEFT: Classification selector ── */}
        <div>
          <div style={{ ...typo.labelSmall, fontWeight: 600, color: DS.textSecondary, marginBottom: 8 }}>Klasyfikacja budżetowa</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {CLASSIFICATIONS.map(c => {
              const isSelected = form.classification === c.code;
              const pct = Math.round((c.used / c.budget) * 100);
              const free = c.budget - c.used;
              const barColor = pct >= 85 ? DS.errorMain : pct >= 60 ? DS.warningMain : DS.primaryLight;
              const aiScore = suggestedCodes[c.code];
              return (
                <div key={c.code} onClick={() => { set("classification", c.code); set("budgetTask", ""); setTaskSearch(""); }} style={{
                  padding: "8px 10px", borderRadius: 8, cursor: "pointer", transition: "all 0.12s",
                  border: `1.5px solid ${isSelected ? DS.primaryLight : "transparent"}`,
                  background: isSelected ? DS.primaryLighter : "transparent",
                }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = DS.neutralLighter; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ ...S.row, gap: 8, marginBottom: 3 }}>
                    <span style={{ ...typo.labelSmall, fontWeight: 700, color: DS.textPrimary, fontFamily: "monospace", flexShrink: 0 }}>{c.code}</span>
                    {aiScore && <span style={{
                      ...typo.labelSmall, fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 999, flexShrink: 0,
                      background: aiScore >= 80 ? DS.successLighter : DS.warningLighter,
                      color: aiScore >= 80 ? DS.successDark : DS.warningDark,
                    }}><Icon name="sparkles" size={8} color={aiScore >= 80 ? DS.successDark : DS.warningDark} /> {aiScore}%</span>}
                    {isSelected && <Icon name="check" size={12} color={DS.primaryLight} />}
                  </div>
                  <div style={{ ...typo.labelSmall, color: DS.textSecondary, marginBottom: 4, lineHeight: "1.3" }}>{c.label}</div>
                  <div style={{ ...S.row, gap: 6, alignItems: "center" }}>
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: DS.borderLight, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, borderRadius: 2, background: barColor }} />
                    </div>
                    <span style={{ ...typo.labelSmall, fontSize: 9, color: DS.textDisabled, flexShrink: 0, whiteSpace: "nowrap" }}>{formatCurrency(free)} wolne</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: Budget tasks panel (visible after classification selected) ── */}
        {form.classification && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* Selected classification summary */}
            {selectedClassification && (
              <div style={{ padding: "8px 10px", borderRadius: 8, background: DS.neutralLighter, marginBottom: 10, border: `1px solid ${DS.borderLight}` }}>
                <div style={{ ...S.rowBetween, marginBottom: 4 }}>
                  <span style={{ ...typo.labelSmall, fontWeight: 600, color: DS.textPrimary }}>{selectedClassification.code}</span>
                  {budgetPct !== null && form.grossValue > 0 && (
                    <span style={{ ...typo.labelSmall, fontWeight: 700, color: budgetColor }}>{budgetPct}% po dodaniu</span>
                  )}
                </div>
                <div style={{ height: 4, borderRadius: 2, background: DS.borderLight, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(budgetPct || 0, 100)}%`, borderRadius: 2, background: budgetColor }} />
                </div>
                {budgetPct !== null && form.grossValue > 0 && (
                  <div style={{ ...typo.labelSmall, fontSize: 9, color: DS.textDisabled, marginTop: 3 }}>
                    {formatCurrency(selectedClassification.used + form.grossValue)} z {formatCurrency(selectedClassification.budget)}
                  </div>
                )}
              </div>
            )}

            {/* Task header + search */}
            <div style={{ ...S.rowBetween, marginBottom: 6 }}>
              <span style={{ ...typo.labelSmall, fontWeight: 600, color: DS.textSecondary }}>Zadanie budżetowe</span>
              <span style={{ ...typo.labelSmall, color: DS.textDisabled }}>{allTasks.length} zadań</span>
            </div>

            {allTasks.length > 0 && (
              <div style={{ position: "relative", marginBottom: 8 }}>
                <Icon name="search" size={13} color={DS.textDisabled} style={{ position: "absolute", left: 8, top: 7 }} />
                <input
                  value={taskSearch} onChange={e => setTaskSearch(e.target.value)}
                  placeholder="Szukaj zadania..."
                  style={{
                    width: "100%", padding: "6px 8px 6px 28px", border: `1px solid ${DS.borderLight}`, borderRadius: 6,
                    fontSize: 12, fontFamily: DS.fontFamily, color: DS.textPrimary, background: DS.neutralWhite,
                    outline: "none", boxSizing: "border-box",
                  }}
                  onFocus={e => e.target.style.borderColor = DS.primaryLight}
                  onBlur={e => e.target.style.borderColor = DS.borderLight}
                />
              </div>
            )}

            {/* Task list */}
            <div style={{ flex: 1, overflowY: "auto", maxHeight: 220, display: "flex", flexDirection: "column", gap: 3 }}>
              {filteredTasks.map(task => {
                const isSelected = form.budgetTask === task.id;
                const engPct = Math.round((task.engaged / task.planned) * 100);
                const free = task.planned - task.engaged;
                const bColor = engPct >= 85 ? DS.errorMain : engPct >= 60 ? DS.warningMain : DS.successMain;
                return (
                  <div key={task.id} onClick={() => set("budgetTask", isSelected ? "" : task.id)} style={{
                    padding: "7px 10px", borderRadius: 6, cursor: "pointer", transition: "all 0.12s",
                    border: `1.5px solid ${isSelected ? DS.primaryLight : "transparent"}`,
                    background: isSelected ? DS.primaryLighter : "transparent",
                  }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = DS.neutralLighter; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isSelected ? DS.primaryLighter : "transparent"; }}
                  >
                    <div style={{ ...S.row, gap: 6, marginBottom: 2 }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: 4, flexShrink: 0, ...S.row, justifyContent: "center",
                        border: `1.5px solid ${isSelected ? DS.primaryLight : DS.borderMedium}`,
                        background: isSelected ? DS.primaryLight : DS.neutralWhite,
                      }}>
                        {isSelected && <Icon name="check" size={9} color="#fff" />}
                      </div>
                      <span style={{ ...typo.labelSmall, fontWeight: 600, color: DS.textPrimary, flex: 1, minWidth: 0, ...S.truncate }}>{task.name}</span>
                    </div>
                    <div style={{ ...S.row, gap: 6, alignItems: "center", paddingLeft: 22 }}>
                      <div style={{ flex: 1, height: 3, borderRadius: 2, background: DS.borderLight, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(engPct, 100)}%`, borderRadius: 2, background: bColor }} />
                      </div>
                      <span style={{ ...typo.labelSmall, fontSize: 9, color: DS.textDisabled, flexShrink: 0, whiteSpace: "nowrap" }}>{formatCurrency(free)} wolne</span>
                    </div>
                  </div>
                );
              })}
              {filteredTasks.length === 0 && allTasks.length > 0 && (
                <div style={{ ...typo.labelSmall, color: DS.textDisabled, padding: "12px 0", textAlign: "center" }}>Brak wyników dla „{taskSearch}"</div>
              )}
              {allTasks.length === 0 && (
                <div style={{ ...typo.labelSmall, color: DS.textDisabled, padding: "12px 0", textAlign: "center" }}>Brak zadań dla tej klasyfikacji</div>
              )}
            </div>

            {/* Add task button */}
            <button onClick={() => {/* placeholder — would open add-task form */}} style={{
              ...S.row, gap: 6, justifyContent: "center", padding: "7px 0", marginTop: 6, borderRadius: 6,
              border: `1px dashed ${DS.borderMedium}`, background: "transparent", cursor: "pointer",
              fontFamily: DS.fontFamily, transition: "all 0.12s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = DS.neutralLighter; e.currentTarget.style.borderColor = DS.primaryLight; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = DS.borderMedium; }}
            >
              <Icon name="plus" size={12} color={DS.primaryLight} />
              <span style={{ ...typo.labelSmall, fontWeight: 600, color: DS.primaryDark }}>Dodaj zadanie</span>
            </button>
          </div>
        )}
      </div>
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
