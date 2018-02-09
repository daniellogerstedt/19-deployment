'use strict';

let eH = require('../../lib/error-handler');
require('jest');


class Res {
  constructor(err) {
    this.error = err;
    this.code = null;
    this.message = null;
  }

  status(code) {
    this.code = code;
    return this;
  }

  send(message) {
    this.message = message;
    return this;
  }
}

let enoent = new Res(new Error('Authorization Failed'));
let validation = new Res(new Error('Validation Error'));
let path = new Res(new Error('Path Error'));
let generic = new Res(new Error('Generic'));
let objectId = new Res(new Error('ObjectId failed'));
let dupkey = new Res(new Error('duplicate key'));

describe('Error Handler', () => {
  it('should return an error 404 for any error containing Duplicate Key', () => {
    expect(eH(dupkey.error, dupkey).code).toBe(409);
  });
  it('should return an error 404 for any error containing ObjectId Failed', () => {
    expect(eH(objectId.error, objectId).code).toBe(404);
  });
  it('should return an error 404 for any error containing ENOENT', () => {
    expect(eH(enoent.error, enoent).code).toBe(401);
  });
  it('should return an error 404 for any error containing Path Error', () => {
    expect(eH(path.error, path).code).toBe(404);
  });
  it('should return an error 400 for any error containing Validation Error', () => {
    expect(eH(validation.error, validation).code).toBe(400);
  });
  it('should return an error 500 for any other errors that occur', () => {
    expect(eH(generic.error, generic).code).toBe(500);
  });
});