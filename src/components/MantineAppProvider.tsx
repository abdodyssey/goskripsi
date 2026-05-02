"use client";

import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { theme, resolver } from "@/theme/mantine-theme";

export function MantineAppProvider({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} cssVariablesResolver={resolver} defaultColorScheme="light">
      <ModalsProvider>
        {children}
      </ModalsProvider>
    </MantineProvider>
  );
}
