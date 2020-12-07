var express = require('express');
var app = express();

app.get('/', function(req,res){
    console.log('Hello World!');
    res.send('Hello World!');
});
app.get('/hello', function(req,res){
    console.log('Hello ' + req.query.name);
    res.send('Hello ' + req.query.name);
});

app.listen(3000,function(){
    console.log('Example app listening on port 3000');
})