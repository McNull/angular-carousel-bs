(function (angular) {

  'use strict';

  var mod = angular.module('angular-carousel-bs', ['ngAnimate']);

  mod.factory('carouselService', function ($interval) {

    var carousels = {};

    function Carousel(id) {
      var self = this;

      ///////////////////////////////////////////////

      self._id = id;
      self._refCount = 1;

      self.addRef = function () {
        self._refCount += 1;
      };

      self.release = function () {
        if (!--self._refCount) {
          delete carousels[self._id];
        }
      };

      ////////////////////////////////////////////////

      this._slides = [];
      this._activeIndex = 0;
      this._interval = {
        delay: 0
      };

      ////////////////////////////////////////////////

      this.addSlide = function (slide) {
        slide = slide || {};
        self._slides.push(slide);
        return slide;
      };

      ////////////////////////////////////////////////

      this.removeSlide = function (slideOrIdx) {
        var idx;

        if (angular.isNumber(slideOrIdx)) {
          idx = slideOrIdx >= 0 && slideOrIdx < self._slides.length ? slideOrIdx : -1;
        } else {
          idx = self._slides.indexOf(slideOrIdx);
        }

        if (idx !== -1) {
          self._slides.splice(idx, 1);
          if (self._activeIndex >= self._slides.length) {
            self.activeIndex(self._slides.length - 1);
          }
        }
      };

      ////////////////////////////////////////////////

      this.isActive = function (slide) {
        return self._slides[self._activeIndex] === slide;
      };

      ////////////////////////////////////////////////

      this.activeIndex = function (idx) {

        if (angular.isNumber(idx)) {

          if (self._slides.length > 0) {
            if (idx < 0) {
              idx = Math.abs(idx) % self._slides.length;
              idx = self._slides.length - idx;
            } else if (idx > 0 && idx >= self._slides.length) {
              idx = idx % self._slides.length;
            }
          } else {
            idx = 0;
          }

          if (idx !== self._activeIndex) {

            if ((idx < self._activeIndex || (self._activeIndex === 0 && idx === self._slides.length - 1)) && !(self._activeIndex === self._slides.length - 1 && idx === 0)) {
              self._direction = 'left';
            } else {
              self._direction = 'right';
            }

            self._activeIndex = idx;
          }
        }

        return self._activeIndex;
      };

      ////////////////////////////////////////////////

      this.setActive = function (slide) {
        self.activeIndex(self.getIndex(slide));
      };

      ////////////////////////////////////////////////

      this.getIndex = function (slide) {
        return self._slides.indexOf(slide);
      };

      ////////////////////////////////////////////////

      this.next = function () {
        var idx = self._activeIndex + 1;
        self.activeIndex(idx);
      };

      ////////////////////////////////////////////////

      this.prev = function () {
        var idx = self._activeIndex - 1;
        self.activeIndex(idx);
      };

      ////////////////////////////////////////////////

      this.interval = function (delay) {
        if (angular.isNumber(delay)) {
          self._interval.delay = delay;
          if (self._interval.promise) {
            $interval.cancel(self._interval.promise);
            delete self._interval.promise;
          }
          if (delay > 0) {
            self._interval.promise = $interval(function () {
              self.next();
            }, delay);
          }
        }

        return self._interval.delay;
      };

      ////////////////////////////////////////////////

      this.pause = function () {
        
        self.paused = true;

        if (self._interval.promise) {
          $interval.cancel(self._interval.promise);
          delete self._interval.promise;
        }
      };

      ////////////////////////////////////////////////

      this.resume = function () {

        self.paused = false;

        self.interval(self._interval.delay);
      };

      ////////////////////////////////////////////////
    }

    return {
      get: function (id, scope) {
        id = id || 'carousel-' + Date.now();

        if (!carousels[id]) {
          carousels[id] = new Carousel(id);
        }

        if (scope) {
          scope.$on('$destroy', function () {
            carousels[id].release();
          });
        }

        return carousels[id];
      }
    };

  });

  ////////////////////////////////////////////////

  mod.directive('carousel', function (carouselService) {
    return {
      scope: {
        activeIndex: '=?',
        carousel: '=?',
        interval: '=?'
      },
      restrict: 'AE',
      templateUrl: './src/angular-carousel-bs/carousel.ng.html',
      controller: function () { },
      transclude: true,
      link: {
        pre: function (scope, element, attributes) {
          var id = attributes.id;

          var carousel = carouselService.get(id, scope);
          element.data('$carousel', carousel);
          scope.carousel = carousel;

          scope.$watch('activeIndex', function (val, oldVal) {
            if (val !== oldVal) {
              carousel.activeIndex(val);
            }
          });

          scope.$watch(function () {
            return carousel.activeIndex();
          }, function (val) {
            scope.activeIndex = val;
          });

          scope.$watch('interval', function (val, oldVal) {

            val = val && angular.isNumber(val) ? val : 0;
            carousel.interval(parseInt(val));

          });
        }
      }
    };
  });

  ////////////////////////////////////////////////

  mod.directive('carouselSlide', function () {
    return {
      scope: {
        slide: '=?carouselSlide'
      },
      replace: true,
      restrict: 'AE',
      templateUrl: './src/angular-carousel-bs/slide.ng.html',
      transclude: true,
      require: '^carousel',
      link: function (scope, element, attributes) {

        var carousel = element.inheritedData('$carousel');

        scope.slide = carousel.addSlide(scope.slide || {});

        scope.$on('$destroy', function () {
          carousel.removeSlide(scope.slide);
        });

        scope.carousel = carousel;

      }
    };
  });

  ////////////////////////////////////////////////

})(angular);