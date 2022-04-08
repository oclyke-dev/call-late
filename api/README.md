# api
why do we have an API?
* it is a formal interface to the system defining which actions are allowed and by whom (authorization)
* the browser environment does not like (and perhaps cannot?) support the node mongo drivers, so we can use the API to pass the data in to the application in a web-friendly manner (html GET requests)

# fetch in node
node version 17.5 introduced experimental support for the ```fetch``` api. it can be enabled using the ```--experimental-fetch``` option passed to node. in order to pass this option through to node when using ts-node the alternative syntax ```node --loader ts-node/esm``` is used (otherwise ts-node chokes on ```--experimental-fetch```). 
