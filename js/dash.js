const storage = window.localStorage;
const clientSummaryCount = 5;
const CONSIGNMENT_NUMBER_FORMAT = 6;
var currentUser = (storage.getItem("currentUser")) ? JSON.parse(storage.getItem("currentUser")):null;
var storedData = (storage.getItem("data")) ? JSON.parse(storage.getItem("data")):{roles:[],client_roles:[],customers:[],roles:[]};

const originalSetItem = localStorage.setItem;

localStorage.setItem = function(key, value) {
  const event = new Event('updateData');
  event.value = value; // Optional..
  event.key = key; // Optional..
  document.dispatchEvent(event);

  originalSetItem.apply(this, arguments);
};


const arrayToCSV = (sourceArray)=>{
    let source = (typeof sourceArray != 'object') ? JSON.parse(sourceArray) : sourceArray;
    let output = "";
    Object.keys(source[0]).forEach(key=>{
        output += key+",";
    })
    output += "\r\n";
    source.forEach(object=>{
        let line = "";
        Object.values(object).forEach(value=>{
            line += value+","
        })
        line += "\r\n";
        output += line;
    });
    return output;
}
if(window.location.pathname == "/signin.html"){
    storage.setItem("data",JSON.stringify({}));
    storage.setItem("currentUser",null);
}
//arrow drop

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
//update user profile image
const updateUserProfile = ()=>{
    const preview = document.querySelector("#account-image");
    const inputImage = document.querySelector("#image-file");
    inputImage.click();

    inputImage.addEventListener('change',(e)=>{
        var file = inputImage.files[0];
        if(file){
            var reader = new FileReader();
            reader.addEventListener('load',()=>{
                if(reader.readyState == 2 && reader.result != null){

                    preview.src = reader.result;
                    uploadUserImage(reader.result)
                    .then(response=>{
                        if(response.data != null){
                            currentUser.avatar = response.data.avatar;
                            storage.setItem("currentUser",JSON.stringify(currentUser));
                        }
                        showFeedback(response.msg,response.code);
                        console.log(response);
                    })
                    .catch(e=>{
                        console.log(e);
                        showFeedback(e.msg,e.code);
                    })
                }
            },false);

            reader.readAsDataURL(file);
        }
    });
}
const showHideSubmenu = (menuId)=>{
    var subMenu = document.getElementById(menuId+"_submenu");
    var dropArrow = document.getElementById(menuId+"_drop");

    subMenu.classList.toggle("hidden");
    dropArrow.textContent = subMenu.classList.contains("hidden") ? "arrow_drop_down" : "arrow_drop_up";
}
//display system roles
const showClientRoles = ()=>{
    const holder = document.getElementById("roles-table");
    Array.from(holder.children).forEach(child=>{
        if(child.classList.contains('body-row') || child.id=="add_role_form") holder.removeChild(child);
    })
    var roles = storedData.client_roles;
    if(roles && roles.length > 0){
        roles = roles.map(r=>{
            storedData.roles.forEach(ro=>{
                if(r.level == ro.id) r.role_level = ro.name;
                
            });
            return r;
        })
        roles.forEach(role=>{
            const rowHolder = document.createElement("div");
            rowHolder.classList.add("body-row");
            rowHolder.classList.add("shadow-minor");
            const roleId = document.createElement("span");
            roleId.textContent = role.name;
            const roleName = document.createElement("span");
            roleName.textContent = role.description;
            const roleLevel = document.createElement("span");
            roleLevel.textContent = role.role_level;

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

            
            rowHolder.appendChild(roleId);
            rowHolder.appendChild(roleName);
            rowHolder.appendChild(roleLevel);
            rowHolder.appendChild(actionSpan);
            holder.appendChild(rowHolder);

            //add delete button click listener
            delBut.addEventListener("click",(e)=>{
                alertDialog("Are you sure you want to delete this role?","Delete",()=>{
                    deleteClientRole(role.id);
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

//delete client role
const deleteClientRole =(role_id)=>{
  
    fetch(client_roles+"/"+currentUser.id+"/"+role_id,{
        method:"DELETE",headers:{'Content-type':'application/json','Authorization':'Bearer '+currentUser.accessToken}
    })
    .then(res=>{
        if(res.status == 403){
            showFeedback("Your session has expired, please login",1);
        }
        else{
            res.json().then(result=>{
                updateClientRoles(result.data);
                showClientRoles();
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
                
                break;
            case 'profile':
                greet("Profile",{title:"Profile",description:"Account information"});
                showProfile();
                break;
            case 'users':
                greet("Settings",{title:"Users",description:"Manage users"});
                
                break;
                case 'exports':
                    showConsignment();
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
                else showClientRoles();
                break;
            case 'dashboard':
                greet("Hello Admin",null);
                showDashboard();
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

const activateEticket =(target)=>{
    const eticketMenu = document.querySelector("#etickets");
    const items = Array.from(eticketMenu.children);
    items.forEach(i=>{

    //unselect all sidebar menu items
        if(i.classList.contains("eticket-active")){
            i.classList.remove("eticket-active");
        } 

    });

    //activate currently selected item and show it's content
    items.forEach(item=>{  
        if(item.id == target) {
            item.classList.add("eticket-active");
            // var cont = document.getElementById(target+"_content");
            // if(cont) cont.classList.remove("hidden");
        }      
        // document.getElementById(target+"_content").classList.remove("hidden");
    });
    const menu = document.getElementById(target);
}
const getActiveEticket =()=>{
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
    if(currentUser.detail){
        getCustomers().then(result=>{
            updateCustomers(result.data);
            greet("Hello "+currentUser.detail.contact_person.split(" ")[0],null);
            const numberOfCustomers = document.getElementById("no_of_customers");
            numberOfCustomers.textContent = (storedData.customers) ? storedData.customers.length:0; 

            //show charts and maps
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
                    responsive:true,
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
        
            // showCustomersSummary();
            mapChart();
        }).catch(er=>{
            if(er.code == -1){
                showFeedback(er.msg,1);
                signoutUser();
            }
            else{
                console.log("stw: ",er);
                showFeedback("something wrong",1);
            }
        })             
    }
    else{
        greet("Hello "+currentUser.email,null);
    }
    //show client summary
    fetchClientRoles();
    fetchConsignments().then(result=>{
        storedData.consignments = result.data;
        storage.setItem("data",JSON.stringify(storedData));
        storedData = JSON.parse(storage.getItem("data"));
        var consignments = (storedData.consignments) ? storedData.consignments : [];
        const numberOfConsignments = document.getElementById("no_of_consignments");
        numberOfConsignments.textContent = consignments.length;
    })
   
}

//show profile
const showProfile = ()=>{
    document.getElementById("profile_content").classList.remove("hidden");
    
    if(currentUser){
        document.querySelector("#account-name").textContent = currentUser.email;
        let source = (currentUser.avatar) ? currentUser.avatar :"/img/favicon.png";
        document.querySelector("#account-image").src = source;
        document.querySelector("#avatar").src = source;
    }
   
        
}
//show dashboard
const showDashboard = ()=>{
    window.location.pathname = "/dashboard/";
}
//cpature client details
const showCustomerDetailForm = (source)=>{
    const sourceContent = document.getElementById(source);
    const clientForm = document.querySelector("#add_customer_content");
    sourceContent.classList.add("hidden");
    clientForm.classList.remove("hidden");
    greet("Customers",{title:"Customers",description:"Add customer"});
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
        showCustomerDetailForm('');
    })
    .catch(er=>{
        console.log("errr: ",er);
        showFeedback(err.msg,1);
    })
}
const showConsignment = ()=>{
    document.querySelector("#export_form").classList.add("hidden");
    greet("Operations",{title:"Export",description:"Export consignments"});
    var consignments = (storedData.consignments) ? storedData.consignments : [];
    if(consignments.length == 0){
        fetchConsignments().then(result=>{
            storedData.consignments = result.data;
            storage.setItem("db",JSON.stringify(storedData));
            showExportList(result.data);
        })
    }
    else showExportList(storedData.consignments);
}
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
const editCustomerDetail = (customer,source)=>{
    const editForm = document.querySelector("#edit_customer_form");
    editForm.customer_id.value = customer.id;
    editForm.company_name.value = customer.name;
    editForm.address.value =  customer.address;
    editForm.email.value = customer.email;
    editForm.contact_person.value = customer.contact_person;
    editForm.phone.value = customer.phone;
    editForm.contact_email.value = customer.contact_email;
    editForm.region.value = customer.region;
    editForm.country.value = customer.country;
    editForm.tin.value = customer.tin;

    initializeMap(document.getElementById("map-edit"),editForm.address,editForm);

    activateMenu('edit_customer');
    document.getElementById(source).classList.add("hidden");
    document.querySelector("#edit_customer_content").classList.remove("hidden");
    document.getElementById("btnCancelEdit").addEventListener('click',()=>{
        closeCustomerForm('edit_customer_content');
    });

    editForm.addEventListener("submit",(e)=>{
        e.preventDefault();
        let id = customer.id;
        let name = (editForm.company_name.value) ? editForm.company_name.value : customer.name;
        let address = (editForm.address.value) ? editForm.address.value : customer.address;
        let email = (editForm.email.value) ? editForm.email.value : customer.email;
        let phone = (editForm.phone.value) ? editForm.phone.value : customer.phone;
        let country = (editForm.country.value) ? editForm.country.value : customer.country;
        let region = (editForm.region.value) ? editForm.region.value: customer.region;
        let contact_person = (editForm.contact_person.value) ? editForm.contact_person.value : customer.contact_person;
        let contact_email = (editForm.contact_email.value) ? editForm.contact_email.value : customer.contact_email;
        let tin = (editForm.tin.value) ? editForm.tin.value : customer.tin;
        let data = {
            user:currentUser.id,
            name:name,
            address:address,
            email:email,
            phone:phone,
            country:country,
            region:region,
            contact_person:contact_person,
            contact_email:contact_email,
            tin:tin
        };
        let headers = {
            'Content-Type':'application/json',
            'Authorization': 'Bearer '+currentUser.accessToken
        }
        let options = {
            method:"PUT",
            body:JSON.stringify(data),
            headers:headers
        }

        let update_customer_url = create_customer_url+"/"+id;
        fetch(update_customer_url,options)
            .then(res=>{
                if(res.status == 403){
                    showFeedback("Session expired, please login",1);
                    signoutUser();
                }
                else{
                    res.json().then(result=>{
                        updateCustomers(result.data);
                        showFeedback(result.msg,result.code);
                        closeCustomerForm('edit_customer_content')
                    })
                    .catch(err=>{
                        showFeedback(err.msg,err.code);
                    })
                }
            })
            .catch(e=>{
                showFeedback(e.msg,e.code);
            })
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
const createCustomerRow = (row,holder)=>{
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
        companyAddress.textContent = row.address.split(",")[0];
        companyLocation.textContent = row.region+", "+row.country;
        companyPhone.textContent = row.phone;
        contactName.textContent = row.contact_person;
        contactEmail.textContent = row.email;

        rowHolder.appendChild(companyName);
        rowHolder.appendChild(companyAddress);
        rowHolder.appendChild(companyLocation);
        rowHolder.appendChild(companyPhone);
        rowHolder.appendChild(contactName);
        rowHolder.appendChild(contactEmail);
    }

    holder.appendChild(rowHolder);
     //add click listener
     rowHolder.addEventListener('click',()=>{
        editCustomerDetail(row,'customers_content');
    })
}
const createCustomerSummaryRow = (row)=>{
    const holder = document.querySelector("#customer_table_summary");
    const rowHolder = document.createElement("div");
    rowHolder.classList.add("body-row");
    rowHolder.classList.add("shadow-minor");
    if(row == null){
        const data = document.createTextNode("No customers");
        rowHolder.appendChild(data);
    }
    else{
        const companyName = document.createElement("span");
        // const companyAddress = document.createElement("span");
        const companyLocation = document.createElement("span");
        // const contactEmail = document.createElement("span");
        const contactPhone = document.createElement("span");
        // const companyStatus = document.createElement("span");

        companyName.textContent = row.name;
        companyName.id = row.id;
        // companyAddress.textContent = row.address;
        companyLocation.textContent = (row.country.toLowerCase() == "tanzania") ? row.region: row.country;
        // contactEmail.textContent = row.contact_email;
        contactPhone.textContent = row.phone;
        // companyStatus.textContent = row.status == 0 ? 'Pending Activation' : "Activated";

        rowHolder.appendChild(companyName);
        // rowHolder.appendChild(companyAddress);
        rowHolder.appendChild(companyLocation);
        // rowHolder.appendChild(contactEmail);
        rowHolder.appendChild(contactPhone);

        //add click listener
        companyName.addEventListener('click',()=>{
            editCustomerDetail(row,'dashboard_content');
        })
    }

    holder.appendChild(rowHolder);
}
const formatConsignmentNumber = (number)=>{
    var num = number.toString();
    var diff = CONSIGNMENT_NUMBER_FORMAT - num.length;
    var pref = "";
    if(diff > 0){
        for(let i=0;i<diff;i++){
            pref +="0";
        }
        num = pref +num;
    }
    return num;
}
//showCustomers
const showCustomers = (data)=>{
    // activateMenu('customers');
    const holder = document.querySelector("#customers_table_summary");  
    Array.from(holder.children).forEach(child=>{
        if(child.classList.contains("body-row")) holder.removeChild(child);
    })  
    if(!data || data.length == 0){
        createCustomerRow(null,holder);
    }
    else{
        Array.from(holder.children).forEach(child=>{
            if(child.classList.contains("body-row")) holder.removeChild(child);
        })
        data.forEach(row=>{
            createCustomerRow(row,holder);
        });
        // arrayToCSV(data);
    }
}
//show export list
const showExportList = (data,source=null)=>{
    if(source != null) {
        var mySource = document.getElementById(source);
        mySource.classList.add("hidden");
        
    }
    else{
        var mySource = document.getElementById("export_form");
        mySource.classList.add("hidden");
        
        Array.from(document.getElementsByClassName("consignment-forms")).forEach(child=>{
            // console.log("tagname: ",Array.from(child.children)[0].tagName);
            Array.from(child.children).forEach(c=>{
                if(c.tagName.toLowerCase() == "form") c.reset();
            })
            // if(Array.from(child.children)[0].tagName.toLowerCase() == "form") Array.from(child.children)[0].reset;
        })
    }
    document.querySelector("#add_export").classList.remove("hidden");
    var parent = document.querySelector("#export_list");
    parent.classList.remove("hidden");
    Array.from(parent.children).forEach(child=>{
        if(child.classList.contains("consignment-row")) parent.removeChild(child);
    });

    if(data && data.length > 0){
        data.forEach(d=>{
            const row = document.createElement("span");
            row.classList.add("consignment-row");
            row.classList.add("shadow-minor");
            row.classList.add("status-indicator-"+d.status);
            const consNo = document.createElement("span");
            consNo.textContent = formatConsignmentNumber(d.id);
            row.appendChild(consNo);
    
            const shippingLine = document.createElement("span");
            shippingLine.textContent = (d.shipping_details) ? d.shipping_details.shipping_line : "N/A";
            row.appendChild(shippingLine);
    
            const vesselName = document.createElement("span");
            vesselName.textContent = (d.shipping_details) ? d.shipping_details.vessel_name : "N/A";
            row.appendChild(vesselName);
            
            const eta = document.createElement("span");
            let tcd = "";
            if(d.shipping_details){
                let date = new Date(d.shipping_details.terminal_carry_date);
                tcd += (1+ date.getMonth())+"/"+date.getDate()+"/"+date.getFullYear();
            }
            else tcd = "N/A";
            eta.textContent = tcd;
            row.appendChild(eta);
    
            const destinationPort = document.createElement("span");
            destinationPort.textContent = (d.port_of_discharge) ? d.port_of_discharge : "N/A";
            row.appendChild(destinationPort);
    
            const consStatus = document.createElement("span");
            consStatus.textContent = (d.status_text) ? d.status_text : "N/A";
            row.appendChild(consStatus);

            const tancisStatus = document.createElement("span");
            tancisStatus.textContent = (d.tancis_status) ? d.tancis_status : "N/A";
            row.appendChild(tancisStatus);

            parent.appendChild(row);

            row.addEventListener("click",(e)=>{
                console.log("clicked data: ",d);
                showConsignmentForm("export_list",d);
            })
        })
       
    }
    else{
        const row = document.createElement("span");
        row.classList.add("consignment-row");
        row.classList.add("shadow-minor");
        row.textContent = "No Consignments";
        parent.appendChild(row);
    }
}

//close consignmentForm
const closeConsignmentForm = ()=>{
    document.querySelector("#add_export").classList.remove("hidden");
    document.querySelector("#export_form").classList.add("hidden");
    document.querySelector("#export_list").classList.remove("hidden");
}
//show consignment form
const showConsignmentForm=(source,data=null)=>{
    const progressSteps = Array.from(document.getElementById("progress-card-1").children);
    progressSteps.forEach((step,index)=>{
        step.addEventListener("click",(e)=>{
            switchSteps(index+1,data);
        })
    })
    document.querySelector("#add_export").classList.add("hidden");
    document.getElementById(source).classList.add("hidden");
    const parent = document.getElementById("export_form");
    parent.classList.remove("hidden");
    var position = (data == null) ? 1: data.status;
    switchSteps(position,data);

    
}

//switch steps
const switchSteps = (position,data)=>{
    var progressSteps = Array.from(document.getElementById("progress-card-1").children);
    progressSteps.forEach((step)=>{
        step.classList.remove("current");
    });
    progressSteps[position-1].classList.add("current");
    switchDetails(position,data);
}
//switch consignment forms
const switchDetails = (index,data)=>{
    Array.from(document.getElementsByClassName("consignment-details")).forEach(d=>{
        if(d.id.split("_")[1] == index) d.classList.remove("hidden");
        else d.classList.add("hidden");
    });
   
    if(index == 1){
        var collapseButtons = Array.from(document.getElementsByClassName("summary-head"));
        collapseButtons.filter(b=>b.hasChildNodes()).forEach(but=>{
            if(but){
                Array.from(but.children).forEach(span=>{
                    if(span.classList.contains("material-icons")){
                        span.addEventListener("click",(e)=>{
                            let target = e.target.id.split("_")[0];
                            var collapsible = document.getElementById(target+"_collapsible");
                            collapsible.classList.toggle("hidden");
                            e.target.textContent = (collapsible.classList.contains("hidden")) ? "add" : "remove";
                        })
                    }
                })
            }
        });
        var newData = (data == null) ? {} : data;
        var uploadShippingInstructionsButton = document.getElementById("upload_shipping_instructions");
        var shippingInstructionsInput = document.getElementById("file_shipping_instructions");
        var shippingInstructionsLink = document.getElementById("link_shipping_instructions");
        if(data != null){
            if(data.files.length > 0){
                let shippingInstructionsFiles = data.files.filter(f=>f.name == "shipping instructions");
                if(shippingInstructionsFiles.length > 0) {
                    shippingInstructionsLink.href = files_url+"/"+shippingInstructionsFiles[0].filename;
                    shippingInstructionsLink.textContent = "View Shipping Instructions";
                }
                else{
                    shippingInstructionsLink.href = "";
                    shippingInstructionsLink.textContent = "";
                }
            }
            else{

                shippingInstructionsLink.href = "";
                shippingInstructionsLink.textContent = "";
            }
        }
        uploadShippingInstructionsButton.addEventListener("click",(e)=>{
            shippingInstructionsInput.click();

            shippingInstructionsInput.addEventListener('change',(e)=>{
                if(shippingInstructionsInput.files[0]){
                var urlObj = URL.createObjectURL(shippingInstructionsInput.files[0]);
                shippingInstructionsLink.href = urlObj;
                shippingInstructionsLink.textContent = "View Shipping Instructions";

                var reader = new FileReader();
                reader.addEventListener("load",()=>{
                    newData.instructions_file = reader.result;
                },false);
                reader.readAsDataURL(shippingInstructionsInput.files[0]);
                }
            })
            
        })
        var consignmentDataForm = document.getElementById("consignment_form");

        if(consignmentDataForm){
            var customerSelect = document.getElementById("customer_select");
            var selectedCustomer;
            if(customerSelect){
                while(customerSelect.hasChildNodes())customerSelect.removeChild(customerSelect.childNodes[0]);
                var customers = (storedData.customers) ? storedData.customers : [];
                customers.forEach(customer=>{
                    customerSelect.options.add(new Option(customer.name,customer.id));
                });
                customerSelect.options.add(new Option("--add new customer--",-1));
                
                customerSelect.addEventListener("change",(e)=>{
                    if(e.target.value == -1) showCustomerDetailForm('exports_content');
                    else{
                        selectedCustomer = customers.filter(c=>{
                            return c.id == customerSelect.options[customerSelect.options.selectedIndex].value;
                        })[0];
            
                        consignmentDataForm.exporter_phone.value = selectedCustomer.phone;
                        consignmentDataForm.exporter_name.value = selectedCustomer.name;
                        consignmentDataForm.exporter_address.value = selectedCustomer.address+"\n\r"+selectedCustomer.region+","+selectedCustomer.country;
                        consignmentDataForm.exporter_tin.value = selectedCustomer.tin;
                    //     notifierForm.notify_address.value = selectedCustomer.address+"\n\r"+selectedCustomer.region+","+selectedCustomer.country;
                    //     notifierForm.notify_phone.value = selectedCustomer.phone
                    }
                    
                });   
            }
            if(data != null){
                consignmentDataForm.cargo_classification.value = data.cargo_classification;
                consignmentDataForm.place_of_destination.value = data.place_of_destination;
                consignmentDataForm.place_of_delivery.value = data.place_of_delivery;
                consignmentDataForm.port_of_discharge.value = data.port_of_discharge;
                consignmentDataForm.port_of_origin.value = data.port_of_origin;
                consignmentDataForm.no_of_containers.value = data.no_of_containers;
                consignmentDataForm.goods_description.value = data.goods_description;
                consignmentDataForm.no_of_packages.value = data.no_of_packages;
                consignmentDataForm.package_unit.value = data.package_unit;
                consignmentDataForm.gross_weight.value = data.gross_weight;
                consignmentDataForm.gross_weight_unit.value = data.gross_weight_unit;
                consignmentDataForm.gross_volume.value = data.gross_volume;
                consignmentDataForm.gross_volume_unit.value = data.gross_volume_unit;
                consignmentDataForm.net_weight.value = data.net_weight;
                consignmentDataForm.net_weight_unit.value = data.net_weight_unit;
                consignmentDataForm.invoice_value.value = data.invoice_value;
                consignmentDataForm.invoice_currency.value = data.invoice_currency;
                consignmentDataForm.freight_charge.value = data.freight_charge;
                consignmentDataForm.freight_currency.value = data.freight_currency;
                consignmentDataForm.imdg_code.value = data.imdg_code;
                consignmentDataForm.packing_type.value = data.packing_type;
                consignmentDataForm.oil_type.value = data.oil_type;
                consignmentDataForm.shipping_mark.value = data.shipping_mark;
                consignmentDataForm.consignee_name.value = data.consignee_name;
                consignmentDataForm.consignee_phone.value = data.consignee_phone;
                consignmentDataForm.consignee_address.value = data.consignee_address;
                consignmentDataForm.consignee_tin.value = data.consignee_tin;
                consignmentDataForm.notify_name.value = data.notify_name;
                consignmentDataForm.notify_phone.value = data.notify_phone;
                consignmentDataForm.notify_address.value = data.notify_address;
                consignmentDataForm.notify_tin.value = data.notify_tin;
                consignmentDataForm.forwarder_name.value = currentUser.detail.name;
                consignmentDataForm.forwarder_address.value = currentUser.detail.address;
                consignmentDataForm.forwarder_phone.value = currentUser.detail.phone;
                consignmentDataForm.forwarder_code.value = (data && data.forwarder_code) ? data.forwarder_code: currentUser.detail.code;
                consignmentDataForm.customer_select.value = data.exporter_id;
                
                
                selectedCustomer = customers.filter(c=>c.id == data.exporter_id)[0];
                    if(selectedCustomer !=null ){
                        consignmentDataForm.exporter_phone.value = selectedCustomer.phone;
                        consignmentDataForm.exporter_name.value = selectedCustomer.name;
                        consignmentDataForm.exporter_address.value = selectedCustomer.address;
                        consignmentDataForm.exporter_tin.value = selectedCustomer.tin;
                
                    }
                
            }
            else{
                selectedCustomer = customers[0];
                if(selectedCustomer !==null){
                    consignmentDataForm.exporter_phone.value = selectedCustomer.phone;
                    consignmentDataForm.exporter_name.value = selectedCustomer.name;
                    consignmentDataForm.exporter_address.value = selectedCustomer.address;
                    consignmentDataForm.exporter_tin.value = selectedCustomer.tin;
            
                }
                consignmentDataForm.forwarder_code.value = currentUser.detail.code;consignmentDataForm.forwarder_code.value = currentUser.detail.code;
                consignmentDataForm.forwarder_address.value = currentUser.detail.address;
                consignmentDataForm.forwarder_phone.value = currentUser.detail.phone;
                consignmentDataForm.forwarder_name.value = currentUser.detail.name;
                
                

            }
            consignmentDataForm.addEventListener("submit",(e)=>{
                e.preventDefault();
                let cargo_classification = consignmentDataForm.cargo_classification.value;
                let place_of_destination = consignmentDataForm.place_of_destination.value;
                let place_of_delivery = consignmentDataForm.place_of_delivery.value;
                let port_of_discharge = consignmentDataForm.port_of_discharge.value;
                let port_of_origin = consignmentDataForm.port_of_origin.value;
                let no_of_containers = consignmentDataForm.no_of_containers.value;
                let goods_description = consignmentDataForm.goods_description.value;
                let no_of_packages = consignmentDataForm.no_of_packages.value;
                let package_unit = consignmentDataForm.package_unit.value;
                let gross_weight = consignmentDataForm.gross_weight.value;
                let gross_weight_unit = consignmentDataForm.gross_weight_unit.value;
                let gross_volume = consignmentDataForm.gross_volume.value;
                let gross_volume_unit = consignmentDataForm.gross_volume_unit.value;
                let net_weight = consignmentDataForm.net_weight.value;
                let net_weight_unit = consignmentDataForm.net_weight_unit.value;
                let invoice_value = consignmentDataForm.invoice_value.value;
                let invoice_currency = consignmentDataForm.invoice_currency.value;
                let freight_charge = consignmentDataForm.freight_charge.value;
                let freight_currency = consignmentDataForm.freight_currency.value;
                let imdg_code = consignmentDataForm.imdg_code.value;
                let packing_type = consignmentDataForm.packing_type.value;
                let oil_type = consignmentDataForm.oil_type.value;
                let shipping_mark = consignmentDataForm.shipping_mark.value;
                let forwarder_code = consignmentDataForm.forwarder_code.value;
                let forwarder_id = currentUser.detail.id;
                newData = {
                    user:currentUser.id,
                    cargo_classification:cargo_classification,
                    place_of_destination:place_of_destination,
                    place_of_delivery:place_of_delivery,
                    port_of_discharge:port_of_discharge,
                    port_of_origin:port_of_origin,
                    no_of_containers:no_of_containers,
                    goods_description:goods_description,
                    no_of_packages:no_of_packages,
                    package_unit:package_unit,
                    gross_weight:gross_weight,
                    gross_weight_unit:gross_weight_unit,
                    gross_volume:gross_volume,gross_volume_unit:gross_volume_unit,net_weight:net_weight,net_weight_unit:net_weight_unit,
                    invoice_value:invoice_value,invoice_currency:invoice_currency,freight_charge:freight_charge,freight_currency:freight_currency,
                    imdg_code:imdg_code,packing_type:packing_type,oil_type:oil_type,shipping_mark:shipping_mark,
                    exporter_id:customerSelect.options[customerSelect.options.selectedIndex].value,
                    forwarder_code:forwarder_code,
                    forwarder_id:forwarder_id,
                    consignee_name: consignmentDataForm.consignee_name.value,
                    consignee_phone: consignmentDataForm.consignee_phone.value,
                    consignee_address: consignmentDataForm.consignee_address.value,
                    consignee_tin: consignmentDataForm.consignee_tin.value,
                    notify_name: consignmentDataForm.notify_name.value,
                    notify_phone: consignmentDataForm.notify_phone.value,
                    notify_address: consignmentDataForm.notify_address.value,
                    notify_tin: consignmentDataForm.notify_tin.value,
                    instructions_file:newData.instructions_file
                }
                console.log("mydata: ",newData);
                var method = (data == null) ? "POST" : "PUT";
                var options ={
                    method:method,body:JSON.stringify(newData),headers:{
                        'Content-type':'application/json','Authorization': 'Bearer '+currentUser.accessToken
                    }
                }
                var url = (data == null) ? consignment_url : consignment_url+"/"+currentUser.id+"/"+data.id;
                
                fetch(url,options)
                .then(res=>res.json())
                .then(result=>{
                    if(result.code ==0){
                        updateConsignmentList(result.data);
                        showExportList(result.data,"export_form");
                    }                   
                    showFeedback(result.msg,result.code);
                })
                .catch(e=>{
                    console.log("e consg: ",e);
                    showFeedback(e,1);
                })
            })
        }
    }
    if(index == 2){
        var fileUploaded = null;
        var newData = {booking_confirmation:fileUploaded};
        var uploadShipBookingButton = document.getElementById("upload_ship_booking");
        var shipBookingInput = document.getElementById("file_ship_booking");
        var shipBookingLink = document.getElementById("link_ship_booking");
        if(data.files && data.files.length > 0){
            let shipBookingFile = data.files.filter(f=>f.name == "ship booking");
            if(shipBookingFile.length > 0) {
                shipBookingLink.href = files_url+"/"+shipBookingFile[0].filename;
                shipBookingLink.textContent = "View Ship Booking";
            }
            else{
                shipBookingLink.href = "";
                shipBookingLink.textContent = "";
            }
        }
        else{
            shipBookingLink.href = "";
            shipBookingLink.textContent = "";
        }
        if(uploadShipBookingButton){
            uploadShipBookingButton.addEventListener("click",(e)=>{
                shipBookingInput.click();
                shipBookingInput.addEventListener("change",(e)=>{
                    if(shipBookingInput.files[0] != null){
                        var reader = new FileReader();
                        reader.addEventListener("load",()=>{
                            var urlObj = URL.createObjectURL(shipBookingInput.files[0]);
                            shipBookingLink.href = urlObj;
                            shipBookingLink.textContent = "View Booking confirmation";
                            newData.booking_confirmation = reader.result;
                        },false)

                        reader.readAsDataURL(shipBookingInput.files[0]);
                    }
                    
                })
            })
        }
        shippingForm = document.getElementById("booking_form");
        if(shippingForm){
            if(data.shipping_details){
                shippingForm.mbl_number.value = data.shipping_details.mbl_number;
                shippingForm.shipping_line.value = data.shipping_details.shipping_line;
                shippingForm.vessel_name.value = data.shipping_details.vessel_name;
                shippingForm.booking_no.value = data.shipping_details.booking_no;
                shippingForm.bl_type.value = data.shipping_details.bl_type;   
                let date = new Date(data.shipping_details.terminal_carry_date);
                let tcd = (1+ date.getMonth())+"/"+date.getDate()+"/"+date.getFullYear();     
                shippingForm.terminal_carry_date.type = "text";        
                shippingForm.terminal_carry_date.value = tcd;
                
            }
            if(shippingForm.terminal_carry_date.type == "text"){
                shippingForm.terminal_carry_date.addEventListener("focus",(e)=>{
                    e.target.type= "date";
                })
            }

            shippingForm.addEventListener("submit",(e)=>{
                e.preventDefault();
                newData.cid =data.id;
                newData.mbl_number=shippingForm.mbl_number.value;
                newData.shipping_line=shippingForm.shipping_line.value;
                newData.vessel_name=shippingForm.vessel_name.value;
                newData.booking_no=shippingForm.booking_no.value;
                newData.bl_type=shippingForm.bl_type.value;
                newData.terminal_carry_date=Date.parse(shippingForm.terminal_carry_date.value);
                
                
                if(newData.booking_confirmation == null){
                    alertDialog("Please upload ship booking confirmation","Ship Booking 1",null);
                }
                else{
                    console.log("body: ",newData);
                    var url = ship_booking_url +"/"+currentUser.id;
                    var method = (data.shipping_details) ? "PUT":"POST";
                    if(data.shipping_details) newData.id = data.shipping_details.id;
                    var options = {
                        method:method,body:JSON.stringify(newData),headers:{
                            'Content-type':'application/json',
                            'Authorization':'Bearer '+currentUser.accessToken
                        }
                    }
                    showSpinner();
                    fetch(url,options)
                    .then(res=>res.json())
                    .then(result=>{ 
                        hideSpinner();
                        if(result.code ==0){
                            updateConsignmentList(result.data);
                            showExportList(result.data,"export_form");
                        }
                        showFeedback(result.msg,result.code);
                    })
                    .catch(e=>{
                        showFeedback("Something went wrong! Please try again later",1);
                    })
                }
            })
        }
    }
    if(index == 3){
        var containerForm = document.querySelector("#container_form");
        var newData = {};
        if(data != null){
            newData.cid = data.id;
            if(data.shipping_details){
                containerForm.mbl_number.value = data.shipping_details.mbl_number;
            }
            if(data.container_details && data.container_details.length > 0){
                containerForm.container_type.value = data.container_details[0].container_type;
                containerForm.container_no.value = data.container_details[0].container_no;
                containerForm.container_size.value = data.container_details[0].container_size;
                containerForm.seal_1.value = data.container_details[0].seal_1;
                containerForm.seal_2.value = data.container_details[0].seal_2;
                containerForm.seal_3.value = data.container_details[0].seal_3;
                containerForm.freight_indicator.value = data.container_details[0].freight_indicator;
                containerForm.no_of_packages.value = data.container_details[0].no_of_packages;
                containerForm.package_unit.value = data.container_details[0].package_unit;
                containerForm.volume.value = data.container_details[0].volume;
                containerForm.volume_unit.value = data.container_details[0].volume_unit;
                containerForm.weight.value = data.container_details[0].weight;
                containerForm.weight_unit.value = data.container_details[0].weight_unit;
                containerForm.max_temp.value = data.container_details[0].max_temp;
                containerForm.min_temp.value = data.container_details[0].min_temp;
                containerForm.plug_yn.value = data.container_details[0].plug_yn;
            }
            
        }
        var uploadContainerBookingButton = document.getElementById("upload_container_booking");
        var containerBookingInput = document.getElementById("file_container_booking");
        var containerBookingLink = document.getElementById("link_container_booking");

        if(data.files && data.files.length > 0){
            var containerFiles = data.files.filter(f=>f.name.toLowerCase() == "container booking");
            containerBookingLink.href = files_url+"/"+containerFiles[0].filename;
            containerBookingLink.textContent = "View Booking Confirmation";
        }

        if(uploadContainerBookingButton){
            uploadContainerBookingButton.addEventListener("click",(e)=>{
                containerBookingInput.click();

                containerBookingInput.addEventListener("change",(e)=>{
                    var file = containerBookingInput.files[0];
                    if(file){
                        var reader = new FileReader();
                        reader.addEventListener("load",()=>{
                            var urlObj = URL.createObjectURL(file);
                            containerBookingLink.href = urlObj;
                            containerBookingLink.textContent = "View Booking Confirmation;"
                            newData.container_file = reader.result;
                            
                        },false);
                        reader.readAsDataURL(file);
                    }
                })
            })
        }
        if(containerForm){
            containerForm.addEventListener("submit",(e)=>{
                e.preventDefault();
                newData.mbl_number = containerForm.mbl_number.value;
                newData.container_type = containerForm.container_type.value;
                newData.container_no = containerForm.container_no.value;
                newData.container_size = containerForm.container_size.value;
                newData.seal_1 = containerForm.seal_1.value;
                newData.seal_2 = containerForm.seal_2.value;
                newData.seal_3 = containerForm.seal_3.value;
                newData.freight_indicator = containerForm.freight_indicator.value;
                newData.no_of_packages = containerForm.no_of_packages.value;
                newData.package_unit = containerForm.package_unit.value;
                newData.volume = containerForm.volume.value;
                newData.volume_unit = containerForm.volume_unit.value;
                newData.weight = containerForm.weight.value;
                newData.weight_unit = containerForm.weight_unit.value;
                newData.max_temp = containerForm.max_temp.value;
                newData.min_temp = containerForm.min_temp.value;
                newData.plug_yn = containerForm.plug_yn.value;

                console.log("my data: ",newData);
                var method = (data.container_details && data.container_details.length > 0) ? "PUT" : "POST";

                var options = {
                    method:method,body:JSON.stringify(newData),headers:{
                        'Content-type':'application/json','Authorization':'Bearer '+currentUser.accessToken
                    }
                }
                var url = (data.container_details && data.container_details.length > 0) ? container_booking_url+"/"+currentUser.id+"/"+data.container_details[0].id : container_booking_url+"/"+currentUser.id;
                fetch(url,options)
                .then(res=>res.json()).then(result=>{
                    console.log("containers: ",result);
                    showFeedback(result.msg,result.code);
                })
                .catch(e=>{
                    console.log("err: ",e);
                    showFeedback(e,1);
                })
            })
        }
    }
}
//update local list of consighments
const updateConsignmentList = (data)=>{
    if(data){
        storedData = JSON.parse(storage.getItem("data"));
        storedData.consignments = data;
        storage.setItem("data",JSON.stringify(storedData));
    }
}
const fetchConsignments = ()=>{
    return new Promise((resolve,reject)=>{
        var options ={
            method: "GET",
            headers:{
                "Content-type":"application/json",
                "Authorization":"Bearer "+currentUser.accessToken
            }
        }
        var url = consignment_url+"/"+currentUser.id;
        fetch(url,options)
        .then(res=>res.json())
        .then(result=>{
            updateConsignmentList(result.data);
            resolve(result);
        }).catch(er=>{
            reject(er);
        })
    })
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
                    updateClientRoles(result.data);
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
                    if(result.code == 0) updateClientRoles(result.data);
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
    inputName.required = true;
    form.appendChild(inputName);

    const inputLevel = document.createElement("select");
    inputLevel.classList.add("form-control");
    inputLevel.id="role_level";
    inputLevel.name = "role_level";
    form.appendChild(inputLevel);

    var roles = (storedData.roles) ? storedData.roles:[];
    roles.forEach(role=>{
        inputLevel.options.add(new Option(role.name,role.id));
    })

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
        let level = inputLevel.options[inputLevel.options.selectedIndex].value;
        let selectedRole = roles.filter(r=>{
            return r.id == level;
        })
        let description = selectedRole[0].description;
        // let permission = "1,2";//roleForm.permission.value.trim();
        const data = {name:name,level:level,description:description};
       
        if(name && name.length !=0) {
            registerClientRole(data).then(result=>{
                showClientRoles();
            })
            .catch(er=>{
                showFeedback(er,1);
            })
        }
        // else inputName.classList.add("fail");
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

        const inputLevel = document.createElement("select");
        inputLevel.classList.add("form-control");
        inputLevel.id="role_level";
        inputLevel.name = "role_level";
        // var roles = (storedData.roles) ? storedData.roles:[];
        storedData.roles.forEach(r=>{
            inputLevel.options.add(new Option(r.name,r.id));
        })

        inputLevel.value = role.level;
        form.appendChild(inputLevel);

    
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
            let roles = (storedData.roles) ? storedData.roles : [];
            let name = inputName.value.trim();
            let level = inputLevel.options[inputLevel.options.selectedIndex].value;
            let selectedRole = roles.filter(r=>{
                return r.id == level;
            })
            let description = selectedRole[0].description;
            // let permission = "1,2";//roleForm.permission.value.trim();
            const data = {name:name,level:level,description:description};
            
            updateClientRole(data,role.id,currentUser.id).then(result=>{
                showFeedback(result.msg,result.code);
                updateClientRoles(result.data);
                showClientRoles();
            }).catch(err=>{
                showFeedback(err,1);

            }).finally(()=>{
                holder.removeChild(form);
                // holder.appendChild(addForm);
            })
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
    const holder = document.querySelector("#customer_table_summary");
        Array.from(holder.children).forEach(child=>{
            if(child.classList.contains("body-row")) holder.removeChild(child);
        })
    if(storedData.customers.length == 0) {
        createCustomerSummaryRow(null);
    }
    else {
        
        var topCustomers = storedData.customers.filter((row,index)=>{
            return index <= clientSummaryCount;
            
        });
        topCustomers.forEach(row=>{
                createCustomerSummaryRow(row);     
        })
       
    }
}
//show clientForm
const closeCustomerForm=(source)=>{
    document.getElementById(source).classList.add("hidden");
    document.getElementById("customers_content").classList.remove("hidden");
    showCustomers(storedData.customers);
}
//fetch clients
const getCustomers = ()=>{
    return new Promise((resolve,reject)=>{
        showSpinner();
        // var body=JSON.stringify({user:currentUser.id});
        var headers = {'Content-type':'application/json','Authorization':"Bearer "+currentUser.accessToken};
        var options = {method:"GET",headers:headers};
    
        fetch(customers_url+"/"+currentUser.id,options)
        .then(res=>{
            hideSpinner();
            if(res.status == 403){
                reject({code:-1,msg:"Session expired, please login"});
                // signoutUser();
            }
            else{
                 res.json().then(result=>{
                   resolve(result);
                })
                .catch(err=>{
                    reject(err)
                })
            }
        })
    })
    
   
   
}

//update customers
const updateCustomers = (customers)=>{
    if(customers && customers.length > 0){
        storedData.customers = customers;
        storage.setItem("data",JSON.stringify(storedData));
        showCustomers(customers);
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

//show customer distribution map
//draw map
const mapChart = ()=>{
    //    let randomData = generateRandomData(am4geodata_worldLow.features.length);
    //    let x = storedData.clients.
       let myData = am4geodata_worldLow;
       let newFeatures = am4geodata_worldLow.features.map((feature,index)=>{
           var feat = feature;
           feat.properties.value = 0;
           let customers = (storedData.customers) ? storedData.customers : [];
           customers.forEach(customer=>{
               if(feature.properties.name.toLowerCase() == customer.country.toLowerCase()) feat.properties.value ++;
           })
           
           feat.properties.fill = (feat.properties.value ==0) ? am4core.color("#ffcc00") : am4core.color("#cc9900");
           return feat;
       })
       myData.features = newFeatures;
        // Low-detail map
        var chart = am4core.create("map-chart2", am4maps.MapChart);
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
        label.text = "Customers Distribution";
        // Configure series
        var polygonTemplate = polygonSeries.mapPolygons.template;
        polygonTemplate.tooltipText = "{name}:{value}";
        polygonTemplate.propertyFields.fill = "fill";
    
        // Create hover state and set alternative fill color
        var hs = polygonTemplate.states.create("hover");
            hs.properties.fill = am4core.color("#644c04");
    }
    

//show pie chart
const drawChart = (config,canvas)=>{
    return myChart = new Chart(canvas,config);
}
//refresh user
const refreshUser=()=>{
    console.log("refreshed user");
}

//confirm dialog
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
//handle arrow drop down and menus

    let id = "arrow-drop";
    let signoutId = "#signout";
    let profileId = "#profile";
    const profile = document.querySelector(profileId);
    const signout = document.querySelector(signoutId);
    const arrowDrop = document.getElementById(id);
    const dropDown = document.querySelector("#drop-down");
    if(arrowDrop){
        arrowDrop.addEventListener('click',(e)=>{
            showHideDropDown(dropDown,arrowDrop);
        });
    }
    if(signout){
        signout.addEventListener('click',(e)=>{
            e.preventDefault();
            alertDialog("Are you sure you want to sign out?","signout",()=>{
                signoutUser();
            });
        });
    }
    if(profile){
        profile.addEventListener('click',(e)=>{
            dropDown.classList.add("hidden");
            showSettings();
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
        //hide dialogs
        var alerts = Array.from(document.getElementsByClassName("alert"));
        alerts.forEach(alert=>{
            if(!alert.contains(e.target)){
                alert.classList.add("hidden");
                while(alert.hasChildNodes()){
                    alert.removeChild(alert.childNodes[0]);
                }
            }
        })
})
document.addEventListener('updateData',(e)=>{
    if(window.location.pathname == '/admin/'){
        let data = JSON.parse(e.value);
        console.log("may be an update triggered")
        if(getActiveMenu() == 'dashboard') showClientStats();
        else if(getActiveMenu() == 'customers') showCustomers(data.customers);
        else if(getActiveMenu() == 'roles') showClientRoles();
    }
})

//listen to poststate change
window.addEventListener('poststate',(e)=>{
    console.log("poststate: ",e.state);
})
const showSettings =()=>{
    // if(currentUser.id === 0){
    //     alert("settings admin");
    // }
    // else{
    //     showProfile();
    // }
    activateMenu('profile');
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
const sortCustomers = (sortBy,source)=>{
    sortOrder = 0;
    if(source.innerHTML == "arrow_drop_down") {
        source.innerHTML = "arrow_drop_up";
        sortOrder = 0;
    }
    else if(source.innerHTML == "arrow_drop_up") {
        source.innerHTML = "arrow_drop_down";
        sortOrder = 1;
    }
    let customers = data.customers;
    if(customers.length > 0){
        customers = customers.sort((a,b)=>{
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
                    result = (a.email < b.email) ? -1 : 1;
                }
                else result = (a.email < b.email) ? 1:-1;
                break;
            }
            return result;
        })
    }
    
    showCustomers(customers);
}
//search client
const searchCustomers = (keyword)=>{
    keyword = keyword.toLowerCase();
    let customers = storedData.customers;
    let filtered = [];
    if(customers.length > 0){
        filtered = customers.filter(customer=>{
            return customer.name.toLowerCase().includes(keyword) || 
            customer.contact_person.toLowerCase().includes(keyword) || 
            customer.contact_email.toLowerCase().includes(keyword) ||
            customer.email.toLowerCase().includes(keyword) ||
            customer.address.toLowerCase().includes(keyword) ||
            customer.country.toLowerCase().includes(keyword) 
        })
    }
    return filtered;
}
//populate client details
const populateCustomerDetails = (form,customer)=>{
    var detail = customer.detail;
    form.email.value = customer.email;
    if(detail){
        form.company_name.value = detail.name;
        form.client_id.value = detail.id;
        form.address.value = detail.address;
        form.contact_person.value = detail.contact_person;
        form.contact_email.value = detail.contact_email;
        form.phone.value= detail.phone;
        form.country.value = detail.country;
        form.region.value = detail.region;
       
    }
    
}



const fetchRegions = ()=>{
    fetch(regions_url).then(res=>res.json()).then(regions=>{
        if(regions && regions.length > 0){
            storedData.regions = regions;
            storage.setItem("data",JSON.stringify(storedData));
        }
    }).catch(e=>{
        console.log("Could not get regions ",e);
    })
}

//upload user image
const uploadUserImage = (image)=>{
    let body = {image_file:image};
    return new Promise((resolve,reject)=>{
        let url = upload_user_image_url+"/"+currentUser.id;
        const headers = {
            'Content-type':'application/json',
            'Authorization':'Bearer '+currentUser.accessToken
        }
        const options = {
            method:"put",body:JSON.stringify(body),headers:headers
        }
        fetch(url,options).then(res=>{
            if(res.status == 403){
                reject({code:1,msg:"Session expired, please login"});
            }
            else{
                res.json().then(result=>{
                    resolve(result);
                })
                .catch(e=>{
                    reject(e);
                })
            }
        })
    })
}
//submit dlient form
const submitClientDetail =(data,verb)=>{
    var spinner = document.getElementById("button-spinner");
    var submit = document.getElementById("btnSubmit");
    const headers = {
        'Content-type':'application/json',
        'Authorization':'Bearer '+currentUser.accessToken
    }
    const options = {
        method:verb,body:JSON.stringify(data),headers:headers
    }
    fetch(create_client_url,options)
    .then(res=>{
        if(res.status == 403){
            showFeedback("Session expired. Please signin",1);
            signoutUser();
            
        }
        else{
            res.json().then(result=>{
                currentUser.detail = result.data;
                updateClientDetail(result.data);
                showFeedback(result.msg,result.code);
                showDashboard();
            })
            .catch(err=>{
                console.log("err: ",err);
                showFeedback("Something went wrong, please try again later",1);
            })
            .finally(()=>{
                submit.classList.remove("hidden");
                spinner.classList.add("hidden");
            })
        }
    }).catch(err=>{
        console.log("err: ",err);
        showFeedback("Something went wrong, please try again later",1);
    })
           
}
//submit dlient form
const submitCustomerDetail =(data,verb)=>{
    const headers = {
        'Content-type':'application/json',
        'Authorization':'Bearer '+currentUser.accessToken
    }
    const options = {
        method:verb,body:JSON.stringify(data),headers:headers
    }
    fetch(create_customer_url,options)
    .then(res=>{
        if(res.status == 403){
            showFeedback("Session expired. Please signin",1);
            signoutUser();
            
        }
        else{
            res.json().then(result=>{
                updateCustomers(result.data);
                showFeedback(result.msg,result.code);
                closeCustomerForm('add_customer_content')
            })
            .catch(err=>{
                console.log("err: ",err);
                showFeedback("Something went wrong, please try again later",1);
            })
        }
    }).catch(err=>{
        console.log("err: ",err);
        showFeedback("Something went wrong, please try again later",1);
    })
}
//update client roles
const updateClientRoles =(roles)=>{
    if(roles && roles.length > 0){
        storedData.client_roles = roles;
        storage.setItem("data",JSON.stringify(storedData));
        // showClientRoles();
    }
}

//update client role
const updateClientRole = (data,roleId,userId)=>{
    return new Promise((resolve,reject)=>{
        let url = client_roles+"/"+userId+"/"+roleId;
        const body = JSON.stringify({name:data.name,description:data.description,level:data.level});
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
                    if(result.code == 0) {
                        updateClientRoles(result.data);
                        showClientRoles();
                    }
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
         if(clientDetails) {
             greet("Hello "+clientDetails.contact_person.split(" ")[0],null);
             document.querySelector("#account-name").textContent = clientDetails.contact_person;
             let source = (currentUser.avatar) ? currentUser.avatar :clientDetails.logo;
            //  document.querySelector("#account-image").src = source;
             
             if(clientDetails.logo) {
                 document.querySelector("#avatar").src = source;
                 document.querySelector("#client_logo").src = clientDetails.logo;
             }
             else{
                document.querySelector("#avatar").src = (currentUser.avatar) ? currentUser.avatar :"/img/favicon.png";
                document.querySelector("#client_logo").src = "/img/logo.png";
             }
         }
         else greet("Hello "+currentUser.email,null);
         showClientStats();
         fetchRoles()
            .then(result=>{
            })
            .catch(e=>{
                showFeedback(e.msg,1);
            })

        //customer form
        const customerForm = document.querySelector("#customer_profile_form");
        if(customerForm){
            customerForm.btnCancelAdd.addEventListener('click',()=>{
                activateMenu('customers');
            })

            initializeMap(document.getElementById("map-add"),customerForm.address,customerForm);

            customerForm.addEventListener("submit",(e)=>{
                e.preventDefault();

            let name   = customerForm.company_name.value;
            let email  = customerForm.email.value;
            let phone  = customerForm.phone.value;
            let person = customerForm.contact_person.value;
            let cemail = customerForm.contact_email.value;
            let address= customerForm.address.value;
            let country = customerForm.country.value;
            let region = customerForm.region.value;
            let tin = customerForm.code.value;
            let data = {
                tin:tin,
                region:region,
                country:country,
                company_name:name,
                email:email,
                phone:phone,
                contact_person:person,
                contact_email:cemail,
                address:address,
                user:currentUser.id,
                db:currentUser.db
            };
            let method = "POST";
                     
            submitCustomerDetail(data,method);

            })
        }
    }
}

//client profile
if(window.location.pathname == "/account/"){
    const detailForm = document.querySelector("#client_profile_form");
    var clientDetails = currentUser.detail;
    if(clientDetails) {
        
    }
    
    if(detailForm){
        
        if(currentUser){
            populateCustomerDetails(detailForm,currentUser);
        }
        initializeMap(document.getElementById("map-add"),detailForm.address,detailForm);
        detailForm.addEventListener('submit',(e)=>{
            e.preventDefault();
            var spinner = document.getElementById("button-spinner");
            spinner.classList.remove("hidden");
            detailForm.btnSubmit.classList.add("hidden");
            let name   = detailForm.company_name.value;
            let email  = detailForm.email.value;
            let phone  = detailForm.phone.value;
            let person = detailForm.contact_person.value;
            let cemail = detailForm.contact_email.value;
            let address= detailForm.address.value;
            let country = detailForm.country.value;
            let region = detailForm.region.value;
            
            let file = detailForm.company_logo.files[0];
            let logoFile = clientDetails.logo;
            let data = {
                region:region,
                country:country,
                company_name:name,
                email:email,
                phone:phone,
                contact_person:person,
                contact_email:cemail,
                address:address,
                logo:logoFile,
                user:currentUser.id,
                db:currentUser.db
            };
            let method = "POST";
            if(currentUser.detail) {
                data.id = currentUser.detail.id;
                method = "PUT";
            }
            if(file){
                var reader = new FileReader();
                reader.addEventListener('load',()=>{
                    data.logo = reader.result;
                    submitClientDetail(data,method);
                },false);

                reader.readAsDataURL(file);
            }
            else{
                submitClientDetail(data,method);
            }
            

        });
    }
    
   

}

//upload user photo
const uploadButton = document.querySelector("#upload-button");
if(uploadButton){
    uploadButton.addEventListener("click",(e)=>{
       updateUserProfile();
    })
}