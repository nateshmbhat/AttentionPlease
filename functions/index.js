/// <reference path=".\node_modules\@types\express\index.d.ts" />

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>   ALL IMPORTS

const functions = require('firebase-functions');
const app = require("express")() ;
const express_file_upload = require("express-fileupload") ;
const  express = require("express") ;
const handle_requests = require("./requests_controller") ;
const cookieparser = require("cookie-parser") ;
var xlsx=require('xlsx');
var admin=require('firebase-admin');


//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<   END OF IMPORTS

//for test..........................................................>

var obj=xlsx.readFile(`views/test.xlsx`);
var sh=obj.SheetNames;
var dat=xlsx.utils.sheet_to_json(obj.Sheets[sh[0]]);

// console.log(dat);

var final={};
var temp=new Array();

for(i=0;dat[i]!=undefined;i++){
  temp = [] ; 
  for(j=0;dat[i]['sub'+j]!=undefined;j++){
    subs = new Object() ; 
    subs['name']=dat[i]['Name'];
    subs['subject']=dat[i]['sub'+j];
    subs['block']=dat[i]['block'+j];
    subs['date']=dat[i]['date'+j];
    subs['time']=dat[i]['time'+j];
    subs['room']=dat[i]['room'+j];
    subs['seat']=dat[i]['seatno'+j];
    temp.push(subs) ;  
  }

  console.log(temp) ; 

   final[dat[i]['USN']]=temp;
}

console.log(final);

  // final[dat[i].USN]=temp;
  // for(j=0;dat[i]['sub'+j]!=undefined;j++){
  //   subs['name']=dat[i]
  //   subs['subject']=dat[i]['sub'+j];
  //   subs['date']=dat[i]['date'+j];
  //   subs['time']=dat[i]['time'+j];
  //   subs['room']=dat[i]['room'+j];
  //   subs['seat']=dat[i]['seatno'+j];
  //   subs['block']
  //   temp[j]=subs;
  //   subs={};
  // }
  // temp=[];
//}

//for test end......................................................>

app.use(cookieparser()) ;
app.use(express.static('../public' )  ) ;


handle_requests(app) ;

//HANDLE Static Request for any non Existing resource.
app.use(function(req, res, next){
    res.status(404).redirect('/404.html') ;
});

app.listen(8000) ;

exports.app = functions.https.onRequest(app) ;
