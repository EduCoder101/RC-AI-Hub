/**
 * PROMPT BLOCKS — Differentiation Manual
 * ========================================
 * Source-of-truth library for the Prompt Builder.
 *
 * Every prompt here is drawn directly from the Differentiation Manual
 * (step3-content.html, step3-process.html, step5-equalizer.html,
 * step6-scaffolding.html). Do not edit the source text without updating
 * the corresponding manual page.
 *
 * Source key:
 *   C  = step3-content.html
 *   P  = step3-process.html
 *   E  = step5-equalizer.html
 *   S  = step6-scaffolding.html
 *
 * ARCHITECTURE — how prompts are assembled:
 * ─────────────────────────────────────────
 * The resource, year group, subject, and learning intention are injected
 * ONCE into the preamble by buildMasterPrompt() / buildChainPrompts()
 * in prompt-builder.html. They must NOT be repeated inside block templates.
 *
 * Each block template is a self-contained task instruction that refers to
 * "the resource above" rather than re-embedding the resource text.
 *
 * The direction clause (support / extension / both) is only prepended to
 * blocks where it is semantically meaningful — i.e. blocks that produce
 * multiple versions of the same content. Blocks that produce a single
 * output (glossaries, layout fixes, TTS reformatting, etc.) do not receive
 * a direction clause.
 *
 * Context injection placeholders still used inside block templates:
 *   {{year}}        → Q5: Year group
 *   {{subject}}     → Q5: Subject / topic
 *   {{intention}}   → Q5: Learning intention
 *   {{language}}    → EAL/D: Other language field
 *
 * Placeholders NO LONGER used inside blocks (injected in preamble only):
 *   {{resource}}    — removed from all block templates
 *
 * Usage:
 *   const block = PB.buildBlock('readability', ctx, direction);
 *   // Returns a task instruction string. Resource is in the preamble.
 */

