/* ═══════════════════════════════════════════════════════════════
   DOC TABLE — zebra striping, alerts inline, tags +N (merge P1+P2)
   ═══════════════════════════════════════════════════════════════ */
const Checkbox = ({ checked, onChange, indeterminate }) => {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = indeterminate; }, [indeterminate]);
  return (
    <input ref={ref} type="checkbox" checked={checked} onChange={onChange} style={{
      width: 16, height: 16, cursor: "pointer", accentColor: DS.accentUmowyMain,
    }} />
  );
};

const DocTable = ({ docs, onSelectDoc, onInlineAdd, selectedId, sortConfig, onSort, selectedIds, onToggleSelect, onSelectAll, onOpenExport, onOpenFolders, visibleColumns, multiSelectMode, onToggleMultiSelect }) => {
  // groupBy state replaces old viewMode - see GROUP_BY_OPTIONS
  const [titleColWidth, setTitleColWidth] = useState(null); // null = auto flex
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
  const [groupBy, setGroupBy] = useState(null); // null = flat, or GROUP_BY_OPTIONS id
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const groupByRef = useRef(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [hoveredRow, setHoveredRow] = useState(null);
  const [filePreview, setFilePreview] = useState(null); // { fileName, fileSize, title }

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

  // Close group menu on outside click
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
  const colStyle = (colOrKey) => {
    const col = typeof colOrKey === "string" ? colMap[colOrKey] : colOrKey;
    if (!col) return {};
    if (col.flex) {
      if (titleColWidth) return { width: titleColWidth, minWidth: 180, flex: `0 0 ${titleColWidth}px` };
      return { flex: "1 1 180px", minWidth: 180 };
    }
    return { width: col.w, minWidth: col.w, flex: "0 0 auto" };
  };

  const SortIcon = ({ colKey }) => {
    if (sortConfig.key !== colKey) return <Icon name="arrowUpDown" size={11} color={DS.neutralMain} style={{ opacity: 0.4 }} />;
    return <Icon name={sortConfig.dir === "asc" ? "chevronDown" : "chevronDown"} size={11} color={DS.accentUmowyMain}
      style={{ transform: sortConfig.dir === "asc" ? "rotate(180deg)" : "none" }} />;
  };

  const allSelected = docs.length > 0 && docs.every(d => selectedIds.has(d.id));
  const someSelected = docs.some(d => selectedIds.has(d.id)) && !allSelected;

  return (
    <div style={{ flex: 1, ...S.col, overflow: "hidden" }}>
      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div style={{
          ...S.row, gap: 12, padding: "8px 20px",
          background: DS.accentUmowyLighter, borderBottom: `1px solid ${DS.accentUmowyLight}`,
          animation: "slideDown 0.15s ease",
        }}>
          <span style={{ ...typo.labelMedium, color: DS.accentUmowyDark }}>
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
        borderBottom: `1px solid ${DS.borderLight}`, background: DS.neutralLighter,
      }}>
        <span style={{ ...typo.labelSmall, color: DS.textSecondary, marginRight: 4 }}>Widok:</span>
        <button onClick={() => { setGroupBy(null); }} style={{
          ...S.row, gap: 4, padding: "3px 10px", borderRadius: 6,
          border: `1px solid ${!groupBy ? DS.accentUmowyMain : DS.borderLight}`,
          background: !groupBy ? DS.accentUmowyLighter : DS.neutralWhite,
          color: !groupBy ? DS.accentUmowyDark : DS.textSecondary,
          cursor: "pointer", ...typo.labelSmall, fontFamily: DS.fontFamily, transition: "all 0.15s",
        }}>
          <Icon name="list" size={12} color={!groupBy ? DS.accentUmowyMain : DS.textDisabled} />
          Lista
        </button>
        <div style={{ position: "relative" }} ref={groupByRef}>
          <button onClick={() => setShowGroupMenu(p => !p)} style={{
            ...S.row, gap: 4, padding: "3px 10px", borderRadius: 6,
            border: `1px solid ${groupBy ? DS.accentUmowyMain : DS.borderLight}`,
            background: groupBy ? DS.accentUmowyLighter : DS.neutralWhite,
            color: groupBy ? DS.accentUmowyDark : DS.textSecondary,
            cursor: "pointer", ...typo.labelSmall, fontFamily: DS.fontFamily, transition: "all 0.15s",
          }}>
            <Icon name="layers" size={12} color={groupBy ? DS.accentUmowyMain : DS.textDisabled} />
            {groupBy ? ("Grupuj: " + (GROUP_BY_OPTIONS.find(o => o.id === groupBy)?.label || "")) : "Grupuj"}
            <Icon name="chevronDown" size={10} color={groupBy ? DS.accentUmowyMain : DS.textDisabled} />
          </button>
          {showGroupMenu && <div style={{
            position: "absolute", top: "100%", left: 0, marginTop: 4, zIndex: 100,
            background: DS.neutralWhite, borderRadius: 8, border: `1px solid ${DS.borderLight}`,
            boxShadow: DS.shadow2, minWidth: 200, padding: "4px 0",
          }}>
            {GROUP_BY_OPTIONS.map(opt => (
              <div key={opt.id} onClick={() => { setGroupBy(opt.id); setShowGroupMenu(false); }} style={{
                ...S.row, gap: 8, padding: "8px 14px", cursor: "pointer",
                background: groupBy === opt.id ? DS.accentUmowyLighter : "transparent",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = DS.neutralLighter}
              onMouseLeave={e => e.currentTarget.style.background = groupBy === opt.id ? DS.accentUmowyLighter : "transparent"}
              >
                <Icon name={opt.icon} size={13} color={groupBy === opt.id ? DS.accentUmowyMain : DS.textSecondary} />
                <span style={{ ...typo.bodySmall, color: groupBy === opt.id ? DS.accentUmowyDark : DS.textPrimary }}>{opt.label}</span>
                {groupBy === opt.id && <Icon name="check" size={12} color={DS.accentUmowyMain} style={{ marginLeft: "auto" }} />}
              </div>
            ))}
            {groupBy && <>
              <div style={{ height: 1, background: DS.borderLight, margin: "4px 0" }} />
              <div onClick={() => { setGroupBy(null); setShowGroupMenu(false); }} style={{
                ...S.row, gap: 8, padding: "8px 14px", cursor: "pointer", transition: "background 0.1s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = DS.neutralLighter}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <Icon name="x" size={13} color={DS.textSecondary} />
                <span style={{ ...typo.bodySmall, color: DS.textSecondary }}>Wyłącz grupowanie</span>
              </div>
            </>}
          </div>}
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={onToggleMultiSelect} style={{
          ...S.row, gap: 4, padding: "3px 10px", borderRadius: 6,
          border: `1px solid ${multiSelectMode ? DS.accentUmowyMain : DS.borderLight}`,
          background: multiSelectMode ? DS.accentUmowyLighter : DS.neutralWhite,
          color: multiSelectMode ? DS.accentUmowyDark : DS.textSecondary,
          cursor: "pointer", ...typo.labelSmall, fontFamily: DS.fontFamily, transition: "all 0.15s",
        }}>
          <Icon name="check" size={12} color={multiSelectMode ? DS.accentUmowyMain : DS.textDisabled} />
          Zaznacz wiele
        </button>
        <span style={{ ...typo.labelSmall, color: DS.textDisabled }}>{docs.length} dok.</span>
      </div>

      {/* Table header + body with horizontal scroll */}
      <div style={{ flex: 1, overflowX: "auto", overflowY: "auto" }}>
      <div style={{ minWidth: filteredCols.reduce((s, c) => s + (c.w || c.min || 100), 0) + 40 + 28 + 120 }}>
      <div style={{
        ...S.row, padding: "0 20px",
        borderBottom: `2px solid ${DS.borderLight}`, background: DS.neutralWhite,
        minHeight: 38, position: "sticky", top: 0, zIndex: 2,
      }}>
        {/* Expand column header spacer */}
        <div style={{ width: 28, minWidth: 28, flex: "0 0 auto" }} />
        {multiSelectMode && <div style={{ width: 36, padding: "8px 6px" }}>
          <Checkbox checked={allSelected} indeterminate={someSelected}
            onChange={() => onSelectAll(!allSelected)} />
        </div>}
        {filteredCols.map(col => (
          <div key={col.key} style={{
            ...colStyle(col), padding: "8px 6px", position: "relative",
            ...S.row, gap: 4, cursor: "pointer", userSelect: "none",
          }} onClick={() => onSort(col.key)}>
            <span style={{ ...typo.labelSmall, color: DS.textDisabled, textTransform: "uppercase", letterSpacing: 0.5 }}>{col.label}</span>
            <SortIcon colKey={col.key} />
            {col.key === "title" && <div ref={titleDragRef} onMouseDown={handleTitleResize} onClick={e => e.stopPropagation()}
              style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 5, cursor: "col-resize", background: "transparent", zIndex: 3 }}
              onMouseEnter={e => e.currentTarget.style.background = DS.accentUmowyMain + "40"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"} />}
          </div>
        ))}
        {/* Actions column header */}
        <div style={{ width: 120, minWidth: 120, flex: "0 0 auto", padding: "8px 6px" }} />
      </div>

      {/* Table body */}
      <div>
        {(() => {
          const renderRow = (doc, idx) => {
            const typeInfo = DOC_TYPES[doc.type] || DOC_TYPES.inne;
            const statusInfo = DOC_STATUSES[doc.status] || DOC_STATUSES.draft;
            const isSelected = selectedId === doc.id;
            const isChecked = selectedIds.has(doc.id);
            const isZebra = idx % 2 === 1;
            const docAlerts = computeAlerts(doc);
            const docTags = (doc.tags || []).map(t => TAGS.find(tt => tt.id === t)).filter(Boolean);
            const visibleTags = docTags.slice(0, 2);
            const extraTags = docTags.length - 2;
            const vc = visibleColumns || [];
            const showCol = (key) => !visibleColumns || vc.includes(key);
            const children = CHILD_DOCS[doc.id] || [];
            const hasChildren = children.length > 0;
            const isExpanded = expandedRows.has(doc.id);
            const isHovered = hoveredRow === doc.id;
            return (
              <React.Fragment key={doc.id}>
              <div onClick={hasChildren ? (e) => toggleExpand(doc.id, e) : undefined}
                draggable onDragStart={e => { e.dataTransfer.setData("text/plain", String(doc.id)); e.dataTransfer.effectAllowed = "move"; }}
                onMouseEnter={e => { setHoveredRow(doc.id); if (!isSelected && !isExpanded) e.currentTarget.style.background = DS.primaryLighter; }}
                onMouseLeave={e => { setHoveredRow(null); if (!isSelected && !isExpanded) e.currentTarget.style.background = isChecked ? `${DS.accentUmowyMain}08` : isZebra ? DS.neutralLighter : DS.neutralWhite; }}
                style={{
                ...S.row, padding: "0 20px", position: "relative",
                minHeight: 48, cursor: hasChildren ? "pointer" : "default", transition: "background 0.1s",
                background: isSelected ? DS.accentUmowyLighter : isExpanded ? `${DS.primaryMain}06` : isChecked ? `${DS.accentUmowyMain}08` : isZebra ? DS.neutralLighter : DS.neutralWhite,
                borderBottom: `1px solid ${DS.borderLight}`,
                borderLeft: isSelected ? `3px solid ${DS.accentUmowyMain}` : isExpanded ? `3px solid ${DS.primaryMain}40` : "3px solid transparent",
              }}
              >
                  {/* Expand chevron column */}
                <div style={{ width: 28, minWidth: 28, flex: "0 0 auto", padding: "8px 2px 8px 0", ...S.row, justifyContent: "center" }}>
                  {hasChildren && (
                    <Icon name={isExpanded ? "chevronDown" : "chevronRight"} size={13} color={DS.primaryMain} style={{ transition: "transform 0.15s" }} />
                  )}
                </div>
                {multiSelectMode && <div style={{ width: 36, padding: "8px 6px" }} onClick={e => e.stopPropagation()}>
                  <Checkbox checked={isChecked} onChange={() => onToggleSelect(doc.id)} />
                </div>}
                {showCol("type") && <div style={{ ...colStyle("type"), padding: "8px 6px", ...S.row, gap: 4 }}>
                  <Icon name={typeInfo.icon} size={14} color={DS.neutralMain} />
                  <span style={{ ...typo.bodySmall, color: DS.textSecondary, ...S.truncate }}>{typeInfo.label}</span>
                </div>}
                {showCol("alerts") && <div style={{ ...colStyle("alerts"), padding: "8px 4px", ...S.row, gap: 3, justifyContent: "center" }}>
                  {docAlerts.length > 0 ? docAlerts.map(code => <AlertBadge key={code} code={code} />) : <span style={{ color: DS.textDisabled }}>—</span>}
                </div>}
                {showCol("number") && <div style={{ ...colStyle("number"), padding: "8px 6px" }}>
                  <span style={{ ...typo.bodySmall, color: DS.textSecondary, fontFamily: "monospace", ...S.truncate, display: "block", fontSize: 12 }}>{doc.number || "—"}</span>
                </div>}
                {showCol("nrEwidencyjny") && <div style={{ ...colStyle("nrEwidencyjny"), padding: "8px 6px" }}>
                  <span style={{ ...typo.bodySmall, color: doc.nrEwidencyjny ? DS.accentUmowyDark : DS.textDisabled, fontFamily: "monospace", ...S.truncate, display: "block", fontSize: 11, fontWeight: doc.nrEwidencyjny ? 600 : 400 }}>{doc.nrEwidencyjny || "—"}</span>
                </div>}
                {showCol("title") && <div style={{ ...colStyle("title"), padding: "8px 6px" }}>
                  <span style={{ ...typo.bodySmall, fontWeight: 500, color: DS.textPrimary, ...S.truncate, display: "block" }}>
                    {doc.title || "Bez tytułu"}
                  </span>
                </div>}
                {showCol("contractor") && <div style={{ ...colStyle("contractor"), padding: "8px 6px" }}>
                  <span style={{ ...typo.bodySmall, color: DS.textSecondary, ...S.truncate, display: "block" }}>
                    {doc.contractor || "—"}
                  </span>
                </div>}
                {showCol("assignee") && <div style={{ ...colStyle("assignee"), padding: "8px 4px", ...S.row, justifyContent: "center" }}>
                  {(() => { const u = USERS_LIST.find(u => u.id === doc.assignee); return u ? (
                    <div title={u.name} style={{ width: 26, height: 26, borderRadius: "50%", background: DS.accentUmowyLighter, ...S.row, justifyContent: "center", alignItems: "center" }}>
                      <span style={{ ...typo.labelSmall, color: DS.accentUmowyDark, fontWeight: 600, fontSize: 10 }}>{u.initials}</span>
                    </div>
                  ) : <span style={{ ...typo.labelSmall, color: DS.textDisabled }}>—</span>; })()}
                </div>}
                {showCol("dept") && <div style={{ ...colStyle("dept"), padding: "8px 6px" }}>
                  <span style={{ ...typo.bodySmall, color: DS.textSecondary, ...S.truncate, display: "block" }}>
                    {doc.dept}
                  </span>
                </div>}
                {showCol("dateEnd") && <div style={{ ...colStyle("dateEnd"), padding: "8px 6px" }}>
                  <span style={{ ...typo.bodySmall, color: DS.textSecondary }}>{doc.dateEnd ? formatDate(doc.dateEnd) : "—"}</span>
                </div>}
                {showCol("grossValue") && <div style={{ ...colStyle("grossValue"), padding: "8px 6px", textAlign: "right" }}>
                  <span style={{ ...typo.bodySmall, fontWeight: 500, color: DS.textPrimary, fontVariantNumeric: "tabular-nums" }}>
                    {doc.grossValue ? formatCurrency(doc.grossValue) : "—"}
                  </span>
                </div>}
                {showCol("classification") && <div style={{ ...colStyle("classification"), padding: "8px 6px" }}>
                  <span style={{ ...typo.labelSmall, color: DS.textSecondary, ...S.truncate, display: "block" }}>
                    {doc.classification || "—"}
                  </span>
                </div>}
                {showCol("tags") && <div style={{ ...colStyle("tags"), padding: "8px 4px", ...S.row, gap: 3, flexWrap: "wrap" }}>
                  {visibleTags.map(tag => (
                    <Badge key={tag.id} color={tag.color} bg={tag.color + "18"} small>{tag.label}</Badge>
                  ))}
                  {extraTags > 0 && <span style={{ ...typo.labelSmall, color: DS.textDisabled, fontWeight: 500 }}>+{extraTags}</span>}
                </div>}
                {showCol("status") && <div style={{ ...colStyle("status"), padding: "8px 6px" }}>
                  <Badge color={statusInfo.color} bg={statusInfo.bg}>{statusInfo.label}</Badge>
                </div>}
                {/* Actions column — children counter + Szczegóły button (always visible) */}
                <div style={{ width: 120, minWidth: 120, flex: "0 0 auto", padding: "8px 6px", ...S.row, gap: 6, justifyContent: "flex-end" }}>
                  {hasChildren && !isExpanded && (
                    <span style={{
                      ...typo.labelSmall, color: DS.primaryMain, fontWeight: 500,
                      background: DS.primaryLighter, padding: "2px 7px", borderRadius: 10,
                      whiteSpace: "nowrap", fontSize: 10,
                    }}>
                      <Icon name="paperclip" size={9} color={DS.primaryMain} style={{ marginRight: 2 }} />
                      {children.length}
                    </span>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); onSelectDoc(doc); }} style={{
                    ...S.row, gap: 3, padding: "3px 10px", borderRadius: 5,
                    border: `1px solid ${DS.borderLight}`, background: DS.neutralWhite,
                    color: DS.textSecondary, cursor: "pointer", ...typo.labelSmall,
                    fontFamily: DS.fontFamily, fontWeight: 500, whiteSpace: "nowrap",
                    fontSize: 11, transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = DS.accentUmowyMain; e.currentTarget.style.color = DS.accentUmowyMain; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = DS.borderLight; e.currentTarget.style.color = DS.textSecondary; }}
                  >
                    <Icon name="eye" size={11} />
                    Szczeg.
                  </button>
                </div>
              </div>
              {/* Expanded children area */}
              {isExpanded && hasChildren && (() => {
                const grouped = {};
                children.forEach(c => {
                  const ct = c.childType || "inne";
                  if (!grouped[ct]) grouped[ct] = [];
                  grouped[ct].push(c);
                });
                const typeOrder = ["faktura", "aneks", "zalacznik", "plik"];
                return (
                  <div style={{ background: `${DS.primaryMain}04`, borderLeft: `3px solid ${DS.primaryMain}30`, borderBottom: `1px solid ${DS.borderLight}` }}>
                    {/* Podpięte dokumenty header */}
                    <div style={{ ...S.row, gap: 6, padding: "8px 20px 4px 40px" }}>
                      <span style={{ ...typo.labelSmall, color: DS.textDisabled, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, fontSize: 10 }}>
                        Podpięte dokumenty ({children.length})
                      </span>
                    </div>
                    {typeOrder.filter(t => grouped[t]).map(ct => {
                      const ctInfo = CHILD_TYPE_LABELS[ct] || { label: ct.toUpperCase(), icon: "file", color: DS.neutralDark };
                      return (
                        <div key={ct}>
                          <div style={{ ...S.row, gap: 6, padding: "6px 20px 2px 48px" }}>
                            <span style={{ ...typo.labelSmall, color: ctInfo.color, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, fontSize: 10 }}>
                              {ctInfo.label} ({grouped[ct].length})
                            </span>
                          </div>
                          {grouped[ct].map(child => {
                            const childStatus = DOC_STATUSES[child.status] || null;
                            const childType = DOC_TYPES[child.type] || DOC_TYPES.inne;
                            return (
                              <div key={child.id} style={{
                                ...S.row, padding: "0 20px 0 56px", minHeight: 40,
                                borderBottom: `1px solid ${DS.borderLight}08`, transition: "background 0.1s",
                                cursor: child.fileName ? "pointer" : "default",
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = `${DS.primaryMain}08`}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                              onClick={child.fileName ? () => setFilePreview(child) : undefined}
                              >
                                <div style={{ width: 28, ...S.row, justifyContent: "center", flexShrink: 0 }}>
                                  <Icon name={ct === "plik" ? "file" : ctInfo.icon} size={13} color={ctInfo.color + "90"} />
                                </div>
                                {child.number && (
                                  <div style={{ width: 140, padding: "6px 6px", flexShrink: 0 }}>
                                    <span style={{ ...typo.bodySmall, color: DS.textSecondary, fontFamily: "monospace", fontSize: 11 }}>{child.number}</span>
                                  </div>
                                )}
                                <div style={{ flex: 1, padding: "6px 6px", minWidth: 0 }}>
                                  <span style={{ ...typo.bodySmall, color: DS.textPrimary, ...S.truncate, display: "block", fontSize: 12.5 }}>
                                    {child.title}
                                  </span>
                                </div>
                                {child.grossValue > 0 && (
                                  <div style={{ width: 110, padding: "6px 6px", textAlign: "right", flexShrink: 0 }}>
                                    <span style={{ ...typo.bodySmall, fontWeight: 500, color: DS.textPrimary, fontVariantNumeric: "tabular-nums", fontSize: 12 }}>
                                      {formatCurrency(child.grossValue)}
                                    </span>
                                  </div>
                                )}
                                {child.fileName && (
                                  <div style={{ ...S.row, gap: 4, padding: "6px 6px", flexShrink: 0 }}>
                                    <Icon name="eye" size={11} color={DS.textDisabled} />
                                    <span style={{ ...typo.labelSmall, color: DS.textDisabled, fontSize: 10 }}>{child.fileSize}</span>
                                  </div>
                                )}
                                {childStatus && (
                                  <div style={{ width: 120, padding: "6px 6px", textAlign: "right", flexShrink: 0 }}>
                                    <Badge color={childStatus.color} bg={childStatus.bg} small>{childStatus.label}</Badge>
                                  </div>
                                )}
                                {/* Szczegóły link for child */}
                                <div style={{ width: 70, padding: "6px 4px", textAlign: "right", flexShrink: 0 }}>
                                  <span onClick={(e) => { e.stopPropagation(); if (child.fileName) setFilePreview(child); }}
                                    style={{ ...typo.labelSmall, color: DS.accentUmowyMain, cursor: "pointer", fontWeight: 500, fontSize: 11 }}>
                                    {child.fileName ? "Podgląd" : "Szczeg."}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
              </React.Fragment>
            );
          };

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
                {groupDocs.map(doc => renderRow(doc, globalIdx++))}
              </div>
            );});
          }
          return docs.map((doc, idx) => renderRow(doc, idx));
        })()}
      </div>{/* close table body */}

      {/* Inline add row */}
      <div onClick={onInlineAdd} style={{
        ...S.row, padding: "0 20px",
        minHeight: 44, cursor: "pointer", transition: "background 0.1s",
        background: DS.neutralWhite, borderTop: `1px dashed ${DS.accentUmowyLight}`,
        flexShrink: 0,
      }}
        onMouseEnter={e => e.currentTarget.style.background = DS.accentUmowyLighter}
        onMouseLeave={e => e.currentTarget.style.background = DS.neutralWhite}
      >
        {multiSelectMode && <div style={{ width: 36 }} />}
        <div style={{ ...S.row, gap: 8, padding: "8px 8px" }}>
          <Icon name="plus" size={15} color={DS.accentUmowyMain} />
          <span style={{ ...typo.bodySmall, color: DS.accentUmowyMain, fontWeight: 500 }}>Dodaj dokument</span>
        </div>
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
                      background: DS.accentUmowyMain, color: "#fff", border: "none",
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
