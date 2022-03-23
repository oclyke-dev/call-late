import {
  MongoMemoryReplSet
} from 'mongodb-memory-server';

export async function start_server() {
  return new Promise<MongoMemoryReplSet>((resolve, reject) => {
    if(process.env.NODE_ENV === 'production'){
      reject('not to be used in production');
    } else if ((process.env.NODE_ENV === 'development') || (process.env.NODE_ENV === 'test')){
      // see docs for mongodb-memory-server
      // https://github.com/nodkz/mongodb-memory-server
      MongoMemoryReplSet.create({ replSet: { count: 4 } })
      .then(resolve)
      .catch(reject);
    } else {
      reject(`invalid NODE_ENV: ${process.env.NODE_ENV}`);
    }
  });
}
