/* ═══════════════════════════════════════════════════════════════
   CONTRACTORS VIEW — list of contractors with linked docs (Iter 3)
   ═══════════════════════════════════════════════════════════════ */
const ContractorsView = ({ docs, onSelectDoc }) => {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  const contractors = useMemo(() => {
    const map = {};
    docs.forEach(d => {
      if (!d.contractor) return;
      if (!map[d.contractor]) map[d.contractor] = { name: d.contractor, docs: [], totalGross: 0 };
      map[d.contractor].docs.push(d);
      map[d.contractor].totalGross += d.grossValue || 0;
    });
    let list = Object.values(map).sort((a, b) => b.totalGross - a.totalGross);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q));
    }
    return list;
  }, [docs, search]);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", background: DS.neutralLighter }}>
      <div style={{ ...S.row, justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ ...typo.titleLarge, color: DS.primaryMain }}>Kontrahenci</div>
          <div style={{ ...typo.bodySmall, color: DS.textSecondary }}>{contractors.length} kontrahentów z dokumentami</div>
        </div>
        <div style={{ width: 260 }}>
          <Input value={search} onChange={setSearch} placeholder="Szukaj kontrahenta..." icon="search" />
        </div>
      </div>

      {contractors.map(c => (
        <div key={c.name} style={{
          background: DS.neutralWhite, borderRadius: 10, border: `1px solid ${DS.borderLight}`,
          marginBottom: 10, overflow: "hidden", transition: "box-shadow 0.15s",
          boxShadow: expanded === c.name ? DS.shadowMd : "none",
        }}>
          {/* Contractor header */}
          <div onClick={() => setExpanded(expanded === c.name ? null : c.name)} style={{
            ...S.row, gap: 12, padding: "14px 18px",
            cursor: "pointer", transition: "background 0.1s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = DS.neutralLighter}
            onMouseLeave={e => e.currentTarget.style.background = DS.neutralWhite}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10, ...S.row, justifyContent: "center",
              background: DS.primaryLighter, flexShrink: 0,
            }}>
              <Icon name="users" size={18} color={DS.primaryMain} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...typo.bodyMedium, fontWeight: 600, color: DS.textPrimary }}>{c.name}</div>
              <div style={{ ...typo.bodySmall, color: DS.textSecondary }}>
                {c.docs.length} {c.docs.length === 1 ? "dokument" : c.docs.length < 5 ? "dokumenty" : "dokumentów"}
                {" · "}{formatCurrency(c.totalGross)}
              </div>
            </div>
            <Icon name={expanded === c.name ? "chevronDown" : "chevronRight"} size={16} color={DS.textDisabled} />
          </div>

          {/* Expanded doc list */}
          {expanded === c.name && (
            <div style={{ borderTop: `1px solid ${DS.borderLight}`, padding: "4px 0" }}>
              {c.docs.map(doc => {
                const typeInfo = DOC_TYPES[doc.type] || DOC_TYPES.inne;
                const statusInfo = DOC_STATUSES[doc.status] || DOC_STATUSES.draft;
                return (
                  <div key={doc.id} onClick={() => onSelectDoc(doc)} style={{
                    ...S.row, gap: 10, padding: "10px 18px 10px 66px",
                    cursor: "pointer", transition: "background 0.1s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = DS.primaryLighter}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{ ...S.row, gap: 4, ...typo.labelSmall, color: DS.textSecondary }}><Icon name={typeInfo.icon} size={12} color={DS.neutralMain} />{typeInfo.label}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ ...typo.bodySmall, fontWeight: 500, color: DS.textPrimary, ...S.truncate }}>
                        {doc.title}
                      </div>
                      {doc.number && <div style={{ ...typo.labelSmall, color: DS.textDisabled, fontFamily: "monospace" }}>{doc.number}</div>}
                    </div>
                    <Badge color={statusInfo.color} bg={statusInfo.bg} small>{statusInfo.label}</Badge>
                    <span style={{ ...typo.bodySmall, color: DS.textSecondary, fontVariantNumeric: "tabular-nums", width: 90, textAlign: "right" }}>
                      {doc.grossValue ? formatCurrency(doc.grossValue) : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {contractors.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 20px" }}>
          <Icon name="users" size={48} color={DS.neutralLight} style={{ margin: "0 auto 12px", display: "block" }} />
          <div style={{ ...typo.titleSmall, color: DS.textSecondary }}>Brak kontrahentów</div>
          <div style={{ ...typo.bodySmall, color: DS.textDisabled, marginTop: 4 }}>Nie znaleziono kontrahentów pasujących do wyszukiwania</div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   APP TOP BAR — global application bar (stub)
   ═══════════════════════════════════════════════════════════════ */
const AppTopBar = () => {
  const [orgHover, setOrgHover] = useState(false);
  return (
    <div style={{
      ...S.rowBetween, height: 44, padding: "0 16px",
      background: DS.neutralWhite, color: DS.textPrimary, flexShrink: 0,
      borderBottom: `1px solid ${DS.borderLight}`,
    }}>
      <div style={{ ...S.row, gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: `linear-gradient(135deg, ${DS.primaryMain}, ${DS.accentUmowyMain})`,
          ...S.row, justifyContent: "center", alignItems: "center", flexShrink: 0,
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>eP</span>
        </div>
        <span style={{ fontWeight: 600, fontSize: 14, color: DS.primaryMain, letterSpacing: "-0.01em" }}>ePublink Dokumenty</span>
      </div>
      <div style={{ ...S.row, gap: 4 }}>
        <div
          onMouseEnter={() => setOrgHover(true)}
          onMouseLeave={() => setOrgHover(false)}
          style={{
            ...S.row, gap: 6, padding: "5px 10px", borderRadius: 6,
            border: `1px solid ${orgHover ? DS.borderMedium : DS.borderLight}`,
            background: orgHover ? DS.neutralLighter : DS.neutralWhite,
            cursor: "default", transition: "all 0.15s",
          }}
          title="Struktura organizacyjna (wkrótce)"
        >
          <Icon name="building" size={13} color={DS.textSecondary} />
          <span style={{ ...typo.bodySmall, color: DS.textSecondary, fontWeight: 500 }}>Gmina Przykładów</span>
          <Icon name="chevR" size={10} color={DS.textDisabled} />
        </div>
        <button style={{
          width: 32, height: 32, borderRadius: 6, border: "none",
          background: "transparent", cursor: "pointer", ...S.row,
          justifyContent: "center", alignItems: "center",
        }} title="Powiadomienia">
          <Icon name="bell" size={16} color={DS.textSecondary} />
        </button>
        <button style={{
          width: 32, height: 32, borderRadius: 6, border: "none",
          background: "transparent", cursor: "pointer", ...S.row,
          justifyContent: "center", alignItems: "center",
        }} title="Pomoc">
          <Icon name="help" size={16} color={DS.textSecondary} />
        </button>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: DS.accentUmowyLighter, ...S.row,
          justifyContent: "center", alignItems: "center",
          marginLeft: 4,
        }} title="Jan Kowalski">
          <span style={{ fontSize: 11, fontWeight: 600, color: DS.accentUmowyDark }}>JK</span>
        </div>
      </div>
    </div>
  );
};
