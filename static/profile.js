var parts = "";
var lastSegment = "";
function follow(){
    fetch('/api/v1/follow/'+lastSegment)
        .then(response => response.json())
        .then(result => {
            if(result.success){
                updateInfo();
            }else{
                document.getElementById('errorFollow').innerText = result.message;
            }
        
    });
}

function updateInfo(){
    fetch('/api/v1/users/'+lastSegment)
        .then(response => response.json())
        .then(data => {
            console.log(lastSegment);
            console.log(data);
            document.getElementById("username").innerText = "Profile of: " + data.username;
            if(data.username == data.self){
                document.getElementById("username").innerText += " (YOU)";
            }
            if (data.followers.includes(data.self)){
                document.getElementById('follow').value = "Unfollow";
            }else{
                document.getElementById('follow').value = "Follow";
            }
            let follows = document.getElementById("follows");                        
            document.getElementById("followsCount").innerText = "Following (" + data.follows.length + "):" ;
            follows.innerHTML = "";
            for(let i = 0; i < data.follows.length; i++){
                let li = document.createElement("li");
                let a = document.createElement("a");
                a.href = "/profile/" + data.follows[i];
                a.innerText = data.follows[i];
                li.appendChild(a);
                follows.appendChild(li);
            }

            let followers = document.getElementById("followers");
            document.getElementById("followersCount").innerText = "Followers (" + data.followers.length + "):" ;
            followers.innerHTML = "";
            for(let i = 0; i < data.followers.length; i++){
                let li = document.createElement("li");
                let a = document.createElement("a");
                a.href = "/profile/" + data.followers[i];
                a.innerText = data.followers[i];
                li.appendChild(a);
                followers.appendChild(li);
            }

    });
}

function finishedLoading(){
    parts = window.location.href.split('/');
    lastSegment = parts.pop() || parts.pop();  // handle potential trailing slash
    const container = document.getElementById("container");
    fetch('/api/v1/gallery/'+lastSegment)
        .then(response => response.json())
        .then(data => {
            let posts = document.getElementById("posts");
            document.getElementById("postCount").innerText = "Posts (" + data.length + "):" ;
            for(let i = 0; i < data.length; i++){
                let li = document.createElement("li");
                let a = document.createElement("a");
                a.href = "/post/" + data[i]._id;
                a.innerText = data[i].title;
                li.appendChild(a);
                posts.appendChild(li);
            }
    });
    updateInfo();
    

}
