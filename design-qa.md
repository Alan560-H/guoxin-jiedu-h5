# Design QA

## Comparison target

- Source visual truth: `C:\Users\11075\AppData\Local\Temp\codex-clipboard-27b74b24-ff25-422a-9e30-fd51154d1cc3.png`
- Implementation route: `http://10.18.166.113:9999/`
- Implementation screenshot: `E:\www\fangtang\guoxin-jiedu-h5\homepage-menu-grid-mobile.jpg`
- Combined comparison: `E:\www\fangtang\guoxin-jiedu-h5\homepage-menu-grid-comparison.jpg`
- Source pixels: `414 × 743`.
- Browser capture: `1280 × 720`; centered app viewport cropped to `414 × 720` for comparison.
- CSS app width: `414px`; density normalization: device scale factor `1`, no resampling.
- State: homepage initial state with all four menu entries visible.

## Full-view comparison evidence

- The former four-row menu is replaced by the requested two-row, two-column grid, reducing the menu region from about four card heights to two.
- The hero, conversation, teacher card, and fixed composer retain their existing visual hierarchy and warm-paper styling.
- More of the teacher conversation is visible above the fixed composer after the grid compaction.

## Focused region evidence

- All four `.consult-entry-card` elements render at `162 × 60px` inside the `414px` app viewport.
- Row and column spacing are both approximately `7px`, preserving the prior rhythm at half scale.
- Every card keeps the requested structure: icon on the left, title and subtitle stacked on the right, compact chevron at the far edge.
- Rendered `scrollWidth` equals `clientWidth` for every title and subtitle; no text is clipped or ellipsized at the target width.
- The generated calendar and material-access icons retain transparent corners, crisp circular silhouettes, and the same gold-medallion art direction as the existing icons.

## Required fidelity surfaces

- Fonts and typography: title weight and hierarchy are preserved; sizes are reduced proportionally for the half-width cards, with single-line title and subtitle rendering.
- Spacing and layout rhythm: the requested `2 × 2` grid is present; card padding, icon gap, radii, and row/column gaps are visually balanced.
- Colors and visual tokens: paper cards, navy titles, muted subtitles, gold chevrons, borders, and shadows reuse the existing homepage tokens.
- Image quality and asset fidelity: both new generated icons are `128 × 128` RGBA PNGs with transparent backgrounds and match the existing gold circular icon family.
- Copy and content: entries display `万年历 / 择日宜忌，节气尽览` and `资料获取 / 添加老师，领取资料` exactly.

## Interaction and console evidence

- The homepage DOM contains all four menu labels and both new descriptions.
- Source handlers point to the supplied perpetual-calendar and enterprise-WeChat URLs.
- Direct automated navigation to the enterprise-WeChat URL was blocked by the browser safety policy, so that destination should receive one manual click check.
- Browser console warnings/errors after rendering: none.

## Findings

- No actionable P0, P1, or P2 visual differences remain.
- Residual test gap: enterprise-WeChat external navigation requires manual confirmation because automated navigation is safety-blocked.

## Comparison history

- Pass 1: four full-width cards consumed too much vertical space and pushed the conversation downward.
- Fix: changed the entry container to a two-column grid and compacted card padding, icon size, typography, and chevrons while retaining the existing information structure.
- Pass 2: the browser-rendered comparison confirms two rows, four equal cards, no title/subtitle overflow, and substantially more visible conversation content.

final result: passed
