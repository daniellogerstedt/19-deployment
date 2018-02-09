'use strict';

const errorHandler = require('./error-handler');
const Auth = require('../model/auth');
const jwt = require('jsonwebtoken');


// Vague error message to keep system from being easily deconstructed by repeated failed requests.
const ERROR_MESSAGE = 'Authorization Failed';

module.exports = function (req, res, next) {
  let authHeader = req.headers.authorization;
  if(!authHeader) return errorHandler(new Error(ERROR_MESSAGE), res);

  let token = authHeader.split('Bearer ')[1];
  if(!token) return errorHandler(new Error(ERROR_MESSAGE), res);

  jwt.verify(token, process.env.APP_SECRET, (err, dec) => {
    if(err) {
      err.message = ERROR_MESSAGE;
      return errorHandler(err, res);
    }

    Auth.findOne({compareHash: dec.token})
      .then(user => {
        if(!user) return errorHandler(new Error(ERROR_MESSAGE), res);

        req.user = user;
        next();
      });
  });

};