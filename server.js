var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var MongoClient = require('mongodb').MongoClient;
var userDAO = require('./dao/UserDAO').UserDAO;
var messageDAO  = require('./dao/mensajesDAO').MessageDAO;

app.use(bodyParser());

var mdbconf = {
    host: 'localhost',
    port: '27017',
    db: 'chat'
};

MongoClient.connect('mongodb://'+mdbconf.host+':'+mdbconf.port+'/'+mdbconf.db, function (err, db) {
   if (err) return new Error('no se pudo conectar a mongo');
    
    var usersDAO = new userDAO(db);
    var mensajesDAO = new messageDAO(db);
    var onlineUsers = [];
    
    
    app.post('/signup', function(req, res){
        var usuario = req.body.usuario;
        usersDAO.addUser(usuario,usuario, function(err,user){
            if(err){
                res.send({'error': true, 'err': err});
            }else{
                res.send({
                    'error': false,
                    'user': user
                });
            }
        });
    });
    
    app.post('/login', function(req, res){
        var usuario = req.body.usuario;
        usersDAO.validateLogin(usuario,function(err, user){
            if(err){
                res.send({
                    'error': true,
                    'err': err
                });
            }else{
                res.send({
                    'error': false,
                    'user': user
                });
            }            
        });
    });
    
    app.get('/', function(req,res){
        res.sendFile(__dirname + '/vista/chat.html');
    });
    app.get('/js/chat.js', function(req, res){
        res.sendFile(__dirname + '/vista/js/chat.js');
    });
    
    io.on('connection', function(socket){
        console.log("nuevo usuario");
        
        socket.on('all online users', function(){
            socket.emit('all online users', onlineUsers);
        });

        socket.on('chat mensaje', function(msg){
            mensajesDAO.addMessage(msg.usuario, msg.para,Date.now(),msg.mensaje, function(err, nmsg){
                io.emit('chat mensaje', msg);
            });            
        });
        

        socket.on('disconnect', function(){
            onlineUsers.splice(onlineUsers.indexOf(socket.user),1);
            io.emit('remove user', socket.user);
            console.log('desconectado');
        });
        
        socket.on('new user', function(nuser){
            socket.user = nuser;
            onlineUsers.push(nuser);
            io.emit('new user',nuser);
        });
    });

});



http.listen(3000, function(){
    console.log('escuchando por :3000');
});

