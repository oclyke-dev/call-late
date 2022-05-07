import {
  fetch_gql,
} from '../utils';

export async function apply_settings  (room_id, settings) {
  const update: {cards_per_hand?: number, total_cards?: number} = {};
  if(settings.cards_per_hand !== ''){ update.cards_per_hand = settings.cards_per_hand; }
  if(settings.total_cards !== ''){ update.total_cards = settings.total_cards; }

  await fetch_gql(`mutation ($room_id: ID!){ changeCardsPerHand(room_id: $room_id, cards_per_hand: ${settings.cards_per_hand}){ _id tag phase players }}`, {room_id});
  await fetch_gql(`mutation ($room_id: ID!){ changeTotalCards(room_id: $room_id, total_cards: ${settings.total_cards}){ _id tag phase players }}`, {room_id});
}
