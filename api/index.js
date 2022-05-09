'use strict'

var mongoose = require("mongoose");
var app = require("./app");
var port = process.env.PORT || 3977;

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/curso_mean', (err, res) => {
	if(err){
		throw err;
	}else{
		console.log("the db is running");

		app.listen(port, function(){
			console.log('Server API REST listen in http://localhost:'+port); 
		});

	}
});
