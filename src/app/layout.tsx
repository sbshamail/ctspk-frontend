import { ThemeProvider } from "@/@core/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/context/cartContext";
import { getServerSession } from "@/lib/serverUserSide";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ReactNode } from "react";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { fetchApi } from "@/action/fetchApi";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fetch settings for metadata
async function getSettings() {
  try {
    const response = await fetchApi({
      url: "settings?language=en",
      method: "GET",
    });

    if (response?.success === 1 && response.data) {
      return response.data;
    }
  } catch (error) {
    console.error("Failed to fetch settings for metadata:", error);
  }
  return null;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  return {
    title: settings?.siteTitle || "GHERTAK",
    description: settings?.metaDescription || "Welcome to GHERTAK",
    keywords: settings?.metaKeywords || "",
    icons: {
      icon: "/favicon.ico",
    },
    openGraph: {
      title: settings?.ogTitle || settings?.siteTitle || "GHERTAK",
      description: settings?.ogDescription || settings?.metaDescription || "Welcome to GHERTAK",
      images: settings?.logo?.original ? [settings.logo.original] : [],
      url: settings?.canonicalUrl || "",
    },
    twitter: {
      card: (settings?.twitterCardType as any) || "summary_large_image",
      site: settings?.twitterHandle || "",
      title: settings?.ogTitle || settings?.siteTitle || "GHERTAK",
      description: settings?.ogDescription || settings?.metaDescription || "Welcome to GHERTAK",
      images: settings?.logo?.original ? [settings.logo.original] : [],
    },
    alternates: {
      canonical: settings?.canonicalUrl || "",
    },
  };
}

export default async function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: ReactNode;
}>) {
  const serverAuth = await getServerSession();

  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          forcedTheme="light" // Force light theme to prevent hydration mismatch
        >
          <SettingsProvider>
            <StoreProvider serverAuth={serverAuth}>
              <CartProvider>
                {children}
                {modal}
              </CartProvider>
            </StoreProvider>
          </SettingsProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
