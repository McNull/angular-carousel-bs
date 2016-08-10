(function (angular) {

  var app = angular.module('app', ['ngHolder', 'lorem', 'angular-carousel-bs']);

  app.controller('MyController', function (lorem, $interval) {

    var self = this;

    this.slides = [];

    this.addSlide = function() {

      self.addSlide.id = (self.addSlide.id || 0) + 1;

      var slide = {
        id: self.addSlide.id,
        caption: lorem.create({
          count: 3, units: 'words', capitalize: true
        })
      };

      self.slides.push(slide);

      self.carousel.setActive(slide)
    };

    this.removeSlide = function() {
      self.slides.splice(self.activeIndex, 1);
    };
  
  });

})(angular);