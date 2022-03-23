import { MongoMemoryReplSet } from 'mongodb-memory-server';

import {
  MongoClient,
  Db,
  Collection,
} from 'mongodb';

export async function connect() {
  return new Promise<MongoClient>((resolve, reject) => {
    if(process.env.NODE_ENV === 'production'){
      reject('not ready for production!');
    } else if ((process.env.NODE_ENV === 'development') || (process.env.NODE_ENV === 'test')) {

      // see docs for mongodb-memory-server
      // https://github.com/nodkz/mongodb-memory-server
      MongoMemoryReplSet.create({ replSet: { count: 4 } })
      .then(replset => {
        const uri = replset.getUri();
        const client = new MongoClient(uri);
        return client.connect();
      })
      .then(client => {
        resolve(client);
      })
      .catch(reject);
      
    } else {
      reject(`invalid NODE_ENV: ${process.env.NODE_ENV}`);
    }
  })
}

export async function disconnect() {
  return new Promise<void>((resolve, reject) => {
    if(process.env.NODE_ENV === 'production'){
      reject('not ready for production!');
    } else if ((process.env.NODE_ENV === 'development') || (process.env.NODE_ENV === 'test')) {
      resolve();
    } else {
      reject(`invalid NODE_ENV: ${process.env.NODE_ENV}`);
    }
  })
}

