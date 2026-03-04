# Prompt Builder — Handoff Brief
*For continuing development in a new chat session*

---

## What this tool is

The **Prompt Builder** is a guided, step-by-step web tool that helps teachers build differentiation prompts for an AI assistant (Claude, Gemini, ChatGPT). Teachers answer questions about their resource and students, and the tool assembles a structured, ready-to-use prompt from a library of expert-written prompt blocks.

It lives at `prompt-builder.html` inside a larger **Differentiation Manual** — a static site hosted at `https://educoder101.github.io/Differentiation-Manual/`. The manual is the pedagogical reference; the prompt builder is the action layer.

The tool is **entirely self-contained in a single HTML file**. All JS (including the prompt block library) is inlined. No build step, no framework, no backend.

---

## Files

### `prompt-builder.html`
The entire application. Contains:
- All CSS (embedded in `<style>`)
- All HTML panels (Steps 1–6 + output stage)
- The `PB` prompt block library (inlined `<script>`)
- All application JS (state, navigation, rendering, assembly)

### `prompt-blocks.js`
The **source of truth** for prompt block content. This is maintained separately and inlined into `prompt-builder.html` at deploy time. When editing block content, edit this file and re-inline.

Structure:
```
PB = {
  SUPPORT_OPTIONS   — array of support adjustment definitions (for Q3 left column)
  EXTENSION_OPTIONS — array of extension adjustment definitions (for Q3 right column)
  SOURCE            — object of all prompt block templates keyed by block ID
  buildBlock(key, ctx, extras) — assembles a single task instruction block
  getSource(key)
  listKeys()
}
```

---

## Step flow

```
Step 1    → Task type (only "Differentiate a Resource" is live; rest are "Coming soon")
Step 1b   → Resource type (4 options — see below)
Step 2    → Who for: Support / Extension / Both
Step 3    → What to change (audience-specific two-column selector, filtered by resource type)
Step 4    → Learning needs: EAL/D and/or Neurodiversity (each expands a checklist)
Step 5    → Context: year group, subject, learning intention, resource (paste or upload)
Step 6    → Output: Build vs Curate, Master vs Chain prompt
```

State is stored in a plain JS object:
```js
state = {
  q1: null,           // task type
  q1a: null,          // resource type
  q2: null,           // 'support' | 'extension' | 'both'
  q3Support: [],      // selected support option IDs
  q3Extension: [],    // selected extension option IDs
  q4: [],             // ['eald', 'neuro', 'neither']
  ctx: { year, subject, intention, resource },
  outputMode: 'build' | 'curate',
  delivery: 'master' | 'chain',
  curateSelected: []
}
```

Browser history is wired up — `history.pushState` on every panel transition, `popstate` handles browser back/forward.

---

## Resource types (Q1a)

Four active options, each with a hover tooltip:

| Value | Label | Description shown on hover |
|---|---|---|
| `r1-text-only` | Text only | A passage, article, source or extract with no accompanying task |
| `r1-text-questions` | Text + questions | A text followed by discrete comprehension or analytical questions |
| `r1-text-instructions` | Text + instructions | A text paired with an open-ended task — essay, argument, analysis |
| `r1-task-only` | Questions / instructions only | A question set or task sheet with no extended reading component |

The old values `r1-questions-only` and `r1-text-questions` (the original one) have been replaced by this four-way taxonomy. **Don't use the old values** — they're not in state handling anywhere.

---

## Q3 option visibility — the full table

Each option in `SUPPORT_OPTIONS` and `EXTENSION_OPTIONS` carries a `show` array listing which resource types it appears for. This is defined in `PB` and used by `buildQ3Columns()` to filter the rendered list.

### Support options

| Option ID | Label | text-only | text+Q | text+I | task-only |
|---|---|---|---|---|---|
| `sup-readability` | Simplify readability | ✓ | ✓ | ✓ | — |
| `sup-essential` | Identify essential passages | ✓ | ✓ | ✓ | — |
| `sup-digest` | Pre-reading digest | ✓ | ✓ | ✓ | — |
| `sup-analogy` | Use analogies to make concepts accessible | ✓ | ✓ | ✓ | — |
| `sup-visual` | Visual supports and multimodal redesign | ✓ | ✓ | ✓ | — |
| `sup-chunk` | Chunk instructions into sequential steps | — | ✓ | ✓ | ✓ |
| `sup-sentences` | Sentence starters for written responses | — | ✓ | ✓ | ✓ |
| `sup-syntax` | Simplified syntax version | ✓ | ✓ | ✓ | — |
| `sup-memory` | Working memory supports | ✓ | ✓ | ✓ | ✓ |

### Extension options

