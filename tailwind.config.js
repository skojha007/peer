/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#173D2A',
          deep: '#102B20',
          dark: '#0c2017',
          light: '#23533a'
        },
        action: {
          DEFAULT: '#26783C',
          hover: '#1C622F',
        },
        surface: {
          main: '#F3F7EA',
          secondary: '#EAF1DC',
          card: '#FAFCF5',
          highlight: '#E4EDCF',
          hover: '#EEF4E3',
        },
        peercraft: {
          border: '#DCE6D2',
          text: '#1D3024',
          muted: '#687769',
          credit: '#EFC66B',
          blue: '#DDEBFA',
          purple: '#E9E1FA',
          error: '#D94A4A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      borderRadius: {
        card: '16px',
        input: '11px',
        btn: '11px'
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(16, 43, 32, 0.05), 0 4px 12px rgba(16, 43, 32, 0.03)',
        card: '0 2px 8px rgba(23, 61, 42, 0.04), 0 8px 24px rgba(23, 61, 42, 0.04)',
        glow: '0 0 20px rgba(239, 198, 107, 0.25)',
      }
    },
  },
  plugins: [],
}
