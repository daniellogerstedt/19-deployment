'use strict';

const Auth = require('../../model/auth');
const Gallery = require('../../model/gallery');
const Photo = require('../../model/photo');
const sa = require('superagent');
const faker = require('faker');

const mocks = module.exports = {};
mocks.auth = {};

mocks.auth.createOne = () => {
  let result = {};
  result.password = faker.internet.password();

  return new Auth({
    username: faker.internet.userName(),
    email: faker.internet.email(),
  })
    .generatePasswordHash(result.password)
    .then(user => result.user = user)
    .then(user => user.generateToken())
    .then(token => result.token = token)
    .then(() => {
      return result;
    });
};

mocks.auth.removeAll = () => Promise.all([Auth.remove()]);

mocks.gallery = {};
mocks.gallery.createOne = () => {
  let result = {};
  return mocks.auth.createOne()
    .then(user => result = user)
    .then(user => {
      return new Gallery({
        name: faker.internet.domainWord(),
        description: faker.random.words(15),
        userId: user.user._id,
      }).save();
    })
    .then(gallery => {
      result.gallery = gallery;
      return result;
    });

};

mocks.gallery.removeAll = () => Promise.all([Gallery.remove()]);

mocks.photo = {};
mocks.photo.createOne = (filepath) => {
  let result = {};
  return mocks.gallery.createOne()
    .then(data => result = data)
    .then(() => {
      return sa.post(`:${process.env.PORT}/api/v1/photo`)
        .set('Authorization', `Bearer ${result.token}`)
        .field({'name': faker.hacker.ingverb()})
        .field({'desc': faker.lorem.words(10)})
        .field({'galleryId': result.gallery._id.toString()})
        .attach('image', filepath)
        .then(res => {
          result.photoRes = res;
          return result;
        });
    });
};

mocks.photo.removeAll = () => Promise.all([Photo.remove()]);