var config = require('../../config');
var rabbit = require('rabbit.js');
var async = require('async');
var Crawler = require("simplecrawler").Crawler;
var queues = require('../queues');
var url = require('url');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

// An enumeration of all the states
// the CloudCrawler emits.
var CloudCrawlerState =  {
    error: 'error',
    ready: 'ready',
    running: 'running',
    siteProcessed: 'siteProcessed',
    urlProcessed: 'urlProcessed',
    stopped: 'stopped',
    exit: 'exit',
    siteNew: 'siteNew'
};


var CloudCrawler = function () {
  EventEmitter.call(this);
};


util.inherits(CloudCrawler, EventEmitter);

module.exports.CloudCrawler = CloudCrawler;

// Private Members & Methods
var _crawler = null;
var _crawlWait = null;
var _context = null;
var _siteQueue = null;
var _urlQueue = null;
var _self = null;

var crawlSite = function(siteName, callback){
  var siteUrl = url.parse(siteName);

  _crawler = new Crawler();
  _crawler.host = siteUrl.hostname;
  _crawler.interval = config.crawler.interval;
  _crawler.userAgent = config.crawler.userAgent;

  _crawler.on("crawlstart", function(){
    console.log("crawlstart");
    _self.emit(CloudCrawlerState.running);
    _urlQueue.writeStart();
  });

  _crawler.on("queueadd", function(queueItem){
    console.log("queueadd");
    _self.emit(CloudCrawlerState.urlProcessed, queueItem.url);
    _urlQueue.writeUrl(queueItem.url);
  });

  _crawler.on("complete", function(){
    console.log("complete");
    _urlQueue.writeStop();
    return callback();
  });

  _self.emit(CloudCrawlerState.ready);
};

var processSiteQueue = function(){
  var item = _siteQueue.readItem();
  if(!item){
    _self.emit(CloudCrawlerState.stopped);
    setTimeout(processSiteQueue, 2000);
    return;
  }

  console.log("Processing site: " + item.site);
  crawlSite(item.site,
    function crawlFinished(){
      _siteQueue.acknowledgeItem();
      _self.emit(CloudCrawlerState.siteProcessed);
      processSiteQueue();
    }
  );
};



var initializeRabbitMQ = function(callback){
  _context = rabbit.createContext(config.rabbit.url);
  _context.on('ready', function(){ callback(null); });
};

var initializeSiteQueue = function(callback){
  // now open up a worker socket to conenct to the queue
  _siteQueue = new queues.SiteQueue();
  _siteQueue.on('ready', callback);
  _siteQueue.initialize(_context, "WORKER");
};



var initializeUrlQueue = function(callback){
  _urlQueue = new queues.UrlQueue();
  _urlQueue.on('ready', callback);
  _urlQueue.initialize(_context, "PUSH");
};

var dispose = function(callback){
  async.waterfall(
    [_siteQueue.close,
     _urlQueue.close,
     function(callback){
       _context.on('close', callback);
       _context.close();
     } ],
      callback
    );
};

CloudCrawler.prototype.initialize = function(){
  async.waterfall(
  [ initializeRabbitMQ,
    initializeUrlQueue,
    initializeSiteQueue ],
    processSiteQueue
  );
};

CloudCrawler.prototype.startCrawl = function(){
  if(!_crawler) {
    throw new Error("Crawler not initialized...");
  }

  if(_crawlWait) {
    _self.emit(CloudCrawlerState.running);
    return _crawlWait();
  } else {
    return _crawler.start();
  }
};

CloudCrawler.prototype.setFetchConditions = function(conditionsCallback){
  if(!_crawler) {
    throw new Error("Crawler not initialized...");
  }

  _crawler.addFetchConditions(conditionsCallback);
};

CloudCrawler.prototype.pauseCrawl = function(){
  _crawlWait = _crawler.wait();
  _self.emit(CloudCrawlerState.paused);
};

CloudCrawler.prototype.exit = function(){
  _crawler.stop();

  dispose(function(){
    _self.emit(CloudCrawlerState.exit);
    process.exit();
  });
};
