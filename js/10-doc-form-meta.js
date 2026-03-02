/* ═══════════════════════════════════════════════════════════════
   DOC FORM — constants & metadata
   ═══════════════════════════════════════════════════════════════ */
const DOC_TYPE_META = {
  umowa: { desc: "Umowa, kontrakt lub porozumienie", needsLink: false, hasOcr: true },
  faktura: { desc: "Faktura VAT lub rachunek", needsLink: true, linkLabel: "Powiąż z umową", hasOcr: true },
  zlecenie: { desc: "Zlecenie lub zamówienie", needsLink: false },
  aneks: { desc: "Aneks do istniejącej umowy", needsLink: true, linkLabel: "Wybierz umowę", linkRequired: true },
  inne: { desc: "Dowolny dokument — np. regulamin, zarządzenie", needsLink: false, simpleForm: true },
  zalacznik: { desc: "Plik powiązany z dokumentem (protokół, pismo, decyzja)", needsLink: true, linkLabel: "Powiąż z dokumentem", simpleForm: true },
};
const LINK_TYPES = { faktura: ["umowa"], aneks: ["umowa"], zalacznik: ["umowa", "faktura", "zlecenie", "aneks", "inne"] };
const TRYBY_PZP = [
  { id: "tp_podst", label: "Tryb podstawowy", desc: "Art. 275 PZP — poniżej progów unijnych", threshold: "do 221 000 €" },
  { id: "pn", label: "Przetarg nieograniczony", desc: "Art. 132 PZP — otwarty dla wszystkich wykonawców", threshold: "powyżej progów UE" },
  { id: "po", label: "Przetarg ograniczony", desc: "Art. 141 PZP — dwuetapowy z prekwalifikacją", threshold: "powyżej progów UE" },
  { id: "no", label: "Negocjacje z ogłoszeniem", desc: "Art. 153 PZP — negocjacje po ofertach wstępnych", threshold: "powyżej progów UE" },
  { id: "dialog", label: "Dialog konkurencyjny", desc: "Art. 169 PZP — dialog w celu określenia rozwiązań", threshold: "powyżej progów UE" },
  { id: "wolna_reka", label: "Zamówienie z wolnej ręki", desc: "Art. 214 PZP — wymaga uzasadnienia", threshold: "wymaga przesłanki" },
  { id: "zapytanie", label: "Zapytanie ofertowe", desc: "Procedura wewnętrzna JST", threshold: "poniżej 130 000 zł" },
  { id: "bez_pzp", label: "Bez stosowania PZP", desc: "Art. 2 ust. 1 PZP — poniżej progu", threshold: "poniżej 130 000 zł" },
];
const REGISTRY_PREFIXES = { umowa: "CRU", faktura: "REF", aneks: "AN", zlecenie: "RZ" };
