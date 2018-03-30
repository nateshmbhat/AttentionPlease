
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



        $("#collegename").html(`${userinfo.college}`)
        $("#location-details").html(`
        <h4 style="font-family:raleway , caladea">State    : ${userinfo.state}</p>
        <h4 style="font-family:raleway , caladea">District : ${userinfo.district} </p>
        `)

        firebase.database().ref('/Colleges/'+userinfo.ccode).once('value').then(snap=>{
            console.log(snap.val()) ;
            topicsids= snap.val().topics //gives the pushed id
            topicslist = new Array() ;

            Object.getOwnPropertyNames(topicsids).forEach(ele=> topicslist.push(topicsids[ele].title)) ;

            // $("#topicslist").append(`<h4 style="display:block" class="mt-5 animated fadeIn">Choose the Topic to which the message needs to be sent : </h4>`)
            $("#dynamic").append(`<div class="justify-content-center "><div class="m-auto card card-body hoverable" style="width:50%;">
                <h4 class="card-title">Topic Selection</h4>
                <p class="lead card-text">Choose the required topics which sends the notifications for all those who have subscribed to the selected topics</p>
                <div class="flex-row">
                <div class="form-group" id="topicslist"> </div>
                </div>
            </div></div>` ) ;

            topicslist.forEach(topic=>{
               $("#topicslist").append(
               `    <div class="font-bold animated fadeIn form-check">
                        <input name="topic" value="${topic}" type="checkbox" data-topic="${topic}" class="mb-3 form-check-input filled-in" id="${"in_topic"+topic}">
                        <label class="form-check-label" style="font-family:lora ,raleway , caladea,lora , cambria; font-size:130%;" for="${"in_topic"+topic}">${topic}</label>
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
