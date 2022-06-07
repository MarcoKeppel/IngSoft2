function finishedLoading(){
    var parts = window.location.href.split('/');
    var lastSegment = parts.pop() || parts.pop();  // handle potential trailing slash

    // If we are creating a new post
    if(lastSegment == "new"){
        document.getElementById("formUpload").style.display = "block";
        document.getElementById("postDetails").style.display = "none";
    }else{
        document.getElementById("formUpload").style.display = "none";
        document.getElementById("postDetails").style.display = "block";
        document.getElementById("postId").value = lastSegment;
        // Get the info about the post
        fetch('/api/v1/upload/'+lastSegment)
            .then(response => response.json())
            .then(result => {
                if(result.success){
                    result = result.post;
                    let img = document.getElementById("postImage");
                    img.setAttribute('src','/api/v1/image/'+result.picture_path);            
                    img.setAttribute('alt','/api/v1/image/'+result.picture_name);
                    img.style.maxWidth = "400px";
                    img.style.maxHeight = "400px";
                    let date = document.getElementById("postDate");  
                    date.innerText = "Post created at: " + new Date(result.time).toLocaleString();

                    let title = document.getElementById("postTitle");  
                    title.innerText = result.title;

                    let votes = document.getElementById("postVotes");
                    votes.innerText = "Votes: " + result.votes.likes + " Likes, " + result.votes.dislikes + " Dislikes";

                    let author = document.getElementById("author");
                    author.innerText = "Author: " + result.user.username;
                    author.setAttribute("href", "/profile/"+result.user.username);

                    let comments = document.getElementById("comments");
                    comments.innerHTML = "";
                    console.log(result.comments);
                    for(let i = 0; i < result.comments.length; i++){
                        let li = document.createElement("li");
                        let p = document.createElement("p");
                        
                        let a = document.createElement("a");
                        a.innerText = result.comments[i].user.username;
                        a.setAttribute("href", "/profile/"+result.comments[i].user.username);
                        p.appendChild(a);

                        p.innerHTML += ": " + result.comments[i].text + " " + new Date(result.comments[i].time).toLocaleString() + " " + result.comments[i].votes.likes + " Likes, " +result.comments[i].votes.dislikes + " Dislikes";

                        li.appendChild(p);
                        comments.appendChild(li);
                    }
                }else{
                    document.getElementById("errorComment").innerText = result.error;
                }
        });
    }
}


function sendDataComment(){
    var form = document.forms.namedItem("formComment");
    var data = new FormData(form);
   
    fetch("/api/v1/comment", {
      method: "POST",
      body: data
    })
    .then((result) => result.json())
    .then((response) => {
        if(response.success){
            window.location.href = response.location;
            return true;
        }else{
            document.getElementById("errorComment").innerText = response.error;
        }
    })
    .catch((error) => { console.log(error); });
    return false;
}

function sendDataPost(){
    
    var form = document.forms.namedItem("formPost");
    var data = new FormData(form);
    fetch("/api/v1/upload", {
      method: "POST",
      body: data
    })
    .then((result) => result.json())
    .then((response) => {
        if(response.success){
            window.location.href = response.location;
            return true;
        }else{
            document.getElementById("errorPost").innerText = response.error;
        }
    })
    .catch((error) => { console.log(error); });
    return false;
}