| Option ID | Label | text-only | text+Q | text+I | task-only |
|---|---|---|---|---|---|
| `ext-language` | Elevate academic language and nuance | ✓ | ✓ | ✓ | — |
| `ext-bigpicture` | Big picture framing | ✓ | ✓ | ✓ | — |
| `ext-abstract` | Concrete → abstract version of the text | ✓ | ✓ | ✓ | — |
| `ext-organiser` | Analytical graphic organiser | ✓ | ✓ | ✓ | ✓ |
| `ext-frames` | Academic language frames | — | ✓ | ✓ | ✓ |
| `ext-demand` | Increase cognitive demand of questions | — | ✓ | — | ✓ |
| `ext-opentask` | Open-ended / student-directed version | — | ✓ | ✓ | ✓ |
| `ext-modes` | Multiple response modes | — | ✓ | ✓ | ✓ |
| `ext-perspectives` | Add nuance: competing perspectives | ✓ | ✓ | ✓ | — |

**Rationale for cognitive demand:** It's about rewriting discrete questions (Bloom's), so it's only relevant where discrete questions exist. For text+instructions, the equivalent is `ext-opentask` or `ext-frames`.

This table is provisional. It will become clearer once teachers use the tool. Add/adjust `show` arrays in `PB.SUPPORT_OPTIONS` / `PB.EXTENSION_OPTIONS` as needed.

---

## Q3 column behaviour

- When Q2 = `support`: extension column is dimmed (opacity 0.38, greyscale, pointer-events none) with a notice explaining why
- When Q2 = `extension`: support column is dimmed
- When Q2 = `both`: both columns active
- Dimming is *not* hiding — the teacher can see what they're not selecting, which prompts reflection
- Descriptions under each option are hidden by default; they appear on hover and stay visible when the item is selected (CSS `max-height` transition)
- If a teacher goes back and changes resource type, previously selected options that are invalid for the new type are automatically cleared

---

## Prompt assembly architecture

### The core principle
The resource text is injected **once** in the preamble. Block templates reference "the resource above" — they never re-embed it. This was a deliberate fix to prevent the resource appearing multiple times in long prompts.

### buildMasterPrompt()
1. Assembles a preamble: context fields (year, subject, intention) + resource text under a ruled header
2. Collects all selected blocks in order: support → extension → EAL/D → neuro
3. Joins with `---` separators
4. Adds a task count instruction: "You have N tasks to complete…"

### buildChainPrompts()
Groups blocks into up to 3 steps:
- Step 1: support blocks (with full resource in preamble)
- Step 2: extension blocks (with note to use original resource)
- Step 3: EAL/D + neuro blocks (with handoff note)
- If only one group is active, produces a single step
- If support is empty (extension-only), step 1 becomes extension, step 2 becomes needs

### buildBlock(key, ctx, extras)
Returns a formatted task instruction:
```
TASK: [label]

[template with {{year}}, {{subject}}, {{intention}}, {{language}} injected]
```

Templates are written with the audience framing baked in (e.g. "Audience: Support students — reduce language barriers without reducing intellectual demand."). No external direction clause is prepended — each block already knows who it's for.

---

## Block library structure

Blocks in `SOURCE` are keyed by ID and grouped:

```
supportReadability, supportEssential, supportDigest, supportAnalogy,
supportVisual, supportChunk, supportSentences, supportSyntax, supportMemory

extensionLanguage, extensionBigPicture, extensionAbstract, extensionOrganiser,
extensionFrames, extensionDemand, extensionOpenTask, extensionModes, extensionPerspectives

ealdGlossary, ealdSubjectVocab, ealdSentenceFrames, ealdVisualSupports,
ealdSyntax, ealdMandarin, ealdOtherLanguage

neuroChunked, neuroWorkingMemory, neuroWhiteSpace, neuroExplicitProcess,
neuroReducedOutput, neuroTTS, neuroAnchor
```

Each block has:
- `audience`: `'support' | 'extension' | 'eald' | 'neuro'`
- `source`: attribution to the manual page it came from
- `label`: short task label (used in TASK: header)
- `template`: the prompt text with `{{placeholder}}` injection points

**All block content is drawn from or adapted from the Differentiation Manual** (step3-content.html, step3-process.html, step5-equalizer.html, step6-scaffolding.html). Do not add blocks without a manual source, or flag clearly if written fresh.

---

## Design principles — the decisions we kept returning to

**Labels over descriptions by default.** The Q3 list was overwhelming with all descriptions visible. Descriptions now collapse and show only on hover / when selected. Same principle applied to Q1a resource type cards. Apply this pattern to any new multi-option panels.

**Dimming not hiding.** When a Q2 direction isn't selected, the corresponding Q3 column is dimmed — not removed. The teacher can see what they're not choosing. This prompts pedagogical reflection rather than just simplifying the UI.

