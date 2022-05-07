import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  IntArrayDict: any;
  PlayerEntryDict: any;
};

export type AdditionalEntityFields = {
  path: InputMaybe<Scalars['String']>;
  type: InputMaybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addPhoneNumberToUser: Maybe<User>;
  addPlayerToOrder: Maybe<Room>;
  addPlayerToRoom: Maybe<Room>;
  changeCardsPerHand: Maybe<Room>;
  changeTotalCards: Maybe<Room>;
  createRoom: Maybe<Scalars['ID']>;
  createUser: Maybe<Scalars['ID']>;
  finishTurn: Maybe<Room>;
  removePlayerFromOrder: Maybe<Room>;
  resetRoom: Maybe<Room>;
  startGame: Maybe<Room>;
  startTurn: Maybe<Room>;
};


export type MutationAddPhoneNumberToUserArgs = {
  id: Scalars['ID'];
  phone: Scalars['String'];
};


export type MutationAddPlayerToOrderArgs = {
  room_id: Scalars['ID'];
  user_id: Scalars['ID'];
};


export type MutationAddPlayerToRoomArgs = {
  room_id: Scalars['ID'];
  user_id: Scalars['ID'];
};


export type MutationChangeCardsPerHandArgs = {
  cards_per_hand: Scalars['Int'];
  room_id: Scalars['ID'];
};


export type MutationChangeTotalCardsArgs = {
  room_id: Scalars['ID'];
  total_cards: Scalars['Int'];
};


export type MutationCreateRoomArgs = {
  tag: Scalars['String'];
};


export type MutationFinishTurnArgs = {
  room_id: Scalars['ID'];
  swap_index: InputMaybe<Scalars['Int']>;
  user_id: Scalars['ID'];
};


export type MutationRemovePlayerFromOrderArgs = {
  room_id: Scalars['ID'];
  user_id: Scalars['ID'];
};


export type MutationResetRoomArgs = {
  room_id: Scalars['ID'];
  tag: Scalars['String'];
};


export type MutationStartGameArgs = {
  room_id: Scalars['ID'];
};


export type MutationStartTurnArgs = {
  card_source: Scalars['Int'];
  room_id: Scalars['ID'];
  user_id: Scalars['ID'];
};

export type Query = {
  __typename?: 'Query';
  getRoomById: Maybe<Room>;
  getRoomByTag: Maybe<Room>;
  getUserById: Maybe<User>;
  verifyUser: Maybe<User>;
};


export type QueryGetRoomByIdArgs = {
  id: Scalars['ID'];
};


export type QueryGetRoomByTagArgs = {
  tag: Scalars['String'];
};


export type QueryGetUserByIdArgs = {
  id: Scalars['ID'];
};


export type QueryVerifyUserArgs = {
  id: Scalars['ID'];
  phone: Scalars['String'];
};

export type Room = {
  __typename?: 'Room';
  _id: Scalars['ID'];
  discard_stack: Array<Scalars['Int']>;
  hands: Maybe<Scalars['IntArrayDict']>;
  ordered: Array<Scalars['ID']>;
  phase: Maybe<Scalars['Int']>;
  players: Scalars['PlayerEntryDict'];
  settings: Maybe<Settings>;
  tag: Scalars['String'];
  turn: Maybe<Turn>;
  winner: Maybe<Scalars['ID']>;
};

export type Settings = {
  __typename?: 'Settings';
  cards_per_hand: Scalars['Int'];
  total_cards: Scalars['Int'];
};

export type Turn = {
  __typename?: 'Turn';
  card: Maybe<Scalars['Int']>;
  index: Maybe<Scalars['Int']>;
  source: Maybe<Scalars['Int']>;
  user: Maybe<Scalars['ID']>;
};

