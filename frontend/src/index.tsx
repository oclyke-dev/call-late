import {
  default as React,
} from 'react';
import { render } from 'react-dom';

import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import {
  ThemeProvider,
} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import {
  theme,
} from './theme';

import {
  Game,
  Start,
  User,
  Leaderboard,
} from './pages';

import {
  default as App,
} from './app';


const container = document.getElementById('root');
render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<App />}>
            <Route path='$user' element={<User />} />
            <Route path='$leaderboard' element={<Leaderboard />} />
            <Route path=':tag' element={<Game />} />
            <Route index element={<Start />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
  , container);
