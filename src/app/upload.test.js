const app = require('./app');
const mongoose = require('mongoose');
const request = require('supertest');

describe('GET /api/v1/booklendings', () => {

    beforeAll( async () => {
        jest.setTimeout(8000);
        app.locals.db = await mongoose.connect(/*process.env.DB_URL*/ 'mongodb://localhost:27017/Discoveroo');
    });
    afterAll( () => {
        mongoose.connection.close(true);
    });
    
    test('POST /api/v1/upload without authentication', () => {
        return request(app).post('/api/v1/upload')
        //.set('Accept', 'application/json')
        .expect(401, { success: false, message: "No token provided." });
    });
});
