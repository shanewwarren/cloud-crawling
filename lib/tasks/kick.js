var config = require('../../config');
var rabbit = require('rabbit.js');
var async = require('async');
var queues = require('../queues');
	


var Kick = function(){};

module.exports.Kick = Kick;

// Private Members & Methods
var _context = null;
var _queue = null;
var _url = null;

var initializeRabbitMQ = function(callback){
  _context = rabbit.createContext(config.rabbit.url);
  _context.on('ready', function(){ callback(null); });
};

var initializeQueue = function(callback){
  // now open up a worker socket to conenct to the queue
  _queue = new queues.SiteQueue();
  _queue.on('ready', callback);
  _queue.initialize(_context, "PUSH");
};

var addIntentToQueue = function(err){
  if(err){
    return console.log("An error occurred while attempting to add item to queue - %s", err);
  }

  _queue.writeItem(_url);
  console.log('Intent added to crawl %s...', _url);
  _queue.close(function(){
    _context.close();
  });
};

// Public Methods
Kick.prototype.start = function(siteToCrawl){
  _url = siteToCrawl;

  async.waterfall(
  [ initializeRabbitMQ, initializeQueue ],
  addIntentToQueue);
};
