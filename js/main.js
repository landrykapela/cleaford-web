const storage = window.localStorage;
var currentUser = (storage.getItem("currentUser")) ? JSON.parse(storage.getItem("currentUser")):null;

// const signup_url = "http://localhost:5000/signup";

const signupForm = document.querySelector("#signup_form");
if(signupForm){
    signupForm.cpassword.addEventListener('change',(e)=>{
        var password = signupForm.password.value;
        if(e.target.value === password) {
            signupForm.cpassword.classList.remove("fail-text");
            signupForm.cpassword.classList.add("primary-dark-text");
        }
        else {
            signupForm.cpassword.classList.remove("primary-dark-text");
            signupForm.cpassword.classList.add("fail-text");
        }
    });
    signupForm.addEventListener('submit',(e)=>{
        e.preventDefault();
        let email = signupForm.email.value;
        let password = signupForm.password.value;
        let body = {email:email,password:password};
        let data = JSON.stringify(body);
    
        fetch(signup_url,{method:"POST",body:data,headers:{
            'Content-Type':'application/json'
        }})
        .then(res=>res.json())
        .then(result=>{
        window.location.pathname="/dashboard.html"
        console.log("error: ",err);
        const toast = document.createElement("div");
        toast.classList.add("toast");
        toast.textContent = err;
        document.body.appendChild(toast);
        });
    });
   
}

//signin
const loginForm = document.querySelector("#signin_form");
if(loginForm){
    loginForm.addEventListener('submit',(e)=>{
        e.preventDefault();
        let email = loginForm.email.value;
        let password = loginForm.password.value;
        let user = {email:email,password:password};
        console.log("data: ",user);
        // const signin_url = "http://localhost:5000/signin";
        fetch(signin_url,{method:"POST",body:JSON.stringify(user),headers:{'Content-type':'application/json'}})
        .then(res=>res.json()).then(response=>{
            if(response.error){
                showErrorLogin(response.error);
            }
            else{
                delete response.password;
                currentUser = response;
                storage.setItem("currentUser",JSON.stringify(currentUser));
                window.location.pathname = "/dashboard.html";
            }
        })
        .catch(err=>{
            showErrorLogin(err.error);
        });
    });
}
//show error login
const showErrorLogin =(msg)=>{
    const feedback = document.querySelector("#feedback");
    feedback.textContent = msg;
    feedback.classList.remove("hidden");

};
//signout
const signoutUser = ()=>{
  
        // var signout_url = "http://localhost:5000/signout";
        // var urlObj = new URL(window.location.href);
        // let token = (currentUser) ? currentUser.token: null;
        fetch(signout_url,
            {method:"POST",body:JSON.stringify({email:currentUser.email}),headers:{'Content-type':'application/json'}})
        .then(res=>res.json())
            .then(result=>{
            // console.log("result: ",result);
            storage.setItem("currentUser",null);
            window.location.pathname = "/signin.html";
        })
        .catch(e=>{
            console.log(e);
        });
  
};


//handle signout link/button
const signout = document.querySelector("#signout");
if(signout){
    signout.addEventListener('click',(e)=>{
        e.preventDefault();
        if(confirm("Are you sure you want to sign out?")){
            signoutUser();
        }
        else{
            console.log("no singout");
        }
    });
}

//cpature client details
const showClientDetailForm = (user)=>{
    
}
//activate user
const activateAccount = (user)=>{
    var headers = {'Content-type':'application/json','Authorization':'Bearer '+user.accessToken};
    var body = JSON.stringify({email:user.email});
    fetch(initialize_url,{method:"POST",body:body,headers:headers})
    .then(res=>json())
    .then(result=>{
        console.log("result: ",result);
    })
    .catch(er=>{
        console.log("errr: ",err);
    })
}

//check if current page is dashboard
if(window.location.pathname == "/dashboard.html"){
    const activateButton = document.querySelector("#activate");
    const profileButton = document.querySelector("#profile");
    if(currentUser.db == ""){
        //handle activate button
        if(activateButton){
            activateButton.addEventListener('click',(e)=>{
                e.preventDefault();
                activateAccount(currentUser);
            })
        }
    }
    else{
        activateButton.classList.add("hidden");
        profileButton.classList.remove("hidden");
        if(profileButton){
            profileButton.addEventListener('click',(e)=>{
                e.preventDefault();
                showClientDetailForm(currentUser);
            })
        }
    }
}