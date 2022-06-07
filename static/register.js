
function sendData () {
    var form = document.forms.namedItem("formRegister");
    var data = new FormData(form);
   
    fetch("/api/v1/users", {
      method: "POST",
      body: data
    })
    .then((result) => result.json())
    .then((response) => {
        if(response.success){
            const d = new Date();
            d.setTime(d.getTime() + (24*60*60*1000));
            let expires = "expires="+ d.toUTCString();
            document.cookie = "token=" + response.token + ";" + expires + ";path=/;SameSite=Strict";
            window.location.href = "/";
            return true;
        }else{
            document.getElementById("error").innerText = response.error;
        }
    })
    .catch((error) => { console.log(error); });
    return false;
}

