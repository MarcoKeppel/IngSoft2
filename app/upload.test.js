const app = require('./app');
const mongoose = require('mongoose');
const User = require('./models/user.js');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const path = require('path');

describe('POST /api/v1/upload', () => {

    beforeAll( async () => {
        jest.setTimeout(8000);
        app.locals.db = await mongoose.connect(process.env.DB_URL);
    });
    afterAll( () => {
        mongoose.connection.close(true);
    });
    
    test('POST /api/v1/upload without authentication', () => {
        return request(app).post('/api/v1/upload')
        //.set('Accept', 'application/json')
        .expect(401, { success: false, message: "No token provided." });
    });

    test('POST /api/v1/upload with authentication, submitting a non-image file', async () => {

        let user = await User.findOne({
            email: "mail@example.com"
        }).exec();
        var payload = {
            email: user.email,
            id: user._id,
            username: user.username	
        }
        var options = {
            expiresIn: 86400
        }
        var token = jwt.sign(payload, process.env.SUPER_SECRET, options);

        return request(app).post('/api/v1/upload')
        .set('x-access-token', token)
        .attach("myFile", path.resolve(__dirname, './upload.js'), { contentType: 'multipart/form-data' })
        .expect(415, "Invalid file type provided");
    });

    test('POST /api/v1/upload with authentication, submitting an image file', async () => {

        let user = await User.findOne({
            email: "mail@example.com"
        }).exec();
        var payload = {
            email: user.email,
            id: user._id,
            username: user.username	
        }
        var options = {
            expiresIn: 86400
        }
        var token = jwt.sign(payload, process.env.SUPER_SECRET, options);

        const buffer = Buffer.from(path.resolve(__dirname, "./files/628b7f93785eab9840743db7.png"));

        return request(app).post('/api/v1/upload')
        .set('x-access-token', token)
        .attach("myFile", buffer, "image.png")
        .expect(200);
    });
});
