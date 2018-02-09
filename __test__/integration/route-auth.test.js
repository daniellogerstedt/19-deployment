'use strict';

// Testing Dependencies
const server = require('../../lib/server');
const superagent = require('superagent');
const faker = require('faker');
require('jest');

// Test Variables
let port = process.env.PORT;
let api = `:${port}/api/v1`;

describe('Server module', () => {
  this.mockUser = { username: faker.internet.userName(), pw: faker.internet.password(), email: faker.internet.email() };
  this.invalid = { username: faker.internet.userName(), email: faker.internet.email() };
  beforeAll(() => server.start(port, () => console.log(`listening on ${port}`)));
  afterAll(() => server.stop());

  describe('POST /api/v1/signup', () => {
    beforeAll(() => {
      return superagent.post(`${api}/signup`)
        .send(this.mockUser)
        .then(res => this.response = res);
    });
    describe('Valid Routes/Data', () => {
      it('Should respond with a status 201', () => {
        expect(this.response.status).toBe(201);
      });
      it('Should respond with a valid token', () => {
        expect(this.response.body.split('.').length).toBe(3);
      });
    });

    describe('Invalid Routes/Data', () => {
      it('Should respond with an authorization failure if missing a password, username, or email', () => {
        return superagent.post(`${api}/signup`)
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
  describe('GET /api/v1/signin', () => {
    beforeAll(() => {
      return superagent.get(`${api}/signin`)
        .auth(this.mockUser.username, this.mockUser.pw)
        .then(res => this.response = res);
    });
    describe('Valid Routes/Data', () => {
      it('Should respond with a status 200', () => {
        expect(this.response.status).toBe(200);
      });
      it('Should respond with a valid token', () => {
        expect(this.response.body.split('.').length).toBe(3);
      });
    });

    describe('Invalid Routes/Data', () => {
      it('Should respond a not found or path error when given an incorrect path', () => {
        return superagent.get(`${api}/signin`)
          .send()
          .catch(err => {
            this.error = err;
            expect(err.response.text).toMatch(/Authorization/);
          });
      });
      it('Should respond a not found or path error when given an incorrect path', () => {
        return superagent.get(`${api}/signin`)
          .auth('', this.mockUser.pw)
          .catch(err => {
            this.error = err;
            expect(err.response.text).toMatch(/Authorization/);
          });
      });
      it('Should respond a not found or path error when given an incorrect path', () => {
        return superagent.get(`${api}/signin`)
          .auth(this.mockUser.username, '')
          .catch(err => {
            this.error = err;
            expect(err.response.text).toMatch(/Authorization/);
          });
      });
      it('Should respond a 401 bad path when given an incorrect path', () => {
        expect(this.error.status).toBe(401);
      });
      it('Should respond a not found or path error when given an incorrect path', () => {
        return superagent.get(`${api}/signin`)
          .auth(this.mockUser.userName, 'incorrectpassword')
          .catch(err => {
            this.error = err;
            expect(err.response.text).toMatch(/Authorization/);
          });
      });
    });
  });
});