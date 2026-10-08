# iOS: native feel comes from system behavior, not rounded corners

See [mobile](mobile.md) for shared rules. This file covers only iOS differences. It applies to native SwiftUI/UIKit and to mobile Web or cross-platform frameworks running on iOS; label the latter as approximation during verification.

## 1. Dimensions and units

- Hit targets are at least 44×44pt and are verified in points for native implementations. Do not mix with HTML's 48 CSS px.
- Body defaults to the Dynamic Type Body equivalent (17pt). Support system text enlargement; layouts wrap rather than clip at accessibility sizes.
- Safe areas: native uses `safeAreaInsets`; Web uses `env(safe-area-inset-*)` plus `viewport-fit=cover`. Values depend on a real device; simulators and desktop browsers only approximate them.

## 2. Typography

Use SF Pro for Latin plus PingFang SC for Chinese. On Web, put `-apple-system, "PingFang SC"` early in the stack; see [typography](../visual-dna/typography.md) §1. Do not download a large Chinese font merely to “look like iOS.”

## 3. Navigation and back behavior

- Swipe-back is a system capability but never the sole route. Keep a visible back button or equivalent in navigation.
- Drill-down preserves list filters and scroll position so return restores the state the user left.
- Bottom tabs serve 3–5 top-level destinations; do not force them onto a single-task tool.
- Collapsing Large Titles are optional. They fit long list pages and are unnecessary for tool pages.

## 4. Sheets and dialogs

| Need | Use |
|---|---|
| Nearby context that can be dismissed at any time | Sheet with detents; top corners around `--ui-radius-2xl` |
| A decision is required to continue | Alert / confirmation dialog |
| Complex long task | Separate page pushed onto the navigation stack |

Do not open a sheet from a sheet. Do not open another modal from a sheet except an alert. On close, restore keyboard and VoiceOver focus to the trigger.

## 5. System materials

Native iOS vibrancy and materials are platform capabilities. Use them directly for navigation bars, tab bars, and sheet backgrounds rather than recreating translucency. Web approximations are in [frosted](../materials/frosted.md) and [liquid glass](../materials/liquid-glass.md); never claim equivalence. High-risk information such as dosages, money, and deletion confirmation remains on a solid surface.

## 6. Motion and haptics

- Use system timing and curves for transitions, sheet movement, and list selection. Custom motion follows [motion](../visual-dna/motion.md) admission and reduced-motion behavior.
- Haptics supplement visual and screen-reader feedback; they never replace it.
- Remove displacement and scale when Reduce Motion is enabled.

## 7. Do not

- Combine an Android FAB with bottom navigation.
- Disable zoom through `maximum-scale=1` to prevent double-tap zoom.
- Redraw iOS switches or navigation bars instead of using system controls unless product identity requires it and verification covers it.
- Claim that Web preview verifies swipe-back, Dynamic Type, or VoiceOver. State untested when not verified on device or simulator.

## 8. Verification

Use [native review](../review/native-review.md) for system integration and [mobile review](../review/mobile-review.md) for shared mobile checks.
