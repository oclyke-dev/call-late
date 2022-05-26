import {
  default as React,
} from 'react';

import {
  Outlet,
} from 'react-router-dom';

import Box from '@mui/material/Box';

import {
  Sluice,
} from './components';

export default () => {
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

        <Box
          sx={{
            flexGrow: 1,
          }}
        >
          
            {/* outlet for pages */}
            <Outlet />
        </Box>

        <Box>
          github link
        </Box>
      </Box>
    </Sluice>
  </>
}