export type User = {
  __typename?: 'User';
  _id: Scalars['ID'];
  color: Maybe<Scalars['String']>;
  phone: Maybe<Scalars['String']>;
  tag: Maybe<Scalars['String']>;
  total_games: Maybe<Scalars['Int']>;
  total_wins: Maybe<Scalars['Int']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AdditionalEntityFields: AdditionalEntityFields;
  String: ResolverTypeWrapper<Scalars['String']>;
  IntArrayDict: ResolverTypeWrapper<Scalars['IntArrayDict']>;
  Mutation: ResolverTypeWrapper<{}>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  PlayerEntryDict: ResolverTypeWrapper<Scalars['PlayerEntryDict']>;
  Query: ResolverTypeWrapper<{}>;
  Room: ResolverTypeWrapper<Room>;
  Settings: ResolverTypeWrapper<Settings>;
  Turn: ResolverTypeWrapper<Turn>;
  User: ResolverTypeWrapper<User>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AdditionalEntityFields: AdditionalEntityFields;
  String: Scalars['String'];
  IntArrayDict: Scalars['IntArrayDict'];
  Mutation: {};
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  PlayerEntryDict: Scalars['PlayerEntryDict'];
  Query: {};
  Room: Room;
  Settings: Settings;
  Turn: Turn;
  User: User;
  Boolean: Scalars['Boolean'];
};

export type UnionDirectiveArgs = {
  discriminatorField: Maybe<Scalars['String']>;
  additionalFields: Maybe<Array<Maybe<AdditionalEntityFields>>>;
};

export type UnionDirectiveResolver<Result, Parent, ContextType = any, Args = UnionDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AbstractEntityDirectiveArgs = {
  discriminatorField: Scalars['String'];
  additionalFields: Maybe<Array<Maybe<AdditionalEntityFields>>>;
};

export type AbstractEntityDirectiveResolver<Result, Parent, ContextType = any, Args = AbstractEntityDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type EntityDirectiveArgs = {
  embedded: Maybe<Scalars['Boolean']>;
  additionalFields: Maybe<Array<Maybe<AdditionalEntityFields>>>;
};

export type EntityDirectiveResolver<Result, Parent, ContextType = any, Args = EntityDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type ColumnDirectiveArgs = {
  overrideType: Maybe<Scalars['String']>;
};

export type ColumnDirectiveResolver<Result, Parent, ContextType = any, Args = ColumnDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type IdDirectiveArgs = { };

export type IdDirectiveResolver<Result, Parent, ContextType = any, Args = IdDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type LinkDirectiveArgs = {
  overrideType: Maybe<Scalars['String']>;
};

export type LinkDirectiveResolver<Result, Parent, ContextType = any, Args = LinkDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type EmbeddedDirectiveArgs = { };

export type EmbeddedDirectiveResolver<Result, Parent, ContextType = any, Args = EmbeddedDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type MapDirectiveArgs = {
  path: Scalars['String'];
};

export type MapDirectiveResolver<Result, Parent, ContextType = any, Args = MapDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export interface IntArrayDictScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['IntArrayDict'], any> {
  name: 'IntArrayDict';
}

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addPhoneNumberToUser: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationAddPhoneNumberToUserArgs, 'id' | 'phone'>>;
  addPlayerToOrder: Resolver<Maybe<ResolversTypes['Room']>, ParentType, ContextType, RequireFields<MutationAddPlayerToOrderArgs, 'room_id' | 'user_id'>>;
  addPlayerToRoom: Resolver<Maybe<ResolversTypes['Room']>, ParentType, ContextType, RequireFields<MutationAddPlayerToRoomArgs, 'room_id' | 'user_id'>>;
  changeCardsPerHand: Resolver<Maybe<ResolversTypes['Room']>, ParentType, ContextType, RequireFields<MutationChangeCardsPerHandArgs, 'cards_per_hand' | 'room_id'>>;
  changeTotalCards: Resolver<Maybe<ResolversTypes['Room']>, ParentType, ContextType, RequireFields<MutationChangeTotalCardsArgs, 'room_id' | 'total_cards'>>;
  createRoom: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationCreateRoomArgs, 'tag'>>;
  createUser: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  finishTurn: Resolver<Maybe<ResolversTypes['Room']>, ParentType, ContextType, RequireFields<MutationFinishTurnArgs, 'room_id' | 'user_id'>>;
  removePlayerFromOrder: Resolver<Maybe<ResolversTypes['Room']>, ParentType, ContextType, RequireFields<MutationRemovePlayerFromOrderArgs, 'room_id' | 'user_id'>>;
  resetRoom: Resolver<Maybe<ResolversTypes['Room']>, ParentType, ContextType, RequireFields<MutationResetRoomArgs, 'room_id' | 'tag'>>;
  startGame: Resolver<Maybe<ResolversTypes['Room']>, ParentType, ContextType, RequireFields<MutationStartGameArgs, 'room_id'>>;
  startTurn: Resolver<Maybe<ResolversTypes['Room']>, ParentType, ContextType, RequireFields<MutationStartTurnArgs, 'card_source' | 'room_id' | 'user_id'>>;
};

