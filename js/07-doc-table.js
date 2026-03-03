/* ═══════════════════════════════════════════════════════════════
   DOC TABLE — zebra striping, alerts inline, tags +N (merge P1+P2)
   ═══════════════════════════════════════════════════════════════ */
const Checkbox = ({ checked, onChange, indeterminate }) => {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = indeterminate; }, [indeterminate]);
  return (
    <input ref={ref} type="checkbox" checked={checked} onChange={onChange} style={{
      width: 16, height: 16, cursor: "pointer", accentColor: DS.primaryLight,
    }} />
  );
};

const DocTable = ({ docs, onSelectDoc, onInlineAdd, selectedId, sortConfig, onSort, selectedIds, onToggleSelect, onSelectAll, onOpenExport, onOpenFolders, visibleColumns, multiSelectMode, onToggleMultiSelect, onUpdateDoc }) => {
  const [titleColWidth, setTitleColWidth] = useState(null);
  const titleDragRef = useRef(null);
  const handleTitleResize = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    const startX = e.clientX;
    const startW = titleDragRef.current?.parentElement?.offsetWidth || 240;
    const onMove = (ev) => { const diff = ev.clientX - startX; setTitleColWidth(Math.max(180, startW + diff)); };
    const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, []);

  const GROUP_BY_OPTIONS = [
    { id: "dept", label: "Wydziały", icon: "building", extract: d => d.dept || "Bez wydziału" },
    { id: "assignee", label: "Osoby odpowiedzialne", icon: "users", extract: d => { const u = USERS_LIST.find(u => u.id === d.assignee); return u ? u.name : "Nieprzypisane"; } },
    { id: "classification", label: "Klasyfikacja", icon: "barChart", extract: d => d.classification || "Bez klasyfikacji" },
    { id: "contractor", label: "Kontrahent", icon: "building", extract: d => d.contractor || "Bez kontrahenta" },
    { id: "status", label: "Status", icon: "zap", extract: d => { const s = DOC_STATUSES[d.status]; return s ? s.label : d.status || "Brak"; } },
  ];
  const [groupBy, setGroupBy] = useState(null);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const groupByRef = useRef(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [hoveredRow, setHoveredRow] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [newRowId, setNewRowId] = useState(null);

  const toggleExpand = useCallback((docId, e) => {
    e.stopPropagation();
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(docId)) next.delete(docId); else next.add(docId);
      return next;
    });
  }, []);

  const groupedData = useMemo(() => {
    if (!groupBy) return null;
    const opt = GROUP_BY_OPTIONS.find(o => o.id === groupBy);
    if (!opt) return null;
    const groups = {};
    docs.forEach(d => {
      const key = opt.extract(d);
      if (!groups[key]) groups[key] = [];
      groups[key].push(d);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [docs, groupBy]);

  useEffect(() => {
    if (!showGroupMenu) return;
    const handler = (e) => { if (groupByRef.current && !groupByRef.current.contains(e.target)) setShowGroupMenu(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showGroupMenu]);

  const cols = [
    { key: "type", label: "Typ", w: 100 },
    { key: "alerts", label: "Alerty", w: 60 },
    { key: "number", label: "Numer", w: 126 },
    { key: "nrEwidencyjny", label: "Nr ewid.", w: 100 },
    { key: "title", label: "Przedmiot", flex: 1, min: 180 },
    { key: "contractor", label: "Kontrahent", w: 190 },
    { key: "assignee", label: "Odpow.", w: 56 },
    { key: "dept", label: "Wydział", w: 170 },
    { key: "dateEnd", label: "Data końca", w: 92 },
    { key: "grossValue", label: "Wartość", w: 110 },
    { key: "classification", label: "Klasyfik.", w: 96 },
    { key: "tags", label: "Tagi", w: 120 },
    { key: "status", label: "Status", w: 130 },
  ];

  const filteredCols = cols.filter(c => !visibleColumns || visibleColumns.includes(c.key));
  const colMap = {};
  cols.forEach(c => { colMap[c.key] = c; });
  const cellBorder = `1px solid ${DS.borderLightLight || "#EDF0F5"}`;
  const colStyle = (colOrKey) => {
    const col = typeof colOrKey === "string" ? colMap[colOrKey] : colOrKey;
    if (!col) return {};
    const base = { borderRight: cellBorder };
    if (col.flex) {
      if (titleColWidth) return { ...base, width: titleColWidth, minWidth: 180, flex: `0 0 ${titleColWidth}px` };
      return { ...base, flex: "1 1 180px", minWidth: 180 };
    }
    return { ...base, width: col.w, minWidth: col.w, flex: "0 0 auto" };
  };

  const totalGrossValue = useMemo(() => docs.reduce((s, d) => s + (d.grossValue || 0), 0), [docs]);

  const SortIcon = ({ colKey }) => {
    const isActive = sortConfig.key === colKey;
    const isAsc = sortConfig.dir === "asc";
    return (
      <svg width={8} height={12} viewBox="0 0 8 12" style={{ flexShrink: 0, marginLeft: 2 }}>
        <path d="M4 0L7.5 4.5H0.5Z" fill={isActive && isAsc ? DS.primaryLight : DS.neutralMain} opacity={isActive && isAsc ? 1 : 0.3} />
        <path d="M4 12L0.5 7.5H7.5Z" fill={isActive && !isAsc ? DS.primaryLight : DS.neutralMain} opacity={isActive && !isAsc ? 1 : 0.3} />
      </svg>
    );
  };

  const allSelected = docs.length > 0 && docs.every(d => selectedIds.has(d.id));
  const someSelected = docs.some(d => selectedIds.has(d.id)) && !allSelected;

  /* shared props for DocTableRow */
  const rowProps = { selectedId, selectedIds, visibleColumns, multiSelectMode, expandedRows, toggleExpand, hoveredRow, setHoveredRow, setFilePreview, onToggleSelect, onSelectDoc, colStyle, onUpdateDoc, newRowId, clearNewRowId: () => setNewRowId(null) };

  return (
    <div style={{ flex: 1, ...S.col, overflow: "hidden" }}>
      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div style={{
          ...S.row, gap: 12, padding: "8px 20px",
          background: DS.primaryLighter, borderBottom: `1px solid ${DS.primaryLight}`,
          animation: "slideDown 0.15s ease",
        }}>
          <span style={{ ...typo.labelMedium, color: DS.primaryDark }}>
            Zaznaczono: {selectedIds.size}
          </span>
          <Btn variant="secondary" icon="edit" small>Zmień status</Btn>
          <Btn variant="secondary" icon="tag" small>Zmień tagi</Btn>
          <Btn variant="secondary" icon="folder" small onClick={onOpenFolders}>Dodaj do folderu</Btn>
          <Btn variant="secondary" icon="download" small onClick={onOpenExport}>Eksport</Btn>
          <div style={{ flex: 1 }} />
          <Btn variant="ghost" icon="x" small onClick={() => onSelectAll(false)}>Odznacz</Btn>
        </div>
      )}

      {/* View bar with Grupuj dropdown */}
      <div style={{
        ...S.row, gap: 6, padding: "6px 20px",
        borderBottom: `1px solid ${DS.borderLightLight}`, background: DS.neutralWhite,
      }}>
        <span style={{ ...typo.labelSmall, color: DS.textSecondary, marginRight: 4 }}>Widok:</span>
        <button onClick={onToggleMultiSelect} style={{
          ...S.row, gap: 4, padding: "3px 10px", borderRadius: 6,
          border: `1px solid ${multiSelectMode ? DS.primaryLight : DS.borderLight}`,
          background: multiSelectMode ? DS.primaryLighter : DS.neutralWhite,
          color: multiSelectMode ? DS.primaryDark : DS.textSecondary,
          cursor: "pointer", ...typo.labelSmall, fontFamily: DS.fontFamily, transition: "all 0.15s",
        }}>
          <Icon name="check" size={12} color={multiSelectMode ? DS.primaryLight : DS.textDisabled} />
          Zaznacz wiele
        </button>
        <div style={{ position: "relative" }} ref={groupByRef}>
          <button onClick={() => setShowGroupMenu(p => !p)} style={{
            ...S.row, gap: 4, padding: "3px 10px", borderRadius: 6,
            border: `1px solid ${groupBy ? DS.primaryLight : DS.borderLight}`,
            background: groupBy ? DS.primaryLighter : DS.neutralWhite,
            color: groupBy ? DS.primaryDark : DS.textSecondary,
            cursor: "pointer", ...typo.labelSmall, fontFamily: DS.fontFamily, transition: "all 0.15s",
          }}>
            <Icon name="layers" size={12} color={groupBy ? DS.primaryLight : DS.textDisabled} />
            {groupBy ? ("Grupuj: " + (GROUP_BY_OPTIONS.find(o => o.id === groupBy)?.label || "")) : "Grupuj"}
            <Icon name="chevronDown" size={10} color={groupBy ? DS.primaryLight : DS.textDisabled} />
          </button>
          {showGroupMenu && <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 100,
            background: DS.neutralWhite, borderRadius: 8, border: "none",
            boxShadow: DS.elevation3, minWidth: 220, padding: "4px 0",
            animation: "fadeIn 0.12s ease",
          }}>
            {GROUP_BY_OPTIONS.map(opt => (
              <div key={opt.id} onClick={() => { setGroupBy(opt.id); setShowGroupMenu(false); }} style={{
                ...S.row, gap: 10, padding: "9px 16px", cursor: "pointer",
                background: groupBy === opt.id ? DS.primaryLighter : "transparent",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => { if (groupBy !== opt.id) e.currentTarget.style.background = DS.neutralLighter; }}
              onMouseLeave={e => e.currentTarget.style.background = groupBy === opt.id ? DS.primaryLighter : "transparent"}
              >
                <Icon name={opt.icon} size={14} color={groupBy === opt.id ? DS.primaryLight : DS.neutralMain} />
                <span style={{ ...typo.bodySmall, color: groupBy === opt.id ? DS.primaryDark : DS.textPrimary, fontWeight: groupBy === opt.id ? 600 : 400 }}>{opt.label}</span>
                {groupBy === opt.id && <Icon name="check" size={13} color={DS.primaryLight} style={{ marginLeft: "auto" }} />}
              </div>
            ))}
            {groupBy && <>
              <div style={{ height: 1, background: DS.borderLight, margin: "4px 8px" }} />
              <div onClick={() => { setGroupBy(null); setShowGroupMenu(false); }} style={{
                ...S.row, gap: 10, padding: "9px 16px", cursor: "pointer", transition: "background 0.1s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = DS.neutralLighter}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <Icon name="x" size={14} color={DS.textSecondary} />
                <span style={{ ...typo.bodySmall, color: DS.textSecondary }}>Wyłącz grupowanie</span>
              </div>
            </>}
          </div>}
        </div>
        <div style={{ flex: 1 }} />
      </div>

      {/* Table header + body with horizontal scroll */}
      <div style={{ flex: 1, overflowX: "auto", overflowY: "auto" }}>
      <div style={{ minWidth: filteredCols.reduce((s, c) => s + (c.w || c.min || 100), 0) + 40 + 28 + 60 }}>
      <div style={{
        ...S.row, padding: "0 20px",
        borderBottom: `1px solid ${DS.borderMedium}`, background: DS.tableHeaderBg,
        minHeight: 36, position: "sticky", top: 0, zIndex: 2,
      }}>
        <div onClick={e => { e.stopPropagation(); const id = onInlineAdd(); if (id) setNewRowId(id); }} style={{
          width: 28, minWidth: 28, flex: "0 0 auto", ...S.row, justifyContent: "center",
          cursor: "pointer", borderRadius: 4, transition: "background 0.1s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = DS.primaryLighter}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          title="Dodaj wiersz"
        >
          <Icon name="plus" size={16} color={DS.primaryLight} />
        </div>
        {multiSelectMode && <div style={{ width: 36, padding: "6px 6px" }}>
          <Checkbox checked={allSelected} indeterminate={someSelected}
            onChange={() => onSelectAll(!allSelected)} />
        </div>}
        {filteredCols.map((col, ci) => (
          <div key={col.key} style={{
            ...colStyle(col), padding: "6px 8px", position: "relative",
            ...S.row, gap: 4, cursor: "pointer", userSelect: "none",
          }} onClick={() => onSort(col.key)}>
            <span style={{ ...typo.labelSmall, color: DS.neutralDark, textTransform: "uppercase", letterSpacing: 0.5, fontSize: 10, fontWeight: 600 }}>{col.label}</span>
            <SortIcon colKey={col.key} />
            {col.key === "title" && <div ref={titleDragRef} onMouseDown={handleTitleResize} onClick={e => e.stopPropagation()}
              style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 5, cursor: "col-resize", background: "transparent", zIndex: 3 }}
              onMouseEnter={e => e.currentTarget.style.background = DS.primaryLight + "40"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"} />}
          </div>
        ))}
        <div style={{ width: 60, minWidth: 60, flex: "0 0 auto", padding: "6px 8px" }} />
      </div>

      {/* Table body — rows via DocTableRow */}
      <div>
        {(() => {
          if (groupBy && groupedData) {
            let globalIdx = 0;
            return groupedData.map(([groupLabel, groupDocs]) => {
              const totalValue = groupDocs.reduce((s, d) => s + (d.grossValue || 0), 0);
              return (
              <div key={groupLabel}>
                <div style={{
                  ...S.row, gap: 8, padding: "8px 20px",
                  background: DS.primaryLighter, borderBottom: `1px solid ${DS.borderLight}`,
                  position: "sticky", top: 0, zIndex: 1,
                }}>
                  <Icon name="layers" size={13} color={DS.primaryMain} />
                  <span style={{ ...typo.labelMedium, color: DS.primaryMain, fontWeight: 600 }}>{groupLabel}</span>
                  <Badge color={DS.textDisabled} bg={DS.neutralLight} small>{groupDocs.length} dok.</Badge>
                  {totalValue > 0 && <span style={{ ...typo.labelSmall, color: DS.primaryMain, fontWeight: 500, marginLeft: 4 }}>
                    {formatCurrency(totalValue)}
                  </span>}
                </div>
                {groupDocs.map(doc => <DocTableRow key={doc.id} doc={doc} idx={globalIdx++} {...rowProps} />)}
              </div>
            );});
          }
          return docs.map((doc, idx) => <DocTableRow key={doc.id} doc={doc} idx={idx} {...rowProps} />);
        })()}
      </div>

      {/* ── Summary row — under last table row ── */}
      <div style={{
        ...S.row, padding: "0 20px",
        minHeight: 36, borderTop: `1px solid ${DS.borderMedium}`,
        background: DS.neutralWhite,
      }}>
        <div style={{ width: 28, minWidth: 28, flex: "0 0 auto" }} />
        {filteredCols.map((col, ci) => {
          if (col.key === "type") return (
            <div key={col.key} style={{ ...colStyle(col), padding: "6px 8px", ...S.row }}>
              <span style={{ ...typo.labelSmall, color: DS.neutralDark, fontWeight: 600 }}>
                {docs.length} {docs.length === 1 ? "dokument" : docs.length < 5 ? "dokumenty" : "dokumentów"}
              </span>
            </div>
          );
          if (col.key === "grossValue") return (
            <div key={col.key} style={{ ...colStyle(col), padding: "6px 8px", textAlign: "right" }}>
              <span style={{ ...typo.bodySmall, color: DS.primaryMain, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {formatCurrency(totalGrossValue)}
              </span>
            </div>
          );
          return <div key={col.key} style={{ ...colStyle(col), padding: "6px 8px" }} />;
        })}
        <div style={{ width: 60, minWidth: 60, flex: "0 0 auto" }} />
      </div>

      </div>{/* close minWidth wrapper */}
      </div>{/* close scroll container */}

      {/* File preview modal */}
      {filePreview && (
        <div style={{ ...S.overlay, zIndex: 200 }} onClick={() => setFilePreview(null)}>
          <div style={{
            background: DS.neutralWhite, borderRadius: 12, width: 560, maxWidth: "90vw",
            maxHeight: "80vh", ...S.col, boxShadow: DS.shadow3,
          }} onClick={e => e.stopPropagation()}>
            <div style={{ ...S.rowBetween, padding: "16px 20px", borderBottom: `1px solid ${DS.borderLight}` }}>
              <div style={{ ...S.col, gap: 2 }}>
                <span style={{ ...typo.h4, color: DS.textPrimary }}>{filePreview.title}</span>
                {filePreview.number && <span style={{ ...typo.bodySmall, color: DS.textSecondary }}>{filePreview.number}</span>}
              </div>
              <button onClick={() => setFilePreview(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <Icon name="x" size={18} color={DS.textSecondary} />
              </button>
            </div>
            <div style={{ flex: 1, padding: 20, ...S.col, alignItems: "center", justifyContent: "center", gap: 16, minHeight: 300 }}>
              {filePreview.fileName ? (
                <>
                  <div style={{ width: 80, height: 80, borderRadius: 12, background: DS.neutralLighter, ...S.row, justifyContent: "center", alignItems: "center" }}>
                    <Icon name={filePreview.fileName.endsWith(".pdf") ? "file" : "paperclip"} size={32} color={DS.textDisabled} />
                  </div>
                  <div style={{ ...S.col, alignItems: "center", gap: 4 }}>
                    <span style={{ ...typo.bodyMedium, fontWeight: 600, color: DS.textPrimary }}>{filePreview.fileName}</span>
                    <span style={{ ...typo.bodySmall, color: DS.textDisabled }}>{filePreview.fileSize}</span>
                  </div>
                  <div style={{ ...S.row, gap: 8, marginTop: 8 }}>
                    <button style={{
                      ...S.row, gap: 6, padding: "8px 20px", borderRadius: 8,
                      background: DS.primaryLight, color: "#fff", border: "none",
                      cursor: "pointer", ...typo.labelMedium, fontFamily: DS.fontFamily, fontWeight: 600,
                    }}>
                      <Icon name="eye" size={14} color="#fff" /> Otwórz
                    </button>
                    <button style={{
                      ...S.row, gap: 6, padding: "8px 20px", borderRadius: 8,
                      background: DS.neutralWhite, color: DS.textSecondary, border: `1px solid ${DS.borderLight}`,
                      cursor: "pointer", ...typo.labelMedium, fontFamily: DS.fontFamily, fontWeight: 500,
                    }}>
                      <Icon name="download" size={14} color={DS.textSecondary} /> Pobierz
                    </button>
                  </div>
                  <span style={{ ...typo.labelSmall, color: DS.textDisabled, marginTop: 8 }}>
                    Podgląd pliku — prototyp
                  </span>
                </>
              ) : (
                <div style={{ ...S.col, alignItems: "center", gap: 8, padding: 20 }}>
                  <span style={{ ...typo.bodyMedium, color: DS.textPrimary }}>Szczegóły dokumentu</span>
                  {filePreview.grossValue > 0 && <span style={{ ...typo.bodySmall, color: DS.textSecondary }}>Wartość: {formatCurrency(filePreview.grossValue)}</span>}
                  {filePreview.contractor && <span style={{ ...typo.bodySmall, color: DS.textSecondary }}>Kontrahent: {filePreview.contractor}</span>}
                  {filePreview.status && <span style={{ ...typo.bodySmall, color: DS.textSecondary }}>Status: {(DOC_STATUSES[filePreview.status] || {}).label || filePreview.status}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
