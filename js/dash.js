const storage = window.localStorage;
const session = window.sessionStorage;
const DATA_COUNT = 12;
const NUMBER_CFG = {count: DATA_COUNT, min: 0, max: 100};
// const CURRENCY = "USD";
const clientSummaryCount = 5;
const CONSIGNMENT_NUMBER_FORMAT = 6;
const BANK_DETAILS = {account_name:"Test Company 5 Limited",account_number:"01128788998",bank:"Your Investment Bank",branch:"Nearest Branch",swift:"XXXCODE",country:"Tanzania"}
const PREDOCUMENTS = [
    {id:0,name:"ODG Certificate 1",label:"odg_1"},
    {id:1,name:"ODG Certificate 2",label:"odg_2"},
    {id:2,name:"ODG Certificate 3",label:"odg_3"},
    {id:3,name:"ODG Certificate 4",label:"odg_4"},
    {id:4,name:"ODG Certificate 5",label:"odg_5"},
    {id:5,name:"ODG Certificate 6",label:"odg_6"}];
    const DOCUMENTS = [
        {id:0,name:"custom release",label:"Custom Release"},
        {id:1,name:"loading permission",label:"Loading Permission"},
        {id:2,name:"export permission",label:"Export Permission"},
        {id:3,name:"screening report",label:"Screening Report"},
        {id:4,name:"bill of lading",label:"Bill of Lading"},];
const CONTAINER_FIELDS = [{id:"mbl_number",label:"#MB/L No",required:false,forImport:false,type:"text"},
{id:"container_type",label:"Type",required:true,forImport:false,type:"select",options:["Standard","General Purpose","ISO Reefer","Insulated","Flat Rack","Open Top"]},
{id:"container_no",label:"Container No",required:true,forImport:true,type:"text"},
{id:"container_size",label:"Size",required:true,type:"select",options:["20G0","20G1","20H0","20P0","20P1","20T0","20T1","20T2","22G0","22G1","22H0","22P8","22P7","22P8"]},
{id:"seal_1",label:"Shipping Seal",required:false,type:"text"},
{id:"seal_2",label:"Exporter Seal",required:false,type:"text"},
{id:"seal_3",label:"Seal #3",required:false,type:"text"},
{id:"freight_indicator",label:"Freight Indicator",required:false,type:"text"},
{id:"no_of_packages",label:"Number of Packages",required:false,forImport:true,type:"number"},
{id:"package_unit",label:"Package Unit",required:false,forImport:true,type:"select",options:["BG","BX","CT","UT"]},
{id:"volume",label:"Vol",required:false,type:"number"},
{id:"volume_unit",label:"Vol Unit",required:false,type:"select",options:["CM","CF","Lt"]},
{id:"weight",label:"Weight",required:true,forImport:true,type:"number"},
{id:"weight_unit",label:"Weight Unit",required:true,forImport:true,type:"select",options:["KG","Lb","Ton"]},
{id:"max_temp",label:"Max Temp",required:false,type:"number"},
{id:"min_temp",label:"Min Temp",required:false,type:"number"},
{id:"plug_yn",label:"Refer Plug",required:true,type:"select",options:["Y","N"]}];
    
var currentUser = (session.getItem("currentUser")) ? JSON.parse(session.getItem("currentUser")):null;

var storedData = (storage.getItem("data") && storage.getItem("data") !="" && storage.getItem("data")!="undefined") ? JSON.parse(storage.getItem("data")):{petty_cash:[],employees:[],cost_items:[],roles:[],client_roles:[],customers:[],roles:[],consignments:[],imports:[],clients:[],quotations:[],invoices:[],settings:{currency:"Tsh"}};

var myCostItems = [];
const originalSetItem = localStorage.setItem;

