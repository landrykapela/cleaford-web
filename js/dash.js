const storage = window.localStorage;
const clientSummaryCount = 5;
var currentUser = (storage.getItem("currentUser")) ? JSON.parse(storage.getItem("currentUser")):null;
var storedData = (storage.getItem("data")) ? JSON.parse(storage.getItem("data")):{client_roles:[],customers:[],roles:[]};

const originalSetItem = localStorage.setItem;

localStorage.setItem = function(key, value) {
  const event = new Event('updateData');

  event.value = value; // Optional..
  event.key = key; // Optional..

  document.dispatchEvent(event);

  originalSetItem.apply(this, arguments);
};


if(window.location.pathname == "/signin.html"){
    storage.setItem("data",JSON.stringify({}));
    storage.setItem("currentUser",null);
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
        Array.from(document.getElementsByClassName("can-hide"))
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
            case 'customers':
                getCustomers().then(customers=>{
                    showCustomers(customers)
                }).catch(er=>{
                    console.log("er:",er);
                    showFeedback(er,1);
                });
                break;
            case 'roles':
                if(!storedData.client_roles || storedData.client_roles.length == 0){
                    fetchClientRoles().then(result=>{
                        console.log("res: ",result);
                        if(result.code == 0) showClientRoles(result.data);
                        else showFeedback(result.msg,1);
                    }).catch(e=>{
                        showFeedback(e.msg,1);
                        console.log("let's see this...not ok",e);
                    });
                }
                else showClientRoles(storedData.client_roles);
                break;
            case 'dashboard':
               showClientStats();
                
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
            case 'add_customer':
                document.querySelector("#customers").classList.add("active");
                if(content) content.classList.remove("hidden");
                break;
            case 'edit_customer':
                document.querySelector("#customers").classList.add("active");
                if(content) content.classList.remove("hidden");
                break;
        }
    }
  
}
const getActiveMenu =()=>{
    if(sideBar){
        let active = 'dashboard';
        const items = Array.from(sideBar.children);
        items.forEach(item=>{
            if(item.classList.contains("active")){
                active = item.id;
            } 
                
        });
        return active;
    }
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
        showFeedback(e,1);
    });
  
};

