import React from 'react';
import ReactDOM from 'react-dom';

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

ReactDOM.render(
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
  </React.StrictMode>,
  document.getElementById('root')
);
