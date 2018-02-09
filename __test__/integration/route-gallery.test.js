'use strict';

// Testing Dependencies
const server = require('../../lib/server');
const superagent = require('superagent');
const mocks = require('../lib/mocks');
const faker = require('faker');
require('jest');

// Test Variables
let port = process.env.PORT;
let api = `:${port}/api/v1/gallery`;

describe('Server module', () => {
  beforeAll(() => server.start(port, () => console.log(`listening on ${port}`)));
  beforeAll(() => mocks.gallery.createOne().then(mock => this.mockData = mock));
  beforeAll(() => mocks.gallery.createOne().then(mock => this.mockDataTwo = mock));
  afterAll(() => server.stop());
  afterAll(() => {
    mocks.gallery.removeAll();
    mocks.auth.removeAll();
  });

  describe('POST /api/v1/gallery', () => {
    it('Should return a valid gallery', () => {
      return superagent.post(`${api}`)
        .set('Authorization', `Bearer ${this.mockData.token}`)
        .send({
          name: faker.lorem.word(),
          description: faker.lorem.words(20),
        })
        .then(res => {          
          expect(res.status).toBe(201);
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
    });
  });
  describe('GET /api/v1/gallery', () => {
    beforeAll(() => {
      return superagent.get(`${api}`)
        .set('Authorization', `Bearer ${this.mockData.token}`)
        .then(res => this.response = res);
    });
    describe('Valid Routes/Data', () => {
      it('Should respond with a status 200', () => {
        expect(this.response.status).toBe(200);
      });
      it('Should respond with a valid token', () => {
        expect(Array.isArray(this.response.body)).toBeTruthy();
      });
    });

    describe('Invalid Routes/Data', () => {
      it('Should respond a not found or path error when given an incorrect path', () => {
        return superagent.get(`${api}`)
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
  describe('GET /api/v1/gallery/:_id?', () => {
    beforeAll(() => {
      return superagent.get(`${api}/${this.mockData.gallery._id}`)
        .set('Authorization', `Bearer ${this.mockData.token}`)
        .then(res => this.response = res);
    });
    describe('Valid Routes/Data', () => {
      it('Should respond with a status 200', () => {
        expect(this.response.status).toBe(200);
      });
      it('Should respond with a valid token', () => {
        expect(this.response.body).toBeInstanceOf(Object);
      });
    });

    describe('Invalid Routes/Data', () => {
      it('Should respond a not found or path error when given an incorrect path', () => {
        return superagent.get(`${api}/${this.mockData.gallery._id}`)
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
  describe('PUT /api/v1/gallery/:_id?', () => {
    beforeAll(() => {
      return superagent.put(`${api}/${this.mockData.gallery._id}`)
        .set('Authorization', `Bearer ${this.mockData.token}`)
        .send({name: 'testupdate'})
        .then(res => this.response = res)
        .then(() => {
          return superagent.get(`${api}/${this.mockData.gallery._id}`)
            .set('Authorization', `Bearer ${this.mockData.token}`)
            .then(res => this.updated = res);
        });
    });
    describe('Valid Routes/Data', () => {
      it('Should respond with a status 204', () => {
        expect(this.response.status).toBe(204);
      });
      it('Should respond with a valid token', () => {
        expect(this.updated.body.name).toBe('testupdate');
      });
    });

    describe('Invalid Routes/Data', () => {
      it('Should respond an Authorization Error', () => {
        return superagent.put(`${api}/${this.mockData.gallery._id}`)
          .catch(err => {
            this.error = err;
            expect(err.response.text).toMatch(/Authorization/);
          });
      });
      it('Should respond a 401 bad path when given an incorrect path', () => {
        expect(this.error.status).toBe(401);
      });
      it('Should respond an Authorization Error', () => {
        return superagent.put(`${api}/${this.mockData.gallery._id}`)
          .set('Authorization', `Bearer ${this.mockDataTwo.token}`)
          .send({name: 'notvalid'})
          .catch(err => {
            expect(err.response.text).toMatch(/Authorization/);
          });
      });
      it('Should respond an Authorization Error', () => {
        return superagent.put(`${api}`)
          .set('Authorization', `Bearer ${this.mockData.token}`)
          .send({ name: 'notvalid' })
          .catch(err => {
            expect(err.response.text).toMatch(/Authorization/);
          });
      });
    });
  });
  describe('DELETE /api/v1/gallery/:_id?', () => {
    beforeAll(() => {
      return superagent.del(`${api}/${this.mockData.gallery._id}`)
        .set('Authorization', `Bearer ${this.mockData.token}`)
        .then(res => this.response = res)
        .then(() => {
          return superagent.get(`${api}/${this.mockData.gallery._id}`)
            .set('Authorization', `Bearer ${this.mockData.token}`)
            .then(res => this.updated = res);
        });
    });
    describe('Valid Routes/Data', () => {
      it('Should respond with a status 204', () => {
        expect(this.response.status).toBe(204);
      });
      it('Should respond with a valid token', () => {
        expect(this.updated.body).toBeNull();
      });
    });

    describe('Invalid Routes/Data', () => {
      it('Should respond an Authorization Error', () => {
        return superagent.del(`${api}/${this.mockData.gallery._id}`)
          .catch(err => {
            this.error = err;
            expect(err.response.text).toMatch(/Authorization/);
          });
      });
      it('Should respond a 401 bad path when given an incorrect path', () => {
        expect(this.error.status).toBe(401);
      });
      it('Should respond an Authorization Error', () => {
        return superagent.del(`${api}/${this.mockDataTwo.gallery._id}`)
          .set('Authorization', `Bearer ${this.mockData.token}`)
          .catch(err => {
            expect(err.response.text).toMatch(/Authorization/);
          });
      });
      it('Should respond an Authorization Error', () => {
        return superagent.del(`${api}`)
          .set('Authorization', `Bearer ${this.mockData.token}`)
          .catch(err => {
            expect(err.response.text).toMatch(/Authorization/);
          });
      });
      it('Should respond an Authorization Error', () => {
        return superagent.del(`${api}/${this.mockData.gallery._id}`)
          .set('Authorization', `Bearer ${this.mockData.token}`)
          .catch(err => {
            this.error = err;
            expect(err.response.text).toMatch(/Authorization/);
          });
      });
    });
  });
});