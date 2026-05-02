import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";
import "@mantine/charts/styles.css";
import "./globals.css";

import type { Metadata } from "next";
import { MantineAppProvider } from "@/components/MantineAppProvider";
import { Providers } from "@/lib/query-provider";
import { Notifications } from "@mantine/notifications";

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
    <html lang="id">
      <body className="antialiased" suppressHydrationWarning>
        <MantineAppProvider>
          <Notifications />
          <Providers>{children}</Providers>
        </MantineAppProvider>
      </body>
    </html>
  );
}
