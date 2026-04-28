import { createTheme, MantineColorsTuple, rem } from "@mantine/core";

const indigo: MantineColorsTuple = [
  "#f8fafc", // 0
  "#f1f5f9", // 1
  "#e2e8f0", // 2
  "#cbd5e1", // 3
  "#94a3b8", // 4
  "#64748b", // 5
  "#475569", // 6
  "#334155", // 7
  "#1e293b", // 8
  "#0f172a", // 9 — Primary (#0f172a)
];

const slate: MantineColorsTuple = [
  "#f8fafc", // 0
  "#f1f5f9", // 1
  "#e2e8f0", // 2
  "#cbd5e1", // 3
  "#94a3b8", // 4
  "#64748b", // 5
  "#475569", // 6
  "#334155", // 7
  "#1e293b", // 8
  "#0f172a", // 9
];

export const theme = createTheme({
  primaryColor: "indigo",
  primaryShade: 9,
  white: "#ffffff",
  black: "#0f172a",

  colors: {
    indigo,
    slate,
    // Override Mantine's built-in "dark" palette so dark-mode body = Slate 950
    dark: [
      "#C1C2C5", // 0 — text on dark bg
      "#A6A7AB", // 1
      "#909296", // 2
      "#5c5f66", // 3
      "#373A40", // 4
      "#2C2E33", // 5
      "#0f172a", // 6 — surface (Slate 900)
      "#020610", // 7 — body background (Slate 950)
      "#020610", // 8
      "#020610", // 9
    ],
  },

  fontFamily: "var(--font-inter), Inter, sans-serif",
  headings: {
    fontFamily: "var(--font-inter), Inter, sans-serif",
    sizes: {
      h1: { fontWeight: "700", fontSize: rem(26), lineHeight: "1.2" },
      h2: { fontWeight: "700", fontSize: rem(20), lineHeight: "1.3" },
      h3: { fontWeight: "600", fontSize: rem(18), lineHeight: "1.4" },
    },
  },

  radius: {
    xs: rem(2),
    sm: rem(4),
    md: rem(6),
    lg: rem(8),
    xl: rem(12),
  },

  other: {
    light: {
      background: "#f8fafc", // Slate 50 as per original rule
      surface: "#ffffff",
      textPrimary: "#0f172a",
      textSecondary: "#64748b",
      brand: "#0f172a",
      border: "#e2e8f0",
    },
    dark: {
      background: "#020610",
      surface: "#0f172a",
      textPrimary: "#f8fafc",
      textSecondary: "#94a3b8",
      brand: "#0f172a",
      border: "rgba(255, 255, 255, 0.08)",
    },
  },

  components: {
    Paper: {
      defaultProps: {
        withBorder: true,
        radius: "md",
      },
    },
    Card: {
      defaultProps: {
        withBorder: true,
        radius: "md",
        padding: "lg",
      },
    },
    Button: {
      defaultProps: {
        radius: "sm",
        h: 38,
        fw: 600,
        size: "sm",
      },
    },
    TextInput: {
      defaultProps: {
        radius: "sm",
        size: "sm",
      },
      styles: {
        label: { marginBottom: rem(6), fontWeight: 600, fontSize: rem(14) },
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: "sm",
        size: "sm",
      },
      styles: {
        label: { marginBottom: rem(6), fontWeight: 600, fontSize: rem(14) },
      },
    },
    Badge: {
      defaultProps: {
        radius: "sm",
        fw: 700,
        tt: "uppercase",
      },
    },
    Modal: {
      defaultProps: {
        radius: "md",
        overlayProps: {
          backgroundOpacity: 0.55,
          blur: 4,
        },
      },
      styles: {
        title: { fontWeight: 700, fontSize: rem(18) },
      },
    },
  },
});
