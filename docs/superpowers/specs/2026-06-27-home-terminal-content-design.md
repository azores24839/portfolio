# Home Terminal Content Update

## Scope

Update the terminal-style window and desktop hero composition. Preserve existing animation, interaction, and mobile stacking behavior.

## Title

- Change the window title to `sihua-zsh`.
- Make the title use the same font-family declaration as the Finder window title `~/yanliu/project`.
- Do not copy unrelated Finder title styles such as color, size, spacing, or alignment.

## Terminal content

Render the following text with the shown line breaks:

```text
~ $ whoami
SJTU Industrial Design M.A. student from Malaysia
Multilingual (Chinese · English · Malay)
Focus on visual design

~ $ intent/
Visual Design · AI Video · Brand Creative · UIUX

~ $ skills/
Visual Design · Product Design · UX Research · AI Thinking · Vibe Coding · Motion & Video
```

Do not include a Chinese full stop after `Motion & Video`.

## Desktop composition

- Increase the terminal width to `480px`, reduce its body line-height to `1.55`, and represent group separation with a compact 6px spacer rather than a full empty text line. Do not clip terminal content.
- Align the portfolio signature to the viewport center using the scaled stage offset.
- Move the black badge upward so the badge card bottom remains in the upper half of a 720px-tall desktop viewport.
- Move decorative objects toward the left and right stage boundaries to create a clear central negative space around the portfolio signature.
- Keep mobile element order and relative-flow layout unchanged.

## Verification

- Confirm the title reads `sihua-zsh`.
- Confirm its font family matches the Finder title.
- Confirm all terminal text, separators, capitalization, and compact group gaps match this specification.
- Confirm the page still loads without console errors and existing window behavior remains intact.
