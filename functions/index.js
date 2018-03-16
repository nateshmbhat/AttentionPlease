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
// var obj=xlsx.readFile('views/test.xlsx');
// var sh=obj.SheetNames;
// var dat=xlsx.utils.sheet_to_json(obj.Sheets[sh[0]]);
// console.log(dat);

//TEST AREA___KPS:____________________________________
// if(typeof require !== 'undefined') XLSX=require('xlsx');
// var workbook=XLSX.readFile('views/test.xlsx');
//
// var first_sheet_name=workbook.SheetNames[0];
// var address_of_cell='A1';
// var worksheet=workbook.Sheets[first_sheet_name]
// var desired_cell=worksheet[address_of_cell];
// var desired_value=(desired_cell ? desired_cell.v : undefined);
// 
// console.log(address_of_cell+':'+desired_value);
//______________________________________________________

handle_requests(app) ;


//HANDLE Static Request for any non Existing resource.
app.use(function(req, res, next){
    res.status(404).redirect('/404.html') ;
});


app.listen(8000) ;

exports.app = functions.https.onRequest(app) ;
