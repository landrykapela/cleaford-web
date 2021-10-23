const storage = window.localStorage;
const clientSummaryCount = 5;
var userObj = storage.getItem("currentUser");
var currentUser = (userObj !== null && userObj !== undefined && userObj !=="") ? JSON.parse(userObj):null;
var storedData = (storage.getItem("data")) ? JSON.parse(storage.getItem("data")):{regions:[],client_roles:[],clients:[],roles:[],features:[],settings:{currency:"Tsh"}};
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

//thousad separator
const thousandSeparator =(x)=> {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
//set color theme
const setTheme = (color,customizableItems)=>{
    if(customizableItems && customizableItems.length > 0){
        customizableItems.forEach(item=>{
            if(item.toLowerCase() == "theme-band"){
                document.getElementsByClassName("theme-band")[0].style.borderBottomColor = color;
            }
            else{
                var myItems = Array.from(document.getElementsByClassName(item));
                myItems.forEach(i=>{
                    i.style.backgroundColor = color;
                })
            }
        })
    }
}

//confirm dialog
const alertDialog =(msg,actionText,action=null)=>{
    var alert = document.getElementById("alert_dialog");
    alert.classList.remove("hidden");
    var dialog = document.createElement("div");
    dialog.classList.add("dialog");
    var dialogTitle = document.createElement("div");
    dialogTitle.classList.add("dialog-title");
    dialogTitle.textContent = actionText.toUpperCase();
    var msgText = document.createElement("p");
    msgText.textContent = msg;
    msgText.style.textAlign="center";
    dialog.appendChild(dialogTitle);
    dialog.appendChild(msgText);
    var buttonRow = document.createElement("div");
    buttonRow.classList.add("row-end");
    if(action != null){
        var okButt = document.createElement("span");
        okButt.classList.add("dialog-button");
        okButt.classList.add("primary-dark-text");
        okButt.textContent = actionText.toUpperCase();
        buttonRow.appendChild(okButt);
        okButt.addEventListener('click',(e)=>{
            action();
            alert.classList.add("hidden");
            while(alert.hasChildNodes()){
                alert.removeChild(alert.childNodes[0]);
            }
            document.body.style.overflow = 'unset';
            
        });
    }
    var cancelButt = document.createElement("span");
    cancelButt.classList.add('dialog-button');
    cancelButt.textContent = "CANCEL";
    buttonRow.appendChild(cancelButt);

    dialog.appendChild(buttonRow);
    alert.appendChild(dialog);
    document.body.style.overflow = 'hidden';

   
    cancelButt.addEventListener('click',(e)=>{
        alert.classList.add("hidden");
        while(alert.hasChildNodes()){
            alert.removeChild(alert.childNodes[0]);
        }
        document.body.style.overflow = 'unset';
    })
    if(action ==null){
        cancelButt.textContent = "CLOSE";
    }
}
if(window.location.pathname != "/signin.html" && window.location.pathname != "/signing.html"){

    // setTheme("blue",["theme-band"]);
    //listen to window events
    document.addEventListener('mouseup',(e)=>{
    
    var dropDown = document.getElementById("drop-down");
    var arrowDrop = document.getElementById("arrow-drop");
    if(!dropDown.contains(e.target)) {
        dropDown.classList.add("hidden");
        arrowDrop.innerHTML = "arrow_drop_down";
    }
      
})
}
//initialize google maps

const initializeMap =(mapHolder,searchInput,targetForm,center={lat:-6.7924, lng:39.2083})=>{   
    const map = new google.maps.Map(mapHolder,{center:center,zoom:13});
    var fields = ["formatted_address","geometry","name","place_id"];
    var options = {strictBounds:false,fields:fields,type:"establishment"};
    var autocomplete = new google.maps.places.Autocomplete(searchInput,options);
    autocomplete.bindTo("bounds",map);
    const marker = new google.maps.Marker({
        map,
        anchorPoint: new google.maps.Point(0, -29),
      });
    autocomplete.addListener("place_changed",()=>{
        const place = autocomplete.getPlace();
        
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({placeId:place.place_id},(result)=>{
            var addrComponents = result[0].address_components;
            var city = addrComponents.filter(cp=>{
                return cp.types.includes("locality") || cp.types.includes("administrative_area_level_1");
            })
            var country = addrComponents.filter(cp=>{
                return cp.types.includes("country");
            })
            targetForm.region.value = city[0].long_name;
            targetForm.country.value =country[0].long_name;
        })
        
        if(place.geometry.viewport){
            map.fitBounds(place.geometry.viewport);
        }
        else{
            map.setCenter(place.geometry.location);
            map.setZoom(17);
            
        }
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);
    })

}

