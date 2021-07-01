const storage = window.localStorage;
var currentUser = (storage.getItem("currentUser")) ? JSON.parse(storage.getItem("currentUser")):null;
var data = (storage.getItem("data")) ? JSON.parse(storage.getItem("data")):[];



if(window.location.pathname == "/signin.html"){
    storage.setItem("data",JSON.stringify({}));
   
}
//arrow drop

let arrowDropCount = document.getElementsByClassName("arrow").length;

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
            delete result.password;
            currentUser = result;
            storage.setItem("currentUser",JSON.stringify(currentUser));
            showProfile();
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
                showFeedback(response.error,1);
            }
            else{
                console.log("response: ",response);
                currentUser = response;
                storage.setItem("currentUser",JSON.stringify(currentUser));
                if(currentUser.id == 0) showAdmin();
                else{
                    if(currentUser.db == null) showProfile();
                    else showDashboard();
                }
            }
        })
        .catch(err=>{
            let error = (err.error) ? err.error : "Connection Problems. Please try again later";
            showFeedback(error,1);
        });
    });
}
//show error
const showFeedback =(msg,type)=>{
    const feedback = document.querySelector("#feedback");
    feedback.textContent = msg;
    feedback.classList.remove("hidden");
    if(type==0){
        feedback.classList.remove("fail");
        feedback.classList.add("success");
    }
    else{
        feedback.classList.remove("success");
        feedback.classList.add("fail");
    }
    setTimeout(()=>{
        feedback.classList.add("hidden");
    },5000);

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


//show admin dashboard
const showAdmin = ()=>{
    window.location.pathname = "/admin/";
    // window.location.hash = "#"+target;
}
//show profile
const showProfile = ()=>{
    window.location.pathname = "/profile/";
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
        showFeedback(err.msg,1);
    })
}

