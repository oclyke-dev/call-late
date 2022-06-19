import {
  createTheme,
} from '@mui/material/styles';

import {
  orange,
  blue,
} from '@mui/material/colors';

// // example of how the 'status' field could be employed to theme an element
// const CustomCheckbox = styled(Checkbox)(({ theme }) => ({
//   color: theme.status.ok,
//   '&.Mui-checked': {
//     color: theme.status.danger,
//   },
// }));
// render(<CustomCheckbox/>)

declare module '@mui/material/styles' {
  interface Theme {

    // adding this status field shows how the theme can be extended with custom functionality - the app does not currently use the 'status' options
    status: {
      danger: string;
      ok: string;
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {

    // as with above this enables the 
    status?: {
      danger?: string;
      ok?: string;
    };
  }
}

// app fonts
const app_fonts = [
  'Mali',
  'Comic Neue',
  'Roboto',
  'Arial',
];

// normal theme
export const theme = createTheme({
  palette: {
    background: {
      default: '#d3def0',
    },
    primary: {
      dark: '#004a8b',
      main: '#4e79ad',
      light: '#d3def0',
    },
    secondary: {
      dark: '#920048',
      main: '#b34e78',
      light: '#d494ae',
    }
  },
  typography: {
    fontFamily: app_fonts.join(','),
  },

  // here is how the coors for various statuses are encoded in the theme
  status: {
    danger: orange[500],
    ok: blue[300],
  },
});


// colors
const colors = {
  primary: {
    '50': '#d3def0',
    '100': '#95add2',
    '200': '#4e79ad',
    '300': '#004a8b',
    '400': '#002c77',
    '500': '#000e63',
    '600': '#00065e',
    '700': '#00055d',
    '800': '#00035d',
    '900': '#00015c',
  },
  complimentary: {
    '50': '#f0e5d3',
    '100': '#dabe92',
    '200': '#bf934b',
    '300': '#a56b00',
    '400': '#965100',
    '500': '#873700',
    '600': '#862e00',
    '700': '#821d00',
    '800': '#7c0000',
    '900': '#740000',
  },
  analogous1: {
    '50': '#d3edf0',
    '100': '#94d1d8',
    '200': '#4bb1be',
    '300': '#0093a5',
    '400': '#008195',
    '500': '#006e86',
    '600': '#006277',
    '700': '#005161',
    '800': '#003e4b',
    '900': '#002125',
  },
  analogous2: {
    '50': '#efeef9',
    '100': '#d6d3f0',
    '200': '#bdb7e7',
    '300': '#a399dd',
    '400': '#917fd4',
    '500': '#8266cb',
    '600': '#7a5dbf',
    '700': '#7151b2',
    '800': '#6947a6',
    '900': '#5c3390',
  },
  triadic1: {
    '50': '#f5edf9',
    '100': '#e5d3f0',
    '200': '#d6b5e9',
    '300': '#c794e3',
    '400': '#bb78db',
    '500': '#af5dd4',
    '600': '#a556cd',
    '700': '#984dc2',
    '800': '#8e46bb',
    '900': '#7d38ac',
  },
  triadic2: {
    '50': '#f0d3de',
    '100': '#d494ae',
    '200': '#b34e78',
    '300': '#920048',
    '400': '#7d0029',
    '500': '#670008',
    '600': '#5c0007',
    '700': '#4d0001',
    '800': '#440004',
    '900': '#3b0013',
  },
}
