const Post = require('./models/post.js');
const User = require('./models/user.js');

async function notify(toNotify)       // toNotify is the post that will be notified
{
    notification = {seen: false, post: toNotify};
    let post = await Post.findById(toNotify).populate('user', 'followers').exec();
    let followers = post.user.followers;
    for(const i of followers)
    {
        let follower = await User.findOne({username: i}).exec();
        follower.notifications.push(notification);
        follower.save();
    };
    return;
}

module.exports = notify;