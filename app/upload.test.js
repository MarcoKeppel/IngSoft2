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
        .field("title", "sample title")
        .expect(401, { success: false, message: "No token provided." });
    });

    test('POST /api/v1/upload with authentication, without submitting a file', async () => {

        let user = await User.findOne({
            email: "mail@example.com"
        }).exec();
        let payload = {
            email: user.email,
            id: user._id,
            username: user.username	
        }
        let options = {
            expiresIn: 86400
        }
        let token = jwt.sign(payload, process.env.SUPER_SECRET, options);

        return request(app).post('/api/v1/upload')
        .set('x-access-token', token)
        .field("title", "sample title")
        .expect(400, "No files were uploaded.");
    });

    test('POST /api/v1/upload with authentication, without providing a title', async () => {

        let user = await User.findOne({
            email: "mail@example.com"
        }).exec();
        let payload = {
            email: user.email,
            id: user._id,
            username: user.username	
        }
        let options = {
            expiresIn: 86400
        }
        let token = jwt.sign(payload, process.env.SUPER_SECRET, options);

        return request(app).post('/api/v1/upload')
        .set('x-access-token', token)
        .attach("myFile", path.resolve(__dirname, './upload.js'))
        .expect(400, "A title for the post must be provided");
    });

    test('POST /api/v1/upload with authentication, submitting a non-image file', async () => {

        let user = await User.findOne({
            email: "mail@example.com"
        }).exec();
        let payload = {
            email: user.email,
            id: user._id,
            username: user.username	
        }
        let options = {
            expiresIn: 86400
        }
        let token = jwt.sign(payload, process.env.SUPER_SECRET, options);

        return request(app).post('/api/v1/upload')
        .set('x-access-token', token)
        .field("title", "sample title")
        .attach("myFile", path.resolve(__dirname, './upload.js'))
        .expect(415, "Invalid file type provided");
    });

    let postId;

    test('POST /api/v1/upload with authentication, submitting an image file', async () => {

        let user = await User.findOne({
            email: "mail@example.com"
        }).exec();
        let payload = {
            email: user.email,
            id: user._id,
            username: user.username	
        }
        let options = {
            expiresIn: 86400
        }
        let token = jwt.sign(payload, process.env.SUPER_SECRET, options);

        const buffer = Buffer.from(path.resolve(__dirname, "./files/628b7f93785eab9840743db7.png"));

        const response = await request(app).post('/api/v1/upload')
        .set('x-access-token', token)
        .field("title", "sample title")
        .attach("myFile", buffer, "image.png");

        expect(response.statusCode).toBe(302);
        expect(response.header.location).toMatch(/^\/post\/[0-9a-fA-F]{24}$/);

        postId = response.header.location.split("/").pop();
    });

    test('POST /api/v1/upload/:postID with authentication, invalid postID', async () => {

        let user = await User.findOne({
            email: "mail@example.com"
        }).exec();
        let payload = {
            email: user.email,
            id: user._id,
            username: user.username	
        }
        let options = {
            expiresIn: 86400
        }
        let token = jwt.sign(payload, process.env.SUPER_SECRET, options);

        const response = await request(app).get('/api/v1/upload/000000000000000000000000')
        .set('x-access-token', token);

        expect(response.statusCode).toBe(400);
    });

    test('POST /api/v1/upload/:postID with authentication, valid postID', async () => {

        let user = await User.findOne({
            email: "mail@example.com"
        }).exec();
        let payload = {
            email: user.email,
            id: user._id,
            username: user.username	
        }
        let options = {
            expiresIn: 86400
        }
        let token = jwt.sign(payload, process.env.SUPER_SECRET, options);

        const response = await request(app).get('/api/v1/upload/' + postId)
        .set('x-access-token', token);
        console.log(response.body)
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('title', expect.any(String));
        expect(response.body).toHaveProperty('votes', expect.any(Object));
        expect(response.body).toHaveProperty('user', expect.any(Object));
        expect(response.body.user).toHaveProperty('username', expect.any(String));
        expect(response.body).toHaveProperty('comments', expect.any(Array));
        expect(response.body).toHaveProperty('picture_name', expect.any(String));
        expect(response.body).toHaveProperty('picture_path', expect.any(String));
        expect(response.body).toHaveProperty('time', expect.any(Number));
    });
});
