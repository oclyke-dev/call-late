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
  styled,
} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import Box from '@mui/material/Box';
import Input from '@mui/material/Input';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
// import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';

import QrCode2Icon from '@mui/icons-material/QrCode2';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IosShareIcon from '@mui/icons-material/IosShare';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import GroupRemoveIcon from '@mui/icons-material/GroupRemove';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

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

type SettingsInfoType = {
  show: boolean,
}

type SignInInfoType = {
  phone: string,
  id: string,
  show: boolean,
}

type AssociateInfoType = {
  phone: string,
  show: boolean,
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
  const [user, {sign_in, sign_out, associate_phone, clear_storage}] = useUser();
  const { tag } = useParams();

  const [settingsinfo, setSettingsInfo] = useState<SettingsInfoType>({show: false});
  function showSettings () { setSettingsInfo(prev => ({...prev, show: true})); }
  function hideSettings () { setSettingsInfo(prev => ({...prev, show: false})); }

  const initial_signininfo = {show: false, phone: '', id: ''};
  const [signininfo, setSignInInfo] = useState<SignInInfoType>(initial_signininfo);
  function showSignIn () { setSignInInfo(prev => ({...prev, show: true})); }
  function hideSignIn () { setSignInInfo(prev => ({...prev, show: false})); }

  const initial_associateinfo = {show: false, phone: ''};
  const [associateinfo, setAssociateInfo] = useState<AssociateInfoType>(initial_associateinfo);
  function showAssociate () { setAssociateInfo(prev => ({...prev, show: true})); }
  function hideAssociate () { setAssociateInfo(prev => ({...prev, show: false})); }

  const is_big = useMediaQuery(theme.breakpoints.up('sm'));

  function copyurl () {
    const url = `https://games.oclyke.dev/call-late/${tag}`;
    navigator.clipboard.writeText(url)
    .catch(console.error);
  }

  return <>
    <Box>
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

              <IconButton color='secondary' onClick={(settingsinfo.show) ? hideSettings : showSettings}>{(settingsinfo.show) ? <CheckIcon/> : <SettingsIcon/> }</IconButton>
            </Stack>
          </Box>
        </Box>
      </>}

      </Box>

    {/* settings */}
    {settingsinfo.show && <>
      <Box>
        <Tooltip title='clear user data'><IconButton onClick={clear_storage}><DeleteIcon/></IconButton></Tooltip>
        <Tooltip title='sign out'><IconButton onClick={sign_out}><GroupRemoveIcon/></IconButton></Tooltip>
        <Tooltip title='sign in'><IconButton onClick={(signininfo.show) ? hideSignIn : showSignIn}>{(signininfo.show) ? <CheckIcon/> : <PersonIcon/>}</IconButton></Tooltip>
        <Tooltip title='save your account'><IconButton onClick={(associateinfo.show) ? hideAssociate : showAssociate}>{(associateinfo.show) ? <CheckIcon/> : <GroupAddIcon/>}</IconButton></Tooltip>
      </Box>

      {/* sign in */}
      {signininfo.show && <>
        <Box sx={{display: 'flex', flexDirection: 'row'}}>

          {/* inputs */}
          <Box sx={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
            {/* username */}
            <SignInInput
              placeholder='user id'
              value={signininfo.id}
              onChange={async (e) => {
                const value = e.target.value;
                setSignInInfo(prev => ({...prev, id: value}));
              }}
            />

            {/* phone number */}
            <SignInInput
              placeholder='phone number'
              value={signininfo.phone}
              onChange={async (e) => {
                const value = e.target.value;
                setSignInInfo(prev => ({...prev, phone: value}));
              }}
            />
          </Box>

          {/* button */}
          <Box sx={{minWidth: '25%', height: '100%'}}>
            <Button
              sx={{margin: '1em'}}
              color='secondary'
              variant='contained'
              fullWidth
              onClick={() => {
                sign_in(signininfo.id, signininfo.phone);
                setSignInInfo(initial_signininfo)
              }}
            >
              sign in
            </Button>
          </Box>
        </Box>

      </>}

      {associateinfo.show && <>
        <Box sx={{display: 'flex', flexDirection: 'row'}}>

          {/* inputs */}
          <Box sx={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
            {/* phone number */}
            <SignInInput
              placeholder='phone number'
              value={associateinfo.phone}
              onChange={async (e) => {
                const value = e.target.value;
                setAssociateInfo(prev => ({...prev, phone: value}));
              }}
            />
          </Box>

          {/* button */}
          <Box sx={{minWidth: '25%', height: '100%'}}>
          <Button
              sx={{margin: '1em'}}
              color='secondary'
              variant='contained'
              fullWidth
              onClick={() => {
                associate_phone(associateinfo.phone);
                setAssociateInfo(initial_associateinfo)
              }}
            >
              save account
            </Button>
          </Box>

        </Box>
      
      </>}

    </>}

    </Box>
  </>
}

const SignInInput = styled(Input)(({theme}) => ({
  // borderRadius: '100rem',
  // padding: '0 0.5rem 0 0.5rem',
  // fontSize: theme.typography.h4.fontSize,
  // background: theme.palette.secondary.light,
  // color: theme.palette.secondary.dark,
  // boxShadow: `0.25rem 0.25rem 0.25rem ${theme.palette.grey[400]}`
}));

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
