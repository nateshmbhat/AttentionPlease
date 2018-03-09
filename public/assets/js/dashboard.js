
/// <reference path="../../functions/node_modules/@types/jquery/index.d.ts"

// var firebase = require("firebase") ; 

  
firebase.auth().onAuthStateChanged(function(user){

if(user){
    var ref = firebase.database().ref("/adminusers/"+user.uid) ;
    
    var userinfo = {}  ;
    ref.once('value').then(snap=>{
        console.log(snap.val()) ;
        data = snap.val() 
        userinfo.college  = data.college ; 
        userinfo.state    = data.state  ; 
        userinfo.district = data.district ; 
        userinfo.ccode = data.ccode ; 
        

        
        $("#collegename").html(`${userinfo.college}`)
        $("#location-details").html(`
        <h4 style="font-family:raleway , caladea">State    : ${userinfo.state}</p>
        <h4 style="font-family:raleway , caladea">District : ${userinfo.district} </p>
        `)
        
        firebase.database().ref('/Colleges/'+userinfo.ccode).once('value').then(snap=>{
            console.log(snap.val()) ;
            topicslist = snap.val().topics

            $("#topicslist").append(`<h4 style="display:block" class="mt-5 animated fadeIn">Choose the Topic to which the message needs to be sent : </h4>`) 
            
            topicslist.forEach(topic=>{
               $("#topicslist").append(
               `    <div class="font-bold animated fadeIn">
                        <h5 style="font-family:raleway, caladea, lora ; "><input value=${topic} class="m-1" type="radio" name="topic">${topic}</input></h5>
                    </div>
               `);
            })
        }).catch(error =>console.log(error)) ; 
    })
    
}

else {
    console.log("No user is signed in !") ;
    unsetcookie() ;
}

})