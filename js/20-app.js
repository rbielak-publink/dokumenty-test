/* ═══════════════════════════════════════════════════════════════
   MAIN APP — orchestrating all Iteration 1 features
   ═══════════════════════════════════════════════════════════════ */
const App = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState("all");
  const [docs, setDocs] = useState(INIT_DOCS);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "dateCreated", dir: "desc" });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ status: [], dept: [], assignee: [] });
  const [showSearch, setShowSearch] = useState(false); // Iter 2 — Cmd+K
  const [showOcr, setShowOcr] = useState(false); // Iter 3 — OCR wizard
  const [showExport, setShowExport] = useState(false); // Iter 4 — eksport
  const [folders, setFolders] = useState(INIT_FOLDERS); // Iter 4 — teczki
  const [folderViewMode, setFolderViewMode] = useState("tiles"); // "list" | "tiles"
  const [activeFolderId, setActiveFolderId] = useState(null); // null = folder list, "fX" = folder detail
  const [showFolderPicker, setShowFolderPicker] = useState(false); // Iter 4 — modal dodaj do folderu
  const [folderSearch, setFolderSearch] = useState(""); // search within folders view
  const [ksefInvoices, setKsefInvoices] = useState(INIT_KSEF_INVOICES); // KSeF inbox
  const [selectedKsefInvoice, setSelectedKsefInvoice] = useState(null); // KSeF detail drawer
  const [showSaveView, setShowSaveView] = useState(false); // Iter 5 — modal zapisu widoku
  const [typeFilter, setTypeFilter] = useState(""); // Iter 5 — quick type filter tabs
  const ALL_COLUMNS = [
    { key: "type", label: "Typ" }, { key: "alerts", label: "Alerty" }, { key: "number", label: "Numer" }, { key: "nrEwidencyjny", label: "Nr ewid." }, { key: "title", label: "Przedmiot" },
    { key: "contractor", label: "Kontrahent" }, { key: "assignee", label: "Odpow." }, { key: "dept", label: "Wydział" },
    { key: "dateEnd", label: "Data końca" }, { key: "grossValue", label: "Wartość" },
    { key: "classification", label: "Klasyfik." }, { key: "tags", label: "Tagi" }, { key: "status", label: "Status" },
  ];
  const [visibleColumns, setVisibleColumns] = useState(["type","alerts","number","nrEwidencyjny","title","contractor","dept","grossValue","status"]);

  // Cmd+K global shortcut (Iter 2)
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(prev => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // View tabs state (P3 — system + custom)
  const [viewTabs, setViewTabs] = useState([
    { id: "all", label: "Wszystkie", system: true },
    { id: "w_przygotowaniu", label: "W przygotowaniu", system: true },
    { id: "w_realizacji", label: "W realizacji", system: true },
    { id: "do_weryfikacji", label: "Do weryfikacji", system: true },
    { id: "zakonczone", label: "Zakończone", system: true },
  ]);
  const [activeTab, setActiveTab] = useState("all");

  const filteredDocs = useMemo(() => {
    let result = [...docs];

    // Apply sidebar view
    switch (activeView) {
      case "umowy": result = result.filter(d => d.type === "umowa"); break;
      case "faktury": result = result.filter(d => d.type === "faktura"); break;
      case "zlecenia": result = result.filter(d => d.type === "zlecenie"); break;
      case "inne": result = result.filter(d => d.type === "aneks" || d.type === "inne"); break;
      case "bez_klasyfikacji": result = result.filter(d => !d.classification); break;
      case "z_alertami": result = result.filter(d => d.alerts && d.alerts.length > 0); break;
    }

    // Apply tab filter (on top of sidebar)
    switch (activeTab) {
      case "w_przygotowaniu": result = result.filter(d => d.status === "w_przygotowaniu"); break;
      case "w_realizacji": result = result.filter(d => d.status === "w_realizacji"); break;
      case "do_weryfikacji": result = result.filter(d => d.status === "do_weryfikacji"); break;
      case "zakonczone": result = result.filter(d => d.status === "zakonczone" || d.status === "oplacona"); break;
    }

    // Apply type filter from DocTypeFilterBar
    if (typeFilter) result = result.filter(d => d.type === typeFilter);
    // Apply multiselect filters
    if (filters.status?.length > 0) result = result.filter(d => filters.status.includes(d.status));
    if (filters.dept?.length > 0) result = result.filter(d => filters.dept.includes(d.dept));
    if (filters.assignee?.length > 0) result = result.filter(d => filters.assignee.includes(String(d.assignee)));

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        (d.title || "").toLowerCase().includes(q) ||
        (d.number || "").toLowerCase().includes(q) ||
        (d.contractor || "").toLowerCase().includes(q) ||
        (d.dept || "").toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortConfig.key], bVal = b[sortConfig.key];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortConfig.dir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.dir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [docs, activeView, activeTab, filters, searchQuery, sortConfig, typeFilter]);

  const docCounts = useMemo(() => ({
    all: docs.length,
    umowy: docs.filter(d => d.type === "umowa").length,
    faktury: docs.filter(d => d.type === "faktura").length,
    zlecenia: docs.filter(d => d.type === "zlecenie").length,
    inne: docs.filter(d => d.type === "aneks" || d.type === "inne").length,
    wPrzygotowaniu: docs.filter(d => d.status === "w_przygotowaniu").length,
    wRealizacji: docs.filter(d => d.status === "w_realizacji").length,
    doWeryfikacji: docs.filter(d => d.status === "do_weryfikacji").length,
    zakonczone: docs.filter(d => d.status === "zakonczone" || d.status === "oplacona").length,
    bezKlasyfikacji: docs.filter(d => !d.classification).length,
    zAlertami: docs.filter(d => d.alerts && d.alerts.length > 0).length,
  }), [docs]);

  // Tabs with counts
  const tabsWithCounts = viewTabs.map(t => ({
    ...t,
    count: t.id === "all" ? docs.length
      : t.id === "w_przygotowaniu" ? docCounts.wPrzygotowaniu
      : t.id === "w_realizacji" ? docCounts.wRealizacji
      : t.id === "do_weryfikacji" ? docCounts.doWeryfikacji
      : t.id === "zakonczone" ? docCounts.zakonczone
      : undefined,
    removable: !t.system,
  }));

  const handleSort = (key) => setSortConfig(prev => ({ key, dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc" }));

  const handleUpdateDoc = (docId, key, value) => {
    setDocs(prev => prev.map(d => d.id === docId ? { ...d, [key]: value } : d));
  };

  const handleSave = (formData) => {
    if (formData.id) {
      setDocs(prev => prev.map(d => d.id === formData.id ? { ...d, ...formData } : d));
    } else {
      setDocs(prev => [...prev, { ...formData, id: Math.max(...prev.map(d => d.id)) + 1 }]);
    }
    setShowForm(false);
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSelectAll = (select) => {
    setSelectedIds(select ? new Set(filteredDocs.map(d => d.id)) : new Set());
  };

  const handleAddTab = () => { setShowSaveView(true); };
  const handleSaveView = (name) => {
    const id = "custom_" + Date.now();
    setViewTabs(prev => [...prev, { id, label: name, system: false, removable: true }]);
    setActiveTab(id);
    setShowSaveView(false);
  };

  const handleRemoveTab = (id) => {
    setViewTabs(prev => prev.filter(t => t.id !== id));
    if (activeTab === id) setActiveTab("all");
  };

  const viewLabel = {
    all: "Dokumenty", umowy: "Umowy", faktury: "Faktury",
    zlecenia: "Zlecenia", inne: "Inne dokumenty",
    bez_klasyfikacji: "Bez klasyfikacji", z_alertami: "Z alertami",
    podsumowanie: "Monitor", kontrahenci: "Kontrahenci", foldery: "Foldery",
    ksef: "KSeF — Krajowy System e-Faktur", inwestycje: "Inwestycje", ustawienia: "Ustawienia",
  };

  const filterCount = Object.values(filters).reduce((acc, v) => acc + (Array.isArray(v) ? v.length : (v ? 1 : 0)), 0);
  const hasActiveFilters = filterCount > 0 || !!typeFilter;
  const isDocView = !["podsumowanie","kontrahenci","foldery","ksef","inwestycje","ustawienia"].includes(activeView);

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden",
      fontFamily: DS.fontFamily, color: DS.textPrimary, fontSize: 13,
      WebkitFontSmoothing: "antialiased",
    }}>
      <AppTopBar />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      <Sidebar
        activeView={activeView}
        onViewChange={v => { setActiveView(v); setSelectedDoc(null); setSelectedIds(new Set()); }}
        onOpenCmd={() => setShowSearch(true)}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(p => !p)}
      />

      <div style={{ flex: 1, ...S.col, overflow: "hidden" }}>
        {/* Top bar – only for doc views */}
        {isDocView && <div style={{
          padding: "10px 20px", ...S.row, gap: 12,
          borderBottom: `1px solid ${DS.borderLight}`, background: DS.neutralWhite, minHeight: 52,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ ...typo.titleMedium, color: DS.primaryMain }}>{viewLabel[activeView] || "Dokumenty"}</div>
            <div style={{ ...typo.bodySmall, color: DS.textSecondary }}>
              {filteredDocs.length} {filteredDocs.length === 1 ? "dokument" : filteredDocs.length < 5 ? "dokumenty" : "dokumentów"}
              {searchQuery && ` • "${searchQuery}"`}
            </div>
          </div>
          <div onClick={() => setShowSearch(true)} style={{
            ...S.row, gap: 8, padding: "7px 12px",
            border: `1px solid ${DS.borderLight}`, borderRadius: 8, width: 260,
            cursor: "pointer", background: DS.neutralWhite, transition: "border-color 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = DS.primaryLight}
            onMouseLeave={e => e.currentTarget.style.borderColor = DS.borderLight}
          >
            <Icon name="search" size={14} color={DS.textDisabled} />
            <span style={{ ...typo.bodySmall, color: DS.textDisabled, flex: 1 }}>Szukaj dokumentów...</span>
            <kbd style={{
              ...typo.labelSmall, padding: "1px 5px", borderRadius: 4,
              border: `1px solid ${DS.borderLight}`, color: DS.textDisabled, background: DS.neutralLighter, fontSize: 10,
            }}>⌘K</kbd>
          </div>
          <Btn variant="secondary" icon="download" onClick={() => setShowExport(true)} small>Eksport</Btn>
          <Btn variant="accent" icon="plus" onClick={() => setShowForm(true)}>Nowy dokument</Btn>
        </div>}

        {/* View tabs (P3) */}
        {isDocView && (
          <ViewTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={tabsWithCounts}
            onAddTab={handleAddTab}
            onRemoveTab={handleRemoveTab}
          />
        )}

        {/* Doc type filter bar (Iter 5) */}
        {isDocView && (
          <DocTypeFilterBar
            activeType={typeFilter}
            onTypeChange={setTypeFilter}
            filterCount={filterCount}
            onToggleFilters={() => setShowFilters(p => !p)}
            showFilters={showFilters}
            allColumns={ALL_COLUMNS}
            visibleColumns={visibleColumns}
            onColumnsChange={setVisibleColumns}
          />
        )}

        {/* Filter panel (slides under) */}
        {isDocView && <FilterBar filters={filters} onFiltersChange={setFilters} visible={showFilters} onToggle={() => setShowFilters(p => !p)} />}
        {isDocView && <FilterSummary filters={filters} typeFilter={typeFilter} />}

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {activeView === "podsumowanie" ? (
            <SkarbnikSummary docs={docs}
              onSelectDoc={doc => { setSelectedDoc(doc); setShowForm(false); }}
              onNavigateFiltered={(type, filterOverrides) => {
                setTypeFilter(type || "");
                if (filterOverrides) {
                  setFilters(prev => ({ ...prev, ...filterOverrides }));
                }
                setActiveView("all");
              }}
            />
          ) : activeView === "kontrahenci" ? (
            <ContractorsView docs={docs} onSelectDoc={doc => { setSelectedDoc(doc); setActiveView("all"); }} />
          ) : activeView === "foldery" ? (
            <FoldersView folders={folders} setFolders={setFolders} docs={docs}
              onSelectDoc={doc => { setSelectedDoc(doc); setActiveView("all"); }}
              activeFolderId={activeFolderId} setActiveFolderId={setActiveFolderId}
              viewMode={folderViewMode} setViewMode={setFolderViewMode}
              search={folderSearch} setSearch={setFolderSearch} />
          ) : activeView === "ksef" ? (
            <KsefView
              invoices={ksefInvoices}
              setInvoices={setKsefInvoices}
              onSelectInvoice={inv => setSelectedKsefInvoice(inv)}
            />
          ) : ["inwestycje", "ustawienia"].includes(activeView) ? (
            <div style={{ flex: 1, ...S.row, justifyContent: "center", ...S.col, gap: 12 }}>
              <Icon name={activeView === "inwestycje" ? "trendingUp" : "settings"} size={40} color={DS.neutralMain} />
              <div style={{ ...typo.titleMedium, color: DS.textSecondary }}>{viewLabel[activeView]}</div>
              <div style={{ ...typo.bodySmall, color: DS.textDisabled }}>Moduł w przygotowaniu</div>
            </div>
          ) : (
            <DocTable
              docs={filteredDocs}
              onSelectDoc={doc => { setSelectedDoc(doc); setShowForm(false); }}
              onInlineAdd={() => setShowForm(true)}
              selectedId={selectedDoc?.id}
              sortConfig={sortConfig}
              onSort={handleSort}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onOpenExport={() => setShowExport(true)}
              onOpenFolders={() => setShowFolderPicker(true)}
              visibleColumns={visibleColumns}
              multiSelectMode={multiSelectMode}
              onToggleMultiSelect={() => { setMultiSelectMode(m => !m); if (multiSelectMode) setSelectedIds(new Set()); }}
              onUpdateDoc={handleUpdateDoc}
            />
          )}
          {selectedDoc && !showForm && (
            <DrawerDetail
              doc={selectedDoc}
              onClose={() => setSelectedDoc(null)}
              onSave={handleSave}
            />
          )}
        </div>
      </div>

      {/* Cmd+K Global Search (Iter 2) */}
      <GlobalSearchModal
        visible={showSearch}
        onClose={() => setShowSearch(false)}
        docs={docs}
        onSelectDoc={doc => { setSelectedDoc(doc); setShowSearch(false); setShowForm(false); }}
      />

      {/* Export Modal (Iter 4) */}
      <ExportModal
        visible={showExport}
        onClose={() => setShowExport(false)}
        docs={filteredDocs}
        selectedIds={selectedIds}
      />

      {/* Folder Picker Modal (Iter 4) */}
      <FolderPickerModal
        visible={showFolderPicker}
        folders={folders}
        setFolders={setFolders}
        selectedIds={selectedIds}
        onConfirm={(folderId) => {
          setFolders(prev => prev.map(f => {
            if (f.id !== folderId) return f;
            const newDocIds = [...f.docIds];
            selectedIds.forEach(id => { if (!newDocIds.includes(id)) newDocIds.push(id); });
            return { ...f, docIds: newDocIds };
          }));
          setShowFolderPicker(false);
          setSelectedIds(new Set());
          setMultiSelectMode(false);
        }}
        onClose={() => setShowFolderPicker(false)}
      />

      {/* KSeF Invoice Detail Drawer */}
      {selectedKsefInvoice && (
        <KsefInvoiceDrawer
          invoice={selectedKsefInvoice}
          onClose={() => setSelectedKsefInvoice(null)}
        />
      )}

      {/* Save View Modal (Iter 5) */}
      <SaveViewModal
        open={showSaveView}
        onClose={() => setShowSaveView(false)}
        onSave={handleSaveView}
        filters={filters}
        visibleColumns={visibleColumns}
        allColumns={ALL_COLUMNS}
      />

      {/* New/edit document modal */}
      {showForm && (
        <DocFormModal
          onClose={() => setShowForm(false)}
          onSave={handleSave}
          docs={docs}
        />
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes modalIn { from { opacity: 0; transform: translateY(-16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow: hidden; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${DS.neutralMain}; border-radius: 3px; }
        input, select, textarea, button { font-family: ${DS.fontFamily}; }
        input:focus, select:focus, textarea:focus { border-color: ${DS.primaryLight} !important; }
      `}</style>
    </div>
    </div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return React.createElement("pre", {style:{padding:20,color:"red",whiteSpace:"pre-wrap"}}, "ERROR: " + this.state.error.message + "\n\n" + this.state.error.stack);
    return this.props.children;
  }
}
ReactDOM.createRoot(document.getElementById("root")).render(<ErrorBoundary><App /></ErrorBoundary>);
