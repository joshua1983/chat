
function UserDAO(db){
    if (false == (this instanceof UserDAO)){
        console.log('WARNING: UserDAO constructor called without "new" operator');
        return new UserDAO(db);
    }
    
    var users = db.collection('users');
    
    this.addUser = function (usuario, nombre, email, callback){
        var user = {
            'usuario': usuario,
            'nombre': decodeURIComponent(nombre),
            'correo': email
        };
        
        users.findOne({
            'usuario': usuario
        }, function(err, userFind){
            if (err) throw err;
            if (userFind){
                return callback(null, userFind);
            }else{
                users.insert(user, function(err,result){
                    if (err) return callback(err,null);
                    return callback(null,result[0]);
                });
            }
        });
        
        
    }
    
    this.validateLogin = function(usuario, callback){
        users.findOne({'usuario': usuario}, function(err, user){
            if (err) return callback(err, null);
            
            if (user){
                callback(null,user);
            }else{
                callback(new Error('No encontrado'), null);
            }
        });
    }
}

module.exports.UserDAO = UserDAO;

