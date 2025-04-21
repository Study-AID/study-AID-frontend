import type { Config } from 'tailwindcss';
import {
  isolateInsideOfContainer,
  scopedPreflightStyles,
} from 'tailwindcss-scoped-preflight';

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './node_modules/@material-tailwind/react/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [
    scopedPreflightStyles({
      isolationStrategy: isolateInsideOfContainer('.twp', {
        except: '.no-twp',
      }),
    }),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
};
