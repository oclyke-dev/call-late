const { getExpectedTwilioSignature } = require('twilio/lib/webhooks/webhooks');

// Retrieve your auth token from the environment instead of hardcoding
const authToken = process.env.TWILIO_AUTH_TOKEN;
const apiEndpoint = process.env.TWILIO_API_ENDPOINT;

// Use the Twilio helper to generate your valid signature!
// The 1st argument is your Twilio auth token.
// The 2nd is the full URL of your Function.
// The 3rd is any form encoded data being sent, which is none!
const xTwilioSignature = getExpectedTwilioSignature(
  authToken,
  apiEndpoint,
  {} // <- Leave this empty if sending request data via JSON
);

// Print the signature to the console for use with your
// preferred HTTP client
console.log('xTwilioSignature: ', xTwilioSignature);

// For example, output will look like this:
// xTwilioSignature: coGTEaFEMv8ejgfGtgtUsbL8r7c=

// And then you can see how to use the API as in this curl request:
// curl -X POST '${apiEndpoint}' \
//   -H 'X-Twilio-Signature: ZqQw9ne8UnBSZK9jDxlwLHpVAHc=' \
//   -H 'Content-Type: application/json' \
//   --data-raw '{
//     "Body": "Hello, there!"
//   }'

// or, using the brand-new shiny in-built fetch for node...
// (see https://blog.logrocket.com/fetch-api-node-js/ for instructions on how to use the --experimental-fetch flag with node 17.5 to enable this...)
const test = false;
if(test){
  fetch(apiEndpoint, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'X-Twilio-Signature': xTwilioSignature,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Body: 'actually this is from the backend',
    }),
  })
  .then(response => {
    console.log(response)
  });
}
