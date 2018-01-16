
/// <reference path="../../functions/node_modules/@types/jquery/index.d.ts"

// var firebase = require("firebase") ; 


  const unsetcookie = ()=>Cookies.remove('__session' , {
    domain : window.location.hostname , 
    path : '/'
})  
  
firebase.auth().onAuthStateChanged(function(user){

if(user){
    var ref = firebase.database().ref("/users/"+user.uid) ;
    
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
        <p>State    : ${userinfo.state}</p>
        <p>District : ${userinfo.district} </p>
        `)
        
        firebase.database().ref('/Colleges/'+userinfo.ccode).once('value').then(snap=>{
            console.log(snap.val()) ;
            topicslist = snap.val().topics
            
            topicslist.forEach(topic=>{
               $("#topicslist").append(
               `    <div class="radio">
                        <label><input value=${topic} class="m-1" type="radio" name="topic">${topic}</input></label>
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