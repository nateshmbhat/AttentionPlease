
firebase.auth().onAuthStateChanged(function(user){

if(user){
    var ref = firebase.database().ref("/adminusers/"+user.uid) ;

    var userinfo = {}  ;
    ref.once('value').then(snap=>{
        console.log(snap.val()) ;
        data = snap.val() ;
        userinfo.college = data.college ;
        userinfo.state    = data.state  ;
        userinfo.district = data.district ;
        userinfo.ccode = data.ccode ;
        userinfo.name = data.name ;
        userinfo.email =firebase.auth().currentUser.email ;
        console.log(userinfo);
        //arr=Object.getOwnPropertyNames(obj);

        var ques=firebase.database().ref(`/Colleges/${userinfo.ccode}/forum`);
        ques.once('value').then(shot=>{
          arr=Object.getOwnPropertyNames(shot.val());
          console.log(arr);
          for(i=0;i<arr.length;i++){
            console.log(shot.val()[arr[i]]);

          }
        });
        //card header
        // <div class="card-header p-0 z-depth-1" role="tab" id="heading30">
        //     <a data-toggle="collapse" data-parent="#accordionEx5" href="#collapse30" aria-expanded="true" aria-controls="collapse30">
        //         <i class="fa fa-comments fa-2x p-3 mr-4 float-left black-text col-1" aria-hidden="true"></i>
        //         <h4 class="text-uppercase white-text mb-0 py-3 mt-1 col-11" name="question_title" class="q1">
        //           Question here
        //         </h4>
        //     </a>
        // </div>
        //
        // //Card body
        // <div id="collapse30" class="collapse" role="tabpanel" aria-labelledby="heading30" data-parent="#accordionEx5">
        //     <div class="card-body rgba-black-light white-text z-depth-1">
        //         <div class="md-form">
        //              <i class="fa fa-pencil prefix"></i>
        //              <textarea type="text" name="answer" id="textareaPrefix" class="form-control md-textarea" rows="3"></textarea>
        //              <label for="textareaPrefix" class='a1'>Write answer</label>
        //         </div>
        //     </div>
        // </div>


    })

}

else {
    console.log("No user is signed in !") ;
    unsetcookie() ;
}


})
