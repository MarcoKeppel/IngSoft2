const app = require('./app');
const mongoose = require('mongoose');
const User = require('./models/user.js');
const Post = require('./models/post.js');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const path = require('path');


let token;

beforeAll( async () => {

    jest.setTimeout(8000);
    app.locals.db = await mongoose.connect(process.env.DB_URL);

    let user = await User.findOne({
        email: "mail@example.com"
    });

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

    // Create test post
    const buffer = Buffer.from(path.resolve(__dirname, "./files/628b7f93785eab9840743db7.png"));

    const response = await request(app).post('/api/v1/upload')
    .set('x-access-token', token)
    .field("title", "sample title")
    .attach("myFile", buffer, "image.png");
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


describe('GET /api/v1/gallery without authentication', () => {

    test('GET /api/v1/gallery', async () => {

        const response = await request(app).get('/api/v1/gallery');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(expect.any(Array));
    });

    test('GET /api/v1/gallery/:username', async () => {

        const response = await request(app)
            .get('/api/v1/gallery/example');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(expect.any(Array));
        for (let post of response.body) {
            expect(post).toHaveProperty('_id', expect.any(String));
            expect(post).toHaveProperty('title', expect.any(String));
        }
    });
});


describe('GET /api/v1/gallery with authentication', () => {

    test('GET /api/v1/gallery/me', async () => {

        const response = await request(app)
            .get('/api/v1/gallery/me')
            .set('x-access-token', token);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(expect.any(Array));
        for (let post of response.body) {
            expect(post).toHaveProperty('_id', expect.any(String));
            expect(post).toHaveProperty('title', expect.any(String));
        }
    });
});
