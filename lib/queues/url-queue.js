var EventEmitter = require('events').EventEmitter;
var util = require("util");

var UrlQueueItem = function(messageType, payload) {
  this.messageType = messageType;
  this.payload = payload;
  this.timestamp = new Date();
};

// default name for the queue.
var _queueName = "url_queue";
var _socket = null;

var UrlQueue = function(queueName){
  if(queueName){
    _queueName = queueName;
  }

  EventEmitter.call(this);
};

util.inherits(UrlQueue, EventEmitter);



module.exports = UrlQueue;

UrlQueue.prototype.initialize = function(context, type){
    if(type === "WORKER") {
      _socket = context.socket(type, {prefetch: 1});
    }
    else {
      _socket = context.socket(type);
    }

    var self = this;
    _socket.connect(_queueName, function(){
      self.emit('ready');
    });
};

UrlQueue.prototype.close = function(callback){
  if(_socket){
    _socket.on('close', callback);
    _socket.close();
    return;
  }else{
    callback();
  }
};

UrlQueue.prototype.readItem = function(){
  var message = _socket.read();
  return JSON.parse(message);
};

UrlQueue.prototype.acknowledgeItem = function(){
  _socket.ack();
};

UrlQueue.prototype.writeStart = function(){
  var item = new UrlQueueItem('START', null);
  _socket.write(JSON.stringify(item), 'utf8');
};

UrlQueue.prototype.writeStop = function(){
  var item = new UrlQueueItem('STOP', null);
  _socket.write(JSON.stringify(item), 'utf8');
};

UrlQueue.prototype.writeUrl = function(url){
  var item = new UrlQueueItem('MESSAGE', url);
  _socket.write(JSON.stringify(item), 'utf8');
};
