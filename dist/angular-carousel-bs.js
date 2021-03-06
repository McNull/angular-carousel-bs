(function (angular) {

  'use strict';

  var mod = angular.module('angular-carousel-bs', ['ngAnimate']);

  mod.factory('carouselService', ["$interval", "$timeout", "$q", "$rootScope", function ($interval, $timeout, $q, $rootScope) {

    var carousels = {};

    function Carousel(id) {
      var self = this;

      ///////////////////////////////////////////////

      self._id = id;
      self._refCount = 0;
      self._listeners = [];

      self.addRef = function () {
        self._refCount += 1;
      };

      self.release = function () {
        if (--self._refCount <= 0) {
          var x = self._listeners.length;
          while(--x >= 0) {
            self._listeners[x]();
          }
          delete carousels[self._id];
        }
      };

      ////////////////////////////////////////////////

      this._slides = [];
      this.activeIndex = this._activeIndexDelayed = 0;
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
          self.activeIndex = self.wrapIndex(self.activeIndex);

          if(idx === self.activeIndex) {
            self._direction = 'right';
          } else {
            self._forceDirection = -1;
          }
        }
        
      };

      ////////////////////////////////////////////////

      this.isActive = function (slide) {
        return self._slides[self.activeIndex] === slide;
      };

      ////////////////////////////////////////////////

      this.isActiveDelayed = function (slide) {
        return self._slides[self._activeIndexDelayed] === slide;
      };

      ////////////////////////////////////////////////

      this._setActiveIndexDelayed = function (idx, direction) {

        if (self._setActiveIndexDelayed._progress) {
          $timeout.cancel(self._setActiveIndexDelayed._progress);
        }

        self._setActiveIndexDelayed._progress = $timeout(function () {

          direction = direction || idx - self._activeIndexDelayed;
          self._direction = direction < 0 ? 'left' : 'right';
          self._activeIndexDelayed = idx;

          delete self._setActiveIndexDelayed._progress;
        }, 300);

      };

      ////////////////////////////////////////////////

      this.wrapIndex = function (idx) {

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

        return idx;
      };

      ////////////////////////////////////////////////

      this._listeners.push($rootScope.$watch(function() {
        return self.activeIndex;
      }, function(val, oldVal) {
        // console.log('activeIndex changed', val, oldVal);
        self._setActiveIndexDelayed(val, self._forceDirection);
        delete self._forceDirection;
      }));

      ////////////////////////////////////////////////

      this.setActive = function (slide, isRetry) {

        if (self.setActive._progress) {
          $timeout.cancel(self.setActive._progress);
          delete self.setActive._progress;
        }

        var idx = self.getIndex(slide);

        if (idx === -1) {

          // Slide not found in collection.
          // Throw an error if we're already in a retry.

          if (isRetry) {
            throw new Error('Cannot slide active; not part of the carousel.');
          }

          // Maybe the slide directive has not been digested yet. 
          // Queue a retry on the $digest cycle.

          self.setActive._progress = $timeout(function () {
            self.setActive(slide, true);
            delete self.setActive._progress;
          }, 250);

        } else {
          self.activeIndex = idx;
        }

      };

      ////////////////////////////////////////////////

      this.getIndex = function (slide) {
        return self._slides.indexOf(slide);
      };

      ////////////////////////////////////////////////

      this.next = function () {
        var idx = self.activeIndex + 1;
        idx = self.wrapIndex(idx);
        self.activeIndex = idx;
        self._forceDirection = 1;
      };

      ////////////////////////////////////////////////

      this.prev = function () {
        var idx = self.activeIndex - 1;
        idx = self.wrapIndex(idx);
        self.activeIndex = idx;
        self._forceDirection = -1;
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

          carousels[id].addRef();

          scope.$on('$destroy', function () {
            carousels[id].release();
          });
        }

        return carousels[id];
      }
    };

  }]);

  ////////////////////////////////////////////////

  mod.directive('carousel', ["carouselService", "$timeout", function (carouselService, $timeout) {
    return {
      scope: {
        activeIndex: '=?',
        carousel: '=?',
        interval: '=?'
      },
      restrict: 'AE',
      templateUrl: './angular-carousel-bs/carousel.ng.html',
      controller: function () { },
      transclude: true,
      link: {
        pre: function (scope, element, attributes) {

          var id = attributes.id;
          var carousel = carouselService.get(id, scope);
          element.data('$carousel', carousel);
          scope.carousel = carousel;

        },
        post: function (scope, element, attributes) {

          scope.activeIndex = scope.activeIndex || 0;
          scope.carousel._activeIndexDelayed = scope.activeIndex;

          scope.$watch('activeIndex', function(val) {
            scope.carousel.activeIndex = val;
          });

          scope.$watch('carousel.activeIndex', function(val) {
            scope.activeIndex = val;
          });

          scope.$watch('interval', function (val) {
            val = val && angular.isNumber(val) ? val : 0;
            scope.carousel.interval(parseInt(val));
          });

        }
      }
    };
  }]);

  ////////////////////////////////////////////////

  mod.directive('carouselSlide', function () {
    return {
      scope: {
        slide: '=?carouselSlide'
      },
      replace: true,
      restrict: 'AE',
      templateUrl: './angular-carousel-bs/slide.ng.html',
      transclude: true,
      require: '^carousel',
      link: {
        pre: function (scope, element, attributes) {

          var carousel = element.inheritedData('$carousel');

          scope.slide = carousel.addSlide(scope.slide || {});

          scope.$on('$destroy', function () {
            carousel.removeSlide(scope.slide);
          });

          scope.carousel = carousel;
        }
      }
    };
  });

  ////////////////////////////////////////////////

})(angular);
angular.module('angular-carousel-bs').run(['$templateCache', function($templateCache) {$templateCache.put('./angular-carousel-bs/carousel.ng.html','<div class="carousel carousel-bs slide {{carousel._direction}}" ng-mouseenter="carousel.pause()" ng-mouseleave="carousel.resume()"><div class="carousel-inner" role="listbox" ng-transclude=""></div><div ng-if="carousel._slides.length > 1"><ol class="carousel-indicators"><li ng-repeat="slide in carousel._slides" ng-class="{ \'active\': carousel.isActive(slide) }" ng-click="carousel.setActive(slide)"></li></ol><a class="left carousel-control" role="button" ng-click="carousel.prev()"><span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span> <span class="sr-only">Previous</span> </a><a class="right carousel-control" role="button" ng-click="carousel.next()"><span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span> <span class="sr-only">Next</span></a></div></div>');
$templateCache.put('./angular-carousel-bs/slide.ng.html','<div class="item" ng-transclude="" ng-class="{ active: carousel.isActiveDelayed(slide) }"></div>');}]);