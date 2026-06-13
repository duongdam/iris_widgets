# Ax Switch — Mendix Implementation

**Widget ID**: `com.mendix.axswitch.AxSwitch` | **Studio name**: Ax Switch

antd `Switch` bound to **Boolean** attribute.

> **Cách sử dụng nhanh:** Data view → **Ax Switch** → map **Value** → Boolean attribute → **On change** nếu cần side-effect. Xem [using-widgets.md §4](./using-widgets.md#4-form-widgets--nhập-liệu--filter) · Preview: mock-ui tab **Form**.

## Property mapping

| Property | Map |
|----------|-----|
| Value | Boolean (writable) |
| Default value | Boolean (optional) |
| Checked label | Text when ON (optional) |
| Unchecked label | Text when OFF (optional) |
| Disabled | boolean |
| On change | action |

## Example

`Filter/IsActive` Boolean → Switch Value. Checked label = "Active", Unchecked = "Inactive".
