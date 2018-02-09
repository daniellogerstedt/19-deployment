'use strict';

// Testing Dependencies
const server = require('../../lib/server');
const superagent = require('superagent');
const mocks = require('../lib/mocks');
require('jest');

// Test Variables
let port = process.env.PORT;
let api = `:${port}/api/v1/photo`;

describe('Server module', () => {
  beforeAll(() => server.start(port, () => console.log(`listening on ${port}`)));
  beforeAll(() => mocks.photo.createOne(`${__dirname}/../lib/bm.jpg`).then(mock => this.mockData = mock));
  afterAll(() => server.stop());
  afterAll(() => {
    mocks.gallery.removeAll();
    mocks.auth.removeAll();
  });

  describe('POST /api/v1/Photo', () => {
    describe('Valid Routes/Data', () => {
      it('Should return a valid photo', () => {
        expect(this.mockData.photoRes.body).toHaveProperty('name');
        expect(this.mockData.photoRes.body).toHaveProperty('imageURI');
      });
      it('Should return a valid status', () => {
        expect(this.mockData.photoRes.status).toBe(201);
      });
    });
    describe('Invalid Routes/Data', () => {
      it('Should respond with an authorization failure if missing a password, username, or email', () => {
        return superagent.post(`${api}`)
          .send()
          .catch(err => {
            this.error = err;
            expect(err.response.text).toMatch(/Authorization/);
          });
      });
      it('Should respond a 401 for missing required information', () => {
        expect(this.error.status).toBe(401);
      });
      it('Should return an Authorization Error', () => {
        return superagent.post(`${api}`)
          .field({name: 'stuff'})
          .field({desc: 'test' })
          .field({galleryId: this.mockData.gallery._id.toString()})
          .catch(err => {
            this.error = err;
            expect(err.response.text).toMatch(/Authorization/);
          });
      });
    });
  });
  describe('GET /api/v1/Photo', () => {
    beforeAll(() => {
      return superagent.get(`${api}`)
        .set('Authorization', `Bearer ${this.mockData.token}`)
        .then(res => this.response = res);
    });
    describe('Valid Routes/Data', () => {
      it('Should respond with a status 200', () => {
        expect(this.response.status).toBe(200);
      });
      it('Should respond with a valid array of photos', () => {
        expect(Array.isArray(this.response.body)).toBeTruthy();
      });
    });

    describe('Invalid Routes/Data', () => {
      it('Should respond a not found or path error when given an incorrect path', () => {
        return superagent.get(`${api}`)
          .send()
          .catch(err => {
            this.error = err;
            expect(err.response.text).toMatch(/Authorization/);
          });
      });
      it('Should respond a 401 bad path when given an incorrect path', () => {
        expect(this.error.status).toBe(401);
      });
    });
  });
  describe('GET /api/v1/Photo/:_id?', () => {
    beforeAll(() => {
      return superagent.get(`${api}/${this.mockData.photoRes.body._id}`)
        .set('Authorization', `Bearer ${this.mockData.token}`)
        .then(res => this.response = res);
    });
    describe('Valid Routes/Data', () => {
      it('Should respond with a status 200', () => {
        expect(this.response.status).toBe(200);
      });
      it('Should respond with a valid photo', () => {
        expect(this.response.body).toHaveProperty('name');
        expect(this.response.body).toHaveProperty('imageURI');
      });
    });

    describe('Invalid Routes/Data', () => {
      it('Should respond a authorization error when no token is provided', () => {
        return superagent.get(`${api}/${this.mockData.photoRes.body._id}`)
          .send()
          .catch(err => {
            this.error = err;
            expect(err.response.text).toMatch(/Authorization/);
          });
      });
      it('Should respond a 401 bad path when given an incorrect path', () => {
        expect(this.error.status).toBe(401);
      });
      it('Should respond a authorization error when provided with an invalid id', () => {
        return superagent.get(`${api}/invalidid`)
          .send()
          .catch(err => {
            this.error = err;
            expect(err.response.text).toMatch(/Authorization/);
          });
      });
    });
  });
});