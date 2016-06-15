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
// ***  Database module  **************************************
// ************************************************************



console.log('[Database] Database module activated');

var serverConfig = require('../config')
var mongoose     = require('mongoose');
var async        = require('async');
var db           = mongoose.connection;
var Pattern      = require('./models').Pattern;
var apiKey       = require('./models').apiKey;

mongoose.connect(serverConfig.mongoose.uri);
db.on  ('error', function() {console.error('[Database] ... MongoDB not connected')});
db.once('open',  function() 
{
	console.log  ('[Database] ... MongoDB connected')
	
	var dbNative = mongoose.connection.db;
	dbNative.dropDatabase (function(err)
	{
		if (err) throw err;
		console.log ('[Database][Debug function] ... Database dropped')
		
		async.parallel(
		[
			function(callback)
			{
				var apiKey1 = new apiKey({
					key    : '0000001',
					origin : ['*'],
				});
				apiKey1.save(function(err) {callback(err, apiKey1)})
			},
			function(callback)
			{
				var apiKey2 = new apiKey({
					key    : '0000002',
					origin : ['http://p-bot.ru','http://chatbot.tw1.ru'],
				});
				apiKey2.save(function(err) {callback(err, apiKey2)})
			},
			function(callback)
			{
				var apiKey3 = new apiKey({
					key    : '0000003',
					origin : ['http://p-bot.ru','*']
				});
				apiKey3.save(function(err) {callback(err, apiKey3)})
			},
			function(callback)
			{
				var pattern1 = new Pattern({
					bot_name: 'robot',
					question_words: ['Привет', 'Здраствуйте'],
					answer: 'Привет, человек!'
				});
				pattern1.save(function(err) {callback(err, pattern1)})
			},
			function(callback)
			{	
				var pattern2 = new Pattern({
					bot_name: 'robot',
					question_words: ['Как', 'дела'],
					answer: 'Все отлично!'
				});
				pattern2.save(function(err) {callback(err, pattern2)})
			},
			function(callback)
			{	
				var pattern3 = new Pattern({
					bot_name: 'robot',
					question_words: ['Привет', 'Как', 'у', 'тебя', 'дела'],
					answer: 'Привет! У меня все хорошо! А как у тебя дела?'
				});
				pattern3.save(function(err) {callback(err, pattern3)})
			},
			function(callback)
			{
				var pattern4 = new Pattern({
					bot_name: 'robot',
					question_words: ['Пока'],
					answer: 'Досвидания'
				});
				pattern4.save(function(err) {callback(err, pattern4)})
			}
		
		], function (err, results)
		{
			console.log ('[Database][Debug function] ... Test patterns created')
		});
	});
});



// Функция делает предварительную выборку паттернов, которые содержат слова из входящего массива
// *********************************************************************************************

function findPatterns(botname, arrayQuestionWords, callback)
{
	var searchRegString = ''
	arrayQuestionWords.forEach(function(word, i, arr) {
		if (i>0) searchRegString += '|'
		searchRegString += '^' + word + '$' 
	});
	
	var searchREG = new RegExp(searchRegString, "i");
	
	Pattern.find({question_words: searchREG, bot_name: botname }, function(err, patterns)
	{
		if (err) throw err;
		callback(err, patterns);
	});
}
exports.findPatterns = findPatterns;



// Функция возвращает колличество паттернов в базе знаний
// ******************************************************

function totalPatternsLength(callback)
{
	Pattern.find({}, function(err, patterns)
	{
		if (err) throw err;
		callback(err, patterns.length);
	});
}
exports.totalPatternsLength = totalPatternsLength;



// Функция проверяет доступ для APIKEY и домена к REST API
// *******************************************************
function checkApiKey(apikey, origin, callback)
{
	console.log ('[Database] ... checkApiKey function --> starting');
	apiKey.findOne({key: apikey}, function(err, founded_apikey)
	{
		if (err) 
		{
			console.log ('[Database] ... checkApiKey function --> complete width errors');
			callback (err, false);
		}
		else
		{
			if (founded_apikey == null) 
			{
				console.log ('[Database] ... checkApiKey function --> complete, apikey does not exist');
				callback (null, false);
			}
			else
			{				
				if (founded_apikey.origin.indexOf(origin) != -1 || founded_apikey.origin.indexOf('*') != -1) 
				{
					console.log ('[Database] ... checkApiKey function --> complete');
					callback (null, true);
				}
				else
				{
					console.log ('[Database] ... checkApiKey function --> complete, origin does not match apikey');
					callback (null, false);
				}
			}
		}
	});
}
exports.checkApiKey = checkApiKey;