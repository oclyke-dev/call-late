# api
why do we have an API?
* it is a formal interface to the system defining which actions are allowed and by whom (authorization)
* the browser environment does not like (and perhaps cannot?) support the node mongo drivers, so we can use the API to pass the data in to the application in a web-friendly manner (html GET requests)
