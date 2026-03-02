/* ═══════════════════════════════════════════════════════════════
   DOC TABLE ROW — single row + expanded children (extracted from DocTable)
   ═══════════════════════════════════════════════════════════════ */
const DocTableRow = ({ doc, idx, selectedId, selectedIds, visibleColumns, multiSelectMode, expandedRows, toggleExpand, hoveredRow, setHoveredRow, setFilePreview, onToggleSelect, onSelectDoc, colStyle }) => {
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
    <React.Fragment>
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
      {/* Actions column — children counter + Szczegóły button */}
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
