import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        pixel: {
          floor1:   '#c8a96e',
          floor2:   '#b8955a',
          wall:     '#3d2608',
          felt: {
            rect:   '#1a472a',
            round:  '#023e8a',
          },
          available:'#90ee90',
          open:     '#43aa8b',
          progress: '#f3722c',
          timer:    '#f9c74f',
          bar:      '#5c3d1e',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
