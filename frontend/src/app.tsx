import {
  default as React,
} from 'react';

import {
  useLocation,
  Outlet,
  Link,
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
        <Header/>
        <Content/>
        {location.pathname === '/' && <ForkMe/>}
      </Box>
    </Sluice>
  </>
}

function Header () {
  return <>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',

      }}
    >
      <Link to='/'>call-late</Link>
    </Box>
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
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',

        // textAlign: 'center',
        margin: 1,
      }}
    >
      <Box
        sx={{
          marginRight: 2,
        }}
      >
        <span>for Lia</span>
      </Box>

      <Box>
        <a href='https://github.com/oclyke-dev/call-late'>
          github • {API_VER}
        </a>
      </Box>
    </Box>  
  </>
}
