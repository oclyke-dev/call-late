import React from 'react';
import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useParams,
} from 'react-router-dom';

import {
  useRoom,
  useUser,
} from '../hooks';

import {
  fetch_gql,
} from '../utils';

export default () => {
  const [room, join, leave] = useRoom();
  const [user, sign_in, sign_out] = useUser();
  const [signin, setSignin] = useState<{id: string, phone: string}>({id: '', phone: ''})
  const [settings, setSettings] = useState<{total_cards: string | number, cards_per_hand: string | number}>({total_cards: 0, cards_per_hand: 0})
  const { tag } = useParams();

  // make sure the room is joined
  useEffect(async () => {
    join(tag)
  }, []);

  // sync settings with game state
  useEffect(() => {
    if(room && room.settings.total_cards !== settings.total_cards){
      setSettings(prev => ({...prev, total_cards: room.settings.total_cards}));
    }
    if(room && room.settings.cards_per_hand !== settings.cards_per_hand){
      setSettings(prev => ({...prev, cards_per_hand: room.settings.cards_per_hand}));
    }
  }, [room])

  return <>
    <Link to='/'>call-late</Link>
  
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

      {room && room.phase === 0 && <div>
        <div>
          <input
            value={settings.total_cards}
            onChange={(e) => {
              if(e.target.value === ''){
                setSettings(prev => ({...prev, total_cards: ''}))
              } else {
                setSettings(prev => ({...prev, total_cards: parseInt(e.target.value)}))
              }            }}
          />
          total cards
        </div>
        <div>
          <input
            value={settings.cards_per_hand}
            onChange={(e) => {
              if(e.target.value === ''){
                setSettings(prev => ({...prev, cards_per_hand: ''}))
              } else {
                setSettings(prev => ({...prev, cards_per_hand: parseInt(e.target.value)}))
              }
            }}
          />
          cards per hand
        </div>
        <button
          onClick={async () => {
            const update: {cards_per_hand?: number, total_cards?: number} = {};
            if(settings.cards_per_hand !== ''){ update.cards_per_hand = settings.cards_per_hand; }
            if(settings.total_cards !== ''){ update.total_cards = settings.total_cards; }

            await fetch_gql(`mutation ($room_id: ID!){ changeCardsPerHand(room_id: $room_id, cards_per_hand: ${settings.cards_per_hand}){ _id tag phase players }}`, {room_id: room._id});
            await fetch_gql(`mutation ($room_id: ID!){ changeTotalCards(room_id: $room_id, total_cards: ${settings.total_cards}){ _id tag phase players }}`, {room_id: room._id});
          }}
        >
          apply settings
        </button>
      </div>}
    </div>

  </>
}
