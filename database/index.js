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

