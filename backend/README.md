# backend
why is there a backend directory? isn't the backend simply handled by a mongodb server?

these are questions you might find yourself wondering. this backend directory is all about:
* defining backend operations that can be performed on the database
* testing these operations

# testing
there are two ways to test:
* single-shot ```yarn test```
* live reload ```yarn test-reload```

# operations
what are the fundamental operations necessary to make a game of 'call-late' work?
* create a room
* remove a room
* add players to a room
* change a room into the playing state
* change which player's turn it is
* allow players to re-order cards in their hand
