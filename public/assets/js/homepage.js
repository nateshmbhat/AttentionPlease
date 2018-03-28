$("#form_login").bind("submit" , function(event){
    $("#loader_circle").removeAttr('hidden') ; 
    $("#div_submit").fadeOut() ; 

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
        $("#loader_circle").attr("hidden" , true) ; 
        $("#div_submit").fadeIn() ; 
    })        
    .catch(error=>{
        $("#loader_circle").attr("hidden" , true) ; 
        $("#div_submit").fadeIn() ; 
        console.log("\nRunning error part !" , error.message) ; 
        $(".erroralert").removeClass('hidden') ;  
        $(".erroralert").replaceWith($(".erroralert").clone());
        $(".erroralert").html(`<h4 class="animated  p-2">${error.message}</h5>`) ;
        $(".erroralert").fadeIn() ;
    })

event.preventDefault() ;
})