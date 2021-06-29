const storage = window.localStorage;
var currentUser = (storage.getItem("currentUser")) ? JSON.parse(storage.getItem("currentUser")):null;
var data = (storage.getItem("data")) ? JSON.parse(storage.getItem("data")):[];

//arrow drop

let arrowDropCount = document.getElementsByClassName("arrow").length;
console.log('count: ',arrowDropCount);
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
                currentUser = response;
                storage.setItem("currentUser",JSON.stringify(currentUser));
                if(currentUser.id == 0) showAdmin();
                else showDashboard();
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

//show admin dashboard
const showAdmin = ()=>{
    window.location.pathname = "/admin/";
    // window.location.hash = "#"+target;
}
//show dashboard
const showDashboard = ()=>{
    window.location.pathname = "/dashboard/";
}
//cpature client details
const showClientDetailForm = ()=>{
    const clientList = document.querySelector("#clients_content");
    const clientForm = document.querySelector("#add_client_content");
    clientList.classList.add("hidden");
    clientForm.classList.remove("hidden");
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

//check if admin is loggedin
if(window.location.pathname ==="/admin/"){
    if(currentUser == null || currentUser.id !== ADMIN){
        window.location.pathname = "/signin.html";
    }
    else{
        document.querySelector("#greetings").textContent = "Hello, Admin";
    }
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
        if(activateButton){
            activateButton.classList.add("hidden");
        }
        
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
//client profile
if(window.location.pathname == "/admin/"){
    const detailForm = document.querySelector("#client_profile_form");
    // detailForm.email.value = currentUser.email;
    if(detailForm){
        detailForm.addEventListener('submit',(e)=>{
            e.preventDefault();

            let name   = detailForm.company_name.value;
            let email  = detailForm.email.value;
            let phone  = detailForm.phone.value;
            let person = detailForm.contact_person.value;
            let cemail = detailForm.contact_email.value;
            let address= detailForm.address.value;
            let file = detailForm.company_logo.files[0];
            let logoFile = null;
            let data = {
                company_name:name,
                email:email,
                phone:phone,
                contact_person:person,
                contact_email:cemail,
                address:address,
                logo:logoFile,
                user:currentUser.id
            };

            if(file){
                var reader = new FileReader();
                reader.addEventListener('load',()=>{
                    data.logo = reader.result;
                },false);

                reader.readAsDataURL(file);
            }

            const headers = {
                'Content-type':'application/json',
                'Authorization':'Bearer '+currentUser.accessToken
            }
            const options = {
                method:"POST",body:JSON.stringify(data),headers:headers
            }
            fetch(create_client_url,options)
            .then(res=>res.json()).then(result=>{
                closeClientForm();
                updateClients();
            })
            .catch(err=>{
                console.log("err: ",err);
            })

        });
    }
}


//handle sidebar nav
const sideBar = document.querySelector("#side-bar");
if(sideBar){
    const items = Array.from(sideBar.children);
    items.forEach(item=>{
        if(item){
            item.addEventListener('click',(e)=>{
                let target = e.target.id;
                console.log(target);
                items.forEach(i=>{
                    if(i.classList.contains("active")){
                        i.classList.remove("active");
                        document.getElementById(i.id+"_content").classList.add("hidden");
                       
                    } 
                });
                item.classList.add("active");
                if(item.id =="clients") getClients();
                else{
                    document.getElementById("add_client_content").classList.add("hidden");
                }
                document.getElementById(target+"_content").classList.remove("hidden");
            })
        }
    })
    
}

//show spinner
const showSpinner=()=>{
    const spinner = document.querySelector("#spinner");
    if(spinner) spinner.classList.remove("hidden");
}


//hide spinner
const hideSpinner=()=>{
    const spinner = document.querySelector("#spinner");
    if(spinner) spinner.classList.add("hidden");
}
//create row
const createClientRow = (row)=>{
    const holder = document.querySelector("#clients_content");
    const rowHolder = document.createElement("div");
    rowHolder.classList.add("body-row");
    if(row == null){
        const data = document.createTextNode("No clients");
        rowHolder.appendChild(data);
    }
    else{
        const companyName = document.createElement("span");
        const companyAddress = document.createElement("span");
        const contactName = document.createElement("span");
        const contactEmail = document.createElement("span");
        const companyPhone = document.createElement("span");

        companyName.textContent = row.name;
        companyAddress.textContent = row.address;
        companyPhone.textContent = row.phone;
        contactName.textContent = row.contact_person;
        contactEmail.textContent = row.contact_email;

        rowHolder.appendChild(companyName);
        rowHolder.appendChild(companyAddress);
        rowHolder.appendChild(companyPhone);
        rowHolder.appendChild(contactName);
        rowHolder.appendChild(contactEmail);
    }

    holder.appendChild(rowHolder);
}
//showClients
const showClients = (data)=>{
    if(data.length == 0){
        createClientRow(null);
    }
    else{
        const holder = document.querySelector("#clients_content");
        Array.from(holder.children).forEach(child=>{
            if(child.classList.contains("body-row")) holder.removeChild(child);
        })
        data.forEach(row=>{
            createClientRow(row);
        });
    }
}
//show clientForm
const closeClientForm=()=>{
    document.querySelector("#add_client_content").classList.add("hidden");
    document.querySelector("#clients_content").classList.remove("hidden");
}
//fetch clients
const getClients = ()=>{
    showSpinner();
    const headers = {'Content-type':'application/json','Authorization':'Bearer '+currentUser.accessToken};
    fetch(clients_url,{method:"GET",headers:headers})
    .then(response=>{
        if(response.status == 403){
            showErrorFeedback("Your session has expired. Please login again");
            setTimeout(()=>{
                window.location.pathname = "/signin.html";
            },3000);
        }
        else{
        return response.json();
        }
        }).then(result=>{
        hideSpinner();
        data.clients = result.data;
        storage.setItem("data",JSON.stringify(data));
        showClients(result.data);
    })
    .catch(e=>{
        hideSpinner();
        showErrorFeedback("Your session has expired. Please login again");
            
    })
}

//update clients
const updateClients = (clients)=>{
    if(clients && clients.length > 0){
        data.clients = clients;
        storage.setItem("data",JSON.stringify(clients));
        showClients();
    }
}
//handle arrow drop down
for(let i=0;i<arrowDropCount;i++){
    let id = "arrow-drop"+i;
    const arrowDrop = document.getElementById(id);
    console.log("test: ",arrowDrop.textContent);
    if(arrowDrop){
        arrowDrop.addEventListener('click',(e)=>{
            const dropDown = document.querySelector("#drop-down"+i);
            showHideDropDown(dropDown,arrowDrop);
        })
    }
    
}

const showHideDropDown = (dropDown,arrowDrop)=>{
    if(dropDown.classList.contains("hidden")) {
        dropDown.classList.remove("hidden");
        arrowDrop.innerHTML = "arrow_drop_up";
    }
    else {
        dropDown.classList.add("hidden");
        arrowDrop.innerHTML = "arrow_drop_down";
    }
}
const sortClients = (sortBy,source)=>{
    sortOrder = 0;
    if(source.innerHTML == "arrow_drop_down") {
        source.innerHTML = "arrow_drop_up";
        sortOrder = 0;
    }
    else if(source.innerHTML == "arrow_drop_up") {
        source.innerHTML = "arrow_drop_down";
        sortOrder = 1;
    }
    let clients = data.clients;
    if(clients.length > 0){
        clients = clients.sort((a,b)=>{
            let result = 0;
            switch(sortBy){
                case "sort_company":
                    if(sortOrder == 0){
                        result = (a.name < b.name) ? -1 : 1;
                    }
                    else result = (a.name < b.name) ? 1:-1;
                    break;
                case "sort_contact_name":
                    if(sortOrder == 0){
                        result = (a.contact_person < b.contact_person) ? -1 : 1;
                    }
                    else result = (a.contact_person < b.contact_person) ? 1:-1;
                    break;
                case "sort_contact_email":
                if(sortOrder == 0){
                    result = (a.contact_email < b.contact_email) ? -1 : 1;
                }
                else result = (a.contact_email < b.contact_email) ? 1:-1;
                break;
            }
            return result;
        })
    }
    
    showClients(clients);
}
//search client
const searchClients = (keyword)=>{
    keyword = keyword.toLowerCase();
    let clients = data.clients;
    if(clients.length > 0){
        clients = clients.filter(client=>{
            return client.name.toLowerCase().includes(keyword) || 
            client.contact_person.toLowerCase().includes(keyword) || 
            client.contact_email.toLowerCase().includes(keyword) ||
            client.region.toLowerCase().includes(keyword) ||
            client.address.toLowerCase().includes(keyword)
        })
    }
    return clients;
}
//search
const search = document.querySelector("#search_client");
if(search){
    search.addEventListener('input',(e)=>{
        showClients(searchClients(e.target.value));
    })
}


//show client 