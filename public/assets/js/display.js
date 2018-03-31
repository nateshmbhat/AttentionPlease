
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
        userinfo.name = data.name ;
        userinfo.email =firebase.auth().currentUser.email ;
        console.log(userinfo);
        $("div.my-auto#about").html(`
        <h1 class="mb-0">${userinfo.name}
        </h1>
        <div class="subheading mb-5">
          <a href="mailto:${userinfo.email}"><font face="helvetica" size="3pt">${userinfo.email}</font></a>
        </div>
        <p class="mb-5">TO BE REPLACED</p>
        <ul class="list-inline list-social-icons mb-0">
          <li class="list-inline-item">
            <a href="#">
              <span class="fa-stack fa-lg">
                <i class="fa fa-circle fa-stack-2x"></i>
                <i class="fa fa-facebook fa-stack-1x fa-inverse"></i>
              </span>
            </a>
          </li>
          <li class="list-inline-item">
            <a href="#">
              <span class="fa-stack fa-lg">
                <i class="fa fa-circle fa-stack-2x"></i>
                <i class="fa fa-twitter fa-stack-1x fa-inverse"></i>
              </span>
            </a>
          </li>
          <li class="list-inline-item">
            <a href="#">
              <span class="fa-stack fa-lg">
                <i class="fa fa-circle fa-stack-2x"></i>
                <i class="fa fa-linkedin fa-stack-1x fa-inverse"></i>
              </span>
            </a>
          </li>
          <li class="list-inline-item">
            <a href="#">
              <span class="fa-stack fa-lg">
                <i class="fa fa-circle fa-stack-2x"></i>
                <i class="fa fa-github fa-stack-1x fa-inverse"></i>
              </span>
            </a>
          </li>
        </ul>
        `)

        $("div.my-auto#location").html(`<h2 class="mb-5">Location Details</h2>

        <div class="resume-item d-flex flex-column flex-md-row mb-3">
          <div class="resume-content mr-auto">
            <h3 class="mb-0" id="state">State : ${userinfo.state}</h3>
          </div>
        </div>

        <div class="resume-item d-flex flex-column flex-md-row mb-3">
          <div class="resume-content mr-auto">
            <h3 class="mb-0" id="district">District : ${userinfo.district}</h3>
          </div>
        </div>

        <div class="resume-item d-flex flex-column flex-md-row mb-3">
          <div class="resume-content mr-auto">
            <h3 class="mb-0" id="college">College : ${userinfo.college}</h3>
          </div>
        </div>`)

    })

}

else {
    console.log("No user is signed in !") ;
    unsetcookie() ;
    window.location="/login" ;
}


})
