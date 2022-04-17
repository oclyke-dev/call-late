import React from 'react';
import {
  useEffect,
  useState,
} from 'react';

import {
  useRoom,
  useUser,
} from '../../hooks';

import {
  fetch_gql,
} from '../../utils';

import {
  Room,
} from '../../../../backend/src';

export default (props: {room: Room}) => {
  const [user, sign_in, sign_out] = useUser();
  const room = props.room;

  if(!user){
    return <>loading</>
  }

  if(!room.players.includes(user._id.toString())){
    return <>you are just a spectator of this game</>
  }

  return <>

    <div>
      discard stack: {room.discard_stack.length !== 0 && room.discard_stack[0]}
    </div>

    {room.hands[user._id.toString()].map((value, idx) => {
      return <>
        <div>
          {value}
        </div>
      </>
    })}

    {room && user && room.turn.user === user._id.toString() && <div style={{backgroundCOlor: 'green'}}>
      {room.turn.source === null && <div>
        <button
          disabled={room && user && room.turn.user !== user._id.toString()}
          onClick={async () => {
            console.warn('todo: somehow import the card source definitions from the backend codebase rather than relying on hard-coded values');
            await fetch_gql(`mutation ($room_id: ID!, $user_id: ID!){ startTurn(room_id: $room_id, user_id: $user_id, card_source: ${0}){ _id tag phase players }}`, {room_id: room._id, user_id: user._id});
          }}
        >
          pick up discard
        </button>
        <button
          disabled={room && user && room.turn.user !== user._id.toString()}
          onClick={async () => {
            console.warn('todo: somehow import the card source definitions from the backend codebase rather than relying on hard-coded values');
            await fetch_gql(`mutation ($room_id: ID!, $user_id: ID!){ startTurn(room_id: $room_id, user_id: $user_id, card_source: ${1}){ _id tag phase players }}`, {room_id: room._id, user_id: user._id});
          }}
        >
          pick up new card
        </button>
      </div>}
    </div>}


    {room.turn.source !== null && <div>
      <span>swap card with:</span>
      {room.hands[user._id.toString()].map((value, idx) => {
        return <button
          key={`swap_button.${idx}`}
          onClick={async () => {
            await fetch_gql(`mutation ($room_id: ID!, $user_id: ID!){ finishTurn(room_id: $room_id, user_id: $user_id, swap_index: ${idx}){ _id tag phase players }}`, {room_id: room._id, user_id: user._id});
          }}
        >
          {`${value} (${idx})`}
        </button>
      })}
      <button
        onClick={async () => {
          await fetch_gql(`mutation ($room_id: ID!, $user_id: ID!){ finishTurn(room_id: $room_id, user_id: $user_id, swap_index: ${null}){ _id tag phase players }}`, {room_id: room._id, user_id: user._id});
        }}
      >
        just discard
      </button>
    </div>}

  </>
}
