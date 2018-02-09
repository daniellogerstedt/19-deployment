'use strict';

// Route Dependencies

const Photo = require('../model/photo');
const bodyParser = require('body-parser').json();
const bearerAuth = require('../lib/bearer-auth-middleware');

// Photo Upload Dependencies & Setup
const multer = require('multer');
const tempDir = `${__dirname}/../temp`;
const upload = multer({dest: tempDir});

module.exports = function (router) {
  router.get('/photos/me', bearerAuth, (req, res) => {
    Photo.find({userId: req.user._id})
      .then(photos => photos.map(photo => photo._id))
      .then(ids => res.status(200).json(ids));
  });

  router.route('/photo/:_id?')
    .post(bearerAuth, bodyParser, upload.single('image'), (req, res) => {
      Photo.upload(req)
        .then(data => new Photo(data).save())
        .then(pic => res.status(201).json(pic));
    })

    .get(bearerAuth, (req, res) => {
      if(req.params._id) {
        return Photo.findById(req.params._id)
          .then(pic => res.status(200).json(pic));
      }

      Photo.find()
        .then(photos => photos.map(photo => photo._id))
        .then(ids => res.status(200).json(ids));
    });
};