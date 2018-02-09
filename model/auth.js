'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const debug = require('debug')('http:auth');

const Auth = mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  email: {type: String, required: true},
  compareHash: {type: String, unique: true},
}, {timestamps: true});


Auth.methods.generatePasswordHash = function (password) {
  if(!password) return Promise.reject(new Error('Authorization Failure: Password Required'));
  debug('>>>>GPH Start<<<<');
  return bcrypt.hash(password, 10)
    .then(hash => this.password = hash)
    .then(() => this);
};

Auth.methods.comparePasswordHash = function (password) {
  debug('<<<<CPH Start>>>>');
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, valid) => {
      // if(err) return reject(err);
      if(!valid) return reject(new Error('Authorization Failure: Incorrect Password Or Username.'));
      resolve(this);
    });
  });
};

Auth.methods.generateCompareHash = function () {
  debug('>>>>GCH Start<<<<');
  this.compareHash = crypto.randomBytes(32).toString('hex');
  return this.save()
    .then(() => Promise.resolve(this.compareHash));
  // .catch(() => this.generateCompareHash());
};

Auth.methods.generateToken = function () {
  debug('>>>>GT Start<<<<');
  return this.generateCompareHash()
    .then(compareHash => jwt.sign({token: compareHash}, process.env.APP_SECRET));
  // .catch(err => err)
};


module.exports = mongoose.model('auth', Auth);