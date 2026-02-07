import type { Metadata, Viewport } from "next";
import { Outfit, Playfair_Display, Caveat } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GitHub Manager - Organize Your Development Workflow",
    template: "%s | GitHub Manager",
  },
  description:
    "A premium task management system for GitHub repositories. Track tasks directly in your repos, anchor them to specific files and lines, and keep your development workflow organized.",
  keywords: [
    "GitHub",
    "task management",
    "developer tools",
    "code organization",
    "project management",
    "repository manager",
  ],
  authors: [{ name: "GitHub Manager" }],
  creator: "GitHub Manager",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "GitHub Manager",
    title: "GitHub Manager - Organize Your Development Workflow",
    description:
      "Track tasks directly in your GitHub repos with code anchoring and smart labels.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitHub Manager",
    description: "A premium task management system for GitHub repositories.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#030705" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${playfair.variable} ${caveat.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
