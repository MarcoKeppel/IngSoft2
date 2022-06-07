const app = require('./app');
const mongoose = require('mongoose');
const User = require('./models/user.js');
const Post = require('./models/post.js');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { response } = require('./app');


beforeAll( async () => {
    jest.setTimeout(8000);
    app.locals.db = await mongoose.connect(process.env.DB_URL);
});
afterAll( () => {
    mongoose.connection.close(true);
});


describe('GET /post/new without authentication', () => {

    let postID;

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

        let post = new Post({
            title: 'Example',
            votes: {
            likes: [],
            dislikes: []
            },
            user: user._id,
            comments: [],
            picture_name: '',
            picture_path: '',
            time: Date.now()
        });
        post = await post.save();
        postID = post._id;
    });

    test('GET /post/new without authentication', () => {
        return request(app).get('/post/new')
        .expect(401, { success: false, message: "No token provided." });
    });

    test('GET /post/:postID without a valid postID', () => {
        return request(app).get('/post/0000000000000')
        .expect(400, { error: 'Not a valid id!' });
    });

    test('GET /post/:postID with a valid postID', () => {
        return request(app).get('/post/' + postID)
        .expect(200);
    });
});


describe('GET /post with authentication', () => {

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
    });

    test('GET /post/new with authentication', async () => {

        const response = await request(app).get('/post/new')
        .set('x-access-token', token);
        console.log(response.body)
        expect(response.statusCode).toBe(200);
    });
});
