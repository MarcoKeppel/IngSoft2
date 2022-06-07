const Post = require('./models/post.js');
const User = require('./models/user.js');
const Comment = require('./models/comment.js');


// toNotify is the ID that will be notified to the user
// it is the ID of the post that will be sent to followers or
// the ID of the user that follower or the ID of a new comment on a post
async function notify(classification, toNotify, userID)
{
    console.log(userID);
    if(classification === "post")
    {
        let notification = {seen: false, info: toNotify, class: "post"};
        let post = await Post.findById(toNotify).populate('user', 'followers').exec();
        let followers = post.user.followers;
        for(const i of followers)
        {
            let follower = await User.findOne({username: i}).exec();
            follower.notifications.push(notification);
            follower.save();
        }
        return;
    }
    if(classification === "follow")
    {
        let other = await User.findById(toNotify);
        
        let notification = {seen: false, info: other.username, class: "follow"};
        console.log(notification);
        let user = await User.findById(userID);
        user.notifications.push(notification);
        user.save();
        console.log(user.notifications);
        return;
    }
    if(classification === "comment")
    {
        let comment = await Comment.findById(toNotify);
        let post = await Post.findById(comment.post);
        
        if(post.user.toString() === userID)
        {
            console.log("Don't notify post author about his own comment");
            return;
        }
        
        // Notify the author of the post about the comment
        let user = await User.findById(post.user._id);
        let notification = {seen: false, info: toNotify, class: "comment"};
        user.notifications.push(notification);
        user.save();
        return;
    }

    console.log("Type of notification " + classification + " doesn't exist");
    return;
}

module.exports = notify;