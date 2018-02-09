'use strict';

const mongoose = require('mongoose');

const Gallery = mongoose.Schema({
  name: {type: String, required: true},
  description: {type: String, required: true},
  userId: {type: String, required: true, ref: 'auth'},
}, {timestamp: true});

module.exports = mongoose.model('gallery', Gallery);