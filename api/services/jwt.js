'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_secreta';

exports.createToken = function(user){
	var payLoad = {
		sub: user.id,
		name: user.name,
		surname: user.surname,
		email: user.email,
		role: user.role,
		img: user.img,
		iat: moment().unix(),
		exp: moment().add(30,'days').unix

	};

	return jwt.encode(payLoad, secret);
};