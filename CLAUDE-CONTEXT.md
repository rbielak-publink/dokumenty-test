# ePublink Dokumenty 2.0 — Kontekst projektu dla Claude Code

> Plik stworzony 2026-03-02 jako podsumowanie ~10+ sesji w Claude.
> Umieść go w katalogu roboczym projektu, aby Claude Code mógł od razu kontynuować pracę.

---

## 1. O projekcie

**ePublink Dokumenty 2.0** to moduł zarządzania dokumentami (umowy, faktury, zlecenia, aneksy, inne) przeznaczony dla polskich jednostek samorządu terytorialnego (JST). Aplikacja jest prototypem UI/UX budowanym jako **pojedynczy plik HTML** z React 18 + Babel standalone (bez bundlera, bez node_modules).

### Stack technologiczny
- **React 18** via CDN (`unpkg.com/react@18`)
- **ReactDOM 18** via CDN
- **Babel standalone** via CDN (transpilacja JSX w przeglądarce)
- **Inter font** via Google Fonts
- **Brak bundlera** — wszystko w jednym `<script type="text/babel">`
- Plik: `index.html` (~5000 linii, ~303 KB)

### Deployment
- **GitHub repo**: `rbielak-publink/dokumenty-test` (branch: `main`)
- **Vercel**: `dokumenty-test.vercel.app`
- Framework Preset na Vercel: **"Other"** (statyczny HTML, bez buildu)

---

## 2. Preferencje użytkownika (KRYTYCZNE)

Te zasady obowiązują we WSZYSTKICH sesjach:

1. **Inkrementalne edycje** — buduj jedną iterację naraz, używaj `Edit` zamiast przepisywania całych sekcji
2. **Małe zmiany** — nie przekraczaj limitów tokenów, dziel duże zmiany na kilka kroków
3. **NIGDY nie zmieniaj kolorów/typografii DS** — zmieniaj tylko architekturę/flow, nie tokeny designu
4. **UX pattern (styl Zuzy)**:
   - Modal do tworzenia nowych dokumentów
   - Drawer (wysuwany panel) do edycji/podglądu szczegółów
   - Zakładki (tab-based) w widoku szczegółów
5. **Brak kalkulacji VAT** — "nie przeliczaj vatu, nie znamy stawek"
6. **Typ "Inne"** = absolutne minimum — tylko nazwa, bez pól finansowych
7. **OCR** tylko dla umowa i faktura

---

## 3. Design System — Publink DS

### Kolory (obiekt `DS`)
```javascript
const DS = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  // Primary (granatowy)
  primaryMain: "#1A2569", primaryDark: "#0F174A", primaryLight: "#2E3B8C", primaryLighter: "#E8EAFF",
  // Secondary (turkusowy)
  secondaryMain: "#21B9E5", secondaryDark: "#0E8DB3", secondaryLight: "#4BD0F5", secondaryLighter: "#E0F7FD",
  // Accent Umowy (fioletowy)
  accentUmowyMain: "#A971F6", accentUmowyDark: "#7B4CC7", accentUmowyLight: "#C9A6FF", accentUmowyLighter: "#F3ECFF",
  // Semantyczne
  successMain: "#16A34A", successLighter: "#DCFCE7",
  warningMain: "#F59E0B", warningLighter: "#FEF3C7",
  errorMain: "#DC2626", errorLighter: "#FEE2E2",
  infoMain: "#2563EB", infoLighter: "#DBEAFE",
  // Neutralne
  neutralWhite: "#FFFFFF", neutralLighter: "#F8F9FC", neutralLight: "#E5E7EB",
  neutralMain: "#9CA3AF", neutralDark: "#4B5563", neutralDarker: "#374151",
  // Tekst
  textPrimary: "#0F172A", textSecondary: "#64748B", textDisabled: "#94A3B8",
  // Obramowania
  borderLight: "#E2E8F0", borderMedium: "#CBD5E1",
  // Cienie
  shadowSm/Md/Lg/Xl: "..."
};
```

### Typografia (obiekt `typo`)
```javascript
const typo = {
  titleLarge:  { fontSize: 20, fontWeight: 700, lineHeight: "28px", letterSpacing: "-0.02em" },
  titleMedium: { fontSize: 16, fontWeight: 600, lineHeight: "24px", letterSpacing: "-0.01em" },
  titleSmall:  { fontSize: 14, fontWeight: 600, lineHeight: "20px" },
  bodyMedium:  { fontSize: 14, fontWeight: 400, lineHeight: "20px" },
  bodySmall:   { fontSize: 13, fontWeight: 400, lineHeight: "18px" },
  labelMedium: { fontSize: 13, fontWeight: 500, lineHeight: "18px" },
  labelSmall:  { fontSize: 11, fontWeight: 500, lineHeight: "16px" },
};
```

