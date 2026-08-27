/* The hero illustration.

   Original vector work, not stock photography: a hackathon prototype
   has no licence to anybody's photographs, and a picture of smiling
   strangers would say nothing about what this product does.

   It draws the product's argument. A member's record with the balance
   accumulating — the bars warm from indigo through teal as the years
   build — and in front of it the status card that decides whether
   they ever reach it. The status card carries the only red in the
   picture, because that is the thing the whole build exists to
   explain, and the desk track down the left shows where it stopped. */

export function HeroArt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 470"
      className={className}
      role="img"
      aria-label="Illustration of a provident fund record, its rising balance, and the status card that governs it"
    >
      <defs>
        <clipPath id="ha-record">
          <rect x="70" y="34" width="440" height="286" rx="22" />
        </clipPath>
        <linearGradient id="ha-bars" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-noting)" />
          <stop offset="100%" stopColor="var(--color-verify)" />
        </linearGradient>
      </defs>

      {/* ---- Ground: three overlapping fields, so the space has depth
             and colour before a single card is drawn ---- */}
      <rect x="18" y="10" width="564" height="430" rx="52" fill="var(--color-noting-wash)" />
      <circle cx="524" cy="112" r="98" fill="var(--color-verify-wash)" />
      <circle cx="86" cy="392" r="70" fill="var(--color-pending-wash)" />

      {/* Quiet geometry */}
      <circle cx="548" cy="330" r="40" fill="none" stroke="var(--color-ochre)" strokeWidth="3" opacity="0.55" />
      <circle cx="46" cy="96" r="9" fill="var(--color-ochre)" />
      <circle cx="566" cy="238" r="6" fill="var(--color-verify)" />
      <circle cx="30" cy="250" r="5" fill="var(--color-noting)" opacity="0.5" />

      {/* ---- The record ---- */}
      <g transform="rotate(-2 290 177)">
        <rect
          x="70" y="34" width="440" height="286" rx="22"
          fill="var(--color-paper-raised)"
          stroke="var(--color-rule-heavy)" strokeWidth="1.5"
        />

        <g clipPath="url(#ha-record)">
          {/* Header strip */}
          <rect x="70" y="34" width="440" height="58" fill="var(--color-paper-inset)" />
          <circle cx="98" cy="63" r="11" fill="var(--color-noting)" />
          <rect x="120" y="58" width="104" height="9" rx="4.5" fill="var(--color-ink-faint)" />
          <rect x="392" y="52" width="86" height="22" rx="11" fill="var(--color-verify)" opacity="0.18" />
          <circle cx="406" cy="63" r="4.5" fill="var(--color-verify)" />
          <rect x="418" y="59" width="46" height="8" rx="4" fill="var(--color-verify)" opacity="0.75" />

          {/* The balance */}
          <rect x="98" y="118" width="182" height="22" rx="11" fill="var(--color-ink)" />
          <rect x="98" y="152" width="108" height="9" rx="4.5" fill="var(--color-ink-faint)" opacity="0.6" />

          {/* Contributions accumulating */}
          <g>
            <rect x="98"  y="272" width="30" height="30"  rx="8" fill="url(#ha-bars)" opacity="0.3" />
            <rect x="140" y="256" width="30" height="46"  rx="8" fill="url(#ha-bars)" opacity="0.42" />
            <rect x="182" y="238" width="30" height="64"  rx="8" fill="url(#ha-bars)" opacity="0.54" />
            <rect x="224" y="216" width="30" height="86"  rx="8" fill="url(#ha-bars)" opacity="0.66" />
            <rect x="266" y="196" width="30" height="106" rx="8" fill="url(#ha-bars)" opacity="0.78" />
            <rect x="308" y="176" width="30" height="126" rx="8" fill="url(#ha-bars)" opacity="0.88" />
            <rect x="350" y="152" width="30" height="150" rx="8" fill="url(#ha-bars)" />
            <rect x="392" y="128" width="30" height="174" rx="8" fill="url(#ha-bars)" />
            <rect x="434" y="106" width="30" height="196" rx="8" fill="var(--color-verify)" />
          </g>

          {/* Ledger rule under the bars */}
          <rect x="86" y="304" width="410" height="2" rx="1" fill="var(--color-rule-heavy)" opacity="0.5" />
        </g>
      </g>

      {/* ---- Settled marker, tucked behind the status card ---- */}
      <g transform="rotate(-6 132 356)">
        <rect x="62" y="326" width="150" height="60" rx="16"
          fill="var(--color-paper-raised)" stroke="var(--color-verify)" strokeWidth="1.5" opacity="0.95" />
        <circle cx="90" cy="356" r="10" fill="var(--color-verify)" />
        <path d="M85.5 356l3.5 3.5 6-6.5" stroke="var(--color-paper-raised)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="110" y="345" width="76" height="8" rx="4" fill="var(--color-verify)" opacity="0.55" />
        <rect x="110" y="361" width="52" height="7" rx="3.5" fill="var(--color-ink-faint)" opacity="0.4" />
      </g>

      {/* ---- The status card ---- */}
      <g transform="rotate(2.5 400 372)">
        <rect x="238" y="300" width="316" height="152" rx="20"
          fill="var(--color-paper-raised)" stroke="var(--color-stamp)" strokeWidth="2" />

        {/* The one red mark */}
        <rect x="266" y="326" width="112" height="28" rx="9" fill="var(--color-stamp-wash)" />
        <circle cx="283" cy="340" r="5.5" fill="var(--color-stamp)" />
        <rect x="296" y="336" width="66" height="9" rx="4.5" fill="var(--color-stamp)" opacity="0.85" />

        {/* The sanitised line a member is given */}
        <rect x="266" y="372" width="256" height="10" rx="5" fill="var(--color-ink-faint)" opacity="0.5" />
        <rect x="266" y="392" width="176" height="10" rx="5" fill="var(--color-ink-faint)" opacity="0.3" />

        {/* The action that should have been there all along */}
        <rect x="266" y="416" width="104" height="20" rx="10" fill="var(--color-noting)" />
        <rect x="384" y="419" width="60" height="14" rx="7" fill="var(--color-ochre)" opacity="0.7" />
      </g>

      {/* ---- The four desks, as a marginal track ---- */}
      <g>
        <line x1="40" y1="150" x2="40" y2="300" stroke="var(--color-noting)" strokeWidth="2.5" opacity="0.25" strokeLinecap="round" />
        <circle cx="40" cy="150" r="8" fill="var(--color-verify)" />
        <circle cx="40" cy="200" r="8" fill="var(--color-verify)" />
        <circle cx="40" cy="250" r="8" fill="var(--color-noting)" />
        <circle cx="40" cy="300" r="9" fill="var(--color-paper-raised)" stroke="var(--color-stamp)" strokeWidth="3" />
      </g>
    </svg>
  );
}
