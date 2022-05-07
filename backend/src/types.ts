import {
  Collection,
  OptionalId,
  Db,
} from 'mongodb';

export type ID = string
export type Hand = Array<number>
export enum GamePhase {
  WAITING,
  PLAYING,
  FINISHED,
}

export type User = OptionalId<{
  phone: string | null
  tag: string
  color: string
  total_games: number
  total_wins: number
}>

export enum CardSource {
  DISCARD,
  RESERVE,
}
export type Turn = {
  index: number | null
  user: ID | null,
  card: number | null
  source: CardSource | null
}

export type Settings = {
  total_cards: number
  cards_per_hand: number
}

export type PlayerEntry = {
  order: number,
}

export type Room = OptionalId<{
  tag: string
  discard_stack: Array<number>
  hands: {[key: string]: Hand}
  players: {[key: string]: PlayerEntry}
  phase: GamePhase
  ordered: Array<ID>
  turn: Turn
  settings: Settings
  winner: ID | null
  initialized: boolean
}>

export interface Database {
  rooms: Collection<Room>
  users: Collection<User>
}