### Style Helpers (obiekt `S`)
```javascript
const S = {
  row: { display: "flex", alignItems: "center" },
  rowBetween: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  col: { display: "flex", flexDirection: "column" },
  card: { background: DS.neutralWhite, borderRadius: 8, border: `1px solid ${DS.borderLight}` },
  cardShadow: { ...card + boxShadow: DS.shadowSm },
  pill: { borderRadius: 9999 },
  truncate: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  overlay: { position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" },
};
```

---

## 4. Architektura pliku — mapa komponentów

Plik `index.html` ma następującą strukturę (numery linii przybliżone):

| Linie | Sekcja/Komponent | Opis |
|-------|-----------------|------|
| 1-14 | HTML boilerplate | DOCTYPE, CDN scripts |
| 15-63 | DS, typo, S | Design System tokens, typografia, style helpers |
| 65-119 | ICONS | SVG paths (Lucide-compatible) |
| 121-129 | Icon | Komponent ikon SVG |
| 131-279 | DATA DEFINITIONS | DOC_TYPES, DOC_STATUSES, ALERT_TYPES, DEPARTMENTS, USERS_LIST, CLASSIFICATIONS, TAGS, CONTRACTORS, INIT_DOCS, CHILD_DOCS, INIT_FOLDERS |
| 281-456 | KSEF DATA | KSEF_STATUSES, INIT_KSEF_INVOICES (mock 20+ faktur) |
| 458-583 | UTILITY COMPONENTS | formatCurrency, formatDate, Badge, AlertBadge, Avatar, Btn, Input, Select, Field, Section |
| 585-682 | Sidebar | Nawigacja boczna z sekcjami: Dokumenty, Monitor, Teczki, KSeF, Kontrahenci |
| 684-742 | ViewTabs | Zakładki widoku (system + custom) |
| 744-868 | FilterBar + FilterSummary | Pasek filtrów, MultiSelect, podsumowanie filtrów |
| 871-911 | ColumnSelector | Konfigurator widocznych kolumn |
| 913-968 | DocTypeFilterBar | Szybkie filtry typów dokumentów |
| 970-1031 | SaveViewModal | Modal zapisu custom widoku |
| 1033-1590 | DocTable | Główna tabela dokumentów z sortowaniem, grupowaniem, multi-select, drag-resize kolumn, zebra striping |
| 1592-1948 | DrawerDetail | Drawer szczegółów dokumentu z tabami: Szczegóły, Dokumenty powiązane, Obieg, Historia |
| 1950-2749 | DocFormModal | Modal tworzenia nowego dokumentu (umowa/faktura/zlecenie/aneks/inne) z OCR, AI suggestions, budget context |
| 2751-2882 | GlobalSearchModal | Cmd+K globalne wyszukiwanie |
| 2884-2921 | BudgetContextBar | Pasek kontekstu budżetowego (klasyfikacja → wykorzystanie) |
| 2923-2978 | AiSuggestionBanner | Banner z sugestią AI (klasyfikacja, kontrahent) |
| 2980-3129 | OcrWizard | Wizard OCR do skanowania umów/faktur |
| 3131-3356 | SkarbnikSummary | Monitor Skarbnika — dashboard KPI (umowy, faktury, brutto, netto, alerty) |
| 3358-3477 | ExportModal | Eksport do CSV/XLSX/PDF |
| 3479-3775 | FoldersView | Widok teczek (tiles + list mode, drag-to-add) |
| 3777-3971 | KsefView | Moduł KSeF — tabela faktur, filtrowanie, weryfikacja |
| 3973-4297 | KsefInvoiceDrawer | Drawer szczegółów faktury KSeF z pozycjami |
| 4299-4396 | FolderPickerModal | Modal "Dodaj do teczki" |
| 4398-4505 | ContractorsView | Widok kontrahentów (pogrupowane dokumenty) |
| 4507-4570 | AppTopBar | Górny pasek z breadcrumbs, awatarem, powiadomieniami |
| 4574-4985 | App | Główny komponent — state, routing widoków, filteredDocs, obsługa zdarzeń |
| 4988-4996 | ErrorBoundary + render | Error handling + ReactDOM.createRoot |

