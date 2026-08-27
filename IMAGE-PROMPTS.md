# Image prompts

Generate these in Gemini, save them into `assets-src/` under the exact
filenames below, then run the two scripts described at the end of this
file. `public/img/` holds processed output only and is written by the
build, so nothing should be dropped there by hand.

## Rules that apply to every prompt

Two of these are not stylistic. The hackathon brief forbids presenting the
build as an official government product, so **no image may contain**:

- The EPFO logo, the State Emblem of India, the Ashoka Chakra, or any
  government seal, crest or letterhead
- The Indian flag used as an authority mark
- Any real person's likeness, or a recognisable public figure

Everything else below is house style. Paste the **Style block** at the end of
every prompt so the set looks like one hand drew it.

### Style block — append to every prompt

```
Style: flat vector editorial illustration, geometric, generous negative space,
no gradients except subtle two-stop fills, no drop shadows, no 3D, no glossy
highlights, no text or lettering anywhere in the image.
Palette, use only these: indigo #4F46E5, deep indigo #1E1B4B, teal #0F766E,
amber #FFB020, crimson #C9382C, off-white #F2F5F3, near-black #0A0D0C.
Clean 2px-equivalent line weight. Calm, institutional, warm but not playful.
Do not include any logo, emblem, seal, flag or government insignia.
```

---

## 1. Social preview — highest value

**File:** `assets-src/og.png` · **1200 × 630** · **Do this one first.**

This is what appears when your submission link is pasted anywhere — including
into a judging spreadsheet. Right now the link previews as nothing.

```
A wide editorial illustration for a government provident-fund service redesign.
Left two-thirds: a large stylised document card, tilted very slightly, with a
column chart inside it whose bars rise from indigo to teal, suggesting savings
accumulating over years. Right third: a smaller card in front, outlined in
crimson, carrying a single short crimson status bar — a rejection. A thin
vertical track of four dots runs down the far left: two teal, one indigo, and
the last one an empty circle ringed in crimson. Off-white background with a
soft indigo field behind the cards.
```

---

## 2. Hero — optional companion

**File:** `assets-src/hero.png` · **1400 × 1100** (roughly 4:3)

Only if you want to replace the current SVG. The SVG has one real advantage —
it recolours automatically in high-contrast mode, which a PNG cannot.

```
A calm illustration of a person's provident fund record as an object. A large
document card seen straight on, with a rising column chart inside going from
indigo to teal across nine columns. Behind it, softly overlapping circular
fields in pale indigo, pale teal and pale amber. In front and to the lower
right, a smaller card outlined in crimson with one short crimson bar and two
grey text bars, representing a status message that explains nothing. Balanced,
uncluttered, plenty of breathing room.
```

---

## 3. Help & contact

**File:** `assets-src/help.png` · **1000 × 700**

```
An illustration about reaching a person inside a large institution. Four
distinct routes drawn as simple geometric paths of differing lengths leaving a
single point on the left and arriving at four different card shapes on the
right. Three paths are drawn in muted grey-teal and end at ordinary cards; the
fourth is drawn in crimson, is the most direct, and ends at a card outlined in
crimson. Suggests that only one route actually arrives. No arrows with
arrowheads; use rounded line ends.
```

---

## 4. Forms & downloads

**File:** `assets-src/forms.png` · **1000 × 700**

```
A neat fan of nine overlapping blank document cards, arranged like a hand of
cards laid on a surface, seen from slightly above. Each card carries two or
three short horizontal bars standing in for text — no real lettering. One card
near the centre is lifted slightly and outlined in indigo, as though chosen.
Off-white ground, soft teal field behind the fan.
```

---

## 5. Empty state — nothing found

**File:** `assets-src/empty-search.png` · **800 × 600**

```
A quiet illustration for a search that found nothing. A single open document
card, mostly empty, with one faint horizontal bar near the top and a large
calm circle drawn in thin indigo line to its right, suggesting a magnifying
lens without depicting a literal magnifying glass. Very sparse, lots of
off-white space, no sad faces, no crossed-out symbols.
```

---

## 6. Pension milestone

**File:** `assets-src/pension.png` · **900 × 900** (square)

```
A single large ring, drawn thick, exactly half filled — the filled half in
indigo, the empty half in pale grey. Behind it, a soft teal circular field.
Below and slightly overlapping, two small card shapes: one teal with a tick
mark, one grey and blank. Represents progress toward a ten-year threshold that
has not yet been crossed. Perfectly centred, symmetrical, no text.
```

---

## 7. Favicon

**File:** `assets-src/icon.png` · **512 × 512**

Match the existing emblem so the tab icon and the masthead agree.

```
A simple app icon on a deep indigo #1E1B4B rounded-square background. Centred:
three ascending rounded vertical bars in off-white, sitting on a single
horizontal rule, enclosed by a thin off-white circle. Flat, geometric, no
gradient, no shadow, no lettering. Generous padding around the mark.
```

