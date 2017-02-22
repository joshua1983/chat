function UbicacionDAO(db){
    if (false == (this instanceof UbicacionDAO)){
        console.log('WARNING: UbicacionDAO constructor called without "new" operator');
        return new UbicacionDAO(db);
    }  
    
    var ubicacion = db.collection('ubicacion');
    
    this.addUbicacion = function (latitud, longitud, callback){
        var _ubicacion = {
            'latitud': latitud,
            'longitud': longitud,
            'fecha': Date.now()
        };
        console.log(_ubicacion);

        ubicacion.findOne({
            'latitud': latitud,
            'longitud': longitud
        }, function(err, ubicaFind){
            if (err) throw err;
            if (ubicaFind){
                return callback(null, ubicaFind);
            }else{
                ubicacion.insert(_ubicacion, function(err,result){
                    if (err) return callback(err,null);
                    return callback(null,result[0]);
                });
            }
        });
        
    }
    this.ultimaUbicacion = function (limit, callback){

        ubicacion.find().sort({"fecha": -1}).limit(limit).toArray(function(err, ubicacion){
            console.log(ubicacion);
            if (err) return callback(err, null);
            var latitud = ubicacion[0].latitud;
            var longitud = ubicacion[0].longitud;
            var retorno = {
                "latitud": latitud,
                "longitud": longitud
            }
            return callback(null, retorno);    
        });
        
    }
    
}

module.exports.UbicacionDAO = UbicacionDAO;