export interface PlayerEntryDictScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['PlayerEntryDict'], any> {
  name: 'PlayerEntryDict';
}

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  getRoomById: Resolver<Maybe<ResolversTypes['Room']>, ParentType, ContextType, RequireFields<QueryGetRoomByIdArgs, 'id'>>;
  getRoomByTag: Resolver<Maybe<ResolversTypes['Room']>, ParentType, ContextType, RequireFields<QueryGetRoomByTagArgs, 'tag'>>;
  getUserById: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryGetUserByIdArgs, 'id'>>;
  verifyUser: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryVerifyUserArgs, 'id' | 'phone'>>;
};

export type RoomResolvers<ContextType = any, ParentType extends ResolversParentTypes['Room'] = ResolversParentTypes['Room']> = {
  _id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  discard_stack: Resolver<Array<ResolversTypes['Int']>, ParentType, ContextType>;
  hands: Resolver<Maybe<ResolversTypes['IntArrayDict']>, ParentType, ContextType>;
  ordered: Resolver<Array<ResolversTypes['ID']>, ParentType, ContextType>;
  phase: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  players: Resolver<ResolversTypes['PlayerEntryDict'], ParentType, ContextType>;
  settings: Resolver<Maybe<ResolversTypes['Settings']>, ParentType, ContextType>;
  tag: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  turn: Resolver<Maybe<ResolversTypes['Turn']>, ParentType, ContextType>;
  winner: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SettingsResolvers<ContextType = any, ParentType extends ResolversParentTypes['Settings'] = ResolversParentTypes['Settings']> = {
  cards_per_hand: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  total_cards: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TurnResolvers<ContextType = any, ParentType extends ResolversParentTypes['Turn'] = ResolversParentTypes['Turn']> = {
  card: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  index: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  source: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  user: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  _id: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  color: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  phone: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tag: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  total_games: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  total_wins: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  IntArrayDict: GraphQLScalarType;
  Mutation: MutationResolvers<ContextType>;
  PlayerEntryDict: GraphQLScalarType;
  Query: QueryResolvers<ContextType>;
  Room: RoomResolvers<ContextType>;
  Settings: SettingsResolvers<ContextType>;
  Turn: TurnResolvers<ContextType>;
  User: UserResolvers<ContextType>;
};

export type DirectiveResolvers<ContextType = any> = {
  union: UnionDirectiveResolver<any, any, ContextType>;
  abstractEntity: AbstractEntityDirectiveResolver<any, any, ContextType>;
  entity: EntityDirectiveResolver<any, any, ContextType>;
  column: ColumnDirectiveResolver<any, any, ContextType>;
  id: IdDirectiveResolver<any, any, ContextType>;
  link: LinkDirectiveResolver<any, any, ContextType>;
  embedded: EmbeddedDirectiveResolver<any, any, ContextType>;
  map: MapDirectiveResolver<any, any, ContextType>;
};

import { ObjectId } from 'mongodb';