# mtgox-mock

MtGox doesn't provide a test environment.
This project replicates Gox' Socket.io API and orderbook in order to test bots trading MtGox

## Usage

First, launch the server
```bash
$ node server.js
```

This will launch a socket.io instance that you can connect to and an
express instance that you can make request to (for instance to add or
cancel an order).

## Progress

This is a work in progress. For now the orderbook is super basic, and
the trades are being streamed from a MongoDB database.
See the `TODO.md` for the next steps.
