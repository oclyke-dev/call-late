import React from 'react';
import {
  useEffect,
  useState,
} from 'react';

import {
  useUser,
} from '../../hooks';

import {
  Room,
} from '../../../../backend/src';

export default (props: {room: Room}) => {
  const room = props.room;

  console.log(room)

  return <>
    game finished!
    the winner was {room.winner}
  </>
}
