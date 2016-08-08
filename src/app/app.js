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

    for (var i = 0; i < 10; i++) {
      this.slides.push({
        id: i + 1,
        caption: lorem.create({
          count: 3, units: 'words', capitalize: true
        })
      });
    }

    this.activeIndex = 1;

    this.isPrev = function (slide) {
      var slideIdx = self.getIndex(slide);


      return self.activeIndex - 1 === slideIdx || self.activeIndex === 0 && slideIdx === self.slides.length - 1;
    };

    this.isActive = function (slide) {
      return self.slides[self.activeIndex] === slide;
    };

    this.isNext = function (slide) {
      var slideIdx = self.getIndex(slide);
      return self.activeIndex + 1 === slideIdx || slideIdx === 0 && self.activeIndex == self.slides.length - 1;
    };

    this.setActiveIndex = function (idx) {

      if(self.intervalPromise) {
        $interval.cancel(self.intervalPromise);
        self.intervalPromise = null;
      }

      if (idx < 0) {
        idx = Math.abs(idx) % self.slides.length;
        idx = self.slides.length - idx;
      } else if (idx >= self.slides.length) {
        idx = idx % self.slides.length;
      }

      if (idx !== self.activeIndex) {
        var delta = Math.abs(idx - self.activeIndex);
        
        if (delta > 1) {
          var direction = idx < self.activeIndex ? -1 : 1;

          $interval(function() {
            self.activeIndex += direction;
          }, 300, delta).then(function() {
            self.intervalPromise = null;
          });

        } else {
          self.activeIndex = idx;
        }
      }

    };

    this.setActive = function (slide) {
      self.setActiveIndex(self.getIndex(slide));
    };

    this.getIndex = function (slide) {
      return self.slides.indexOf(slide);
    };

    this.next = function () {
      var idx = self.activeIndex + 1;
      self.setActiveIndex(idx);
    };

    this.prev = function () {
      var idx = self.activeIndex - 1;
      self.setActiveIndex(idx);
    };

  });

})(angular);