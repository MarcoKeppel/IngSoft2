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
        let notification = {seen: false, obj: toNotify, class: "post"};
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
        let notification = {seen: false, obj: toNotify, class: "follow"};
        let user = await User.findById(userID);
        user.notifications.push(notification);
        user.save();
        return;
    }
    if(classification === "comment")
    {
        let comment = await Comment.findById(toNotify);
        if(comment.user.toString() === userID)
        {
            console.log("Cannot send notification for the users' own comments");
            return;
        }
        
        let user = await User.findById(userID);
        let notification = {seen: false, obj: toNotify, class: "comment"};
        user.notifications.push(notification);
        user.save();
        return;
    }

    console.log("Type of notification " + classification + " doesn't exist");
    return;
}

module.exports = notify;