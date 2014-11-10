/*
 *
 * https://github.com/shanewwarren/cloud-crawling
 *
 * Copyright (c) 2014 Shane Warren
 * Licensed under the None license.
 */

'use strict';

var program = require('commander'),
    tasks = require('./tasks'),
    config = require('../config');

program
  .version(config.version);

program
  .command('kick')
  .description('adds url to queue of sites to crawl')
  .option("-u, --url [url]", "Which site to crawl (REQUIRED)")
  .action(function(options){
    if(!options.url){
      program.help();
      return;
    }

    var url = options.url;
    var kicker = new tasks.Kick();
    kicker.start(url);

  });


program
  .command('crawl')
  .description('processes the url queue')
  // .option("-n, --queueName [queueName]", "Which queue to add it to. (REQUIRED)")
  .action(function(){
    // if(!options.queueName){
    //   program.help();
    //   return;
    // }
    //
    // var queueName = options.queueName;
    // console.log('reaping all urls on %s', queueName);

    var crawler = new tasks.CloudCrawler();
    console.log("here");
    crawler.on('ready', function(){
      console.log('ready');
      crawler.startCrawl();
    });


  crawler.on('exit', function(){
    console.log('exit');
  });
  crawler.on('stopped', function(){
    console.log('stopped');
  });


    crawler.on('urlProcessed', function(url){
      console.log(url);


    });
    crawler.initialize();

    setTimeout(function(){
      console.log("stopping...");
      crawler.exit();
    }, 5000);
  });

program.parse(process.argv);