localStorage.setItem = function(key, value) {
  const event = new Event('updateData');
  event.value = value; // Optional..
  event.key = key; // Optional..
  document.dispatchEvent(event);

  originalSetItem.apply(this, arguments);
};
const showBankDetails=()=>{
    var accName = document.getElementById("account_name");
    var accNumber = document.getElementById("account_number");
    var bank = document.getElementById("bank");
    var swift = document.getElementById("swift");
    var country = document.getElementById("bank_country");

    accName.textContent = "Account Name: "+BANK_DETAILS.account_name;
    accNumber.textContent = "Account Number: "+BANK_DETAILS.account_number;
    bank.textContent = "Banker: "+BANK_DETAILS.bank +", "+ BANK_DETAILS.branch;
    swift.textContent = "SWIFT: "+BANK_DETAILS.swift;
    country.textContent = "Country: "+BANK_DETAILS.country;
}
//Functions start
const thousandSeparator =(val,short=false)=> {
    if(short){
        val = parseInt(val);
        let ans = val;
        if(val>= 1000) ans = (val/1000).toFixed(1) +"K";
        if(val >= 1000000) ans = (val/1000000).toFixed(1) +"M";
        if(val >= 1000000000) ans = (val/1000000000).toFixed(1) +"B";
        return ans;
    }
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
const generateRandomData = (count)=>{
    var result = [];
    for(let i=0; i<count;i++){
        let random = Math.floor(Math.random() * (NUMBER_CFG.max - NUMBER_CFG.min + 1)) + NUMBER_CFG.min;
        result.push(random);
    }
    return result;
}

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
const fetchInvoices=()=>{
    return new Promise((resolve,reject)=>{
        var options = { method: "GET", headers: { "Content-type": "application/json", "Authorization": "Bearer " + currentUser.accessToken } };
        var url = invoices_url + "/" + currentUser.id;
        fetch(url, options).then(res => res.json())
            .then(result => {
                resolve(result.data);
                // showInvoiceList(result.data);
            })
            .catch(e => {
                reject(e);
                showFeedback("Something went wrong. Please try again later", 1);
            });
       
    })
    
}
const updateInvoices=(invoices)=>{
    storedData.invoices = invoices;
    storage.setItem("data", JSON.stringify(storedData));
    storedData = JSON.parse(storage.getItem("data"));
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
                alertDialog({description:"Are you sure you want to delete this role?",actionText:"Delete",title:"Delete Role"},()=>{
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
            case 'customers':
                greet("Customers",{title:"Customers",description:"List of customers"});
                getCustomers().then(customers=>{
                    // showCustomers(customers)
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
            case 'general':
                greet("Settings",{title:"Settings",description:"General Settings"});
                
                break;
            case 'exports':
                showConsignment();
                break;
            case 'imports':
                console.log("showing imports");
                showConsignment("import");
                // greet("Operations",{title:"Imports",description:"Consignments"});
                break;
            case 'quotations':
                if(!storedData.quotations || storedData.quotations.length == 0){
                    var options = {method:"GET",headers:{"Content-type":"application/json","Authorization":"Bearer "+currentUser.accessToken}};
                    var url = quotation_url+"/"+currentUser.id;
                    fetch(url,options).then(res=>res.json())
                    .then(result=>{
                        storedData.quotations = result.data;
                        storage.setItem("data",JSON.stringify(storedData));
                        showQuotationList(result.data);
                    })
                    .catch(e=>{
                        showFeedback("Something went wrong. Please try again later",1);
                    });
                }
                else{
                    showQuotationList(storedData.quotations);
                }
                // console.log("activating quotations menu");
                break;
            case 'invoices':
                if(!storedData.invoices || storedData.invoices.length == 0){
                    fetchInvoices().then(invoices=>{
                        updateInvoices(invoices);
                        showInvoiceList(invoices);
                    }).catch(e=>{
                        showFeedback("Could not get invoices",2);
                    });
                }
                else{
                    showInvoiceList(storedData.invoices);
                }
                // console.log("activating quotations menu");
                break;
            case 'pettycash':
                greet("Finance",{title:"Petty Cash",description:"View"});
                getPettyCash().then(r=>{
                    showPettyCash(r,Date.now());
                }).catch(e=>{
                    showFeedback(e,1);
                });
                
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
            case 'costitems':
                greet("Finance",{title:"Quotations",description:"Manage Cost Items"});
                if(!storedData.cost_items || storedData.cost_items.length == 0){
                    fetchCostItems().then(items=>{
                        storedData.cost_items = items;
                        storage.setItem("data",JSON.stringify(storedData));
                        storedData = JSON.parse(storage.getItem("data"));
                        listCostItems(items)
                    }).catch(e=>{
                        showFeedback(e,1);
                    });
                }
                else listCostItems(storedData.cost_items);
                break;
            case 'dashboard':
                greet("Hello Admin",null);
                showDashboard();
                break;
            case 'employees':
                greet("HR",{title:"Employees",description:"List of Employees"});
                showEmployeeList();
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
            case 'add_employee':
                document.querySelector("#employees").classList.add("active");
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
//sow employee list
const showEmployeeList=(source)=>{
    var s = document.getElementById(source);
    
    if(source == "add_employees_content") {
        var f = document.getElementById("add_employee_form");
        f.reset();
    }
    if(s)s.classList.add("hidden");
    document.getElementById("employee_list").classList.remove("hidden");
    getEmployees();
}
const showEmployeeDetail=d=>{
    greet("HR",{title:"Employees",description:"Details"});
    document.getElementById('employee_list').classList.add("hidden");
    document.getElementById('edit_employee_content').classList.add("hidden");
    document.getElementById("detail_employee_content").classList.remove("hidden");
    var form = document.getElementById("detail_employee_form");
    form.classList.remove("hidden");
    console.log("d: ",d);
    if(form){
        var dob = new Date(parseInt(d.dob));
        var idDate = new Date(parseInt(d.id_expire));
        var sDate = new Date(parseInt(d.start_date));
        var eDate = new Date(parseInt(d.end_date));

        form.emp_name.value = d.name;
        form.emp_dob.value = dob.getDate()+"/"+dob.getMonth()+1+"/"+dob.getFullYear();
        form.emp_address.value = d.address;
        form.emp_id_type.value = d.id_type;
        form.emp_id_number.value = d.id_no;
        form.emp_id_expiration.value = idDate.getDate()+"/"+idDate.getMonth()+1+"/"+idDate.getFullYear();
        form.emp_type.value = d.employment_type;
        form.emp_email.value = d.email;
        form.emp_phone.value = d.phone;
        form.emp_title.value = d.title;
        form.emp_emergency_address.value = d.emergency_address;
        form.emp_emergency_contact.value = d.emergency_contact;
        form.emp_emergency_phone.value = d.emergency_phone;
        form.emp_emergency_relationship.value = d.emergency_relationship;
        form.emp_salary.value = d.salary;
        form.emp_start_date.value = sDate.getDate()+"/"+sDate.getMonth()+1+"/"+sDate.getFullYear();
        form.emp_end_date.value = eDate.getDate()+"/"+eDate.getMonth()+1+"/"+eDate.getFullYear();
        var linkPhoto = document.getElementById("emp_photo_label");
        var linkId = document.getElementById("emp_id_file_label");
        var linkContract = document.getElementById("emp_contract_file_label");
        if(d.photo){            
            linkPhoto.innerHTML = "<a href='"+employee_files_url+"/"+d.photo+"' target='_blank'>view photo</a>";
            form.emp_photo.classList.add("hidden");
        }
        else linkPhoto.textContent = "No Photo uploaded";
        if(d.id_file){            
            linkId.innerHTML = "<a href='"+employee_files_url+"/"+d.id_file+"' target='_blank'>view ID</a>";
            form.emp_id_file.classList.add("hidden");
        }
        else linkId.textContent = "No ID file uploaded";
        if(d.contract_file){            
            linkContract.innerHTML = "<a href='"+employee_files_url+"/"+d.contract_file+"' target='_blank'>view contract</a>";
            form.emp_id_file.classList.add("hidden");
        }
        else linkContract.textContent = "No contract file uploaded";
    }
}
const showEmployeeEditForm=(source,d)=>{
    greet("HR",{title:"Employees",description:"Edit Employee"});
    document.getElementById(source).classList.add("hidden");
    document.getElementById("detail_employee_content").classList.add("hidden");
    document.getElementById("edit_employee_form").reset();
    document.getElementById("edit_employee_content").classList.remove("hidden");
    var form = document.getElementById("edit_employee_form");
    if(form){
        var dob = new Date(parseInt(d.dob));
        var idDate = new Date(parseInt(d.id_expire));
        var sDate = new Date(parseInt(d.start_date));
        var eDate = new Date(parseInt(d.end_date));

        form.emp_name.value = d.name;
        form.emp_dob.value = (parseInt(dob.getMonth())+1)+"-"+dob.getDate()+"-"+dob.getFullYear();
        form.emp_address.value = d.address;
        form.emp_id_type.value = d.id_type;
        form.emp_id_number.value = d.id_no;
        form.emp_id_expiration.value = (parseInt(idDate.getMonth())+1)+"-"+idDate.getDate()+"-"+idDate.getFullYear();
        form.emp_type.value = d.employment_type;
        form.emp_email.value = d.email;
        form.emp_phone.value = d.phone;
        form.emp_title.value = d.title;
        form.emp_emergency_address.value = d.emergency_address;
        form.emp_emergency_contact.value = d.emergency_contact;
        form.emp_emergency_phone.value = d.emergency_phone;
        form.emp_emergency_relationship.value = d.emergency_relationship;
        form.emp_salary.value = d.salary;
        form.emp_start_date.value = (parseInt(sDate.getMonth())+1)+"-"+sDate.getDate()+"-"+sDate.getFullYear();
        form.emp_end_date.value = (parseInt(eDate.getMonth())+1)+"-"+eDate.getDate()+"-"+eDate.getFullYear();
        var linkPhoto = document.getElementById("emp_photo_label");
        var linkId = document.getElementById("emp_id_file_label");
        var linkContract = document.getElementById("emp_contract_file_label");
        if(d.photo){            
            linkPhoto.innerHTML = "<a href='"+employee_files_url+"/"+d.photo+"' target='_blank'>view photo</a>";
            // form.emp_photo.classList.add("hidden");
        }
        else linkPhoto.textContent = "Upload photo";
        if(d.id_file){            
            linkId.innerHTML = "<a href='"+employee_files_url+"/"+d.id_file+"' target='_blank'>view ID</a>";
            // form.emp_id_file.classList.add("hidden");
        }
        else linkId.textContent = "Upload copy of ID";
        if(d.contract_file){            
            linkContract.innerHTML = "<a href='"+employee_files_url+"/"+d.contract_file+"' target='_blank'>view contract</a>";
            // form.emp_id_file.classList.add("hidden");
        }
        else linkContract.textContent = "Upload Contract";

        form.addEventListener("submit",(e)=>{
            e.preventDefault();

            var name = form.emp_name.value.trim();
            var dob = form.emp_dob.value.trim();
            var passport = form.emp_photo.files[0];
            var address = form.emp_address.value.trim();
            var email = form.emp_email.value.trim();
            var phone = form.emp_phone.value.trim();
            var id_type = form.emp_id_type.value;
            var id_no = form.emp_id_number.value.trim();
            var id_expire = form.emp_id_expiration.value.trim();
            var id_file = form.emp_id_file.files[0];
            var title = form.emp_title.value.trim();
            var emptype = form.emp_type.value;
            var salary = form.emp_salary.value.trim();
            var contract = form.emp_contract_file.files[0];
            var startDate = form.emp_start_date.value;
            var endDate = form.emp_end_date.value;
            var emergency_contact = form.emp_emergency_contact.value.trim();
            var emergency_relationship = form.emp_emergency_relationship.value.trim();
            var emergency_phone = form.emp_emergency_phone.value.trim();
            var emergency_address = form.emp_emergency_address.value.trim();

            var fd = new FormData();
            fd.append("id",d.id);
            fd.append("name",name);
            fd.append("dob",Date.parse(dob));
            fd.append("emp_photo",passport);
            fd.append("address",address);
            fd.append("email",email);
            fd.append("phone",phone);
            fd.append("id_type",id_type);
            fd.append("id_no",id_no);
            fd.append("id_expire",Date.parse(id_expire));
            fd.append("emp_id_file",id_file);
            fd.append("title",title);
            fd.append("employment_type",emptype);
            fd.append("salary",salary);
            fd.append("emp_contract_file",contract);
            fd.append("start_date",Date.parse(startDate));
            fd.append("end_date",Date.parse(endDate));
            fd.append("emergency_contact",emergency_contact);
            fd.append("emergency_address",emergency_address);
            fd.append("emergency_phone",emergency_phone);
            fd.append("emergency_relationship",emergency_relationship);
            
            saveEmployee(fd,"edit");
        })
    }
}
const listEmployees=data=>{
    var container = document.getElementById("employee_list");
    if(container){
        container.classList.remove("hidden");
        Array.from(container.children).forEach(child=>{
            if(child.classList.contains("consignment-row")) container.removeChild(child);
        });
    
        if(data && data.length > 0){
            data.map((d)=>{
                let k = d;
                var now = Date.now();
                k.status = (d.end_date <= now) ? 1:0;
                return k;
            }).forEach(d=>{
                const row = document.createElement("span");
                row.classList.add("consignment-row");
                row.classList.add("shadow-minor");
                row.classList.add("status-indicator-"+(d.status === 0 ? "approved":"red"));
                const empNo = document.createElement("span");
                empNo.textContent = formatConsignmentNumber(d.id);
                row.appendChild(empNo);
        
                const empName = document.createElement("span");
                empName.textContent = d.name;
                row.appendChild(empName);
        
                const title = document.createElement("span");
                title.textContent = d.title;
                row.appendChild(title);
                
                // const eta = document.createElement("span");
                // let tcd = "";
                // if(d.shipping_details){
                //     let date = new Date(d.shipping_details.eta);
                //     tcd += (1+ date.getMonth())+"/"+date.getDate()+"/"+date.getFullYear();
                // }
                // else tcd = "N/A";
                // eta.textContent = tcd;
                // row.appendChild(eta);
        
                const email = document.createElement("span");
                email.textContent = d.email;
                row.appendChild(email);

                const phone = document.createElement("span");
                phone.textContent = d.phone;
                row.appendChild(phone);

                const idnumber = document.createElement("span");
                idnumber.textContent = d.id_no;
                row.appendChild(idnumber);
                                
                const consStatus = document.createElement("span");
                consStatus.textContent = (d.status === 1) ? "Inactive" : "Aactive";
                row.appendChild(consStatus);

                const btnEdit = document.createElement("span");
                btnEdit.classList.add("material-icons");
                btnEdit.textContent = "edit";
                btnEdit.addEventListener('click',(e)=>{
                    e.stopPropagation();
                    showEmployeeEditForm('employee_list',d);
                })

                row.appendChild(btnEdit);
                container.appendChild(row);
    
                row.addEventListener("click",(e)=>{
                    console.log("clicked data: ",d);
                    showEmployeeDetail(d);
                })
            })
           
        }
        else{
            const row = document.createElement("span");
            row.classList.add("consignment-row");
            row.classList.add("shadow-minor");
            row.textContent = "No Employees";
            container.appendChild(row);
        }
    }
}
const getEmployees=()=>{
    if(storedData.employees.length == 0){
        fetch(create_employee_url,{method:"POST",body:JSON.stringify({uid:currentUser.id}),headers:{'Content-type':'application/json','Authorization':'Bearer '+currentUser.accessToken}})
        .then(res=>res.json())
        .then(result=>{
            console.log("getempl: ",result);
            if(result.code === 1){
                showFeedback(result.msg,1);
            }
            else{
                listEmployees(result.data);
            }
        })
        .catch(e=>{
            console.log("err :",e);

        })
    }
    else listEmployees(storedData.employees);
}
//show employee form
const showEmployeeForm=(source)=>{
    greet("HR",{title:"Employees",description:"Add Employee"});
    document.getElementById("edit_employee_form").reset();
    document.getElementById("edit_employee_form").classList.add("hidden");
    document.getElementById(source).classList.add("hidden");
    document.getElementById("add_employee_content").classList.remove("hidden");
    var form = document.getElementById("add_employee_form");
    form.classList.remove("hidden");

    if(form){
 
        form.addEventListener("submit",(e)=>{
            e.preventDefault();

            var name = form.emp_name.value.trim();
            var dob = form.emp_dob.value.trim();
            var passport = form.emp_photo.files[0];
            var address = form.emp_address.value.trim();
            var email = form.emp_email.value.trim();
            var phone = form.emp_phone.value.trim();
            var id_type = form.emp_id_type.value;
            var id_no = form.emp_id_number.value.trim();
            var id_expire = form.emp_id_expiration.value.trim();
            var id_file = form.emp_id_file.files[0];
            var title = form.emp_title.value.trim();
            var emptype = form.emp_type.value;
            var salary = form.emp_salary.value.trim();
            var contract = form.emp_contract_file.files[0];
            var startDate = form.emp_start_date.value;
            var endDate = form.emp_end_date.value;
            var emergency_contact = form.emp_emergency_contact.value.trim();
            var emergency_relationship = form.emp_emergency_relationship.value.trim();
            var emergency_phone = form.emp_emergency_phone.value.trim();
            var emergency_address = form.emp_emergency_address.value.trim();

            var fd = new FormData();
            fd.append("name",name);
            fd.append("dob",Date.parse(dob));
            fd.append("emp_photo",passport);
            fd.append("address",address);
            fd.append("email",email);
            fd.append("phone",phone);
            fd.append("id_type",id_type);
            fd.append("id_no",id_no);
            fd.append("id_expire",Date.parse(id_expire));
            fd.append("emp_id_file",id_file);
            fd.append("title",title);
            fd.append("employment_type",emptype);
            fd.append("salary",salary);
            fd.append("emp_contract_file",contract);
            fd.append("start_date",Date.parse(startDate));
            fd.append("end_date",Date.parse(endDate));
            fd.append("emergency_contact",emergency_contact);
            fd.append("emergency_address",emergency_address);
            fd.append("emergency_phone",emergency_phone);
            fd.append("emergency_relationship",emergency_relationship);
            
            saveEmployee(fd);
        })
    }

}
const saveEmployee=(emp,tag=null)=>{
    var method = (tag && tag==="edit") ? "PUT":"POST";
    var url = create_employee_url+"/"+currentUser.id;
    var options={
        body:emp,method:method,headers:{'Authorization':"Bearer "+currentUser.accessToken}
    }
    console.log("emp: ",...emp);
    fetch(url,options)
    .then(res=>res.json())
    .then(result=>{
        console.log("xx: ",result);
        showFeedback(result.msg,result.code);
        if(result.code === 0){
            storedData.employees = result.data;
            storage.setItem("data",JSON.stringify(storedData));
            storedData = JSON.parse(storage.getItem("data"));
        }
        
    })
    .catch(e=>{
        console.log("error; ",e);
        showFeedback(e,1);
    })
}

//settings functions
const currencySetting = document.getElementById("currency_setting");
if(currencySetting){
    currencySetting.addEventListener("change",(e)=>{
        let cur = e.target.value;
        setCurrency(cur);
    })
}
const setCurrency = (currency)=>{
    var settings = (storedData.settings) ? storedData.settings : {};
    settings.currency = currency;
    storedData.settings = settings;
    storage.setItem("data",JSON.stringify(storedData));
    storedData = JSON.parse(storage.getItem("data"));
}

if(storedData.settings) setCurrency("Tsh");


//end of settings functions
//show error
const showFeedback =(msg,type)=>{
    const feedback = document.querySelector("#feedback");
    feedback.textContent = msg;
    feedback.classList.remove("hidden");
    switch(type){
        case 0:
            feedback.classList.remove("fail");
            feedback.classList.remove("information");
            feedback.classList.add("success");
            break;
        case 1:
            feedback.classList.remove("success");
            feedback.classList.add("fail");
            feedback.classList.remove("information");
            break;
        case 2:
            feedback.classList.remove("success");
            feedback.classList.remove("fail");
            feedback.classList.add("information");
            break;
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
        session.clear();
        storage.clear();
        window.location.pathname = "/signin.html";
    })
    .catch(e=>{
        console.log(e);
        showFeedback(e,1);
    });
  
};

//fetch cost items
const fetchCostItems = ()=>{
    return new Promise((resolve,reject)=>{
        var options = {method:"GET",headers:{'Content-type':'application/json','Authorization':'Bearer '+currentUser.accessToken}};
        var url = cost_items_url+"/"+currentUser.id;
        fetch(url,options)
        .then(res=>res.json())
        .then(result=>{
            console.log("fci: ",result);
            resolve(result.data);
        })
        .catch(e=>{
            console.log("error: ",e);
            showFeedback("Oops! Something went wrong, please try again later",1);
            reject(e);
        })
    })
   
}
//show role form
const showCostItemForm = (holder,item=null)=>{
    Array.from(holder.children).forEach((c,i)=>{if(c.tagName.toLowerCase() == "form")holder.removeChild(c);});
    const form = document.createElement("form");
    form.method = "post";
    form.id = "add_cost_item_form";
    form.classList.add("body-row");
    const nameSpan = document.createElement("span");
    const inputName = document.createElement("input");
    inputName.type = "text";
    // inputName.classList.add("form-control");
    inputName.id="name";
    inputName.name = "name";
    inputName.placeholder = "Item name";
    inputName.required = true;
    nameSpan.appendChild(inputName);
    form.appendChild(nameSpan);

    const desSpan = document.createElement("span");
    const inputDesc = document.createElement("input");
    inputDesc.type = "text";
    inputDesc.classList.add("form-control");
    inputDesc.id="description";
    inputDesc.name = "description";
    inputDesc.placeholder = "Item description";
    inputDesc.required = true;
    desSpan.appendChild(inputDesc);
    form.appendChild(desSpan);

    const spanCost = document.createElement("span");
    const inputCost = document.createElement("input");
    inputCost.type = "text";
    inputCost.classList.add("form-control");
    inputCost.id="cost";
    inputCost.name = "cost";
    inputCost.placeholder = "Item Cost";
    inputCost.required = true;
    spanCost.appendChild(inputCost);
    form.appendChild(spanCost);


    const inputAtCost = document.createElement("select");
    inputAtCost.classList.add("form-control");
    inputAtCost.id="at_cost";
    inputAtCost.name = "at_cost";
    form.appendChild(inputAtCost);
    inputAtCost.options.add(new Option("YES",1));
    inputAtCost.options.add(new Option("NO",0));

    const inputPerCont = document.createElement("select");
    inputPerCont.classList.add("form-control");
    inputPerCont.id="per_container";
    inputPerCont.name = "per_container";
    form.appendChild(inputPerCont);
    inputPerCont.options.add(new Option("NO",0));
    inputPerCont.options.add(new Option("YES",1));
    

    const inputSubmit = document.createElement("input");
    inputSubmit.type = "submit";
    inputSubmit.classList.add("button-s");
    inputSubmit.classList.add("no-corner");
    inputSubmit.id="btnSubmitItem";
    inputSubmit.name = "btnSubmitItem";
    inputSubmit.value = "SAVE";
    form.appendChild(inputSubmit);
    holder.appendChild(form);
    let method = "POST";
    var url = cost_items_url+"/"+currentUser.id;
    if(item != null){
        inputName.value = item.name;
        inputDesc.value = item.description;
        inputAtCost.value = item.at_cost;
        inputCost.value =item.price;
        inputPerCont.value =item.per_container;
        inputSubmit.value = "UPDATE";
        method = "PUT";
        url += "/"+item.id;
    }

     form.addEventListener('submit',(e)=>{
             e.preventDefault();
             
            let name = inputName.value.trim();
            let description = inputDesc.value.trim();
            let atcost = inputAtCost.value;
            let cost = inputCost.value.trim();//roleForm.permission.value.trim();
            let per_container = inputPerCont.value;
            const data = {name:name,at_cost:atcost,description:description,price:cost,per_container:per_container};
        
            var options = {method:method,body:JSON.stringify(data),headers:{'Content-type':'application/json','Authorization':'Bearer '+currentUser.accessToken}};
            
            fetch(url,options).then(res=>res.json())
            .then(result=>{
                updateCostItems(result.data);
                showFeedback(result.msg,result.code);
            })
            .catch(er=>{
                console.log("error: ",er);
                showFeedback("Oops! Something went wrong, please try again later",1);
            })
        // else inputName.classList.add("fail");
    })

}
const deleteCostItem = (itemId)=>{
    fetch(cost_items_url+"/"+currentUser.id+"/"+itemId,{
        method:"DELETE",headers:{'Content-type':'application/json','Authorization':'Bearer '+currentUser.accessToken}
    })
    .then(res=>res.json())
    .then(result=>{
        updateCostItems(result.data);
        listCostItems(result.data);
        showFeedback(result.msg,result.code);
            
    }).catch(e=>{
        console.log(e);
        showFeedback("Something went wrong! Please try again later",1)
    })
   
}
const listCostItems = (items)=>{
    const holder = document.getElementById("cost-items-table");
    Array.from(holder.children).forEach(child=>{
        if(child.classList.contains('body-row') || child.id=="add_cost_item_form") holder.removeChild(child);
    })
    if(items && items.length > 0){
        items.forEach(item=>{
            const rowHolder = document.createElement("div");
            rowHolder.classList.add("body-row");
            rowHolder.classList.add("shadow-minor");
            const itemName = document.createElement("span");
            itemName.textContent = item.name;
            const itemDesc = document.createElement("span");
            itemDesc.textContent = item.description;
            const itemPrice = document.createElement("span");
            itemPrice.textContent = item.price;
            const itemAtCost = document.createElement("span");
            itemAtCost.textContent = (item.at_cost == 0) ? "NO" : "YES";

            const itemPerContainer = document.createElement("span");
            itemPerContainer.textContent = (item.per_container == 0) ? "NO" : "YES";

            const editBut = document.createElement("span");
            editBut.id = "edit_item_"+item.id;
            editBut.classList.add("material-icons");
            editBut.textContent = "edit";

            const delBut = document.createElement("span");
            delBut.id = "del_item_"+item.id;
            delBut.classList.add("material-icons");
            delBut.textContent = "delete";

            const actionSpan = document.createElement("span");
            actionSpan.classList.add("actions");
            actionSpan.appendChild(editBut);
            actionSpan.appendChild(delBut);

            
            rowHolder.appendChild(itemName);
            rowHolder.appendChild(itemDesc);
            rowHolder.appendChild(itemPrice);
            rowHolder.appendChild(itemAtCost);
            rowHolder.appendChild(itemPerContainer);
            rowHolder.appendChild(actionSpan);
            holder.appendChild(rowHolder);

            //add delete button click listener
            delBut.addEventListener("click",(e)=>{
                alertDialog({description:"Are you sure you want to delete this cost item?",actionText:"Delete",title:"Delete Cost Item"},()=>{
                    deleteCostItem(item.id);
                })
            })

            //add eidt button click listener
            editBut.addEventListener("click",(e)=>{
                showCostItemForm(holder,item);
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
    showCostItemForm(holder);
}

const updateCostItems = (items)=>{
    storedData.cost_items = items;
    storage.setItem("data",JSON.stringify(storedData));
    listCostItems(items);
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


        //customer form
        const customerForm = document.querySelector("#add_customer_form");
        if(customerForm){
            customerForm.reset();
            document.getElementById("cancelAddCustomerButton").addEventListener('click',(e)=>{
                activateMenu('customers');
            })

            let data = {inc_cert:null,tin_cert:null};
            customerForm.tin_cert.addEventListener("change",(e)=>{
                if(e.target.files[0]){
                    var reader = new FileReader();
                    reader.addEventListener("load",()=>{
                        data.tin_cert = reader.result;
                    },false);

                    reader.readAsDataURL(e.target.files[0]);
                }
            });
           
            customerForm.inc_cert.addEventListener("change",(e)=>{
                if(e.target.files[0]){
                    var reader = new FileReader();
                    reader.addEventListener("load",()=>{
                        data.inc_cert = reader.result;
                    },false);

                    reader.readAsDataURL(e.target.files[0]);
                }
            });

            selectPlace(customerForm.address,customerForm);
            customerForm.addEventListener("submit",(e)=>{
                e.preventDefault();

                let name   = customerForm.customer_name.value;
                let email  = customerForm.email.value;
                let phone  = customerForm.phone.value;
                let person = customerForm.contact_person.value;
                let cemail = customerForm.contact_email.value;
                let address= customerForm.address.value;
                let country = customerForm.country.value;
                let region = customerForm.region.value;
                let tin = customerForm.customer_tin.value;
                data.tin=tin,
                    data.region=region;
                    data.country=country;
                    data.company_name=name;
                    data.email=email;
                    data.phone=phone;
                    data.contact_person=person;
                    data.contact_email=cemail;
                    data.address=address;
                    data.user=currentUser.id;
                let method = "POST";
                        
                submitCustomerDetail(data,method);

            })
        }
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
            showFeedback("Your session has expired. Please sign in again",1);
            // signoutUser();
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

const uploadImportFiles = (file,cid,name,filename=null)=>{
    return new Promise((resolve,reject)=>{
        var data = {cid:cid,file:file,target:"imports",user:currentUser.id,name:name,type:"import"};
        if(filename) data.filename = filename;
        fetch(upload_files_url,{body:JSON.stringify(data),method:"POST",headers:{'Content-type':'application/json','Authorization':'Bearer '+currentUser.accessToken}})
        .then(res=>res.json())
        .then(result=>{
            console.log("result: ",result);
            resolve(result);
        })
        .catch(e=>{
            reject("Something went wrong! Please try again later");
        })
    })
}
const showConsignment = (tag="export")=>{
    console.log("tag: ",tag);
    if(tag == "export"){
        document.querySelector("#export_form").classList.add("hidden");
        greet("Operations",{title:"Export",description:"Export consignments"});
        var consignments = (storedData.consignments) ? storedData.consignments : [];
        if(consignments.length == 0){
            fetchConsignments().then(result=>{
                storedData.consignments = result.data;
                storage.setItem("data",JSON.stringify(storedData));
                showExportList(result.data);
            })
        }
        else showExportList(storedData.consignments);
    }
    else if(tag == "import"){
        document.querySelector("#import_forms").classList.add("hidden");
        greet("Operations",{title:"Import",description:"Import consignments"});
        var imports = (storedData.imports) ? storedData.imports : [];
        if(imports.length == 0){
            fetchImports().then(result=>{
                console.log("fetchImports(): ",result);
                storedData.imports = result.data;
                storage.setItem("data",JSON.stringify(storedData));
                console.log("fetchImports(): ",result.data);
                showImportList(result.data);
            })
            .catch(e=>{
                showFeedback(e,1);
            })
        }
        else {
            console.log("showConsignment: ",storedData.imports);
            showImportList(storedData.imports); 
        }
    }
    
}
const selectPlace = (searchInput,targetForm)=>{
    var fields = ["formatted_address","geometry","name","place_id"];
    var options = {strictBounds:false,fields:fields,type:"establishment"};
    var autocomplete = new google.maps.places.Autocomplete(searchInput,options);
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
       
    })
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
const viewCustomerDetails = (customer,source)=>{
    console.log("sel cu: ",customer);
    greet("Customers",{title:"Customers",description:"View"});
    const detailView = document.getElementById("view_customer_content");
    detailView.classList.remove("hidden");
    document.getElementById(source).classList.add("hidden");

    const editButton = document.getElementById("editCustomerButton");
    if(editButton){
        editButton.addEventListener("click",(e)=>{
            editCustomerDetail(customer,"view_customer_content");
        })
    }
    
    const name = document.getElementById("c_name");
    const tin = document.getElementById("c_tin");
    const address = document.getElementById("c_address");
    const region = document.getElementById("c_region");
    const country = document.getElementById("c_country");
    const email = document.getElementById("c_email");
    const phone = document.getElementById("c_phone");
    const tin_cert = document.getElementById("c_tin_cert");
    const inc_cert = document.getElementById("c_inc_cert");
    const contactPerson = document.getElementById("contact_p");
    const contactEmail = document.getElementById("contact_e");

    name.textContent = customer.name;
    tin.textContent = customer.tin;
    address.textContent = customer.address.split(",")[0];
    region.textContent = customer.region;
    country.textContent = customer.country;
    email.textContent = customer.email;
    phone.textContent = customer.phone;
    contactPerson.textContent = customer.contact_person;
    contactEmail.textContent = customer.contact_email;

    if(customer.tin_file != null){
        tin_cert.textContent = "View TIN Certificate";
        tin_cert.href = files_url+"/customers/"+customer.tin_file;
        tin_cert.target = "_blank";
    }
    else{
        tin_cert.textContent = "No Certificate";
    }

    if(customer.incorporation_file != null){
        inc_cert.textContent = "View Certificate of Incorporation";
        inc_cert.href = files_url+"/customers/"+customer.incorporation_file;
        inc_cert.target = "_blank";
    }
    else{
        inc_cert.textContent = "No Certificate";
    }
    
    var consignments = storedData.consignments.filter(c=>c.exporter_id == customer.id);
    showCustomerConsignments(consignments,0);

    const inProgressTab = document.getElementById("tab-inprogress");
    inProgressTab.textContent = "In-progress ("+consignments.filter(c=>c.status < 10).length+")";
    const completeTab = document.getElementById("tab-complete");
    completeTab.textContent =  "Completed ("+consignments.filter(c=>c.status >= 10).length+")";

    inProgressTab.addEventListener("click",(e)=>{
        showCustomerConsignments(consignments,0);
        e.target.classList.toggle("tab-active");
        completeTab.classList.toggle("tab-active");
    })
    completeTab.addEventListener("click",(e)=>{
        showCustomerConsignments(consignments,1);
        e.target.classList.toggle("tab-active");
        inProgressTab.classList.toggle("tab-active");
    })
}
const showCustomerConsignments = (consignments,flag)=>{
    const parent = document.getElementById("consignment_list");
    Array.from(parent.children).forEach((child,idx)=>{
        if(idx > 0) parent.removeChild(child);
    });

    var data = (flag == 0) ? consignments.filter(c=>c.status < 10) : consignments.filter(c=>c.status >= 10);
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
                let date = new Date(d.shipping_details.eta);
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

            parent.appendChild(row);

            row.addEventListener("click",(e)=>{
                console.log("clicked data: ",d);
                showConsignmentDetail(d);
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
const editCustomerDetail = (customer,source)=>{
    greet("Customers",{title:"Customers",description:"Edit"});
    if(source != null) document.getElementById(source).classList.add("hidden");
    document.getElementById("edit_customer_content").classList.remove("hidden");
    const editForm = document.querySelector("#edit_customer_form");
    editForm.customer_id.value = customer.id;
    editForm.customer_name.value = customer.name;
    editForm.address.value =  customer.address;
    editForm.email.value = customer.email;
    editForm.contact_person.value = customer.contact_person;
    editForm.phone.value = customer.phone;
    editForm.contact_email.value = customer.contact_email;
    editForm.region.value = customer.region;
    editForm.country.value = customer.country;
    editForm.customer_tin.value = customer.tin;

    selectPlace(editForm.address,editForm);
   
    document.getElementById("cancelCustomerEditButton").addEventListener('click',()=>{
        closeCustomerForm('edit_customer_content',customer);
        // activateMenu("customers");
    });
    let data = {tin_cert:null,inc_cert:null};
    editForm.tin_cert.addEventListener("change",(e)=>{
        if(e.target.files[0]){
            var reader = new FileReader();
            reader.addEventListener("load",()=>{
                data.tin_cert = reader.result; 
            },false);

            reader.readAsDataURL(e.target.files[0]);
        }
    });

    editForm.inc_cert.addEventListener("change",(e)=>{
        if(e.target.files[0]){
            var reader = new FileReader();
            reader.addEventListener("load",()=>{
                data.inc_cert = reader.result; 
            },false);

            reader.readAsDataURL(e.target.files[0]);
        }
    })
    editForm.addEventListener("submit",(e)=>{
        e.preventDefault();
        let id = customer.id;
        let name = (editForm.customer_name.value) ? editForm.customer_name.value : customer.name;
        let address = (editForm.address.value) ? editForm.address.value : customer.address;
        let email = (editForm.email.value) ? editForm.email.value : customer.email;
        let phone = (editForm.phone.value) ? editForm.phone.value : customer.phone;
        let country = (editForm.country.value) ? editForm.country.value : customer.country;
        let region = (editForm.region.value) ? editForm.region.value: customer.region;
        let contact_person = (editForm.contact_person.value) ? editForm.contact_person.value : customer.contact_person;
        let contact_email = (editForm.contact_email.value) ? editForm.contact_email.value : customer.contact_email;
        let tin = (editForm.customer_tin.value) ? editForm.customer_tin.value : customer.tin;
        data.user=currentUser.id;
        data.name=name;
        data.address=address;
        data.email=email;
        data.phone=phone
        data.country=country;
        data.region=region;
        data.contact_person=contact_person;
        data.contact_email=contact_email
        data.tin=tin;
        
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
        console.log("url: ",data);
        fetch(update_customer_url,options)
            .then(res=>res.json())
            .then(result=>{
                console.log("t: ",result);
                updateCustomers(result.data);
                showFeedback(result.msg,result.code);
                closeCustomerForm('edit_customer_content',customer)
            })
            .catch(err=>{
                showFeedback(err.msg,err.code);
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

//show admin stats
const showClientStats =()=>{
    if(currentUser.detail){
        var currentYear = (new Date()).getFullYear();
        getCustomers()
        .then(result=>{
            updateCustomers(result.data);
            greet("Hello "+currentUser.detail.contact_person.split(" ")[0],null);
            const numberOfCustomers = document.getElementById("no_of_customers");
            numberOfCustomers.textContent = (storedData.customers) ? storedData.customers.length:0; 


            getPettyCash().then(pc=>{
                storedData.petty_cash = pc;
                storage.setItem("data",JSON.stringify(storedData));
 //show charts and maps
 let chartArea = document.getElementById("chart-area");
 while(chartArea.hasChildNodes()){
     chartArea.removeChild(chartArea.childNodes[0]);
 }
 const canvas = document.createElement("canvas");
 chartArea.appendChild(canvas);
 
 const labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
 
 var dx = storedData.invoices.map(i=>{
     let x = i;
     let d = new Date(i.date_created);
     x.month = d.getMonth();
     x.year = d.getFullYear();
     return x;
 });
 var dy = pc.map(i=>{
     let x = i;
     let d = new Date(i.date_created);
     x.month = d.getMonth();
     x.year = d.getFullYear();
     return x;
 });
 var yy = [];
 var yx = [];
 labels.forEach((l,i)=>{
     var s = dx.filter(d=>d.month === i && d.year === currentYear).map(i=>parseInt(i.price)).reduce((a,b)=>a+b,0);
     yx.push(s*USD_RATE);
     var ex = dy.filter(d=>d.month === i && d.year === currentYear && d.type === 0).map(i=>parseInt(i.amount)).reduce((a,b)=>a+b,0);
     yy.push(ex);
 })
 let data = {
     labels: labels,
     datasets: [
         {
         label: 'Sales in Tsh',
         data: yx,
         borderColor: "#cc9900",
         backgroundColor: "#cc9900",
         },
         {
             label: 'Expenses in Tsh',
             data: yy,
             borderColor: "#0f810f",
             backgroundColor: "#0f810f",
             },
         
     ]
 }
 let config = {
     type: 'bar',   
     data: data,
     options: {
     responsive: true,
     maintainAspectRatio:false,
     plugins: {
         title: {
         display: true,
         text: 'Annual Sales for '+currentYear
         }
     }
     },
 }
 var myChart = drawChart(config,canvas);
 // myChart.homeZoomLevel = 50;
 // showCustomersSummary();
 mapChart();

            }).catch(e=>{

            })
           
            fetchConsignments()
            .then(result=>{
                storedData.consignments = result.data;
                storage.setItem("data",JSON.stringify(storedData));
                storedData = JSON.parse(storage.getItem("data"));
                var consignments = (storedData.consignments) ? storedData.consignments : [];
                const numberOfConsignments = document.getElementById("no_of_consignments");
                numberOfConsignments.textContent = consignments.length;
                var readyForShipping = consignments.filter(c=>c.status == 9);
                
                 var income = storedData.invoices.filter(iv=>iv.status.toLowerCase() === "paid").map(i=>{
                    let k = parseInt(i.price);
                    if(parseInt(i.discount) > 0) k= parseInt(i.price) * (1 - parseInt(i.discount) * 0.01);
                    return k;
                 }).reduce((a,b)=>a+b,0);
                 income = USD_RATE * income;
                 var expense = consignments.filter(c=>c.expenses.length > 0).map(e=>{
                    var x = e.expenses;
                    var p = x.map(i=>parseInt(i.amount));
                    return p.reduce((a,b)=>a+b,0);
                 }).reduce((a,b)=>a+b,0)
               expense = parseInt(expense);
               var expense2 = storedData.imports.filter(c=>c.expenses.length > 0).map(e=>{
                var x = e.expenses;
                var p = x.map(i=>parseInt(i.price));
                return p.reduce((a,b)=>a+b,0);
             }).reduce((a,b)=>a+b,0);
                 console.log("check; ",expense,expense2);

                 var profit = Math.abs(parseInt(income) - parseInt(expense));
                document.getElementById("ready_for_shipping").textContent = readyForShipping.length;
                document.getElementById("income").textContent = thousandSeparator(income,true);
                document.getElementById("expense").textContent = thousandSeparator(expense,true);
                document.getElementById("profit").textContent = thousandSeparator(profit,true);
        
        
                showExportListSummary(result.data);

                fetchCostItems()
                .then(items=>{
                    updateCostItems(items);
                    fetchInvoices()
                    .then(invoices=>{
                        updateInvoices(invoices);
                        // var pendingInvoices = invoices ? invoices.filter(inv=>inv.status.toLowerCase() == "paid").reduce((a,b)=> a.price + b.price,0):0;
                        // document.getElementById("pending_invoices").textContent = pendingInvoices;
                        // var pendingApproval = invoices ? invoices.filter(inv=>inv.status.toLowerCase() == "awaiting manager's approval"):[];
                        // document.getElementById("pending_approval").textContent = pendingApproval.length;
                        fetchClientRoles();
                    })
                    .catch(e=>{
                        console.log("error: ",e);
                    })
                }).catch(e=>{
                    console.log("fetchCostItems(): ",e);
                })
            })
            .catch(e=>{
                console.log("err: ",e);
            })
        })
        .catch(er=>{
            if(er.code == -1){
                showFeedback(er.msg,1);
                // signoutUser();
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
        viewCustomerDetails(row,'customers_content');
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
const showCustomers = (data,source=null)=>{
    greet("Customers",{title:"Customers",description:"List of customers"});
    if(source != null) document.getElementById(source).classList.add("hidden");
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
                let date = new Date(d.shipping_details.eta);
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

            parent.appendChild(row);

            row.addEventListener("click",(e)=>{
                console.log("clicked data: ",d);
                showConsignmentDetail(d);
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
//shwo import consignmenet list
const showImportList = (data,source=null)=>{
    if(source != null) {
        var mySource = document.getElementById(source);
        mySource.classList.add("hidden");
        
    }
    else{
        var mySource = document.getElementById("import_forms");
        mySource.classList.add("hidden");
        
        Array.from(document.getElementsByClassName("consignment-forms")).forEach(child=>{
            // console.log("tagname: ",Array.from(child.children)[0].tagName);
            Array.from(child.children).forEach(c=>{
                if(c.tagName.toLowerCase() == "form") c.reset();
            })
            // if(Array.from(child.children)[0].tagName.toLowerCase() == "form") Array.from(child.children)[0].reset;
        })
    }
    document.querySelector("#add_import").classList.remove("hidden");
    var parent = document.querySelector("#import_list");
    parent.classList.remove("hidden");
    Array.from(parent.children).forEach(child=>{
        if(child.classList.contains("consignment-row")) parent.removeChild(child);
    });

    if(data && data.length > 0){
        sortConsignments(data).forEach(d=>{
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
                let date = new Date(d.shipping_details.eta);
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

            parent.appendChild(row);

            row.addEventListener("click",(e)=>{
                console.log("clicked data: ",d);
                showImportDetail("import_list",d);
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
//show export listsummary
const showExportListSummary = (data)=>{
    var parent = document.getElementById("consignment_summary");
    Array.from(parent.children).forEach((child,i)=>{
        if(i > 0) parent.removeChild(child);
    })
    
    
    if(data && data.length > 0){
        data.forEach(d=>{
            const row = document.createElement("span");
            row.classList.add("consignment-row");
            row.classList.add("shadow-minor");
            row.classList.add("status-indicator-"+d.status);
            
    
            const shippingLine = document.createElement("span");
            shippingLine.textContent = (d.shipping_details) ? d.shipping_details.shipping_line : "N/A";
            row.appendChild(shippingLine);
               
            const eta = document.createElement("span");
            let tcd = "";
            if(d.shipping_details){
                let date = new Date(d.shipping_details.eta);
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

            row.addEventListener("click",(e)=>{
                activateMenu("exports");
            })

            parent.appendChild(row);
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
//show consignment summary
const showConsignmentSummary=(consignment,type)=>{
    let quote = 0;
    let paid = 0;
    if(consignment){
         if(consignment.invoices){
            consignment.invoices.forEach(iv=>{
            quote += iv.price - iv.price*iv.discount*0.01;
            if(iv.status.toLowerCase() == "paid") paid += quote;
            });
        }
        quote = USD_RATE * quote;
        paid = USD_RATE * paid;
        let cost = 0;
        if(consignment.expenses){
            consignment.expenses.forEach(c=>{
            cost += 1.0 * c.amount;
            }); 
        }
        if(consignment.tax_amount) cost += parseInt(consignment.tax_amount);
        if(consignment.tasad_fee) cost += parseInt(consignment.tasad_fee);

    var chartArea;
    var chartCtx;
    if(type == "export"){
        document.getElementById("export_consignment_summary").classList.remove("hidden");
        var customer = storedData.customers.filter(c=>c.id == consignment.exporter_id)[0];
        document.getElementById("cons_cust_name").textContent = customer.name;
        document.getElementById("cons_cust_add").textContent = customer.address;
        document.getElementById("cons_no").textContent = formatConsignmentNumber(consignment.id);
        document.getElementById("cons_type").textContent = "Export";
        document.getElementById("cons_port_o").textContent = consignment.port_of_origin;
        document.getElementById("cons_port_d").textContent = consignment.port_of_discharge;
        document.getElementById("cons_quote").textContent = "Tsh."+thousandSeparator(quote,true);
        document.getElementById("cons_amount_paid").textContent = "Tsh."+thousandSeparator(paid,true);
        document.getElementById("cons_amount_spent").textContent = "Tsh."+thousandSeparator(cost,true);
      
        document.getElementById("cons_status").textContent = consignment.status_text;
        chartArea = document.getElementById("summary_cons");
        
    }
    else{
        document.getElementById("import_summary").classList.remove("hidden");
        chartArea = document.getElementById("summary_imp");
        var customer = storedData.customers.filter(c=>c.id == consignment.exporter_id)[0];
        document.getElementById("imp_cust_name").textContent = customer.name;
        document.getElementById("imp_cust_add").textContent = customer.address;
        document.getElementById("imp_no").textContent = formatConsignmentNumber(consignment.id);
        document.getElementById("imp_type").textContent = "Import";
        document.getElementById("imp_port_o").textContent = consignment.port_of_origin;
        document.getElementById("imp_port_d").textContent = consignment.port_of_discharge;
        document.getElementById("imp_quote").textContent = "Tsh."+thousandSeparator(quote,true);
        document.getElementById("imp_status").textContent = consignment.status_text;
        document.getElementById("imp_amount_paid").textContent = "Tsh."+thousandSeparator(paid,true);
        document.getElementById("imp_amount_spent").textContent = "Tsh."+thousandSeparator(cost,true);
        
    }
    if(chartArea.hasChildNodes()){
        Array.from(chartArea.children).forEach(c=>chartArea.removeChild(c));
        
    }
    chartCtx = document.createElement("canvas");
    chartArea.appendChild(chartCtx);
    var config = {
        type:"bar",
        data:{
            labels:["Quoted Amount","Expenses","Amount Paid"],
            datasets:[{
                axis:'y',
                barThickness:16,
                data:[quote,cost,paid],
                backgroundColor:['rgba(0,255,0,0.4)','rgba(255,0,0,1)','rgba(0,128,0,1)'],
                borderColor:['rgba(0,255,0,0.4)','rgba(255,0,0,1)','rgba(0,128,0,1)']
            }]

        },
        options:{
            indexAxis:'y',
            scales:{
                x:{
                    ticks:{
                        callback:(val,idx,values)=>{
                            let ans = val;
                            if(val>= 1000) ans = (val/1000).toFixed(1) +"K";
                            if(val >= 1000000) ans = (val/1000000).toFixed(1) +"M";
                            if(val >= 1000000000) ans = (val/1000000000).toFixed(1) +"B";
                            return ans;
                        }
                    },
                    grid:{
                        display:true
                    }
                },
                y:{
                    grid:{
                        display:true
                    }
                }
            },
            plugins:{
                legend:{
                    display:false
                }
            }
            
        }
    }
    let chart = new Chart(chartCtx,config);
    // chart.destroy();
    }
    

}
//close consignmentForm
const closeConsignmentForm = ()=>{
    document.querySelector("#add_export").classList.remove("hidden");
    document.querySelector("#export_form").classList.add("hidden");
    document.querySelector("#export_list").classList.remove("hidden");
}
//show consignment form
const showConsignmentForm =(source)=>{
    document.getElementById("export_consignment_summary").classList.add("hidden");
    if(source !="export_list"){
        document.getElementById("exports_content").classList.remove("hidden");
        document.getElementById("export_list").classList.add("hidden");
        greet("Operations",{title:"Consignments",description:"Add"});
        // activateMenu("exports")
    }
    document.getElementById(source).classList.add("hidden");
    const progressSteps = Array.from(document.getElementById("progress-card-1").children);
    progressSteps.forEach((step,index)=>{
        step.addEventListener("click",(e)=>{
            switchSteps(index+1,data);
        })
    })
    document.querySelector("#add_export").classList.add("hidden");
    const parent = document.getElementById("export_form");
    parent.classList.remove("hidden");
    document.getElementById("consignment_form").reset();
    
    switchSteps(1,null);

    
}
const showConsignmentDetail =(data)=>{
   
        document.getElementById("exports_content").classList.remove("hidden");
        document.getElementById("export_list").classList.add("hidden");
        greet("Operations",{title:"Consignments",description:"View"});
        // activateMenu("exports")
    
    document.getElementById("export_list").classList.add("hidden");
    const progressSteps = Array.from(document.getElementById("progress-card-1").children);
    progressSteps.forEach((step,index)=>{
        step.addEventListener("click",(e)=>{
            switchSteps(index+1,data);
        })
    })
    document.querySelector("#add_export").classList.add("hidden");
    const parent = document.getElementById("export_form");
    parent.classList.remove("hidden");
    var position = (data == null) ? 1: data.status;
    if(data != null) showConsignmentSummary(data,"export");
    switchSteps(position,data);

    
}
//switch steps
const switchSteps = (position,data)=>{
    var progressSteps = Array.from(document.getElementById("progress-card-1").children);
    progressSteps.forEach((step)=>{
        step.classList.remove("current");
    });
    position = (position >=5 ) ? 5 :position;
    progressSteps[position-1].classList.add("current");
    switchDetails(position,data);
}
//switch consignment forms
const switchDetails = (index,data)=>{
    Array.from(document.getElementsByClassName("consignment-details")).forEach(d=>{
        if(d.id.split("_")[1] == index) d.classList.remove("hidden");
        else d.classList.add("hidden");
    });
   
    showConsignmentSummary(data,"export");
    if(index == 1){
        var consignmentDataForm = document.getElementById("consignment_form");
        consignmentDataForm.reset();
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
        shippingInstructionsInput.addEventListener('change',(e)=>{
            if(shippingInstructionsInput.files[0]){
            var urlObj = URL.createObjectURL(shippingInstructionsInput.files[0]);
            shippingInstructionsLink.href = urlObj;
            shippingInstructionsLink.textContent = "View Shipping Instructions";

            var reader = new FileReader();
            reader.addEventListener("load",()=>{
                if(data && data.id){
                    uploadConsignmentFile(currentUser.id,reader.result,data.id,"consignments_tb","shipping instructions")
                    .then(result=>{
                        console.log("result: ",result);
                        updateConsignmentList(result.data);
                        showFeedback(result.msg,result.code);
                    })
                    .catch(e=>{
                        showFeedback(e,1);
                    })
                }
                else{
                    newData.instructions_file = reader.result;
                }
            },false);
            reader.readAsDataURL(shippingInstructionsInput.files[0]);
            }
        })
        
        uploadShippingInstructionsButton.addEventListener("click",(e)=>{
            shippingInstructionsInput.click();

        })
       
        if(consignmentDataForm){
            var customerSelect = document.getElementById("customer_select");
            var selectedCustomer;
            
            if(customerSelect){
                Array.from(customerSelect.children).forEach((child,idx)=>{
                    if(idx > 0) customerSelect.removeChild(child);
                });

                var customers = (storedData.customers) ? storedData.customers : [];
                customers.forEach(customer=>{
                    customerSelect.options.add(new Option(customer.name,customer.id));
                });
                customerSelect.options.add(new Option("--add new customer--",-1));
                
                customerSelect.addEventListener("change",(e)=>{
                    if(e.target.value == -1) showCustomerDetailForm('exports_content');
                    else if(e.target.value != -2){
                        selectedCustomer = customers.filter(c=>{
                            return c.id == customerSelect.options[customerSelect.options.selectedIndex].value;
                        })[0];
            
                        consignmentDataForm.exporter_phone.value = selectedCustomer.phone;
                        consignmentDataForm.exporter_name.value = selectedCustomer.name;
                        consignmentDataForm.exporter_address.value = selectedCustomer.address+"\n\r"+selectedCustomer.region+","+selectedCustomer.country;
                        consignmentDataForm.exporter_tin.value = selectedCustomer.tin;
                   
                    }
                    
                });   
            }
            if(data != null){
                consignmentDataForm.cargo_classification.value = data.cargo_classification;
                Array.from(consignmentDataForm.port_of_discharge.children)
                .forEach((c,i)=>{if(i>0)consignmentDataForm.port_of_discharge.removeChild(c)})
                
                Array.from(consignmentDataForm.place_of_destination.children)
                .forEach((c,i)=>{if(i>0)consignmentDataForm.place_of_destination.removeChild(c)})

                Array.from(consignmentDataForm.port_of_origin.children)
                .forEach((c,i)=>{if(i>0)consignmentDataForm.port_of_origin.removeChild(c)})

                PORTS.forEach(p=>consignmentDataForm.port_of_discharge.options.add(new Option(p.name+", "+p.code,p.code)));
                PORTS.forEach(p=>consignmentDataForm.port_of_origin.options.add(new Option(p.name+", "+p.code,p.code)));
                COUNTRIES.forEach(p=>consignmentDataForm.place_of_destination.options.add(new Option(p.name)));
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
                
                consignmentDataForm.forwarder_code.value = currentUser.detail.code;consignmentDataForm.forwarder_code.value = currentUser.detail.code;
                consignmentDataForm.forwarder_address.value = currentUser.detail.address;
                consignmentDataForm.forwarder_phone.value = currentUser.detail.phone;
                consignmentDataForm.forwarder_name.value = currentUser.detail.name;
            }

            var countriesSelect = document.getElementById("place_of_origin");
            var countries = [];
            // PORTS.forEach(p=>{
            //     if(!countries.includes(p.country)) countries.push(p.country);
            // });
            countries = COUNTRIES.filter(c=>{
                var pt = PORTS.map(p=>{
                    let x = p.country.toLowerCase();
                    if(x.toLowerCase() === c.name.toLowerCase()){
                        return x;
                    }
                });
                return pt.includes(c.name.toLowerCase());
            });
            loadCountries(countriesSelect);

            var portSearch = document.getElementById("port_of_origin");
            // var searchablePorts = document.getElementById("searchable_ports");
            // portSearch.addEventListener("focus",(e)=>{
            //     var filteredPorts= PORTS.map(p=>(p.name + ", "+p.code));
            //     loadPorts(filteredPorts,searchablePorts,portSearch);
            // })
            // portSearch.addEventListener("input",(e)=>{
            //     // searchableCountries.classList.remove("hidden");
            //     let search = e.target.value.toLowerCase();
            //     var filteredPorts;
            //     if(search.length == 0) filteredPorts = PORTS.map(p=>(p.name + ", "+p.code));
            //     else filteredPorts = PORTS.map(p=>(p.name + ", "+p.code)).filter(c=>c.toLowerCase().includes(search));
            //     loadPorts(filteredPorts,searchablePorts,portSearch);
            // })
            loadPorts(PORTS,portSearch,null);
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

                let consignee_name = consignmentDataForm.consignee_name.value;
                let consignee_phone = consignmentDataForm.consignee_phone.value;
                let consignee_address = consignmentDataForm.consignee_address.value;
                let consignee_tin = consignmentDataForm.consignee_tin.value;
                let notify_name = consignmentDataForm.notify_name.value;
                let notify_phone = consignmentDataForm.notify_phone.value;
                let notify_address = consignmentDataForm.notify_address.value;
                let notify_tin = consignmentDataForm.notify_tin.value;
               
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
                    consignee_name: consignee_name,
                    consignee_phone: consignee_phone,
                    consignee_address: consignee_address,
                    consignee_tin: consignee_tin,
                    notify_name: notify_name,
                    notify_phone: notify_phone,
                    notify_address: notify_address,
                    notify_tin: notify_tin,
                    instructions_file:newData.instructions_file
                }
                if(data != null) {
                    newData.status = data.status;
                    newData.id = data.id;
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
                    console.log("result: ",result);
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
        shippingForm = document.getElementById("booking_form");
        shippingForm.reset();
        var hasFile = false;
        var newData = {};
        var uploadShipBookingButton = document.getElementById("upload_ship_booking");
        var shipBookingInput = document.getElementById("file_ship_booking");
        var shipBookingLink = document.getElementById("link_ship_booking");
        if(data.files && data.files.length > 0){
            let shipBookingFile = data.files.filter(f=>f.name == "ship booking");
            if(shipBookingFile.length > 0) {
                shipBookingLink.href = files_url+"/"+shipBookingFile[0].filename;
                shipBookingLink.textContent = "View Ship Booking";
                hasFile = true;
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
                            hasFile = true;
                        },false)

                        reader.readAsDataURL(shipBookingInput.files[0]);
                    }
                    
                })
            })
        }
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
                let eta = new Date(data.shipping_details.eta);
                let etad = (1+ eta.getMonth())+"/"+eta.getDate()+"/"+eta.getFullYear();     
                shippingForm.eta.type = "text";        
                shippingForm.eta.value = etad; 
                let etb = new Date(data.shipping_details.etb);
                let etbd = (1+ etb.getMonth())+"/"+etb.getDate()+"/"+etb.getFullYear();     
                shippingForm.etb.type = "text";        
                shippingForm.etb.value = etbd; 
                let etd = new Date(data.shipping_details.etd);
                let etdd = (1+ etd.getMonth())+"/"+etd.getDate()+"/"+etd.getFullYear();     
                shippingForm.etd.type = "text";        
                shippingForm.etd.value = etdd;
                
            }
            if(shippingForm.terminal_carry_date.type == "text"){
                shippingForm.terminal_carry_date.addEventListener("focus",(e)=>{
                    e.target.type= "date";
                })
            }
            if(shippingForm.eta.type == "text"){
                shippingForm.eta.addEventListener("focus",(e)=>{
                    e.target.type= "date";
                })
            }
            if(shippingForm.etb.type == "text"){
                shippingForm.etb.addEventListener("focus",(e)=>{
                    e.target.type= "date";
                })
            }
            if(shippingForm.etd.type == "text"){
                shippingForm.etd.addEventListener("focus",(e)=>{
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
                newData.eta=Date.parse(shippingForm.eta.value);
                newData.etb=Date.parse(shippingForm.etb.value);
                newData.etd=Date.parse(shippingForm.etd.value);
                
                
                console.log("body: ",newData);
                if(!hasFile && newData.booking_confirmation == null){
                    alertDialog({description:"Please upload ship booking confirmation",actionText:"OK",title:"Ship Booking Confirmation"},null);
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
        var myFiles = (data && data.files) ? data.files.filter(f=>f.name.includes("ODG Certificate")) : [];
        var select = document.getElementById("odg_file_select");
        var fileInput = document.getElementById("odg_file_input");
        var myFileNames = myFiles.map(d=>d.name.toLowerCase());
        var filesToUpload = PREDOCUMENTS.filter(f=>{
            return myFileNames.indexOf(f.name.toLowerCase()) === -1;
        });
        if(select){
            if(select.hasChildNodes){
                Array.from(select.children).forEach((o,i)=>{if(i>0)select.removeChild(o);});
            }
            filesToUpload.forEach(doc=>{
                select.options.add(new Option(doc.name,doc.label));
            });

            select.addEventListener("change",(ev)=>{
                ev.stopPropagation();
                var selectedOption = select.options[select.options.selectedIndex];
                   if(selectedOption.value != "-1"){
                    fileInput.classList.remove("hidden");
                    fileInput.addEventListener("change",(e)=>{
                        e.preventDefault();
                        e.stopPropagation();
                        var file = e.target.files[0];
                        if(file){
                            selected = true;
                            var reader = new FileReader();
                            reader.addEventListener("load",(event)=>{
                                event.stopPropagation();
                                var url = URL.createObjectURL(file);
                                var fileObj = {url:url,label:selectedOption.value,name:selectedOption.text};
                                let k = 0;
                                var check = myFiles.filter((mf,i)=>{
                                    if(mf.label == selectedOption.value){
                                        k = i;
                                        return mf;
                                    }
                                });
                                if(check.length > 0){
                                    myFiles[k] = check[0];
                                }
                                else myFiles.push(fileObj);
                                fileInput.value = null;
                                fileInput.classList.add("hidden");

                                uploadConsignmentFile(currentUser.id,reader.result,data.id,"consignments_tb",fileObj.name)
                                .then(result=>{
                                    updateConsignmentList(result.data);
                                    showFeedback(result.msg,result.code);
                                    showODGFiles(myFiles,"odg");
                                })
                                .catch(e=>{
                                    showFeedback(e,1);
                                })
                            },false);
    
                            reader.readAsDataURL(file);
                        }
                    })
                }
                else{
                    fileInput.value = null;
                    fileInput.classList.add("hidden");
                }
            })
    
        }
        
        showODGFiles(myFiles,"odg");
       
        
    }
    if(index == 4){
        addContainerForm(data,CONTAINER_FIELDS);
    }
    if(index == 5){
        var myFiles = (data && data.files) ? data.files.filter(f=>{
            return (f.name == "custom release" || 
            f.name == "loading permission" ||
            f.name == "export permission" ||
            f.name == "screening report" ||
            f.name == "bill of lading")
        }) : [];

        showODGFiles(myFiles,"docs");
        var select = document.getElementById("document_file_select");
        var fileInput = document.getElementById("document_file_input");
        var myFileNames = myFiles.map(f=>f.name.toLowerCase());
        var filesToUpload = DOCUMENTS.filter(d=>{
            return myFileNames.indexOf(d.name.toLowerCase()) === -1;
        });
        
        if(select){
            if(select.hasChildNodes){
                Array.from(select.children).forEach((o,i)=>{if(i>0)select.removeChild(o);});
            }
            filesToUpload.forEach(doc=>{
                select.options.add(new Option(doc.label,doc.name));
            });

            select.addEventListener("change",(ev)=>{
                ev.preventDefault();
                var selectedOption = select.options[select.options.selectedIndex];
                if(selectedOption.value != "--select file--"){
                    fileInput.classList.remove("hidden");
                    fileInput.addEventListener("change",(e)=>{
                        e.preventDefault();
                        var file = e.target.files[0];
                        if(file){
                            var reader = new FileReader();
                            reader.addEventListener("load",()=>{
                                var url = URL.createObjectURL(file);
                                var fileObj = {url:url,name:selectedOption.value,label:selectedOption.text};
                                let k = 0;
                                var check = myFiles.filter((mf,i)=>{
                                    if(mf.label == selectedOption.value){
                                        k = i;
                                        return mf;
                                    }
                                });
                                if(check.length > 0){
                                    myFiles[k] = check[0];
                                }
                                else myFiles.push(fileObj);
                                fileInput.value = null;
                                fileInput.classList.add("hidden");

                                uploadConsignmentFile(currentUser.id,reader.result,data.id,"consignments_tb",fileObj.name)
                                .then(result=>{
                                    updateConsignmentList(result.data);
                                    showFeedback(result.msg,result.code);
                                    showODGFiles(myFiles,"docs");
                                })
                                .catch(e=>{
                                    showFeedback(e,1);
                                })
                            },false);
    
                            reader.readAsDataURL(file);
                        }
                    })
                }
                else{
                    fileInput.value = null;
                    fileInput.classList.add("hidden");
                }
            })    
        }
       
    }
}
//switch steps
const switchISteps = (position,data)=>{
    var progressSteps = Array.from(document.getElementById("iprogress-card-1").children);
    progressSteps.forEach((step)=>{
        step.classList.remove("current");
    });
    position = (position >=5 ) ? 5 :position;
    progressSteps[position-1].classList.add("current");
    switchIDetails(position,data);
}

const switchIDetails=(position,data)=>{
    var container = document.getElementById("import_form");
    Array.from(container.children).forEach((d,i)=>{
        if(d.id == "submit_row") d.classList.remove("hidden");
        else if(d.id.includes("idetail_") && d.id.split("_")[1] == position) d.classList.remove("hidden");
        else d.classList.add("hidden");
    });
    
    if(data != null) showConsignmentSummary(data,"import");
    document.getElementById("iprogress-card-1").classList.remove("hidden");
    
    var importForm = document.getElementById("import_form");
    if(importForm){
        let formData = data == null ? {}:data;
        formData.type =1;
        formData.tax_assessment_report = null;
        formData.tax_assessment_receipt = null;
        formData.release_order = null;
        if(position == 1){
            var customerSelect = importForm.icustomer_select;
            var customers = (storedData.customers) ? storedData.customers : [];
            var selectedCustomer = (data ==null) ? null:storedData.customers.filter(c=>c.id == data.exporter_id)[0];
            
            if(customerSelect){
                Array.from(customerSelect.children).forEach((child,idx)=>{
                    if(idx > 0) customerSelect.removeChild(child);
                });

                customers.forEach(customer=>{
                    customerSelect.options.add(new Option(customer.name,customer.id));
                });
                customerSelect.options.add(new Option("--add new customer--",-1));
                if(data != null) {
                    customerSelect.value = selectedCustomer.id;

                    importForm.importer_phone.value = selectedCustomer.phone;
                    importForm.importer_name.value = selectedCustomer.name;
                    importForm.importer_address.value = selectedCustomer.address+"\n\r"+selectedCustomer.region+","+selectedCustomer.country;
                    importForm.importer_tin.value = selectedCustomer.tin;
                    var clientDetail = currentUser.detail;
                    importForm.clearer_name.value = clientDetail.name;
                    importForm.clearer_phone.value = clientDetail.phone;
                    importForm.clearer_address.value = clientDetail.address;
                    importForm.clearer_code.value = clientDetail.code;
                    document.getElementById("checklist_fieldset").classList.remove("hidden");
                    document.getElementById("submit_row").classList.remove("hidden");
                    
                    if(data.files){
                        var notPredocs = ["tax_assessment_report","tax_assessment_receipt","release_order","tasad_invoice","tasad_delivery_order"];
                        var myF = [... new Set(data.files.map(f=>f.name.toLowerCase()))].filter(f=>notPredocs.indexOf(f) === -1);
                      
                        showPredocuments(data);

                    }
                    else {
                        showStandardDocs(data);
                    }
                    
                }
                else{
                    document.getElementById("checklist_fieldset").classList.add("hidden");
                    document.getElementById("submit_row").classList.add("hidden");
                }
                customerSelect.addEventListener("change",(e)=>{
                    if(e.target.value == -1) showCustomerDetailForm('imports_content');
                    else if(e.target.value != -2){
                        selectedCustomer = customers.filter(c=>{
                            return c.id == customerSelect.options[customerSelect.options.selectedIndex].value;
                        })[0];
            
                        importForm.importer_phone.value = selectedCustomer.phone;
                        importForm.importer_name.value = selectedCustomer.name;
                        importForm.importer_address.value = selectedCustomer.address+"\n\r"+selectedCustomer.region+","+selectedCustomer.country;
                        importForm.importer_tin.value = selectedCustomer.tin;
                        var clientDetail = currentUser.detail;
                        importForm.clearer_name.value = clientDetail.name;
                        importForm.clearer_phone.value = clientDetail.phone;
                        importForm.clearer_address.value = clientDetail.address;
                        importForm.clearer_code.value = clientDetail.code;

                        if(data == null){
                            let url = create_import_url+"/"+currentUser.id;
                            var body = {importer:selectedCustomer.id,clearer:clientDetail.id,code:clientDetail.code,type:1};
                            var options = {method:"POST",body:JSON.stringify(body),headers:
                            {'Content-type':'application/json','Authorization':'Bearer '+currentUser.accessToken}};
                            fetch(url,options)
                            .then(res=>res.json()).then(result=>{
                                console.log("new import: ",result);
                                if(result.code == 0){
                                    storedData.imports.push(result.data);
                                    storage.setItem("data",JSON.stringify(storedData));
                                    storedData = JSON.parse(storage.getItem("data"));
                                    data = result.data;
                                    showConsignmentSummary(data,"import");
                                    document.getElementById("checklist_fieldset").classList.remove("hidden");
                                    showStandardDocs(data);
                                }
                                else showFeedback("Oops! Something went wrong!",1)
                            })
                            .catch(e=>{
                                console.log("c: ",e);
                            })
                        }
                    }
                });   
            }
            var addMoreButton = document.getElementById("btn_more_documents");
            if(data && data.files.length > 0) {
                var notPredocs = ["tax_assessment_report","tax_assessment_receipt","release_order","tasad_invoice","delivery_order"];
                var myF = [... new Set(data.files.map(f=>f.name.toLowerCase()))];
                console.log("my: ",myF);
                showPredocuments(data);
            }
            else showStandardDocs(data);
            addMoreButton.addEventListener("click",(e)=>{
                addMoreDocsField(data.id);
            })
            
        }
        if(position == 2){
            Array.from(importForm.place_of_destination.children).forEach((c,i)=>{if(i>0) importForm.place_of_destination.removeChild(c)});
            Array.from(importForm.port_of_discharge.children).forEach((c,i)=>{if(i>0) importForm.port_of_discharge.removeChild(c)});
            Array.from(importForm.port_of_origin.children).forEach((c,i)=>{if(i>0) importForm.port_of_origin.removeChild(c)})
            importForm.cargo_classification.value = data.cargo_classification;
            COUNTRIES.forEach(c=>{
              importForm.place_of_destination.options.add(new Option(c.name))
            })
            
            importForm.place_of_destination.value = data.place_of_destination;
            importForm.place_of_delivery.value = data.place_of_delivery;
            PORTS.forEach(p=>{
                importForm.port_of_discharge.options.add(new Option(p.name+", "+p.code,p.code));
                importForm.port_of_origin.options.add(new Option(p.name+", "+p.code,p.code));
                
            });
            // var myPort = PORTS.filter(p=>p.name.toLowerCase() == data.place_of_delivery.toLowerCase());
            importForm.port_of_discharge.value = data.port_of_discharge;
            
            // PORTS.forEach(p=>importForm.port_of_origin.options.add(new Option(p.name+", "+p.code,p.code)));
            // importForm.port_of_origin.addEventListener("input",e=>{
            //     let org = e.target.value.toLowerCase();
            //     var ports = PORTS.filter(p=>p.name.toLowerCase().includes(org) || p.country.toLowerCase().includes(org)).map(p=>p.name+", "+p.code);
            //     loadPorts(ports,document.getElementById("isearchable_ports"),importForm.port_of_origin);
            // })
            importForm.port_of_origin.value = data.port_of_origin;
            importForm.no_of_containers.value = data.no_of_containers;
            importForm.goods_description.value = data.goods_description;
            importForm.no_of_packages.value = data.no_of_packages;
            importForm.package_unit.value = data.package_unit;
            importForm.gross_weight.value = data.gross_weight;
            importForm.gross_weight_unit.value = data.gross_weight_unit;
            importForm.gross_volume.value = data.gross_volume;
            importForm.gross_volume_unit.value = data.gross_volume_unit;
            importForm.net_weight.value = data.net_weight;
            importForm.net_weight_unit.value = data.net_weight_unit;
            importForm.invoice_value.value = data.invoice_value;
            importForm.invoice_currency.value = data.invoice_currency;
            importForm.freight_charge.value = data.freight_charge;
            importForm.freight_currency.value = data.freight_currency;
            importForm.imdg_code.value = data.imdg_code;
            importForm.packing_type.value = data.packing_type;
            importForm.oil_type.value = data.oil_type;
            importForm.shipping_mark.value = data.shipping_mark;
           
            importForm.icustomer_select.value = data.exporter_id;
            var fileInput = document.getElementById('excel_input');
            console.log("xtest:; ",data.no_of_containers ?data.no_of_containers:data.container_details.length);
            addContainerForm(data,CONTAINER_FIELDS,"imp_container_detail");
            fileInput.addEventListener('change',(e)=>{
                if(e.target.files[0]){
                    importContainersFromExcel(data,e.target.files[0]);
                }
            })
        }
        if(position == 3){
            if(data.assessment_date) {
                importForm.import_assessment_date.type = "text";
                var date = new Date(data.assessment_date);
                importForm.import_assessment_date.value = date.getDate()+"-"+(date.getMonth()+1)+"-"+date.getFullYear();
            }
            if(parseInt(data.assessment_appealed) >= 0){
                importForm.assessment_appeal.value = data.assessment_appealed;
                importForm.tax_appeal_comment.value = data.comments;
                document.getElementById("appeal_detail").classList.remove("hidden");
                document.getElementById("tax_comments").classList.remove("hidden");
            }
            importForm.assessment_appeal.addEventListener("change",(e)=>{
                let val = parseInt(e.target.value);
                if(val ==1){
                    document.getElementById("appeal_detail").classList.remove("hidden");
                    document.getElementById("tax_comments").classList.remove("hidden");
                }
                else if(val == 0){
                    document.getElementById("appeal_detail").classList.add("hidden");
                    document.getElementById("tax_comments").classList.remove("hidden");
                }
                else{
                    document.getElementById("appeal_detail").classList.add("hidden");
                document.getElementById("tax_comments").classList.add("hidden");
                }
            })
            importForm.tax_amount.value = parseInt(data.tax_amount);
            importForm.tax_currency.value = data.tax_currency;

            if(data.files && data.files.length > 0){
                data.files.forEach(file=>{
                    if(file.name.toLowerCase() == "tax_assessment_report" || file.name.toLowerCase() == "tax_assessment_receipt"){
                        let key = file.name.toLowerCase();
                        var check = document.getElementById(key+"_check");
                        check.className = "material-icons primary-dark-text";
                        var link = document.getElementById(key+"_link");
                        link.classList.remove("hidden");
                        link.href = files_url+"/"+file.filename;

                        let myFileInput = document.getElementById(key);
                        if(myFileInput){
                            myFileInput.addEventListener("change",e=>{
                                let reader = new FileReader();
                                if(e.target.files[0]){
                                    reader.addEventListener("load",()=>{
                                       
                                        let tmpLink = URL.createObjectURL(inputFile.files[0]);
                                        link.href = tmpLink;
                                        data.files = result.data.files;
                                        let myfilenames = data.files.map(f=>f.name.toLowerCase());
                                        if(myfilenames.includes("tax_assessment_receipt")){
                                            if(data.status <=3) formData.status = 4;
                                        }
                                        formData[key] = reader.result;
                                        if(key == "tax_assessment_report"){
                                            formData.tax_assessment_report = reader.result;
                                            formData.isUpdateTap = true;
                                        }
                                        if(key == "tax_assessment_receipt"){
                                            formData.tax_assessment_receipt = reader.result;
                                            formData.isUpdateTar = true;
                                        }
                                    },false);
                                    reader.readAsDataURL(e.target.files[0]);
                                }
                                
                                
                            })
                        }
                    }
                })
            }
            else{
                console.log("what's up")
                let reportFileInput = document.getElementById("tax_assessment_report");
                var check = document.getElementById("tax_assessment_report_check");
                check.className = "material-icons primary-dark-text hidden";
                var link = document.getElementById("tax_assessment_report_link");
                        
                if(reportFileInput){
                    reportFileInput.addEventListener("change",e=>{
                        e.preventDefault();
                        console.log("tax report...")
                        let reader = new FileReader();
                        if(e.target.files[0]){
                            reader.addEventListener("load",()=>{
                                let tmpLink = URL.createObjectURL(reportFileInput.files[0]);
                                link.href = tmpLink;
                                link.classList.remove("hidden");
                                check.classList.remove("hidden");
                                formData.tax_assessment_report = reader.result;
                                formData.isUpdateTap = false;
                            },false);
                            reader.readAsDataURL(e.target.files[0]);
                        }
                        
                        
                    })
                }
                let receiptFileInput = document.getElementById("tax_assessment_receipt");
                var check2 = document.getElementById("tax_assessment_receipt_check");
                check2.className = "material-icons primary-dark-text hidden";
                var link2 = document.getElementById("tax_assessment_receipt_link");
                      
                if(receiptFileInput){
                    receiptFileInput.addEventListener("change",e=>{
                        let reader = new FileReader();
                        if(e.target.files[0]){
                            reader.addEventListener("load",()=>{
                                let tmpLink = URL.createObjectURL(receiptFileInput.files[0]);
                                link2.href = tmpLink;
                                link2.classList.remove("hidden");
                                check2.classList.remove("hidden");
                                formData.tax_assessment_receipt = reader.result;
                                formData.isUpdateTar = false;
                            },false);
                            reader.readAsDataURL(e.target.files[0]);
                        }
                        
                        
                    })
                }
            }
        }
        if(position == 4){
            if(data.verification_date){
                importForm.verification_date.type = "text";
                var d = new Date(Date.parse(data.verification_date));
                if(d){
                    importForm.verification_date.value = d.getDate()+"-"+(d.getMonth()+1)+"-"+d.getFullYear();
                    importForm.verification_time.type = "text";
                    importForm.verification_time.value = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
                    importForm.verification_booking_no.value = data.verification_booking;
                }
                
                // importForm.verification_status.value = data.verification_status;
            }
            var check = document.getElementById("release_order_check");
            var link = document.getElementById("release_order_link");
            if(data.files){
                var file = data.files.filter(f=>f.name.toLowerCase() == "release_order")
                if(file.length > 0){
                    check.classList.remove("hidden");
                    link.href = files_url +"/"+file[0].filename;
                    link.classList.remove("hidden");
                }
           }
           addContainerForm(data,CONTAINER_FIELDS.filter(f=>f.forImport),"icontainer_forms");
           importForm.release_order.addEventListener("change",(e)=>{
                if(e.target.files[0]){
                    let reader = new FileReader();
                    reader.addEventListener("load",()=>{
                        check.classList.remove("hidden");
                        link.href = URL.createObjectURL(e.target.files[0]);
                        link.classList.remove("hidden");
                        formData.release_order = reader.result;
                        var file = data.files.filter(f=>f.name.toLowerCase() == "release_order")
                        if(file.length > 0){
                            formData.isUpdateRelease = true;
                        }
                        else formData.isUpdateRelease = false;
                    },false);
                    reader.readAsDataURL(e.target.files[0]);
                }
            })
        }
        if(position == 5){
            addContainerForm(data,CONTAINER_FIELDS.filter(f=>f.forImport),"ocontainer_forms");
          
            if(parseInt(data.tasad_paid) >= 0){
                importForm.tasad_paid.value = data.tasad_paid;
                importForm.tasad_fee.value = parseInt(data.tasad_fee);
                importForm.tasad_currency.value = data.tasad_currency;
                document.getElementById("tasad_fee_holder").classList.remove("hidden");
            }
            let hasFiles = false;
            if(data.files && data.files.length > 0){
                data.files.forEach(file=>{
                    console.log("test: ",file.name);
                    if(file.name.toLowerCase() == "tasad_invoice" || file.name.toLowerCase() == "tasad_delivery_order"){
                        hasFiles = true;
                        let key = file.name.toLowerCase();
                        var check = document.getElementById(key+"_check");
                        check.classList.remove("hidden")
                        var link = document.getElementById(key+"_link");
                        link.classList.remove("hidden");
                        link.href = files_url+"/"+file.filename;

                        let myFileInput = document.getElementById(key);
                        if(myFileInput){
                            myFileInput.addEventListener("change",e=>{
                                let reader = new FileReader();
                                if(e.target.files[0]){
                                    reader.addEventListener("load",()=>{
                                        let tmpLink = URL.createObjectURL(inputFile.files[0]);
                                        link.href = tmpLink;
                                        data.files = result.data.files;
                                        let myfilenames = data.files.map(f=>f.name.toLowerCase());
                                        if(myfilenames.includes("tasad_delivery_order")){
                                            if(data.status <= 5) formData.status = 6;
                                        }
                                        
                                        if(key == "tasad_delivery_order"){
                                            formData.tasad_delivery_order = reader.result;
                                            formData.isUpdateTsd = true;
                                        }
                                        if(key == "tasad_invoice"){
                                            formData.tasad_invoice = reader.result;
                                            formData.isUpdateTsr = true;
                                        }
                                    },false);
                                    reader.readAsDataURL(e.target.files[0]);
                                }
                                
                                
                            })
                        }
                    }
                })
            }
            
            console.log("what's up yoh")
            let orderFileInput = document.getElementById("tasad_delivery_order");
            var check = document.getElementById("tasad_delivery_order_check");
            check.className = "material-icons primary-dark-text hidden";
            var link = document.getElementById("tasad_delivery_order_link");
                    
            if(orderFileInput){
                orderFileInput.addEventListener("change",e=>{
                    e.preventDefault();
                    console.log("tasad order...")
                    let reader = new FileReader();
                    if(e.target.files[0]){
                        reader.addEventListener("load",()=>{
                            let tmpLink = URL.createObjectURL(orderFileInput.files[0]);
                            link.href = tmpLink;
                            link.classList.remove("hidden");
                            check.classList.remove("hidden");
                            formData.tasad_delivery_order = reader.result;
                            formData.isUpdateTsd = false;
                        },false);
                        reader.readAsDataURL(e.target.files[0]);
                    }
                    
                    
                })
            }
            let tasadReceiptFileInput = document.getElementById("tasad_invoice");
            var check2 = document.getElementById("tasad_invoice_check");
            check2.className = "material-icons primary-dark-text hidden";
            var link2 = document.getElementById("tasad_invoice_link");
                    
            if(tasadReceiptFileInput){
                tasadReceiptFileInput.addEventListener("change",e=>{
                    let reader = new FileReader();
                    if(e.target.files[0]){
                        reader.addEventListener("load",()=>{
                            let tmpLink = URL.createObjectURL(tasadReceiptFileInput.files[0]);
                            link2.href = tmpLink;
                            link2.classList.remove("hidden");
                            check2.classList.remove("hidden");
                            formData.tasad_invoice = reader.result;
                            formData.isUpdateTsr = false;
                        },false);
                        reader.readAsDataURL(e.target.files[0]);
                    }
                    
                    
                })
            }
        
        }
        importForm.addEventListener("submit",(e)=>{
            e.preventDefault();
            if(position == 1){
                formData.forwarder_id = importForm.icustomer_select.value;
                formData.forwarder_code = importForm.clearer_code.value;

            }
            if(position == 2){
                formData.cargo_classification = importForm.cargo_classification.value;
                formData.place_of_destination = importForm.place_of_destination.value;
                formData.place_of_delivery =    importForm.place_of_delivery.value;
                formData.port_of_discharge = importForm.port_of_discharge.value;
                formData.port_of_origin = importForm.port_of_origin.value;
                formData.no_of_containers = importForm.no_of_containers.value;
                formData.goods_description = importForm.goods_description.value;
                formData.no_of_packages = importForm.no_of_packages.value;
                formData.package_unit = importForm.package_unit.value;
                formData.gross_weight = importForm.gross_weight.value;
                formData.gross_weight_unit=importForm.gross_weight_unit.value;
                formData.gross_volume=importForm.gross_volume.value;
                formData.gross_volume_unit=importForm.gross_volume_unit.value;
                formData.net_weight=importForm.net_weight.value;
                formData.net_weight_unit = importForm.net_weight_unit.value;
                formData.invoice_value = importForm.invoice_value.value;
                formData.invoice_currency = importForm.invoice_currency.value;
                formData.freight_charge = importForm.freight_charge.value;
                formData.freight_currency = importForm.freight_currency.value;
                formData.imdg_code = importForm.imdg_code.value;
                formData.packing_type=importForm.packing_type.value;
                formData.oil_type=importForm.oil_type.value;
                formData.shipping_mark = importForm.shipping_mark.value;
              
                formData.forwarder_code = (formData && formData.forwarder_code) ? formData.forwarder_code: currentUser.detail.code;
                formData.exporter_id = importForm.icustomer_select.value;
                formData.status = (data.status <= 2) ? 3:data.status;
                if(data.container_details) {
                    var my_cont_data = [];
                    data.container_details.forEach((c,i)=>{
                            let d={id:c.id};
                        CONTAINER_FIELDS.forEach(fd=>{
                            let k=i+1;
                            let id = fd.id+"_"+k;
                            console.log("fd id: ",id);
                            let x = document.getElementById(id).value;
                            d[fd.id] = x;
                        })
                        my_cont_data.push(d);
                    })
                    formData.container_details = my_cont_data;
                }
                console.log("cd: ",formData.container_details);
    
            }
            if(position == 3){
                formData.tax_amount = importForm.tax_amount.value;
                formData.tax_currency = importForm.tax_currency.value;
                formData.assessment_appealed = importForm.assessment_appeal.value;
                formData.assessment_date = Date.parse(importForm.import_assessment_date.value);
                formData.comments = importForm.tax_appeal_comment.value;
                if(data.status == 3) formData.status = 4;
                
            }
            if(position == 4){
                formData.verification_date = importForm.verification_date.value +" "+importForm.verification_time.value;
                formData.verification_booking = importForm.verification_booking_no.value;
                // formData.verification_status = importForm.verification_status.value;
                if(formData.release_order != null){
                    if(formData.status == 4) formData.status = 5;
                }
                               
            }
            if(position == 5){
                formData.tasad_fee = importForm.tasad_fee.value;
                formData.tasad_currency = importForm.tasad_currency.value;
                formData.tasad_paid = importForm.tasad_paid.value;
                if(data.status == 5 && formData.tasad_delivery_order != null) formData.status = 6;
                
            }
            console.log("fd: ",formData);
            delete formData.expenses;
            delete formData.files;
            delete formData.invoices;
            // delete formData.container_details;
            delete formData.status_text;
            var method = (data == null) ? "POST" : "PUT";
            var options ={
                method:method,body:JSON.stringify(formData),headers:{
                    'Content-type':'application/json','Authorization': 'Bearer '+currentUser.accessToken
                }
            }
            var url = (data == null) ? consignment_url : consignment_url+"/"+currentUser.id+"/"+data.id;
            
            fetch(url,options)
            .then(res=>res.json())
            .then(result=>{
                console.log("ok result: ",result);
                if(result.code ==0){
                    storedData.imports = result.data;
                    let newData = result.data.find(d=>d.id == data.id);
                    console.log("new data: ",newData);
                    storage.setItem("data",JSON.stringify(storedData));
                    storedData = JSON.parse(storage.getItem("data"));
                    switchISteps(newData.status,newData);
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
//clsoe import form
const closeImportForm=()=>{
    var importForm = document.getElementById("import_form");
    importForm.reset();
    document.getElementById("import_forms").classList.add("hidden");
    document.getElementById("import_list").classList.remove("hidden");
    document.getElementById("add_import").classList.remove("hidden");
    console.log("check close: ",storedData.imports);
    showImportList(storedData.imports);
}
//import containers from xlsx
const importContainersFromExcel=(data,file)=>{
    let result = [];
    if(file){
        var reader = new FileReader();   
        reader.addEventListener("load",()=>{
            var wb = XLSX.read(reader.result,{type:'array'});
            var containerSheet = wb.Sheets["Containers"];
            var containers = XLSX.utils.sheet_to_json(containerSheet,{header:1});
            var columns = containers[0];
            var containerList = containers.slice(1).filter(i=>i.length > 0);
            console.log("data: ",containerList); 
            data.no_of_containers = (data.no_containers) ? data.no_of_packages+ containerList.length:containerList.length;
            containerList = containerList.map((cl,i)=>{
                let k = -(i +1);
                let c={
                    id:k,
                    cid:data.id,
                    mbl_number:cl[0],container_type:cl[1],container_no:cl[2],container_size:cl[3],seal_1:cl[4],seal_2:cl[5],seal_3:cl[6], 
                    freight_indicator:cl[7],no_of_packages:cl[8],package_unit:cl[9],volume:cl[10],volume_unit:cl[11],
                    weight:cl[12],weight_unit:cl[13],min_temp:cl[14],max_temp:cl[15],date_modified:Date.now()
                }
                return c;
            });
            data.container_details = containerList;
            columns = columns.map((c,i)=>{
                let ci = c.replaceAll("*","").replaceAll("#","").replaceAll(".","");
                let col={label:ci,id:ci.replaceAll(" ",'_').toLowerCase(),required:false,forImport:false,type:"text"};
                if(col.id == "type_of_container"){
                    col.id = "container_type";
                    col.label = "Type";
                    col.forImport=true;
                    col.required = true;
                    col.type = "select";
                    col.options = ["Standard","General Purpose","ISO Reefer","Insulated","Flat Rack","Open Top"];
                }
                if(col.id == "m_b/l_no" || col.id == "mb/l_no"){
                    col.id = "mbl_number";
                    col.label = "MBL No";
                    col.type = "text";
                }
                if(col.id == "container_no"){
                    col.forImport=true;
                    col.required=true;
                }
                if(col.id == "container_size"){
                    col.label = "Container Size";
                    col.type="text";
                }
                if(col.id == "seal_no1"){
                    col.id = "seal_1";
                    col.label = "Seal #1";
                    col.type="text"
                }
                if(col.id == "seal_no2"){
                    col.id = "seal_2";
                    col.label = "Seal #2";
                    col.type="text"
                }
                if(col.id == "seal_no3/out_of_gague"){
                    col.id = "seal_3";
                    col.label = "Seal #3";
                    col.type="text"
                }
                if(col.id == "no_of_package"){
                    col.id = "no_of_packages";
                    col.type = "number";
                    col.label = "No. Packages";
                }
                if(col.id == "minmum_temperature" || col.id=="minimum_temperature"){
                    col.id = "min_temp";
                    col.type = "number";
                    col.label = "Min Temp";
                }
                if(col.id == "maxmum_temperature" || col.id=="maximum_temperature"){
                    col.id = "max_temp";
                    col.type = "number";
                    col.label = "Max Temp";
                }
                if(col.id == "refer_plug_y/n"){
                    col.id = "plug_yn"
                    col.type = "select";
                    col.label = "Refer Plug";
                    col.options=["Y","N"];
                }
                
                return col;
            })
           
            addContainerForm(data,columns,"imp_container_detail");

        },false);
        reader.readAsArrayBuffer(file);
    }
}
//get imports data
const fetchImports =()=>{
    return new Promise((resolve,reject)=>{
        var options = {method:"GET",headers:{'Content-type':'application/json','Authorization':'Bearer '+currentUser.accessToken}};
        var url = create_import_url+"/"+currentUser.id;
        fetch(url,options)
        .then(res=>res.json())
        .then(result=>{
            console.log("import: ",result);
            resolve(result);
        })
        .catch(e=>{
            console.log("error: ",e);
            reject("Oops! Something went wrong, please try again later");
        })
    })
}
const sortConsignments = (data)=>{
    if(data == null || data == undefined) return [];
    return data.sort((a,b)=>{
        if(parseInt(a.id) - parseInt(b.id) === 0) return 0;
        else if(parseInt(b.id) - parseInt(a.id) < 0) return -1;
        else return 1;
    })
}
//show import form
const showImportForm =(source)=>{
        document.getElementById("imports_content").classList.remove("hidden");
        document.getElementById("import_list").classList.add("hidden");
        greet("Operations",{title:"Consignments",description:"Add"});
   
    document.getElementById(source).classList.add("hidden");
    const progressSteps = Array.from(document.getElementById("iprogress-card-1").children);
    progressSteps.forEach((step,index)=>{
        step.addEventListener("click",(e)=>{
            switchISteps(index+1,null);
        })
    })
    document.querySelector("#add_import").classList.add("hidden");
    document.querySelector("#import_summary").classList.add("hidden");
    const parent = document.getElementById("import_forms");
    parent.classList.remove("hidden");
    switchISteps(1,null);

    
}
const showImportDetail =(source,data)=>{
    document.getElementById("imports_content").classList.remove("hidden");
    document.getElementById("import_list").classList.add("hidden");
    greet("Operations",{title:"Consignments",description:"View"});
   
    document.getElementById(source).classList.add("hidden");
    const progressSteps = Array.from(document.getElementById("iprogress-card-1").children);
    progressSteps.forEach((step,index)=>{
        step.addEventListener("click",(e)=>{
            switchISteps(index+1,data);
        })
    })
    document.querySelector("#add_import").classList.add("hidden");
    const parent = document.getElementById("import_forms");
    parent.classList.remove("hidden");
    var position = (data == null) ? 1: data.status;
    if(data != null){
        var summaryDetail = document.getElementById("import_summary");
        summaryDetail.classList.remove("hidden");
        showConsignmentSummary(data,"import");
    }
    switchISteps(position,data);

    
}
const showStandardDocs = (data)=>{
    var addMoreRow = document.getElementById("add_more_row");
        var addMoreBut = document.getElementById("btn_more_documents");
        var parent = document.getElementById("checklist_collapsible");
        Array.from(parent.children).forEach(child=>{
            if(child.id != "add_more_row") parent.removeChild(child);
        })
        
    var myfiles = [{name:"bill_of_lading"},{name:"packing_list"},{name:"certificate_of_origin"},{name:"commercial_invoice"}];
    myfiles.forEach(file=>{
        var linkDiv = document.createElement("div");
        var fileLink = document.createElement("a");
        fileLink.textContent = "view file";
        fileLink.target = "_target";
        fileLink.classList.add("hidden");
        linkDiv.className ="row ml-2";
        fileLink.href = files_url+"/"+file.filename;
        linkDiv.appendChild(fileLink);
        
        const rowDiv = document.createElement("div");
        rowDiv.className = "row-space";
        const innerDiv = document.createElement("div");
        innerDiv.className = "row";
        
        const label = document.createElement("label");
        let labelText= file.name;
        if(file.name.length > 0){
            labelText = file.name.replaceAll("_"," ");
            labelText = labelText.substr(0,1).toUpperCase() + labelText.substr(1);
        }
        label.textContent = labelText;
        innerDiv.appendChild(label);
        const inputFile = document.createElement("input");
        inputFile.type = "file";
        inputFile.name = file.name;
        innerDiv.appendChild(inputFile);
        const check = document.createElement("span");
        check.id = file.name+"_check";
        check.className = "material-icons primary-dark-text hidden";
        check.textContent = "check_circle";
        innerDiv.appendChild(check);
        rowDiv.appendChild(innerDiv);
        rowDiv.appendChild(linkDiv);
        parent.insertBefore(rowDiv,addMoreRow);

        if(inputFile){
            inputFile.addEventListener("change",(e)=>{
            var reader = new FileReader();
            if(inputFile.files[0]){
                reader.addEventListener("load",()=>{
                    console.log("is it happening?");
                    uploadImportFiles(reader.result,data.id,file.name,null)
                    .then(result=>{
                        console.log("uploadfiles: ",result);
                        if(result.code == 0){
                            check.classList.remove("hidden");
                            let tmpLink = URL.createObjectURL(inputFile.files[0]);
                            fileLink.href = tmpLink;
                            fileLink.classList.remove("hidden");
                            
                            storedData.imports = result.data;
                            storage.setItem("data",JSON.stringify(storedData));
                            storedData = JSON.parse(storage.getItem("data"));
                            data = result.data.filter(r=>r.id == data.id)[0];
                            var fileNames = [... new Set(data.files.map(f=>f.name.toLowerCase()))];
                            if(fileNames.includes("bill_of_lading") && fileNames.includes("packing_list") && fileNames.includes("certificate_of_origin") && fileNames.includes("commercial_invoice")){
                                data.status = 2;
                                switchISteps(data.status,data);
                            }
                        }
                        showFeedback(result.msg,result.code);
                    })
                    .catch(e=>{
                        console.log("uploadImportFiles(): ",e);
                        showFeedback("Oops! Something went wrong!",1);
                    })
                },false);
                reader.readAsDataURL(inputFile.files[0]);
            }
        })
        }
        
    })
    addMoreBut.classList.add("hidden");
}
const showPredocuments = (data)=>{
    console.log("ok let u see")
    var addMoreRow = document.getElementById("add_more_row");
    var addMoreBut = document.getElementById("btn_more_documents");
    var parent = document.getElementById("checklist_collapsible");
    Array.from(parent.children).forEach(child=>{
        if(child.id != "add_more_row") parent.removeChild(child);
    })
    if(data.files.length > 0){
        var notPredocs = ["tax_assessment_report","tax_assessment_receipt","release_order","tasad_invoice","delivery_order"];
        var predocs = [... new Set(data.files.map(f=>f.name.toLowerCase()))].filter(f=>notPredocs.indexOf(f) === -1).map(f=>{
            let file = f;
            file = data.files.find(mf=>mf.name.toLowerCase() == f);
            return file;
        });
        predocs.forEach(file=>{
            var linkDiv = document.createElement("div");
            var fileLink = document.createElement("a");
            fileLink.textContent = "view file";
            fileLink.target = "_target";
            linkDiv.className ="row ml-2";
            fileLink.href = files_url+"/"+file.filename;
            linkDiv.appendChild(fileLink);
            
            const rowDiv = document.createElement("div");
            rowDiv.className = "row-space";
            const innerDiv = document.createElement("div");
            innerDiv.className = "row";
            
            const label = document.createElement("label");
            let labelText= file.name;
            if(file.name.length > 0){
                labelText = file.name.replaceAll("_"," ");
                labelText = labelText.substr(0,1).toUpperCase() + labelText.substr(1);
            }
            label.textContent = labelText;
            innerDiv.appendChild(label);
            const inputFile = document.createElement("input");
            inputFile.type = "file";
            inputFile.name = file.name;
            innerDiv.appendChild(inputFile);
            const check = document.createElement("span");
            check.id = file.name+"_check";
            check.className = "material-icons primary-dark-text";
            check.textContent = "check_circle";
            innerDiv.appendChild(check);
            rowDiv.appendChild(innerDiv);
            rowDiv.appendChild(linkDiv);
            parent.insertBefore(rowDiv,addMoreRow);

            inputFile.addEventListener("change",(e)=>{
                var reader = new FileReader();
                if(inputFile.files[0]){
                    reader.addEventListener("load",()=>{
                        
                        uploadImportFiles(reader.result,data.id,file.name,file.filename)
                        .then(result=>{
                             if(result.code == 0){
                            check.classList.remove("hidden");
                            let tmpLink = URL.createObjectURL(inputFile.files[0]);
                            fileLink.href = tmpLink;
                            fileLink.classList.remove("hidden");
                            // data.files = result.data.files;
                            // var imports = storedData.imports;
                            // let d = imports.find(i=>i.id == result.data.id);
                            // imports = storedData.imports.map(i=>{
                            //     let ni = i;
                            //     if(i.id == d.id) ni = d;
                            //     return ni;
                            // });
                            storedData.imports = result.data;
                            storage.setItem("data",JSOn.stringify(storedData));
                            storedData = JSON.parse(storage.getItem("data"));

                        }
                            showFeedback(result.msg,result.code);
                        })
                        .catch(e=>{
                            showFeedback("Oops! Something went wrong!",1);
                        })
                    },false);
                    reader.readAsDataURL(inputFile.files[0]);
                }
            })
        })
    }
   
}
const addMoreDocsField=(cid)=>{
    var addMoreRow = document.getElementById("add_more_row");
    var addMoreBut = document.getElementById("btn_more_documents");
    var parent = document.getElementById("checklist_collapsible");

    var linkDiv = document.createElement("div");
    var fileLink = document.createElement("a");
    fileLink.textContent = "view file";
    fileLink.classList.add("hidden");
    fileLink.target = "_target";
    linkDiv.className = "row ml-2";
    linkDiv.appendChild(fileLink);

    const rowDiv = document.createElement("div");
    rowDiv.className = "row-space";
    const innerDiv = document.createElement("div");
    innerDiv.className = "row";
    const inputName = document.createElement("input");
    inputName.name="file_name";
    inputName.id="file_name";
    inputName.type="text";
    inputName.placeholder = "Enter document name";
    innerDiv.appendChild(inputName);
    const label = document.createElement("label");
    innerDiv.appendChild(label);
    label.classList.add("hidden");
    const inputFile = document.createElement("input");
    inputFile.type = "file";
    inputFile.name = "more_file";
    inputFile.className = "hidden";
    innerDiv.appendChild(inputFile);
    addMoreBut.classList.add("hidden");
    const check = document.createElement("span");
    check.id = "more_file_check";
    check.className = "material-icons primary-dark-text hidden";
    check.textContent = "check_circle";
    innerDiv.appendChild(check);
    rowDiv.appendChild(innerDiv);
    
    parent.insertBefore(rowDiv,addMoreRow);
    rowDiv.appendChild(linkDiv);
    inputName.addEventListener("input",(e)=>{
        let name = (e.target.value.length > 0 && e.target.value.includes(" ")) ? e.target.value.toLowerCase().replaceAll(" ","_"):e.target.value.toLowerCase();
        inputFile.name = name;
        inputFile.id = name;
        inputFile.classList.remove("hidden");
        
    })
    if(inputFile){
        inputFile.addEventListener("change",(e)=>{
        var reader = new FileReader();
        if(inputFile.files[0]){
            reader.addEventListener("load",()=>{
                
                uploadImportFiles(reader.result,cid,inputFile.id)
                .then(result=>{
                    if(result.code == 0){
                        check.classList.remove("hidden");
                        let tmpLink = URL.createObjectURL(inputFile.files[0]);
                        fileLink.href = tmpLink;
                        fileLink.classList.remove("hidden");
                        addMoreBut.classList.remove("hidden");
                        label.textContent = inputName.value;
                        label.classList.remove("hidden");
                        inputName.classList.add("hidden");
                        storedData.imports = result.data;
                        storage.setItem("data",JSON.stringify(storedData));
                        storedData = JSON.parse(storage.getItem("data"));
                    }
                    showFeedback(result.msg,result.code);
                })
                .catch(e=>{
                    showFeedback("Oops! Something went wrong!",1);
                })
            },false);
            reader.readAsDataURL(inputFile.files[0]);
        }
    })
    }
    
    
}
//show Invoices
const showInvoiceList = (invoices,source=null)=>{
    // quotations = quotations.filter(q=>q.status.toLowerCase() != "discarded");
    greet("Finance",{title:"Invoices",description:"List of invoices"});
    if(source != null) document.getElementById(source).classList.add("hidden");
    else{
        const qContent = document.getElementById("invoices_content");
        Array.from(qContent.children).forEach((c,i)=>{
            if(i>1) c.classList.add("hidden");
        });
    }
    document.getElementById("add_invoice").classList.remove("hidden");
    const parent = document.getElementById("invoice_list");
    parent.classList.remove("hidden");
    Array.from(parent.children).forEach((c,i)=>{
        if(i>0) parent.removeChild(c);
    })
    if(invoices.length > 0){
        invoices.forEach((d,i)=>{
            const row = document.createElement("span");
            row.classList.add("consignment-row");
            row.classList.add("shadow-minor");
            // row.classList.add("status-indicator-"+d.status);
            const qNo = document.createElement("span");
            qNo.textContent = formatConsignmentNumber(d.id);
            row.appendChild(qNo);
    
            const customer = document.createElement("span");
            var customerInfo = storedData.customers.filter(c=>c.id == d.customer_id)[0];
            customer.textContent = customerInfo.name;
            row.appendChild(customer);
    
            const service = document.createElement("span");
            service.textContent = d.service;
            row.appendChild(service);
            
            
    
            const goods = document.createElement("span");
            goods.textContent = d.goods;
            row.appendChild(goods);
    
            const nContainer = document.createElement("span");
            nContainer.textContent = d.quantity;
            row.appendChild(nContainer);

            const qAmount = document.createElement("span");
            var myprice= USD_RATE * (parseFloat(d.price) - 0.01 * d.discount * d.price);
            qAmount.textContent = ((storedData.settings) ? storedData.settings.currency : "USD")+" "+thousandSeparator(parseFloat(myprice).toFixed(2));
            row.appendChild(qAmount);

            const qStatus = document.createElement("span");
            qStatus.textContent = d.status;
            if(d.status.toLowerCase() == "pending payment") {
                qStatus.classList.add("info-text");
                qStatus.classList.remove("success-text");
                qStatus.classList.remove("fail-text");
                row.classList.add("status-indicator-pending");
                row.classList.remove("status-indicator-approved");
                row.classList.remove("status-indicator-red");
            }
            else if(d.status.toLowerCase() == "awaiting manager's approval"){
                qStatus.classList.add("fail-text");
                qStatus.classList.remove("success-text");
                qStatus.classList.remove("info-text");
                row.classList.add("status-indicator-red");
                row.classList.remove("status-indicator-pending");
                row.classList.remove("status-indicator-approved");
            }
            if(d.status.toLowerCase() == "paid"){
                qStatus.classList.add("success-text");
                qStatus.classList.remove("fail-text");
                qStatus.classList.remove("info-text");
                row.classList.add("status-indicator-approved");
                row.classList.remove("status-indicator-pending");
                row.classList.remove("status-indicator-red");
            }
            
            row.appendChild(qStatus);

            parent.appendChild(row);

            row.addEventListener("click",(e)=>{
                showInvoiceForm("invoice_list",d.id);
            })
        })
        
    }
    else{
        const row = document.createElement("span");
        row.classList.add("consignment-row");
        row.classList.add("shadow-minor");
        row.textContent = "No Invoices";
        parent.appendChild(row);
    }
      
    
}
//show quotations
const showQuotationList = (quotations,source=null)=>{
    // quotations = quotations.filter(q=>q.status.toLowerCase() != "discarded");
    greet("Finance",{title:"Quotations",description:"List of quotations"});
    if(source != null) document.getElementById(source).classList.add("hidden");
    else{
        const qContent = document.getElementById("quotations_content");
        Array.from(qContent.children).forEach((c,i)=>{
            if(i>1) c.classList.add("hidden");
        });
    }
    document.getElementById("add_quotation").classList.remove("hidden");
    const parent = document.getElementById("quotation_list");
    parent.classList.remove("hidden");
    Array.from(parent.children).forEach((c,i)=>{
        if(i>0) parent.removeChild(c);
    })
    if(quotations.length > 0){
        quotations.filter(q=>q.status.toLowerCase() != "discarded").forEach((d,i)=>{

            const row = document.createElement("span");
            row.classList.add("consignment-row");
            row.classList.add("shadow-minor");
            // row.classList.add("status-indicator-"+d.status);
            const qNo = document.createElement("span");
            qNo.textContent = formatConsignmentNumber(d.id);
            row.appendChild(qNo);
    
            const customer = document.createElement("span");
            var customerInfo = storedData.customers.filter(c=>c.id == d.customer_id)[0];
            customer.textContent = customerInfo.name;
            row.appendChild(customer);
    
            const service = document.createElement("span");
            service.textContent = d.service;
            row.appendChild(service);
            
            
    
            const goods = document.createElement("span");
            goods.textContent = d.goods;
            row.appendChild(goods);
    
            const nContainer = document.createElement("span");
            nContainer.textContent = d.quantity;
            nContainer.style.textAlign = "center";
            row.appendChild(nContainer);

            const qAmount = document.createElement("span");
            var myprice = parseFloat(d.price).toFixed(2) - 0.01*d.price* d.discount;
            qAmount.textContent = storedData.settings.currency+" "+thousandSeparator(myprice);
            row.appendChild(qAmount);

            const qStatus = document.createElement("span");
            qStatus.textContent = d.status;
            if(d.status.toLowerCase() == "approved") {
                qStatus.classList.add("success-text");
                qStatus.classList.remove("info-text");
                qStatus.classList.remove("fail-text");
            }
            else if(d.status.toLowerCase() == "pending payment") {
                qStatus.classList.add("info-text");
                qStatus.classList.remove("success-text");
                qStatus.classList.remove("fail-text");
            }
            else {
                qStatus.classList.add("fail-text");
                qStatus.classList.remove("success-text");
                qStatus.classList.remove("info-text");
            }
            row.appendChild(qStatus);

            parent.appendChild(row);

            row.addEventListener("click",(e)=>{
                console.log("d: ",d);
                showQuotationForm("quotation_list",d.id);
            })
        })
        
    }
    else{
        const row = document.createElement("span");
        row.classList.add("consignment-row");
        row.classList.add("shadow-minor");
        row.textContent = "No Quotations";
        parent.appendChild(row);
    }
      
    
}
//show Quotation form
const showQuotationForm=(source,dataId=null)=>{
    if(source != "quotation_list"){
        document.getElementById("quotations_content").classList.remove("hidden");
        document.getElementById("quotation_list").classList.add("hidden");
       
        // activateMenu("exports")
    }
    
            var costItems = storedData.cost_items;
            var costContainer = document.getElementById("cost_container");
            const form = document.getElementById("my_quote_form");
            form.reset();
            var desc= "Create";
            if(dataId != null) desc = "View";
            greet("Finance",{title:"Quotations",description:desc});
            document.getElementById(source).classList.add("hidden");
        
            document.querySelector("#add_quotation").classList.add("hidden");
            const parent = document.getElementById("quotation_form");
            parent.classList.remove("hidden");

            const clientName = document.getElementById("client_name");
            const clientAddress = document.getElementById("client_address");
            const clientRegion = document.getElementById("client_region");

            var client = currentUser.detail;
            clientName.textContent = client.name;
            clientAddress.textContent = client.address.split(",")[0];
            clientRegion.textContent = client.region+", "+client.country;

            // var mgrYes = document.getElementById("mgr_yes");
            // var mgrNo = document.getElementById("mgr_no");
            var clientYes = document.getElementById("client_yes");
            var clientNo = document.getElementById("client_no");
            var clientLabel = document.getElementById("client_approval_label");
            // var mgrLabel = document.getElementById("mgr_approval_label");

            Array.from(form.cs_id.children).forEach((c,i)=>{
                if(i>0) form.cs_id.removeChild(c);
            });
            storedData.customers.forEach(c=>{
                form.cs_id.options.add(new Option(c.name,c.id));
            })

            form.cs_id.options.add(new Option("--add new customer--",-1));
            const costItemList = document.getElementById("cost_item_list");
            const costItemEl = document.getElementById("cost_item");
            const costItemCountEl = document.getElementById("item_count");
            const qNumber = document.getElementById("quotation_number");
            const qStatus = document.getElementById("status");
            qStatus.textContent = "";
            qStatus.style.color = "none";

            var customer = storedData.customers.filter(c=>c.id == form.cs_id.value)[0];
            var customerName = document.getElementById("cs_name");
            var customerAddress = document.getElementById("cs_address");
            var customerRegion = document.getElementById("cs_region");

            var newStatus = "Awaiting Manager's Approval";
            var myQItems = [];
            

            var data = storedData.quotations.filter(q=>q.id == dataId);
            if(data.length > 0){
                var print = document.getElementById("print");
                print.classList.remove("hidden");
                print.addEventListener("click",(e)=>{
                    window.print();
                })
                qNumber.textContent = "Quotation No: "+formatConsignmentNumber(dataId);
                form.cs_id.value = data[0].customer_id;
                var customer = storedData.customers.filter(c=>c.id == data[0].customer_id)[0];
                customerName.textContent = customer.name;
                customerAddress.textContent = customer.address.split(",")[0];
                customerRegion.textContent = customer.region +", "+ customer.country;

                form.goods.value = data[0].goods;
                form.service.value = data[0].service;
                form.quantity.value = data[0].quantity;
                form.discount.value = (data[0].discount) ? data[0].discount : 0;
                
                qStatus.textContent = data[0].status;
                
                if(data[0].status.toLowerCase() == "approved") {
                    qStatus.classList.add("success-text");
                }
                else qStatus.classList.add("fail-text");
                newStatus = data[0].status;
                if(data[0].status.toLowerCase() == "awaiting manager's approval"){
                    newStatus = "Awaiting Client Approval";
                    clientLabel.textContent = "Manager Approve";
                    // clientYes.addEventListener("click",(e)=>{
                    //     if(confirm("Are you sure you want to approve this item?")){
                    //         newStatus = "Awaiting Client Approval";
                    //         clientYes.src = "/img/yes.png";
                    //         clientNo.src = "/img/no_.png";
                    //         var url = quotation_url +"/"+currentUser.id;
                    //             var options = {method:"PUT",body:JSON.stringify({id:dataId,status:newStatus}),headers:{"Content-type":"application/json","Authorization":"Bearer "+currentUser.accessToken}}
                    //             // console.log("t: "+method,myData);
                    //             fetch(url,options)
                    //             .then(res=>res.json())
                    //             .then(result=>{
                    //                 console.log("result: ",result.data);
                    //                 storedData.quotations = result.data;
                    //                 storage.setItem("data",JSON.stringify(storedData));
                    //                 showFeedback(result.msg,result.code);
                    //                 closeQuotationForm(data[0]);
                    //             })
                    //             .catch(er=>{
                    //                 console.log("er: ",er);
                    //                 showFeedback("Something went wrong: "+e,1);
                    //             })
                    //     }
                    // })
                    clientNo.addEventListener("click",(e)=>{
                        newStatus = "Manager Denied";
                        clientNo.src = "/img/no.png";
                        clientYes.src = "/img/yes_.png";
                        })
                }
                else if(data[0].status.toLowerCase() == "awaiting client approval"){
                    clientYes.src = "/img/yes_.png";
                    clientLabel.textContent = "Client Approve";
                    
                    clientNo.addEventListener("click",(e)=>{
                        newStatus = "Client Denied";
                        clientNo.src = "/img/no.png";
                        clientYes.src = "/img/yes_.png";
                    })
                }
                else{
                    clientYes.classList.add("hidden");
                    clientNo.classList.add("hidden");
                    clientLabel.classList.add("hidden");
                }
                clientYes.addEventListener("click",(e)=>{
                        
                    if(confirm("Are you sure you want to approve this item?")){
                        var url = quotation_url +"/"+currentUser.id;
                            var options = {method:"PUT",body:JSON.stringify({id:dataId,status:newStatus}),headers:{"Content-type":"application/json","Authorization":"Bearer "+currentUser.accessToken}}
                            // console.log("t: "+method,myData);
                            fetch(url,options)
                            .then(res=>res.json())
                            .then(result=>{
                                console.log("result: ",data[0]);
                                storedData.invoices = result.data;
                                storage.setItem("data",JSON.stringify(storedData));
                                newStatus = storedData.invoices.find(iv=>iv.id  == dataId).status;
                                qStatus.textContent = newStatus;
                                clientYes.src = "/img/yes.png";
                                clientNo.src = "/img/no_.png";
                                showFeedback(result.msg,result.code);
                                closeInvoiceForm(data[0]);
                            })
                            .catch(er=>{
                                console.log("er: ",er);
                                showFeedback("Something went wrong: "+e,1);
                            })
                    }
                });
                var qItemsIds = data[0].items.split("_").map(id=>parseInt(id));
                console.log("qIIs: ",qItemsIds);
                console.log("cIs: ",costItems);
                myCostItems = [];
                qItemsIds.forEach((id)=>{
                    let item = costItems.filter(c=>c.id == id);
                    if(item.length > 0){
                        item[0].count = 1;
                        myCostItems.push(item[0]);
                    }
                })
            
                console.log("mcIs: ",myCostItems);
                showCostItems(myCostItems,form.discount.value,costItemList,data[0].status);

                if(data[0].status.toLowerCase() == "approved" || data[0].status.toLowerCase().includes("denied")){
                    form.btnSubmit.classList.add('hidden');
                    costContainer.classList.add("hidden");
                }
                else{
                    form.btnSubmit.classList.remove('hidden');
                    costContainer.classList.remove("hidden"); 
                }
            }
            else{
                clientYes.classList.add("hidden");
                clientNo.classList.add("hidden");
                clientLabel.classList.add("hidden");
            }
            
            form.cs_id.addEventListener("change",(e)=>{
                if(e.target.value == -1) showCustomerDetailForm('quotations_content');
                else if(e.target.value != -2){
                    var id = e.target.options[e.target.options.selectedIndex].value;
                    var cust = storedData.customers.filter(c=>c.id == id)[0];
                    customerName.textContent = cust.name;
                    customerAddress.textContent = cust.address.split(",")[0];
                    customerRegion.textContent = cust.region +", "+ cust.country;
                }
                
            })
            
            // var myItemIds = myCostItems.map(c=>c.id);
            Array.from(costItemEl.children).forEach((ch,i)=>{
                if(i>0) costItemEl.removeChild(ch);
            })
            costItems.forEach(ci=>{
                costItemEl.options.add(new Option(ci.name,ci.id));
            })
            costItemEl.addEventListener("change",(e)=>{
                let itemId = parseInt(e.target.value);
                let item = costItems.filter(c=>c.id == itemId);
                
                if(costItemCountEl.value){
                    console.log("value: ",costItemCountEl.value);
                    for(let i=0;i<parseInt(costItemCountEl.value);i++){
                        item[0].count = 1;
                        myCostItems.push(item[0]);
                    }
                }
                else{
                    item[0].count = 1;
                    myCostItems.push(item[0]);
                }
                console.log("cil: ",myCostItems);
                showCostItems(myCostItems,form.discount.value,costItemList);
                costItemCountEl.value = 1;
            })

            form.discount.addEventListener("input",(e)=>{
                let val = e.target.value;
                if(val){
                    showCostItems(myCostItems,val,costItemList);
                }
            })
            const cancelButton = document.getElementById("close_quote_form");
            if(cancelButton){
                cancelButton.addEventListener("click",(e)=>{
                    myCostItems = [];
                    Array.from(costItemList.children).forEach((c,i)=>{
                        if(i>0) costItemList.removeChild(c);
                    });
                    qNumber.textContent = "";
                    customerAddress.textContent = "";
                    customerName.textContent = "";
                    customerRegion.textContent = "";
                    closeQuotationForm();
                })
            }
            const discardButton = document.getElementById("discard_quote");
            if(dataId == null || data[0].status.toLowerCase() == "approved" || data[0].status.toLowerCase() == "discarded"){
                discardButton.classList.add("hidden");
            }
            if(data.length > 0){
                if(data[0].status.toLowerCase() == "awaiting manager's approval" || data[0].status.toLowerCase() == "awaiting client approval" || data[0].status == -1){
                    if(discardButton){
                        discardButton.classList.remove("hidden");
                        discardButton.addEventListener("click",(e)=>{
                            alertDialog({description:"Are you sure you want to discard this quotation?",actionText:"Discard",title:"Discard Quotation"},()=>{
                                var url = quotation_url +"/"+currentUser.id;
                                var options = {method:"PUT",body:JSON.stringify({id:dataId,status:"Discarded"}),headers:{"Content-type":"application/json","Authorization":"Bearer "+currentUser.accessToken}}
                                // console.log("t: "+method,myData);
                                fetch(url,options)
                                .then(res=>res.json())
                                .then(result=>{
                                    console.log("result: ",data[0]);
                                    storedData.quotations = result.data;
                                    storage.setItem("data",JSON.stringify(storedData));
                                    showFeedback(result.msg,result.code);
                                    closeQuotationForm(data[0]);
                                })
                                .catch(er=>{
                                    console.log("er: ",er);
                                    showFeedback("Something went wrong: "+e,1);
                                })
                            })
                        })
                    }
                }
            }
            else discardButton.classList.add("hidden");
            
            
            form.addEventListener("submit",(e)=>{
                e.preventDefault();
                var customerId = form.cs_id.options[form.cs_id.options.selectedIndex].value;
                var service = form.service.value;
                var goods = form.goods.value;
                var containerNum = form.quantity.value;
                var discount = form.discount.value;
                console.log("dx: ",myCostItems);
                var cost_items = myCostItems.map(i=>i.id).join("_");
                var sum = 0;
                myCostItems.forEach(i=>{
                    // var a = (i.count * i.cost)
                    sum += parseInt(i.price);
                    console.log("a: ",sum);
                });
                console.log("x: ",sum);
                var myData = {customer_id:customerId,service:service,goods:goods,quantity:containerNum,discount:discount,items:cost_items,price:sum};
                var method = "POST";
                if(dataId == null) myData.status = "Awaiting Manager's Approval";
                else{
                    method = "PUT";
                    myData.status = newStatus;
                    myData.id = dataId;
                }
                var url = quotation_url +"/"+currentUser.id;
                var options = {method:method,body:JSON.stringify(myData),headers:{"Content-type":"application/json","Authorization":"Bearer "+currentUser.accessToken}}
                console.log("t: "+method,myData);
                fetch(url,options)
                .then(res=>res.json())
                .then(result=>{
                    console.log("result: ",result);
                    
                    if(dataId == null) {
                        var nQ= result.data.filter(c=>storedData.quotations.map(q=>q.id).indexOf(c.id) === -1);
                        console.log("res: ",nQ);
                        dataId == nQ[0].id;
                    }

                    storedData.quotations = result.data;
                    storage.setItem("data",JSON.stringify(storedData));
                    showFeedback(result.msg,result.code);
                    showQuotationForm("quotation_form",dataId);
                })
                .catch(er=>{
                    console.log("er: ",er);
                    showFeedback("Something went wrong: "+e,1);
                })
            })
        
    
    
}

//show Invoice form
const showInvoiceForm=(source,dataId=null)=>{

    const form = document.getElementById("my_invoice_form"); 
    if(source != "invoice_list"){
        document.getElementById("invoices_content").classList.remove("hidden");
        document.getElementById("invoice_list").classList.add("hidden");
        form.reset();
    }
    showBankDetails();
    var costItems = storedData.cost_items;
    var costContainer = document.getElementById("inv_cost_container");
    const cancelButton = document.getElementById("close_invoice_form");
    const discardButton = document.getElementById("discard_invoice");
   
    mCostItems = myCostItems;
    var desc= "Create";
    if(dataId != null) desc = "View";
    greet("Finance",{title:"Invoices",description:desc});
    document.getElementById(source).classList.add("hidden");

    document.querySelector("#add_invoice").classList.add("hidden");
    const parent = document.getElementById("invoice_form");
    parent.classList.remove("hidden");

    const clientName = document.getElementById("inv_client_name");
    const clientAddress = document.getElementById("inv_client_address");
    const clientRegion = document.getElementById("inv_client_region");

    var client = currentUser.detail;
    clientName.textContent = client.name;
    clientAddress.textContent = client.address.split(",")[0];
    clientRegion.textContent = client.region+", "+client.country;

    var clientYes = document.getElementById("inv_yes");
    var clientNo = document.getElementById("inv_no");
    var clientLabel = document.getElementById("inv_approval_label");
    const consSelect = form.consignment_no;
    Array.from(form.inv_cs_id.children).forEach((c,i)=>{
        if(i>0) form.inv_cs_id.removeChild(c);
    });
    storedData.customers.forEach(c=>{
        form.inv_cs_id.options.add(new Option(c.name,c.id));
    })

    form.inv_cs_id.options.add(new Option("--add new customer--",-1));
    const costItemList = document.getElementById("inv_cost_item_list");
    const costItemEl = document.getElementById("inv_cost_item");
    const costItemCountEl = document.getElementById("inv_item_count");
    const qNumber = document.getElementById("invoice_number");
    const qStatus = document.getElementById("inv_status");
    qStatus.textContent = "";
    qStatus.style.color = "none";

    var customer = storedData.customers.filter(c=>c.id == form.inv_cs_id.value)[0];
    var customerName = document.getElementById("inv_cs_name");
    var customerAddress = document.getElementById("inv_cs_address");
    var customerRegion = document.getElementById("inv_cs_region");

    
    var newStatus = "Awaiting Manager's Approval";
    
    var data = storedData.invoices.filter(q=>q.id == dataId);
    if(data.length > 0){
        var print = document.getElementById("inv_print");
        print.classList.remove("hidden");
        print.addEventListener("click",(e)=>{
            window.print();
        })
        qNumber.textContent = "Invoice No: "+formatConsignmentNumber(dataId);
        form.inv_cs_id.value = data[0].customer_id;
        var customer = storedData.customers.filter(c=>c.id == data[0].customer_id)[0];
        customerName.textContent = customer.name;
        customerAddress.textContent = customer.address.split(",")[0];
        customerRegion.textContent = customer.region +", "+ customer.country;

        form.goods.value = data[0].goods;
        form.service.value = data[0].service;
        form.quantity.value = data[0].quantity;
        form.discount.value = (data[0].discount) ? data[0].discount : 0;
        
        qStatus.textContent = data[0].status;
        
        if(data[0].status.toLowerCase() == "paid") {
            qStatus.classList.add("success-text");
            qStatus.classList.remove("info-text");
            qStatus.classList.remove("fail-text");
            discardButton.classList.add("hidden");
            print.classList.remove("hidden");
            clientLabel.classList.add("hidden");
            clientYes.classList.add("hidden");
            clientNo.classList.add("hidden");
        }
        else if(data[0].status.toLowerCase() == "pending payment"){
            qStatus.classList.add("info-text");
            qStatus.classList.remove("success-text");
            qStatus.classList.remove("fail-text");
            clientLabel.classList.remove("hidden");
            clientYes.classList.remove("hidden");
            clientNo.classList.remove("hidden");
            clientLabel.textContent = "Client paid?";
        }
        else {
            qStatus.classList.add("fail-text");
            qStatus.classList.remove("success-text");
            qStatus.classList.remove("info-text");
            clientLabel.textContent = "Manager approved?";
            clientLabel.classList.remove("hidden");
            clientYes.classList.remove("hidden");
            clientNo.classList.remove("hidden");
        }
        newStatus = data[0].status;
        // if(data[0].status.toLowerCase() == "awaiting manager's approval"){
        
        //     clientLabel.textContent = "Manager Approve";
        //     newStatus = "Pending Payment";
        //     clientNo.addEventListener("click",(e)=>{
        //         newStatus = "Manager Denied";
        //         clientNo.src = "/img/no.png";
        //         clientYes.src = "/img/yes_.png";
        //         })
        // }
        // else if(data[0].status.toLowerCase() == "pending payment"){
            
        //     clientNo.addEventListener("click",(e)=>{
        //         newStatus = "Pending Payment";
        //         clientNo.src = "/img/no.png";
        //         clientYes.src = "/img/yes_.png";
        //     })
        // }
        // else{
        //     clientYes.classList.add("hidden");
        //     clientNo.classList.add("hidden");
        //     clientLabel.classList.add("hidden");
        // }

        clientYes.addEventListener("click",e=>{
            var question = "";
            var status = data[0].status;
            if(data[0].status.toLowerCase() === "pending payment"){
                question = "Has the client paid this invoice?";
                status = "Paid";
            }
            else if(data[0].status.toLowerCase() === "awaiting manager's approval"){
                question = "Are you sure you want to approve this invoice?";
                status = "Pending Payment";
            }
            if(confirm(question)){
                var url = invoices_url +"/"+currentUser.id;
                var myData = {id:dataId,status:status};
                var options = {method:"PUT",body:JSON.stringify(myData),headers:{"Content-type":"application/json","Authorization":"Bearer "+currentUser.accessToken}}
                
                fetch(url,options)
                .then(res=>res.json())
                .then(result=>{
                    console.log("result: ",result);
                    if(result.code === 0){
                        var nQ= result.data.find(c=>c.id == dataId);
                        console.log("res: ",nQ);
                    
                        storedData.invoices = result.data;
                        storage.setItem("data",JSON.stringify(storedData));
                        storedData = JSON.parse(storage.getItem("data"));
                        clientNo.src = "/img/no_.png";
                        clientYes.src = "/img/yes.png";
                        inv_status.textContent = nQ.status;
                        form.service.value = nQ.service;
                    }
                    
                    showFeedback(result.msg,result.code);
                    // showInvoiceForm("invoice_form",dataId);
                })
                .catch(er=>{
                    console.log("er: ",er);
                    showFeedback("Something went wrong: "+e,1);
                })
            }
            else return;
        });
    
        var qItemsIds = data[0].items.split("_").map(id=>parseInt(id));
        
        var item = {};
        qItemsIds.forEach(q=>{
            item[q] = (item[q] || 0 ) +1;
        })
        
        Object.entries(item).map(m=>{
        costItems.forEach(g=>{
            if(g.id == m[0]){
                let k = g;
                k.count = m[1];
                mCostItems.push(k);
            }
        })
    })
    
        showCostItems(mCostItems,form.discount.value,costItemList,data[0].status);

        if(data[0].status.toLowerCase() == "paid"){
            form.btnSubmit.classList.add('hidden');
            costContainer.classList.add("hidden");
        }
        else{
            form.btnSubmit.classList.remove('hidden');
            costContainer.classList.remove("hidden"); 
        }
    }
    else{
        clientYes.classList.add("hidden");
        clientNo.classList.add("hidden");
        clientLabel.classList.add("hidden");
    }
    
    
    form.inv_cs_id.addEventListener("change",(e)=>{
        if(e.target.value == -1) showCustomerDetailForm('invoices_content');
        else if(e.target.value != -2){
            var id = e.target.options[e.target.options.selectedIndex].value;
            var cust = storedData.customers.filter(c=>c.id == id)[0];
            customerName.textContent = cust.name;
            customerAddress.textContent = cust.address.split(",")[0];
            customerRegion.textContent = cust.region +", "+ cust.country;
            consSelect.classList.remove("hidden");

            var cons = storedData.consignments.filter(c=>c.exporter_id == id);
            
            Array.from(consSelect.children).forEach((c,i)=>{if(i>0) consSelect.removeChild(c);})
            cons.forEach(c=>{
                consSelect.options.add(new Option(formatConsignmentNumber(c.id),c.id));
            })
            consSelect.addEventListener('change',(e)=>{
                var con = cons.find(c=>c.id == e.target.value);
                form.quantity.value = con.no_of_containers;
                form.goods.value = con.goods_description;
            });
        }
        else consSelect.classList.add("hidden");
        
    })
   
    // var myItemIds = myCostItems.map(c=>c.id);
    Array.from(costItemEl.children).forEach((ch,i)=>{
        if(i>0) costItemEl.removeChild(ch);
    })
    costItems.forEach(ci=>{
        costItemEl.options.add(new Option(ci.name,ci.id));
    })
    costItemEl.addEventListener("change",(e)=>{
        let itemId = parseInt(e.target.value);
        let item = costItems.find(c=>c.id == itemId);
        
        if(costItemCountEl.value) item.count = parseInt(costItemCountEl.value);
        else{
            item.count = 1;
        }
        if(item.per_container === 1){
            let q = item.count * parseInt(form.quantity.value.trim());
            item.count =q;
        }
        mCostItems.push(item);
        myCostItems = mCostItems;
        showCostItems(mCostItems,form.discount.value,costItemList);
        costItemCountEl.value = 1;
        e.target.value = -1;
    })

    form.discount.addEventListener("input",(e)=>{
        let val = e.target.value;
        if(val){
            showCostItems(myCostItems,val,costItemList);
        }
    })
    if(cancelButton){
        cancelButton.addEventListener("click",(e)=>{
            myCostItems = [];
            Array.from(costItemList.children).forEach((c,i)=>{
                if(i>0) costItemList.removeChild(c);
            });
            qNumber.textContent = "";
            customerAddress.textContent = "";
            customerName.textContent = "";
            customerRegion.textContent = "";
            closeInvoiceForm();
        })
    }
    if(dataId == null || data[0].status.toLowerCase() == "approved" || data[0].status.toLowerCase() == "discarded"){
        discardButton.classList.add("hidden");
        // form.btnSubmit.classList.add("hidden");
    }
    if(data.length > 0){
        if(data[0].status.toLowerCase() == "awaiting manager's approval" || data[0].status.toLowerCase() == "pending payment" || data[0].status == -1){
            if(discardButton){
                discardButton.classList.remove("hidden");
                discardButton.addEventListener("click",(e)=>{
                    alertDialog({description:"Are you sure you want to discard this invoice?",actionText:"Discard",title:"Discard Invoice"},()=>{
                        var url = invoices_url +"/"+currentUser.id;
                        var options = {method:"PUT",body:JSON.stringify({id:dataId,status:"Discarded"}),headers:{"Content-type":"application/json","Authorization":"Bearer "+currentUser.accessToken}}
                        // console.log("t: "+method,myData);
                        fetch(url,options)
                        .then(res=>res.json())
                        .then(result=>{
                            console.log("result: ",data[0]);
                            storedData.invoices = result.data;
                            storage.setItem("data",JSON.stringify(storedData));
                            showFeedback(result.msg,result.code);
                            // closeInvoiceForm(data[0]);
                        })
                        .catch(er=>{
                            console.log("er: ",er);
                            showFeedback("Something went wrong: "+e,1);
                        })
                    })
                })
            }
        }
    }
    else discardButton.classList.add("hidden");
    
    
    form.addEventListener("submit",(e)=>{
        e.preventDefault();
        var customerId = form.inv_cs_id.options[form.inv_cs_id.options.selectedIndex].value;
        var service = form.service.value;
        var goods = form.goods.value;
        var containerNum = form.quantity.value;
        var discount = form.discount.value;
        var consignment = form.consignment_no.value

        var cost_items = myCostItems.map(i=>{
            let k = i.id;
            if(i.count > 1){
                for(p=1;p<i.count;p++){
                    k = k+"_"+i.id;
                }
            }
            return k;
            
        }).join("_");
        var sum = 0;
        myCostItems.forEach(i=>{
            sum += parseInt(i.price);
        });
        var myData = {customer_id:customerId,service:service,goods:goods,quantity:containerNum,discount:discount,items:cost_items,price:sum,consignment:consignment};
        var method = "POST";
        if(dataId == null) myData.status = "Awaiting Manager's Approval";
        else{
            method = "PUT";
            myData.status = newStatus;
            myData.id = dataId;
        }
        console.log("my data: ",myData);
        var url = invoices_url +"/"+currentUser.id;
        var options = {method:method,body:JSON.stringify(myData),headers:{"Content-type":"application/json","Authorization":"Bearer "+currentUser.accessToken}}
        
        fetch(url,options)
        .then(res=>res.json())
        .then(result=>{
            console.log("result: ",result);            
            storedData.invoices = result.data;
            storage.setItem("data",JSON.stringify(storedData));
            
            showFeedback(result.msg,result.code);
            showInvoiceForm("invoice_form",dataId);
        })
        .catch(er=>{
            console.log("er: ",er);
            showFeedback("Something went wrong: "+e,1);
        })
    })
    
}
//close invoice form
const closeInvoiceForm=(invoice=null) =>{
    var form = document.getElementById("my_invoice_form");
    form.reset();
    
    document.getElementById("invoice_form").classList.add("hidden");
    // if(invoice == null){
        document.getElementById("invoice_list").classList.remove("hidden");
        document.querySelector("#add_invoice").classList.remove("hidden");
        showInvoiceList(storedData.invoices);
    // }
    // else{
    //     showInvoiceForm("invoice_list",invoice.id);
    // }
    
}
//show printable Quotation
const showPrintableQuotation=(data)=>{
   
    const form = document.getElementById("my_quote_form");
    form.reset();
    
    const parent = document.getElementById("quotation_print");
    parent.classList.remove("hidden");

    const clientName = document.getElementById("client_name");
    const clientAddress = document.getElementById("client_address");
    const clientRegion = document.getElementById("client_region");

    const dateCreated = document.getElementById("d_created");
    const dateModified = document.getElementById("d_modified");
    const dateDue = document.getElementById("d_expire");

    var cdate = new Date(data.date_created);
    var mdate = new Date(data.date_modified);
    var edate = new Date(data.date_modified + (30*24*3600*1000));

    dateCreated.textContent = "Created on: "+cdate.getDate()+"/"+(cdate.getMonth()+1)+"/"+cdate.getFullYear();
    dateModified.textContent = "Last modified: "+mdate.getDate()+"/"+(mdate.getMonth()+1)+"/"+mdate.getFullYear();
    dateDue.textContent = "Valid until: "+edate.getDate()+"/"+(edate.getMonth()+1)+"/"+edate.getFullYear();

    var client = currentUser.detail;
    clientName.textContent = client.name;
    clientAddress.textContent = client.address.split(",")[0];
    clientRegion.textContent = client.region+", "+client.country;

    
    const costItemList = document.getElementById("cost_item_list");
    const qNumber = document.getElementById("quotation_number");

    var customer = storedData.customers.filter(c=>c.id == parseInt(data.customer_id))[0];
    var customerName = document.getElementById("cs_name");
    var customerAddress = document.getElementById("cs_address");
    var customerRegion = document.getElementById("cs_region");

    var costItems = storedData.cost_items;
    qNumber.textContent = "Quotation No: "+formatConsignmentNumber(data.id);
    
    var customer = storedData.customers.filter(c=>c.id == data.customer_id)[0];
    customerName.textContent = customer.name;
    customerAddress.textContent = customer.address.split(",")[0];
    customerRegion.textContent = customer.region +", "+ customer.country;

    form.goods.value = data.goods;
    form.service.value = data.service;
    form.quantity.value = data.quantity;
    form.discount.value = (data.discount) ? data.discount : 0;
    
    var qItemsIds = data.items.split("_").map(id=>parseInt(id));
    var qItems = costItems.filter((c,i)=>{
        return qItemsIds.indexOf(c.id) !== -1;
    }).map(c=>{
        c.count = 1;
        return c;
    });
    
    showCostItems(qItems,data.discount,costItemList,"-1");
    
    
}
//show printable invoice
const showPrintableInvoice=(data)=>{
   showBankDetails();
    const form = document.getElementById("my_invoice_form");
    form.reset();
    
    const parent = document.getElementById("quotation_print");
    parent.classList.remove("hidden");

    const clientName = document.getElementById("client_name");
    const clientAddress = document.getElementById("client_address");
    const clientRegion = document.getElementById("client_region");

    const dateCreated = document.getElementById("d_created");
    const dateModified = document.getElementById("d_modified");
    const dateDue = document.getElementById("d_due");

    var cdate = new Date(data.date_created);
    var mdate = new Date(data.date_modified);
    var duedate = new Date(data.date_modified + (30*24*3600*1000));

    dateCreated.textContent = "Created on: "+cdate.getDate()+"/"+(cdate.getMonth()+1)+"/"+cdate.getFullYear();
    dateModified.textContent = "Last modified: "+mdate.getDate()+"/"+(mdate.getMonth()+1)+"/"+mdate.getFullYear();
    dateDue.textContent = "Due on: "+duedate.getDate()+"/"+(duedate.getMonth()+1)+"/"+duedate.getFullYear();

    var client = currentUser.detail;
    clientName.textContent = client.name;
    clientAddress.textContent = client.address.split(",")[0];
    clientRegion.textContent = client.region+", "+client.country;

    
    const costItemList = document.getElementById("cost_item_list");
    const qNumber = document.getElementById("quotation_number");

    var customer = storedData.customers.filter(c=>c.id == parseInt(data.customer_id))[0];
    var customerName = document.getElementById("cs_name");
    var customerAddress = document.getElementById("cs_address");
    var customerRegion = document.getElementById("cs_region");

    var costItems = storedData.cost_items;
    qNumber.textContent = "Invoice No: "+formatConsignmentNumber(data.id);
    
    var customer = storedData.customers.filter(c=>c.id == data.customer_id)[0];
    customerName.textContent = customer.name;
    customerAddress.textContent = customer.address.split(",")[0];
    customerRegion.textContent = customer.region +", "+ customer.country;

    form.goods.value = data.goods;
    form.service.value = data.service;
    form.quantity.value = data.quantity;
    form.discount.value = (data.discount) ? data.discount : 0;
    
    var qItemsIds = data.items.split("_").map(id=>parseInt(id));
    var qItems = costItems.filter((c,i)=>{
        return qItemsIds.indexOf(c.id) !== -1;
    }).map(c=>{
        c.count = 1;
        return c;
    });
    
    showCostItems(qItems,data.discount,costItemList,"-1");
    
    
}
const closeQuotationForm=(quotation=null) =>{
    var form = document.getElementById("my_quote_form");
    form.reset();
    
    document.getElementById("quotation_form").classList.add("hidden");
    if(quotation == null){
        document.getElementById("quotation_list").classList.remove("hidden");
        document.querySelector("#add_quotation").classList.remove("hidden");
        showQuotationList(storedData.quotations);
    }
    else{
        showQuotationForm("quotation_list",quotation.id);
    }
    
}
//show cost items
const showCostItems = (items,discount,container,status=null)=>{
    if(discount == null) discount = 0;
    Array.from(container.children).forEach((c,i)=>{
        if(i>0) container.removeChild(c);
    });
    
    var summary =items;    
    var sum = 0;
    var disc = 0;
    if(summary.length > 0){
        summary.forEach((item,idx)=>{
            var amount = item.count * item.price;
            sum += amount;
            const row = document.createElement("span");
            row.classList.add("body-row");
            row.classList.add("shadow-minor");
            const sn = document.createElement("span");
            const desc = document.createElement("span");
            const qtty = document.createElement("span");
            const price = document.createElement("span");
            const amt = document.createElement("span");
            amt.style.textAlign = "right";
            price.style.textAlign = "right";
            qtty.style.textAlign = "right";
            qtty.style.alignSelf = "flex-end";

    
            sn.textContent = (idx +1);
            desc.textContent = item.name;
            qtty.textContent = item.count;
            price.textContent = thousandSeparator(item.price);
            amt.textContent = thousandSeparator(amount);

            row.appendChild(sn);
            row.appendChild(desc);
            row.appendChild(qtty);
            row.appendChild(price);
            row.appendChild(amt);
            
            const actionSpan = document.createElement("span");
            const removeBut = document.createElement("span");
            removeBut.classList.add("material-icons");
            actionSpan.classList.add("actions-dis");
            removeBut.textContent = "close";
            actionSpan.appendChild(removeBut);
            row.appendChild(actionSpan);
            if(status == null || status.toLowerCase() == "awaiting manager's approval"){
                actionSpan.classList.remove("actions");
                actionSpan.classList.add("actions-dis");
                removeBut.addEventListener("click",e=>{
                    myCostItems = items.filter(i=>i.id != item.id);

                    showCostItems(myCostItems,discount,container);
                })
            }
            else{
                actionSpan.classList.add("hidden");
                row.classList.remove("shadow-minor");
            }
            container.appendChild(row);

            
        });
        disc = discount * sum /100;
        const space = document.createElement("span");
        space.classList.add("vspace");
        const space1 = document.createElement("span");
        space1.classList.add("vspace");
        const space2 = document.createElement("span");
        space2.classList.add("vspace");
        const summaryRow = document.createElement("div");
        summaryRow.classList.add("row");
        summaryRow.style.marginTop = "2em";

        const sTotal = document.createElement("span");
        sTotal.classList.add("row-end");
        // total.style.textAlign = "right";
        sTotal.textContent = "Subtotal: ";
        container.appendChild(sTotal);


        const sTotalVal = document.createElement("span");
        sTotalVal.classList.add("row-end");
        // total.style.textAlign = "right";
        sTotalVal.textContent = "USD "+thousandSeparator(sum);
        container.appendChild(sTotalVal);
        summaryRow.appendChild(sTotal);
        summaryRow.appendChild(sTotalVal);
        summaryRow.appendChild(space);
        container.appendChild(summaryRow);

        const summaryRow2 = document.createElement("div");
        summaryRow2.classList.add("row");


        const discSpan = document.createElement("span");
        discSpan.classList.add("row-end");
        // total.style.textAlign = "right";
        discSpan.textContent = "Discount ("+discount+"%): ";
        summaryRow2.appendChild(discSpan);

        const discSpanVal = document.createElement("span");
        discSpanVal.classList.add("row-end");
        // total.style.textAlign = "right";
        discSpanVal.textContent = "USD "+thousandSeparator(disc);
        summaryRow2.appendChild(discSpanVal);
        summaryRow2.appendChild(space1);
        container.appendChild(summaryRow2);

        const summaryRow3 = document.createElement("div");
        summaryRow3.classList.add("row");

        const total = document.createElement("span");
        total.classList.add("medium-text");
        total.classList.add("row-end");
        // total.style.textAlign = "right";
        total.textContent = "TOTAL: ";
        summaryRow3.appendChild(total);

        const totalVal = document.createElement("span");
        totalVal.classList.add("medium-text");
        totalVal.classList.add("row-end");
        // total.style.textAlign = "right";
        totalVal.textContent = "USD "+thousandSeparator(sum - disc);
        summaryRow3.appendChild(totalVal);
        summaryRow3.appendChild(space2);
        container.appendChild(summaryRow3);
    }
   
}

//petty cash

const savePettyCash = (data)=>{
    if(data != null && data != undefined){
        var url = petty_cash_url+"/"+currentUser.id;
        var body = JSON.stringify(data);
        var options = {method:"POST",body:body,headers:{
            'Content-type':'application/json','Authorization': 'Bearer '+currentUser.accessToken
        }}

        fetch(url,options)
        .then(res=>res.json())
        .then(result=>{
            console.log("result: ",result);
            storedData.petty_cash = result.data;
            storage.setItem("data",JSON.stringify(storedData));
            storedData = JSON.parse(storage.getItem("data"));
            showFeedback(result.msg,result.code);
            showPettyCash(storedData.petty_cash,data.date_created);

        })
        .catch(e=>{
            console.log("error: ",e);
            showFeedback("Oops! Something went wrong! Please try again later",1)
        })
    }
}

const showPettyCashDates = (dates,activeDate)=>{
    var dateTabs = document.getElementById("date_tabs");
    Array.from(dateTabs.children).forEach(c=>dateTabs.removeChild(c));
    dates.sort((a,b)=>{
        if(a - b < 0) return -1;
        else return 1;
    }).forEach(d=>{
        const tab = document.createElement("span");
        tab.classList.add("tab");
        if(d == activeDate) {
            tab.classList.add("tab-active");
        }
        var date = new Date(d);
        tab.id = d;
        tab.textContent = date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear().toString().substring(2);
        dateTabs.appendChild(tab);
        tab.addEventListener("click",(e)=>{
            Array.from(dateTabs.children).forEach(c=>c.classList.remove("tab-active"));
            tab.classList.add("tab-active");
            var records = storedData.petty_cash;
            showPettyCash(records,d,{startDate:dates[0],endDate:dates[dates.length -1]});
        });
        if(d == activeDate) tab.scrollIntoView();
    })
}
const showPettyCashForm = (openingBal)=>{
    var form = document.getElementById("pettycash_form");
    if(form){
        var cons = storedData.consignments.filter(c=>c.status <= 10);
        Array.from(form.pettycash_consignment.children).forEach((c,i)=>{if(i>0) form.pettycash_consignment.removeChild(c);});
        cons.forEach(c=>{
            form.pettycash_consignment.options.add(new Option((formatConsignmentNumber(c.id)),c.id));
        })
        form.addEventListener("submit",(e)=>{
            e.preventDefault();
            
            let date = Date.now();
            let dateString = form.pettycash_date.value;
            date = Date.parse(dateString);
            let voucher = form.pettycash_voucher.value.trim();
            let desc = form.pettycash_description.value.trim();
            let type = parseInt(form.pettycash_type.options[form.pettycash_type.options.selectedIndex].value);
            let amount = form.pettycash_amount.value.trim();
            let name = form.pettycash_name.value.trim();
            let consignment = form.pettycash_consignment.value;

            var opening_bal = openingBal;
            var closing_bal = (type == 0) ? parseInt(opening_bal) - parseInt(amount) : parseInt(opening_bal) + parseInt(amount);
            
            let formData = {date_created:date,voucher:voucher,description:desc,type:type,amount:amount,name:name,balance:closing_bal,consignment:consignment};
            console.log("formdata: ",formData);
            savePettyCash(formData);
            form.reset();
        })
    }
}
const showPettyCash = (records,activeDate,period=null)=>{
    var container = document.getElementById("pettycash_list");
    var form = document.getElementById("pettycash_form");
    var oBal = document.getElementById("opening_balance");
    var cBal = document.getElementById("closing_balance");
    Array.from(container.children).forEach(c=>{
        if(c.tagName.toLowerCase() == "div") container.removeChild(c);
    })

    var displayDates = [];
    
    if(period != null){
        displayDates = [];
        var startDate = (typeof(period.startDate) == "number") ? period.startDate : Date.parse(period.startDate);
        var endDate =  (typeof(period.endDate) == "number") ? period.endDate : Date.parse(period.endDate);
        var interval = (endDate - startDate)/86400000;
        for(let i=0;i<=interval;i++){
            let d = startDate + i*86400000;
            displayDates.push(d);
        }
    }
    else{
        displayDates = [];
        for(let i=0; i<15;i++){
            let d = activeDate - i*86400000;
            displayDates.push(d);
        }
    
    }

    showPettyCashDates(displayDates,activeDate);
    var openingBal = 0;
    var closingBal = 0;
    if(records && records.length > 0){
        console.log("sc1: ",records);
       
        var refDate = new Date(parseInt(activeDate));
        var refDateString = refDate.getDate()+"/"+(refDate.getMonth()+1)+"/"+refDate.getFullYear();
        var myRecs = records.filter(r=>{
            var date = new Date(parseInt(r.date_created));
            var dateString = date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();       
            
            return dateString == refDateString;
        });
       
        console.log("sc12: ",myRecs);
       if(myRecs.length > 0){
        myRecs.forEach((data,i)=>{
            // if(data.length)
           if(i == 0) openingBal = (data.type == 0) ? parseInt(data.balance) + parseInt(data.amount): parseInt(data.balance) - parseInt(data.amount);
           if(i == myRecs.length -1) closingBal = data.balance;
           
            const row = document.createElement("div");
            row.className = "body-row shadow-minor";
            const spNum = document.createElement("span");
            spNum.textContent = formatConsignmentNumber(data.id);
            row.appendChild(spNum);
    
            const spDate = document.createElement("span");
            var date = new Date(parseInt(data.date_created));
            spDate.textContent = date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear().toString().substring(2);
            row.appendChild(spDate);
    
            const spVoucher = document.createElement("span");
            spVoucher.textContent = data.voucher;
            row.appendChild(spVoucher);
    
            const spDesc = document.createElement("span");
            spDesc.textContent = data.description;
            row.appendChild(spDesc);
    
            const spName = document.createElement("span");
            spName.textContent = data.name;
            row.appendChild(spName);
    
            const spAmount = document.createElement("span");
            spAmount.textContent = thousandSeparator(data.amount);
            row.appendChild(spAmount);

            const spType = document.createElement("span");
            spType.textContent = (data.type == 0) ? "Cash Out" : "Cash In";
            row.appendChild(spType);
    
            const spOpeningBal = document.createElement("span");
            var myBal;
            if(data.type == 0){
                myBal = parseInt(data.balance) + parseInt(data.amount);
            }
            else 
            myBal = parseInt(data.balance) - parseInt(data.amount);

            spOpeningBal.textContent = (parseInt(data.balance) < parseInt(data.amount)) ? "("+thousandSeparator(Math.abs(myBal))+")" : thousandSeparator(Math.abs(myBal));
            row.appendChild(spOpeningBal);
    
            const spBal = document.createElement("span");
            spBal.textContent = (data.balance < 0) ? "("+thousandSeparator(Math.abs(data.balance))+")" : thousandSeparator(Math.abs(data.balance));
            row.appendChild(spBal);
            const spDel = document.createElement("span");
            spDel.classList.add("material-icons");
            spDel.textContent = "delete";
            row.appendChild(spDel);
            spDel.addEventListener("click",(e)=>{
                e.preventDefault();
                e.stopPropagation();
                if(confirm("Are you sure you want to delete this record?")){
                    deletePettyCash(data.id);
                }
            });
            container.insertBefore(row,form);
        })
       }
       else{
        var recs = storedData.petty_cash.filter(d=>parseInt(d.date_created) < activeDate);
        if(recs.length > 0){
            openingBal = recs[recs.length -1].balance;
            closingBal = recs[recs.length -1].balance;
        }
       }
       
    }
    else{
       
        const row = document.createElement("div");
        row.className = "body-row shadow-minor";
        const spNoData = document.createElement("span");
        spNoData.textContent = "No data";
        row.appendChild(spNoData);
        container.insertBefore(row,form);
    }
    showPettyCashForm(closingBal);
    oBal.textContent = "Opening Balance: "+storedData.settings.currency+" "+((openingBal < 0) ? "("+thousandSeparator(Math.abs(openingBal))+")" : thousandSeparator(Math.abs(openingBal)));
    cBal.textContent = "Closing Balance:"+storedData.settings.currency+" "+((closingBal < 0) ? "("+thousandSeparator(Math.abs(closingBal))+")" : thousandSeparator(Math.abs(closingBal)));
}
const deletePettyCash=(id)=>{
    var body = {id:id,status:1};
    var opts = {
        method:"PUT",body:JSON.stringify(body),headers:{"Content-type":"application/json","Authorization":"Bearer "+currentUser.accessToken}
    }
    console.log("body: ",body,opts);
    fetch(petty_cash_url+"_update",opts)
    .then(res=>res.json())
    .then(result=>{
        console.log("result: ",result);
        if(result.code === 0){
            var pc = result.data.map((d,i)=>{
                let k = d;
                if(i>0){
                    let ob = parseInt(result.data[i-1].balance);
                    k.opening_balance = ob;
                    let a = parseInt(d.amount);
                    k.balance = d.type === 0 ? ob - a: ob + a;
                }
                return k;
            })
            storedData.petty_cash = pc;
            storage.setItem("data",JSON.stringify(storedData));
        }
        showFeedback(result.msg,result.code);
    })
    .catch(e=>{
        showFeedback("Oops! Something went wrong");
    })
}
const getPettyCash = ()=>{
    var url = petty_cash_url+"/"+currentUser.id;
        var options = {method:"GET",headers:{
            'Content-type':'application/json','Authorization': 'Bearer '+currentUser.accessToken
        }}
        return new Promise((resolve,reject)=>{
            fetch(url,options)
            .then(res=>res.json())
            .then(result=>{
                console.log("result: ",result);
                var pc = result.data.map((d,i)=>{
                    let k = d;
                    if(i>0){
                        let ob = parseInt(result.data[i-1].balance);
                        k.opening_balance = ob;
                        let a = parseInt(d.amount);
                        k.balance = d.type === 0 ? ob - a: ob + a;
                    }
                    return k;
                })
                storedData.petty_cash = pc;
                storage.setItem("data",JSON.stringify(storedData));
                storedData = JSON.parse(storage.getItem("data"));
                resolve(pc);
    
            })
            .catch(e=>{
                console.log("error: ",e);
                reject("Oops! Something went wrong! Please try again later");
            })
        })
        
}
//end petty cash

//show odg files
const showODGFiles = (files,tag)=>{
    var list_id = tag+"_list";
    var docs = (tag == "odg") ? PREDOCUMENTS:DOCUMENTS;
    var container = document.getElementById(list_id);
    Array.from(container.children).forEach(c=>container.removeChild(c));
    if(files && files.length > 0){
        files.map(f=>{
            var fs = f;
            docs.forEach(d=>{
                if(d.name.toLowerCase() == f.name.toLowerCase()) fs.label = d.label;
            });
            return fs;
        })
        .forEach(file=>{
            var div = document.createElement("div");
            div.classList.add("row-space");
            var anchor = document.createElement("a");
            anchor.href = (file.url) ? file.url : files_url+"/"+file.filename;
            anchor.target = "_blank";
            anchor.textContent = (tag == "odg") ? file.name:file.label;//[0].toUpperCase()+ file.name.substring(1);
            div.appendChild(anchor);

            var del = document.createElement("span");
            del.className="material-icons clickable";
            del.textContent = "delete";

            div.appendChild(del);

            del.addEventListener("click",(e)=>{
                alertDialog({description:"Are you sure you want to delete this file?",actionText:"Delete",title:"Delelte File"},()=>{
                    deleteFile(file.id,tag);
                })
            })

            container.appendChild(div);
        })

    }
    else{
        container.textContent = "No files uploaded!";
    }
}
//delete uploaded file
const deleteFile=(fileId)=>{
    var url = upload_files_url +"/"+currentUser.id+"/"+fileId;
    fetch(url,{method:"DELETE",headers:{'Content-type':'application/json','Authorization':'Bearer '+currentUser.accessToken}})
    .then(res=>res.json())
    .then(result=>{
        updateConsignmentList(result.data);
        showExportList(result.data);
        showFeedback(result.msg,result.code);
    })
    .catch(e=>{
        console.log("deleteFile(): ",e);
        showFeedback("Something went wrong",1);
    })
}

//collapse expand fieldsetl
const collapse = (sourceId)=>{
    const source = document.getElementById(sourceId+"_collapse");
    const target = document.getElementById(sourceId+"_collapsible");
    target.classList.toggle("hidden");
    if(source.textContent == "keyboard_arrow_down") source.textContent = "keyboard_arrow_up";
    else source.textContent = "keyboard_arrow_down";
}

//load cities
const loadCities = (country,el,target)=>{
    Array.from(el.children).forEach(child=>el.removeChild(child));
    el.classList.remove("hidden");
    var cities = PORTS.filter(p=>p.country.toLowerCase() == country.toLowerCase()).map(p=>p.name);
    var fCities = cities;
    var search = target.value.toLowerCase();
    if(target.value.length > 0) fCities = cities.filter(c=>c.toLowerCase().includes(search));
    fCities.forEach(city=>{
        var countrySpan = document.createElement("span");
        countrySpan.textContent = city;
        el.appendChild(countrySpan);
        countrySpan.addEventListener("click",(e)=>{
            target.value = city;
            el.classList.add("hidden");
            populatePorts(city,document.getElementById("port_of_discharge"));
        })
        
    })
    // target.addEventListener("blur",(e)=>{
    //     el.classList.add("hidden");
    // })
   
}
//load countriese
const loadCountries = (el)=>{
    var ctry;
    el = document.getElementById("place_of_destination");
    // Array.from(el.children).forEach(child=>el.removeChild(child));
    // el.classList.remove("hidden");
    var searchableCities = document.getElementById("searchable_city");
    var citySearch = document.getElementById("place_of_delivery");
    citySearch.value = "";
            
    COUNTRIES.forEach(country=>{
        var countrySpan = document.createElement("option");
        // countrySpan.textContent = country;
        // countrySpan.value = country.code;
        // el.appendChild(countrySpan);
        el.options.add(new Option(country.name));
    })
   
    el.addEventListener("change",(e)=>{
        var val = e.target.value.trim();
        ctry = COUNTRIES.find(c=>c.name.toLowerCase() == val.toLowerCase());
        console.log("ctry :",val,ctry);
        var portEl = document.getElementById("port_of_discharge");
        var ports = PORTS.filter(p=>p.country.toLowerCase() === ctry.name.toLowerCase());
        loadPorts(ports,portEl,null);
    })
    
}
const populatePorts = (city,target)=>{
    Array.from(target.children).forEach(c=>target.removeChild(c));
    var ports = PORTS.filter(p=>p.name.toLowerCase() == city.toLowerCase());
    ports.forEach(p=>{
        target.options.add(new Option(p.name+", "+p.code,p.code))
    });

}
//load ports
const loadPorts = (ports,el,target)=>{
    Array.from(el.children).forEach(child=>el.removeChild(child));
    el.classList.remove("hidden");
    ports.forEach(port=>{
        el.options.add(new Option(port.name+", "+port.code,port.code));        
        
    });
   
}

//update select fieldss
const updateSelectFields=(fieldId,value,count)=>{
    for(let i=2;i<=count;i++){
        var select = document.getElementById(fieldId+"__"+i);
        select.value = value;
    }
}
//add container form
const addContainerForm = (data,fields,container=null)=>{

    const parent = container == null ? document.getElementById("container_forms"): document.getElementById(container);
    Array.from(parent.children).forEach((child,i)=>{
    //    if(container == null){
    //        if(i>0)parent.removeChild(child);
    //    }
    //    else 
       parent.removeChild(child);
    })


    let count = (data.container_details && data.container_details.length >0) ? data.container_details.length : data.no_of_containers;

    const form = document.createElement("form");
    form.id = container;

    const table = document.createElement("table");

    var heads = document.createElement("thead");
    // heads.classList.add("hform");
    Array.from(heads.children).forEach(child=>heads.removeChild(child));
    var fields = fields.sort((a,b)=>(a.required === b.required) ? 0: a.required ? -1 : 1)
    
    // var miniFields = fields.filter(f=>f.required);
    fields.forEach((field,index)=>{
        var item = document.createElement("th");
        if(field.type == "select") {
            item.classList.add("select");
            // item.id = field.id+"#"+(index+1);
        }
        // if(container == "icontainer_forms"){
        //     item.classList.remove("select");
        //     item.classList.add("wide-select");
        // }
        if(field.type == "number") item.classList.add("num");
        item.classList.add("bold");
        item.innerHTML = field.label + ((field.required) ? "<strong style='color:red;'>*</strong>" : "");
        heads.appendChild(item);
    })
    if(container == "icontainer_forms" || container == "ocontainer_forms"){
        var status = document.createElement("th");
        status.textContent = "Passed";
        heads.appendChild(status);
        var comment = document.createElement("th");
        comment.textContent = "Comment";
        heads.appendChild(comment);
    }
    table.appendChild(heads);
       
    for(let n=1;n<=count;n++){
       
        const row = document.createElement("tr");
        
        fields.forEach(field=>{
            const fieldDiv = document.createElement("td");
            if(field.type == "text" || field.type == "number"){
                const fieldInput = document.createElement("input");
                if(field.type == "number") fieldInput.step = ".1";
                fieldInput.id = field.id+"__"+n;
                fieldInput.name = field.id+"__"+n;
                fieldInput.type = field.type;
                fieldInput.required = field.required;
                // fieldInput.placeholder = field.label;
                if(container == "icontainer_forms") fieldInput.width = "100%";
                if(data && data.container_details && data.container_details.length >n-1){
                    fieldInput.value = data.container_details[n-1][field.id];
                   
                }
                if(data && data.shipping_details && field.id == "mbl_number"){
                    fieldInput.value = data.shipping_details.mbl_number;
                }
                if(fieldInput.value == "undefined") fieldInput.value = "";
                fieldDiv.appendChild(fieldInput);
            }
            else{
                const fieldSelect = document.createElement("select");
                fieldSelect.id = field.id+"__"+n;
                fieldSelect.name = field.id+"__"+n;
                fieldSelect.required = field.required;
                fieldSelect.classList.add("select");
                field.options.forEach(opt=>{
                    fieldSelect.options.add(new Option(opt,opt.toLowerCase()));
                })
                if(data && data.container_details && data.container_details.length >n-1){
                    let val = data.container_details[n-1][field.id];
                    fieldSelect.value = val ? val.toLowerCase():"";                   
                }
               
                fieldDiv.appendChild(fieldSelect);  

                fieldSelect.addEventListener("change",(e)=>{
                    if(n==1){
                        updateSelectFields(field.id,fieldSelect.options[fieldSelect.options.selectedIndex].value,count);
                    }
                })
            }
            row.appendChild(fieldDiv);
        });
        
        if(container == "icontainer_forms" || container == "ocontainer_forms"){
            const statusDiv = document.createElement("td");
            const commentDiv = document.createElement("td");
            commentDiv.colSpan = 2;
            const statusInputY = document.createElement("input");
            const statusInputN = document.createElement("input");

            statusInputY.id = "verification_status_y__"+n;
            statusInputY.name = "verification_status__"+n;
            statusInputY.value = "Passed";
            statusInputY.type = "radio";
            statusInputN.id = "verification_status_n__"+n;
            statusInputN.name = "verification_status__"+n;
            statusInputN.value = "Failed";
            statusInputN.type = "radio";

            const commentInput = document.createElement("textarea");
            commentInput.cols = 50;
            const radioGroup = document.createElement("div");
            radioGroup.classList.add("radios");
            const statusLabelY = document.createElement("label");
            const statusLabelN = document.createElement("label");
            statusLabelN.for = statusInputN.id;
            statusLabelY.for = statusInputY.id;
            statusLabelY.textContent = "Y";
            statusLabelN.textContent = "N";

            radioGroup.appendChild(statusInputY);
            radioGroup.appendChild(statusLabelY);
            radioGroup.appendChild(statusInputN);
            radioGroup.appendChild(statusLabelN);

            statusDiv.appendChild(radioGroup);
            // statusDiv.appendChild(statusInputN);

            commentInput.id = "verification_comment__"+n;
            commentInput.name = "verification_comment__"+n;
            commentInput.type = "text";
            commentInput.required = false;
            commentDiv.appendChild(commentInput);
            row.appendChild(statusDiv);
            row.appendChild(commentDiv);
            
        }
            table.appendChild(row); 
    } 
    // form.classList.add("column")
    var actionRow = document.createElement("tr");
    var td = document.createElement("td");
    var fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.name="file_container_booking";
    fileInput.id="file_container_booking";
    fileInput.classList.add("hidden");
    td.appendChild(fileInput);

    var uploadButton = document.createElement("button");
    uploadButton.type = "button";
    uploadButton.name="upload_container_booking";
    uploadButton.id="upload_container_booking";
    uploadButton.classList.add("buttons");
    uploadButton.textContent = "Upload File"
    td.appendChild(uploadButton);

    actionRow.appendChild(td);

    var td2 = document.createElement("td");
    var link = document.createElement("a");
    link.classList.add("file-link");
    link.id="link_container_booking";
    link.textContent = "No file uploaded";
    link.target="_blank";
    td2.appendChild(link);
    actionRow.appendChild(td2);

    var td3 = document.createElement("td");
    const btnSubmit = document.createElement("input");
    btnSubmit.type = "submit"
    btnSubmit.classList.add("buttons-s");
    btnSubmit.value = "SAVE";
    td3.appendChild(btnSubmit);
    actionRow.appendChild(td3);

    if(container !== "icontainer_forms" && container !== "imp_container_detail") table.appendChild(actionRow);
    form.appendChild(table);
    
    parent.appendChild(form);

    //form submission
    form.addEventListener("submit",(event)=>{
        event.preventDefault();
        saveContainers(form,data)
    })
//end form submission

//    file upload and link

    var uploadContainerBookingButton = document.getElementById("upload_container_booking");
    var containerBookingInput = document.getElementById("file_container_booking");
    var containerBookingLink = document.getElementById("link_container_booking");
    var newFile = null;
    if(data.files && data.files.length > 0){
        var containerFiles = data.files.filter(f=>f.name.toLowerCase() == "container booking");
        if(containerFiles.length > 0){
            containerBookingLink.href = files_url+"/"+containerFiles[0].filename;
            containerBookingLink.textContent = "View File";
        }
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
                        containerBookingLink.textContent = "View File";
                        if(data && data.id){
                            uploadConsignmentFile(currentUser.id,reader.result,data.id,"container_bookings","container booking")
                            .then(result=>{
                                // console.log("result: ",result);
                                updateConsignmentList(result.data);
                                showFeedback(result.msg,result.code);
                            })
                            .catch(e=>{
                                showFeedback(e,1);
                            })
                        }
                        else{
                            newFile = reader.result;
                        }
                        
                    },false);
                    reader.readAsDataURL(file);
                }
            })
        })
    }


    //end of file upload and link
}

//save container details
const saveContainers=(form,data)=>{
    var containers = data.container_details;
    var count = data.no_of_containers;
        var containerId = -1;
        var dataItems = [];
        for(let i=1;i<=count;i++){
            if(containers && containers.length > i-1){
                containerId = containers[i-1].id;
            }
            let dataItem = {id:parseInt(containerId)};
            Array.from(form.elements).forEach(inp=>{
                if(inp.id.length >0){
                  let key = inp.id;
                    if(key.includes('__')) key = inp.id.split("__")[0];
                    dataItem[key] = inp.value;  
                }
                
            });
            dataItem.cid = data.id;
            delete dataItem.file_container_booking;
            delete dataItem.upload_container_booking;
            dataItems.push(dataItem);
        }
        
        var method =  "POST";
        var options = {
            method:method,body:JSON.stringify(dataItems),headers:{
                "Content-type":"application/json","Authorization":"Bearer "+currentUser.accessToken
            }
        }
        var url = container_booking_url+"/"+currentUser.id;
        fetch(url,options)
        .then(res=>res.json()).then(result=>{
            if(form.id == null || form.id == "container_forms"){
                updateConsignmentList(result.data);
                showExportList(result.data,"export_form");
            }
            else showImportList(result.data,)
            showFeedback(result.msg,result.code);
        })
        .catch(e=>{
            showFeedback(e,1);
        })
}

//upload consignment file
const uploadConsignmentFile = (userId,file,cid,target,name)=>{
    return new Promise((resolve,reject)=>{
        var data = {cid:cid,file:file,target:target,user:userId,name:name};
        fetch(upload_files_url,{body:JSON.stringify(data),method:"POST",headers:{'Content-type':'application/json','Authorization':'Bearer '+currentUser.accessToken}})
        .then(res=>res.json())
        .then(result=>{
            console.log("result: ",result);
            resolve(result);
            updateConsignmentList(result.data);
            showExportList(result.data);
            showFeedback(result.msg,result.code);
        })
        .catch(e=>{
            reject("Something went wrong! Please try again later");
        })
    })
}

//update local list of consighments
const updateConsignmentList = (data)=>{
    if(data){
        storedData = JSON.parse(storage.getItem("data"));
        storedData.consignments = data.filter(d=>d.type == 0);
        storedData.imports = data.filter(d=>d.type == 1);
        storage.setItem("data",JSON.stringify(storedData));
        storedData = JSON.parse(storage.getItem("data"));
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
                // signoutUser();
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
                // signoutUser();
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
                // signoutUser();
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
const closeCustomerForm=(source,customer=null)=>{
    document.getElementById(source).classList.add("hidden");
    if(customer != null){
        var uCustomer = storedData.customers.filter(c=>c.id == customer.id)[0];
        viewCustomerDetails(uCustomer,source);
    }
    else {
        document.getElementById("customers_content").classList.remove("hidden");
        showCustomers(storedData.customers,source);
    }
}
//fetch clients
const getCustomers = ()=>{
    return new Promise((resolve,reject)=>{
        showSpinner();
        // var body=JSON.stringify({user:currentUser.id});
        var headers = {'Content-type':'application/json','Authorization':"Bearer "+currentUser.accessToken};
        var options = {method:"GET",headers:headers};
    
        fetch(customers_url+"/"+currentUser.id,options)
        .then(res=>res.json())
        .then(result=>{
            hideSpinner();
            resolve(result);
        })
        .catch(err=>{
            reject(err)
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
        chart.homeZoomLevel = 2;
        chart.height = "100%";
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
const alertDialog =(option,action=null)=>{
    var alert = document.getElementById("alert_dialog");
    alert.classList.remove("hidden");
    Array.from(alert.children).forEach(c=>{
        alert.removeChild(c);
    });
    var dialog = document.createElement("div");
    dialog.classList.add("dialog");
    var dialogTitle = document.createElement("div");
    dialogTitle.classList.add("dialog-title");
    dialogTitle.textContent = option.title.toUpperCase();
    var msgText = document.createElement("p");
    msgText.textContent = option.description;
    msgText.style.textAlign="center";
    dialog.appendChild(dialogTitle);
    dialog.appendChild(msgText);
    var buttonRow = document.createElement("div");
    buttonRow.classList.add("row-end");
    if(action != null){
        var okButt = document.createElement("span");
        okButt.classList.add("dialog-button");
        okButt.classList.add("primary-dark-text");
        okButt.textContent = option.actionText.toUpperCase();
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
    cancelButt.textContent = (option.cancelText) ? option.cancelText:"CANCEL";
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
            alertDialog({description:"Are you sure you want to sign out?",actionText:"signout",title:"Signout"},()=>{
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
            // signoutUser();
            
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
    console.log("t: ",data);
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
            // signoutUser();
            
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
    var crumbs = document.querySelector("#crumbs");
    var crumbs_c = document.querySelector("#crumbs_child");
    if(detail){
        crumbs.textContent = detail.title;
        crumbs_c.textContent =" | "+detail.description;
        if(crumbs){
            crumbs.addEventListener("click",(e)=>{
               activateMenu(detail.title.toLowerCase());
            })
        }
    }
    else {
        crumbs.textContent ="";
        crumbs_c.textContent = "";
    }
         
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
