var pkg = require('./package.json');

var config = {};
config.version = pkg.version;


config.crawler = {};
config.crawler.userAgent = pkg.name + "-bot v" + pkg.version ;
config.crawler.interval = 10 * 1000; // 10 seconds...

config.rabbit = {};
config.rabbit.url = 'amqp://localhost';


module.exports = config;
