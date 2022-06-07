fetch('/api/v1/users/me')
        .then(response => response.json())
        .then(result => {
            if(result.success){
                document.getElementById('welcome').innerHTML = 'Benvenuto <b>' + result.username + "</b>";
                let notifiche = document.getElementById("notifiche");
                document.getElementById("conteggioNotifiche").innerText = "Notifiche (" + result.followers.length + "):" ;
                notifiche.innerHTML = "";
                console.log(result);
                for(let i = 0; i < result.notifications.length; i++){
                    if(result.notifications[i].class === "follow"){
                        notifiche.innerHTML += "<li> <a href='/profile/" + result.notifications[i].info + "'>" + result.notifications[i].info + "</a> ti ha seguito</li>";
                    }
                    if(result.notifications[i].class === "post"){
                        fetch('/api/v1/upload/'+result.notifications[i].info)
                            .then(response => response.json())
                            .then(result2 => {
                                result2 = result2.post;
                                notifiche.innerHTML += "<li> <a href='/profile/" + result2.user.username + "'>" + result2.user.username + "</a> ha pubblicato: <a href='/post/" + result.notifications[i].info + "'>" + result2.title + "</a></li>";
                            });
                    }
                    if(result.notifications[i].class === "comment"){
                        fetch('/api/v1/comment/'+result.notifications[i].info)
                            .then(response => response.json())
                            .then(result2 => {
                                result2 = result2.comment;
                                fetch('/api/v1/upload/'+result2.post._id)
                                    .then(response => response.json())
                                    .then(result3 => {
                                        result3 = result3.post;
                                        notifiche.innerHTML += "<li> <a href='/profile/" + result2.user.username + "'>" + result2.user.username + "</a> ha commentato il tuo post con titolo: <a href='/post/" + result2.post._id + "'>" + result3.title + "</a></li>";
                                    });
                            });
                        
                    }
                }
            }
    });
fetch('/api/v1/gallery')
        .then(response => response.json())
        .then(data => {
            let posts = document.getElementById("posts");
            for(let i = 0; i < data.length; i++){
                let div = document.createElement("div");
                let hr = document.createElement("hr");                            
                let img = document.createElement("img");
                img.setAttribute("src", "api/v1/image/"+data[i].picture_path);
                img.style.maxWidth = "400px";
                img.style.maxHeight = "400px";
                let p = document.createElement("p");
                let a = document.createElement("a");
                a.href = "/post/" + data[i]._id;
                a.innerText = data[i].title;
                p.appendChild(a)
                div.appendChild(p);
                div.appendChild(img);
                div.appendChild(hr);
                posts.appendChild(div);
            }
    });