//show admin stats
const showClientStats =()=>{
    greet("Hello "+currentUser.detail.contact_person.split(" ")[0],null);
     const numberOfCustomers = document.getElementById("no_of_customers");
     numberOfCustomers.textContent = (storedData.customers) ? storedData.customers.length:23;
    
    //show client summary
    // showCustomersSummary();
    let chartArea = document.getElementById("chart-area");
    while(chartArea.hasChildNodes()){
        chartArea.removeChild(chartArea.childNodes[0]);
    }
    const canvas = document.createElement("canvas");
    chartArea.appendChild(canvas);
    let summary = {
        labels:["Clearing","Forwarding"],
        datasets:[{
            label:"Consigment Type",
            data:[22,36],
            backgroundColor:['#ffcc00','#cc9900'],
            hoverOffset:4
        }]
    }
    let config = {
        type:'pie',data:summary,options:{
            plugins:{
                legend:{
                    display:true,
                    position:'left'
                },
                title:{
                    display:true,
                    position:'top',text:'Consigment Type',
                    align:'start',
                    padding:{
                        top:10,left:10,bottom:10
                    }
                }
            }
        }
    }
    var myChart = drawChart(config,canvas);
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
const showCustomerDetailForm = ()=>{
    const clientList = document.querySelector("#customers_content");
    const clientForm = document.querySelector("#add_customer_content");
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
        showCustomerDetailForm();
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
//showCustomers
const showCustomers = (data)=>{
    const holder = document.querySelector("#clients_content");    
    if(!data || data.length == 0){
        createClientRow(null,holder);
    }
    else{
        Array.from(holder.children).forEach(child=>{
            if(child.classList.contains("body-row")) holder.removeChild(child);
        })
        data.forEach(row=>{
            createClientRow(row,holder);
        });
    }
}
//display system roles
const showClientRoles = (roles)=>{
    greet("Roles",{title:"Roles",description:"Add Role"});
    const holder = document.getElementById("roles_content");
    Array.from(holder.children).forEach(child=>{
        if(child.classList.contains('body-row')) holder.removeChild(child);
    })
    if(roles && roles.length > 0){
        roles = roles.map(role=>{
            let newRole = role;
            storedData.roles.forEach(r=>{
                if(role.level == r.id) newRole.level_name = r.name;
               
            });
            return newRole;
        })
        roles.forEach(role=>{
            const rowHolder = document.createElement("div");
            rowHolder.classList.add("body-row");
            const roleId = document.createElement("span");
            roleId.textContent = role.name;
            const roleName = document.createElement("span");
            roleName.textContent = role.description;
            const roleLevel = document.createElement("span");
            roleLevel.textContent = role.level_name;

            rowHolder.appendChild(roleId);
            rowHolder.appendChild(roleName);
            rowHolder.appendChild(roleLevel);
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

//fetch roles
const fetchRoles = ()=>{
    return new Promise((resolve,reject)=>{
        var headers = {
            'Content-Type':'application/json',
            'Authorization':'Bearer '+currentUser.accessToken
        }
        
        fetch(roles_url,{method:"GET",headers:headers})
        .then(res=>{
            if(res.status == 403){
                showFeedback("Your session expired, please sign in",1);
                signoutUser();
            }
            else{
                res.json().then(result=>{
                    console.log(result);
                    storedData.roles = result.data;
                    storage.setItem("data",JSON.stringify(storedData));
                    resolve(result);
                })
                .catch(e=>{
                    reject(e);
                })
            }
        })
        .catch(e=>{
            console.log("fetch errror: ",e);
            reject(e)
        })
    })
}

//fetch clientRoles
const fetchClientRoles = ()=>{
    return new Promise((resolve,reject)=>{
        let headers={
            'Content-Type':'application/json',
            'Authorization':'Bearer '+currentUser.accessToken
        }
        fetch(client_roles+"/"+currentUser.id,{method:"GET",headers:headers})
        .then(res=>{
            if(res.status == 403){
                showFeedback("Session expired, please login",1);
                signoutUser();
            }
            else {
                res.json().then(result=>{
                    console.log(result);
                    storedData.client_roles = result.data;
                    storage.setItem("data",JSON.stringify(storedData));
                    resolve(result);
                })
                .catch(e=>{
                    reject(e);
                })
            }
        })
        .catch(e=>{
            console.log("fetch error: ",e)
        })
    })
}
//register client role
const registerClientRole = (data)=>{
    return new Promise((resolve,reject)=>{
        let url = client_roles+"/"+currentUser.id;
        const body = JSON.stringify({user_id:currentUser.id,name:data.name,description:data.description,level:data.level});
        const headers = {
            'Content-type':'application/json',
            'Authorization':'Bearer '+currentUser.accessToken
        }
        const options = {
            method:"POST",
            body:body,
            headers:headers
        }
        fetch(url,options).then(res=>{
            if(res.status == 403) {
                showFeedback("Your session expired, please login",1);
                signoutUser();
            }
            else{
                res.json().then(result=>{
                    showFeedback(result.msg,result.code);
                    resolve(result);
                })
                .catch(err=>{
                    reject(err);
                })
            }
        })
        .catch(err=>{
            reject(err);
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
    greet("Roles",{title:"Roles",description:"Add Role"});
    const roleList = document.querySelector("#roles_content");
    const roleForm = document.querySelector("#add_role_content");
    roleList.classList.add("hidden");
    roleForm.classList.remove("hidden");
    if(window.location.pathname == "/dashboard/"){
        const selectLevel = document.querySelector("#level");
        storedData.roles.forEach(role=>{
            selectLevel.options.add(new Option(role.name,role.id));
        })
        const cancelBut = document.querySelector("#btnCancelAddRole");
        cancelBut.addEventListener('click',(e)=>{
            cancelAddRoleForm();
        })
    }
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
const showCustomersSummary = ()=>{
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
    showCustomers(storedData.clients);
}
//fetch clients
const getCustomers = ()=>{
    showSpinner();
    return new Promise((resolve,reject)=>{
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
        showCustomers(clients);
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
document.addEventListener('updateData',(e)=>{
    if(window.location.pathname == '/admin/'){
        let data = JSON.parse(e.value);
        console.log("may be an update triggered")
        if(getActiveMenu() == 'dashboard') showClientStats();
        else if(getActiveMenu() == 'customers') showCustomers(data.customers);
        else if(getActiveMenu() == 'roles') showClientRoles(data.client_roles);
    }
})

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
    
    showCustomers(clients);
}
//search client
const searchCustomers = (keyword)=>{
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
const search = document.querySelector("#search_customers");
if(search){
    search.addEventListener('input',(e)=>{
        showCustomers(searchCustomers(e.target.value));
    })
}
//shwo greeting
const greet=(name,detail=null)=>{
    document.querySelector("#greetings").textContent = name;
    if(detail){
        document.querySelector("#crumbs").textContent = detail.title+" | "+detail.description;
    }
    else document.querySelector("#crumbs").textContent ="";
         
}
//check if current page is dashboard
if(window.location.pathname == "/dashboard/"){
    if(currentUser == null) window.location.pathname = "/signin.html";
    else{
        var clientDetails = currentUser.detail;
         greet("Hello "+clientDetails.contact_person.split(" ")[0],null);
         document.querySelector("#account-name").textContent = clientDetails.contact_person;
         if(clientDetails.logo) document.querySelector("#avatar").src =clientDetails.logo;
        showClientStats();
        //  let chartArea = document.getElementById("chart-area");
        //     while(chartArea.hasChildNodes()){
        //         chartArea.removeChild(chartArea.childNodes[0]);
        //     }
        //     const canvas = document.createElement("canvas");
        //     chartArea.appendChild(canvas);
        //     let summary = {
        //         labels:["Clearing","Forwarding"],
        //         datasets:[{
        //             label:"Consigment Type",
        //             data:[102,360],
        //             backgroundColor:['#ffcc00','#cc9900'],
        //             hoverOffset:4
        //         }]
        //     }
        //     let config = {
        //         type:'pie',data:summary,options:{
        //             plugins:{
        //                 legend:{
        //                     display:true,
        //                     position:'left'
        //                 },
        //                 title:{
        //                     display:true,
        //                     position:'top',text:'Consigment Type',
        //                     align:'start',
        //                     padding:{
        //                         top:10,left:10,bottom:10
        //                     }
        //                 }
        //             }
        //         }
        //     }
        //     var myChart = drawChart(config,canvas);
            fetchRoles().then(result=>{
            })
            .catch(e=>{
                showFeedback(e.msg,1);
            })

            //add client role
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
                let roles = (storedData.client_roles) ? storedData.client_roles : [];
                let name = roleForm.name.value.trim();
                let description = roleForm.description.value.trim();
                let level = roleForm.level.options[roleForm.level.options.selectedIndex].value;
                const data = {name:name,description:description,level:level};
                registerClientRole(data).then(result=>{
                    console.log("sasaje: ",result);
                    if(result.data && result.data.length > 0) {
                        roles = result.data;
                        storedData.client_roles = roles;
                        storage.setItem("data",JSON.stringify(storedData));
                        
                        cancelAddRoleForm();
                    }
                    showFeedback(result.msg,result.code);
                })
                .catch(e=>{
                    console.log("eee: ",e);
                    showFeedback("Oops! Something might have gone wrong. Please try again later",1);
                })
            })

        }
        }
}

//client profile
if(window.location.pathname == "/profile/"){
        const detailForm = document.querySelector("#client_profile_form");
        
        if(currentUser){
            populateClientDetails(detailForm,currentUser);
        }
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
                        submitClientDetail(data);
                    },false);
    
                    reader.readAsDataURL(file);
                }
    
                
    
            });
        }

}

