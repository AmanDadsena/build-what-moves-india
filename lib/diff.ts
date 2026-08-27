import type {
  DiffSegment,
  FieldKey,
  FieldMismatch,
  FieldValue,
  MismatchSeverity,
} from "./types";

/* ============================================================
   The matching engine.

   EPFO's own comparison is exact: two strings either match, byte
   for byte, or the claim fails. That is why a member is told
   "mismatch" and nothing more — the comparison genuinely has
   nothing more to report.

   We do the opposite. We locate the difference, name it, and rank
   how likely it is to be the thing that actually blocked the claim,
   so a member spends their effort on the field that matters rather
   than re-uploading everything in hope.
   ============================================================ */

const HONORIFICS = [
  "MR", "MRS", "MS", "MISS", "SHRI", "SHRI.", "SMT", "SMT.",
  "KUMARI", "KM", "DR", "DR.", "PROF", "SRI", "SAINT", "ST",
];

/** Common Indian transliteration families. Two spellings inside the
 *  same family are the same name written by two different clerks. */
const TRANSLITERATION_FAMILIES: string[][] = [
  ["MOHAMMED", "MOHAMMAD", "MUHAMMAD", "MOHD", "MD", "MUHAMMED"],
  ["SYED", "SAYED", "SAIYED", "SAYYID"],
  ["LAKSHMI", "LAXMI"],
  ["KRISHNA", "KRISHNAN", "KISHAN"],
  ["SURESH", "SURESHA"],
  ["PRAKASH", "PARKASH"],
  ["GOPAL", "GOPALA"],
  ["RAMESH", "RAMESHA"],
  ["SHEIKH", "SHAIKH", "SHAIK"],
  ["ABDUL", "ABDULLA", "ABDULLAH"],
];

/** Strip everything EPFO's comparison would still see as different
 *  but a human would read as the same name. */
export function normalizeName(raw: string): string {
  const cleaned = raw
    .toUpperCase()
    .replace(/[.,'`-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokens = cleaned
    .split(" ")
    .filter((t) => t.length > 0 && !HONORIFICS.includes(t));

  return tokens.join(" ");
}

export function tokensOf(raw: string): string[] {
  return normalizeName(raw).split(" ").filter(Boolean);
}

/** True when both spellings belong to one transliteration family. */
export function sameTransliteration(a: string, b: string): boolean {
  const A = a.toUpperCase();
  const B = b.toUpperCase();
  return TRANSLITERATION_FAMILIES.some(
    (fam) => fam.includes(A) && fam.includes(B)
  );
}

/** True when one token is the initial of the other: "R" vs "RAJESH". */
export function isInitialOf(short: string, long: string): boolean {
  return short.length === 1 && long.length > 1 && long.startsWith(short);
}

/* ------------------------------------------------------------------
   Character-level diff, so the interface can point at the exact
   character that differs rather than restating both strings and
   leaving the member to spot it.
   ------------------------------------------------------------------ */

export function diffChars(a: string, b: string): DiffSegment[] {
  const n = a.length;
  const m = b.length;

  // Longest common subsequence table. Names are short; the quadratic
  // cost is irrelevant and the exactness is worth more than speed.
  const lcs: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0)
  );

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] =
        a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const out: DiffSegment[] = [];
  const push = (text: string, state: DiffSegment["state"]) => {
    const last = out[out.length - 1];
    if (last && last.state === state) last.text += text;
    else out.push({ text, state });
  };

  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      push(a[i], "same");
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      push(a[i], "removed");
      i++;
    } else {
      push(b[j], "added");
      j++;
    }
  }
  while (i < n) push(a[i++], "removed");
  while (j < m) push(b[j++], "added");

  return out;
}

/* ==================================================================
   TODO — YOUR CALL. This function decides what the app tells people.

   Given two versions of the same field, how serious is the
   difference? The answer drives everything downstream: a "blocking"
   verdict sends someone into a three-week Joint Declaration, and a
   "tolerated" verdict tells them to stop worrying and look elsewhere.

   Both errors are costly and they are not symmetrical:

     Too strict  → you flag ordinary noise as blocking, and someone
                   files paperwork they never needed. Weeks lost.
     Too lenient → you tell them a field is fine when it is the very
                   thing that failed. They refile, get rejected again,
                   and trust the tool less than the portal.

   The real cases you are ruling on, all drawn from how Indian
   records actually diverge:

     "RAJESH KUMAR"        vs "Rajesh Kumar"          — case only
     "RAJESH  KUMAR"       vs "RAJESH KUMAR"          — double space
     "RAJESH KUMAR SINGH"  vs "RAJESH KUMAR"          — dropped middle
     "R KUMAR"             vs "RAJESH KUMAR"          — initial expanded
     "KUMAR RAJESH"        vs "RAJESH KUMAR"          — order swapped
     "MOHD ASLAM"          vs "MOHAMMED ASLAM"        — transliteration
     "RAJESH KUMER"        vs "RAJESH KUMAR"          — genuine typo

   Worth knowing before you decide: EPFO's own check is exact, so
   every one of these fails today. But the *fix* differs. Case and
   spacing are corrected by EPFO's own normalisation and almost never
   the true cause. A dropped middle name or a swapped order genuinely
   does block, and needs a Joint Declaration. A one-letter typo is
   the single most common real cause.

   Helpers available to you: normalizeName, tokensOf,
   sameTransliteration, isInitialOf.

   Return the severity and a one-line reason written to the member,
   in the interface's voice — plain, specific, no apology.
   ================================================================== */
