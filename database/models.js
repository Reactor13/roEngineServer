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
// ***  Database module  -->  Models  ************************* 
// ************************************************************


var mongoose = require('mongoose'), Schema = mongoose.Schema;

var patternSchema = new Schema({
	bot_name:
	{
		type     : String,
		required : true	
	},
	question_words:
	{
		type     : Array,
		required : true	
	},
	context_words:
	{
		type: Array
	},
	answer:
	{
		type: String,
		required : true	
	}
});   

exports.Pattern = mongoose.model('Pattern', patternSchema);