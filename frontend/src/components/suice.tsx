import {
  default as React,
} from 'react';

import Grid from '@mui/material/Grid';

export default function (props: any) {
  return <>
    <Grid container>
      <Grid item xs={0}  sm={1}  md={3}/>
      <Grid item xs={12} sm={10}  md={6}>
        {props.children}
      </Grid>
      <Grid item xs={0}  sm={1}  md={3}/>
    </Grid>
  </>
}
