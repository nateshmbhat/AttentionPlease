
firebase.auth().onAuthStateChanged(function(user){

if(user){
    var ref = firebase.database().ref("/adminusers/"+user.uid) ;

    var userinfo = {}  ;
    ref.once('value').then(snap=>{
      firebase.database().ref('/users/')
        console.log(snap.val()) ;
        data = snap.val() ;
        userinfo.college = data.college ;
        userinfo.state    = data.state ;
        userinfo.district = data.district ;
        userinfo.ccode = data.ccode ;
        userinfo.name = data.name ;
        userinfo.email =firebase.auth().currentUser.email ;
        console.log(userinfo);
        var ques=firebase.database().ref(`/Colleges/${userinfo.ccode}/forum`);
        //arr=Object.getOwnPropertyNames(obj);
        ques.once('value').then(shot=>{
          var quo=new Array();
          var user=new Array();


          var focus=shot.val();
          arr=Object.getOwnPropertyNames(focus);

          console.log('arr'+arr);
          for(i=0;i<arr.length;i++){
            console.log(focus[arr[i]]);
            quo[i]=focus[arr[i]].question;
            user[i]=focus[arr[i]].uid;
            console.log(quo);
            console.log(user);
          }


        for(i=0;i<arr.length;i++){
          $('div#accordionEx5 div.card:last').after(`
              <div class="card mb-4">
              <div class="card-header p-0 z-depth-1" role="tab" id="heading30">
                  <a data-toggle="collapse" data-parent="#accordionEx5" href="#collapse31" aria-expanded="true" aria-controls="collapse31">
                      <i class="fa fa-comments fa-2x p-3 mr-4 float-left black-text col-1" aria-hidden="true"></i>
                      <h4 class="white-text mb-0 py-3 mt-1 col-11" name="question_title">
                          ${quo[i]}
                      </h4>
                  </a>
              </div>
              <div id="collapse31" class="collapse show" role="tabpanel" aria-labelledby="heading30" data-parent="#accordionEx5">
                  <div class="card-body rgba-black-light white-text z-depth-1">
                      <div class="md-form">
                           <i class="fa fa-pencil prefix"></i>
                           <textarea type="text" name="answer" id="textareaPrefix" class="form-control md-textarea" rows="3"></textarea>
                           <label for="textareaPrefix">Write Answer</label>
                      </div>
                  </div>
              </div>
            </div>
          `)
        }
      })

    })

}

else {
    console.log("No user is signed in !") ;
    unsetcookie() ;
}


})
