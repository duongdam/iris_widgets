# Ax Input — Mendix Implementation

**Widget ID**: `com.mendix.axinput.AxInput` | **Studio name**: Ax Input

antd `Input` bound to writable **String** or **Enumeration** attribute.

> **Cách sử dụng nhanh:** Data view → kéo **Ax Input** → map **Value** → String/Enum attribute → (tuỳ chọn) **On change** microflow. Xem [using-widgets.md §4](./using-widgets.md#4-form-widgets--nhập-liệu--filter) · Preview: mock-ui tab **Form**.

## Property mapping

| Property | Attribute / config |
|----------|-------------------|
| Value | String or Enum (writable) |
| Default value | String (optional) |
| Placeholder | string |
| Max length | integer |
| Disabled | boolean |
| Allow clear | boolean |
| Update on | `change` (each keystroke) or `blur` |
| On change | Microflow / nanoflow |

## Microflow example

```text
ACT_OnInputChanged
  → Commit context object
  → Refresh downstream datasource
```

## Tips

- Use **Update on = blur** when `On change` triggers heavy microflows.
- Map **Default value** from a helper attribute set in Before show page.

See also: [01-common-patterns.md](./01-common-patterns.md)
