import type { Metadata, Viewport } from "next";
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

  openGraph: {
    type: "website",
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
  themeColor: "#e9ebe4",
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
              'setTimeout(function(){document.documentElement.setAttribute("data-entrance","done")},3000)',
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {children}
        <Assistant />
        <OfflineReady />
      </body>
    </html>
  );
}
