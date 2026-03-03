/* ═══════════════════════════════════════════════════════════════
   DOC TABLE ROW — single row + expanded children (extracted from DocTable)
   ═══════════════════════════════════════════════════════════════ */
const EDITABLE_COLS = ["type", "number", "nrEwidencyjny", "title", "contractor", "dept", "dateEnd", "grossValue", "status"];

const DocTableRow = ({ doc, idx, selectedId, selectedIds, visibleColumns, multiSelectMode, expandedRows, toggleExpand, hoveredRow, setHoveredRow, setFilePreview, onToggleSelect, onSelectDoc, colStyle, onUpdateDoc, newRowId, clearNewRowId }) => {
  const typeInfo = DOC_TYPES[doc.type] || DOC_TYPES.inne;
  const statusInfo = DOC_STATUSES[doc.status] || null;
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

  // Inline editing state
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState(null);
  const tabMovingRef = useRef(false);

  const visibleEditableCols = EDITABLE_COLS.filter(k => showCol(k));

  // Auto-enter edit mode for new inline rows
  useEffect(() => {
    if (newRowId && doc.id === newRowId && visibleEditableCols.length > 0) {
      const firstKey = visibleEditableCols[0];
      setEditingCell(firstKey);
      setEditValue(firstKey === "grossValue" ? (doc[firstKey] || 0) : (doc[firstKey] || ""));
      if (clearNewRowId) clearNewRowId();
    }
  }, [newRowId, doc.id]);

  const commitEdit = useCallback((key, value) => {
    if (onUpdateDoc && value !== doc[key]) {
      const finalValue = key === "grossValue" ? (parseFloat(value) || 0) : value;
      onUpdateDoc(doc.id, key, finalValue);
    }
  }, [doc, onUpdateDoc]);

  const startEdit = useCallback((key, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    setEditingCell(key);
    setEditValue(key === "grossValue" ? (doc[key] || 0) : (doc[key] || ""));
  }, [doc]);

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue(null);
  }, []);

  const handleKeyDown = useCallback((e, key) => {
    if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit(key, editValue);
      setEditingCell(null);
      setEditValue(null);
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      commitEdit(key, editValue);
      const curIdx = visibleEditableCols.indexOf(key);
      const nextIdx = e.shiftKey ? curIdx - 1 : curIdx + 1;
      if (nextIdx >= 0 && nextIdx < visibleEditableCols.length) {
        const nextKey = visibleEditableCols[nextIdx];
        tabMovingRef.current = true;
        setEditingCell(nextKey);
        setEditValue(nextKey === "grossValue" ? (doc[nextKey] || 0) : (doc[nextKey] || ""));
      } else {
        setEditingCell(null);
        setEditValue(null);
      }
    }
  }, [editValue, visibleEditableCols, commitEdit, cancelEdit, doc]);

  const handleBlur = useCallback((key) => {
    // Small delay to allow Tab handler to set tabMovingRef first
    setTimeout(() => {
      if (tabMovingRef.current) {
        tabMovingRef.current = false;
        return;
      }
      commitEdit(key, editValue);
      setEditingCell(null);
      setEditValue(null);
    }, 0);
  }, [editValue, commitEdit]);

  const inputStyle = {
    width: "100%", padding: "3px 6px", border: `1px solid ${DS.primaryLight}`,
    borderRadius: 4, background: DS.neutralWhite, fontFamily: DS.fontFamily,
    fontSize: 12, color: DS.textPrimary, outline: "none", boxSizing: "border-box",
    boxShadow: `0 0 0 2px ${DS.primaryLight}18`,
  };

  const handleDropdownSelect = useCallback((key, val) => {
    commitEdit(key, val);
    setEditingCell(null);
    setEditValue(null);
  }, [commitEdit]);

  const handleDropdownTab = useCallback((key, e) => {
    // simulate tab to next editable col
    const curIdx = visibleEditableCols.indexOf(key);
    const nextIdx = e.shiftKey ? curIdx - 1 : curIdx + 1;
    if (nextIdx >= 0 && nextIdx < visibleEditableCols.length) {
      const nextKey = visibleEditableCols[nextIdx];
      tabMovingRef.current = true;
      setEditingCell(nextKey);
      setEditValue(nextKey === "grossValue" ? (doc[nextKey] || 0) : (doc[nextKey] || ""));
    } else {
      setEditingCell(null);
      setEditValue(null);
    }
  }, [visibleEditableCols, doc]);

  const renderEditInput = (key) => {
    // CellDropdown for type
    if (key === "type") {
      return <CellDropdown value={editValue}
        options={Object.entries(DOC_TYPES).map(([k, v]) => ({ value: k, label: v.label }))}
        onChange={v => handleDropdownSelect(key, v)}
        onClose={cancelEdit}
        onKeyDown={e => { if (e.key === "Tab") handleDropdownTab(key, e); }}
      />;
    }
    // CellDropdown for contractor
    if (key === "contractor") {
      return <CellDropdown value={editValue}
        options={[{ value: "", label: "— brak —" }, ...CONTRACTORS.map(c => ({ value: c, label: c }))]}
        onChange={v => handleDropdownSelect(key, v)}
        onClose={cancelEdit}
        onKeyDown={e => { if (e.key === "Tab") handleDropdownTab(key, e); }}
      />;
    }
    // CellDropdown for dept
    if (key === "dept") {
      return <CellDropdown value={editValue}
        options={[{ value: "", label: "— brak —" }, ...DEPARTMENTS.map(d => ({ value: d, label: d }))]}
        onChange={v => handleDropdownSelect(key, v)}
        onClose={cancelEdit}
        onKeyDown={e => { if (e.key === "Tab") handleDropdownTab(key, e); }}
      />;
    }
    // CellDropdown for status
    if (key === "status") {
      const allowedStatuses = DOC_TYPE_STATUSES[doc.type] || [];
      if (allowedStatuses.length === 0) return <span style={{ ...typo.bodySmall, color: DS.textDisabled }}>—</span>;
      return <CellDropdown value={editValue}
        options={allowedStatuses.map(k => ({ value: k, label: DOC_STATUSES[k]?.label || k }))}
        onChange={v => handleDropdownSelect(key, v)}
        onClose={cancelEdit}
        onKeyDown={e => { if (e.key === "Tab") handleDropdownTab(key, e); }}
      />;
    }
    // Date input
    if (key === "dateEnd") {
      return <input type="date" value={editValue || ""} onChange={e => setEditValue(e.target.value)}
        onKeyDown={e => handleKeyDown(e, key)} onBlur={() => handleBlur(key)}
        autoFocus style={inputStyle} />;
    }
    // Number input
    if (key === "grossValue") {
      return <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)}
        onKeyDown={e => handleKeyDown(e, key)} onBlur={() => handleBlur(key)}
        autoFocus onFocus={e => e.target.select()} step="0.01" style={{ ...inputStyle, textAlign: "right" }} />;
    }
    // Default text input
    return <input type="text" value={editValue} onChange={e => setEditValue(e.target.value)}
      onKeyDown={e => handleKeyDown(e, key)} onBlur={() => handleBlur(key)}
      autoFocus onFocus={e => e.target.select()} style={inputStyle} />;
  };

  const editableCellProps = (key) => {
    if (!onUpdateDoc || !EDITABLE_COLS.includes(key)) return {};
    return {
      onDoubleClick: (e) => startEdit(key, e),
    };
  };

  const editCellBg = DS.primaryLighter;

  return (
    <React.Fragment>
    <div onClick={() => onSelectDoc(doc)}
      draggable onDragStart={e => { e.dataTransfer.setData("text/plain", String(doc.id)); e.dataTransfer.effectAllowed = "move"; }}
      onMouseEnter={e => { setHoveredRow(doc.id); if (!isSelected && !isExpanded) e.currentTarget.style.background = "#F5F7FC"; }}
      onMouseLeave={e => { setHoveredRow(null); if (!isSelected && !isExpanded) e.currentTarget.style.background = isChecked ? `${DS.primaryLight}06` : DS.neutralWhite; }}
      style={{
      ...S.row, padding: "0 20px", position: "relative",
      minHeight: 44, cursor: "pointer", transition: "background 0.08s",
      background: isSelected ? DS.primaryLighter : isExpanded ? "#F5F7FC" : isChecked ? `${DS.primaryLight}06` : DS.neutralWhite,
      borderBottom: `1px solid ${DS.borderLightLight || "#EDF0F5"}`,
      borderLeft: isSelected ? `3px solid ${DS.primaryLight}` : isExpanded ? `3px solid ${DS.primaryLight}50` : "3px solid transparent",
    }}
    >
        {/* Expand chevron column */}
      <div style={{ width: 28, minWidth: 28, flex: "0 0 auto", padding: "8px 2px 8px 0", ...S.row, justifyContent: "center" }}>
        {hasChildren && (
          <div onClick={(e) => { e.stopPropagation(); toggleExpand(doc.id, e); }}
            onMouseEnter={e => { e.currentTarget.style.background = DS.primaryLighter; e.currentTarget.style.border = `1px solid ${DS.primaryLight}`; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.border = "1px solid transparent"; }}
            style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 4, border: "1px solid transparent", transition: "all 0.15s" }}>
            <Icon name={isExpanded ? "chevronDown" : "chevronRight"} size={13} color={DS.primaryMain} style={{ transition: "transform 0.15s" }} />
          </div>
        )}
      </div>
      {multiSelectMode && <div style={{ width: 36, padding: "6px 8px" }} onClick={e => e.stopPropagation()}>
        <Checkbox checked={isChecked} onChange={() => onToggleSelect(doc.id)} />
      </div>}
      {showCol("type") && <div style={{ ...colStyle("type"), padding: "6px 8px", ...S.row, gap: 4, background: editingCell === "type" ? editCellBg : undefined }} {...editableCellProps("type")}>
        {editingCell === "type" ? renderEditInput("type") : <>
          <Icon name={typeInfo.icon} size={14} color={DS.neutralMain} />
          <span style={{ ...typo.bodySmall, color: DS.textSecondary, ...S.truncate }}>{typeInfo.label}</span>
        </>}
      </div>}
      {showCol("alerts") && <div style={{ ...colStyle("alerts"), padding: "6px 4px", ...S.row, gap: 3, justifyContent: "center" }}>
        {docAlerts.length > 0 ? docAlerts.map(code => <AlertBadge key={code} code={code} />) : <span style={{ color: DS.textDisabled }}>—</span>}
      </div>}
      {showCol("number") && <div style={{ ...colStyle("number"), padding: "6px 8px", background: editingCell === "number" ? editCellBg : undefined }} {...editableCellProps("number")}>
        {editingCell === "number" ? renderEditInput("number") :
          <span style={{ ...typo.bodySmall, color: DS.textSecondary, fontFamily: "monospace", ...S.truncate, display: "block", fontSize: 12 }}>{doc.number || "—"}</span>}
      </div>}
      {showCol("nrEwidencyjny") && <div style={{ ...colStyle("nrEwidencyjny"), padding: "6px 8px", background: editingCell === "nrEwidencyjny" ? editCellBg : undefined }} {...editableCellProps("nrEwidencyjny")}>
        {editingCell === "nrEwidencyjny" ? renderEditInput("nrEwidencyjny") :
          <span style={{ ...typo.bodySmall, color: doc.nrEwidencyjny ? DS.primaryDark : DS.textDisabled, fontFamily: "monospace", ...S.truncate, display: "block", fontSize: 11, fontWeight: doc.nrEwidencyjny ? 600 : 400 }}>{doc.nrEwidencyjny || "—"}</span>}
      </div>}
      {showCol("title") && <div style={{ ...colStyle("title"), padding: "6px 8px", background: editingCell === "title" ? editCellBg : undefined }} {...editableCellProps("title")}>
        {editingCell === "title" ? renderEditInput("title") :
          <span style={{ ...typo.bodySmall, fontWeight: 500, color: DS.textPrimary, ...S.truncate, display: "block" }}>
            {doc.title || "Bez tytułu"}
          </span>}
      </div>}
      {showCol("contractor") && <div style={{ ...colStyle("contractor"), padding: "6px 8px", background: editingCell === "contractor" ? editCellBg : undefined }} {...editableCellProps("contractor")}>
        {editingCell === "contractor" ? renderEditInput("contractor") :
          <span style={{ ...typo.bodySmall, color: DS.textSecondary, ...S.truncate, display: "block" }}>
            {doc.contractor || "—"}
          </span>}
      </div>}
      {showCol("assignee") && <div style={{ ...colStyle("assignee"), padding: "6px 4px", ...S.row, justifyContent: "center" }}>
        {(() => { const u = USERS_LIST.find(u => u.id === doc.assignee); return u ? (
          <div title={u.name} style={{ width: 26, height: 26, borderRadius: "50%", background: DS.primaryLighter, ...S.row, justifyContent: "center", alignItems: "center" }}>
            <span style={{ ...typo.labelSmall, color: DS.primaryDark, fontWeight: 600, fontSize: 10 }}>{u.initials}</span>
          </div>
        ) : <span style={{ ...typo.labelSmall, color: DS.textDisabled }}>—</span>; })()}
      </div>}
      {showCol("dept") && <div style={{ ...colStyle("dept"), padding: "6px 8px", background: editingCell === "dept" ? editCellBg : undefined }} {...editableCellProps("dept")}>
        {editingCell === "dept" ? renderEditInput("dept") :
          <span style={{ ...typo.bodySmall, color: DS.textSecondary, ...S.truncate, display: "block" }}>
            {doc.dept}
          </span>}
      </div>}
      {showCol("dateEnd") && <div style={{ ...colStyle("dateEnd"), padding: "6px 8px", background: editingCell === "dateEnd" ? editCellBg : undefined }} {...editableCellProps("dateEnd")}>
        {editingCell === "dateEnd" ? renderEditInput("dateEnd") :
          <span style={{ ...typo.bodySmall, color: DS.textSecondary }}>{doc.dateEnd ? formatDate(doc.dateEnd) : "—"}</span>}
      </div>}
      {showCol("grossValue") && <div style={{ ...colStyle("grossValue"), padding: "6px 8px", textAlign: "right", background: editingCell === "grossValue" ? editCellBg : undefined }} {...editableCellProps("grossValue")}>
        {editingCell === "grossValue" ? renderEditInput("grossValue") :
          <span style={{ ...typo.bodySmall, fontWeight: 500, color: DS.textPrimary, fontVariantNumeric: "tabular-nums" }}>
            {doc.grossValue ? formatCurrency(doc.grossValue) : "—"}
          </span>}
      </div>}
      {showCol("classification") && <div style={{ ...colStyle("classification"), padding: "6px 8px" }}>
        <span style={{ ...typo.labelSmall, color: DS.textSecondary, ...S.truncate, display: "block" }}>
          {doc.classification || "—"}
        </span>
      </div>}
      {showCol("tags") && <div style={{ ...colStyle("tags"), padding: "6px 4px", ...S.row, gap: 3, flexWrap: "wrap" }}>
        {visibleTags.map(tag => (
          <Badge key={tag.id} color={tag.color} bg={tag.color + "18"} small>{tag.label}</Badge>
        ))}
        {extraTags > 0 && <span style={{ ...typo.labelSmall, color: DS.textDisabled, fontWeight: 500 }}>+{extraTags}</span>}
      </div>}
      {showCol("status") && <div style={{ ...colStyle("status"), padding: "6px 8px", background: editingCell === "status" ? editCellBg : undefined }} {...editableCellProps("status")}>
        {editingCell === "status" ? renderEditInput("status") :
          statusInfo ? <Badge color={statusInfo.color} bg={statusInfo.bg}>{statusInfo.label}</Badge> : <span style={{ ...typo.bodySmall, color: DS.textDisabled }}>—</span>}
      </div>}
      {/* Actions column — children counter only */}
      <div style={{ width: 60, minWidth: 60, flex: "0 0 auto", padding: "6px 8px", ...S.row, gap: 6, justifyContent: "flex-end" }}>
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
                          style={{ ...typo.labelSmall, color: DS.primaryLight, cursor: "pointer", fontWeight: 500, fontSize: 11 }}>
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
