
firebase.auth().onAuthStateChanged(function(user){

if(user){
    var ref = firebase.database().ref(`/adminusers/${user.uid}`).once('value' , snap=>{

        var userinfo = snap.val()  ; 
        // userinfo.college = data.college ;
        // userinfo.state    = data.state ;
        // userinfo.dconsole.log('pushids'+pushids);istrict = data.district ;
        // userinfo.ccode = data.ccode ;
        userinfo.email =firebase.auth().currentUser.email ;

        console.log(userinfo);
        firebase.database().ref(`/Colleges/${userinfo.ccode}/forum`).once('value').then(shot=>{
        console.log(shot.val()) ;

          var quo=new Array();
          var user=new Array();


          focus=shot.val();
          pushids=new Array();
          user = new Array() ;
          pushids=Object.getOwnPropertyNames(focus);

          console.log('pushids'+pushids);
          for(i=0;i<pushids.length;i++){
            console.log(focus[pushids[i]]);
            quo[i]=focus[pushids[i]].question;
            user.push(focus[pushids[i]].uid) ; 
            console.log(quo);
        }
        console.log(user) ; 

        for(i=0;i<pushids.length;i++){
          $('div#accordionEx5 div.card:last').after(`
              <div class="card mb-4">
              <div class="card-header p-0 z-depth-1" role="tab" id="heading30">
                  <a data-toggle="collapse" data-parent="#accordionEx5" href="#collapse31" aria-expanded="true" aria-controls="collapse31">
                      <i class="fa fa-comments fa-2x p-3 mr-4 float-left black-text col-1" aria-hidden="true"></i>
                      <h4 id="h4_question${i}" data-pushid${i}=${pushids[i]} class="white-text mb-0 py-3 mt-1 col-11" name="question_title">
                          ${quo[i]}
                      </h4>
                  </a>
              </div>
              <div id="collapse31" class="collapse show" role="tabpanel" aria-labelledby="heading30" data-parent="#accordionEx5">
                  <div class="card-body rgba-black-light white-text z-depth-1">
                      <div class="md-form">
                           <i class="fa fa-pencil prefix"></i>
                           <textarea type="text" name="answer" id="answerfield${i}" class="form-control md-textarea" rows="3"></textarea>
                           <label for="textareaPrefix">Write Answer</label>
                      </div>
                  </div>
              </div>
            </div>
          `)
        }

        $(".btn_submit_response").attr('hidden' ,false) ; 
        $('.btn_submit_response').on('click' , event=>{

        for(let i =0 ; i<pushids.length ; i++)
        {
            console.log("------------"+i+ "--------------") ; 
            console.log( $(`#h4_question${i}`).attr(`data-pushid${i}`)) ; 

            console.log($(`#answerfield${i}`).val() )  ; 
            console.log("------------"+i+ "--------------") ; 

            firebase.database().ref(`/Colleges/${userinfo.ccode}/forum/${pushids[i]}`).update({answer : $(`#answerfield${i}`).val() }) ; 
        }
            
        })
      })

    })

}

else {
    console.log("No user is signed in !") ;
    unsetcookie() ;
}


})
