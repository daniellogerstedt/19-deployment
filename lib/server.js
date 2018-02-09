'use strict';

// App Dependencies

const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const debug = require('debug')('http:server');
const errorHandler = require('./error-handler');

const app = express();
const PORT = process.env.PORT;
const router = express.Router();
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(cors());
app.use('/api/v1', router);
require('../route/route-auth')(router);
require('../route/route-gallery')(router);
require('../route/route-photo')(router);
app.all('/{0,}', () => errorHandler(new Error('Path Error: Route Not Found'), res));

// Server Controls

const server = module.exports = {};

server.start = () => {
  return new Promise((resolve, reject) => {
    if(server.isOn) return reject(new Error('Server Error: Server Is Already Running'));
    server.http = app.listen(PORT, () => {
      debug('>>>>Server Start<<<<');
      console.log(`Listening on ${PORT}`);
      server.isOn = true;
      mongoose.connect(MONGODB_URI);
      return resolve(server);
    });
  });
};

server.stop = () => {
  return new Promise((resolve, reject) => {
    if(!server.isOn) return reject(new Error('Server Error: Server Is Already Running'));
    server.http.close(() => {
      debug('<<<<Server Stopped>>>>');
      console.log(`Stopping Server`);
      server.isOn = false;
      mongoose.disconnect();
      return resolve(server);
    });
  });
};