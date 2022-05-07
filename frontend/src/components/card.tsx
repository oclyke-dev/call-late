import {
  default as React,
} from 'react';

import Paper from '@mui/material/Paper';

export function Card (props) {
  return <>
    <Paper
      style={{
        backgroundColor: '#f5f8fc',
      }}
    >
      {props.children}
    </Paper>
  </>
}

export function PlayerCard ({player}) {
  return <>
    <Card>
      {player}
    </Card>
  </>
}

