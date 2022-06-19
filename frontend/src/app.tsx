import {
  default as React,
  useState,
  useContext,
} from 'react';

import {
  useLocation,
  Outlet,
  Link,
} from 'react-router-dom';

import QRCode from 'qrcode';
import Box from '@mui/material/Box';

import Typography from '@mui/material/Typography';

import {
  Sluice,
} from './components';

import {
  API_VER,
} from './constants';

type QRInfoType = {
  data: string,
  visible: boolean,
}

export type AppContextType = {
  onTagChange?: (tag: string) => void,
  qrinfo: QRInfoType,
  showqr: () => void,
  hideqr: () => void,
};
export const AppContext = React.createContext<AppContextType>({});

export default () => {
  const location = useLocation();
  const [qrinfo, setQRInfo] = useState<QRInfoType>({data: '', visible: false});

  function showqr () { setQRInfo(prev => ({...prev, visible: true})); }
  function hideqr () { setQRInfo(prev => ({...prev, visible: false})); }

  return <>


    {qrinfo.visible && <>
      <Box
        sx={{
          backgroundColor: '#000000',
          // opacity: 0.5,
          height: '100%',
          width: '100%',
          position: 'absolute'
        }}
        onClick={(e) => {
          hideqr();
        }}
      >
        <img src={qrinfo.data}/>
      </Box>
    </>}

    <Sluice>
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '100vh',
        }}
      >
        <AppContext.Provider value={{
          onTagChange: async (tag) => {
            const data = await QRCode.toDataURL(`https://games.oclyke.dev/call-late/${tag}`, { errorCorrectionLevel: 'H' });
            setQRInfo(prev => ({...prev, data}));
          },
          qrinfo,
          showqr,
          hideqr,
        }}>
          <Header/>
          <Content/>
          {location.pathname === '/' && <ForkMe/>}
        </AppContext.Provider>
      </Box>
    </Sluice>
  </>
}

function Header () {
  const {onTagChange, qrinfo, showqr, hideqr} = useContext(AppContext);
  const location = useLocation();

  return <>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',

      }}
    >
      <Link to='/'>
        <Typography
          variant='h1'
          style={{
            fontWeight: 500,
            fontStyle: 'italic',
          }}
        >
          call-late
        </Typography>
      </Link>

    {location.pathname !== '/' && <>
      <Box>
        <button>
          copy url
        </button>
        <button
          onClick={(e) => {
            showqr();
          }}
        >
          show qr code
        </button>
      </Box>
    </>}

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