---

## 5. Wzorce UI — referencja dla spójności

### Tabela dokumentów (DocTable) — wzorzec referencyjny
- **Header**: `background: DS.neutralWhite`, `borderBottom: 2px solid`, `sticky top: 0`, `minHeight: 38`, `padding: "0 20px"`
- **Wiersze**: `minHeight: 48`, `padding: "0 20px"`, zebra striping (`idx % 2 === 1` → `DS.neutralLighter`)
- **Hover wiersza**: `DS.primaryLighter`
- **Komórki**: `padding: "8px 6px"`
- **Czcionka komórek**: `typo.bodySmall`, nazwy z `fontWeight: 500`, numery z `fontVariantNumeric: "tabular-nums"`, nr ewidencyjne z `fontFamily: "monospace", fontSize: 12`
- **Zaznaczenie**: `borderLeft: 3px solid DS.accentUmowyMain` (wybrany) / `transparent` (reszta)

### Widżety KPI (Monitor skarbnika) — wzorzec referencyjny
- **Layout**: vertical (ikona+label u góry, duża wartość, subtitle)
- **Ikona**: `width: 30, height: 30, borderRadius: 8`
- **Label**: `fontSize: 10, letterSpacing: 0.4, textTransform: "uppercase"`
- **Wartość**: `fontSize: 26` (county) lub `fontSize: 18` (kwoty z `isAmount`)
- **Container**: `border: 1px solid`, `borderRadius: 10`, `padding: "14px 16px"`

### Zakładki (ViewTabs) — wzorzec referencyjny
- **Active border**: `2px solid DS.accentUmowyMain`
- **Font**: `fontSize: 13`, `fontWeight: 600` (active) / `400` (inactive)
- **Pill badge**: `background: DS.accentUmowyLighter` (active) / `DS.neutralLighter` (inactive)
- **Hover**: `color: DS.textPrimary`

### Nagłówki widoków (topbar-style)
- `padding: "10px 20px"`, `minHeight: 52`, `borderBottom: 1px solid DS.borderLight`
- Tytuł: `typo.titleMedium, color: DS.primaryMain`
- Subtitle: `typo.bodySmall, color: DS.textSecondary`
- Search: plain `<input>` z ikoną search, `borderRadius: 8`, `width: 300`

---

## 6. Moduł KSeF — stan aktualny

### Dane
- **KSEF_STATUSES**: nowy, przypisany, zweryfikowany, odrzucony
- **INIT_KSEF_INVOICES**: ~20 mock faktur z polami: id, ksefNumber, seller (name, nip, address), buyer, invoiceNumber, issueDate, saleDate, dueDate, items[], netTotal, taxTotal, grossTotal, currency, isCorrection, correctedInvoiceNumber, status, downloadedAt
- Każdy `item` ma: description, quantity, unit, unitPriceNet, netValue, vatRate, vatValue, grossValue

### Logika
- **Weryfikacja** (nie przypisanie!): widżety i przyciski dotyczą weryfikacji faktur
- **Statusy w filtrach**: "niezweryfikowane" = `status === "nowy"`, "zweryfikowane" = `status === "zweryfikowany"`
- **Przycisk "Zweryfikuj"** w tabeli (disabled, zielony z ikoną check)
- **Drawer footer**: "Odrzuć" (czerwony) + "Zweryfikuj" (zielony) — oba disabled w prototypie

### Stat Cards
4 karty w gridzie `repeat(4, 1fr)`:
1. Wszystkie (inbox icon, primaryMain)
2. Niezweryfikowane (clock icon, errorMain)
3. Zweryfikowane (check icon, successMain)
4. Wartość brutto (coins icon, primaryMain, isAmount)

---

## 7. Widoki nawigacji (Sidebar)

| ID | Label | Ikona | Opis |
|----|-------|-------|------|
| `all` | Dokumenty | `file` | Główna tabela dokumentów |
| `umowy` | Umowy | `file` | Filtrowane: type=umowa |
| `faktury` | Faktury | `receipt` | Filtrowane: type=faktura |
| `zlecenia` | Zlecenia | `file` | Filtrowane: type=zlecenie |
| `inne` | Inne/Aneksy | `file` | Filtrowane: type=aneks|inne |
| `podsumowanie` | Monitor | `barChart` | SkarbnikSummary — dashboard |
| `folders` | Teczki | `folder` | FoldersView |
| `ksef` | KSeF | `inbox` | KsefView |
| `contractors` | Kontrahenci | `building` | ContractorsView |