export function classifyMismatch(
  field: FieldKey,
  left: string,
  right: string
): { severity: MismatchSeverity; reason: string } {
  if (left === right) {
    return { severity: "tolerated", reason: "Your records match exactly." };
  }

  if (field === "dateOfBirth") {
    return {
      severity: "blocking",
      reason: "Your date of birth differs between records. Update it before you submit the claim.",
    };
  }

  if (field === "ifsc") {
    return {
      severity: "blocking",
      reason: "Your IFSC code differs between records. Update it before you submit the claim.",
    };
  }

  const isNameField = field === "name" || field === "fatherName";
  if (!isNameField) {
    return {
      severity: "blocking",
      reason: "Your records hold different values. Update this field before you submit the claim.",
    };
  }

  const normalizedLeft = normalizeName(left);
  const normalizedRight = normalizeName(right);
  if (normalizedLeft === normalizedRight) {
    const collapseWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();
    const replacePunctuation = (value: string) =>
      value.replace(/[.,'`-]/g, " ").replace(/\s+/g, " ").trim();

    if (left.toUpperCase() === right.toUpperCase()) {
      return {
        severity: "tolerated",
        reason: "Your records differ only in letter case. You do not need to change this field.",
      };
    }
    if (collapseWhitespace(left) === collapseWhitespace(right)) {
      return {
        severity: "tolerated",
        reason: "Your records differ only in spacing. You do not need to change this field.",
      };
    }
    if (replacePunctuation(left) === replacePunctuation(right)) {
      return {
        severity: "tolerated",
        reason: "Your records differ only in punctuation. You do not need to change this field.",
      };
    }
    return {
      severity: "tolerated",
      reason: "Your records differ only in case, spacing, or punctuation. You do not need to change this field.",
    };
  }

  const leftTokens = tokensOf(left);
  const rightTokens = tokensOf(right);

  if (leftTokens.length !== rightTokens.length) {
    return {
      severity: "blocking",
      reason: "One record has an extra name part. Make every name part match before you submit the claim.",
    };
  }

  const usesExpandedInitial = leftTokens.some(
    (token, index) =>
      isInitialOf(token, rightTokens[index]) ||
      isInitialOf(rightTokens[index], token)
  );
  const otherwiseMatchesInitials = leftTokens.every(
    (token, index) =>
      token === rightTokens[index] ||
      isInitialOf(token, rightTokens[index]) ||
      isInitialOf(rightTokens[index], token)
  );
  if (usesExpandedInitial && otherwiseMatchesInitials) {
    return {
      severity: "probable",
      reason: "One record uses an initial and the other spells out that name part. Check your verified ID before you update either record.",
    };
  }

  const usesTransliteration = leftTokens.some(
    (token, index) => sameTransliteration(token, rightTokens[index])
  );
  const otherwiseMatchesTransliteration = leftTokens.every(
    (token, index) =>
      token === rightTokens[index] || sameTransliteration(token, rightTokens[index])
  );
  if (usesTransliteration && otherwiseMatchesTransliteration) {
    return {
      severity: "probable",
      reason: "Your records use different transliterated spellings of the same name. Check your verified ID before you update either record.",
    };
  }

  const sortedLeftTokens = [...leftTokens].sort();
  const sortedRightTokens = [...rightTokens].sort();
  if (sortedLeftTokens.every((token, index) => token === sortedRightTokens[index])) {
    return {
      severity: "blocking",
      reason: "Your name parts appear in a different order. Put them in the same order across your records.",
    };
  }

  const differsByOneCharacter =
    normalizedLeft.length === normalizedRight.length &&
    [...normalizedLeft].filter((character, index) => character !== normalizedRight[index])
      .length === 1;
  if (differsByOneCharacter) {
    return {
      severity: "blocking",
      reason: "One letter in your name differs. Correct the record with the typo before you submit the claim.",
    };
  }

  return {
    severity: "blocking",
    reason: "Your name differs between records. Make the full name match before you submit the claim.",
  };
}

/** Compare one field across two record sources. */
export function compareField(
  left: FieldValue,
  right: FieldValue
): FieldMismatch | null {
  if (left.value === right.value) return null;

  const { severity, reason } = classifyMismatch(
    left.field,
    left.value,
    right.value
  );

  return {
    field: left.field,
    left,
    right,
    severity,
    reason,
    segments: diffChars(left.value, right.value),
  };
}

const SEVERITY_RANK: Record<MismatchSeverity, number> = {
  blocking: 0,
  probable: 1,
  tolerated: 2,
};

/** Run every comparison a rejection reason calls for, most serious
 *  first — so the member reads the likely cause before the noise. */
export function findMismatches(
  records: FieldValue[],
  pairs: Array<{ left: string; right: string; field: FieldKey }>
): FieldMismatch[] {
  const out: FieldMismatch[] = [];

  for (const pair of pairs) {
    const left = records.find(
      (r) => r.source === pair.left && r.field === pair.field
    );
    const right = records.find(
      (r) => r.source === pair.right && r.field === pair.field
    );
    if (!left || !right) continue;

    const mismatch = compareField(left, right);
    if (mismatch) out.push(mismatch);
  }

  return out.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
}
