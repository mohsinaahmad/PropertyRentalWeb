/* global _ */

(function () {
    'use strict';

    angular
        .module('app.core')
        .constant('_', _)
   .constant('api', 'https://propertymanagerapi.herokuapp.com/api/')  //for live
//.constant('api', 'https://qapropertymanagerapi.herokuapp.com/api/')  // for testing
//.constant('api', 'http://localhost:8081/api/')   //local
    .constant('rssfeed', 'https://news.google.com/news/?ned=us&hl=en&topic=b&output=rss');   //local
})();
