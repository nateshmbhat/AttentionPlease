var config = {
  apiKey: "AIzaSyB_iPXI3CYvi5FKKYm_51_ja9QFjFxwa4Y",
  authDomain: "attentionplease-24589.firebaseapp.com",
  databaseURL: "https://attentionplease-24589.firebaseio.com",
  projectId: "attentionplease-24589",
  storageBucket: "attentionplease-24589.appspot.com",
  messagingSenderId: "738569079406"
};
firebase.initializeApp(config);

  

const setcookie=(callback )=>firebase.auth().currentUser && firebase.auth().currentUser.getIdToken().then(token=>{
  console.log(token) ; 
  
  Cookies.set('__session' , token , {
    domain : window.location.hostname , 
    expire : 1/ 24  , 
    path : '/' , 
    secure : false 
  })
  console.log("cookie set ! ") ;
  callback() ;
})



const unsetcookie = ()=>Cookies.remove('__session' , {
  domain : window.location.hostname , 
  path : '/'
})


window.onload= function()
{
  //Handle logout
  $("#nav_logout").click(()=>{
    console.log("Nav button clicked  ! ") ;
    firebase.auth().signOut() ;            
    unsetcookie() ;
    window.location = "login" ;
  }) ; 

}