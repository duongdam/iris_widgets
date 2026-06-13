# Ax Combo Box — Mendix Implementation

**Widget ID**: `com.mendix.axcombobox.AxComboBox`  
**Studio name**: Ax Combo Box

Select Ant Design: **datasource ListValue**, single/multi select, **select all**, default values.

> **Cách sử dụng nhanh:** Entity options + datasource list → map **Label/Value** → **Selected value(s)** writable → **On change** refresh datasource phụ thuộc. Xem [using-widgets.md §5](./using-widgets.md#5-ax-combo-box--single--multi-select) · [cascading pattern](./cascading-combobox-pattern.md) · Preview: mock-ui tab **Combo Box**.

---

## Domain Model

### Entity options — ví dụ `SiteOption`

| Attribute | Type | Widget mapping |
|-----------|------|----------------|
| `Code` | String | **Value attribute** |
| `Label` | String | **Label attribute** |

Mỗi dòng list = một option trong dropdown.

### Context / Filter object — selection output

| Attribute | Type | Dùng khi |
|-----------|------|----------|
| `SelectedSite` | String hoặc **Enum** | **Single** mode → Selected value |
| `SelectedSites` | String (unlimited) | **Multiple** mode → Selected values (JSON) |
| `DefaultSites` | String (unlimited) | Default selected values (JSON array) |

**Format Selected values / Default selected values**:

```json
["Site1","Site2","Site3"]
```

Giá trị phải khớp **Value attribute** (`Code`), không phải Label.

---

## Property mapping

### Datasource

| Property | Map |
|----------|-----|
| Data source | List `SiteOption` (Database / Microflow / XPath) |
| Label attribute | `SiteOption/Label` |
| Value attribute | `SiteOption/Code` |

### Behavior

| Property | Gợi ý |
|----------|-------|
| Selection mode | `Single` hoặc `Multiple` |
| Allow select all | `true` (chỉ có ý nghĩa khi Multiple) |
| Placeholder | `"Chọn site"` |
| Disabled | `false` |

### Value

| Property | Attribute | Mode |
|----------|-----------|------|
| Selected value | `Filter/SelectedSite` | Single |
| Selected values | `Filter/SelectedSites` | Multiple |
| Default selected values | `Filter/DefaultSites` | Cả hai (pre-select khi load) |

### Events

| Event | Action |
|-------|--------|
| On change | `ACT_OnSiteFilterChanged` |

---

## Triển khai Single select

1. Entity `SiteOption` + retrieve list
2. Widget: Selection mode = **Single**
3. Map Selected value → writable String hoặc Enum
4. On change → microflow dùng `$Filter/SelectedSite` làm constraint cho datasource khác

---

## Triển khai Multiple + Select all

1. Selection mode = **Multiple**
2. Allow select all = **true**
3. Map Selected values → String unlimited
4. User chọn / Select all → widget ghi JSON array

### Parse JSON trong microflow

**Cách 1 — String operations** (đơn giản):  
Nếu chỉ cần 1 site, dùng single mode.

**Cách 2 — Java action / Marketplace JSON** (khuyến nghị cho nhiều giá trị):  
Parse `SelectedSites` → list string → dùng trong XPath `SiteCode in $SiteList`.

**Cách 3 — Lưu CSV thay JSON** (custom):  
Widget mặc định JSON; nếu app cần CSV, convert trong microflow On change.

---

## Default values

Microflow **Before show page**:

```text
ACT_InitFilter
  → Filter/DefaultSites = '["Site1"]'
  → (widget hiển thị Site1 đã chọn nếu SelectedSites còn trống)
```

Hoặc set trực tiếp Selected values nếu cần overwrite mỗi lần mở page.

---

## Microflow retrieve có constraint — ví dụ

```text
Microflow: ACT_GetSites
  Input: Filter (optional parent selection)
  → Retrieve SiteOption
     [XPath: ParentCode = $Filter/SelectedParent]
  → Return list
```

Datasource Combo Box Site = `ACT_GetSites`.

---

## Page layout mẫu

```text
Data view: Filter
├── Ax Combo Box (Dimension Type)   — single, chọn "Site" / "Team"
├── Ax Combo Box (Site values)     — multiple, select all
│   ├── datasource: DS_Sites
│   ├── selectedValues → Filter/SelectedSites
│   └── onChange → ACT_RefreshTeamList
└── Ax Combo Box (Team values)     — DS_Teams(Filter/SelectedSites)
```

Pattern cascading chi tiết: [cascading-combobox-pattern.md](./cascading-combobox-pattern.md)

---

## Dimension values mẫu (Site, Team, …)

| Dimension | Value codes (ví dụ) |
|-----------|---------------------|
| Site | Site1, Site2, Site3 |
| Team | Team1, Team2, Team3 |
| Group | Group1, Group2 |
| Part | Part1, Part2, Part3 |
| Project | Project1, Project2, Project3 |
| Block L1 | Block L1-A, Block L1-B |
| … | (xem mock-ui Cascading tab) |

Entity design gợi ý: **`DimensionOption`** với `DimensionType`, `Code`, `Label`, `ParentCode`.

---

## Troubleshooting

| Triệu chứng | Kiểm tra |
|-------------|----------|
| Dropdown trống | Datasource; Label/Value map đúng |
| Select all không hiện | Multiple mode + Allow select all |
| Selection không lưu | Writable attribute; Single vs Multiple map đúng property |
| Default không apply | JSON hợp lệ; value khớp Value attribute |
| JSON lỗi parse | Chỉ dùng array string, ví dụ `["A","B"]` |

---

## Liên quan

- [Cascading Combo Box pattern](./cascading-combobox-pattern.md)
- [Pattern chung](./01-common-patterns.md)
- mock-ui tabs **Combo Box**, **Cascading**