const PB = (() => {

  // ─── CONTEXT INJECTION ────────────────────────────────────────────────────
  // Replaces placeholder patterns with teacher-supplied context.
  // Note: {{resource}} patterns are no longer present in block templates —
  // this function handles year/subject/intention/language only.

  function inject(template, ctx, extras) {
    const lang    = (extras && extras.language) ? extras.language : '[home language]';
    const year    = ctx.year      || '[year group]';
    const subject = ctx.subject   || '[subject/topic]';
    const intention = ctx.intention || '[learning intention]';

    return template
      .replace(/\{\{year\}\}/gi, year)
      .replace(/\[year group\]/gi, year)
      .replace(/\[Year Level\]/g, year)
      .replace(/\[grade level\]/gi, year)
      .replace(/\{\{subject\}\}/gi, subject)
      .replace(/\[subject\/topic\]/gi, subject)
      .replace(/\[topic\]/gi, subject)
      .replace(/\{\{intention\}\}/gi, intention)
      .replace(/\[paste LI\]/gi, intention)
      .replace(/\[paste KUDs\]/gi, intention)
      .replace(/\[state the essential KUD\]/gi, intention)
      .replace(/\{\{language\}\}/gi, lang)
      .replace(/\[language\]/g, lang);
  }

  // ─── DIRECTION CLAUSE ─────────────────────────────────────────────────────
  // Used ONLY for blocks that genuinely produce multiple versions.
  // Returns null for blocks where a direction is not applicable.

  function directionClause(direction, subject) {
    if (!direction) return null;
    if (direction === 'support')   return `This task is for students who need additional support and scaffolding. Reduce barriers to access — do not reduce intellectual demand.`;
    if (direction === 'extension') return `This task is for students ready for greater depth and challenge. Increase complexity, abstraction, and autonomy — not volume or workload.`;
    if (direction === 'both')      return `Produce two clearly labelled versions:\n— Support version: additional scaffolding, same intellectual standard\n— Extension version: greater depth and complexity, same learning goal`;
    return null;
  }

  // ─── BLOCK TYPE METADATA ──────────────────────────────────────────────────
  // Declares whether each block type produces direction-dependent output.
  // Blocks marked useDirection: false never receive a direction clause,
  // because they produce a single output regardless of the direction chosen.

  const BLOCK_META = {
    readability:       { useDirection: true  },
    conceptComplexity: { useDirection: true  },
    length:            { useDirection: false },   // always produces one shorter version
    backgroundKnowledge:{ useDirection: false },  // always produces one digest
    visualSupports:    { useDirection: false },   // always produces one multimodal version
    cognitiveDemand:   { useDirection: true  },
    questionScaffolding:{ useDirection: true  },  // meaningful to vary scaffolding level
    studentChoice:     { useDirection: false },   // the block itself creates both structured/open versions
    chunking:          { useDirection: false },   // always produces one chunked version
    responseMode:      { useDirection: false },   // always produces three response modes
    ealdGlossary:      { useDirection: false },
    ealdSubjectVocab:  { useDirection: false },
    ealdSentenceFrames:{ useDirection: true  },   // can meaningfully vary scaffold level
    ealdVisualSupports:{ useDirection: false },
    ealdSyntax:        { useDirection: false },
    ealdMandarin:      { useDirection: false },
    ealdOtherLanguage: { useDirection: false },
    neuroChunked:      { useDirection: false },
    neuroWorkingMemory:{ useDirection: false },
    neuroWhiteSpace:   { useDirection: false },
    neuroExplicitProcess:{ useDirection: false },
    neuroReducedOutput:{ useDirection: false },
    neuroTTS:          { useDirection: false },
    neuroAnchor:       { useDirection: false },
  };

  // ─── SOURCE PROMPTS ───────────────────────────────────────────────────────
  // Templates refer to "the resource above" — they do NOT embed the resource.
  // Context fields (year, subject, intention) are still injected inline where
  // the phrasing of the instruction depends on them.

  const SOURCE = {

    // ── TEXT ADJUSTMENTS ─────────────────────────────────────────────────────

    readability: {
      // Source: C — "Create Tiered Versions of a Text"
      source: 'step3-content.html — Tiered Texts & Resource Materials',
      label: 'Adjust readability',
      template: `Using the resource above, create tiered versions of the text as follows:
- Support version: Simplified vocabulary and sentence structure for students reading below grade level. Maintain the conceptual integrity — do not "dumb down" the ideas, make them more accessible.
- Extension version: Increased complexity, academic vocabulary, and additional nuance for advanced readers.

Ensure all versions convey the same core concepts and maintain similar length (±20%).`
    },

    conceptComplexity: {
      // Source: E — "Create Concrete and Abstract Versions" + C — "Generate Multiple Analogies"
      source: 'step5-equalizer.html — Concrete ↔ Abstract + step3-content.html — Analogy Generator',
      label: 'Adjust concept complexity (concrete ↔ abstract)',
      template: `Using the resource above, complete the following two steps:

Step 1 — Create two versions:
- Concrete version: Focuses on specific, tangible information and examples. Uses "What" questions. Illustrates abstract ideas with concrete real-world examples.
- Abstract version: Focuses on themes, implications, and underlying principles. Uses "Why" and "what does this mean" questions. Asks students to work with generalisations and transferable ideas.

Both versions must address the same core content but at different levels of abstraction.

Step 2 — For the abstract version, generate 3 analogies that make the key concept more approachable. For each analogy:
- Explain it in 2–3 sentences, as you'd say it to a student
- Map the key elements: "In this analogy, [X] represents [Y]"
- Note where the analogy breaks down, so it doesn't accidentally create a misconception`
    },

    length: {
      // Source: C — "Identify Key Passages"
      source: 'step3-content.html — Highlighted Print Materials',
      label: 'Identify key passages and produce a shortened version',
      template: `Using the resource above, help identify what is essential and what can be reduced for students who need a shorter version:

1. Which paragraphs or passages contain the essential information aligned to this learning intention: {{intention}}
2. Which sections are supplementary — they provide examples or extension but aren't critical for all students
3. A suggested highlighting or reading strategy (e.g. "Read highlighted sections first, then return to the full text if time permits")

Then produce a shortened version containing only the essential passages, with brief bridging sentences where needed to maintain coherence.`
    },

    backgroundKnowledge: {
      // Source: C — "Create a Content Digest"
      source: 'step3-content.html — Digest of Key Ideas',
      label: 'Create a pre-reading digest',
      template: `Using the resource above, create a one-page digest that students can use as a reference before and while they read. Include:
- Essential Question: The big question this content answers
- Key Vocabulary: 5–8 terms with student-friendly definitions appropriate for {{year}}
- Main Concepts: The 3–4 core ideas students must grasp
- Guiding Questions: 4–5 questions to focus reading and activate prior knowledge

Format it clearly so students can use it as a reference while they read.`
    },

    visualSupports: {
      // Source: C — "Convert to Multimodal Format"
      source: 'step3-content.html — Neurodiversity-Responsive Content Design',
      label: 'Add visual supports and multimodal design',
      template: `Context: The resource above is primarily text-based and needs to be made more accessible for students who process information better with visual supports.
Objective: Redesign it as a multimodal version using text, simple visuals, and colour coding.
Instructional nuance: Use colour and visuals purposefully, not decoratively. Each element should support comprehension.

Working from the resource above, please:
- Keep key instructions and content but make them concise and concrete
- Suggest simple icons, diagrams, or symbols to represent key steps or concepts — describe each clearly enough that I can create or find them
- Suggest a colour scheme to help students distinguish between types of information (e.g. instructions vs. examples, sequence, importance)

Provide:
- Revised text with [VISUAL] placeholders showing where visuals go
- Description of each suggested visual
- Colour coding rationale (e.g. "Blue = instructions, Green = examples")`
    },

    // ── QUESTION ADJUSTMENTS ─────────────────────────────────────────────────

    cognitiveDemand: {
      // Source: P — "Tier by Adjusting Cognitive Demand"
      source: 'step3-process.html — Tiered Questions by Cognitive Demand',
      label: 'Adjust cognitive demand of questions',
      template: `Using the questions / task in the resource above, create versions that adjust the cognitive demand using Bloom's Taxonomy:
- Support version (Remember/Understand): Students recall, identify, and describe. Questions are concrete and focused on what the text says.
- Extension version (Evaluate/Create): Students evaluate, argue, synthesise, or create. Questions ask students to go beyond the text — to judge, compare with other ideas, or generate something new.

Ensure all versions require genuine thinking. The support version isn't "easier" — it addresses a different level of cognitive complexity. Do not remove intellectual demand from the support version; reduce abstraction instead.`
    },

    questionScaffolding: {
      // Source: S — "Generate Sentence Starters" + S — "Break Down a Complex Task"
      source: 'step6-scaffolding.html — Sentence Starters & Thinking Stems + Break Down a Complex Task',
      label: 'Add question scaffolds (sentence starters + task breakdown)',
      template: `Using the questions / task in the resource above:

Part 1 — Sentence starters:
Create 8–10 sentence starters that help students respond to these questions. Include starters that help them:
- Begin their response
- Add evidence or examples from the text
- Make connections between ideas
- Draw conclusions

Use academic but accessible language appropriate for {{year}}.

Part 2 — Task breakdown:
Break the most complex question or task into 5–8 clear, manageable steps that:
- Are sequenced logically
- Each feel achievable on their own
- Include a brief success criterion for each step
- Build toward the complete response

Use student-friendly language appropriate for {{year}}.`
    },

    studentChoice: {
      // Source: E — "Adjust Level of Structure"
      source: 'step5-equalizer.html — Structured ↔ Open-Ended',
      label: 'Create structured and open-ended versions',
      template: `Using the task / question set in the resource above, create two versions that adjust the level of student autonomy:

Structured version: Provide step-by-step directions, sentence frames, templates, or specific requirements. Students follow a clear path to demonstrate their understanding.

Open-ended version: Provide the goal and success criteria, but let students determine their approach, structure, and process. Students make genuine decisions about how to demonstrate their understanding.

Both versions must result in equivalent evidence of learning against this learning intention: {{intention}}
Vary the independence, not the intellectual standard.`
    },

    chunking: {
      // Source: C — "Rewrite with Chunked Steps and Concrete Language"
      source: 'step3-content.html — Neurodiversity-Responsive Content Design',
      label: 'Rewrite questions as chunked, sequential steps',
      template: `Context: The questions or task instructions in the resource above may be difficult for students who need concrete, sequential information — steps may be bundled together, language may be abstract, or expectations may be implied rather than stated.
Objective: Rewrite as numbered steps using clear, concrete language.
Instructional nuance: Replace abstract concepts with concrete examples. Use active verbs. Make implicit steps explicit. One clear action per step.

Working from the resource above, please rewrite the questions / instructions as:
- Numbered steps (no more than 8 if possible)
- Concrete, specific language — no metaphors, abstract terms, or implied information
- Active verbs that tell students exactly what to do
- One clear action per step

If any step is still complex, break it into sub-steps (e.g. 3a, 3b).

Also note any abstract or implicit language you changed and explain why the original phrasing may have been confusing.`
    },

    responseMode: {
      // Source: written for Prompt Builder — no direct manual equivalent
      source: 'Prompt Builder — Mode of Response (written for this tool)',
      label: 'Offer multiple response modes',
      template: `Using the task / question set in the resource above, redesign the questions to offer students a genuine choice in how they demonstrate their understanding. Provide at least three response mode options:

1. Written response: Redesign the question so it genuinely requires students to think, not just transcribe.
2. Visual response: A diagram, annotated image, concept map, flowchart, or other visual — specify exactly what it should show and how it should be labelled.
3. Oral / structured verbal response: A spoken response, recorded explanation, or structured discussion prompt — specify the format and what the student should cover.

For each mode: write the question or task instruction as the student would receive it.
Ensure each mode genuinely assesses the same learning intention: {{intention}} — the mode changes, not the cognitive demand.`
    },

    // ── EAL/D ADJUSTMENTS ────────────────────────────────────────────────────

    ealdGlossary: {
      // Source: S — "Create Tier 2/3 Vocabulary List with Definitions"
      source: 'step6-scaffolding.html — Tier 2/3 Vocabulary List',
      label: 'Create a key vocabulary glossary (Tier 2/3)',
      template: `Context: I'm teaching {{subject}} to {{year}} students. My EAL/D students need explicit vocabulary support to access this content.
Objective: Identify and define the key academic vocabulary students will need.
Instructional nuance: Focus on Tier 2 (high-utility academic words like "analyse," "synthesise") and Tier 3 (domain-specific terms). Provide student-friendly definitions — avoid circular language.

Working from the resource above:
- Identify 8–12 key vocabulary terms (mix of Tier 2 and Tier 3)
- For each term, provide:
  — A student-friendly definition appropriate for {{year}}
  — An example sentence showing the word used in context
  — Whether it is Tier 2 (general academic) or Tier 3 (subject-specific)

Format the output as a table: Term | Definition | Example sentence | Tier`
    },

    ealdSubjectVocab: {
      // Source: S — "Create Tier 2/3 Vocabulary List" (subject-specific variant)
      source: 'step6-scaffolding.html — Tier 2/3 Vocabulary List (subject-specific)',
      label: 'Unpack subject-specific language',
      template: `Context: I'm teaching {{subject}} to {{year}} students. My EAL/D students need explicit support with the subject-specific language of this discipline — not just vocabulary definitions, but an understanding of how this discipline uses language and what it expects of them.
Objective: Surface and explain the subject-specific vocabulary and language patterns in this content.
Instructional nuance: Each discipline has its own language. In geography, "explain the relationship between..." expects a particular kind of response. In science, "hypothesis" has a precise meaning unlike everyday usage. Make these demands explicit.

Working from the resource above:
1. Identify 6–10 subject-specific terms that carry precise meaning in {{subject}} — terms that differ from everyday usage or that EAL/D students are unlikely to encounter outside this subject
2. For each term: provide a student-friendly definition and note how the meaning differs from everyday English where relevant
3. Identify 3–4 subject-specific language patterns or task verbs in this content (e.g. "justify," "account for," "to what extent") and explain in plain language what each one is asking students to do
4. Format as a reference sheet students can keep beside the resource`
    },

    ealdSentenceFrames: {
      // Source: S — "Generate Sentence Starters" (EAL/D framing)
      source: 'step6-scaffolding.html — Sentence Starters & Thinking Stems',
      label: 'Create EAL/D sentence frames',
      template: `Using the task / questions in the resource above, create sentence starters and frames specifically designed to support EAL/D students in constructing academic written responses. Include frames that help students:
- Begin their response using appropriate academic register
- Introduce evidence or examples from the text
- Explain the significance of evidence ("This shows that...", "This suggests...")
- Make connections between ideas
- Draw conclusions

Provide 10–12 frames in total. Use language that is academically appropriate for {{year}} but accessible to students who are still developing English proficiency. Avoid idiomatic phrases.

Also provide a brief note for the teacher on which frames are most useful for early-stage vs. developing EAL/D learners.`
    },

    ealdVisualSupports: {
      // Source: S — "Add Visual Supports to Vocabulary"
      source: 'step6-scaffolding.html — Add Visual Supports to Vocabulary',
      label: 'Suggest visual supports for vocabulary',
      template: `Context: The key vocabulary in the resource above would be more accessible if students had visual cues alongside definitions.
Objective: Suggest simple icons, symbols, or visual representations that would support vocabulary learning for EAL/D students.
Instructional nuance: Visuals should be simple, unambiguous, and culturally appropriate — memory aids and comprehension supports, not artwork.

For the key vocabulary in the resource above, suggest:
- A simple visual representation for each term (icon, symbol, diagram, or gesture — describe it clearly enough that I can create or source it)
- Why this visual support helps students remember or understand the term
- How I could practically represent this in the classroom (e.g. printed icon beside the definition, hand gesture, quick sketch on the board)

Prioritise visuals that are simple to draw or find, unambiguous across cultures, and memorable.`
    },

    ealdSyntax: {
      // Source: C — "Create Tiered Versions" with EAL/D framing
      source: 'step3-content.html — Tiered Texts (EAL/D syntax variant)',
      label: 'Produce a simplified syntax version',
      template: `Context: Some EAL/D students can engage with the ideas in the resource above but are held back by complex sentence structures, embedded clauses, and dense academic syntax.
Objective: Produce a simplified syntax version of the text that reduces linguistic complexity without reducing conceptual demand.
Instructional nuance: This is not about simplifying the ideas — the concepts should remain intact. Simplify sentence structures: shorten sentences, unpack embedded clauses, prefer active over passive voice, and make implicit logical connections explicit.

Working from the resource above, produce a simplified syntax version that:
- Uses shorter sentences (aim for an average of 15–20 words per sentence)
- Unpacks embedded clauses into separate sentences
- Prefers active voice over passive voice
- Makes logical connections explicit ("Because of this...", "As a result...", "This means that...")
- Retains all key vocabulary (with brief inline definitions in brackets where needed)
- Preserves the original meaning and conceptual depth

After the revised text, provide a brief note on the main structural changes you made.`
    },

    ealdMandarin: {
      // Source: S — "Create a Bilingual Glossary"
      source: 'step6-scaffolding.html — Create a Bilingual Glossary',
      label: 'Create a bilingual English–Mandarin glossary',
      template: `Context: I have EAL/D students whose home language is Mandarin who need vocabulary support to access this content.
Objective: Generate a bilingual glossary that pairs English academic vocabulary with Mandarin translations and explanations.
Instructional nuance: This is a scaffold, not a replacement for English instruction. The Mandarin column provides a cognitive anchor so students can focus on concept learning. Include student-friendly definitions in both languages — not just direct word translations, which often miss nuance.

Working from the resource above, create a bilingual English–Mandarin glossary with:
- Each key term in English with a student-friendly definition appropriate for {{year}}
- The same term in Mandarin (simplified characters) with an equivalent student-friendly explanation
- A simple example sentence in English showing the term in context

Format as a two-column table suitable for printing. Keep definitions to one sentence each.
Important: If a direct translation doesn't capture the meaning well, note this and provide a brief explanation rather than a misleading literal translation.`
    },

    ealdOtherLanguage: {
      // Source: S — "Create a Bilingual Glossary" + "Translate Key Task Instructions"
      source: 'step6-scaffolding.html — Bilingual Glossary + Translate Task Instructions',
      label: 'Create a bilingual glossary + translated task instructions',
      template: `Context: I have EAL/D students whose home language is {{language}} who need both vocabulary support and clarity on task instructions.
Objective: Produce two resources: a bilingual glossary and a translated task instructions sheet.
Instructional nuance: The home-language resources are cognitive anchors — they help students focus on the learning rather than decoding the language. Include student-friendly definitions, not just direct translations.

Working from the resource above:

Part 1 — Bilingual Glossary (English / {{language}}):
- Identify 8–12 key terms from the content
- For each term: English definition appropriate for {{year}}, {{language}} translation with brief explanation, example sentence in English
- Format as a two-column table for printing
- If a direct translation misses nuance, note this and provide a brief explanation instead

Part 2 — Translated Task Instructions:
- Translate the task instructions into {{language}}, maintaining the same sequence
- Highlight any English academic phrases likely to cause confusion (e.g. "justify," "analyse," "compare and contrast") and provide both the {{language}} equivalent and a plain-English alternative
- Format with English on the left and {{language}} on the right`
    },

    // ── NEURODIVERSITY / LEARNING NEEDS ADJUSTMENTS ───────────────────────────

    neuroChunked: {
      // Source: C — "Rewrite with Chunked Steps and Concrete Language"
      source: 'step3-content.html — Neurodiversity-Responsive Content Design',
      label: 'Rewrite with chunked steps and concrete language',
      template: `Context: The resource above may contain instructions or content that are difficult for students who need concrete, sequential information — steps may be bundled together, the language may be abstract, or expectations may be implied rather than stated.
Objective: Rewrite as numbered steps using clear, concrete language.
Instructional nuance: Replace abstract concepts with concrete examples. Use active verbs. Make implicit steps explicit. One clear action per step.

Working from the resource above, rewrite the instructions and/or questions as:
- Numbered steps (no more than 8 if possible)
- Concrete, specific language — no metaphors, abstract terms, or implied information
- Active verbs that tell students exactly what to do
- One clear action per step

If any step is still complex, break it into sub-steps (e.g. 3a, 3b).

Note any abstract or implicit language you changed and explain why the original phrasing may have been confusing for students who need explicit instruction.`
    },

    neuroWorkingMemory: {
      // Source: C — "Suggest Strength-Based Support for Working Memory"
      source: 'step3-content.html — Neurodiversity-Responsive Content Design',
      label: 'Design working memory supports',
      template: `Context: Some students have working memory challenges and struggle to hold multiple pieces of information in mind while completing tasks.
Objective: Design supports that reduce working memory demands while affirming student strengths.
Instructional nuance: Frame supports as tools for efficiency, not accommodations for deficiency. Use a strengths-first lens.

Working from the resource above:

First, identify what this task requires students to hold in working memory simultaneously (e.g. remember the question while reading the text, track multiple steps, recall prior knowledge while generating a response).

Then suggest 3–4 strength-based supports that would reduce working memory demands. For each support:
- Describe the tool or strategy
- Explain how it reduces cognitive load
- Frame it positively (e.g. "This tool helps you work efficiently" — not "This is for students who can't remember")

Suitable tools might include: reference sheets, colour-coded reminders, graphic organisers, partially completed frames, read-aloud cues, or chunked check-in points.`
    },

    neuroWhiteSpace: {
      // Source: C — "Convert to Multimodal Format" (layout variant)
      source: 'step3-content.html — Neurodiversity-Responsive Content Design (layout)',
      label: 'Improve layout and reduce visual clutter',
      template: `Context: The resource above needs to be redesigned so it is easier to navigate for students who experience visual overwhelm, have difficulty organising information on a page, or benefit from a cleaner layout.
Objective: Suggest specific layout adjustments that reduce visual density without changing the content.
Instructional nuance: Visual clutter increases cognitive load. White space, clear hierarchy, and consistent formatting all reduce the effort required to find and process information.

Working from the resource above, please provide:
1. A redesigned version of the text with improved layout — more white space between sections, clear visual hierarchy, shorter paragraphs or sections
2. Specific formatting recommendations:
   - Font and size recommendations
   - Suggested line spacing
   - How to use headings and subheadings to create clear visual structure
   - How to chunk content visually (boxes, dividers, numbering)
3. Any content that could be moved to a separate reference sheet to reduce the visual load of the main task`
    },

    neuroExplicitProcess: {
      // Source: S — "Break Down a Complex Task"
      source: 'step6-scaffolding.html — Break Down a Complex Task',
      label: 'Create an explicit process guide',
      template: `Working from the task in the resource above, create an explicit process guide — a step-by-step procedure that students can follow independently. The guide should:
- Break the task into 5–8 clear, manageable steps, sequenced logically
- Include a success criterion for each step so students know when they're done
- Use concrete, active language — tell students exactly what to do at each step
- Flag any decision points (where students have to make a choice) and briefly explain how to make that decision
- End with a self-check list: 4–5 questions the student asks themselves before submitting

Use student-friendly language appropriate for {{year}}. The goal is that a student who is unsure what to do next can consult this guide and get unstuck without needing teacher input.`
    },

    neuroReducedOutput: {
      // Source: written for Prompt Builder — no direct manual equivalent
      source: 'Prompt Builder — Reduced Output Options (written for this tool)',
      label: 'Offer alternative output options',
      template: `Context: Some students are held back not by the thinking required but by the output required — extended written responses can create a barrier that masks genuine understanding.
Objective: Redesign the task in the resource above to offer output alternatives that reduce the written production demand while maintaining the cognitive demand.
Instructional nuance: The goal is to assess understanding, not writing stamina. Alternative outputs should require equivalent thinking, expressed differently.

Working from the resource above, redesign the task to offer three output alternatives that each demonstrate the same understanding:

1. Annotated diagram or visual: Describe exactly what students should create and annotate — what should be labelled, what needs to be shown.
2. Structured spoken/recorded response: Provide the exact prompt and a clear structure (e.g. "In 3–5 sentences, explain... Start with..., then..., finish with..."). Suitable for verbal recording or live discussion.
3. Structured dot-point response: A scaffolded written option with clear instructions — how many points, what each point should cover, with sentence starters for each.

For each option: write it as the student would receive it, clearly enough that they can complete it independently.`
    },

    neuroTTS: {
      // Source: written for Prompt Builder — no direct manual equivalent
      source: 'Prompt Builder — Text-to-Speech Formatting (written for this tool)',
      label: 'Reformat for text-to-speech compatibility',
      template: `Context: Some students use text-to-speech software to access written resources. Formatting that works visually can create confusion when read aloud — tables become unreadable, abbreviations are mispronounced, and text in images is invisible to the software.
Objective: Reformat the resource above so it works well when read by text-to-speech software, without changing the content.
Instructional nuance: Text-to-speech reads linearly. It cannot interpret layout, visual hierarchy, or spatial relationships. Structure must be communicated through language, not formatting.

Working from the resource above, please:
1. Rewrite any tables as clearly structured text (e.g. "Term: [term]. Definition: [definition]. Example: [example].")
2. Spell out all abbreviations in full on first use
3. Replace any instructions that reference visual layout ("see the diagram below," "as shown on the left") with descriptions of the content itself
4. Add verbal cues that signal structure (e.g. "This section covers three ideas. The first idea is...", "Now moving to the next question...")
5. Flag any content currently embedded in images and cannot be read by TTS — suggest how to provide equivalent text-based access
6. Note any other TTS compatibility issues you identify`
    },

    neuroAnchor: {
      // Source: P — "Design Anchor Activity Menu"
      source: 'step3-process.html — Anchor Activities',
      label: 'Design an anchor activity menu',
      template: `Working from the main task in the resource above, create a menu of anchor activities for students who finish early, so they have something meaningful to move to independently.

Each activity should:
- Be self-directed (students can begin and continue without teacher input)
- Connect meaningfully to the current learning — not busywork
- Accommodate a range of readiness levels
- Be sustainable — usable across multiple lessons in this topic

Create 4–5 anchor activities. For each one:
- Write the student-facing instruction (what the student would read)
- Explain the learning value (1 sentence — for the teacher)
- Note the approximate time required`
    }

  };

  // ─── PUBLIC API ───────────────────────────────────────────────────────────

  /**
   * Build a single prompt block.
   *
   * @param {string} key       - Prompt key from SOURCE (e.g. 'readability')
   * @param {object} ctx       - Context: { year, subject, intention, resource }
   *                             Note: ctx.resource is used in the preamble,
   *                             NOT injected here.
   * @param {string} direction - 'support' | 'extension' | 'both'
   * @param {object} extras    - Additional context: { language }
   * @returns {string} Task instruction string. No resource text embedded.
   */
  function buildBlock(key, ctx, direction, extras) {
    const entry = SOURCE[key];
    if (!entry) return `[Prompt block "${key}" not found]`;

    const meta = BLOCK_META[key] || { useDirection: false };
    const assembled = inject(entry.template, ctx, extras);

    // Only prepend a direction clause for blocks where it is meaningful
    if (meta.useDirection && direction) {
      const clause = directionClause(direction, ctx.subject);
      if (clause) {
        return `TASK: ${entry.label}\nDifferentiation direction: ${clause}\n\n${assembled}`;
      }
    }

    return `TASK: ${entry.label}\n\n${assembled}`;
  }

  /**
   * Get the source attribution for a prompt block.
   */
  function getSource(key) {
    return SOURCE[key] ? SOURCE[key].source : 'Unknown';
  }

  /**
   * List all available block keys.
   */
  function listKeys() {
    return Object.keys(SOURCE);
  }

  return { buildBlock, getSource, listKeys, SOURCE };

})();
