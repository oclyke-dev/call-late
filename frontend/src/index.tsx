import React from 'react';
import { createRoot } from 'react-dom/client';

import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

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
const root = createRoot(container);
root.render(
  <React.StrictMode>
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
  </React.StrictMode>
);
