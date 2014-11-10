var config = require('../config');
var rabbit = require('rabbit.js');
var queues = require('../queues');
var PhantomWrapper = require('../phantom').PhantomWrapper;

var Reap = function(){ };

module.exports.Reap = Reap;

// Private Members & Methods
var _context = null;
var _urlQueue = null;
var _queueName = null;
var _phantom = null;
var _onDataCallback = null;
var _waitInterval = 1000;

var onPhantomError = function(err){
  if(err) {
    console.log(err);
  }

  if(_phantom) {
    _phantom.stopPhantom();
  }
};

var onPhantomExit = function(){
  _phantom = null;

  if(_urlQueue) {
    _urlQueue.close(function(){
      _urlQueue = null;
    });
  }
};

var processUrlQueue = function(){
  var item = _urlQueue.readItem();
  if(!item) {
    return;
  }

  console.log('processing item ' + item.payload);
  _phantom.getHtml(item.payload);
};

var onPhantomData = function(html){
  _onDataCallback(html);
  _urlQueue.acknowledgeItem();
  setTimeout(processUrlQueue, _waitInterval);
};

var initializeUrlQueue = function(){
  // get the next store to process
  _urlQueue = new queues.UrlQueue();
  _urlQueue.on('ready', processUrlQueue);
  _urlQueue.initialize(_queueName, _context, "WORKER");
};

var initializeRabbitMQ = function(){
  _context = rabbit.createContext(config.rabbit.url);
  _context.on('ready', initializeUrlQueue);
};


// Public Methods
Reap.prototype.start = function(queueName, onDataCallback){
  _queueName = queueName;
  _onDataCallback = onDataCallback;

  if(!_queueName) {
    throw new Error("Must specify a queue name to reap from.");
  }

  _phantom = new PhantomWrapper();
  _phantom.on('ready', initializeRabbitMQ);
  _phantom.on('error', onPhantomError);
  _phantom.on('exit', onPhantomExit);
  _phantom.on('data', onPhantomData);
  _phantom.startPhantom();
};
