var fs = require("fs") ; 
var http = require("http") ;

var server = http.createServer(function(req , res){

    res.writeHead(200 , {'Content-Type' : 'text/html'}); 
    
    // fs.readFile("../Attention_Please/src/index.html", function(err , data)
    // {
    //     res.write(data) ;        
    // }) ;

    res.write("<h1>Hello this is my resp</h1>") ;

    res.end() ;

})


server.listen(8000 , "127.0.0.1") ;
console.log("Listening to port 8000") ;