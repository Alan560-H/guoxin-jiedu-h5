# Design QA

## Comparison target

- Source visual truth: `C:\Users\11075\AppData\Local\Temp\codex-clipboard-4bcc2178-1f2e-4174-9e92-af11453b7190.png`
- Implementation route: `http://10.18.166.113:9999/`
- Implementation screenshot: `E:\www\fangtang\guoxin-jiedu-h5\homepage-avatar-layout-implementation.jpg`
- Combined comparison: `E:\www\fangtang\guoxin-jiedu-h5\homepage-avatar-layout-comparison.jpg`
- Source pixels: `414 × 736`.
- Implementation pixels: `414 × 736`; CSS viewport `414 × 736`; device scale factor `1`.
- Density normalization: none required because source and implementation dimensions match.
- State: homepage initial state with the teacher introduction visible.

## Full-view comparison evidence

- The implementation preserves the source page hierarchy, spacing, palette, typography, cards, guidance content, and fixed composer.
- The requested teacher region is corrected without changing adjacent homepage modules.
- The source screenshot's red annotation rectangle is review markup and is intentionally absent from the implementation.

## Focused region evidence

- Target region: `.consult-teacher-row`, containing the avatar plus the teacher name and message card.
- The teacher name and message card both render at `x = 71.53125px`; measured left-edge delta is `0px`.
- The message card begins below the teacher name at `y = 455.546875px`; the old negative-margin overlap is removed.
- The new `512 × 512` avatar visibly includes the full head, neck, both shoulders, and upper chest within the circular crop.
- The avatar renders at approximately `39.53 × 39.53px`, matching the existing compact teacher identity treatment.

## Required fidelity surfaces

- Fonts and typography: existing family, sizes, weights, line heights, emphasis colors, and wrapping are preserved; only the teacher-name block spacing changed.
- Spacing and layout rhythm: the avatar occupies a fixed left column while the teacher name and card share one right column; surrounding section rhythm is unchanged.
- Colors and visual tokens: paper background, ink text, orange emphasis, borders, radii, and shadows remain unchanged.
- Image quality and asset fidelity: the generated portrait matches the warm traditional-teacher art direction and remains sharp at mobile avatar size; shoulders are no longer cropped.
- Copy and content: all homepage copy remains unchanged.

## Findings

- No actionable P0, P1, or P2 differences remain for the requested teacher region.

## Comparison history

- Pass 1: source evidence showed the name visually colliding with the message card because the card used a negative top margin; the avatar crop showed only the head and neck.
- Fix: grouped name and card into one content column, removed the negative margin, and introduced a new shoulder-inclusive portrait asset.
- Pass 2: the browser-rendered comparison confirms a `0px` left-edge delta between name and card and a complete bust portrait inside the avatar circle.

final result: passed
