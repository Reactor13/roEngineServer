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
// ***  Kernel module  ****************************************
// ************************************************************


console.log('[Kernel] Kernel module activated')

var async    = require('async');
var DataBase = require('.././database')


function getAnser(botname, userQuestion, userContext, callback)
{
	console.log('[Kernel] ... getAnser function --> starting')
	
	var arrayQuestionWords = stringToWords(userQuestion);
	var maxScore           = 0;
	var maxScoreIndex      = -1;
	
	
	DataBase.findPatterns(botname, arrayQuestionWords, function (err, patterns)
	{
		if (err)
		{
			console.log('[Kernel] ... getAnser function --> complete with error')
			callback(err, 'Answer not found')
		}			
		else
		{	
			calcScore(patterns)
		}
	});
	
	
	
	function calcScore(patterns)
	{
		console.log('[Kernel] ... getAnser function --> calcScore function --> starting')
		
		var curScore;
		var matchWords;
		var matchWordsQuantityBall;
		
		patterns.forEach(function(pattern, patternIndex, arr)
		{
			curScore               = 0;
			matchWords             = 0;
			matchWordsQuantityBall = 0;
			
			for (var i = 0; i < arrayQuestionWords.length; i++)
			{
				for (var j = 0; j < pattern.question_words.length; j++)
				{
					if (arrayQuestionWords[i].toLowerCase() == pattern.question_words[j].toLowerCase())
					{
						curScore   += 100;
						matchWords += 1;
					}
				}
			}
			
			// --- Анализ отношения количества совпавших слов к общему количеству слов в паттерне ---			
			matchWordsQuantityBall = -10*Math.abs(pattern.question_words.length - matchWords)
			if (pattern.question_words.length == matchWords) {matchWordsQuantityBall = 10}
			curScore += matchWordsQuantityBall;
			// --------------------------------------------------------------------------------------
			
			console.log ('[Kernel] ... ... ' + curScore + ' ' + matchWordsQuantityBall + ' ' + pattern.question_words);
			
			if (curScore > maxScore)
			{
				maxScore      = curScore
				maxScoreIndex = patternIndex
			}
		});
		
		console.log('[Kernel] ... getAnser function --> calcScore function --> complete')
		
		if (maxScoreIndex != -1)
		{
			sendAnswer(patterns[maxScoreIndex].answer);
		}
		else
		{
			sendAnswer('Answer not found');
		}
	}
	
	
	
	// Внутренняя функция, которая завершает работу getAnser и вызывает callback
	// *************************************************************************
	function sendAnswer(answer) 
	{
		console.log('[Kernel] ... getAnser function --> complete')
		callback(null, answer)
	}
	
}
exports.getAnser = getAnser



// Функция разбивает входящую строку на массив слов
// ************************************************

function stringToWords(inputString)
{
	var arrayWords = new Array();
	
	arrayWords = inputString.match(/[\wа-яё\+\-]+/gi);	
	arrayWords.forEach(function(word, i, arr) {
		if (word === '') arrayWords.splice(i,1);
	});
	
	return arrayWords;
}