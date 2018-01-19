$("#form_login").bind("submit" , function(event){
    console.log("running submit handler ! ") ;
    formdata = {} ; 
    $("#form_login").serializeArray().forEach(ele=>formdata[ele.name]=ele.value) ; 

    firebase.auth().signInWithEmailAndPassword(formdata.email , formdata.password)
    .then(user=>{
        firebase.auth().onAuthStateChanged(user=>{
            console.log("running auth state changed ! ") ;

            if(!user) {
                console.log("User logged out !") ; 
                return ; 
            }   

            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION) ;
            //user is logged in 
            setcookie(()=>{
                setInterval(setcookie , 3500) ;
                window.location = "dashboard"  ;
            })

            })
    })        
    .catch(error=>{
        $("#erroralert").replaceWith($("#erroralert").clone());
        $("#erroralert").html(`<h5 class="animated  p-2">${error.message}</h5>`) ;
        $("#erroralert").fadeIn() ;
    })

event.preventDefault() ;
})