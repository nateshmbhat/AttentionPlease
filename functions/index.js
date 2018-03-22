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

app.use(cookieparser()) ;
app.use(express.static('../public' )  ) ;
app.use(express_file_upload()) ;


handle_requests(app) ;




//HANDLE Static Request for any non Existing resource.
app.use(function(req, res, next){
    res.status(404).redirect('/404.html') ;
});

app.listen(8000) ;

exports.app = functions.https.onRequest(app) ;
