import type { Metadata } from "next";
import { DM_Sans, DM_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { AppProvider } from "@/lib/app-context";
import { QueryProvider } from "@/lib/query-provider";
import { AppFrame } from "@/components/app-frame";

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
  title: "Division Alpha — 40-Day Proving Ground for Operators",
  description: "Everyone gets a chance. The Boss tracks execution daily. Enter for $19/month, earn your squad at 70+, and climb toward ELITE at 90+.",
  openGraph: {
    title: "Division Alpha — Everyone Gets a Chance. The Best Earn Their Squad.",
    description: "A 40-day proving ground for operators. Daily Boss pulse, real-time score, embedded human support, and earned progression from ENTER to PROVEN.",
    siteName: "Division Alpha",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Division Alpha — 40-Day Proving Ground for Operators",
    description: "Enter for $19/month. The Boss tracks execution daily. The best earn their squad.",
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
                <AppFrame>{children}</AppFrame>
              </ThemeProvider>
            </AppProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
