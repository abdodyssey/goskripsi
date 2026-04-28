import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";
import "@mantine/charts/styles.css";
import "./globals.css";

import type { Metadata } from "next";
import { MantineProvider, ColorSchemeScript } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { Providers } from "@/lib/query-provider";
import { theme } from "@/theme/mantine-theme";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
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
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning
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
