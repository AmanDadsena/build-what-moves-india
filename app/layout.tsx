import type { Metadata, Viewport } from "next";
import { ViewTransition } from "react";
import {
  Manrope,
  Public_Sans,
  Atkinson_Hyperlegible,
  IBM_Plex_Mono,
  Noto_Sans_Devanagari,
} from "next/font/google";
import "./globals.css";
import { Assistant } from "@/components/Assistant";
import { OfflineReady } from "@/components/OfflineReady";
import { LanguageProvider } from "@/components/Language";
import { ReaderProvider } from "@/components/ReaderControls";
import { CommandPalette } from "@/components/CommandPalette";
import { CaseHandoff } from "@/components/CaseBackup";
import { SITE_URL } from "@/lib/site";

/* Type.

   Deliberately not Inter. Inter is the default of every AI-generated
   interface, and a public service that looks generated is a public
   service nobody trusts.

   Public Sans carries the body and the UI: it was drawn for
   public-service interfaces, so its neutrality is the institutional
   kind rather than the anonymous kind. Manrope carries the display
   sizes, where its slightly humanist geometry gives a headline warmth
   without ornament. Both are variable, so the full weight range costs
   two files. */
const display = Manrope({
  variable: "--font-display-face",
  subsets: ["latin"],
  display: "swap",
});

const body = Public_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

/* Loaded for the reader panel only. Atkinson Hyperlegible was drawn
   by the Braille Institute specifically to raise legibility for low
   vision — its letterforms are differentiated where ordinary
   grotesques collapse, so b/d, p/q and I/l/1 stop trading places.
   A member reading a pension screen should be able to ask for it. */
const hyperlegible = Atkinson_Hyperlegible({
  variable: "--font-hyperlegible",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

/* Monospace stays: it is semantic here, marking text the government's
   own system emitted verbatim. Devanagari stays because Inter carries
   no Hindi. */
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

/* Devanagari.

   Noto Sans Devanagari is the reference face for the script and what
   Indian public-service sites use, so Hindi set in it looks correct
   to a reader rather than merely present. It also sits at a stroke
   weight that matches Public Sans, which the previous pairing did
   not — bilingual lines were visibly lighter on the Hindi side. */
const deva = Noto_Sans_Devanagari({
  variable: "--font-deva-face",
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "EPF Member Portal — a redesign concept",
    template: "%s — EPF Member Portal",
  },
  description:
    "An independent redesign concept for the provident fund member portal. Check your balance, file a claim with a pre-flight rejection check, and if a claim fails, find out what actually went wrong — with every escalation document drafted for you, including the RTI. Not an official EPFO service.",
  applicationName: "EPF Member Portal",
  robots: { index: true, follow: true },

  /* Absolute URLs, because a crawler resolves an Open Graph image
     against nothing. The deploy URL is not known at build time on a
     preview host, so it comes from the environment and falls back to
     the production domain. */
  metadataBase: new URL(SITE_URL),

  /* A canonical on every page, not the eight that remembered to
     declare one. "./" is resolved per route against metadataBase, so
     each page names itself; a page that sets its own still wins,
     because child metadata overrides the layout's.

     It earns its place on a site that is handed around: every share
     link, every WhatsApp forward and every case handover arrives with
     something appended — a tracking parameter, a fragment, a stray
     slash — and without this each of those reads to a crawler as a
     separate page with the same words on it. */
  alternates: { canonical: "./" },

  openGraph: {
    type: "website",
    /* Resolved against metadataBase. Without it a card scraped from a
       preview host, or from a link someone forwarded with tracking
       parameters stapled on, names that URL as the canonical one. */
    url: "/",
    siteName: "EPF Member Portal — a redesign concept",
    title: "The rejection said eleven words. This says what to do about them.",
    description:
      "An independent redesign of the provident fund member portal, with a decoder for the remark that blocked your claim and every escalation document drafted for you.",
    locale: "en_IN",
    images: [
      {
        url: "/img/og.png",
        width: 1200,
        height: 630,
        alt: "A provident fund record drawn as a document of rising contributions, with a small crimson card in front of it carrying a single unexplained line.",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "The rejection said eleven words. This says what to do about them.",
    description:
      "An independent redesign of the provident fund member portal. Not an official EPFO service.",
    images: ["/img/og.png"],
  },
};

export const viewport: Viewport = {
  /* The navy of the utility bar, which is the topmost band on every
     page. Android Chrome paints its address bar this colour, so the
     browser furniture and the page meet without a seam; installed to
     a home screen, the status bar does the same. It has to be a
     literal — this is read before any stylesheet, so a var() here
     resolves to nothing and the bar falls back to white. Keep it in
     step with --color-night. */
  themeColor: "#001e40",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${hyperlegible.variable} ${plexMono.variable} ${deva.variable} h-full antialiased`}
    >
      <head>
        {/* If scripting is unavailable, entrance animations must not
            hide content. Nothing on this site is behind an animation. */}
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}
.disclose-body{grid-template-rows:1fr!important}
.stagger > *{animation:none!important}`}</style>
        </noscript>
        {/* Retires the entrance animation a few seconds in, so a paused
            timeline can never leave the page sitting on an invisible
            first keyframe. Inline and tiny: it must run even if the
            main bundle never arrives. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              /* Injects a stylesheet rather than setting an attribute on
                 <html>. React 19 diffs attributes on the document
                 element it did not render and warns that the mismatch
                 "won't be patched up" — and this script races
                 hydration by design, so it will always be there first
                 on a slow connection. A style element sidesteps the
                 diff entirely and does exactly the same job. */
              'setTimeout(function(){var s=document.createElement("style");s.id="entrance-done";s.textContent=".stagger > *{animation:none!important;opacity:1!important;transform:none!important}";document.head.appendChild(s)},3000)',
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {/* Route changes crossfade rather than cutting to white. Next
            treats navigations as React transitions, so this activates
            on its own; browsers without the View Transitions API just
            navigate as before. */}
        <LanguageProvider>
          <ReaderProvider>
            {/* Above everything, because a case somebody handed over
                is the reason this page was opened at all. Renders
                nothing unless the address carries one. */}
            <CaseHandoff />
            <ViewTransition>{children}</ViewTransition>
            {/* Outside the transition: a dialog that crossfaded with
                the page under it would flicker on every navigation it
                caused. */}
            <CommandPalette />
            <Assistant />
            <OfflineReady />
          </ReaderProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
