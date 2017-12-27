/// <reference path=".\node_modules\@types\express\index.d.ts" />

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>   ALL IMPORTS 
const functions = require('firebase-functions');
const app = require("express")() ; 
const  express = require("express") ;
const handle_requests = require("./requests_controller") ;

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<   END OF IMPORTS 

app.use(express.static('../public' )  ) ;

handle_requests(app) ;


//HANDLE Static Request for any non Existing resource.
app.use(function(req, res, next){
    res.status(404).redirect('/404.html') ;
});


// app.listen(8000) ;

exports.app = functions.https.onRequest(app) ;