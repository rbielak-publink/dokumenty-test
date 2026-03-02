/* ═══════════════════════════════════════════════════════════════
   DATA DEFINITIONS
   ═══════════════════════════════════════════════════════════════ */
const DOC_TYPES = {
  umowa: { label: "Umowa", color: DS.primaryLight, bg: DS.primaryLighter, icon: "file" },
  faktura: { label: "Faktura", color: "#0A7BE5", bg: "#E0EEFF", icon: "receipt" },
  zlecenie: { label: "Zlecenie", color: "#E5850A", bg: "#FFF4E0", icon: "zap" },
  aneks: { label: "Aneks", color: "#7C3AED", bg: "#F0E7FF", icon: "gitBranch" },
  inne: { label: "Inne", color: DS.neutralDark, bg: DS.neutralLighter, icon: "file" },
  zalacznik: { label: "Załącznik", color: "#0EA5E9", bg: "#E0F2FE", icon: "paperclip" },
};

const DOC_STATUSES = {
  draft: { label: "Szkic", color: DS.textDisabled, bg: DS.disabledLighter },
  aktywny: { label: "Aktywny", color: DS.successDark, bg: DS.successLighter },
  do_kontrasygnaty: { label: "Do kontrasygnaty", color: DS.warningDark, bg: DS.warningLighter },
  do_zatwierdzenia: { label: "Do zatwierdzenia", color: DS.infoDark, bg: DS.infoLighter },
  zatwierdzony: { label: "Zatwierdzony", color: DS.successDark, bg: DS.successLighter },
  archiwalny: { label: "Archiwalny", color: DS.neutralDark, bg: DS.neutralLighter },
  anulowany: { label: "Anulowany", color: DS.errorDark, bg: DS.errorLighter },
};

// Alert types — extracted to dedicated column
const ALERT_TYPES = {
  ZA: { label: "Do zaangażowania — dokument wymaga zaangażowania środków budżetowych", icon: "coins", color: "#4A7EBF", bg: "#EBF2FA" },
  KT: { label: "Kończący się termin — umowa 30 dni, faktura 7 dni przed terminem", icon: "clock", color: "#B8960C", bg: "#FDF6E3" },
  WU: { label: "Wymaga uzupełnienia — brakuje wymaganych danych dokumentu", icon: "alert", color: "#8C8C8C", bg: "#F3F3F3" },
};

// Auto-detect alerts from doc data
const computeAlerts = (doc) => {
  const alerts = [];
  const today = new Date();
  // WU: brakuje wymaganych danych (numer, contractor, classification, grossValue)
  if (!doc.number || !doc.contractor || !doc.classification || !doc.grossValue) alerts.push("WU");
  // KT: kończący się termin — 30 dni dla umowy, 7 dni dla faktury
  if (doc.dateEnd) {
    const end = new Date(doc.dateEnd);
    const daysLeft = Math.ceil((end - today) / 86400000);
    const threshold = (doc.type === "faktura") ? 7 : 30;
    if (daysLeft >= 0 && daysLeft <= threshold) alerts.push("KT");
  }
  // ZA: do zaangażowania — aktywny dokument z kwotą ale bez zaangażowania (zlecenie/umowa)
  if ((doc.type === "zlecenie" || doc.type === "umowa") && doc.grossValue > 0 && doc.status === "aktywny" && !doc.engaged) alerts.push("ZA");
  return [...new Set([...(doc.alerts || []).filter(a => a !== "KS"), ...alerts])];
};

const DEPARTMENTS = ["Wydział Finansowy", "Wydział Infrastruktury", "Wydział Oświaty", "Wydział Środowiska", "Wydział Organizacyjny"];
const USERS_LIST = [
  { id: 1, name: "Anna Kowalska", initials: "AK", dept: "Wydział Finansowy" },
  { id: 2, name: "Jan Nowak", initials: "JN", dept: "Wydział Infrastruktury" },
  { id: 3, name: "Maria Wiśniewska", initials: "MW", dept: "Wydział Oświaty" },
  { id: 4, name: "Piotr Zieliński", initials: "PZ", dept: "Wydział Środowiska" },
  { id: 5, name: "Zuzanna Jędrzejewska", initials: "ZJ", dept: "Wydział Organizacyjny" },
];

const CLASSIFICATIONS = [
  { code: "600-60016-4270", label: "Drogi publiczne gminne — remonty", budget: 2500000, used: 1875000 },
  { code: "750-75023-4300", label: "Urzędy gmin — zakup usług", budget: 800000, used: 520000 },
  { code: "801-80101-4210", label: "Szkoły podstawowe — materiały", budget: 350000, used: 105000 },
  { code: "900-90003-4300", label: "Oczyszczanie — zakup usług", budget: 1200000, used: 960000 },
  { code: "921-92109-4270", label: "Domy i ośrodki kultury — remonty", budget: 450000, used: 180000 },
];

