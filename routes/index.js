/*jslint node: true */
"use strict";

var express = require('express');
var router = express.Router();

var utils = require('../helpers/tools');
var pv = require('../helpers/api_caller');

router.get('/statusCode/:url', function(req, res){
	//finds the http status code of a webpage
	try {
		req.param.url = utils.formatUrl(req.param.url);
	} catch (err) {
		res.render('error', {error: "Invalid url"});
	}
	utils.getStatusCode(req.params.url)
	.then(function(statusCode){
		req.statusCode = statusCode;
		renderPage(req, res);
	}).catch(function(err){
		utils.errorHandler(err);
	});
});

router.get('/a/:archiveId', function(req, res){
	//gets a short url for an archive id
	if (!utils.checkValidId(req.params.archiveId)) { res.send("Invalid id"); }
	pv.findById(req.params.archiveId)
	.then(function(archive){
		console.log(archive);
		res.render("url", {archive: archive});
	}).catch(function(err){
		res.render('archiveNotFound');
	});
});

router.get('/http://*', function(req, res) {
	//gets the instanced use of a url if redirected from a short url
	//gets all the uses of the url if not redirected from a short url
	try {
		req.params[0] = utils.formatUrl(req.params[0]);
	} catch (err) {
		res.send("Invalid url");
	}
	if (req.archive){
		res.render('url', {archive: req.archive});
	} else {
		pv.findByUrl(req.params[0])
		.then(function(usages){
			res.render('urlUsage', {usages: usages});
		});
	}
});


function renderPage(req, res){
	if (req.statusCode > 400){
		res.render('error', {url: req.params[0], statusCode: req.statusCode});
	} else {
		res.render('url', {url: "google", statusCode: req.statusCode});
	}
}


router.get('/', function(req, res) {
	res.send("It is working!");
});

module.exports = router;
