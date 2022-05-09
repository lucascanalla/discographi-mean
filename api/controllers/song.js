'use strict'

var fs = require('fs');
var path = require('path');
var mongoosePaginate = require('mongoose-pagination');

var Album = require('../models/album');
var Song = require('../models/song');

function getSong(req, res) {

	var songId = req.params.id;

	Song.findById(songId, (err, song) => {
		if (err) {
			res.status(500).send({message:'Error al buscar la Cancion'});
		}else{
			if (!song) {
				res.status(404).send({message:'La Cancion no existe'});
			}else{
				res.status(200).send({song: song});
			}
		}
	});

};

function saveSong(req, res) {
	var song = new Song();

	var params = req.body;
	song.number = params.number;
	song.name = params.name;
	song.duration = params.duration;
	song.file = 'null';
	song.album = params.album;

	song.save((err, songStored) => {
		if (err) {
			res.status(500).send({message:'Error en la peticion'});
		}else{
			if (!songStored) {
				res.status(404).send({message:'La Cancion no se ha guardado'});
			}else{
				res.status(200).send({song: songStored});
			}
		}
	});

};

function getSongs(req, res) {
	
	var albumId = req.params.album;

	if (!albumId) {
		//trae todos las canciones de la db
		var find = Song.find({}).sort('number');
	}else{
		//trae todos las canciones de un album en particular de la db		
		var find = Song.find({album: albumId}).sort('number');
	}

	find.populate({
		path:'album',
		populate: {
			path: 'artist',
			model: 'Artist'
		}
	}).exec((err, songs) => {
		if (err) {
			res.status(500).send({message: 'Error en la peticion'});
		}else{
			if (!albums) {
				res.status(404).send({message: 'No hay Canciones'});
			}else{
				res.status(200).send({songs});
			}
		}
	});

};

function updateSong(req, res) {
	var songId = req.params.id;
	var update = req.body;

	Song.findByIdAndUpdate(songId, update, (err, songUpdated) => {
		if (err) {
			res.status(500).send({message:'Error en la peticion'});
		}else{
			if (!songUpdated) {
				res.status(404).send({message:'No se ha encontrado la Cancion'});
			}else{
				res.status(200).send({song: songUpdated});
			}
		}
	})

}

function deleteSong(req, res) {
	var songId = req.params.id;

	Song.find({song: songId}).remove((err, songDeleted) => {
		if (err) {
			res.status(500).send({message:'Error en la peticion'});
		}else{
			if (!songDeleted) {
				res.status(404).send({message:'No se ha eliminado la Cancion'});
			}else{
				res.status(200).send({song: songDeleted});
			}
		}

	});
			
}

module.exports = {
	getSong,
	saveSong,
	getSongs,
	updateSong,
	deleteSong
};