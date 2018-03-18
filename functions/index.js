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
for(i=0;dat[i]!=undefined;i++){
  console.log(dat[i]['USN']+':');
  console.log(dat[i]);
}

handle_requests(app) ;


//HANDLE Static Request for any non Existing resource.
app.use(function(req, res, next){
    res.status(404).redirect('/404.html') ;
});

app.listen(8000) ;

exports.app = functions.https.onRequest(app) ;
