import {
  ApolloServer,
} from 'apollo-server';

import {
  WebSocketServer,
  WebSocket,
} from 'ws';

import {
  MongoClient
} from 'mongodb';

import {
  start_server,
  get_database,
  Database,
} from '../../backend/src';

import {
  get_schema,
} from './utils';

import {
  resolvers,
} from './resolvers';

import {
  start_wss
} from './sessions';

export let db: Database;
export let wss: WebSocketServer;

const run = async () => {
  // database connection
  const mongoserver = await start_server();
  const uri = mongoserver.getUri();
  const client = new MongoClient(uri);
  await client.connect();
  db = get_database(client);

  // websocket server
  wss = new WebSocketServer({ port: 4001 });
  start_wss(wss);

  // graphql server
  const server = new ApolloServer({
    typeDefs: get_schema(),
    resolvers,
    context: ({ req }) => {
      const token = req.headers.authorization || '';
      return { token };
    },
  });
  const server_info = await server.listen();
  await start_server();
  console.log(`listening on ${server_info.url}`)
};

run();
