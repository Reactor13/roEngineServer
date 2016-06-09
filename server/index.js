//
//
//     _    _      _     _ _          
//    / \  (_)_ __| |__ (_) |_ ___ 
//   / _ \ | | '__| '_ \| | __/ __|
//  / ___ \| | |  | |_) | | |_\__ \
// /_/   \_\_|_|  |_.__/|_|\__|___/
//          ___           _            ___                      
//  _ _ ___| __|_ _  __ _(_)_ _  ___  / __| ___ _ ___ _____ _ _ 
// | '_/ _ \ _|| ' \/ _` | | ' \/ -_) \__ \/ -_) '_\ V / -_) '_|
// |_| \___/___|_||_\__, |_|_||_\___| |___/\___|_|  \_/\___|_|  
//                  |___/       
//   
//   
// ************************************************************
// ***  Server module  ****************************************
// ************************************************************


console.log('[Server] Server module activated')

var fs           = require('fs');
var http         = require('http');
var url          = require('url');
var kernel       = require('.././kernel');
var serverConfig = require('../config');
var DataBase     = require('.././database');

var appServer = new http.Server(function(req,res)
{
	var urlParsed              = url.parse(req.url, true);
	var correctRequest         = new Boolean(false);
	var incorrectRequestReason = new String();
	var clientIP               = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	var clientHost             = req.headers.host;
	var clientOrigin           = req.headers.origin;
	
	if (clientOrigin === undefined) {clientOrigin = null}
	console.log('[Server] New request from : ' + clientIP + ', host :' + clientHost + ', origin : ' + clientOrigin);
	
	if (urlParsed.pathname == '/')
	{
		res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin':'*'});
		correctRequest = true;
		
		fs.readFile('./templates/roEngineServerHello.txt', {encoding: 'utf-8'}, function(err, data) {
			if (err)
			{
				res.end('roEngine Server, version: ' + serverConfig.serverVersion);
			}
			else
			{
				res.end(data + ' roEngine Server, version: ' + serverConfig.serverVersion);
			}
			
		});
	}
	
	if (urlParsed.pathname == '/api/echo' && urlParsed.query.message)
	{
		if (urlParsed.query.message.length < 10)
		{
			res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin':'*'});
			res.end('Echo: ' + urlParsed.query.message);
			correctRequest = true;
		}
		else
		{
			correctRequest         = false;
			incorrectRequestReason = 'Echo message is too long.';
		}
	}	
	
	if (urlParsed.pathname == '/api/getAnswer')
	{
		correctRequest = true
		if (urlParsed.query.apikey   == null || urlParsed.query.apikey.length   > 255) {correctRequest = false; incorrectRequestReason += 'Apikey is missing or is too long; ';}
		if (urlParsed.query.question == null || urlParsed.query.question.length > 255) {correctRequest = false; incorrectRequestReason += 'Question is missing or is too long; ';}
		if (urlParsed.query.botname  == null || urlParsed.query.botname.length  > 255) {correctRequest = false; incorrectRequestReason += 'Botname is missing or is too long; ';}
		if (urlParsed.query.context  != null && urlParsed.query.context.length  > 255) {correctRequest = false; incorrectRequestReason += 'Context is too long; ';}
		
		if (correctRequest)
		{
			DataBase.checkApiKey(urlParsed.query.apikey,clientOrigin,function(err, isAllowed) {
				if (err) throw err;
				if (isAllowed === true)
				{
					kernel.getAnser(urlParsed.query.botname, urlParsed.query.question, urlParsed.query.context, function(err, answer){
						if (err) throw err;
						res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin':'*'});
						res.end(answer); 
					});
				}
				else
				{
					res.statusCode = 404;
					res.end('Api key is invalid');
				}
			});	
		}
	}
	
	if (correctRequest == false)
	{
		res.statusCode = 404
		res.end('Incorrect request. ' + incorrectRequestReason);		
	}
})

function startServer()
{
	appServer.listen (serverConfig.serverPort, serverConfig.serverIP);
	console.log('[Server] ... Server is running on ' + serverConfig.serverIP + ':' + serverConfig.serverPort);
}

function stopServer()
{
	appServer.close();
	console.log('[Server] ... Server closed');
}

exports.appServer   = appServer;
exports.startServer = startServer;
exports.stopServer  = stopServer;