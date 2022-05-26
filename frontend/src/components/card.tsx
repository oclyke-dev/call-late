import {
  default as React,
} from 'react';

import Paper from '@mui/material/Paper';

// todo: consider using the react render function pattern...?
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

export function PlayerCard ({name}) {
  return <>
    <Card>
      {name}
    </Card>
  </>
}

export function NumberCard ({number, flipped = false}) {
  return <>
    <Card>
      {(flipped) ? 'back of card' :  `${number}`}
    </Card>
  </>
}
