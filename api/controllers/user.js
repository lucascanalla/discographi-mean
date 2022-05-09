'use strict'

var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');
var bodyParser = require('body-parser');

function pruebas(req, res){
	res.status(200).send({
		message:'probando el controlador'
	});
}

function saveUser(req, res) {
	var user = new User;
	var params = req.body;

	user.name = params.name;
	user.surname = params.surname;
	user.email = params.email;
	user.role = 'ROLE_USER';
	user.image = 'null';

	if (params.password) {
		//encriptar contra
		bcrypt.hash(params.password, null, null, function(err, hash){
			user.password = hash;
			if (user.name != null && user.surname != null && user.email != null) {
				//guardar el usuario con el metodo save de mongoose
				user.save((err, userStored) => {
					if(err){
						res.status(500).send({message:'Error al guardar el Usuario'});
					}else{
						if (!userStored) {
							res.status(404).send({message:'No se ha registrado el Usuario'});
						}else{
							res.status(200).send({user: userStored});
						}
					}
				})
			}else{
				res.status(200).send({message:'Introduce todos los datos LA COncha de tu madre'});
			};
		});
	}else{
		res.status(500).send({message: 'Introduce la Contrasenia'});
	};

};

function loginUser(req, res) {
	var params = req.body;

	var email = params.email;
	var password = params.password;

	User.findOne({email: email.toLowerCase()}, (err, user) => {
		if (err) {
			res.status(500).send({message:'Error en la peticion'});
		}else{
			if (!user) {
				res.status(404).send({message:'No se ha encontrado el Usuario'});
			}else{
				bcrypt.compare(password, user.password, function(err, check) {
					if (check) {
						//devolver los datos del usuario creado
						if (params.gethash) {
							//devolver un token con jwt para usarlo en toda la sesion
							res.status(200).send({
								token: jwt.createToken(user)
							});
						}else{
							res.status(200).send({user});
						}
					}else{
						res.status(404).send({message:'El usuario no ha podido loguearse'});						
					}
				});
			}
		}
	});

};

function updateUser(req, res) {
	
	var userId = req.params.id;
	var update = req.body;
	//var parsed = bodyParser.json(req.body);
	//console.log(parsed);

	if (userId != req.user.sub) {
		//comprueba que el usuario que se va a updatear sea igual al del token (req.user.sub) en el middleware y jwt.ts
		return res.status(500).send({message:'No tienes permiso para actualizar el Usuario'});	
	}

	if (update.password) {
		//encriptar contra
		bcrypt.hash(update.password, null, null, function(err, hash){
			if(err){
				res.status(500).send({message:'Ha Habido un error al Encriptar la contra'});
			}else{
				update.password = hash;
				
				User.findByIdAndUpdate(userId, update, (err, userUpdated) => {
					if(err){
						res.status(500).send({message:'Error en la peticion'});
					}else{
						console.log(update);
						if (!userUpdated) {
							res.status(404).send({message:'No se ha encontrado el Usuario'});
						}else{
							console.log(userUpdated);
							res.status(200).send({user: userUpdated});
						}
					}
				})
				/*update.password = hash;*/

			}
		});
	}else{

		User.findByIdAndUpdate(userId, update, (err, userUpdated) => {
			if(err){
				res.status(500).send({message:'Error en la peticion'});
			}else{
				console.log(update);
				if (!userUpdated) {
					res.status(404).send({message:'No se ha encontrado el Usuario'});
				}else{
					console.log(userUpdated);
					res.status(200).send({user: userUpdated});
				}
			}
		})

	}	


};

function uploadImage(req, res) {

	var userId = req.params.id;
	var file_name = 'No subido';

	if (req.files) {

		var file_path = req.files.image.path;
		var file_split = file_path.split('\\');
		var file_name = file_split[2];

		var ext_split = file_name.split('\.');
		var file_ext = ext_split[1];

		console.log(file_name);

		if (file_ext == 'png' || file_ext == 'jpeg' || file_ext == 'gif' || file_ext == 'jpg') {

			User.findByIdAndUpdate(userId, {image: file_name}, (err, userUpdated) => {				
				if (!userUpdated) {
					res.status(404).send({message:'No se ha podido actualizar el Usuario'});
				}else{
					res.status(200).send({user: userUpdated});
				}
			});
		}

	}else{
		res.status(400).send({message: 'No se ha subido ninguna imagen'});
	}

};

function getImageFile(req, res) {
	
	var imageFile = req.params.imageFile;
	var path_file = './uploads/users/'+imageFile;

	fs.exists(path_file, function(exists){
		
		if (exists) {
			res.sendFile(path.resolve(path_file));
		}else{
			res.status(200).send({message:'No existe la imagen'})
		}
	});
}


module.exports = {
	pruebas,
	saveUser,
	loginUser,
	updateUser,
	uploadImage,
	getImageFile
};