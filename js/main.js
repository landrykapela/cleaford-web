const storage = window.localStorage;
const clientSummaryCount = 5;
var currentUser = (storage.getItem("currentUser")) ? JSON.parse(storage.getItem("currentUser")):null;
var storedData = (storage.getItem("data")) ? JSON.parse(storage.getItem("data")):{client_roles:[],clients:[],roles:[]};

const DATA_COUNT = 12;
const NUMBER_CFG = {count: DATA_COUNT, min: 0, max: 100};
const originalSetItem = localStorage.setItem;

localStorage.setItem = function(key, value) {
  const event = new Event('updateData');

  event.value = value; // Optional..
  event.key = key; // Optional..

  document.dispatchEvent(event);

  originalSetItem.apply(this, arguments);
};

//validate email address
const isValidEmail = (email)=>{
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
if(window.location.pathname == "/signin.html"){
    storage.setItem("currentUser",JSON.stringify({}));
    storage.setItem("data",JSON.stringify({}));
}
//arrow drop

let arrowDropCount = document.getElementsByClassName("arrow").length;

//handle sidebar nav
const sideBar = document.querySelector("#side-bar");
if(sideBar){
    const items = Array.from(sideBar.children);
    items.forEach(item=>{
        if(item){
            item.addEventListener('click',(e)=>{
                activateMenu(e.target.id);
            })
        }
    })
    
}
const activateMenu =(target)=>{
    // alert(target);
    const items = Array.from(sideBar.children);
    items.forEach(i=>{

    //unselect all sidebar menu items
        if(i.classList.contains("active")){
            i.classList.remove("active");
        } 
        //remove previously selected content
        Array.from(document.getElementsByTagName("MAIN")[0].children)
        .forEach(child=>{
            if(child.id.includes("_content")) child.classList.add("hidden");
        })
    });

    //activate currently selected item and show it's content
    items.forEach(item=>{  
        if(item.id == target) {
            item.classList.add("active");
            var cont = document.getElementById(target+"_content");
            if(cont) cont.classList.remove("hidden");
        }      
        // document.getElementById(target+"_content").classList.remove("hidden");
    });
    const menu = document.getElementById(target);
    //get and display data as per selected menu item
    if(menu){
        switch(menu.id){
            case 'clients':
                getClients().then(clients=>{
                    showClients(clients)
                }).catch(er=>{
                    console.log("er:",er);
                    showFeedback(er,1);
                });
                break;
            case 'roles':
                if(!storedData.roles || storedData.roles.length == 0){
                    fetchRoles().then(roles=>{
                        updateRoles(roles);
                    }).catch(e=>{
                        showFeedback(e,1);
                    });
                }
                else showRoles();
                break;
            case 'dashboard':
                if(window.location.pathname=="/admin/") showAdminStats();
                else showDashboard();
            break;
        }
    }
    else{//menu menu item does not exist in the side bar (call may have come from button click)
        
        const content = document.getElementById(target+"_content");
        switch(target){
            case 'add_role':
                document.querySelector("#roles").classList.add("active");
                if(content) content.classList.remove("hidden");
                break;
            case 'edit_role':
                document.querySelector("#roles").classList.add("active");
                if(content) content.classList.remove("hidden");
                break;
            case 'add_client':
                document.querySelector("#clients").classList.add("active");
                if(content) content.classList.remove("hidden");
                break;
            case 'edit_client':
                document.querySelector("#clients").classList.add("active");
                if(content) content.classList.remove("hidden");
                break;
        }
    }
  
}
const getActiveMenu =()=>{
    if(sideBar){
        const items = Array.from(sideBar.children);
        items.forEach(item=>{
            if(item.classList.contains("active")){
                return item.id;
            } 
                
        });
        return 'dashboard';
    }
}

const signupForm = document.querySelector("#signup_form");
if(signupForm){
    let pwdOk = false;
    let pwdMatch = false;
    let emailOk = false;
    const fieldError = document.getElementById("field-error");
    var emailField = signupForm.email;
    emailField.addEventListener('input',(e)=>{
        if(!isValidEmail(e.target.value)){
            fieldError.classList.remove("hidden");
            emailField.classList.add("fail-text");
            signupForm.btnSubmit.disabled = true;
            fieldError.textContent = "Invalid email address";
        }
        else{
            emailOk = true;
            emailField.classList.remove("fail-text");
            fieldError.classList.add("hidden");
            if(pwdOk && pwdMatch){
                signupForm.btnSubmit.disabled = false;
                fieldError.classList.add("hidden");
            }
            
        }
    })
    signupForm.cpassword.addEventListener('input',(e)=>{
        var password = signupForm.password.value;
        if(e.target.value === password) {
            signupForm.cpassword.classList.add("primary-dark-text");
            fieldError.classList.add("hidden");
            pwdMatch = true;
            if(pwdOk && emailOk){
                fieldError.classList.add("hidden");
                signupForm.btnSubmit.disabled = false;
            }
        }
        else {
            signupForm.cpassword.classList.remove("primary-dark-text");
            fieldError.textContent = "Passwords do not match";
            fieldError.classList.remove("hidden");
            signupForm.btnSubmit.disabled = true;
            pwdMatch = false;
            // signupForm.btnSubmit.classList.add("hidden");
        }
    });
    
    signupForm.password.addEventListener('input',(e)=>{
       
        if(e.target.value.length >=8) {
            signupForm.password.classList.add("primary-dark-text");
            fieldError.classList.add("hidden");
            pwdOk = true;
            if(pwdMatch && emailOk){
                signupForm.btnSubmit.disabled = false;
            }
        }
        else {
            signupForm.password.classList.remove("primary-dark-text");
            fieldError.textContent = "Password is too short";
            fieldError.classList.remove("hidden");
            pwdOk = false;
            signupForm.btnSubmit.disabled = true;
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
            console.log("test: ",result);
            currentUser = result.data;
            currentUser.accessToken = result.accessToken;
            delete currentUser.password;
            storage.setItem("currentUser",JSON.stringify(currentUser));
            showProfile();
            showFeedback(result.msg,result.code);
        }).catch(e=>{
            console.log("signup: ",e);
            showFeedback("Something went wrong, please try again later",1);
        })
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
                currentUser = response.data;
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
                storage.setItem("currentUser",JSON.stringify({}));
                storage.setItem("data",JSON.stringify({}));
            window.location.pathname = "/signin.html";
        })
        .catch(e=>{
            console.log(e);
        });
  
};

