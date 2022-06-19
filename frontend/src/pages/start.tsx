import {
	default as React,
} from 'react';
import {
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  styled,
} from '@mui/material/styles';

import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import {
  fetch_gql,
} from '../utils';

const SelectorInput = styled(Input)(({theme}) => ({
  borderRadius: '100rem',
  padding: '0 1rem 0 2rem',
  fontSize: theme.typography.h4.fontSize,
  background: theme.palette.secondary.light,
  color: theme.palette.secondary.dark,
  boxShadow: `0.25rem 0.25rem 0.25rem ${theme.palette.grey[400]}`
}));

const SelectorIconButton = styled(IconButton)(({theme}) => ({
  color: theme.palette.secondary.main,
}));

export default () => {
  const navigate = useNavigate();
  const [tag, setTag] = useState<{value: string, exists: boolean}>({value: '', exists: false});

  return <>

    <div>

        <SelectorInput
          fullWidth
          disableUnderline
          id='standard-adornment-password'
          type='text'
          value={tag.value}
          onChange={async (e) => {
            console.log(e)
            const value = e.target.value;
            const result = await fetch_gql(`query { getRoomByTag(tag: "${value}"){_id}}`);
            setTag({value, exists: (result.data.getRoomByTag !== null)});
          }}
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
              navigate(`/${tag.value}`);
            }
          }}
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

    </div>
  </>
}
