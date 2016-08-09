(function (angular) {

  // if (!Array.prototype.findIndex) {
  //   Array.prototype.findIndex = function (predicate) {
  //     'use strict';

  //     var list = Object(this);
  //     var length = list.length >>> 0;
  //     var thisArg = arguments[1];
  //     var value;

  //     for (var i = 0; i < length; i++) {
  //       value = list[i];
  //       if (predicate.call(thisArg, value, i, list)) {
  //         return i;
  //       }
  //     }
  //     return -1;
  //   };
  // }

  var app = angular.module('app', ['ngHolder', 'lorem', 'angular-carousel-bs']);

  app.controller('MyController', function (lorem, $interval) {

    var self = this;

    this.slides = [];

    this.addSlide = function() {

      self.addSlide.id = (self.addSlide.id || 0) + 1;

      this.slides.push({
        id: self.addSlide.id,
        caption: lorem.create({
          count: 3, units: 'words', capitalize: true
        })
      });
    };
    
    for (var i = 0; i < 13; i++) {
      self.addSlide();
    }

  });

})(angular);