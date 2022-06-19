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
      dark: '#670008',
      main: '#b34e78',
      light: '#d494ae',
    }
  },
  typography: {
    fontFamily: app_fonts.join(','),

    h1: {
      fontFamily: [
        'Mali',
        // 'Shadows Into Light Two',
        // 'Architects Daughter',
        // 'Schoolbell',
        ...app_fonts,
      ].join(','),
    },
  },

  // here is how the coors for various statuses are encoded in the theme
  status: {
    danger: orange[500],
    ok: blue[300],
  },
});


