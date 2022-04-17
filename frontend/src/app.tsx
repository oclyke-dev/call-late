import React from 'react';
import {
  useEffect,
  useState,
} from 'react';

import {
  useRoom,
  useUser,
} from './hooks';

import {
  fetch_gql,
} from './utils';

export default () => {
  const [room, join, leave] = useRoom();
  const [user, sign_in, sign_out] = useUser();
  const [signin, setSignin] = useState<{id: string, phone: string}>({id: '', phone: ''})

  useEffect(async () => {
    console.log('here I am baby');
    join('testes tag')


  }, []);

  return <>
    hello world
    <div>
      user info: 
      <pre>{(user !== null) && JSON.stringify(user, null, 2)}</pre>
    </div>
    <div>
      room info:
      <pre>{(room !== null) && JSON.stringify(room, null, 2)}</pre>
    </div>

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

      {room.turn.source !== null && <div>
        <span>swap card with:</span>
        {room.hands[user._id.toString()].map((value, idx) => {
          return <button
            key={`swap_button.${idx}`}
            onClick={async () => {
              console.log('swapping at: ', idx)
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

    </div>}

    <div>
      <div>
        <button
          onClick={() => {
            localStorage.clear();
          }}
        >
          clear local storage
        </button>
      </div>

      <div>
        <button
          onClick={async () => {
            console.log('clicked', room);
            await fetch_gql(`mutation ($room_id: ID!, $user_id: ID!){ addPlayerToRoom(room_id: $room_id, user_id: $user_id){ players }}`, {room_id: room._id, user_id: user._id});
          }}
        >
          add user to game
        </button>
      </div>

      <div>
        <button
          onClick={async () => {
            await fetch_gql(`mutation ($room_id: ID!){ startGame(room_id: $room_id){ _id tag phase players }}`, {room_id: room._id});
          }}
        >
          start game
        </button>
      </div>

      <div>
        <button
          onClick={async () => {
            await fetch_gql(`mutation ($room_id: ID!, $user_id: ID!){ addPlayerToOrder(room_id: $room_id, user_id: $user_id){ _id tag phase players }}`, {room_id: room._id, user_id: user._id});
          }}
        >
          get in order
        </button>
      </div>
    </div>

    <div style={{backgroundColor: 'gray'}}>
      <div>
        <button
          onClick={async () => {
            const id = user._id;
            const phone = '+13037369483'; // format should include country code and only numeric values
            console.log('trying to add phone number to player...', id, phone);
            const response = await fetch_gql(`mutation ($id: ID!, $phone: String!){ addPhoneNumberToUser(id: $id, phone: $phone){ _id tag phone }}`, {id, phone});
            console.log(response);
          }}
        >
          add phone to player
        </button>
      </div>

      <div>
        <button
          onClick={async () => {
            sign_out();
          }}
        >
          sign out
        </button>
      </div>

      <div>
        <div>
        <input
          value={signin.id}
          onChange={(e) => {
            setSignin(prev => ({...prev, id: e.target.value}))
          }}
        />
        user id
        </div>

        <div>
        <input
          value={signin.phone}
          onChange={(e) => {
            setSignin(prev => ({...prev, phone: e.target.value}))
          }}
        />
        phone number
        </div>

        <button
          onClick={async () => {
            sign_in(signin.id, signin.phone);
          }}
        >
          sign in
        </button>
      </div>
    </div>
  </>
}
