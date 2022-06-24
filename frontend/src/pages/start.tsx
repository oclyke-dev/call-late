import {
	default as React,
} from 'react';
import {
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

// @ts-ignore
import * as greg from 'greg';

import {
  styled,
} from '@mui/material/styles';

import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CachedIcon from '@mui/icons-material/Cached';

import {
  HighlightType,
  HighlightUL,
  HighlightSpan,
} from '../styles';

import {
  fetch_gql,
} from '../utils';


function suggest_tag () {
  const tokens = greg.sentence().split(' ');
  return [tokens[1], tokens[2]].join('-');
}


const SelectorInput = styled(Input)(({theme}) => ({
  borderRadius: '100rem',
  padding: '0 0.5rem 0 0.5rem',
  fontSize: theme.typography.h4.fontSize,
  background: theme.palette.secondary.light,
  color: theme.palette.secondary.dark,
  boxShadow: `0.25rem 0.25rem 0.25rem ${theme.palette.grey[400]}`
}));

const SelectorIconButton = styled(IconButton)(({theme}) => ({
  color: theme.palette.secondary.main,
}));

const LightDivider = styled(Divider)(({theme}) => ({
  borderColor: `${theme.palette.primary.main}40`,
}));

const RevertSpan = styled('span')(({theme}) => ({
  color: 'initial',
}));

function makeSingle(generator) {
  let globalNonce;
  return async function(...args) {
    const localNonce = globalNonce = new Object();

    const iter = generator(...args);
    let resumeValue;
    for (;;) {
      const n = iter.next(resumeValue);
      if (n.done) {
        return n.value;  // final return value of passed generator
      }

      // whatever the generator yielded, _now_ run await on it
      resumeValue = await n.value;
      if (localNonce !== globalNonce) {
        return;  // a new call was made
      }
      // next loop, we give resumeValue back to the generator
    }
  };
}

function* checkTag(value, setter) {
  const result = yield fetch_gql(`query { getRoomByTag(tag: "${value}"){_id}}`); // check with server to see if this tag exists  
  setter(prev => ({...prev, exists: (result.data.getRoomByTag !== null)})); // finally update the tag existence
}
const checkTagSingle = makeSingle(checkTag);



export default () => {
  const navigate = useNavigate();
  const [tag, setTag] = useState<{value: string, exists: boolean}>({value: '', exists: false});

  return <>

    <Box>

      <Box sx={{marginBottom: '1rem', marginTop: '0.5rem'}}>
        <SelectorInput
          fullWidth
          disableUnderline
          id='standard-adornment-password'
          type='text'
          placeholder='game id'
          value={tag.value}
          onChange={async (e) => {
            const value = e.target.value; // handle the user's typing
            setTag(prev => ({...prev, value})); // set tag immediately
            checkTagSingle(value, setTag); // check tag for existence w/ preemption
          }}
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
              navigate(`/${tag.value}`);
            }
          }}
          startAdornment={
            <InputAdornment position='start'>
              <SelectorIconButton
                aria-label='toggle password visibility'
                onClick={async () => {
                  const value = suggest_tag();
                  const result = await fetch_gql(`query { getRoomByTag(tag: "${value}"){_id}}`);
                  setTag({value, exists: (result.data.getRoomByTag !== null)});
                }}
              >
                <CachedIcon/>
              </SelectorIconButton>
            </InputAdornment>
          }          
          endAdornment={
            <InputAdornment position='end'>
              <SelectorIconButton
                aria-label='toggle password visibility'
                onClick={() => {
                  navigate(`/${tag.value}`);
                }}
              >
                {(tag.exists) ? <ArrowForwardIcon/> : <AddCircleIcon/>}
              </SelectorIconButton>
            </InputAdornment>
          }
        />
      </Box>

      <LightDivider/>


      <Box sx={{marginTop: '0.5rem', marginBottom: '0.5rem'}}>
        call-late is all about getting your cards in order before your best friend does!
      </Box>

      <LightDivider/>
      
      <Box sx={{marginTop: '0.5rem', marginBottom: '0.5rem'}}>
        {/* setup */}
        <HighlightType variant='h6' fontWeight={700}>setup</HighlightType>
        <HighlightUL sx={{marginTop: 0}}>
          <li><HighlightSpan sx={{marginRight: '1rem'}}>find a game</HighlightSpan><RevertSpan>use the game selector to join an existing game or create a new game.</RevertSpan></li>
          <li><HighlightSpan sx={{marginRight: '1rem'}}>choose an order</HighlightSpan><RevertSpan>wait for all your friends to join the game and drag their names into the order in which you would like to play.</RevertSpan></li>
          <li><HighlightSpan sx={{marginRight: '1rem'}}>start playing</HighlightSpan><RevertSpan>when everyone is on their a-game press <b>start</b> to begin.</RevertSpan></li>
        </HighlightUL>

        {/* playing */}
        <HighlightType variant='h6' fontWeight={700}>playing</HighlightType>
        <HighlightUL sx={{marginTop: 0}}>
          <li><HighlightSpan sx={{marginRight: '1rem'}}>wait your turn</HighlightSpan><RevertSpan>use this time to think of a funny comeback or heckle 😜</RevertSpan></li>
          <li><HighlightSpan sx={{marginRight: '1rem'}}>pick up a card</HighlightSpan><RevertSpan>there are two choices - the discard pile or the reserve. no give-backs from the reserve pile!</RevertSpan></li>
          <li><HighlightSpan sx={{marginRight: '1rem'}}>give it a home</HighlightSpan><RevertSpan>the card can either go in your hand or to the discard pile - choose wisely!</RevertSpan></li>
          <li><HighlightSpan sx={{marginRight: '1rem'}}>give it a home</HighlightSpan><RevertSpan>no pressure...</RevertSpan></li>
        </HighlightUL>

        {/* winning */}
        <HighlightType variant='h6' fontWeight={700}>winning</HighlightType>
        <HighlightUL sx={{marginTop: 0}}>
          <li><HighlightSpan sx={{marginRight: '1rem'}}>get all cards in order</HighlightSpan><RevertSpan>its really that simple! you can go in either direction</RevertSpan></li>
        </HighlightUL>
      </Box>

    </Box>

    <Box sx={{flexGrow: 1}}/>
  </>
}