const generateRandomData = ()=>{
    var result = [];
    for(let i=0; i<NUMBER_CFG.count;i++){
        let random = Math.floor(Math.random() * (NUMBER_CFG.max - NUMBER_CFG.min + 1)) + NUMBER_CFG.min;
        console.log("random: ",random);
        result.push(random);
    }
    console.log("rand: ",result);
    return result;
}

//show admin stats
const showAdminStats =()=>{
    document.querySelector("#greetings").textContent = "Hello, Admin";
    const numberOfClients = document.getElementById("no_of_clients");
     numberOfClients.textContent = storedData.clients.length;
    

    //show client summary
    showClientsSummary();
    // fetchRoles();
    let chartArea = document.getElementById("chart-area");
    while(chartArea.hasChildNodes()){
        chartArea.removeChild(chartArea.childNodes[0]);
    }
    const canvas = document.createElement("canvas");
    chartArea.appendChild(canvas);

    const labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    let data = {
        labels: labels,
        datasets: [
            {
            label: 'Sales',
            data: generateRandomData(),
            borderColor: "#cc9900",
            backgroundColor: "#ffcc00",
            },
            
        ]
    }
    let config = {
        type: 'line',   
        data: data,
        options: {
          responsive: true,
          plugins: {
        
            title: {
              display: true,
              text: 'Annual Sales'
            }
          }
        },
    }
    var myChart = drawChart(config,canvas);


}

