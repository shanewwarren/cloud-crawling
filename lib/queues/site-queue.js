var EventEmitter = require('events').EventEmitter;
var util = require("util");

var SiteQueueItem = function(siteUrl) {
  this.site = siteUrl;
  this.timestamp = new Date();
};

// Private Members & Methods
var _socket = null;
var _queueName = "site_queue";
var _closing = false;

var SiteQueue = function(queueName){
  if(queueName) {
    _queueName = queueName;
  }

  EventEmitter.call(this);
};

util.inherits(SiteQueue, EventEmitter);

module.exports = SiteQueue;

// Public Methods
SiteQueue.prototype.initialize = function(context, type){
    if(type === "WORKER") {
      _socket = context.socket(type, {prefetch: 1});
    } else {
      _socket = context.socket(type);
    }
    var self = this;
    _socket.connect(_queueName, function(){
      self.emit('ready');
    });

};

SiteQueue.prototype.close = function(callback){
  if(_socket){
    _closing = true;
    _socket.on('close', function(){
      _socket = null;
      callback();
    });
    _socket.close();
    return;
  }else{
    if(callback) {
      callback();
    }
  }
};

SiteQueue.prototype.readItem = function(){
  var message = _socket.read();
  return JSON.parse(message);
};

SiteQueue.prototype.acknowledgeItem = function(){
  _socket.ack();
};

SiteQueue.prototype.writeItem = function(siteUrl){
  var item = new SiteQueueItem(siteUrl);
  _socket.write(JSON.stringify(item), 'utf8');
};
