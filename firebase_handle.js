
module.exports={
  signInWithEmailAndPassword : signInWithEmailAndPassword , 
}

var firebase = require("firebase");

var config = {
    apiKey: "AIzaSyCAuZxyxzMVqARr89FHT5-At2t8-JHhjf4",
    authDomain: "sitnotifier.firebaseapp.com",
    databaseURL: "https://sitnotifier.firebaseio.com",
    projectId: "sitnotifier",
    storageBucket: "sitnotifier.appspot.com",
    messagingSenderId: "697438424634"
  };

  firebase.initializeApp(config);

var database = firebase.database() ;

var ref = database.ref("/College") ;


function setdata()
{
  ref.set({
    name : "College 2" , 
    ID : "id1" , 
    city : 'city1' ,
    state : 'state1'
  }) ;
}  



function signInWithEmailAndPassword(email , password )
{
  firebase.auth().signInWithEmailAndPassword(email , password ).catch((error)=>console.log(error)) ;
  
  firebase.auth().onAuthStateChanged(user=>{
    console.log("User logged in ") ;
    console.log(`User Logged in with the following details :
   
    Name : ${user.displayName}
    ID   : ${user.uid }
    Email : ${user.email} 
    Email verified    : ${user.emailVerified}
    Phone : ${user.phoneNumber}
    provider data : ${JSON.stringify(user.providerData)}
    provider ID : ${user.providerId}

    `)

  })

}




// var user = signInWithEmailAndPassword ('nateshmbhat1@gmail.com' ,  'password') ;


console.log("End of Firebase_handle File ! ") ;
