

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

function createUserWithEmailAndPassword(email , password , name )
{
  create_prom = firebase.auth().createUserWithEmailAndPassword(email , password) 

  create_prom.then((user)=>console.log("User Created successfully !")) ; 
  create_prom.catch((error)=>console.log(error)) ;
}




function signInWithEmailAndPassword(email , password)
{
  auth_prom = firebase.auth().signInWithEmailAndPassword(email , password).catch(
    (error)=>{
      console.log(error.message) ; 
    }
  )


  auth_prom.then((auth)=>console.log(Object.getOwnPropertyNames(auth))) ; 

}  

signInWithEmailAndPassword('nateshmbhat1@gmail.com' , 'password') ;





console.log("End of File ! ") ;