---

## After you generate them

1. Save each into `assets-src/` with the exact filename above — **not**
   into `public/img/`, which now holds only processed output
2. Run the two scripts:

```bash
node scripts/clean-watermark.mjs && node scripts/build-images.mjs
```

The first lifts the generator's corner glyph. It fills a measured patch
with the median colour of the ring around it, and where the glyph lands
on a drawn corner it copies that corner from the same shape's opposite
end and flips it, so the curve is restored exactly rather than
approximated. The invisible provenance watermark is untouched and stays
in the file.

The second resizes and re-encodes. The originals are around five
megabytes each; nine of those is forty-four megabytes, which on a 3G
line is minutes of waiting and would contradict the one thing this build
claims about itself. WebP at quality 80 brings the set under half a
megabyte with nothing visible given up at display size.

If you add a genuinely new illustration rather than replacing one, tell
me the filename and I will place it.

I will wire them with `next/image`, set explicit width and height so nothing
shifts as they load, add the alt text, and make sure the illustrations are
marked decorative where they duplicate adjacent text. The OG image also needs
metadata, which I will add.

**If any image comes back with lettering in it, regenerate.** Text baked into
an image cannot be translated, cannot be read by a screen reader, and goes
blurry when a member enlarges the page — all three of which this build
otherwise handles.

---

# Second set — for the newer screens

Same rules. Append the **Style block** to each of these too.

## 8. Money that never arrived

**File:** `assets-src/compliance.png` · **1000 × 700**

For the employer-deposit check, where months are missing from a record.

```
A horizontal row of twelve small rounded column shapes standing on a single
baseline, like months in a year. Nine are solid and rise to varying heights in
indigo and teal. Three consecutive columns in the middle are missing entirely,
leaving a visible hole in the run, and their absence is marked only by three
faint dashed outlines in crimson where they should have been. Nothing else in
the frame. Off-white ground, soft amber field behind the row.
```

## 9. What you would actually receive

**File:** `assets-src/deduction.png` · **1000 × 700**

For the tax screen — the gap between a balance and what lands.

```
Two vertical bars side by side on a common baseline, one clearly taller than
the other. The taller bar is solid indigo and whole. The shorter bar is the
same width and sits beside it, solid teal, with the missing upper portion
drawn as a crimson outlined block floating slightly detached above it, as
though lifted away. Suggests an amount reduced before it arrives. Generous
space, no arrows.
```

## 10. Deadlines that do and do not bind

**File:** `assets-src/deadlines.png` · **1000 × 700**

```
A single long horizontal line running left to right across the frame. Along it,
five circular markers at uneven intervals. The first four markers are drawn in
pale grey with thin outlines and are visually weightless. The fifth and last
marker is much larger, filled solid crimson, and casts a short vertical tick
down to the baseline. Suggests a sequence of dates where only the final one
carries any force. Off-white ground.
```

## 11. Choosing the right purpose

**File:** `assets-src/advances.png` · **1000 × 700**

For the advance-eligibility screen.

```
Six rounded rectangular cards arranged in two rows of three, seen flat from
above. Four of the cards are solid off-white with a thin teal outline and a
small teal tick shape in the corner. Two cards are flat grey, slightly
recessed and unmarked. Each card carries two short horizontal bars standing in
for text — no real lettering. Suggests a set of options where some are
available and some are not yet.
```

---

# Still to generate

Nine of the eleven above are done and wired in. These three are not.

## 12. Staying safe — for the fraud checker

**File:** `assets-src/safety.png` · **1000 × 700**

The page where a member works out whether the person who just contacted
them about their claim is real. Nothing menacing, nothing with a face —
the subject is a decision, not a villain.

```
Two nearly identical document cards side by side on an off-white ground,
seen straight on. Both carry the same three short horizontal bars
standing in for text — no real lettering. The card on the left is
outlined in a calm teal and sits flat. The card on the right is outlined
in crimson, is very slightly rotated, and one of its bars is a different
length from its counterpart — the only difference between the two. A
thin crimson circle is drawn loosely around that one bar. Suggests that
the forgery is nearly perfect and gives itself away in one detail.
```

## 13. Hero — optional replacement for the current SVG

**File:** `assets-src/hero.png` · **1400 × 1100**

Prompt is number 2 at the top of this file. Note the drawback stated
there: the SVG currently in place recolours itself in high-contrast
mode and a PNG cannot, so a raster hero is a downgrade for the readers
who need it most. Generate it only if you want to compare.

## 14. Empty state — nothing found

**File:** `assets-src/empty-search.png` · **800 × 600**

Prompt is number 5 at the top of this file. This one is worth doing:
the glossary and the services index both have a no-results state and
both are currently text alone.