const TAGS = [
  { id: "pilne", label: "Pilne", color: DS.errorMain },
  { id: "inwestycja", label: "Inwestycja", color: DS.primaryLight },
  { id: "dotacja", label: "Dotacja", color: DS.successMain },
  { id: "przetarg", label: "Przetarg", color: DS.infoMain },
  { id: "ksef", label: "KSeF", color: "#7C3AED" },
  { id: "wieloletnia", label: "Wieloletnia", color: DS.warningMain },
];

const CONTRACTORS = [
  "BudDrog Sp. z o.o.", "EduSerwis Polska S.A.", "GreenTech Ochrona Środowiska",
  "InfraBud S.A.", "IT Solutions Sp. z o.o.", "Kancelaria Prawna Nowakowski",
  "MediCare Sp. z o.o.", "OdpadyCo Sp. z o.o.", "TransGmina Sp. z o.o.",
  "ZielonaEnergia Sp. z o.o.",
];

const INIT_DOCS = [
  { id: 1, type: "umowa", status: "aktywny", title: "Remont drogi gminnej ul. Lipowa", number: "UM/2025/001", nrEwidencyjny: "CRU 1/2026", rodzajUmowy: "wydatkowa", contractor: "BudDrog Sp. z o.o.", dept: "Wydział Infrastruktury", assignee: 2, netValue: 425000, grossValue: 522750, classification: "600-60016-4270", dateCreated: "2025-01-15", dateStart: "2025-02-01", dateEnd: "2025-06-30", tags: ["inwestycja"], alerts: ["KT"], notes: "Termin realizacji do końca czerwca", history: [
    { date: "2025-01-15", user: "Anna Kowalska", action: "Utworzenie dokumentu", details: "Nowa umowa — wersja robocza" },
    { date: "2025-01-17", user: "Marek Wiśniewski", action: "Zmiana statusu", details: "draft → do_kontrasygnaty" },
    { date: "2025-01-20", user: "Ewa Nowak", action: "Kontrasygnata skarbnika", details: "Zatwierdzono budżet 522 750 PLN" },
    { date: "2025-02-01", user: "Anna Kowalska", action: "Zmiana statusu", details: "do_kontrasygnaty → aktywny" },
  ] },
  { id: 2, type: "faktura", status: "do_kontrasygnaty", title: "Faktura za usługi IT — styczeń", number: "FV/2025/042", nrEwidencyjny: "REF 1/2026", rodzajUmowy: "wydatkowa", contractor: "IT Solutions Sp. z o.o.", dept: "Wydział Organizacyjny", assignee: 5, netValue: 12500, grossValue: 15375, classification: "750-75023-4300", dateCreated: "2025-02-01", tags: ["ksef"], alerts: [], notes: "" },
  { id: 3, type: "umowa", status: "do_kontrasygnaty", title: "Dostawa materiałów dydaktycznych", number: "UM/2025/008", nrEwidencyjny: "CRU 2/2026", rodzajUmowy: "wydatkowa", contractor: "EduSerwis Polska S.A.", dept: "Wydział Oświaty", assignee: 3, netValue: 67800, grossValue: 83394, classification: "801-80101-4210", dateCreated: "2025-01-28", dateStart: "2025-02-15", dateEnd: "2025-12-31", tags: ["przetarg"], alerts: [], notes: "", history: [
    { date: "2025-01-28", user: "Piotr Zieliński", action: "Utworzenie dokumentu", details: "Rejestracja umowy z przetargu" },
    { date: "2025-01-30", user: "Anna Kowalska", action: "Edycja wartości", details: "Zmiana kwoty netto: 65 000 → 67 800 PLN" },
    { date: "2025-02-01", user: "Piotr Zieliński", action: "Zmiana statusu", details: "draft → do_kontrasygnaty" },
  ] },
  { id: 4, type: "zlecenie", status: "aktywny", title: "Odbiór odpadów wielkogabarytowych — luty", number: "ZL/2025/015", nrEwidencyjny: "RZ 1/2026", rodzajUmowy: "wydatkowa", contractor: "OdpadyCo Sp. z o.o.", dept: "Wydział Środowiska", assignee: 4, netValue: 28000, grossValue: 34440, classification: "900-90003-4300", dateCreated: "2025-02-03", tags: [], alerts: ["ZA"], notes: "" },
  { id: 5, type: "umowa", status: "draft", title: "Modernizacja oświetlenia ul. Parkowa", number: "", nrEwidencyjny: "", rodzajUmowy: "wydatkowa", contractor: "ZielonaEnergia Sp. z o.o.", dept: "Wydział Infrastruktury", assignee: 2, netValue: 185000, grossValue: 227550, classification: "", dateCreated: "2025-02-05", tags: ["inwestycja", "dotacja"], alerts: ["WU"], notes: "Czeka na decyzję o dofinansowaniu", history: [
    { date: "2025-02-05", user: "Marek Wiśniewski", action: "Utworzenie dokumentu", details: "Wersja robocza — brak klasyfikacji" },
  ] },
  { id: 6, type: "faktura", status: "zatwierdzony", title: "Faktura za energię — styczeń 2025", number: "FV/2025/039", nrEwidencyjny: "REF 2/2026", rodzajUmowy: "wydatkowa", contractor: "ZielonaEnergia Sp. z o.o.", dept: "Wydział Organizacyjny", assignee: 1, netValue: 8400, grossValue: 10332, classification: "750-75023-4300", dateCreated: "2025-01-20", tags: ["ksef"], alerts: [], notes: "" },
  { id: 7, type: "aneks", status: "do_zatwierdzenia", title: "Aneks nr 2 — drogi Lipowa (zmiana terminu)", number: "AN/2025/002", nrEwidencyjny: "AN 1/2026", rodzajUmowy: "wydatkowa", contractor: "BudDrog Sp. z o.o.", dept: "Wydział Infrastruktury", assignee: 2, netValue: 0, grossValue: 0, classification: "600-60016-4270", dateCreated: "2025-02-06", tags: [], alerts: [], notes: "Przesunięcie terminu o 3 miesiące" },
  { id: 8, type: "umowa", status: "aktywny", title: "Obsługa prawna gminy 2025", number: "UM/2025/003", nrEwidencyjny: "CRU 3/2026", rodzajUmowy: "wydatkowa", contractor: "Kancelaria Prawna Nowakowski", dept: "Wydział Organizacyjny", assignee: 5, netValue: 96000, grossValue: 118080, classification: "750-75023-4300", dateCreated: "2025-01-10", dateStart: "2025-01-01", dateEnd: "2025-12-31", tags: ["wieloletnia"], alerts: [], notes: "" },
  { id: 9, type: "zlecenie", status: "draft", title: "Remont dachu Domu Kultury", number: "", nrEwidencyjny: "", rodzajUmowy: "wydatkowa", contractor: "", dept: "Wydział Infrastruktury", assignee: 2, netValue: 0, grossValue: 0, classification: "921-92109-4270", dateCreated: "2025-02-07", tags: [], alerts: ["WU"], notes: "Wstępna wycena w trakcie" },
  { id: 10, type: "faktura", status: "do_kontrasygnaty", title: "Transport pracowników — luty", number: "FV/2025/055", nrEwidencyjny: "REF 3/2026", rodzajUmowy: "wydatkowa", contractor: "TransGmina Sp. z o.o.", dept: "Wydział Organizacyjny", assignee: 1, netValue: 5200, grossValue: 6396, classification: "750-75023-4300", dateCreated: "2025-02-08", tags: [], alerts: [], notes: "" },
];

