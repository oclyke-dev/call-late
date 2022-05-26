import {
  default as React,
} from 'react';

import {
  Outlet,
} from 'react-router-dom';

import {
  Sluice,
} from './components';

export default () => {
  return <>
    <Sluice>
      {/* outlet for pages */}
      <Outlet />
    </Sluice>
  </>
}
