# Android: follow system back and Material language

See [mobile](mobile.md) for shared rules. This file covers Android differences. It applies to native Jetpack Compose/View implementations and to mobile Web or cross-platform frameworks on Android; label the latter as approximation during verification.

## 1. Dimensions and units

- Hit targets are at least 48×48dp and are verified in dp for native implementations. Do not mix them with HTML's 48 CSS px or iOS's 44pt.
- Body defaults to 16sp and follows system font scaling. Layouts wrap at the largest accessibility sizes.
- Safe areas and display cutouts: native uses `WindowInsets`; Web uses `env(safe-area-inset-*)`. Do not place primary actions below the gesture-bar safe region.

## 2. Typography

Use Roboto for Latin plus the vendor's Chinese font, often Noto Sans CJK or a manufacturer face. Chinese fallback varies more than on iOS: weights may be missing and leading differs. Verify on at least one non-Pixel device. See [typography](../visual-dna/typography.md) §1 for Web stacks. Do not download a large font package merely for visual uniformity.

## 3. System back

System back, whether gesture or button, is global and the app must respond correctly:

- Close the current sheet/dialog → navigate to the previous page → leave to the launcher, with clear hierarchy.
- Do not intercept back with “Exit?” unless unsaved content exists.
- Let the system drive Predictive Back transitions when available.

## 4. Navigation and overlays

- Bottom navigation has 3–5 labeled destinations with a current state. Use Navigation Rail on tablets and larger screens.
- A FAB represents the one primary action on the current page. Do not show a FAB and an equal-weight sticky bottom button together.
- A Bottom Sheet uses `--ui-radius-2xl` (28px, Material 3 extra-large) on the top corners. Distinguish modal and standard sheets by whether they block interaction.
- Dialogs request required decisions; Snackbars report action results and may include one action.

## 5. Material and color

Material 3 dynamic color is a system capability. When enabled, semantic colors come from the system; reserve owned brand color for brand-bearing points and do not fight dynamic color. Express surface hierarchy with tonal elevation rather than large shadows; see [depth](../visual-dna/depth.md). Blur is expensive and inconsistent across Android versions, so avoid it by default; see [solid](../materials/solid.md).

## 6. Motion

Material motion's emphasized and standard curves are defaults; custom motion follows [motion](../visual-dna/motion.md). Remove displacement and scale when the system's Remove animations setting is enabled. List presses use a state layer rather than global scale.

## 7. Do not

- Copy iOS's top-left arrow and right-swipe as the only back mechanism.
- Add iOS-style sheet corners and grabber merely to resemble iOS.
- Stack shadows for hierarchy or show multiple FABs.
- Claim Web preview verified system back, TalkBack, or dynamic color. State untested when not verified on a device or emulator.

## 8. Verification

Use [native review](../review/native-review.md) for system integration and [mobile review](../review/mobile-review.md) for shared mobile checks.
