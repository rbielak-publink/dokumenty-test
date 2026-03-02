/* ═══════════════════════════════════════════════════════════════
   FOLDER PANEL — teczki z drag & drop (Iter 4)
   ═══════════════════════════════════════════════════════════════ */
const FoldersView = ({ folders, setFolders, docs, onSelectDoc, activeFolderId, setActiveFolderId, viewMode, setViewMode, search, setSearch }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#A971F6");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [folderDocSearch, setFolderDocSearch] = useState("");

  const COLORS = ["#A971F6", "#21B9E5", "#38A169", "#E53E3E", "#DD6B20", "#1A2569"];

  const createFolder = () => {
    if (!newName.trim()) return;
    const id = "f" + Date.now();
    setFolders(prev => [...prev, { id, name: newName.trim(), color: newColor, icon: "folder", docIds: [], description: "", createdAt: new Date().toISOString().split("T")[0] }]);
    setNewName(""); setNewColor("#A971F6"); setShowCreate(false);
  };

  const deleteFolder = (folderId) => {
    setFolders(prev => prev.filter(f => f.id !== folderId));
    if (activeFolderId === folderId) setActiveFolderId(null);
  };

  const renameFolder = (folderId) => {
    if (!editName.trim()) return;
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name: editName.trim() } : f));
    setEditingId(null); setEditName("");
  };

  const removeDocFromFolder = (folderId, docId) => {
    setFolders(prev => prev.map(f =>
      f.id === folderId ? { ...f, docIds: f.docIds.filter(id => id !== docId) } : f
    ));
  };

  // FOLDER DETAIL VIEW
  const activeFolder = activeFolderId ? folders.find(f => f.id === activeFolderId) : null;
  if (activeFolder) {
    let folderDocs = activeFolder.docIds.map(id => docs.find(d => d.id === id)).filter(Boolean);
    if (folderDocSearch) {
      const q = folderDocSearch.toLowerCase();
      folderDocs = folderDocs.filter(d =>
        (d.title || "").toLowerCase().includes(q) || (d.number || "").toLowerCase().includes(q) ||
        (d.contractor || "").toLowerCase().includes(q) || (d.type || "").toLowerCase().includes(q)
      );
    }
    return (
      <div style={{ flex: 1, ...S.col, overflow: "hidden" }}>
        {/* Folder detail header */}
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${DS.borderLight}`, background: DS.neutralWhite }}>
          <div style={{ ...S.row, gap: 10, marginBottom: 10 }}>
            <button onClick={() => { setActiveFolderId(null); setFolderDocSearch(""); }} style={{ ...S.row, gap: 4, border: "none", background: "none", cursor: "pointer", color: DS.primaryLight, fontSize: 13, fontWeight: 500, fontFamily: DS.fontFamily, padding: 0 }}>
              <Icon name="chevronLeft" size={14} color={DS.primaryLight} /> Foldery
            </button>
          </div>
          <div style={{ ...S.row, gap: 12, justifyContent: "space-between" }}>
            <div style={{ ...S.row, gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: activeFolder.color + "18", ...S.row, justifyContent: "center" }}>
                <Icon name={activeFolder.icon || "folder"} size={18} color={activeFolder.color} />
              </div>
              <div>
                {editingId === activeFolder.id ? (
                  <div style={{ ...S.row, gap: 6 }}>
                    <input value={editName} onChange={e => setEditName(e.target.value)} autoFocus
                      onKeyDown={e => { if (e.key === "Enter") renameFolder(activeFolder.id); if (e.key === "Escape") setEditingId(null); }}
                      style={{ ...typo.titleMedium, color: DS.textPrimary, border: `1px solid ${DS.primaryLight}`, borderRadius: 6, padding: "2px 8px", outline: "none", fontFamily: DS.fontFamily, width: 300 }} />
                    <Btn variant="primary" icon="check" onClick={() => renameFolder(activeFolder.id)} small>OK</Btn>
                  </div>
                ) : (
                  <div style={{ ...typo.titleMedium, color: DS.textPrimary }}>{activeFolder.name}</div>
                )}
                {activeFolder.description && <div style={{ ...typo.bodySmall, color: DS.textSecondary, marginTop: 2 }}>{activeFolder.description}</div>}
              </div>
              <Badge color={DS.primaryDark} bg={DS.primaryLighter} small>{activeFolder.docIds.length} dok.</Badge>
            </div>
            <div style={{ ...S.row, gap: 6 }}>
              <Btn variant="ghost" icon="edit" small onClick={() => { setEditingId(activeFolder.id); setEditName(activeFolder.name); }}>Zmień nazwę</Btn>
              <Btn variant="ghost" icon="x" small onClick={() => deleteFolder(activeFolder.id)} style={{ color: DS.errorMain }}>Usuń folder</Btn>
            </div>
          </div>
          {/* Doc search within folder */}
          <div style={{ marginTop: 12, position: "relative", maxWidth: 340 }}>
            <Icon name="search" size={14} color={DS.textDisabled} style={{ position: "absolute", left: 10, top: 9 }} />
            <input value={folderDocSearch} onChange={e => setFolderDocSearch(e.target.value)}
              placeholder="Filtruj dokumenty w folderze…"
              style={{ width: "100%", padding: "7px 12px 7px 32px", borderRadius: 8, border: `1px solid ${DS.borderLight}`, fontSize: 13, fontFamily: DS.fontFamily, outline: "none" }} />
          </div>
        </div>
        {/* Document list inside folder */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 24px" }}>
          {folderDocs.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, color: DS.textDisabled }}>
              <Icon name="folder" size={40} color={DS.borderLight} />
              <div style={{ marginTop: 12, ...typo.bodyMedium }}>
                {folderDocSearch ? "Brak dokumentów pasujących do wyszukiwania" : "Ten folder jest pusty"}
              </div>
              <div style={{ ...typo.bodySmall, color: DS.textDisabled, marginTop: 4 }}>
                Zaznacz dokumenty w widoku Dokumenty i użyj „Dodaj do folderu"
              </div>
            </div>
          ) : (
            <div style={{ ...S.col, gap: 2 }}>
              {/* Table header */}
              <div style={{ ...S.row, padding: "8px 12px", borderBottom: `1px solid ${DS.borderLight}`, ...typo.labelSmall, color: DS.textSecondary }}>
                <div style={{ width: 90 }}>Typ</div>
                <div style={{ width: 120 }}>Numer</div>
                <div style={{ flex: 1 }}>Przedmiot</div>
                <div style={{ width: 160 }}>Kontrahent</div>
                <div style={{ width: 100 }}>Wartość</div>
                <div style={{ width: 100 }}>Status</div>
                <div style={{ width: 40 }} />
              </div>
              {folderDocs.map(doc => {
                const st = DOC_STATUSES[doc.status] || {};
                const tp = DOC_TYPES[doc.type] || {};
                return (
                  <div key={doc.id} onClick={() => onSelectDoc(doc)}
                    style={{ ...S.row, padding: "10px 12px", borderRadius: 8, cursor: "pointer", transition: "background 0.1s", borderBottom: `1px solid ${DS.borderLight}` }}
                    onMouseEnter={e => e.currentTarget.style.background = DS.neutralLighter}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ width: 90 }}>
                      <Badge color={tp.color || DS.textSecondary} bg={(tp.color || DS.textSecondary) + "14"} small>{tp.label || doc.type}</Badge>
                    </div>
                    <div style={{ width: 120, ...typo.bodySmall, color: DS.textSecondary, fontFamily: "monospace", fontSize: 11 }}>{doc.number || "—"}</div>
                    <div style={{ flex: 1, ...typo.bodySmall, color: DS.textPrimary, ...S.truncate, paddingRight: 12 }}>{doc.title}</div>
                    <div style={{ width: 160, ...typo.bodySmall, color: DS.textSecondary, ...S.truncate }}>{doc.contractor || "—"}</div>
                    <div style={{ width: 100, ...typo.bodySmall, color: DS.textPrimary, fontWeight: 500, textAlign: "right", paddingRight: 12 }}>{doc.grossValue ? formatCurrency(doc.grossValue) : "—"}</div>
                    <div style={{ width: 100 }}>
                      <Badge color={st.color || DS.textSecondary} bg={st.bg || DS.neutralLighter} small>{st.label || doc.status}</Badge>
                    </div>
                    <div style={{ width: 40, ...S.row, justifyContent: "center" }}>
                      <button onClick={e => { e.stopPropagation(); removeDocFromFolder(activeFolder.id, doc.id); }}
                        title="Usuń z folderu" style={{ border: "none", background: "none", cursor: "pointer", padding: 4, borderRadius: 4 }}
                        onMouseEnter={e => e.currentTarget.style.background = DS.errorLighter}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}>
                        <Icon name="x" size={14} color={DS.errorMain} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // FOLDER LIST VIEW (main)
  const filtered = folders.filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ flex: 1, ...S.col, overflow: "hidden" }}>
      {/* Header bar */}
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${DS.borderLight}`, background: DS.neutralWhite, ...S.row, gap: 12, justifyContent: "space-between" }}>
        <div style={{ ...S.row, gap: 12, flex: 1 }}>
          {/* Search */}
          <div style={{ position: "relative", maxWidth: 300, flex: 1 }}>
            <Icon name="search" size={14} color={DS.textDisabled} style={{ position: "absolute", left: 10, top: 9 }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Szukaj folderów…"
              style={{ width: "100%", padding: "7px 12px 7px 32px", borderRadius: 8, border: `1px solid ${DS.borderLight}`, fontSize: 13, fontFamily: DS.fontFamily, outline: "none" }} />
          </div>
          <Badge color={DS.textSecondary} bg={DS.neutralLighter}>{filtered.length} {filtered.length === 1 ? "folder" : "folderów"}</Badge>
        </div>
        <div style={{ ...S.row, gap: 8 }}>
          {/* View toggle */}
          <div style={{ ...S.row, borderRadius: 8, border: `1px solid ${DS.borderLight}`, overflow: "hidden" }}>
            {[{ id: "tiles", icon: "grid" }, { id: "list", icon: "list" }].map(v => (
              <button key={v.id} onClick={() => setViewMode(v.id)} style={{
                padding: "6px 10px", border: "none", cursor: "pointer",
                background: viewMode === v.id ? DS.primaryLighter : DS.neutralWhite,
                color: viewMode === v.id ? DS.primaryDark : DS.textSecondary,
              }}>
                <Icon name={v.icon} size={14} color={viewMode === v.id ? DS.primaryLight : DS.textDisabled} />
              </button>
            ))}
          </div>
          <Btn variant="primary" icon="folderPlus" small onClick={() => setShowCreate(true)}>Nowy folder</Btn>
        </div>
      </div>

      {/* Create folder form */}
      {showCreate && (
        <div style={{ margin: "12px 24px 0", background: DS.neutralLighter, borderRadius: 10, padding: 16, border: `1px solid ${DS.borderLight}` }}>
          <div style={{ ...typo.labelMedium, color: DS.textPrimary, marginBottom: 8 }}>Utwórz nowy folder</div>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nazwa folderu…" autoFocus
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${DS.borderLight}`, fontSize: 13, fontFamily: DS.fontFamily, marginBottom: 8, outline: "none", boxSizing: "border-box" }}
            onKeyDown={e => { if (e.key === "Enter") createFolder(); if (e.key === "Escape") setShowCreate(false); }} />
          <div style={{ ...S.row, gap: 6, marginBottom: 12 }}>
            {COLORS.map(c => (
              <div key={c} onClick={() => setNewColor(c)}
                style={{ width: 24, height: 24, borderRadius: 6, background: c, cursor: "pointer", border: newColor === c ? `2px solid ${DS.textPrimary}` : "2px solid transparent", transition: "border 0.1s" }} />
            ))}
          </div>
          <div style={{ ...S.row, gap: 8 }}>
            <Btn variant="primary" icon="check" onClick={createFolder} small>Utwórz</Btn>
            <Btn variant="ghost" onClick={() => { setShowCreate(false); setNewName(""); }} small>Anuluj</Btn>
          </div>
        </div>
      )}

      {/* Folder list content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48, color: DS.textDisabled }}>
            <Icon name="folder" size={48} color={DS.borderLight} />
            <div style={{ marginTop: 12, ...typo.bodyMedium }}>
              {search ? "Brak folderów pasujących do wyszukiwania" : "Brak folderów — utwórz pierwszy"}
            </div>
          </div>
        ) : viewMode === "tiles" ? (
          /* TILES VIEW */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {filtered.map(folder => {
              const count = folder.docIds.length;
              const folderDocs = folder.docIds.slice(0, 3).map(id => docs.find(d => d.id === id)).filter(Boolean);
              return (
                <div key={folder.id} onClick={() => setActiveFolderId(folder.id)}
                  style={{
                    background: DS.neutralWhite, borderRadius: 12, padding: 16,
                    border: `1px solid ${DS.borderLight}`, cursor: "pointer", transition: "all 0.15s",
                    boxShadow: DS.shadowSm,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = folder.color; e.currentTarget.style.boxShadow = DS.shadowMd; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = DS.borderLight; e.currentTarget.style.boxShadow = DS.shadowSm; }}>
                  <div style={{ ...S.row, gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: folder.color + "18", ...S.row, justifyContent: "center", flexShrink: 0 }}>
                      <Icon name={folder.icon || "folder"} size={20} color={folder.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ ...typo.titleSmall, color: DS.textPrimary, ...S.truncate }}>{folder.name}</div>
                      <div style={{ ...typo.labelSmall, color: DS.textSecondary, marginTop: 2 }}>{count} {count === 1 ? "dokument" : count < 5 ? "dokumenty" : "dokumentów"}</div>
                    </div>
                  </div>
                  {folder.description && <div style={{ ...typo.bodySmall, color: DS.textSecondary, ...S.truncate, marginBottom: 8 }}>{folder.description}</div>}
                  {folderDocs.length > 0 && (
                    <div style={{ ...S.col, gap: 2 }}>
                      {folderDocs.map(doc => (
                        <div key={doc.id} style={{ ...S.row, gap: 6, padding: "3px 0" }}>
                          <div style={{ width: 4, height: 4, borderRadius: 2, background: folder.color, flexShrink: 0, marginTop: 6 }} />
                          <span style={{ ...typo.labelSmall, color: DS.textSecondary, ...S.truncate }}>{doc.title}</span>
                        </div>
                      ))}
                      {count > 3 && <div style={{ ...typo.labelSmall, color: DS.textDisabled, paddingLeft: 10 }}>+{count - 3} więcej…</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div style={{ ...S.col, gap: 2 }}>
            <div style={{ ...S.row, padding: "8px 12px", borderBottom: `1px solid ${DS.borderLight}`, ...typo.labelSmall, color: DS.textSecondary }}>
              <div style={{ width: 36 }} />
              <div style={{ flex: 1 }}>Nazwa folderu</div>
              <div style={{ width: 80, textAlign: "center" }}>Dokumenty</div>
              <div style={{ width: 100 }}>Utworzono</div>
              <div style={{ width: 80 }} />
            </div>
            {filtered.map(folder => (
              <div key={folder.id} onClick={() => setActiveFolderId(folder.id)}
                style={{ ...S.row, padding: "10px 12px", borderRadius: 8, cursor: "pointer", transition: "background 0.1s", borderBottom: `1px solid ${DS.borderLight}` }}
                onMouseEnter={e => e.currentTarget.style.background = DS.neutralLighter}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ width: 36, ...S.row, justifyContent: "center" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: folder.color + "18", ...S.row, justifyContent: "center" }}>
                    <Icon name={folder.icon || "folder"} size={14} color={folder.color} />
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                  <div style={{ ...typo.bodySmall, color: DS.textPrimary, fontWeight: 600, ...S.truncate }}>{folder.name}</div>
                  {folder.description && <div style={{ ...typo.labelSmall, color: DS.textDisabled, ...S.truncate, marginTop: 1 }}>{folder.description}</div>}
                </div>
                <div style={{ width: 80, textAlign: "center" }}>
                  <Badge color={DS.primaryDark} bg={DS.primaryLighter} small>{folder.docIds.length}</Badge>
                </div>
                <div style={{ width: 100, ...typo.labelSmall, color: DS.textSecondary }}>{folder.createdAt ? formatDate(folder.createdAt) : "—"}</div>
                <div style={{ width: 80, ...S.row, gap: 4, justifyContent: "flex-end" }}>
                  <button onClick={e => { e.stopPropagation(); deleteFolder(folder.id); }} title="Usuń folder"
                    style={{ border: "none", background: "none", cursor: "pointer", padding: 4, borderRadius: 4 }}
                    onMouseEnter={e => e.currentTarget.style.background = DS.errorLighter}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <Icon name="trash" size={14} color={DS.errorMain} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   FOLDER PICKER MODAL — select folder to add documents to
   ═══════════════════════════════════════════════════════════════ */
const FolderPickerModal = ({ visible, folders, setFolders, selectedIds, onConfirm, onClose }) => {
  const [pickedFolderId, setPickedFolderId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  if (!visible) return null;

  const handleAdd = () => {
    if (!pickedFolderId) return;
    onConfirm(pickedFolderId);
  };

  const handleCreateAndAdd = () => {
    if (!newName.trim()) return;
    const id = "f" + Date.now();
    setFolders(prev => [...prev, { id, name: newName.trim(), color: "#A971F6", icon: "folder", docIds: [], description: "", createdAt: new Date().toISOString().split("T")[0] }]);
    setNewName(""); setCreating(false);
    setPickedFolderId(id);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(2px)" }} onClick={onClose} />
      <div style={{
        position: "relative", width: 440, maxHeight: "70vh", background: DS.neutralWhite,
        borderRadius: 14, boxShadow: DS.shadowXl, ...S.col, animation: "modalIn 0.2s ease",
      }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${DS.borderLight}`, ...S.row, justifyContent: "space-between" }}>
          <div style={{ ...S.row, gap: 8 }}>
            <Icon name="folder" size={18} color={DS.primaryLight} />
            <span style={{ ...typo.titleSmall, color: DS.textPrimary }}>Dodaj do folderu</span>
            <Badge color={DS.primaryDark} bg={DS.primaryLighter} small>{selectedIds.size} dok.</Badge>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", padding: 4 }}>
            <Icon name="x" size={16} color={DS.textSecondary} />
          </button>
        </div>

        {/* Folder list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px", maxHeight: 340 }}>
          {folders.map(f => (
            <div key={f.id} onClick={() => setPickedFolderId(f.id)}
              style={{
                ...S.row, gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                background: pickedFolderId === f.id ? DS.primaryLighter : "transparent",
                border: `1px solid ${pickedFolderId === f.id ? DS.primaryLight : "transparent"}`,
                transition: "all 0.1s", marginBottom: 2,
              }}
              onMouseEnter={e => { if (pickedFolderId !== f.id) e.currentTarget.style.background = DS.neutralLighter; }}
              onMouseLeave={e => { if (pickedFolderId !== f.id) e.currentTarget.style.background = "transparent"; }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: f.color + "18", ...S.row, justifyContent: "center", flexShrink: 0 }}>
                <Icon name={f.icon || "folder"} size={14} color={f.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...typo.bodySmall, color: DS.textPrimary, fontWeight: 500 }}>{f.name}</div>
                <div style={{ ...typo.labelSmall, color: DS.textDisabled }}>{f.docIds.length} dok.</div>
              </div>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${pickedFolderId === f.id ? DS.primaryLight : DS.borderMedium}`, ...S.row, justifyContent: "center" }}>
                {pickedFolderId === f.id && <div style={{ width: 10, height: 10, borderRadius: "50%", background: DS.primaryLight }} />}
              </div>
            </div>
          ))}

          {/* Create new folder inline */}
          {creating ? (
            <div style={{ padding: "10px 12px", borderRadius: 8, background: DS.neutralLighter, border: `1px solid ${DS.borderLight}`, marginTop: 4 }}>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nazwa nowego folderu…" autoFocus
                onKeyDown={e => { if (e.key === "Enter") handleCreateAndAdd(); if (e.key === "Escape") setCreating(false); }}
                style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: `1px solid ${DS.borderLight}`, fontSize: 13, fontFamily: DS.fontFamily, outline: "none", boxSizing: "border-box" }} />
              <div style={{ ...S.row, gap: 6, marginTop: 8 }}>
                <Btn variant="primary" icon="check" onClick={handleCreateAndAdd} small>Utwórz i dodaj</Btn>
                <Btn variant="ghost" onClick={() => { setCreating(false); setNewName(""); }} small>Anuluj</Btn>
              </div>
            </div>
          ) : (
            <button onClick={() => setCreating(true)}
              style={{ ...S.row, gap: 8, padding: "10px 12px", borderRadius: 8, border: `1px dashed ${DS.borderMedium}`, background: "transparent", cursor: "pointer", width: "100%", color: DS.textSecondary, fontSize: 13, fontFamily: DS.fontFamily, marginTop: 4 }}
              onMouseEnter={e => e.currentTarget.style.background = DS.neutralLighter}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <Icon name="folderPlus" size={14} color={DS.textDisabled} />
              <span>Utwórz nowy folder</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${DS.borderLight}`, ...S.row, gap: 8, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onClose}>Anuluj</Btn>
          <Btn variant="primary" icon="folderPlus" onClick={handleAdd} disabled={!pickedFolderId}>Dodaj do folderu</Btn>
        </div>
      </div>
    </div>
  );
};
