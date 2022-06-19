import {
  default as React,
} from 'react';

import {
  styled,
  useTheme,
} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import {
  Title,
} from '../styles';

// todo: consider using the react render function pattern...?
export const Card = styled(Paper)(({theme}) => ({
  backgroundColor: '#f5f8fc',
  aspectRatio: '3.5/2.5',
  borderColor: theme.palette.secondary.main,
}));

export const Number = styled(Typography)(({theme}) => ({
  fontWeight: 'bold',
}));

export function PlayerCard ({name}) {
  return <>
    <Card >
      {name}
    </Card>
  </>
}

function CardBack() {
  const theme = useTheme();
  const is_big = useMediaQuery(theme.breakpoints.up('sm'));
  return <>
    <Card sx={{alignContent: 'center', overflow: 'hidden'}}>
      {/* vertical center */}
      <Box sx={{height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-around'}}>
        {/* border */}
        <Card
          sx={{
            margin: '2%',
            maxHeight: '96%',
            boxShadow: 'none',
            borderStyle: 'solid',
            borderWidth: '2%',
          }}
        >
          {/* overflow hiding */}
          <Card
            sx={{
              margin: '4%',
              maxHeight: '92%',
              boxShadow: 'none',
              overflow: 'hidden',
            }}
          >
            {/* vertical center */}
            <Box sx={{height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-around'}}>
              {/* rotation */}
              <Box sx={{
                textAlign: 'center',
                transformOrigin: 'center',
                transform: 'rotate(-45deg)',
              }}>
                <Title variant={is_big ? 'h2' : 'h3'}>call-late</Title>
              </Box>
            </Box>
          </Card>
        </Card>
      </Box>
    </Card>
  </>
}

type NumberCardProps = {
  value: number,
  position: number,
  flipped?: boolean,
  aspect?: number,
}

export function NumberCard (props: NumberCardProps) {
  const theme = useTheme();
  const is_big = useMediaQuery(theme.breakpoints.up('sm'));

  const {value, aspect, position, flipped = false} = props;

  if (flipped) {
    return <>
      <CardBack/>
    </>
  } else {
    return <>

      <Card
        sx={{
          aspectRatio: `${aspect}/1`,
          alignContent: 'center',
          overflow: 'hidden',
        }}
      >
      {/* vertical center */}
      <Box sx={{width: '100%', display: 'flex', flexDirection: 'row'}}>

        <Box
          sx={{flexGrow: position}}
        />

        <Number
          variant={is_big ? 'h4' : 'h5'}
        >
          {`${value}`}
        </Number>

        <Box
          sx={{flexGrow: (1-position)}}
        />

      </Box>
    </Card>
  </>
  }
}
