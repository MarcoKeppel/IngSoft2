const app = require('./app');
const mongoose = require('mongoose');
const User = require('./models/user.js');
const request = require('supertest');
const jwt = require('jsonwebtoken');


beforeAll( async () => {
    jest.setTimeout(8000);
    app.locals.db = await mongoose.connect(process.env.DB_URL);
});
afterAll( () => {
    mongoose.connection.close(true);
});


describe('GET /api/v1/follow without authentication', () => {

    test('GET /api/v1/follow without authentication', () => {
        return request(app).get('/api/v1/follow')
        .expect(401, { success: false, message: "No token provided." });
    });
});


describe('GET /api/v1/follow with authentication', () => {

    let token;

    beforeAll( async () => {

        let user = await User.findOne({
            email: "mail@example.com"
        }).exec();

        // If example user does not exist, create it
        if (!user) {
            user = new User({
                email: "mail@example.com",
                password: "example",
                username: "example",
                pictures: [],
                followers: [],
                follows: []
            });
            user = await user.save();
        }

        let payload = {
            email: user.email,
            id: user._id,
            username: user.username	
        }
        let options = {
            expiresIn: 86400
        }
        token = jwt.sign(payload, process.env.SUPER_SECRET, options);

        let user2 = await User.findOne({
            email: "mail2@example.com"
        }).exec();

        // If example2 user does not exist, create it
        if (!user2) {
            user2 = new User({
                email: "mail2@example.com",
                password: "example",
                username: "example2",
                pictures: [],
                followers: [],
                follows: []
            });
            user2 = await user2.save();
        }
    });

    test('GET /api/v1/follow/:username with authentication, without putting a username', async () => {

        const response = await request(app).get('/api/v1/follow/')
        .set('x-access-token', token);
        console.log(response.body)
        expect(response.statusCode).toBe(400);
        expect({ success: false, message: 'You have to specify a username!' });
    });

    test('GET /api/v1/follow/:username with authentication trying to follow themselves using the username', async () => {

        const response = await request(app).get('/api/v1/follow/example')
        .set('x-access-token', token);
        console.log(response.body)
        expect(response.statusCode).toBe(400);
        expect({ success: false, message: 'You cannot follow yourself!' });
    });

    test('GET /api/v1/follow/:username with authentication trying to follow themselves using me', async () => {

        const response = await request(app).get('/api/v1/follow/me')
        .set('x-access-token', token);
        console.log(response.body)
        expect(response.statusCode).toBe(400);
        expect({ success: false, message: 'You cannot follow yourself!' });
    });

    test('GET /api/v1/follow/:username with authentication but there is no user to follow with that username', async () => {
        // TODO: Non so bene come fare il test assicurandomi che l'username scritto qui non sia presente nel DB
        const response = await request(app).get('/api/v1/follow/000000000000000')
        .set('x-access-token', token);
        console.log(response.body)
        expect(response.statusCode).toBe(400);
        expect({ success: false, message: 'User to follow not found!' });
    });

    test('GET /api/v1/follow/:username with authentication, valid username not already following', async () => {

        const response = await request(app).get('/api/v1/follow/example2')
        .set('x-access-token', token);
        console.log(response.body)
        expect(response.statusCode).toBe(200);
        expect({ success: true, message: 'Follow' });
    });

    test('GET /api/v1/follow/:username with authentication, valid username and already following', async () => {

        const response = await request(app).get('/api/v1/follow/example2')
        .set('x-access-token', token);
        console.log(response.body)
        expect(response.statusCode).toBe(200);
        expect({ success: true, message: 'Unfollow' });
    });
});
