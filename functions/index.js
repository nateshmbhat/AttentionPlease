/// <reference path=".\node_modules\@types\express\index.d.ts" />

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>   ALL IMPORTS

const functions = require('firebase-functions');
const app = require("express")() ;
const express_file_upload = require("express-fileupload") ;
const  express = require("express") ;
const handle_requests = require("./requests_controller") ;
const cookieparser = require("cookie-parser") ;
var xlsx=require('xlsx');


//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<   END OF IMPORTS

app.use(cookieparser()) ;
app.use(express.static('../public' )  ) ;
app.use(express_file_upload()) ;
var obj=xlsx.readFile('views/test.xlsx');
var sh=obj.SheetNames;
var dat=xlsx.utils.sheet_to_json(obj.Sheets[sh[0]]);

var final={};
var temp={};
var subs;
for(i=0;dat[i]!=undefined;i++){
  temp.Name=dat[i].Name;
  final[dat[i].USN]=temp;
  subs=[];
  for(j=0;dat[i]['sub'+j]!=undefined;j++){
    subs[0]=dat[i]['date'+j];
    subs[1]=dat[i]['time'+j];
    subs[2]=dat[i]['room'+j];
    subs[3]=dat[i]['seatno'+j];
    temp[dat[i]['sub'+j]]=subs;
    subs=[];
  }
  temp={};
}

console.log(final);

var ref=admin.database().ref('/Colleges/C-1297/Seat/');
ref.update(final);

handle_requests(app) ;


//HANDLE Static Request for any non Existing resource.
app.use(function(req, res, next){
    res.status(404).redirect('/404.html') ;
});

app.listen(8000) ;

exports.app = functions.https.onRequest(app) ;
