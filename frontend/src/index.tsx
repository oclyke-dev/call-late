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

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Start />} />
        <Route path='/$user' element={<User />} />
        <Route path='/$leaderboard' element={<Leaderboard />} />
        <Route path='/:tag' element={<Game />} />

        
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
