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

ref.set({
  name : "College 2" , 
  ID : "id1" , 
  city : 'city1' ,
  state : 'state1'
}) ;

ref_ret = ref.push({
  Country: "India" 
}).then(()=>console.log("Done !")) ;


console.log("End of File ! ") ;
