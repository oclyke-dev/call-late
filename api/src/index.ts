import {
  ApolloServer,
} from 'apollo-server';

import {
  WebSocketServer,
  WebSocket,
} from 'ws';

import {
  createServer
} from 'https';

import {
  readFileSync
} from 'fs';

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

const DEFAULT_SESSION_PORT = 8042;

const run = async () => {
  // print debug info
  console.log('starting api')
  console.log('NODE_ENV: ', process.env.NODE_ENV)

  // database connection
  const mongoserver = await start_server();
  const uri = mongoserver.getUri();
  const client = new MongoClient(uri);
  await client.connect();
  db = get_database(client);

  // websocket server
  const SESSION_PORT = (typeof process.env.SESSION_PORT !== 'undefined') ? parseInt(process.env.SESSION_PORT) : DEFAULT_SESSION_PORT;
  if(process.env.NODE_ENV === 'development') {
    const wss = new WebSocketServer({ port: SESSION_PORT });
    start_wss(wss);
  } else {
    if (typeof process.env.SSL_CERT === 'undefined') {
      throw new Error('SSL_CERT path not provided in .env');
    }
    if (typeof process.env.SSL_KEY === 'undefined') {
      throw new Error('SSL_KEY path not provided in .env');
    }

    const server = createServer({
      cert: readFileSync(process.env.SSL_CERT),
      key: readFileSync(process.env.SSL_KEY),
    });
    const wss = new WebSocketServer({ server });
    start_wss(wss);
    server.listen(SESSION_PORT);
  }

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
