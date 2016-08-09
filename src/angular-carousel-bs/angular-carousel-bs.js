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

      this.slides = [];
      this.activeIndex = 0;

      this.addSlide = function (slide) {
        self.slides.push(slide);
      };

      this.removeSlide = function (slide) {
        var idx = self.slides.indexOf(slide);

        if (idx !== -1) {
          self.slides.splice(idx, 1);
        }
      };

      this.isActive = function (slide) {
        return self.slides[self.activeIndex] === slide;
      };

      this.setActiveIndex = function (idx) {
        if (idx < 0) {
          idx = Math.abs(idx) % self.slides.length;
          idx = self.slides.length - idx;
        } else if (idx >= self.slides.length) {
          idx = idx % self.slides.length;
        }

        if (idx !== self.activeIndex) {

          if((idx < self.activeIndex || (self.activeIndex === 0 && idx === self.slides.length - 1)) && !(self.activeIndex === self.slides.length - 1 && idx === 0)) {
            self._direction = 'left';
          } else {
            self._direction = 'right';
          }

          self.activeIndex = idx;
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
      scope: true,
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

        // scope.cssClass = function () {
        //   var ret = '';
        //   var idx = carousel.getIndex(slide);

        //   if (idx === carousel.activeIndex) {
        //     ret += 'active ';
        //   }

        //   if (carousel.isNext(idx)) {
        //     ret += 'next ';
        //   } else if (carousel.isPrev(idx)) {
        //     ret += 'prev ';
        //   }
        //   return ret;
        // };
      }
    };
  });

})(angular);