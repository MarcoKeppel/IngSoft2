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


describe('POST /api/v1/upload without authentication', () => {

    test('POST /api/v1/upload without authentication', () => {
        return request(app).post('/api/v1/upload')
        //.set('Accept', 'application/json')
        .field("title", "sample title")
        .expect(401, { success: false, message: "No token provided." });
    });
});


describe('POST /api/v1/upload with authentication', () => {

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
    });

    test('POST /api/v1/upload with authentication, without submitting a file', async () => {

        return request(app).post('/api/v1/upload')
        .set('x-access-token', token)
        .field("title", "sample title")
        .expect(400, { success: false, error: "No files were uploaded." });
    });

    test('POST /api/v1/upload with authentication, without providing a title', async () => {

        return request(app).post('/api/v1/upload')
        .set('x-access-token', token)
        .attach("myFile", path.resolve(__dirname, './upload.js'))
        .expect(400, { success: false, error: "A title for the post must be provided" });
    });

    test('POST /api/v1/upload with authentication, submitting a non-image file', async () => {

        return request(app).post('/api/v1/upload')
        .set('x-access-token', token)
        .field("title", "sample title")
        .attach("myFile", path.resolve(__dirname, './upload.js'))
        .expect(415, { success: false, error: "Invalid file type provided" });
    });

    let postId;

    test('POST /api/v1/upload with authentication, submitting an image file', async () => {

        const buffer = Buffer.from(path.resolve(__dirname, "./files/628b7f93785eab9840743db7.png"));

        const response = await request(app).post('/api/v1/upload')
        .set('x-access-token', token)
        .field("title", "sample title")
        .attach("myFile", buffer, "image.png");

        expect(response.statusCode).toBe(200);
        expect(response.body.location).toMatch(/^\/post\/[0-9a-fA-F]{24}$/);

        postId = response.body.location.split("/").pop();
    });

    test('POST /api/v1/upload/:postID with authentication, invalid postID', async () => {

        const response = await request(app).get('/api/v1/upload/000000000000000000000000')
        .set('x-access-token', token);

        expect(response.statusCode).toBe(400);
    });

    test('POST /api/v1/upload/:postID with authentication, valid postID', async () => {

        const response = await request(app).get('/api/v1/upload/' + postId)
        .set('x-access-token', token);
        // console.log(response.body)
        expect(response.statusCode).toBe(200);
        expect(response.body.post).toHaveProperty('title', expect.any(String));
        expect(response.body.post).toHaveProperty('votes', expect.any(Object));
        expect(response.body.post).toHaveProperty('user', expect.any(Object));
        expect(response.body.post.user).toHaveProperty('username', expect.any(String));
        expect(response.body.post).toHaveProperty('comments', expect.any(Array));
        expect(response.body.post).toHaveProperty('picture_name', expect.any(String));
        expect(response.body.post).toHaveProperty('picture_path', expect.any(String));
        expect(response.body.post).toHaveProperty('time', expect.any(Number));
    });
});