const fetchRegions = ()=>{
    fetch(regions_url).then(res=>res.json()).then(regions=>{
        if(regions && regions.length > 0){
            storedData.regions = regions;
            storage.setItem("data",JSON.stringify(storedData));
        }
    }).catch(e=>{
        console.log("Could not get regions");
    })
}
//validate email address
const isValidEmail = (email)=>{
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
if(window.location.pathname == "/signin.html"){
    storage.setItem("currentUser",JSON.stringify({}));
    storage.setItem("data",JSON.stringify({}));
}

//handle sidebar nav
const sideBar = document.querySelector("#side-bar");
if(sideBar){
    const items = Array.from(sideBar.children);
    items.forEach(item=>{
        if(item){
            item.addEventListener('click',(e)=>{
                if(item.nextElementSibling && item.nextElementSibling.classList.contains("submenu")){
                   showHideSubmenu(item.id);
                   
                }
                else activateMenu(e.target.id);
                
            })
        }
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
const showHideSubmenu = (menuId)=>{
    var subMenu = document.getElementById(menuId+"_submenu");
    var dropArrow = document.getElementById(menuId+"_drop");

    subMenu.classList.toggle("hidden");
    dropArrow.textContent = subMenu.classList.contains("hidden") ? "arrow_drop_down" : "arrow_drop_up";

        
}
const activateMenu =(target)=>{
    const items = Array.from(document.getElementsByClassName("menu-item"));

    items.forEach(i=>{
        //unselect all sidebar menu items
        if(i.classList.contains("active")){
            i.classList.remove("active");
        }
        
        Array.from(document.getElementsByClassName("can-hide"))
            .forEach(child=>{
                child.classList.add("hidden");
            })
       
    });
   
    //activate currently selected item and show it's content
    items.forEach(item=>{  
        if(item.id == target) {
            item.classList.add("active");
            var cont = document.getElementById(target+"_content");
            if(cont) cont.classList.remove("hidden");
        }           
    });

    const menu = document.getElementById(target);
    
    if(menu){
        switch(menu.id){
            case 'clients':
                greet("Clients",{title:"Clients",description:"List of clients"});
                getClients().then(clients=>{
                    showClients(clients)
                }).catch(er=>{
                    console.log("er:",er);
                    showFeedback(er,1);
                });
                break;
            case 'subscriptions':
                greet("Settings",{title:"Subscription",description:"Manage subscriptions"});
                var features = (storedData.features) ? storedData.features :[];
                displayFeaturesGrid(features,document.querySelector("#package_features"));
                showPackages();
                break;
            case 'features':
                greet("Settings",{title:"Features",description:"Manage features"});
                showFeatures();
                break;
            case 'roles':
                greet("Settings",{title:"Roles",description:"Manage roles"});
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
                greet("Hello Admin",null);
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
                greet("Clients",{title:"Clients",description:"Add client"});
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
    var showHide = document.querySelector("#show_password");
    showHide.addEventListener("click",(e)=>{
        var value = e.target.textContent;
        if(value.toLowerCase() === "visibility"){
            signupForm.password.type = "text";
            signupForm.cpassword.type = "text";
            e.target.textContent = "visibility_off";
        }
        else{
            signupForm.password.type = "password";
            signupForm.cpassword.type = "password";
            e.target.textContent = "visibility";
        }
    })
    signupForm.addEventListener('submit',(e)=>{
        e.preventDefault();
        var spinner = document.getElementById("button-spinner");
        var submit = document.getElementById("btnSubmit");
        let email = signupForm.email.value;
        let password = signupForm.password.value;
        let body = {email:email,password:password};
        let data = JSON.stringify(body);
    
        fetch(signup_url,{method:"POST",body:data,headers:{
            'Content-Type':'application/json'
        }})
        .then(res=>res.json())
        .then(result=>{
            console.log(result);
            submit.classList.add("hidden");
            if(spinner) spinner.classList.remove("hidden");
            if(result.code == 0){
                currentUser = result.data;
                delete currentUser.password;
                storage.setItem("currentUser",JSON.stringify(currentUser));
                showProfile();
                showFeedback(result.msg,result.code);
            }
            else if(result.code == -1){
                showFeedback(result.msg,0);
                submit.classList.remove("hidden");
                if(spinner) spinner.classList.add("hidden");
            }
            else{
                showFeedback(result.msg,1);
                submit.classList.remove("hidden");
                if(spinner) spinner.classList.add("hidden");
            }
            
        }).catch(e=>{
            console.log("signup: ",e);
            showFeedback("Something went wrong, please try again later",1);
        })
    });
   
}

//signin
const loginForm = document.querySelector("#signin_form");
if(loginForm){
    var showHide = document.querySelector("#show_password");
    showHide.addEventListener("click",(e)=>{
        var value = e.target.textContent;
        if(value.toLowerCase() === "visibility"){
            loginForm.password.type = "text";
            e.target.textContent = "visibility_off";
        }
        else{
            loginForm.password.type = "password";
            e.target.textContent = "visibility";
        }
    })
    loginForm.addEventListener('submit',(e)=>{
        e.preventDefault();
        var spinner = document.getElementById("button-spinner");
        var submit = document.getElementById("btnSubmit");
        let email = loginForm.email.value;
        let password = loginForm.password.value;
        let user = {email:email,password:password};
        submit.classList.add("hidden");
        if(spinner) spinner.classList.remove("hidden");
        fetch(signin_url,{method:"POST",body:JSON.stringify(user),headers:{'Content-type':'application/json'}})
        .then(res=>res.json()).then(response=>{
            submit.classList.remove("hidden");
            if(spinner) spinner.classList.add("hidden");
            if(response.code == 1){
                showFeedback(response.msg,1);
            }
            else{
                currentUser = response.data;
                storage.setItem("currentUser",JSON.stringify(currentUser));
                if(currentUser.id == 0) {
                    showAdmin();
                }
                else{
                    if(currentUser.db == null) showProfile();
                    else showDashboard();
                }
            }
        })
        .catch(err=>{
            console.log("eee: ",err);
            submit.classList.remove("hidden");
            if(spinner) spinner.classList.add("hidden");
            let error = (err.msg) ? err.msg : "Connection Problems. Please try again later";
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
                storage.setItem("currentUser",JSON.stringify(null));
                storage.setItem("data",JSON.stringify(null));
                window.location.pathname = "/signin.html";
        })
        .catch(e=>{
            console.log(e);
        });
  
};

const generateRandomData = (count)=>{
    var result = [];
    for(let i=0; i<count;i++){
        let random = Math.floor(Math.random() * (NUMBER_CFG.max - NUMBER_CFG.min + 1)) + NUMBER_CFG.min;
        result.push(random);
    }
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
            data: generateRandomData(NUMBER_CFG.count),
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

    fetchPaymentTerms();
    fetchFeatures();
    fetchPackages();
    getClients().then(clients=>{
        mapChart();
    }).catch(e=>{
        console.log("hblah ",e)
    })
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
    const updateForm = document.querySelector("#edit_client_form");

    if(updateForm){
    updateForm.client_id.value = client.id;
    updateForm.company_name.value = client.name;
    updateForm.address.value = client.address;
    updateForm.email.value = client.email;
    updateForm.contact_person.value = client.contact_person;
    updateForm.phone.value = client.phone;
    updateForm.contact_email.value = client.contact_email;
    updateForm.region.value = client.region;
    updateForm.country.value = client.country;

    let imagePreview = document.getElementById("client_image");
    if(client.logo && client.logo.length != 0) imagePreview.src = client.logo;
    // initializeMap(document.getElementById("map-edit"),updateForm.address,updateForm);
    activateMenu('edit_client');
    document.getElementById(source).classList.add("hidden");
    document.querySelector("#edit_client_content").classList.remove("hidden");
    document.getElementById("btnCancelEdit").addEventListener('click',()=>{
        closeClientForm('edit_client_content');
    })

         document.getElementById("btnCancelEdit").addEventListener('click',()=>{
         closeClientForm('edit_client_content');
         });
        //  initializeMap(document.getElementById("map-edit"),updateForm.address,updateForm);
         let inputFile = document.getElementById("company_logo");
         if(inputFile){
             inputFile.addEventListener('change',(e)=>{
                 var file = inputFile.files[0];
                 if(file){
                     var reader = new FileReader();
                     reader.addEventListener('load',()=>{
                        if(reader.readyState == 2 && reader.result != null){

                            preview.src = reader.result;
                        }
                     },false);
 
                     reader.readAsDataURL(file);
                 }
             })
         }
        
         updateForm.addEventListener('submit',(e)=>{
             e.preventDefault();
             let id = updateForm.client_id.value;
             let name   = updateForm.company_name.value;
             let email  = updateForm.email.value;
             let phone  = updateForm.phone.value;
             let person = updateForm.contact_person.value;
             let cemail = updateForm.contact_email.value;
             let address= updateForm.address.value;
             let region = updateForm.region.value;
             let country = updateForm.country.value;
             let code = updateForm.code.value;
             let tin = updateForm.tin.value;
             let file = updateForm.company_logo.files[0];
             

             let client = storedData.clients.filter(c=>c.id == id);
             let logoFile = client.logo;
             let newData = {
                 region:region,
                 country:country,
                 id:id,
                 code:(code && code.lenth !== 0) ? code: client.code,
                 tin:(tin && tin.length !== 0) ? tin:client.tin,
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
                 }
                 else{
                     res.json().then(result=>{
                         console.log("test: ",result);
                        updateClients(result.data);
                            showFeedback(result.msg,result.code);
                             closeClientForm('edit_client_content');
                        
                     })
                     .catch(err=>{
                         showFeedback(err,1);
                     })
                 }
             })
         });
     }

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
    rowHolder.classList.add("shadow-minor");
    if(row == null){
        const data = document.createTextNode("No clients");
        rowHolder.appendChild(data);
    }
    else{
        const companyName = document.createElement("span");
        const companyAddress = document.createElement("span");
        const companyLocation = document.createElement("span");
        const contactName = document.createElement("span");
        const contactEmail = document.createElement("span");
        const companyPhone = document.createElement("span");

        companyName.textContent = row.name;
        companyName.id = row.id;
        companyAddress.textContent = (row.address <20) ? row.address : (row.address.substr(0,19)+"...");
        companyLocation.textContent = row.region+", "+row.country;
        companyPhone.textContent = row.phone;
        contactName.textContent = row.contact_person;
        contactEmail.textContent = row.contact_email;

        rowHolder.appendChild(companyName);
        rowHolder.appendChild(companyAddress);
        rowHolder.appendChild(companyLocation);
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
    rowHolder.classList.add("shadow-minor");
    if(row == null){
        const data = document.createTextNode("No clients");
        rowHolder.appendChild(data);
    }
    else{
        const companyName = document.createElement("span");
        const companyAddress = document.createElement("span");
        const contactEmail = document.createElement("span");
        const companyStatus = document.createElement("span");

        companyName.textContent = row.name;
        companyName.id = row.id;
        companyAddress.textContent = row.region+", "+row.country;
        contactEmail.textContent = row.contact_email;
        companyStatus.textContent = row.status == 0 ? 'Pending Activation' : "Activated";

        rowHolder.appendChild(companyName);
        rowHolder.appendChild(contactEmail);
        rowHolder.appendChild(companyAddress);
        rowHolder.appendChild(companyStatus);
        // rowHolder.appendChild(contactName);

       
    }

    holder.appendChild(rowHolder);
     //add click listener
     rowHolder.addEventListener('click',()=>{
        editClientDetail(row,'dashboard_content');
    })
}
//showClients
const showClients = (data)=>{
    const holder = document.querySelector("#clients_table");   
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
//get features

//delete client role
const deleteRole =(role_id)=>{
    
    fetch(create_role_url+"/"+role_id,{
        method:"DELETE",headers:{'Content-type':'application/json','Authorization':'Bearer '+currentUser.accessToken}
    })
    .then(res=>{
        if(res.status == 403){
            showFeedback("Your session has expired, please login",1);
        }
        else{
            res.json().then(result=>{
                updateRoles(result.data);
                showFeedback(result.msg,result.code);
            }).catch(e=>{
                showFeedback(e,1);
            })
        }
    }).catch(e=>{
        console.log(e);
        showFeedback("Something went wrong! Please try again later",1)
    })
}
//show edit role form
const showRoleEditForm = (holder,role)=>{
    var form = document.getElementById("edit_role_form");
    if(form && form != null && form != undefined){
        form.role_name.value = role.name;
        form.role_level.value = role.level;
    }
    else{
        const form = document.createElement("form");
        form.method = "post";
        form.id = "edit_role_form";
        const inputName = document.createElement("input");
        inputName.type = "text";
        inputName.classList.add("form-control");
        inputName.id="role_name";
        inputName.name = "role_name";
        inputName.value = role.name;
        form.appendChild(inputName);

        const inputDesc = document.createElement("input");
        inputDesc.type = "text";
        inputDesc.classList.add("form-control");
        inputDesc.id="role_desc";
        inputDesc.name = "role_desc";
        inputDesc.value = role.description;
        form.appendChild(inputDesc);


    
        const inputSubmit = document.createElement("input");
        inputSubmit.type = "submit";
        inputSubmit.classList.add("button-s");
        inputSubmit.classList.add("no-corner");
        inputSubmit.id="btnSubmitRole";
        inputSubmit.name = "btnSubmitRole";
        inputSubmit.value = "Update Role";
        form.appendChild(inputSubmit);

        const close = document.createElement("span");
        close.classList.add("material-icons");
        close.textContent = "close";
        form.appendChild(close);
        
       
        var addForm = document.getElementById("add_role_form");
        if(addForm) addForm.classList.add("hidden");
        holder.appendChild(form);
         //hide edit form and display add role form
         close.addEventListener("click",(e)=>{
            holder.removeChild(form);
            addForm.classList.remove("hidden");
        });

        form.addEventListener('submit',(e)=>{
             e.preventDefault();
             
            let name = inputName.value.trim();
            let description = inputDesc.value.trim();
            // let permission = "1,2";//roleForm.permission.value.trim();
            const data = {name:name,description:description};
            
            updateRole(data,role.id).then(result=>{
                showFeedback(result.msg,result.code);
                updateRoles(result.data);
            }).catch(err=>{
                showFeedback(err,1);

            }).finally(()=>{
                holder.removeChild(form);
                // holder.appendChild(addForm);
            })
    })
    }
   
}
//show edit role form
const showFeatureEditForm = (holder,feature)=>{
    var form = document.getElementById("edit_feature_form");
    if(form && form != null && form != undefined){
        form.feature_name.value = feature.name;
        form.feature_desc.value = feature.description;
        form.feature_label.value = feature.label;
        var parent = storedData.features.filter(ft=>{
            return ft.id == feature.id;
        });
        form.feature_parent.value = parent[0].parent;
    }
    else{
        const form = document.createElement("form");
        form.method = "post";
        form.id = "edit_feature_form";
        const inputName = document.createElement("input");
        inputName.type = "text";
        inputName.classList.add("form-control");
        inputName.id="feature_name";
        inputName.name = "feature_name";
        inputName.value = feature.name;
        form.appendChild(inputName);

        const inputDesc = document.createElement("input");
        inputDesc.type = "text";
        inputDesc.classList.add("form-control");
        inputDesc.id="feature_desc";
        inputDesc.name = "feature_desc";
        inputDesc.value = feature.description;
        form.appendChild(inputDesc);


        const inputLabel = document.createElement("input");
        inputLabel.type = "text";
        inputLabel.classList.add("form-control");
        inputLabel.id="feature_label";
        inputLabel.name = "feature_label";
        inputLabel.value = feature.label.toLowerCase();
        form.appendChild(inputLabel);
    
    
        const inputParent = document.createElement("select");
        inputParent.classList.add("form-control");
        inputParent.id="feature_parent";
        inputParent.name = "feature_parent";
        inputParent.options.add(new Option("--select parent feature--",-1));
        form.appendChild(inputParent);
        var features = (storedData.features) ? storedData.features :[];
        features.forEach(ft=>{
            inputParent.options.add(new Option(ft.name,ft.id));
        });

        inputParent.value = feature.parent;
    
        const inputSubmit = document.createElement("input");
        inputSubmit.type = "submit";
        inputSubmit.classList.add("button-s");
        inputSubmit.classList.add("no-corner");
        inputSubmit.id="btnSubmitRole";
        inputSubmit.name = "btnSubmitRole";
        inputSubmit.value = "Update Role";
        form.appendChild(inputSubmit);

        const close = document.createElement("span");
        close.classList.add("material-icons");
        close.textContent = "close";
        form.appendChild(close);
        
       
        var addForm = document.getElementById("add_feature_form");
        if(addForm) addForm.classList.add("hidden");
        holder.appendChild(form);
         //hide edit form and display add role form
         close.addEventListener("click",(e)=>{
            holder.removeChild(form);
            addForm.classList.remove("hidden");
        });

        form.addEventListener('submit',(e)=>{
             e.preventDefault();
             
            let name = inputName.value.trim();
            let description = inputDesc.value.trim();
            let label= inputLabel.value.trim();
            let parent = inputParent.options[inputParent.options.selectedIndex].value;
            const data = {name:name,description:description,label:label,parent:parent};
            
            updateFeature(data,feature.id).then(result=>{
                showFeedback(result.msg,result.code);
                updateFeatures(result.data);
            }).catch(err=>{
                showFeedback(err,1);

            }).finally(()=>{
                holder.removeChild(form);
                // holder.appendChild(addForm);
            })
    })
    }
   
}

//show role form
const showFeatureForm = (holder)=>{
    const form = document.createElement("form");
    form.method = "post";
    form.id = "add_feature_form";
    const inputName = document.createElement("input");
    inputName.type = "text";
    inputName.classList.add("form-control");
    inputName.id="feature_name";
    inputName.name = "feature_name";
    inputName.placeholder = "Feature name";
    form.appendChild(inputName);

    const inputDescription = document.createElement("input");
    inputDescription.type = "text";
    inputDescription.classList.add("form-control");
    inputDescription.id="feature_description";
    inputDescription.name = "feature_description";
    inputDescription.placeholder = "Feature description";
    form.appendChild(inputDescription);


    const inputLabel = document.createElement("input");
    inputLabel.type = "text";
    inputLabel.classList.add("form-control");
    inputLabel.id="feature_label";
    inputLabel.name = "feature_label";
    inputLabel.placeholder = "Enter a label";
    form.appendChild(inputLabel);


    const inputParent = document.createElement("select");
    inputParent.classList.add("form-control");
    inputParent.id="feature_parent";
    inputParent.name = "feature_parent";
    inputParent.options.add(new Option("--select parent feature--",-1));
    form.appendChild(inputParent);
    var features = (storedData.features) ? storedData.features :[];
    features.forEach(f=>{
        if(f.parent == -1) {
            inputParent.options.add(new Option(f.name,f.id));
        }
    })

    const inputSubmit = document.createElement("input");
    inputSubmit.type = "submit";
    inputSubmit.classList.add("button-s");
    inputSubmit.classList.add("no-corner");
    inputSubmit.id="btnSubmitFeature";
    inputSubmit.name = "btnSubmitFeature";
    inputSubmit.value = "Add Feature";
    form.appendChild(inputSubmit);
    holder.appendChild(form);
    // holder.appendChild(rowHolder);

     form.addEventListener('submit',(e)=>{
             e.preventDefault();
        // let roles = (storedData.roles) ? storedData.roles : [];
        let name = inputName.value.trim();
        let description = inputDescription.value.trim();
        let label = inputLabel.value.trim();
        let parent = inputParent.options[inputParent.options.selectedIndex].value;
        const data = {name:name,description:description,label:label,parent:parent};
        console.log("parent: ",data);
        const headers = {
            'Content-type':'application/json', 'Authorization': 'Bearer '+currentUser.accessToken
        }
        const options ={
            body:JSON.stringify(data),
            method:"POST",
            headers:headers
        }
        fetch(features_url,options).then(res=>{
            if(res.status == 403){
                showFeedback("Your session has expired, please login",1);
                signoutUser();
            }
            else{
                res.json()
                .then(result=>{
                    if(result.data !== null && result.data.length > 0) {
                        showFeedback(result.msg,0);
                        updateFeatures(result.data);
                        
                    }
                    // cancelAddRoleForm();
                }).catch(e=>{
                    showFeedback(e.msg,1);
                })
            }

        })
        .catch(e=>{
            console.log("e: ",e);
            showFeedback(e,1);
        })
    
    })

    
}
//display subscription features
const showFeatures = ()=>{
    const holder = document.getElementById("features-table");
    Array.from(holder.children).forEach(child=>{
        if(child.classList.contains('body-row') || child.id=="add_feature_form") holder.removeChild(child);
    })
    var features = (storedData.features) ? storedData.features : [];
    if(features && features.length > 0){
        features.forEach(feature=>{
            const rowHolder = document.createElement("div");
            rowHolder.classList.add("body-row");
            rowHolder.classList.add("shadow-minor");
            const featureName = document.createElement("span");
            featureName.textContent = feature.name;
            const featureDesc = document.createElement("span");
            featureDesc.textContent = feature.description;

            const featureLabel = document.createElement("span");
            featureLabel.textContent = feature.label;
            rowHolder.appendChild(featureName);
            rowHolder.appendChild(featureDesc);
            rowHolder.appendChild(featureLabel);

            const editBut = document.createElement("span");
            editBut.id = "edit_feature_"+feature.id;
            editBut.classList.add("material-icons");
            editBut.textContent = "edit";

            const delBut = document.createElement("span");
            delBut.id = "del_feature_"+feature.id;
            delBut.classList.add("material-icons");
            delBut.textContent = "delete";

            const actionSpan = document.createElement("span");
            actionSpan.classList.add("actions");
            actionSpan.appendChild(editBut);
            actionSpan.appendChild(delBut);
            rowHolder.appendChild(actionSpan);
            holder.appendChild(rowHolder);

             //add delete button click listener
             delBut.addEventListener("click",(e)=>{
                alertDialog("Are you sure you want to delete this feature?","Delete",()=>{
                    deleteFeature(feature.id);
                })
            })

            //add eidt button click listener
            editBut.addEventListener("click",(e)=>{
                showFeatureEditForm(holder,feature);
            })
        })
    }
    else{
        const rowHolder = document.createElement("div");
        rowHolder.classList.add("body-row");
        rowHolder.classList.add("shadow-minor");
        const nodata = document.createElement("span");
        nodata.textContent = "No data";
        rowHolder.appendChild(nodata);
        holder.appendChild(rowHolder);
       
    }
    showFeatureForm(holder);
}
const deleteFeature=(featureId)=>{
    fetch(features_url+"/"+featureId,{
        method:"DELETE",headers:{'Content-type':'application/json','Authorization':'Bearer '+currentUser.accessToken}
    })
    .then(res=>{
        if(res.status == 403){
            showFeedback("Your session has expired, please login",1);
        }
        else{
            res.json().then(result=>{
                updateFeatures(result.data);
                showFeedback(result.msg,result.code);
            }).catch(e=>{
                showFeedback(e,1);
            })
        }
    }).catch(e=>{
        console.log(e);
        showFeedback("Something went wrong! Please try again later",1)
    })
}
const updateFeatures = (features)=>{
    if(features && features.length > 0){
        storedData.features = features;
        storage.setItem("data",JSON.stringify(storedData));
        showFeatures();
    }
}
const displayFeaturesGrid = (features,container)=>{
    while(container.hasChildNodes()){
        container.removeChild(container.childNodes[0]);
    }
    const form = document.getElementById("package_form");
    var selected_features = [];
    features.forEach(feature=>{
        if(feature.parent == -1){
            const row = document.createElement("div");
            row.classList.add("row-space");
            const checkBox = document.createElement("span");
            checkBox.textContent = "check_box_outline_blank";
            checkBox.classList.add("material-icons");
            checkBox.classList.add("checkbox");
            checkBox.id = "check_"+feature.id;
            const label = document.createElement("span");
            label.textContent = feature.name;
            row.appendChild(label);
            row.appendChild(checkBox);
            container.appendChild(row);

            checkBox.addEventListener('click',(e)=>{
                if(e.target.textContent == "check_box"){
                    e.target.textContent = "check_box_outline_blank";
                    label.classList.remove("bold");
                    selected_features = selected_features.filter(f=>{
                        return f.id != feature.id;
                    })
                }
                else {
                    e.target.textContent = "check_box";
                    label.classList.add("bold");
                    selected_features.push(feature.id);
                }
            })
        }
       
    });
    if(form){
        var payments = (storedData.billing_cycles)? storedData.billing_cycles:[];
        while(form.billing_term.hasChildNodes()) form.billing_term.removeChild(form.billing_term.childNodes[0]);
        payments.forEach(p=>{
            form.billing_term.options.add(new Option(p.name,p.id));
        });
        
        form.addEventListener("submit",(e)=>{
            e.preventDefault();
            if(selected_features.length > 0){
                let name = form.package_name.value;
                let desc = form.package_description.value;
                let price = form.package_price.value;
                let term = form.billing_term.options[form.billing_term.options.selectedIndex].value;

                let features = selected_features.join(",");
                var data = {name:name,description:desc,price:price,billing_term:term,features:features};
                console.log("data: ",data);
                var options = {
                    method:"POST",body:JSON.stringify(data),headers:{
                        'Content-type':'application/json','Authorization':'Bearer '+currentUser.accessToken
                    }
                }
                fetch(packages_url,options)
                .then(res=>res.json())
                .then(result=>{
                    console.log("packages: ",result);
                    storedData.packages = result.data;
                    storage.setItem("data",JSON.stringify(storedData));
                    showFeedback(result.msg,result.code);
                })
                .catch(er=>{
                    console.log("err: ",er);
                    showFeedback("Something went wrong! Please try again later",1);
                })
            }
            else{
                alertDialog("You have not selected any feature","Create Package",null)
            }
            
        })
       
    }
}
const showPackages = ()=>{
    const container = document.querySelector("#packages");
    while(container.hasChildNodes()){
        container.removeChild(container.childNodes[0]);
    }
    var packages = (storedData.packages) ? storedData.packages : [];
    packages.forEach(package=>{
        var term = storedData.billing_cycles.filter(t=>t.id == package.billing_term)[0];
        const holder = document.createElement("div");
        holder.classList.add("subscription-forms");
        holder.classList.add("shadow");
        const titleHolder = document.createElement("span");
        titleHolder.classList.add("summary-head");
        titleHolder.textContent = package.name;
        holder.appendChild(titleHolder);

        const priceHolder = document.createElement("p");
        priceHolder.classList.add("buttons");
        priceHolder.textContent = thousandSeparator(package.price)+"/Tsh. "+term.name;
        holder.appendChild(priceHolder);

        const descTitleHolder = document.createElement("p");
        descTitleHolder.classList.add("bold");
        descTitleHolder.textContent = "Description";
        holder.appendChild(descTitleHolder);

        const descHolder = document.createElement("p");
        descHolder.textContent = package.description;
        holder.appendChild(descHolder);

        const featuresTitleHolder = document.createElement("p");
        featuresTitleHolder.classList.add("bold");
        featuresTitleHolder.textContent = "Features";
        holder.appendChild(featuresTitleHolder);
        
        const featuresHolder = document.createElement("div");
        featuresHolder.classList.add("features");
        
        package.features.split(",").forEach(feature=>{
            feature = storedData.features.filter(f=>f.id == feature)[0];
            const row = document.createElement("div");
            row.classList.add("row-space");
            const checkBox = document.createElement("span");
            checkBox.textContent = "check_box";
            checkBox.classList.add("material-icons");
            // checkBox.classList.add("checkbox");
            checkBox.id = "check_"+feature.id;
            const label = document.createElement("span");
            label.textContent = feature.name;
            row.appendChild(label);
            row.appendChild(checkBox);
            featuresHolder.appendChild(row);

        })

        holder.appendChild(featuresHolder);
        container.appendChild(holder);       
    });
    
}
const fetchPackages = ()=>{
    fetch(packages_url,{method:"GET",headers:{'Content-type':'application/json','Authorization': 'Bearer '+currentUser.accessToken}})
    .then(res=>res.json())
    .then(result=>{
        storedData.packages = result.data;
        storage.setItem("data",JSON.stringify(storedData));
    })
    .catch(er=>{
        console.log("fetchPackages: ",er);
    })
}
const fetchPaymentTerms = ()=>{
    var options = {
        method:"GET",
        headers:{
            'Content-type':'application/json',
            'Authorization':'Bearer '+currentUser.accessToken
        }
    }
    fetch(payments_url,options)
    .then(res=>res.json())
    .then(result=>{
        storedData.billing_cycles = result.data;
        storage.setItem("data",JSON.stringify(storedData));
    })
    .catch(err=>{
        console.log('fetchPaymentTerms: ',err);
    });
}
//fetch features
const fetchFeatures = ()=>{
    showSpinner();
    return new Promise((resolve,reject)=>{
        var headers = {
            'Content-Type':'application/json',
            'Authorization':'Bearer '+currentUser.accessToken
        }
        
        fetch(features_url,{method:"GET",headers:headers})
        .then(res=>{
            hideSpinner();
            if(res.status == 403){
                showFeedback("Your session expired, please sign in",1);
                signoutUser();
            }
            else {
                res.json().then(result=>{
                    updateFeatures(result.data);
                    resolve(result);
               })
               .catch(e=>{
                   hideSpinner();
                   console.log("e:",e);
                   // showFeedback(e.msg,1)
                   showFeedback("Your session expired, please sign in",1);
                   reject(e);
               })
            }
        })
        .catch(er=>{
            showFeedback(er.msg,er.code);
        })
    })
}
//update Feature
const updateFeature = (data,featureId)=>{
    return new Promise((resolve,reject)=>{
        let url = features_url+"/"+featureId;
        const body = JSON.stringify({name:data.name,description:data.description,label:data.label,parent:data.parent});
        const headers = {
            'Content-type':'application/json',
            'Authorization':'Bearer '+currentUser.accessToken
        }
        const options = {
            method:"PUT",
            body:body,
            headers:headers
        }
        fetch(url,options).then(res=>{
            if(res.status == 403) {
                showFeedback("Your session expired, please login",1);
                // signoutUser();
            }
            else{
                res.json().then(result=>{
                    showFeedback(result.msg,result.code);
                    if(result.code == 0) updateFeatures(result.data);
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
//display system roles
const showRoles = ()=>{
    const holder = document.getElementById("roles-table");
    Array.from(holder.children).forEach(child=>{
        if(child.classList.contains('body-row') || child.id=="add_role_form") holder.removeChild(child);
    })
    var roles = storedData.roles;
    if(roles && roles.length > 0){
        roles.forEach(role=>{
            const rowHolder = document.createElement("div");
            rowHolder.classList.add("body-row");
            rowHolder.classList.add("shadow-minor");
            const roleId = document.createElement("span");
            roleId.textContent = role.name;
            const roleName = document.createElement("span");
            roleName.textContent = role.description;
            rowHolder.appendChild(roleId);
            rowHolder.appendChild(roleName);
            const editBut = document.createElement("span");
            editBut.id = "edit_role_"+role.id;
            editBut.classList.add("material-icons");
            editBut.textContent = "edit";

            const delBut = document.createElement("span");
            delBut.id = "del_role_"+role.id;
            delBut.classList.add("material-icons");
            delBut.textContent = "delete";

            const actionSpan = document.createElement("span");
            actionSpan.classList.add("actions");
            actionSpan.appendChild(editBut);
            actionSpan.appendChild(delBut);
            rowHolder.appendChild(actionSpan);
            holder.appendChild(rowHolder);

             //add delete button click listener
             delBut.addEventListener("click",(e)=>{
                alertDialog("Are you sure you want to delete this role?","Delete",()=>{
                    deleteRole(role.id);
                })
            })

            //add eidt button click listener
            editBut.addEventListener("click",(e)=>{
                showRoleEditForm(holder,role);
            })
        })
    }
    else{
        const rowHolder = document.createElement("div");
        rowHolder.classList.add("body-row");
        rowHolder.classList.add("shadow-minor");
        const nodata = document.createElement("span");
        nodata.textContent = "No data";
        rowHolder.appendChild(nodata);
        holder.appendChild(rowHolder);
       
    }
    showRoleForm(holder);
}
const updateRoles = (roles)=>{
    if(roles && roles.length > 0){
        storedData.roles = roles;
        storage.setItem("data",JSON.stringify(storedData));
        showRoles();
    }
}
//update client role
const updateRole = (data,roleId)=>{
    return new Promise((resolve,reject)=>{
        let url = create_role_url+"/"+roleId;
        const body = JSON.stringify({name:data.name,description:data.description});
        const headers = {
            'Content-type':'application/json',
            'Authorization':'Bearer '+currentUser.accessToken
        }
        const options = {
            method:"PUT",
            body:body,
            headers:headers
        }
        fetch(url,options).then(res=>{
            if(res.status == 403) {
                showFeedback("Your session expired, please login",1);
                // signoutUser();
            }
            else{
                res.json().then(result=>{
                    showFeedback(result.msg,result.code);
                    if(result.code == 0) updateRoles(result.data);
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
                showFeedback("Your session expired, please sign in",1);
                signoutUser();
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
                   showFeedback("Your session expired, please sign in",1);
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
const showRoleForm = (holder)=>{
    const form = document.createElement("form");
    form.method = "post";
    form.id = "add_role_form";
    const inputName = document.createElement("input");
    inputName.type = "text";
    inputName.classList.add("form-control");
    inputName.id="role_name";
    inputName.name = "role_name";
    inputName.placeholder = "Role name";
    form.appendChild(inputName);

    const inputDescription = document.createElement("input");
    inputDescription.type = "text";
    inputDescription.classList.add("form-control");
    inputDescription.id="role_description";
    inputDescription.name = "role_description";
    inputDescription.placeholder = "Role description";
    form.appendChild(inputDescription);

    const inputSubmit = document.createElement("input");
    inputSubmit.type = "submit";
    inputSubmit.classList.add("button-s");
    inputSubmit.classList.add("no-corner");
    inputSubmit.id="btnSubmitRole";
    inputSubmit.name = "btnSubmitRole";
    inputSubmit.value = "Add Role";
    form.appendChild(inputSubmit);
    holder.appendChild(form);
    // holder.appendChild(rowHolder);

     form.addEventListener('submit',(e)=>{
             e.preventDefault();
        let roles = (storedData.roles) ? storedData.roles : [];
        let name = inputName.value.trim();
        let description = inputDescription.value.trim();
        let permission = "1,2";//roleForm.permission.value.trim();
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
            else{
                res.json()
                .then(result=>{
                    if(result.data !== null && result.data.length > 0) {
                        roles = result.data;
                        showFeedback(result.msg,0);
                        updateRoles(roles);
                        
                    }
                    // cancelAddRoleForm();
                }).catch(e=>{
                    showFeedback(e.msg,1);
                })
            }

        })
        .catch(e=>{
            console.log("e: ",e);
            showFeedback(e,1);
        })
    
    })

    
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
            hideSpinner();
            if(response.status == 403){
                showFeedback("Your session has expired. Please login again",1);
                signoutUser();
                reject({code:1,msg:"Your session has expired. Please login again"});
            }
            else{
                response.json()
                    .then(result=>{
                        storedData.clients = result.data;
                        // console.log("fetch: ",data.clients);
                        storage.setItem("data",JSON.stringify(storedData));
                        resolve(result.data);
                    })
                    .catch(e=>{
                        console.log("eer: ",e);
                        showFeedback(e.msg,e.code);
                        reject(e);    
                    });
            }
        })
        .catch(e=>{
            reject(e);
        })
    })
}

//update clients
const updateClients = (clients)=>{
    console.log("test: ",clients);
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

//draw map
const mapChart = ()=>{
//    let randomData = generateRandomData(am4geodata_worldLow.features.length);
//    let x = storedData.clients.
   let myData = am4geodata_worldLow;
   let newFeatures = am4geodata_worldLow.features.map((feature,index)=>{
       var feat = feature;
       feat.properties.value = 0;
       storedData.clients.forEach(client=>{
           if(feature.properties.name.toLowerCase() == client.country.toLowerCase()) feat.properties.value ++;
       })
       
       feat.properties.fill = (feat.properties.value ==0) ? am4core.color("#ffcc00") : am4core.color("#cc9900");
       return feat;
   })
   myData.features = newFeatures;
    // Low-detail map
    var chart = am4core.create("map-chart", am4maps.MapChart);
    chart.geodata = myData;
    chart.projection = new am4maps.projections.Miller();
    var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
    polygonSeries.useGeodata = true;
    polygonSeries.mapPolygons.template.events.on("doublehit", function(ev) {
    chart.zoomToMapObject(ev.target);
    });
    polygonSeries.mapPolygons.template.events.on("hit", function(ev) {
        chart.zoomToMapObject(ev.target,-1,true,1000);
        });
    var label = chart.chartContainer.createChild(am4core.Label);
    label.text = "Clients Distribution";
    // Configure series
    var polygonTemplate = polygonSeries.mapPolygons.template;
    polygonTemplate.tooltipText = "{name}:{value}";
    polygonTemplate.propertyFields.fill = "fill";

    // Create hover state and set alternative fill color
    var hs = polygonTemplate.states.create("hover");
        hs.properties.fill = am4core.color("#644c04");
}

//refresh user
const refreshUser=()=>{
    console.log("refreshed user");
}
const showUserProfile=()=>{
    if(currentUser.id === 0){
        alert("settings admin");
    }
    else{
        showProfile();
    }
}

//handle arrow drop down and menus

let signoutId = "#signout";
let profileId = "#profile";
const profile = document.querySelector(profileId);
const signout = document.querySelector(signoutId);
const arrowDrop = document.getElementById("arrow-drop");
if(arrowDrop){
    const dropDown = document.querySelector("#drop-down");
    arrowDrop.addEventListener('click',(e)=>{
        showHideDropDown(dropDown,arrowDrop);
    });
}
if(signout){
    signout.addEventListener('click',(e)=>{
        e.preventDefault();
        alertDialog("Are you sure you want to sign out?","signout",()=>{
            signoutUser();
        })
    });
}
if(profile){
    profile.addEventListener('click',(e)=>{
        showUserProfile();
    })
}


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
            client.address.toLowerCase().includes(keyword)||
            client.country.toLowerCase().includes(keyword)
        })
    }
    return clients;
}
//populate client details
const populateClientDetails = (form,client)=>{
    var detail = client.detail;
    form.email.value = client.email;
    if(detail){
        form.company_name.value = detail.name;
        form.client_id.value = detail.id;
        form.address.textContent = detail.address;
        form.contact_person.value = detail.contact_person;
        form.contact_email.value = detail.contact_email;
        form.phone.value= detail.phone;
        form.country.value = detail.country;
        form.region.value = detail.region;
      
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

            // initializeMap(document.getElementById("map-add"),detailForm.address,detailForm);
            detailForm.addEventListener('submit',(e)=>{
                e.preventDefault();
    
                let name   = detailForm.company_name.value;
                let email  = detailForm.email.value;
                let phone  = detailForm.phone.value;
                let person = detailForm.contact_person.value;
                let cemail = detailForm.contact_email.value;
                let address= detailForm.address.value;
                let file = detailForm.company_logo.files[0];
                let country = detailForm.country.value;
                let region = detailForm.region.value;
                let code = detailForm.code.value;
                let tin = detailForm.tin.value;
                let logoFile = null;
                let datas = {
                    tin:tin,
                    code:code,
                    region:region,
                    country:country,
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
                            showFeedback(result.msg,result.code);
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
       
       
    }
}

