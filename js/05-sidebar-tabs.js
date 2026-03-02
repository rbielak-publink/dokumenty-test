/* ═══════════════════════════════════════════════════════════════
   SIDEBAR — enhanced with working views + counters (P1/P4)
   ═══════════════════════════════════════════════════════════════ */
const Sidebar = ({ activeView, onViewChange, onOpenCmd, collapsed, onToggle }) => {
  const w = collapsed ? 56 : 220;
  const NavItem = ({ id, label, icon }) => {
    const active = activeView === id;
    return (
      <button onClick={() => onViewChange(id)} title={collapsed ? label : undefined} style={{
        ...S.row, gap: 10, width: "100%",
        padding: collapsed ? "9px 0" : "9px 14px",
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: 8, border: "none", cursor: "pointer", fontFamily: DS.fontFamily,
        background: active ? DS.primaryLighter : "transparent",
        color: active ? DS.primaryMain : DS.textSecondary,
        fontSize: 13, fontWeight: active ? 600 : 400,
        transition: "all 0.15s", textAlign: "left",
      }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = DS.neutralLighter; }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
      >
        <Icon name={icon} size={18} color={active ? DS.primaryMain : DS.neutralMain} />
        {!collapsed && <span>{label}</span>}
      </button>
    );
  };

  return (
    <div style={{
      width: w, minWidth: w, background: DS.neutralWhite,
      borderRight: `1px solid ${DS.borderLight}`,
      ...S.col, transition: "width 0.2s, min-width 0.2s", overflow: "hidden",
    }}>
      {/* Search trigger */}
      {!collapsed ? (
        <div style={{ padding: "8px 10px 2px" }}>
          <button onClick={onOpenCmd} style={{
            ...S.row, gap: 8, width: "100%", padding: "7px 10px",
            borderRadius: 8, border: `1px solid ${DS.borderLight}`,
            background: DS.neutralLighter, cursor: "pointer",
            color: DS.textDisabled, fontSize: 12, fontFamily: DS.fontFamily,
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = DS.accentUmowyLight}
            onMouseLeave={e => e.currentTarget.style.borderColor = DS.borderLight}
          >
            <Icon name="search" size={14} color={DS.textDisabled} />
            <span style={{ flex: 1, textAlign: "left" }}>Szukaj...</span>
            <kbd style={{
              ...typo.labelSmall, padding: "1px 5px", borderRadius: 4, fontSize: 10,
              border: `1px solid ${DS.borderLight}`, color: DS.textDisabled, background: DS.neutralWhite,
            }}>Ctrl K</kbd>
          </button>
        </div>
      ) : (
        <div style={{ padding: "8px 0 2px", ...S.row, justifyContent: "center" }}>
          <button onClick={onOpenCmd} title="Szukaj (Ctrl K)" style={{
            width: 34, height: 34, borderRadius: 8, border: `1px solid ${DS.borderLight}`,
            background: DS.neutralLighter, cursor: "pointer", ...S.row, justifyContent: "center", padding: 0,
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = DS.accentUmowyLight}
            onMouseLeave={e => e.currentTarget.style.borderColor = DS.borderLight}
          >
            <Icon name="search" size={14} color={DS.textDisabled} />
          </button>
        </div>
      )}

      {/* Main navigation */}
      <div style={{ flex: 1, overflowY: "auto", padding: collapsed ? "6px 6px" : "6px 10px", ...S.col, gap: 2 }}>
        <NavItem id="podsumowanie" label="Monitor" icon="barChart" />
        <NavItem id="all" label="Dokumenty" icon="file" />
        <NavItem id="ksef" label="KSeF" icon="inbox" />
        <NavItem id="kontrahenci" label="Kontrahenci" icon="users" />
        <NavItem id="foldery" label="Foldery" icon="folder" />
        <NavItem id="inwestycje" label="Inwestycje" icon="trendingUp" />
        <NavItem id="ustawienia" label="Ustawienia" icon="settings" />
      </div>

      {/* Footer + collapse toggle */}
      <div style={{ borderTop: `1px solid ${DS.borderLight}`, padding: collapsed ? "8px 6px" : "8px 10px", ...S.col, gap: 6 }}>
        {!collapsed && <div style={{ padding: "4px 4px" }}>
          <div style={{ ...typo.labelSmall, color: DS.textDisabled }}>Gmina Publink</div>
          <div style={{ fontSize: 10, color: DS.neutralMain }}>Urząd Gminy · skarbnik</div>
        </div>}
        <button onClick={onToggle} title={collapsed ? "Rozwiń menu" : "Zwiń menu"} style={{
          ...S.row, justifyContent: "center", width: "100%", padding: 6,
          borderRadius: 6, border: "none", background: "transparent",
          cursor: "pointer", color: DS.textDisabled, transition: "background 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = DS.neutralLighter}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <Icon name={collapsed ? "chevronRight" : "chevronLeft"} size={16} />
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   VIEW TABS — system (non-deletable) + user custom (P3)
   ═══════════════════════════════════════════════════════════════ */
const ViewTabs = ({ activeTab, onTabChange, tabs, onAddTab, onRemoveTab }) => (
  <div style={{
    ...S.row, gap: 2, padding: "0 16px",
    borderBottom: `1px solid ${DS.borderLight}`, background: DS.neutralWhite,
    minHeight: 38, overflowX: "auto",
  }}>
    {tabs.map(tab => {
      const active = activeTab === tab.id;
      return (
        <button key={tab.id} onClick={() => onTabChange(tab.id)} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 14px", border: "none", borderRadius: 0,
          borderBottom: active ? `2px solid ${DS.accentUmowyMain}` : "2px solid transparent",
          background: "transparent", cursor: "pointer", fontFamily: DS.fontFamily,
          fontSize: 13, fontWeight: active ? 600 : 400,
          color: active ? DS.primaryMain : DS.textSecondary,
          whiteSpace: "nowrap", transition: "all 0.15s",
        }}
          onMouseEnter={e => { if (!active) e.currentTarget.style.color = DS.textPrimary; }}
          onMouseLeave={e => { if (!active) e.currentTarget.style.color = active ? DS.primaryMain : DS.textSecondary; }}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span style={{
              ...typo.labelSmall, padding: "0 5px", ...S.pill,
              background: active ? DS.accentUmowyLighter : DS.neutralLighter,
              color: active ? DS.accentUmowyDark : DS.textDisabled,
            }}>{tab.count}</span>
          )}
          {tab.removable && active && (
            <span onClick={e => { e.stopPropagation(); onRemoveTab(tab.id); }} style={{
              marginLeft: 2, cursor: "pointer", display: "inline-flex",
              padding: 2, borderRadius: 4,
            }}
              onMouseEnter={e => e.currentTarget.style.background = DS.errorLighter}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <Icon name="x" size={11} color={DS.textDisabled} />
            </span>
          )}
        </button>
      );
    })}
    <button onClick={onAddTab} title="Dodaj widok" style={{
      display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 10px",
      border: `1px dashed ${DS.borderLight}`, borderRadius: 6,
      background: "transparent", cursor: "pointer", fontFamily: DS.fontFamily,
      fontSize: 12, color: DS.textDisabled, marginLeft: 4, transition: "all 0.15s",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = DS.accentUmowyLight; e.currentTarget.style.color = DS.accentUmowyMain; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = DS.borderLight; e.currentTarget.style.color = DS.textDisabled; }}
    >
      <Icon name="plus" size={12} />Dodaj widok
    </button>
  </div>
);