//show admin dashboard
const showAdmin = ()=>{
    window.location.pathname = "/admin/";
}
//show profile
const showProfile = ()=>{
    window.location.pathname = "/account/";
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


const editClientDetail = (client,source)=>{
    const editForm = document.querySelector("#edit_client_form");
    editForm.client_id.value = client.id;
    editForm.company_name.value = client.name;
    editForm.address.value = client.address+", "+client.region;
    editForm.email.value = client.email;
    editForm.contact_person.value = client.contact_person;
    editForm.phone.value = client.phone;
    editForm.contact_email.value = client.contact_email;
    activateMenu('edit_client');
    document.getElementById(source).classList.add("hidden");
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
const createClientRow = (row,holder)=>{
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
            editClientDetail(row,'clients_content');
        })
    }

    holder.appendChild(rowHolder);
}
const createClientSummaryRow = (row)=>{
    const holder = document.querySelector("#client_table_summary");
    const rowHolder = document.createElement("div");
    rowHolder.classList.add("body-row");
    if(row == null){
        const data = document.createTextNode("No clients");
        rowHolder.appendChild(data);
    }
    else{
        const companyName = document.createElement("span");
        const companyAddress = document.createElement("span");
        // const contactName = document.createElement("span");
        const contactEmail = document.createElement("span");
        // const companyPhone = document.createElement("span");
        const companyStatus = document.createElement("span");

        companyName.textContent = row.name;
        companyName.id = row.id;
        companyAddress.textContent = row.address;
        // companyPhone.textContent = row.phone;
        // contactName.textContent = row.contact_person;
        contactEmail.textContent = row.contact_email;
        companyStatus.textContent = row.status == 0 ? 'Pending Activation' : "Activated";

        rowHolder.appendChild(companyName);
        rowHolder.appendChild(contactEmail);
        rowHolder.appendChild(companyAddress);
        rowHolder.appendChild(companyStatus);
        // rowHolder.appendChild(contactName);

        //add click listener
        companyName.addEventListener('click',()=>{
            editClientDetail(row,'dashboard_content');
        })
    }

    holder.appendChild(rowHolder);
}
//showClients
const showClients = (data)=>{
    const holder = document.querySelector("#clients_content");   
    Array.from(holder.children).forEach(child=>{
        if(child.classList.contains("body-row")) holder.removeChild(child);
    }) 
    if(!data || data.length == 0){
        createClientRow(null,holder);
    }
    else{
        
        data.forEach(row=>{
            createClientRow(row,holder);
        });
    }
}
//display system roles
const showRoles = ()=>{
    const holder = document.getElementById("roles_content");
    Array.from(holder.children).forEach(child=>{
        if(child.classList.contains('body-row')) holder.removeChild(child);
    })
    var roles = storedData.roles;
    if(roles && roles.length > 0){
        roles.forEach(role=>{
            const rowHolder = document.createElement("div");
            rowHolder.classList.add("body-row");
            const roleId = document.createElement("span");
            roleId.textContent = role.name;
            const roleName = document.createElement("span");
            roleName.textContent = role.description;
            rowHolder.appendChild(roleId);
            rowHolder.appendChild(roleName);
            holder.appendChild(rowHolder);
        })
    }
    else{
        const rowHolder = document.createElement("div");
        rowHolder.classList.add("body-row");
        const nodata = document.createElement("span");
        nodata.textContent = "No data";
        rowHolder.appendChild(nodata);
        holder.appendChild(rowHolder);
       
    }
}
const updateRoles = (roles)=>{
    if(roles && roles.length > 0){
        storedData.roles = roles;
        storage.setItem("data",JSON.stringify(storedData));
        showRoles();
    }
}
//fetch roles
const fetchRoles = ()=>{
    showSpinner();
    console.log("fetching underground...");
    return new Promise((resolve,reject)=>{
        var headers = {
            'Content-Type':'application/json',
            'Authorization':'Bearer '+currentUser.accessToken
        }
        
        fetch(roles_url,{method:"GET",headers:headers})
        .then(res=>{
            hideSpinner();
            if(res.status == 403){
                showFeedback("Your session expired, please sign in");
            }
            else {
                res.json().then(result=>{
                    console.log("bingo:",result.data);
                    updateRoles(result.data);
                    resolve(result);
               })
               .catch(e=>{
                   hideSpinner();
                   console.log("e:",e);
                   // showFeedback(e.msg,1)
                   showFeedback("Your session expired, please sign in");
                   reject(e);
               })
            }
        })
    })
}
//cancel role form
const cancelAddRoleForm = ()=>{
    const roleList = document.querySelector("#roles_content");
    const roleForm = document.querySelector("#add_role_content");
    roleList.classList.remove("hidden");
    roleForm.classList.add("hidden");
}
//show role form
const showRoleForm = ()=>{
    const roleList = document.querySelector("#roles_content");
    const roleForm = document.querySelector("#add_role_content");
    roleList.classList.add("hidden");
    roleForm.classList.remove("hidden");
    
}
const createMoreLink = (target,holder)=>{
    const button = document.createElement("button");
    button.id = "button_more";
    button.textContent = "More...";
    console.log("creating more button...");
    if(!holder.contains(button)){
        holder.appendChild(button);
        button.classList.add("secondary-button");
        button.addEventListener('click',(e)=>{
            activateMenu(target);
         })
    }
    else{

        if(button) holder.removeChild(button);
    }
    
}
const showClientsSummary = ()=>{
    if(storedData.clients.length == 0) {
        createClientSummaryRow(null);
    }
    else {
        const holder = document.querySelector("#client_table_summary");
        Array.from(holder.children).forEach(child=>{
            if(child.classList.contains("body-row")) holder.removeChild(child);
        })
        var topClients = storedData.clients.filter((row,index)=>{
            return index <= clientSummaryCount;
            
        });
        topClients.forEach(row=>{
                createClientSummaryRow(row);     
        })
       
    }
}
//show clientForm
const closeClientForm=(source)=>{
    document.getElementById(source).classList.add("hidden");
    document.getElementById("clients_content").classList.remove("hidden");
    showClients(storedData.clients);
}
//fetch clients
const getClients = ()=>{
    showSpinner();
    return new Promise((resolve,reject)=>{
        const headers = {'Content-type':'application/json','Authorization':'Bearer '+currentUser.accessToken};
        fetch(clients_url,{method:"GET",headers:headers})
        .then(response=>{
            if(response.status == 403){
                console.log("response: ",response)
                showFeedback("Your session has expired. Please login again",1);
                setTimeout(()=>{
                    storage.setItem("currentUser",JSON.stringify({}));
                    storage.setItem("data",JSON.stringify({}));
                    window.location.pathname = "/signin.html";
                },3000);
            }
            else{
            return response.json();
            }
            }).then(result=>{
            hideSpinner();
             storedData.clients = result.data;
            // console.log("fetch: ",data.clients);
            storage.setItem("data",JSON.stringify(storedData));
            resolve(result.data);
        })
        .catch(e=>{
            hideSpinner();
            console.log("eer: ",e);
            showFeedback("Your session has expired. Please login again",1);
            reject(e);
                
        })
    })
   
}

