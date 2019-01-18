const supertest = require('supertest');
const app = require('../server/app');
const request = supertest(app);
app.listen(5000, () => {
  console.log('app is listening..');
});

//Although db module is not used here, db needs to be mocked for function to run
// const db = require('../db');
// jest.mock('../db');

describe('/reviews', () => {
  test('should respond to GET request for API review 1  with status 200', (done) => {
    request.get('/reviews/1').then((res) => {
      expect(res.status).toBe(200);
      done();
    });
  });

  test('test standalone app should respond with request with status 200', (done) => {
    request.get('/').then((res) => {
      expect(res.header['content-type']).toBe('text/html; charset=UTF-8');
      expect(res.status).toBe(200);
      done();
    });  
  });

  test('should respond with 404 if an invalid param id provided', (done) => {
    request.get('/reviews/not_valid')
      .expect(404, done);
  });


  test('should respond with 404 for everything else', (done) => {
    request.get('/reviews')
      .expect(404, done);
  });

  test('should not allow requests other than get requests', (done) => {
    request.post('/reviews/1').then((res) => {
      expect(res.status).toBe(404);
      done();
    });
  });
});