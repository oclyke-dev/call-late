import React from 'react';
import {
  useEffect,
  useState,
} from 'react';

import {
  useParams,
} from 'react-router-dom';

import {
  fetch_gql,
} from '../../utils';

import {
  useRoom,
  useUser,
} from '../../hooks';

import {
  Room,
} from '../../../../backend/src';

export default (props: {room: Room}) => {
  const [settings, setSettings] = useState<{total_cards: string | number, cards_per_hand: string | number}>({total_cards: 0, cards_per_hand: 0})
  const [user, sign_in, sign_out] = useUser();
  const room = props.room;

  // sync settings with game state
  useEffect(() => {
    if(room && room.settings.total_cards !== settings.total_cards){
      setSettings(prev => ({...prev, total_cards: room.settings.total_cards}));
    }
    if(room && room.settings.cards_per_hand !== settings.cards_per_hand){
      setSettings(prev => ({...prev, cards_per_hand: room.settings.cards_per_hand}));
    }
  }, [room]);

  return <>
    waiting page

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

  </>
}
