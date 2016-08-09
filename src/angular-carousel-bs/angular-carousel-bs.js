(function (angular) {

  'use strict';

  var mod = angular.module('angular-carousel-bs', ['ngAnimate']);

  mod.factory('carouselManager', function ($interval, $timeout) {

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

      this.addSlide = function (slide) {
        self._slides.push(slide);
      };

      this.removeSlide = function (slide) {
        var idx = self._slides.indexOf(slide);

        if (idx !== -1) {
          self._slides.splice(idx, 1);
        }
      };

      this.isActive = function (slide) {
        return self._slides[self._activeIndex] === slide;
      };

      this.activeIndex = function (idx) {

        if (angular.isNumber(idx)) {
          if (idx < 0) {
            idx = Math.abs(idx) % self._slides.length;
            idx = self._slides.length - idx;
          } else if (idx > 0 && idx >= self._slides.length) {
            idx = idx % self._slides.length;
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

      this.setActive = function (slide) {
        self.activeIndex(self.getIndex(slide));
      };

      this.getIndex = function (slide) {
        return self._slides.indexOf(slide);
      };

      this.next = function () {
        var idx = self._activeIndex + 1;
        self.activeIndex(idx);
      };

      this.prev = function () {
        var idx = self._activeIndex - 1;
        self.activeIndex(idx);
      };
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

  mod.directive('carousel', function (carouselManager) {
    return {
      scope: {
        activeIndex: '=?'
      },
      restrict: 'AE',
      templateUrl: '/src/angular-carousel-bs/carousel.ng.html',
      controller: function () { },
      transclude: true,
      link: {
        pre: function (scope, element, attributes) {
          var id = attributes.id;
          var carousel = carouselManager.get(id, scope);
          element.data('$carousel', carousel);

          scope.$carousel = carousel;

          scope.$watch('activeIndex', function (val, oldVal) {
            if (val !== oldVal) {
              carousel.activeIndex(val);
            }
          });

          scope.$watch(function() {
            return carousel.activeIndex();
          }, function(val) {
            scope.activeIndex = val;
          });

        }
      }
    };
  });

  mod.directive('carouselSlide', function () {
    return {
      scope: true,
      replace: true,
      restrict: 'AE',
      templateUrl: '/src/angular-carousel-bs/slide.ng.html',
      transclude: true,
      require: '^carousel',
      link: function (scope, element, attributes) {
        var carousel = element.inheritedData('$carousel');

        var slide = {};
        carousel.addSlide(slide);

        scope.$on('$destroy', function () {
          carousel.removeSlide(slide);
        });

        scope.$carousel = carousel;
        scope.$slide = slide;
      }
    };
  });

})(angular);