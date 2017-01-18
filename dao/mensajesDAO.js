function MessageDAO(db){
    if (false == (this instanceof MessageDAO)){
        console.log('WARNING: MessageDAO constructor called without "new" operator');
        return new MessageDAO(db);
    }
    
    var messages = db.collection('mensajes');
    this.addMessage = function (username, para, date, mensaje, callback){
        var mensaje = {
            'usuario': username,
            'destinatario': para,
            'date': date,
            'mensaje': mensaje
        }
        
        messages.insert(mensaje, function(err, result){
            if (err) return callback(err, null);
            
            console.log('Mensaje guardado');
            return callback(null, result[0]);
        });
    }
    
    this.getUltimosMensajes = function(p_user, d_user, limit, callback){
        var qryOptions = {
            'sort': [['date', 'desc']],
            'limit': limit
        };
        
        var filtro = {"$or":[{"usuario": p_user},{ "usuario" : d_user}]};
    
        
        messages.find(filtro, qryOptions).toArray(function(err, rmessages){
            if (err) return callback(err, null);
            
            return callback(null, rmessages);
        });
    }
    
    
}

module.exports.MessageDAO = MessageDAO;