---

## 8. Typy dokumentów i statusy

### DOC_TYPES
```javascript
{ umowa: "Umowa", faktura: "Faktura", zlecenie: "Zlecenie", aneks: "Aneks", inne: "Inne" }
```

### DOC_STATUSES
```javascript
{
  draft: { label: "Szkic", color: DS.neutralDark, bg: DS.neutralLighter },
  do_zatwierdzenia: { label: "Do zatwierdzenia", color: DS.warningDark, bg: DS.warningLighter },
  do_kontrasygnaty: { label: "Do kontrasygnaty", color: DS.infoDark, bg: DS.infoLighter },
  aktywny: { label: "Aktywny", color: DS.successDark, bg: DS.successLighter },
  zakonczony: { label: "Zakończony", color: DS.neutralDark, bg: DS.neutralLighter },
  anulowany: { label: "Anulowany", color: DS.errorDark, bg: DS.errorLighter },
}
```

---

## 9. Iteracje (historia budowy)

| Iter | Co dodano |
|------|-----------|
| 1 | Podstawowa tabela dokumentów, sidebar, design system, CRUD |
| 2 | Cmd+K global search, sortowanie, inline add |
| 3 | OCR Wizard, AI Suggestion Banner, Budget Context Bar |
| 4 | Eksport (CSV/XLSX/PDF), Teczki (folders), multi-select, drag-resize kolumn, FolderPickerModal, grupowanie w tabeli, kontrahenci view |
| 5 | Custom ViewTabs (zapisz widok), DocTypeFilterBar, ColumnSelector, SaveViewModal |
| 6 | Drawer szczegółów — taby (Szczegóły, Powiązane, Obieg, Historia), nawigacja prev/next |
| 7 | DocFormModal — pełny formularz tworzenia dokumentów per typ (umowa/faktura/zlecenie/aneks/inne) z walidacją, linkowanie docs |
| 8 | SkarbnikSummary — Monitor Skarbnika z KPI, wykresami, alertami |
| 9 | KSeF — mock data, tabela faktur, detail drawer z pozycjami, stat cards |
| 10+ | Style polish — dopasowanie KSeF do reszty app (tabela, widżety, czcionki, weryfikacja vs przypisanie) |

---

## 10. Znane ograniczenia prototypu

1. **Brak backendu** — wszystko jest mockowane w INIT_DOCS, INIT_KSEF_INVOICES, INIT_FOLDERS
2. **Brak persystencji** — odświeżenie strony resetuje dane
3. **Brak routingu** — nawigacja przez state (`activeView`)
4. **Brak autentykacji** — AppTopBar ma statyczny awatar
5. **Przyciski "disabled"** w KSeF — "Zweryfikuj" i "Odrzuć" nie działają (placeholder)
6. **OCR** — symulowany (fake progress bar + prefill)
7. **AI Suggestions** — hardcoded, nie ma modelu
8. **Eksport** — generuje CSV w przeglądarce, nie ma prawdziwego XLSX/PDF

---

## 11. Deployment — konfiguracja Vercel

Jeśli deployment nie działa (plik się pobiera zamiast renderować):

1. Plik MUSI nazywać się `index.html` i być w rootu repo
2. Vercel Settings → General → Build & Development Settings:
   - **Framework Preset**: Other
   - **Build Command**: puste
   - **Output Directory**: puste
   - **Install Command**: puste
3. Po zmianie ustawień: Deployments → Redeploy

---

## 12. Jak kontynuować pracę

```bash
# Sklonuj repo
cd /Users/radekbielakpublink/Documents/GitHub/dokument-test
git clone https://github.com/rbielak-publink/dokumenty-test.git .

# Plik do edycji:
# index.html (~5000 linii)

# Po zmianach:
git add index.html
git commit -m "opis zmian"
git push origin main
# Vercel automatycznie redeployuje
```

### Wskazówki dla Claude Code
- Plik jest duży (~5000 linii) — używaj `Edit` z precyzyjnymi `old_string` zamiast `Write`
- Przed edycją zawsze przeczytaj odpowiednią sekcję pliku (`Read` z `offset`/`limit`)
- Po edycji sprawdź balance nawiasów: zapisz skrypt do `/tmp/check.js` i uruchom `node /tmp/check.js`
- Testuj w przeglądarce po każdej zmianie (plik jest self-contained)
