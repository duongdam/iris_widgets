# Ax Number Input — Mendix Implementation

**Widget ID**: `com.mendix.axnumberinput.AxNumberInput` | **Studio name**: Ax Number Input

antd `InputNumber` for **Decimal**, **Integer**, or **Long** attributes.

> **Cách sử dụng nhanh:** Data view → **Ax Number Input** → map **Value** → Decimal/Integer/Long → (tuỳ chọn) **Min/Max/Step**. Xem [using-widgets.md §4](./using-widgets.md#4-form-widgets--nhập-liệu--filter) · Preview: mock-ui tab **Form**.

## Property mapping

| Property | Type |
|----------|------|
| Value | Decimal / Integer / Long (writable) |
| Default value | Same types (optional) |
| Min / Max / Step / Precision | Widget integer config |
| Disabled | boolean |
| On change | action |

## Example

Filter object attribute `Quantity` (Decimal) → widget Value. Min = 0, Max = 1000, Step = 1.

## Tips

- Precision controls decimal places in antd InputNumber.
- Value writeback uses Mendix `Big` for Decimal attributes.