// --- CHILD DOCUMENTS (hierarchical structure) ---
// Types: faktura, aneks, zalacznik (attachment), plik (file)
const CHILD_DOCS = {
  1: [ // Umowa: Remont drogi gminnej ul. Lipowa
    { id: "c1-1", parentId: 1, childType: "faktura", type: "faktura", title: "Faktura zaliczkowa — roboty ziemne", number: "FV/2025/078", contractor: "BudDrog Sp. z o.o.", grossValue: 104550, status: "zatwierdzony", dateCreated: "2025-03-10" },
    { id: "c1-2", parentId: 1, childType: "faktura", type: "faktura", title: "Faktura częściowa — nawierzchnia", number: "FV/2025/112", contractor: "BudDrog Sp. z o.o.", grossValue: 209100, status: "do_zatwierdzenia", dateCreated: "2025-04-15" },
    { id: "c1-3", parentId: 1, childType: "aneks", type: "aneks", title: "Aneks nr 1 — zmiana harmonogramu", number: "AN/2025/001", contractor: "BudDrog Sp. z o.o.", grossValue: 0, status: "aktywny", dateCreated: "2025-03-20" },
    { id: "c1-4", parentId: 1, childType: "zalacznik", type: "inne", title: "Protokół odbioru robót etap I", number: "ZAŁ/1/1", grossValue: null, status: "aktywny", dateCreated: "2025-04-01", fileName: "protokol_odbioru_etap1.pdf", fileSize: "2.1 MB" },
    { id: "c1-5", parentId: 1, childType: "plik", type: "inne", title: "Umowa — skan podpisany", number: null, grossValue: null, status: null, dateCreated: "2025-01-15", fileName: "umowa_UM2025001.pdf", fileSize: "3.4 MB" },
    { id: "c1-6", parentId: 1, childType: "zalacznik", type: "inne", title: "Harmonogram robót", number: "ZAŁ/1/2", grossValue: null, status: "aktywny", dateCreated: "2025-02-01", fileName: "harmonogram_lipowa.xlsx", fileSize: "0.8 MB" },
  ],
  3: [ // Umowa: Dostawa materiałów dydaktycznych
    { id: "c3-1", parentId: 3, childType: "faktura", type: "faktura", title: "Faktura za podręczniki", number: "FV/2025/091", contractor: "EduSerwis Polska S.A.", grossValue: 41697, status: "do_kontrasygnaty", dateCreated: "2025-03-15" },
    { id: "c3-2", parentId: 3, childType: "plik", type: "inne", title: "Specyfikacja zamówienia", number: null, grossValue: null, status: null, dateCreated: "2025-01-28", fileName: "specyfikacja_edu.pdf", fileSize: "1.2 MB" },
  ],
  5: [ // Umowa: Modernizacja oświetlenia
    { id: "c5-1", parentId: 5, childType: "plik", type: "inne", title: "Kosztorys wstępny", number: null, grossValue: null, status: null, dateCreated: "2025-02-05", fileName: "kosztorys_parkowa.pdf", fileSize: "0.5 MB" },
  ],
  8: [ // Umowa: Obsługa prawna
    { id: "c8-1", parentId: 8, childType: "faktura", type: "faktura", title: "Faktura za usługi prawne — styczeń", number: "FV/2025/035", contractor: "Kancelaria Prawna Nowakowski", grossValue: 9840, status: "zatwierdzony", dateCreated: "2025-02-05" },
    { id: "c8-2", parentId: 8, childType: "faktura", type: "faktura", title: "Faktura za usługi prawne — luty", number: "FV/2025/068", contractor: "Kancelaria Prawna Nowakowski", grossValue: 9840, status: "do_zatwierdzenia", dateCreated: "2025-03-04" },
    { id: "c8-3", parentId: 8, childType: "aneks", type: "aneks", title: "Aneks nr 1 — rozszerzenie zakresu", number: "AN/2025/003", contractor: "Kancelaria Prawna Nowakowski", grossValue: 0, status: "aktywny", dateCreated: "2025-02-20" },
    { id: "c8-4", parentId: 8, childType: "plik", type: "inne", title: "Umowa — skan", number: null, grossValue: null, status: null, dateCreated: "2025-01-10", fileName: "umowa_prawna_2025.pdf", fileSize: "1.8 MB" },
  ],
  4: [ // Zlecenie: Odbiór odpadów
    { id: "c4-1", parentId: 4, childType: "faktura", type: "faktura", title: "Faktura za odbiór odpadów — luty", number: "FV/2025/095", contractor: "OdpadyCo Sp. z o.o.", grossValue: 17220, status: "do_kontrasygnaty", dateCreated: "2025-03-01" },
    { id: "c4-2", parentId: 4, childType: "zalacznik", type: "inne", title: "Protokół odbioru odpadów", number: "ZAŁ/4/1", grossValue: null, status: "aktywny", dateCreated: "2025-02-28", fileName: "protokol_odpady_luty.pdf", fileSize: "0.3 MB" },
  ],
};

