# Cascading Combo Box — Mendix Pattern

Pattern triển khai **nhiều Ax Combo Box phụ thuộc nhau** trên cùng Mendix page — tương tự demo mock-ui tab **Cascading**.

> Widget **không** embed logic cascading. Mendix **page + microflow + XPath constraint** điều phối datasource giữa các combobox.

> **Cách sử dụng nhanh:** Combo A **On change** → commit FilterContext → microflow refresh datasource Combo B/C. Xem [using-widgets.md §5](./using-widgets.md#5-ax-combo-box--single--multi-select) · Preview: mock-ui tab **Cascading**.

---

## Use case

**Combobox A** — chọn loại dimension (multi-select):

Site, Team, Group, Part, Prious, Project, Block L1, Block L2, Function L1, Function L2, Activity L1, Activity L2

Khi user chọn **Site** + **Team** ở A:

- **Combobox B (Site)** hiện → Site1, Site2, Site3
- **Combobox C (Team)** hiện → Team1, Team2, Team3

Mỗi combobox con có selection **độc lập**.

---

## Domain Model gợi ý

### `FilterContext` (non-persistent)

| Attribute | Type | Mô tả |
|-----------|------|-------|
| `ActiveDimensions` | String (unlimited) | JSON array dimension đang bật, ví dụ `["Site","Team"]` |
| `SelectedSite` | String (unlimited) | JSON `["Site1","Site2"]` |
| `SelectedTeam` | String (unlimited) | JSON `["Team1"]` |
| `SelectedGroup` | String (unlimited) | … tương tự cho từng dimension |

### `DimensionOption` (persistent hoặc cached)

| Attribute | Type |
|-----------|------|
| `DimensionType` | String / Enum |
| `Code` | String |
| `Label` | String |
| `SortOrder` | Integer |

Import data mẫu:

| DimensionType | Code | Label |
|---------------|------|-------|
| Site | Site1 | Site1 |
| Site | Site2 | Site2 |
| Team | Team1 | Team1 |
| … | … | … |

---

## Kiến trúc page

```text
┌─────────────────────────────────────────────────────────┐
│  Data view: FilterContext                                │
│                                                          │
│  [Combo A] Dimension types (static list hoặc enum DS)   │
│     selectedValues → ActiveDimensions                    │
│     onChange → ACT_OnDimensionTypeChanged                │
│                                                          │
│  ┌─ Visibility: ActiveDimensions contains "Site" ─────┐ │
│  │ [Combo B] Site options                              │ │
│  │   DS: ACT_GetOptions(DimensionType=Site)             │ │
│  │   selectedValues → SelectedSite                     │ │
│  │   onChange → ACT_OnSiteChanged                      │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌─ Visibility: ActiveDimensions contains "Team" ─────┐ │
│  │ [Combo C] Team options                              │ │
│  │   DS: ACT_GetOptions(DimensionType=Team)             │ │
│  │   selectedValues → SelectedTeam                     │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  [Ax Column Chart] DS_GetReportData(FilterContext)       │
└─────────────────────────────────────────────────────────┘
```

---

## Bước 1 — Combobox A (dimension types)

**Option A — Static enumeration entity `DimensionType`**:  
Retrieve list cố định 12 giá trị.

**Option B — Không dùng datasource**:  
Dùng Mendix native CheckBox list / Radio — hoặc 1 Combo Box multi với microflow trả 12 row cố định.

Cấu hình Ax Combo Box:

| Property | Value |
|----------|-------|
| Selection mode | Multiple |
| Allow select all | true |
| Selected values | `FilterContext/ActiveDimensions` |
| On change | `ACT_OnDimensionTypeChanged` |

---

## Bước 2 — Microflow `ACT_OnDimensionTypeChanged`

```text
1. Commit FilterContext (ActiveDimensions đã update bởi widget)
2. Clear selection của dimension bị bỏ chọn:
   - Nếu "Site" ∉ ActiveDimensions → SelectedSite = '[]'
3. Refresh page / nested widgets (Mendix tự reload datasource)
4. (Tuỳ chọn) Gọi ACT_RefreshReportData
```

---

## Bước 3 — Combobox phụ thuộc (B, C, …)

Mỗi dimension = **1 instance Ax Combo Box**.

| Property | Cấu hình |
|----------|----------|
| Visible | Expression, ví dụ `contains($FilterContext/ActiveDimensions, 'Site')` * |
| Data source | `ACT_GetDimensionOptions(DimensionType='Site')` |
| Label / Value | `DimensionOption/Label`, `DimensionOption/Code` |
| Selection mode | Multiple |
| Allow select all | true |
| Selected values | `FilterContext/SelectedSite` |
| On change | `ACT_OnSiteChanged` → refresh chart |

\* Parse JSON trong expression phức tạp — thường dùng **Visibility microflow** hoặc **Dynamic visibility** với helper Boolean attribute `ShowSiteCombo` được set trong `ACT_OnDimensionTypeChanged`.

### Helper Boolean (khuyến nghị)

| Attribute | Set trong ACT_OnDimensionTypeChanged |
|-----------|--------------------------------------|
| `ShowSiteCombo` | `containsJSON(ActiveDimensions, "Site")` |
| `ShowTeamCombo` | `containsJSON(ActiveDimensions, "Team")` |

Visibility widget: `$FilterContext/ShowSiteCombo`.

---

## Bước 4 — Microflow `ACT_GetDimensionOptions`

```text
Input: DimensionType (String)
→ Retrieve DimensionOption
   [XPath: DimensionType = $DimensionType]
→ Sort SortOrder ascending
→ Return list
```

---

## Bước 5 — Default values

Before show page:

```text
FilterContext/ActiveDimensions = '["Site"]'
FilterContext/SelectedSite = '["Site1"]'
FilterContext/ShowSiteCombo = true
```

Map **Default selected values** trên từng Combo Box nếu cần pre-select khi widget mount.

---

## Kết nối Chart / Report

Microflow **`ACT_GetReportData`** nhận `FilterContext`:

```text
Constraint ví dụ (pseudo):
  (empty SelectedSite OR SiteCode in parsed SelectedSite)
  AND (empty SelectedTeam OR TeamCode in parsed SelectedTeam)
```

Chart datasource trên cùng page gọi microflow này — tự refresh khi filter đổi (sau Commit + On change).

---

## So sánh với mock-ui

| mock-ui | Mendix tương đương |
|---------|-------------------|
| React state `activeDimensions` | `FilterContext/ActiveDimensions` |
| `selections.Site` | `FilterContext/SelectedSite` |
| Render dynamic `<Select>` | Nhiều Ax Combo Box + visibility |
| Static mock data | Entity `DimensionOption` + microflow |

---

## Checklist

- [ ] Entity options theo DimensionType
- [ ] FilterContext với JSON attributes cho multi-select
- [ ] Combo A → On change clear orphaned selections
- [ ] Boolean Show*Combo hoặc visibility expression
- [ ] Mỗi dimension active có 1 Combo Box instance
- [ ] Chart/report datasource constraint theo tất cả selections
- [ ] Test: bỏ chọn Site ở A → Site combo ẩn + SelectedSite cleared

---

## Liên quan

- [Ax Combo Box](./ax-combobox.md)
- [Pattern chung](./01-common-patterns.md)
- mock-ui tab **Cascading**
