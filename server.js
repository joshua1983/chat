var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var MongoClient = require('mongodb').MongoClient;
var userDAO = require('./dao/userDAO').UserDAO;
var messageDAO  = require('./dao/mensajesDAO').MessageDAO;
var ubicacionDAO = require('./dao/ubicacionDAO').UbicacionDAO;

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
    var ubicaDAO = new ubicacionDAO(db);
    var onlineUsers = [];
    
    
    app.post('/signup', function(req, res){
        var usuario = req.body.usuario;
        var nombre = req.body.nombre;
        var correo = req.body.correo;

        usersDAO.addUser(usuario,nombre,correo, function(err,user){
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
    app.get('/signup', function(req, res){
        var usuario = req.body.usuario;
        var nombre = req.body.nombre;
        var correo = req.body.correo;

        usersDAO.addUser(usuario,nombre,correo, function(err,user){
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
    app.get('/login', function(req, res){
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
    app.get('/data', function(req,res){
        //7.1650177,-73.1782861
        //-34, 151
/*
        var ubicaciones = [
            {
                "lat": 7.117127, "lon": -73.105399
            },
            {
                "lat": 7.118099, "lon": -73.105148
            },
            {
                "lat": 7.118929, "lon": -73.104872
            },
            {
                "lat": 7.117803, "lon": -73.104621
            },
            {
                "lat": 7.116606, "lon": -73.104327
            },
            {
                "lat": 7.115674, "lon": -73.104748
            }

        ];
        var indice = Math.random() * (6-0) + 0;
        var ubicacion = ubicaciones[parseInt(indice)];
        */
        ubicaDAO.ultimaUbicacion(1, function(err, ubicacion){
            console.log(ubicacion);
            res.send(ubicacion);
        });
        
        
    });

    app.get('/setData/:lat/:lon', function(req,res){
        var latitud = req.params.lat;
        var longitud = req.params.lon;
        console.log(latitud);
        ubicaDAO.addUbicacion(latitud, longitud, function(err, ubic){
            res.send({ 
                    'error': false,
                    'err': '-',
                    'lat': latitud, 
                    'lon': longitud
                });
        });
    });

    app.get('/save', function(req,res){
        var coordenada_string = req.body.coord;
        
    });
    
    io.on('connection', function(socket){
        console.log("nuevo usuario");
        
        socket.on('all online users', function(){
            console.log(onlineUsers);
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
            console.log(onlineUsers);
        });
    });

});



http.listen(3000, function(){
    console.log('escuchando por :3000');
});

