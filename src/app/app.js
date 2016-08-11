(function (angular) {

  var app = angular.module('app', ['ngHolder', 'lorem', 'angular-carousel-bs']);

  app.controller('MyController', function (lorem, $interval, carouselService) {

    var self = this;

    // The carousel instance can also be accessed via the carousel attribute on the element.
    // The id attribute determines the name of the instance.

    this.carousel = carouselService.get('myCarousel');

    this.slides = [];

    this.addSlide = function (setActive) {

      self.addSlide.id = (self.addSlide.id || 0) + 1;

      var slide = {
        id: self.addSlide.id,
        caption: lorem.create({
          count: 3, units: 'words', capitalize: true
        })
      };

      self.slides.push(slide);

      if (setActive !== false) {
        self.carousel.setActive(slide)
      }
    };

    this.removeSlide = function () {
      var idx = self.carousel.activeIndex();
      self.slides.splice(idx, 1);
    };

    var x = 10;

    while (x--) {
      self.addSlide(false);
    }

    self.carousel.setActive(self.slides[1]);
  });

})(angular);