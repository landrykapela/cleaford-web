const signup_url = "http://localhost:5000/signup";

const signupForm = document.querySelector("#signup_form");
if(signupForm){
    let name = signupForm.company_name.value;
    let email = signupForm.email.value;
    let password = signupForm.password.value;
    let body = {name:name,email:email,password:password};
    let data = JSON.stringify(body);
    console.log("data; ",data);
    signupForm.addEventListener('submit',(e)=>{
        e.preventDefault();
        fetch(signup_url,{method:"POST",body:{data},headers:{
            'Content-Type':'application/json'
        }}).then(result=>{
        
            console.log("result: ",result);
            
        }).catch(err=>{
        console.log("error: ",err);
        });
    });
   
}
