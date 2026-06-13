# Cài đặt Widget vào Mendix

## Yêu cầu

| Thành phần | Phiên bản |
|------------|-----------|
| Mendix Studio Pro | 10.24.9 trở lên |
| Node.js (build từ source) | 18+ |
| pnpm | 10.30.0 |

## Cách 1 — Dùng file .mpk có sẵn

Sau khi build/release, file `.mpk` được copy vào thư mục `builds/` ở root repo.

1. Mở **Mendix Studio Pro** → app target
2. **App Explorer** → **App** → **Marketplace modules** (hoặc **Import module**)
3. Chọn **Import module from file**
4. Chọn file `.mpk` (ví dụ `com.mendix.axcombobox.AxComboBox.mpk`)
5. **Sync** project → widget xuất hiện trong **Toolbox** → **Widgets**

Lặp lại cho từng widget cần dùng, hoặc import nhiều MPK.

## Cách 2 — Build từ source

```bash
# Từ root repo iris-widgets
pnpm install

# Build một widget
pnpm --filter ax-combobox run build

# Release (tạo .mpk)
pnpm --filter ax-combobox run release

# Release tất cả widgets
pnpm release:widgets
```

Output MPK thường nằm tại:

```text
widgets/<widget-name>/dist/<version>/*.mpk
builds/                          # sau pnpm release:widgets
```

## Dev server (hot reload widget)

```bash
# Chart
pnpm dev:barchart       # port 3001
pnpm dev:columnchart      # port 3001

# Gantt
pnpm dev:ganttchart       # port 3004

# Form (Ant Design)
pnpm dev:datepicker       # port 3005
pnpm dev:combobox         # port 3006
pnpm dev:input            # port 3007
pnpm dev:numberinput      # port 3008
pnpm dev:switch           # port 3009
pnpm dev:textarea         # port 3010
pnpm dev:checkboxgroup    # port 3011

# Preview tất cả widget (mock-ui)
pnpm dev:mock-ui          # http://localhost:5173
```

Xem [mock-ui.md](./mock-ui.md) cho danh sách tab preview.

## Kiểm tra sau import

1. Toolbox có widget (ví dụ **Ax Combo Box**)
2. Kéo widget vào page — không lỗi compile
3. Property panel hiển thị đủ property groups (Datasource, Display, Events, …)
4. Run locally → widget render, không console error

## Deploy lên Mendix Cloud / on-prem

Widget được bundle trong deployment package cùng app — không cần cài thêm trên server. Chỉ cần import MPK vào project trước khi deploy.

## Danh sách MPK theo widget

| Widget | Lệnh release |
|--------|--------------|
| Ax Bar Chart | `pnpm --filter ax-barchart run release` |
| Ax Column Chart | `pnpm --filter ax-columnchart run release` |
| Ax Stack Area Chart | `pnpm --filter ax-stackareachart run release` |
| Ax Report Chart | `pnpm --filter ax-reportchart run release` |
| Ax Negative Bar Chart | `pnpm --filter ax-negativebarchart run release` |
| Ax Gantt Chart | `pnpm --filter ax-ganttchart run release` |
| Ax Date Picker | `pnpm --filter ax-datepicker run release` |
| Ax Combo Box | `pnpm --filter ax-combobox run release` |
| Ax Input | `pnpm --filter ax-input run release` |
| Ax Number Input | `pnpm --filter ax-numberinput run release` |
| Ax Switch | `pnpm --filter ax-switch run release` |
| Ax Text Area | `pnpm --filter ax-textarea run release` |
| Ax Checkbox Group | `pnpm --filter ax-checkboxgroup run release` |

## Bước tiếp theo

Sau khi import MPK thành công:

1. **[Hướng dẫn sử dụng widget trên page](./using-widgets.md)** — workflow, kịch bản page, checklist
2. [Pattern chung](./01-common-patterns.md) — datasource, events, form writeback
3. [mock-ui](./mock-ui.md) — preview UI trước khi wiring Mendix
