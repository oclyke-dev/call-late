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

export type Room = OptionalId<{
  tag: string
  discard_stack: Array<number>
  hands: Map<ID, Hand>
  players: Array<ID>
  phase: GamePhase
}>

export interface Database {
  rooms: Collection<Room>
}
