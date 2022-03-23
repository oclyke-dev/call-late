import { MongoMemoryReplSet } from 'mongodb-memory-server';

import {
  connect,
} from './utils';

// async function run() {



//   try {



//     // await client.connect(); // Connect the client to the server
//     // await client.db('admin').command({ ping: 1 }); // Establish and verify connection
//     // console.log('Connected successfully to server');
//     // console.log(uri);

//     await connect();


//   } finally {
//     await client.close(); // Ensures that the client will close when you finish/error
//     await replset.stop(); // The ReplSet can be stopped again with
//   }
// }

// run().catch(console.dir)
