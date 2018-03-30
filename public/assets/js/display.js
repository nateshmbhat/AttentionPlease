
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

        // $("#collegename").html(`${userinfo.college}`)
        // $("#location-details").html(`
        // <h4 style="font-family:raleway , caladea">State    : ${userinfo.state}</p>
        // <h4 style="font-family:raleway , caladea">District : ${userinfo.district} </p>
        // `)

        // firebase.database().ref('/Colleges/'+userinfo.ccode).once('value').then(snap=>{
        //     console.log(snap.val()) ;
        //     topicsids= snap.val().topics //gives the pushed id
        //     topicslist = new Array() ;
        //
        //     Object.getOwnPropertyNames(topicsids).forEach(ele=> topicslist.push(topicsids[ele].title)) ;
        //
        //     // $("#topicslist").append(`<h4 style="display:block" class="mt-5 animated fadeIn">Choose the Topic to which the message needs to be sent : </h4>`)
        //     $("#dynamic").append(`<div class="justify-content-center "><div class="m-auto card card-body hoverable" style="width:50%;">
        //         <h4 class="card-title">Topic Selection</h4>
        //         <p class="lead card-text">Choose the required topics which sends the notifications for all those who have subscribed to the selected topics</p>
        //         <div class="flex-row">
        //         <div class="form-group" id="topicslist"> </div>
        //         </div>
        //     </div></div>` ) ;
        //
        //     topicslist.forEach(topic=>{
        //        $("#topicslist").append(
        //        `    <div class="font-bold animated fadeIn form-check">
        //                 <input name="topic" value="${topic}" type="checkbox" data-topic="${topic}" class="mb-3 form-check-input filled-in" id="${"in_topic"+topic}">
        //                 <label class="form-check-label" style="font-family:lora ,raleway , caladea,lora , cambria; font-size:130%;" for="${"in_topic"+topic}">${topic}</label>
        //             </div>
        //        `);
        //
        //
        //     })
        //
        // }).catch(error =>console.log(error)) ;
    })

}

else {
    console.log("No user is signed in !") ;
    unsetcookie() ;
}


})
