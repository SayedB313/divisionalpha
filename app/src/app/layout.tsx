import type { Metadata } from "next";
import { DM_Sans, DM_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { AppProvider } from "@/lib/app-context";
import { QueryProvider } from "@/lib/query-provider";
import { Topbar } from "@/components/topbar";
import { MobileNav } from "@/components/mobile-nav";
import { ScoreOverlay } from "@/components/score-overlay";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Division Alpha — Accountability Squads for Founders Who Take Their Commitments Seriously",
  description: "AI-orchestrated peer accountability. 5-6 person squads, 6-week sprints, Monday/Wednesday/Friday rhythm. $49/mo. Your squad holds you to your word.",
  openGraph: {
    title: "Division Alpha — Your Q2 Starts Here",
    description: "Accountability squads for founders who take their commitments seriously. AI handles the infrastructure. Your squad handles the accountability. $49/mo.",
    siteName: "Division Alpha",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Division Alpha — Your Q2 Starts Here",
    description: "Accountability squads for founders who take their commitments seriously. AI handles the infrastructure. Your squad handles the accountability.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${dmSans.variable} ${dmMono.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <body>
        <QueryProvider>
          <AuthProvider>
            <AppProvider>
              <ThemeProvider>
                <Topbar />
                <main className="pt-[52px] min-h-screen">
                  {children}
                </main>
                <MobileNav />
                <ScoreOverlay />
              </ThemeProvider>
            </AppProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
