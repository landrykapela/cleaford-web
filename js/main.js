const storage = window.localStorage;
const clientSummaryCount = 5;
var currentUser = (storage.getItem("currentUser")) ? JSON.parse(storage.getItem("currentUser")):null;
var storedData = (storage.getItem("data")) ? JSON.parse(storage.getItem("data")):{regions:[],client_roles:[],clients:[],roles:[]};
const countryList = [
    "Afghanistan",
    "Åland Islands",
    "Albania",
    "Algeria",
    "American Samoa",
    "Andorra",
    "Angola",
    "Anguilla",
    "Antarctica",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Aruba",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas (the)",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bermuda",
    "Bhutan",
    "Bolivia",
    "Bonaire",
    "Bosnia and Herzegovina",
    "Botswana",
    "Bouvet Island",
    "Brazil",
    "Brunei Darussalam",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cabo Verde",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Cayman Islands",
    "Central African Republic",
    "Chad",
    "Chile",
    "China",
    "Christmas Island",
    "Cocos Islands",
    "Colombia",
    "Comoros",
    "Congo (DRC)",
    "Congo",
    "Cook Islands",
    "Costa Rica",
    "Croatia",
    "Cuba",
    "Curaçao",
    "Cyprus",
    "Czechia",
    "Côte d'Ivoire",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Eswatini",
    "Ethiopia",
    "Falkland Islands",
    "Faroe Islands",
    "Fiji",
    "Finland",
    "France",
    "French Guiana",
    "French Polynesia",
    "French Southern Territories ",
    "Gabon",
    "Gambia (the)",
    "Georgia",
    "Germany",
    "Ghana",
    "Gibraltar",
    "Greece",
    "Greenland",
    "Grenada",
    "Guadeloupe",
    "Guam",
    "Guatemala",
    "Guernsey",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Honduras",
    "Hong Kong",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Isle of Man",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jersey",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Korea",
    "North Korea",
    "Kuwait",
    "Kyrgyzstan",
    "Lao",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Macao",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Martinique",
    "Mauritania",
    "Mauritius",
    "Mayotte",
    "Mexico",
    "Micronesia",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Montserrat",
    "Morocco",
    "Mozambique",
    "Myanmar",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "New Caledonia",
    "New Zealand",
    "Nicaragua",
    "Niger (the)",
    "Nigeria",
    "Niue",
    "Norfolk Island",
    "Northern Mariana Islands",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Palestine, State of",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Pitcairn",
    "Poland",
    "Portugal",
    "Puerto Rico",
    "Qatar",
    "Republic of North Macedonia",
    "Romania",
    "Russian Federation (the)",
    "Rwanda",
    "Réunion",
    "Saint Barthélemy",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Martin (French part)",
    "Saint Pierre and Miquelon",
    "Saint Vincent and the Grenadines",
    "Samoa",
    "San Marino",
    "Sao Tome and Principe",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Sint Maarten (Dutch part)",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "South Africa",
    "South Georgia",
    "South Sudan",
    "Spain",
    "Sri Lanka",
    "Sudan (the)",
    "Suriname",
    "Svalbard and Jan Mayen",
    "Sweden",
    "Switzerland",
    "Syrian Arab Republic",
    "Taiwan",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Timor-Leste",
    "Togo",
    "Tokelau",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Turks and Caicos Islands",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates (the)",
    "United Kingdom",
    "United States of America",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Venezuela",
    "Viet Nam",
    "Virgin Islands (British)",
    "Virgin Islands (U.S.)",
    "Wallis and Futuna",
    "Western Sahara",
    "Yemen",
    "Zambia",
    "Zimbabwe"
  ];
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

//load countries
const loadCountries = (selectElement)=>{
    if(selectElement){
        Array.from(selectElement.childNodes).forEach(child=>{
            selectElement.removeChild(child);
        })
        countryList.forEach(country=>{
            selectElement.options.add(new Option(country));
        })
    
    }
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

//load regions
const loadRegions = (selectElement)=>{
    if(selectElement){
        Array.from(selectElement.childNodes).forEach(child=>{
            selectElement.removeChild(child);
        })
        let regions = (storedData.regions) ? storedData.regions : ["Dar es Salaam"];
        regions.forEach(region=>{
            selectElement.options.add(new Option(region));
        })
    
    }
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
                activateMenu(e.target.id);
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
        // document.getElementById(target+"_content").classList.remove("hidden");
    });
    const menu = document.getElementById(target);
    //get and display data as per selected menu item
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
            case 'roles':
                greet("Roles",{title:"Roles",description:"Manage roles"});
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
            submit.classList.remove("hidden");
            if(spinner) spinner.classList.add("hidden");
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


    fetchRegions();

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
    initializeMap(document.getElementById("map-edit"),updateForm.address,updateForm);
    activateMenu('edit_client');
    document.getElementById(source).classList.add("hidden");
    document.querySelector("#edit_client_content").classList.remove("hidden");
    document.getElementById("btnCancelEdit").addEventListener('click',()=>{
        closeClientForm('edit_client_content');
    })

         document.getElementById("btnCancelEdit").addEventListener('click',()=>{
         closeClientForm('edit_client_content');
         });
         initializeMap(document.getElementById("map-edit"),updateForm.address,updateForm);
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
             let file = updateForm.company_logo.files[0];
             

             let client = storedData.clients.filter(c=>c.id == id);
             let logoFile = client.logo;
             let newData = {
                 region:region,
                 country:country,
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
            //  .then(res=>{
            //     if(res.status == 403){
            //         showFeedback("Session expired, please login",1);
            //         signoutUser();
            //     }
            //     else{
            //         res.json().then(result=>{
            //             updateCustomers(result.data);
            //             showFeedback(result.msg,result.code);
            //             closeCustomerForm('edit_customer_content')
            //         })
            //         .catch(err=>{
            //             showFeedback(err.msg,err.code);
            //         })
            //     }
            // })
            // .catch(e=>{
            //     showFeedback(e.msg,e.code);
            // })


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
        companyAddress.textContent = row.address;
        companyLocation.textContent = (row.country.toLowerCase() == 'tanzania') ? row.region:row.country;
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
        companyAddress.textContent = (row.country.toLowerCase() == 'tanzania') ? row.region:row.country;
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
const settings = document.querySelector(profileId);
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
        if(confirm("Are you sure you want to sign out?")){
            signoutUser();
        }
        else{
            console.log("no singout");
        }
    });
}
if(profile){
    profile.addEventListener('click',(e)=>{
        showUserProfile();
    })
}

//listen to window events
document.addEventListener('mouseup',(e)=>{
    
    var dropDown = document.getElementById("drop-down");
    var arrowDrop = document.getElementById("arrow-drop");
    if(!dropDown.contains(e.target)) {
        dropDown.classList.add("hidden");
        arrowDrop.innerHTML = "arrow_drop_down";
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
        if(detail.country && detail.country.toLowerCase() == 'tanzania') {
            document.querySelector("#region-group").classList.remove("hidden");
            loadRegions(form.region);
            form.region.value = detail.region;
        }
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

            initializeMap(document.getElementById("map-add"),detailForm.address,detailForm);
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
                let logoFile = null;
                let datas = {
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

