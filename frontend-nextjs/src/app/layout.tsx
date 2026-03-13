import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";
import "@mantine/charts/styles.css";
import "./globals.css";

import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import { MantineProvider, ColorSchemeScript } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { Providers } from "@/lib/query-provider";
import { theme } from "@/theme/mantine-theme";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GoSkripsi Dashboard",
  description: "Berdasarkan Framework Identitas Subtipe (Barker)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body
        className={`${inter.variable} ${geist.variable} antialiased font-sans`}
      >
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <Notifications />
          <ModalsProvider>
            <Providers>{children}</Providers>
          </ModalsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
