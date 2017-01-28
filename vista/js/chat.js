var user = {};
var conectados = [];


$(document).ready(function(){
    var id=GetURLParameter('id');
    var nombre=encodeURI(GetURLParameter('nombres'));
    var correo = GetURLParameter('correo');
    registrar(id, nombre, correo);
});

function GetURLParameter(sParam){

    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++){
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam){
            return sParameterName[1];
        }
    }
}

function registrar(id, nombre, correo){
    $.ajax({
        type: "POST",
        url: '/signup',
        data: {
           'usuario': id,
           'nombre': nombre,
           'correo': correo
        }, 
        success: function (data) {
            $('#msg').empty();
            if (data.error) {
                $('#msg').append(data.err.msg);
            }
            else {
                login(id);
            }
        },
        dataType: 'json'
    });
}

function login(id){
    $.ajax({
        type: "POST",
        url: '/login',
        data: {
            "usuario": id
        },
        success: function (data) {
            $('#msg').empty();
            if (data.error) {
                var html = '<div >'
               + data.err.msg + '</div>';
                $('#alerts').append(html);
            }
            else {
                user = data.user;
                var socket = new io();
                configureSocket(socket);
            }
        },
        dataType: 'json'
    });
}

function configureSocket(socket) {
    socket.on('all online users', function(users){
        console.log(users.length + ' usuarios recibidos');
        conectados = users;
        for (var i=0; i<users.length; i++){
            var htmlUser = '<li id="' + users[i].usuario +'">' + decodeURIComponent(users[i].nombre )+'</li>';
            $("#online").append(htmlUser);
        }
    });

    socket.on('chat mensaje', function(msg){
        $('#list-msgs').append($('<li>').text('['+msg.usuario+']:'+msg.mensaje));
    });

    socket.on('new user', function(nuser){
        var nhtml = '<li id="'+nuser.usuario+'">'+decodeURIComponent(nuser.nombre)+'</li>';
        $("#online").append(nhtml);
    });

    socket.on('remove user', function(nuser){
        $('#'+nuser.usuario).remove();
    });


    $('#new-msg').keyup(function (evt){
        var destino = conectados.slice(-1).pop();
        if (evt.keyCode === 13){
            var mensaje = {
                usuario: user.usuario,
                para: destino.usuario,
                mensaje: $("#new-msg").val()
            }
            socket.emit('chat mensaje', mensaje );
            $("#new-msg").val('');
        }
    });

    socket.emit('all online users');
    socket.emit('new user', user);
    
}

function appendMessage(msg){
    $('#list-msgs').append($('<li>').text('['+msg.usuario+']:'+msg.mensaje));
}
