const app = require('./app');
const mongoose = require('mongoose');
const User = require('./models/user.js');
const Post = require('./models/post.js');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const path = require('path');


beforeAll( async () => {
    jest.setTimeout(8000);
    app.locals.db = await mongoose.connect(process.env.DB_URL);
});
afterAll( async () => {

    // Delete posts and images posted by user "example"

    let userId = await User.findOne({ email: "mail@example.com" }).lean();

    let posts = await Post.find({ user: userId }).lean();
    // console.log("Posts to be deleted:");
    // console.log(posts);

    // console.log("Deleting...");
    for (let post of posts) {

        await Post.deleteOne({ _id: post._id });
    }

    mongoose.connection.close(true);
});


describe('GET /api/v1/users/:username without authentication', () => {
    let token;
    let username;
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
                follows: [],
                notifications: []
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
        username = user.username;
    });

    test('GET /api/v1/users/me without authentication', () => {
        return request(app).get('/api/v1/users/me')
        .expect(401, { success: false, message: "No token provided." });
    });
});


describe('GET /api/v1/users/:username with authentication', () => {
    let token;
    let username;

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
                follows: [],
                notifications: []
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
        username = user.username;
    });
    
    test('GET /api/v1/users/me with authentication', async () => {

        const response = await request(app).get('/api/v1/users/me')
        .set('x-access-token', token);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body).toHaveProperty('success', expect.any(Boolean));
        expect(response.body).toHaveProperty('email', expect.any(String));
        expect(response.body).toHaveProperty('username', expect.any(String));
        expect(response.body).toHaveProperty('self', expect.any(String));
        expect(response.body).toHaveProperty('followers', expect.any(Array));
        expect(response.body).toHaveProperty('follows', expect.any(Array));
        expect(response.body).toHaveProperty('notifications', expect.any(Array));
    });

    test('GET /api/v1/users/ThisUserDoesNotExists with authentication', async () => {

        const response = await request(app).get('/api/v1/users/'+ "ThisUserDoesNotExists")
        .set('x-access-token', token);
        console.log(response.body);
        expect(response.statusCode).toBe(400);
        expect(response.body).toStrictEqual({ error: 'User not found!' });
    });
});