//check if admin is loggedin
if(window.location.pathname ==="/admin/"){
    if(currentUser == null || currentUser.id !== ADMIN){
        window.location.pathname = "/signin.html";
    }
    else{
        document.querySelector("#greetings").textContent = "Hello, Admin";
        const detailForm = document.querySelector("#client_profile_form");
        
        // detailForm.email.value = currentUser.email;
        if(detailForm){
            document.getElementById("btnCancelAdd").addEventListener('click',()=>{
                closeClientForm('add_client_content');
            });
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
                .then(res=>{
                    if(res.status == 403){
                        showFeedback("Session expired. Please signin",1);
                        signoutUser();
                        return;
                    }
                    return res.json()
                }).then(result=>{
                    closeClientForm('add_client_content');
                    updateClients(result.data);
                })
                .catch(err=>{
                    console.log("err: ",err);
                })
    
            });
        }

        //update client
        const updateForm = document.querySelector("#edit_client_form");
       
        if(updateForm){
            document.getElementById("btnCancelEdit").addEventListener('click',()=>{
            closeClientForm('edit_client_content');
            });
             
            let imagePreview = document.getElementById("client_image");
            let inputFile = document.getElementById("company_logo");
            inputFile.addEventListener('change',(e)=>{
                var file = inputFile.files[0];
                if(file){
                    var reader = new FileReader();
                    reader.addEventListener('load',()=>{
                        // data.logo = reader.result;
                        console.log(reader.result);
                        imagePreview.src = reader.result;
                    },false);

                    reader.readAsDataURL(file);
                }
            })
            updateForm.addEventListener('submit',(e)=>{
                e.preventDefault();
                let id = updateForm.client_id.value;
                let name   = updateForm.company_name.value;
                let email  = updateForm.email.value;
                let phone  = updateForm.phone.value;
                let person = updateForm.contact_person.value;
                let cemail = updateForm.contact_email.value;
                let address= updateForm.address.value;
                let file = updateForm.company_logo.files[0];
                let data = JSON.parse(storage.getItem("data"));

                let client = data.clients.filter(c=>c.id == id);
                if(client.logo && client.logo.length !=0) imagePreview.src = client.logo;
                let logoFile = client.logo;
                let newData = {
                    id:id,
                    company_name:(name && name.length !==0) ? name: client.name,
                    email:(email && email.length !==0) ? email: client.email,
                    phone:(phone && phone.length !==0) ? phone: client.phone,
                    contact_person:(person && person.length !==0) ? person: client.contact_person,
                    contact_email:(cemail && cemail.length !==0) ? cemail: client.contact_email,
                    address:(address && address.length !==0) ? address: client.address,
                    logo:logoFile,
                    user:currentUser.id
                };
    
                if(file){
                    var reader = new FileReader();
                    reader.addEventListener('load',()=>{
                        newData.logo = reader.result;
                        imagePreview.src = newData.logo;
                    },false);
    
                    reader.readAsDataURL(file);
                }
    
                const headers = {
                    'Content-type':'application/json',
                    'Authorization':'Bearer '+currentUser.accessToken
                }
                const options = {
                    method:"PUT",body:JSON.stringify(newData),headers:headers
                }
                console.log("test: ",newData);
                fetch(create_client_url,options)
                .then(res=>{
                    if(res.status == 403){
                        showFeedback("Session expired. Please signin",1);
                        signoutUser();
                        return;
                    }
                    return res.json()
                }).then(result=>{
                   showFeedback(result.msg,result.code);
                        closeClientForm('edit_client_content');
                        updateClients(result.data);
                   
                })
                .catch(err=>{
                    showFeedback(err,1);
                })
            });
        }
    }
}
//check if current page is dashboard
if(window.location.pathname == "/dashboard/"){
    if(currentUser == null) window.location.pathname = "/signin.html";
    else{
        var clientDetails = currentUser.detail;
         document.querySelector("#greetings").textContent = "Hello, "+clientDetails.name;
         document.querySelector("#account-name").textContent = clientDetails.name;
         if(clientDetails.logo) document.querySelector("#avatar").src =clientDetails.logo;
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
                .then(res=>{
                    if(res.status == 403){
                        showFeedback("Session expired. Please signin",1);
                        signoutUser();
                        return;
                    }
                    return res.json()
                }).then(result=>{
                    console.log("result: ",result);
                    showDashboard();
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
                items.forEach(i=>{
                    if(i.classList.contains("active")){
                        i.classList.remove("active");
                        document.getElementById(i.id+"_content").classList.add("hidden");
                    } 
                });
                Array.from(document.getElementsByTagName("MAIN")[0].children)
                .forEach(child=>{
                    if(child.id.includes("_content")) child.classList.add("hidden");
                })
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

const editClientDetail = (client)=>{
    const editForm = document.querySelector("#edit_client_form");
    editForm.client_id.value = client.id;
    editForm.company_name.value = client.name;
    editForm.address.value = client.address+", "+client.region;
    editForm.email.value = client.email;
    editForm.contact_person.value = client.contact_person;
    editForm.phone.value = client.phone;
    editForm.contact_email.value = client.contact_email;

    document.querySelector("#clients_content").classList.add("hidden");
    document.querySelector("#edit_client_content").classList.remove("hidden");
    document.getElementById("btnCancelEdit").addEventListener('click',()=>{
        closeClientForm('edit_client_content');
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
        companyName.id = row.id;
        companyAddress.textContent = row.address;
        companyPhone.textContent = row.phone;
        contactName.textContent = row.contact_person;
        contactEmail.textContent = row.contact_email;

        rowHolder.appendChild(companyName);
        rowHolder.appendChild(companyAddress);
        rowHolder.appendChild(companyPhone);
        rowHolder.appendChild(contactName);
        rowHolder.appendChild(contactEmail);

        //add click listener
        companyName.addEventListener('click',()=>{
            editClientDetail(row);
        })
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
const closeClientForm=(source)=>{
    document.getElementById(source).classList.add("hidden");
    document.getElementById("clients_content").classList.remove("hidden");
}
//fetch clients
const getClients = ()=>{
    showSpinner();
    const headers = {'Content-type':'application/json','Authorization':'Bearer '+currentUser.accessToken};
    fetch(clients_url,{method:"GET",headers:headers})
    .then(response=>{
        if(response.status == 403){
            console.log("response: ",response)
            showFeedback("Your session has expired. Please login again",1);
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
        showFeedback("Your session has expired. Please login again",1);
            
    })
}

//update clients
const updateClients = (clients)=>{
    if(clients && clients.length > 0){
        let data = JSON.parse(storage.getItem("db"));
        data.clients = clients;
        storage.setItem("data",JSON.stringify(data));
        showClients();
    }
}

//handle arrow drop down and menus
for(let i=0;i<arrowDropCount;i++){
    let id = "arrow-drop"+i;
    let signoutId = "#signout"+i;
    let settingsId = "#settings"+i;
    const settings = document.querySelector(settingsId);
    const signout = document.querySelector(signoutId);
    const arrowDrop = document.getElementById(id);
    if(arrowDrop){
        const dropDown = document.querySelector("#drop-down"+i);
        arrowDrop.addEventListener('click',(e)=>{
            showHideDropDown(dropDown,arrowDrop);
        });
        //listen to move movement
        // dropDown.addEventListener('mouseout',(e)=>{
        //     dropDown.classList.add("hidden");
        // })
    }
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
    if(settings){
        settings.addEventListener('click',(e)=>{
            showSettings();
        })
    }

}
document.addEventListener('mouseup',(e)=>{
    for(let i=0; i< arrowDropCount;i++){
        var dropDown = document.getElementById("drop-down"+i);
        var arrowDrop = document.getElementById("arrow-drop"+i);
        if(!dropDown.contains(e.target)) {
            dropDown.classList.add("hidden");
            arrowDrop.innerHTML = "arrow_drop_down";
        }
        // showHideDropDown(dropDown,arrowDrop);
    }
})

const showSettings=()=>{
    alert("Showing settings");
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