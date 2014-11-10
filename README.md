#  [![Build Status](https://secure.travis-ci.org/shanewwarren/cloud-crawling.png?branch=master)](http://travis-ci.org/shanewwarren/cloud-crawling)

> Collection of scripts for distributed web crawling.


## Getting Started

Install the module with: `npm install cloud-crawling`

```js
var cloud-crawling = require('cloud-crawling');
cloud-crawling.awesome(); // "awesome"
```

Install with cli command

```sh
$ npm install -g cloud-crawling
$ cloud-crawling --help
$ cloud-crawling --version
```




## Documentation

_(Coming soon)_


## Examples

_(Coming soon)_


## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com).


## License

Copyright (c) 2014 Shane Warren  
Licensed under the None license.



// Queue just one URL, with default callback
// c.queue("https://www.jcrew.com/mens-clothing.jsp");

// Iterate through all stores

// For a store

  // Get a list of all the items that we currently have recorded for a store.
  // Crawl all relevant pages of the store
  //   Parse the product html page to for the desired data. (product).

  //   If the product already exists
        // Check if anything has changed...
           // if so remove it from the currently recorded array and place into the updated array.
        // Nothing has changed
           // store in unchanged array
  //   Product doesn't exist, add to the new product array.


  //  After finish crawling all pages.
      // update all updated products
      // add all newly found products
      // delete all missing products (don't actually change delete, change status to deleted)

//!!!!
// Should each product contain a relationship to a history table?
// So when a product is updated a new entry

 // Send an email or make a report on sweep of the store.
