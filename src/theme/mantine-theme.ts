import { createTheme, CSSVariablesResolver, rem } from "@mantine/core";

export const resolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    '--gs-bg-base':           '#F5F5F5',
    '--gs-bg-raised':         '#FFFFFF',
    '--gs-bg-overlay':        '#EFEFEF',
    '--gs-bg-hover':          '#E8E8E8',
    '--gs-primary':           '#111111',
    '--gs-primary-hover':     '#2A2A2A',
    '--gs-primary-bg':        'rgba(0,0,0,0.05)',
    '--gs-border':            'rgba(0,0,0,0.08)',
    '--gs-border-strong':     'rgba(0,0,0,0.15)',
    '--gs-border-focus':      'rgba(0,0,0,0.50)',
    '--gs-text-primary':      '#111111',
    '--gs-text-secondary':    '#555555',
    '--gs-text-muted':        '#999999',
    '--gs-text-inverse':      '#FFFFFF',
    '--gs-sidebar-bg':        '#111111',
    '--gs-header-bg':         '#FFFFFF',
    '--gs-input-bg':          '#F0F0F0',
  },
  dark: {
    '--gs-bg-base':           '#141414',
    '--gs-bg-raised':         '#1E1E1E',
    '--gs-bg-overlay':        '#262626',
    '--gs-bg-hover':          '#2E2E2E',
    '--gs-primary':           '#F0F0F0',
    '--gs-primary-hover':     '#FFFFFF',
    '--gs-primary-bg':        'rgba(255,255,255,0.07)',
    '--gs-border':            'rgba(255,255,255,0.07)',
    '--gs-border-strong':     'rgba(255,255,255,0.13)',
    '--gs-border-focus':      'rgba(255,255,255,0.50)',
    '--gs-text-primary':      '#F0F0F0',
    '--gs-text-secondary':    '#A0A0A0',
    '--gs-text-muted':        '#606060',
    '--gs-text-inverse':      '#111111',
    '--gs-sidebar-bg':        '#0A0A0A',
    '--gs-header-bg':         '#1E1E1E',
    '--gs-input-bg':          '#262626',
  },
});

export const theme = createTheme({
  primaryColor: "dark",
  primaryShade: 9,
  white: "#ffffff",
  black: "#111111",

  fontFamily: 'Inter, sans-serif',
  fontSizes: {
    xs:  '0.6875rem',  // 11px
    sm:  '0.75rem',    // 12px
    md:  '0.875rem',   // 14px
    lg:  '0.9375rem',  // 15px
    xl:  '1rem',       // 16px
  },

  headings: {
    fontFamily: 'Inter, sans-serif',
    sizes: {
      h1: {
        fontFamily: 'Inter, sans-serif',
        fontSize: 'clamp(1.375rem, 2vw, 1.625rem)',
        fontWeight: '700',
        lineHeight: '1.35',
      },
      h2: {
        fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
        fontWeight: '600',
        lineHeight: '1.35',
      },
    },
  },

  radius: {
    xs: rem(2),
    sm: rem(4),
    md: rem(6),
    lg: rem(8),
    xl: rem(12),
  },

  components: {
    Paper: {
      defaultProps: {
        withBorder: true,
        radius: "md",
      },
      styles: {
        root: {
          backgroundColor: 'var(--gs-bg-raised)',
          borderColor: 'var(--gs-border)',
        },
      },
    },
    Card: {
      defaultProps: {
        withBorder: true,
        radius: "md",
        padding: "lg",
      },
      styles: {
        root: {
          backgroundColor: 'var(--gs-bg-raised)',
          borderColor: 'var(--gs-border)',
        },
      },
    },
    Button: {
      defaultProps: {
        radius: "sm",
        h: 38,
        fw: 500,
        size: "sm",
      },
      styles: (_: any, { variant }: any) => ({
        root: {
          ...(variant === 'filled' && {
            backgroundColor: 'var(--gs-primary)',
            color: 'var(--gs-text-inverse)',
            border: 'none',
            '&:hover': { backgroundColor: 'var(--gs-primary-hover)' },
          }),
          ...(variant === 'outline' && {
            borderColor: 'var(--gs-border-strong)',
            color: 'var(--gs-text-primary)',
            '&:hover': { backgroundColor: 'var(--gs-primary-bg)' },
          }),
          ...(variant === 'subtle' && {
            color: 'var(--gs-text-secondary)',
            '&:hover': {
              backgroundColor: 'var(--gs-primary-bg)',
              color: 'var(--gs-text-primary)',
            },
          }),
        },
      }),
    },
    NavLink: {
      styles: {
        root: {
          color: 'var(--gs-sidebar-text)',
          borderRadius: '0 8px 8px 0',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.06)',
            color: '#FFFFFF',
          },
          '&[dataActive]': {
            backgroundColor: 'var(--gs-sidebar-active-bg)',
            color: 'var(--gs-sidebar-text-active)',
            borderLeft: '2px solid var(--gs-sidebar-active-border)',
          },
        },
      },
    },
    TextInput: {
      defaultProps: {
        radius: "sm",
        size: "sm",
      },
      styles: {
        input: {
          backgroundColor: 'var(--gs-input-bg)',
          borderColor: 'var(--gs-border-strong)',
          color: 'var(--gs-text-primary)',
          '&:focus': {
            borderColor: 'var(--gs-border-focus)',
            boxShadow: '0 0 0 2px rgba(0,0,0,0.08)',
          },
        },
        label: {
          color: 'var(--gs-text-secondary)',
          fontWeight: 500,
          marginBottom: rem(6),
        },
      },
    },
    Select: {
      defaultProps: {
        radius: "sm",
        size: "sm",
      },
      styles: {
        input: {
          backgroundColor: 'var(--gs-input-bg)',
          borderColor: 'var(--gs-border-strong)',
          color: 'var(--gs-text-primary)',
        },
      },
    },
    Badge: {
      defaultProps: {
        radius: "sm",
        fw: 500,
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
        title: { fontWeight: 600, fontSize: rem(18), color: 'var(--gs-text-primary)' },
        content: { backgroundColor: 'var(--gs-bg-raised)' },
      },
    },
    Pagination: {
      styles: {
        control: {
          '&[dataActive]': {
            backgroundColor: 'var(--gs-primary)',
            color: 'var(--gs-text-inverse)',
            borderColor: 'var(--gs-primary)',
          },
        },
      },
    },
    Loader: {
      defaultProps: {
        type: "dots",
      },
    },
  },
});
