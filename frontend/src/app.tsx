import {
  default as React,
  useState,
  useContext,
} from 'react';

import {
  useLocation,
  Outlet,
  Link,
  useParams,
} from 'react-router-dom';

import QRCode from 'qrcode';
import {
  useTheme,
} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
// import Popover from '@mui/material/Popover';

import QrCode2Icon from '@mui/icons-material/QrCode2';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IosShareIcon from '@mui/icons-material/IosShare';

import {
  useUser,
} from './hooks';

import {
  Title,
} from './styles';

import {
  Sluice,
} from './components';

import {
  HighlightType,
  HighlightLink,
} from './styles';

import {
  API_VER,
} from './constants';

type QRInfoType = {
  data: string,
  visible: boolean,
  anchor: HTMLButtonElement | null,
  show: () => void,
  hide: () => void,
}

export type AppContextType = {
  onTagChange?: (tag: string) => void,
  qrinfo: QRInfoType,

};
export const AppContext = React.createContext<AppContextType>({});


export default () => {
  const location = useLocation();

  function showqr () { setQRInfo(prev => ({...prev, visible: true})); }
  function hideqr () { setQRInfo(prev => ({...prev, visible: false})); }

  const [qrinfo, setQRInfo] = useState<QRInfoType>({data: '', visible: false, anchor: null, show: showqr, hide: hideqr});

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
        <AppContext.Provider value={{
          onTagChange: async (tag) => {
            const data = await QRCode.toDataURL(`https://games.oclyke.dev/call-late/${tag}`, { errorCorrectionLevel: 'H' });
            setQRInfo(prev => ({...prev, data}));
          },
          qrinfo,
        }}>
          <Header/>
          <Outlet/>
          {location.pathname === '/' && <ForkMe/>}
        </AppContext.Provider>
      </Box>
    </Sluice>

    {/* qr code modal */}
    {qrinfo.visible && <>
      <Box
        sx={{
          backgroundColor: 'rgba(0,0,0,0.5);',
          height: '100%',
          width: '100%',
          position: 'absolute',
          top: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
        }}
        onClick={(e) => {
          qrinfo.hide();
        }}
      >
        <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>

          {/* qr code */}
          <Box>
            <img src={qrinfo.data} style={{backgroundColor: 'white'}}/>
          </Box>
        </Box>
      </Box>
    </>}

  </>
}

function Header () {
  const theme = useTheme();
  const {onTagChange, qrinfo} = useContext(AppContext);
  const location = useLocation();
  const { tag } = useParams();

  const is_big = useMediaQuery(theme.breakpoints.up('sm'));

  function copyurl () {
    const url = `https://games.oclyke.dev/call-late/${tag}`;
    navigator.clipboard.writeText(url)
    .catch(console.error);
  }

  return <>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',

      }}
    >
      <Link to='/' style={{textDecoration: 'none'}}>
        <Title variant={is_big ? 'h2' : 'h3'}>
          call-late
        </Title>
      </Link>

    {location.pathname !== '/' && <>
      <Box sx={{display: 'flex', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-around'}}>
        <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'end'}}>
          <Stack direction='row' spacing={2}>
            <HighlightType variant='h5'>{tag}</HighlightType>
            <IconButton color='secondary' onClick={copyurl}><ContentCopyIcon/></IconButton>
            <IconButton color='secondary' onClick={qrinfo.show}><QrCode2Icon/></IconButton>
          </Stack>
        </Box>
      </Box>
    </>}

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
        <HighlightType variant='body1'>for Lia</HighlightType>
      </Box>

      <Box>
        <HighlightLink href='https://github.com/oclyke-dev/call-late'>
          github • {API_VER}
        </HighlightLink>
      </Box>
    </Box>  
  </>
}