//update clients
const updateClients = (clients)=>{
    if(clients && clients.length > 0){
        storedData.clients = clients;
        storage.setItem("data",JSON.stringify(storedData));
        showClients(clients);
    }
}

//update client detail
const updateClientDetail = (detail)=>{
    if(detail){
        let user = JSON.parse(storage.getItem("currentUser"));
        user.detail = detail;
        storage.setItem("currentUser",JSON.stringify(user));
        refreshUser();
    }
}

//show pie chart
const drawChart = (config,canvas)=>{
    return myChart = new Chart(canvas,config);
}

//refresh user
const refreshUser=()=>{
    console.log("refreshed user");
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
//listen to window events
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
// document.addEventListener('updateData',(e)=>{
//     if(window.location.pathname == '/admin/'){
//         if(getActiveMenu() == 'dashboard') showAdminStats();
//         else if(getActiveMenu() == 'clients') showClients();
//         else if(getActiveMenu() == 'roles') showRoles();
//     }
// })

//listen to poststate change
window.addEventListener('poststate',(e)=>{
    console.log("poststate: ",e.state);
})
const showSettings=()=>{
    if(currentUser.id === 0){
        alert("settings admin");
    }
    else{
        showProfile();
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
//populate client details
const populateClientDetails = (form,client)=>{
    var detail = client.detail;
    form.email.value = client.email;
    console.log("pop: ",detail);
    if(detail){
        form.company_name.value = detail.name;
        form.client_id.value = detail.id;
        form.address.textContent = detail.address;
        form.contact_person.value = detail.contact_person;
        form.contact_email.value = detail.contact_email;
        form.phone.value= detail.phone;
    }
    
}

//submit dlient form
const submitClientDetail=(data)=>{
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
        currentUser.detail = result.data;
        updateClientDetail(result.data);
        showDashboard();
    })
    .catch(err=>{
        console.log("err: ",err);
    })
}
//search
const search = document.querySelector("#search_client");
if(search){
    search.addEventListener('input',(e)=>{
        showClients(searchClients(e.target.value));
    })
}

//check if admin is loggedin
if(window.location.pathname ==="/admin/"){
    if(currentUser == null || currentUser.id !== ADMIN){
        storage.setItem("currentUser",JSON.stringify({}));
        storage.setItem("data",JSON.stringify({}));
        window.location.pathname = "/signin.html";
    }
    else{
        getClients().then(clients=>{
            showAdminStats();
        })
        .catch(error=>{
            console.log("error: ",error);
            showFeedback("Something went wrong please try again later",1);
        });
        
       
        const detailForm = document.querySelector("#client_profile_form");
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
                let datas = {
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
                        datas.logo = reader.result;
                    },false);
    
                    reader.readAsDataURL(file);
                }
    
                const headers = {
                    'Content-type':'application/json',
                    'Authorization':'Bearer '+currentUser.accessToken
                }
                const options = {
                    method:"POST",body:JSON.stringify(datas),headers:headers
                }
                fetch(create_client_url,options)
                .then(res=>{
                    console.log("did any happened?");
                    if(res.status == 403){
                        showFeedback("Session expired. Please signin",1);
                        signoutUser();
                    }
                    else{
                        res.json().then(result=>{
                            closeClientForm('add_client_content');
                            updateClients(result.data);
                        })
                        .catch(err=>{
                            console.log("err: ",err);
                        })
            
                    }
                }).catch(e=>{
                    console.log("fetch e: ",e);
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
                

                let client = storedData.clients.filter(c=>c.id == id);
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

        //add role
        const roleForm = document.querySelector("#add_role_form");
        if(roleForm){
            const cancelForm = document.querySelector("#btnCancelAddRole");
            if(cancelForm){
                cancelForm.addEventListener('click',(e)=>{
                    cancelAddRoleForm();
                });
            }

            roleForm.addEventListener('submit',(e)=>{
                e.preventDefault();
                let roles = (storedData.roles) ? storedData.roles : [];
                let name = roleForm.name.value.trim();
                let description = roleForm.description.value.trim();
                let permission = roleForm.permission.value.trim();
                const data = {name:name,description:description,permission:permission};
                const headers = {
                    'Content-type':'application/json', 'Authorization': 'Bearer '+currentUser.accessToken
                }
                const options ={
                    body:JSON.stringify(data),
                    method:"POST",
                    headers:headers
                }
                fetch(create_role_url,options).then(res=>{
                    if(res.status == 403){
                        showFeedback("Your session has expired, please login",1);
                        signoutUser();
                    }
                    return res.json();

                })
                .then(result=>{
                    console.log(result);
                    if(result.data !== null && result.data.length > 0) {
                        roles = result.data;
                        storedData.roles = roles;
                        storage.setItem("data",JSON.stringify(storedData));
                        showFeedback(result.msg,0);
                    }
                    cancelAddRoleForm();
                }).catch(e=>{
                    showFeedback(e.msg,1);
                })
            })

        }
    }
}


