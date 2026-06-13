# Ax Text Area — Mendix Implementation

**Widget ID**: `com.mendix.axtextarea.AxTextArea` | **Studio name**: Ax Text Area

antd `Input.TextArea` for **String (unlimited)** attributes.

> **Cách sử dụng nhanh:** Data view → **Ax Text Area** → map **Value** → String (unlimited) → **Rows** / **Max length** tuỳ layout. Xem [using-widgets.md §4](./using-widgets.md#4-form-widgets--nhập-liệu--filter) · Preview: mock-ui tab **Form**.

## Property mapping

| Property | Map |
|----------|-----|
| Value | String writable (unlimited) |
| Default value | String optional |
| Placeholder | string |
| Rows | integer (default 4) |
| Max length | integer optional |
| Show count | boolean — character counter |
| Disabled | boolean |
| On change | action |

## Example

`Comment/Body` String unlimited → Text Area Value, Show count = true, Max length = 500.
