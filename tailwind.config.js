/** @type {import('tailwindcss').Config} */

/*
 * COIN design tokens — "Warm Enterprise" identity.
 * ------------------------------------------------------------------
 * The palette is centralized here so every screen consumes the same
 * warm peach + beige system. We deliberately OVERRIDE Tailwind's stock
 * `slate` / `teal` / semantic scales with warm equivalents: the app has
 * hundreds of scattered `slate-*` / `teal-*` utilities, and remapping the
 * scales re-tints all of them from one place instead of touching each file.
 *
 *   slate   → warm greige neutral (surfaces, borders, typography)
 *   teal    → peach / terracotta (primary accent family)
 *   emerald → muted sage (success)
 *   amber   → warm bronze (warning / pending)
 *   red     → muted terracotta-coral (error / danger)
 *   blue    → dusty warm slate-blue (info + CO module)
 *   indigo  → muted plum-taupe, purple → mauve, orange → terracotta
 */

// Warm greige neutral — replaces the cool `slate` ramp.
const neutral = {
  50: '#FAF6F0',
  100: '#F3EBDF',
  200: '#E7DBCB',
  300: '#D6C6B2',
  400: '#AE9F8E',
  500: '#8A7D6D',
  600: '#6B5D4D',
  700: '#524738',
  800: '#3A3128',
  900: '#29231F',
  950: '#1C1712',
};

// Peach / terracotta — replaces the `teal` ramp and drives `primary`.
const peach = {
  50: '#FDF2EA',
  100: '#FBE4D6',
  200: '#F7D3BF',
  300: '#F0BCA0',
  400: '#E8A17C',
  500: '#DC8860',
  600: '#C6704A',
  700: '#A85A38',
  800: '#8A4A2E',
  900: '#6E3B26',
};

const sage = {
  50: '#ECF2EC',
  100: '#DBE7DD',
  200: '#BFD3C3',
  300: '#9DBAA3',
  400: '#77997F',
  500: '#5E8468',
  600: '#4E7358',
  700: '#416049',
  800: '#334C3A',
  900: '#28382D',
};

const bronze = {
  50: '#FBF0DC',
  100: '#F6E3BF',
  200: '#F0DCB0',
  300: '#E7C888',
  400: '#DDB05A',
  500: '#C9963B',
  600: '#B0782B',
  700: '#8C5E1E',
  800: '#6F4A17',
  900: '#553811',
  950: '#3D280C',
};

const coral = {
  50: '#FBEBE6',
  100: '#F6D8CE',
  200: '#F3CFC6',
  300: '#E7A897',
  400: '#D67B66',
  500: '#C55E45',
  600: '#B24A34',
  700: '#933A28',
  800: '#772F21',
  900: '#5F261B',
};

const dusty = {
  50: '#ECEFF4',
  100: '#DCE3EC',
  200: '#C4D0DE',
  300: '#A9BACE',
  400: '#8499B5',
  500: '#6E82A0',
  600: '#5A6E8C',
  700: '#4A5C78',
  800: '#3B4A61',
  900: '#313C4E',
  950: '#2A3140',
};

const plum = {
  50: '#F0EDF1',
  100: '#E2DBE6',
  200: '#CBBFD2',
  300: '#AF9EB9',
  400: '#8E7A9A',
  500: '#786285',
  600: '#6E5C74',
  700: '#5A4A60',
  800: '#493C4E',
  900: '#3C3140',
};

const mauve = {
  50: '#F1ECEF',
  100: '#E5DAE1',
  200: '#D0BECB',
  300: '#B499AC',
  400: '#977B8D',
  500: '#82677A',
  600: '#7A5E70',
  700: '#654B5C',
  800: '#513C49',
  900: '#42313B',
};

const terracotta = {
  50: '#FDF2EA',
  100: '#FBE1CE',
  200: '#F5CBB0',
  300: '#EAAE8B',
  400: '#DB8B62',
  500: '#C97148',
  600: '#BC6A47',
  700: '#A5563A',
  800: '#87462F',
  900: '#6E3B28',
};

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Canvas & surfaces ──────────────────────────────────────────
        paper: '#F7EFE7',
        canvas: '#F7EFE7',
        surface: '#FFFDFC',
        'surface-muted': '#FBF6F0',
        'surface-sunken': '#F1E4D8',

        // ── Primary accent (peach → terracotta) ────────────────────────
        primary: {
          DEFAULT: '#BC6A47',
          dark: '#9E5236',
          accent: '#E8A17C',
          light: '#FBE4D6',
        },

        // ── Named semantic aliases (opt-in, for new components) ─────────
        peach: {
          light: '#FBE4D6',
          soft: '#F7D3BF',
          DEFAULT: '#E8A17C',
          base: '#E8A17C',
          deep: '#C6704A',
        },
        beige: {
          light: '#F3EBDF',
          DEFAULT: '#E7DBCB',
          base: '#D8C9B3',
          deep: '#B9A68D',
        },
        ink: {
          DEFAULT: '#29231F',
          secondary: '#6B5D4D',
          muted: '#8A7D6D',
        },

        // ── Overridden stock scales (re-tint scattered utilities) ───────
        slate: neutral,
        gray: neutral,
        stone: neutral,
        teal: peach,
        emerald: sage,
        green: sage,
        amber: bronze,
        yellow: bronze,
        red: coral,
        rose: coral,
        blue: dusty,
        indigo: plum,
        violet: plum,
        purple: mauve,
        orange: terracotta,
      },
      fontFamily: {
        sans: ['Hanken Grotesk', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        // Warm-neutral, low-opacity, large-blur — surfaces float, not box.
        card: '0 1px 2px rgba(120, 88, 56, 0.05), 0 6px 18px rgba(120, 88, 56, 0.07)',
        lifted: '0 16px 40px rgba(120, 88, 56, 0.16)',
        glow: '0 0 0 4px rgba(232, 161, 124, 0.25)',
      },
      borderRadius: {
        xl: '0.85rem',
        '2xl': '1.15rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};
