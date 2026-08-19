# Design QA

## Comparison target

- Source visual truth: `C:\Users\11075\AppData\Local\Temp\codex-clipboard-f252a78d-f85e-48c3-8f99-d208a671ab7c.png`
- Intended implementation route: `http://10.18.166.113:9999/`
- Source dimensions: `414 × 736` px.
- Intended viewport: `414 × 736` CSS px at device scale factor 1.
- State: root home page with the top-right hero badge visible.

## Full-view comparison evidence

- The source screenshot was opened at original resolution and confirms the badge position, rounded outline, and warm-paper styling.
- The implementation keeps the existing badge geometry and visual styles unchanged.
- Only the visible text and interaction contract changed: it now always reads “限时免费” and has no tap handler.
- A fresh browser-rendered screenshot is unavailable because the Codex in-app browser previously rejected the private-network preview URL.

## Focused region evidence

- Target region: the top-right pill over the hero image.
- Current source renders fixed text inside the existing `.consult-login-badge` element.
- Login-dependent computed text, login modal, and badge tap handler were removed.
- No focused post-change screenshot could be captured due to the local-network browser restriction.

## Required fidelity surfaces

- Fonts and typography: existing badge font size, spacing, truncation, and weight are unchanged.
- Spacing and layout rhythm: badge position, width constraints, height, padding, and radius are unchanged.
- Colors and visual tokens: border, background, text color, and shadow are unchanged.
- Image quality and assets: hero asset and crop are unchanged.
- Copy and content: badge now consistently displays “限时免费”.

## Findings

- [P2] Browser-rendered visual evidence is unavailable.
  - Location: homepage top-right badge.
  - Evidence: the in-app browser cannot currently open the private-network preview URL.
  - Impact: source, lint, and build are verified, but final live typography cannot be certified automatically.
  - Fix: manually refresh the root page and confirm the badge reads “限时免费” without responding to taps.

## Verification

- Targeted ESLint: passed.
- H5 production build: passed.
- Source search: dynamic login label and badge interaction code have been removed.

## Comparison history

- Pass 1: identified the top-right dynamic login/account badge as the requested change surface.
- Pass 2: replaced it with fixed, non-interactive “限时免费” text while preserving styling.
- Pass 3: lint and H5 build passed; browser evidence remained blocked by private-network policy.

final result: blocked
