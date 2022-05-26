import {
  default as React,
} from 'react';

import {
  useLocation,
  Outlet,
} from 'react-router-dom';

import Box from '@mui/material/Box';

import {
  Sluice,
} from './components';

import {
  API_VER,
} from './constants';

export default () => {
  const location = useLocation();
  
  return <>
    <Sluice>
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '100vh',
        }}
      >
        <Content/>
        {location.pathname === '/' && <ForkMe/>}
      </Box>
    </Sluice>
  </>
}

function Content () {
  return <>
    <Box
      sx={{
        flexGrow: 1,
      }}
    >
        {/* outlet for pages */}
        <Outlet />
    </Box>
  </>
}

function ForkMe () {
  return <>
    <Box
      sx={{
        textAlign: 'center',
        margin: 1,
      }}
    >
      <a href='https://github.com/oclyke-dev/call-late'>
        github • {API_VER}
      </a>
    </Box>  
  </>
}
