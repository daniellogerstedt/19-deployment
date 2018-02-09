'use strict';

const Auth = require('../model/auth');
const bodyParser = require('body-parser').json();
const errorHandler = require('../lib/error-handler');
const basicAuth = require('../lib/basic-auth-middleware');

module.exports = function(router) {
  router.post('/signup', bodyParser, (req, res) => {
    let pw = req.body.pw;
    delete req.body.pw;
    let user = new Auth(req.body);
    user.generatePasswordHash(pw)
      .then(newUser => newUser.save())
      .then(userRes => userRes.generateToken())
      // .then(token => {
      //   res.cookie(`X-CFGRAM-TOKEN`, token);
      //   res.status(201).json(token);
      // });
      .then(token => res.status(201).json(token))
      .catch(err => errorHandler(err, res));
  });

  router.get('/signin', basicAuth, (req, res) => {
    Auth.findOne({username: req.auth.username})
      .then(user => 
        user
          ? user.comparePasswordHash(req.auth.password)
          : Promise.reject(new Error('Authorization Error: User Does Not Exist'))
      )
      .then(user => {
        delete req.auth.password;
        return user;
      })
      .then(user => user.generateToken())
      .then(token => res.status(200).json(token))
      .catch(err => errorHandler(err, res));
  });
};