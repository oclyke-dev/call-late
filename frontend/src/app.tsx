import {
  default as React,
} from 'react';

import {
  Outlet,
} from 'react-router-dom';

export default () => {
  return <>
    {/* outlet for pages */}
    <Outlet />
  </>
}