**No direction clause on blocks.** Earlier versions prepended "This task is for support students…" as a separate clause. We removed this in favour of baking the audience framing into the template prose itself. Keeps blocks readable and avoids repetition.

**Resource injected once.** Earlier versions had `{{resource}}` in every block template. Fixed: resource appears once in the preamble, blocks say "the resource above".

**Self-contained file.** `prompt-blocks.js` is inlined into `prompt-builder.html` for distribution. Teachers download a single file. When developing, maintain `prompt-blocks.js` separately and re-inline.

**EAL/D is a separate axis.** EAL/D is not a subset of support. Extension students can also be EAL/D. EAL/D adjustments are about language access, not readiness scaffolding. It lives in Step 4 as its own category.

**Chain prompt grouping is by audience, not by text/questions split.** The original design split chain prompts into "text tasks then question tasks". The new design splits by audience: support tasks → extension tasks → learning needs adjustments. This maps better to how teachers use the output (they apply the support version to one group and the extension version to another).

---

## Known rough edges / flagged for later

- **Option list is provisional.** The `show` arrays mapping options to resource types will need refinement once real teachers use the tool. The table above is our best instinct.
- **Cognitive demand for text+instructions** is currently hidden. May be worth adding once we have user feedback — the argument against is that for open tasks, "open-ended version" does the same job better.
- **Sentence starters vs academic language frames** overlap slightly. Sentence starters (support) are about access; language frames (extension) are about discipline-specific precision. They're different enough to keep separate, but the distinction may need explaining in the UI.
- **File upload** is currently limited — .txt only reads cleanly; PDF/docx extraction is basic. Full document reading was planned for Gemini API integration (not yet built).
- **No validation on Q1a** — a teacher can click Next without selecting a resource type and Q3 will render with `state.q1a = null`, filtering out all options. Should add a `!state.q1a` guard in `goToPanel`.
- **The "I'll curate" output mode** (curate vs build) generates component cards correctly, but hasn't been heavily tested end-to-end.
- **Browser history** is wired but `q1a` is labelled "Step 1b of 6" in the progress bar — which is slightly odd UX. This could be smoothed out later (treat 1a and 1b as a single numbered step, or renumber).

---

## What hasn't been built yet

### Task types (Step 1 — "Coming soon" items)
The following task types are stubbed but not implemented:
- Differentiate a Lesson
- Ideate Support Strategies
- Ideate Extension Strategies
- Plan a Lesson Sequence
- Plan a Unit
- Create Assessment
- Set Up Classroom Systems

Each will need its own question flow (different from the resource flow). The resource flow is the template — new flows will likely diverge significantly.

### Resource types (Q1a — "Coming soon" in original; now replaced)
The original had additional stubbed types: Worksheet / structured task, Explanation or instructional text, Visual resource, Maths problem set, Assessment task or rubric, Something else. These were removed in the redesign. They may come back as the tool matures — particularly Maths problem set (different differentiation logic) and Visual resource.

### Prompt blocks not yet written
The current block library covers the main differentiation levers from the manual. Sections not yet represented as blocks:
- **step4-align.html** — KUDs alignment (Know / Understand / Do framework)
- **step2-learners.html** — learner profile considerations (readiness vs interest vs learning profile)
- Any blocks that would support the "Differentiate a Lesson" or "Plan a Unit" task types

### Output stage features not yet built
- Export to Google Doc / copy-formatted button (planned)
- Prompt history / saved prompts (planned, would need localStorage or backend)
- "Show me an example output" preview mode

---

## Where the project lives

- **GitHub repo:** `educoder101/Differentiation-Manual`
- **Live site:** `https://educoder101.github.io/Differentiation-Manual/`
- **Prompt builder URL:** `https://educoder101.github.io/Differentiation-Manual/prompt-builder.html`
- The site is a flat static site — no build step. All pages are plain HTML.
- The manual pages (`step3-content.html`, `step5-equalizer.html`, etc.) are the **source of truth for pedagogical content**. Block templates in `prompt-blocks.js` are adapted from these pages. Always cross-reference.

---

## How to continue development

1. Drop `prompt-builder.html` into a new chat as an uploaded file
2. Use this document as your system brief
3. When editing `prompt-blocks.js` content separately, re-inline it into `prompt-builder.html` with:
   ```python
   with open('prompt-builder.html', 'r') as f: html = f.read()
   with open('prompt-blocks.js', 'r') as f: pb = f.read()
   html = html.replace('<script src="js/prompt-blocks.js"></script>', f'<script>\n{pb}\n</script>')
   ```
4. Always test by downloading and opening locally — the live GitHub site lags behind local edits
5. The file is large (~3000 lines). Use `str_replace` for targeted edits rather than full rewrites where possible.

---

*Last updated: February 2026. Context window: prompt-builder-audience-split-redesign chat.*
