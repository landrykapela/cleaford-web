const storage = window.localStorage;
var currentUser = (storage.getItem("currentUser")) ? JSON.parse(storage.getItem("currentUser")):null;

const signupForm = document.querySelector("#signup_form");
if(signupForm){
    const fieldError = document.getElementById("field-error");
    signupForm.cpassword.addEventListener('input',(e)=>{
        var password = signupForm.password.value;
        if(e.target.value === password) {
            signupForm.cpassword.classList.remove("fail-text");
            signupForm.cpassword.classList.add("primary-dark-text");
            fieldError.classList.add("hidden");
        }
        else {
            signupForm.cpassword.classList.remove("primary-dark-text");
            signupForm.cpassword.classList.add("fail-text");
            fieldError.textContent = "Passwords do not match";
            fieldError.classList.remove("hidden");
        }
    });

    signupForm.password.addEventListener('input',(e)=>{
       
        if(e.target.value.length >=8) {
            signupForm.password.classList.remove("fail-text");
            signupForm.password.classList.add("primary-dark-text");
            fieldError.classList.add("hidden");
        }
        else {
            signupForm.password.classList.remove("primary-dark-text");
            signupForm.password.classList.add("fail-text");
            fieldError.textContent = "Password is too short";
            fieldError.classList.remove("hidden");
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
            console.log("signup ", result);
            delete result.password;
            currentUser = result;
            storage.setItem("currentUser",JSON.stringify(currentUser));
            showDashboard();
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
        fetch(signin_url,{method:"POST",body:JSON.stringify(user),headers:{'Content-type':'application/json'}})
        .then(res=>res.json()).then(response=>{
            if(response.error){
                showErrorFeedback(response.error);
            }
            else{
                delete response.password;
                currentUser = response;
                storage.setItem("currentUser",JSON.stringify(currentUser));
                showDashboard();
            }
        })
        .catch(err=>{
            let error = (err.error) ? err.error : "Connection Problems. Please try again later";
            showErrorFeedback(error);
        });
    });
}
//show error login
const showErrorFeedback =(msg)=>{
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

//show dashboard
const showDashboard = ()=>{
    window.location.pathname = "/dashboard/";
}
//cpature client details
const showClientDetailForm = ()=>{
    window.location.pathname = "/profile/";
}
const viewClientProfile = (user)=>{
    const placeholder = document.querySelector("#placeholder");
    while(placeholder.hasChildNodes()) placeholder.removeChild(placeholder.childNodes[0]);
    const name = document.createElement("p");
    name.textContent ="Company Name: "+ user.detail.company_name;
    const email = document.createElement("p");
    email.textContent = "Company Email: "+user.detail.email;
    const address = document.createElement("p");
    address.textContent ="Company Address: "+ user.detail.address;
    const phone = document.createElement("p");
    phone.textContent = "Company phone: "+user.detail.phone;
    const contact_name = document.createElement("p");
    contact_name.textContent ="Contact Person: "+ user.detail.contact_person;
    const contact_email = document.createElement("p");
    contact_email.textContent = "Contact Email: "+user.detail.contact_email;

    placeholder.appendChild(name);
    placeholder.appendChild(email);
    placeholder.appendChild(address);
    placeholder.appendChild(phone);
    placeholder.appendChild(contact_name);
    placeholder.appendChild(contact_email);
}
//activate user
const activateAccount = (user)=>{
    var headers = {'Content-type':'application/json','Authorization':'Bearer '+user.accessToken};
    var body = JSON.stringify({email:user.email});
    fetch(initialize_url,{method:"POST",body:body,headers:headers})
    .then(res=>{
        console.log(res);
        if(res.status === 403){
            alert("Your session has expired. Please sign in again");
            signoutUser();
        }
        return res.json()})
    .then(result=>{
        showClientDetailForm();
    })
    .catch(er=>{
        console.log("errr: ",er);
        showErrorFeedback(err.msg);
    })
}

//check if current page is dashboard
if(window.location.pathname == "/dashboard/"){
    if(currentUser == null) window.location.pathname = "/signin.html";
    else{
         document.querySelector("#greetings").textContent = "Hello, "+currentUser.email;
    const activateButton = document.querySelector("#activate");
    const profileButton = document.querySelector("#profile");
    if(currentUser.db ==null){
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
                showClientDetailForm();
            })
        }
    }
    }
   
}

//client profile
if(window.location.pathname == "/profile/"){
    const detailForm = document.querySelector("#client_profile_form");
    detailForm.email.value = currentUser.email;
    if(detailForm){
        detailForm.addEventListener('submit',(e)=>{
            e.preventDefault();

            let name   = detailForm.company_name.value;
            let email  = detailForm.email.value;
            let phone  = detailForm.phone.value;
            let person = detailForm.contact_person.value;
            let cemail = detailForm.contact_email.value;
            let address= detailForm.address.value;

            let data = JSON.stringify({
                company_name:name,
                email:email,
                phone:phone,
                contact_person:person,
                contact_email:cemail,
                address:address
            });

            const headers = {
                'Content-type':'application/json',
                'Authorization':'Bearer '+currentUser.accessToken
            }
            const options = {
                method:"POST",body:data,headers:headers
            }
            fetch(create_client_url,options)
            .then(res=>res.json()).then(result=>{
                showDashboard();
            })
            .catch(err=>{
                console.log("err: ",err);
            })

        });
    }
}