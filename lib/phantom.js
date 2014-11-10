var nodePhantomSimple = require('node-phantom-simple');
var async = require('async');
var EventEmitter = require('events').EventEmitter;

// Private Members & Methods
var _webPage = null;
var _phantomProcess = null;
var _this = null;

var PhantomWrapper = function() {
  _this = this;
  EventEmitter.call(this);
};

module.exports.PhantomWrapper = PhantomWrapper;

var _events = {
  error: 'error',
  ready: 'ready',
  exit: 'exit',
  data: 'data'
};

var _errorMessages = {
  notInitialized: 'Phantom is not initialized.',
  alreadyInitialized: 'Phantom is already initialized.',
  getHtmlError: 'An error occurred while attempting to get the html.'
};

var onPhantomInitialized = function(err, page){
  if(err) {
    return _this.emit(_events.error, err);
  }

   _webPage = page;
   _this.emit(_events.ready);
};

var isPhantomInitialized = function(){
  return (_phantomProcess || _webPage);
};

PhantomWrapper.prototype.startPhantom = function(){
  if(isPhantomInitialized()){
    return _this.emit(_events.error,
      new Error(_errorMessages.alreadyInitialized)
    );
  }

  async.waterfall([ nodePhantomSimple.create,
      function(phantom, callback){
          _phantomProcess = phantom;
          _phantomProcess.createPage(callback);
      }],
      onPhantomInitialized);
};


PhantomWrapper.prototype.getHtml = function(url){
  if(!isPhantomInitialized()) {
    return _this.emit(_events.error, new Error(_errorMessages.notInitialized));
  }

  async.waterfall([
    function(callback){
       _webPage.open(url, callback);
    },
    function(status, callback){
       _webPage.get('content', callback);
    }
  ],
  function (err, html) {
    if(err) {
      return _this.emit(_events.error, err);
    }
    return _this.emit(_events.data, html);
  });
};


PhantomWrapper.prototype.stopPhantom = function(){
  if(isPhantomInitialized())
  {
    return _phantomProcess.exit(function(){
      _phantomProcess = null;
      _webPage =  null;
      return _this.emit(_events.exit);
    });
  }

  return _this.emit(_events.error, new Error(_errorMessages.notInitialized));
};
