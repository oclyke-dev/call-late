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
  tag: string
  color: string
  total_games: number
  total_wins: number
}>

export type Room = OptionalId<{
  tag: string
  discard_stack: Array<number>
  hands: Map<ID, Hand>
  players: Array<ID>
  phase: GamePhase
}>

export interface Database {
  rooms: Collection<Room>
  users: Collection<User>
}