// Child type labels for grouping
const CHILD_TYPE_LABELS = {
  faktura: { label: "FAKTURY", icon: "receipt", color: "#0A7BE5" },
  aneks: { label: "ANEKSY", icon: "gitBranch", color: "#7C3AED" },
  zalacznik: { label: "ZAŁĄCZNIKI", icon: "paperclip", color: DS.neutralDark },
  plik: { label: "PLIKI", icon: "file", color: DS.neutralDark },
};

// --- FOLDERS / TECZKI (Iter 4) ---
const INIT_FOLDERS = [
  { id: "f1", name: "Inwestycja Drogi Powiatowej", color: "#A971F6", icon: "trendingUp", docIds: [1, 2, 4, 7], description: "Dokumenty dotyczące modernizacji drogi powiatowej nr 1234", createdAt: "2026-01-15" },
  { id: "f2", name: "Anna Kowalska — dokumenty", color: "#21B9E5", icon: "users", docIds: [3, 8], description: "Umowy i faktury kontrahenta Anna Kowalska", createdAt: "2026-02-01" },
  { id: "f3", name: "REGULAMINY", color: "#38A169", icon: "file", docIds: [5, 6], description: "Obowiązujące regulaminy i dokumenty wewnętrzne", createdAt: "2026-01-20" },
  { id: "f4", name: "Dokumenty do kontrasygnaty", color: "#E53E3E", icon: "alert", docIds: [3, 10], description: "Wymagające podpisu skarbnika", createdAt: "2026-02-10" },
];
