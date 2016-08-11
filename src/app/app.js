(function (angular) {

  var app = angular.module('app', ['ngHolder', 'lorem', 'angular-carousel-bs']);

  app.controller('MyController', function (lorem, $interval) {

    var self = this;

    this.slides = [];

    this.addSlide = function(setActive) {

      self.addSlide.id = (self.addSlide.id || 0) + 1;

      var slide = {
        id: self.addSlide.id,
        caption: lorem.create({
          count: 3, units: 'words', capitalize: true
        })
      };

      self.slides.push(slide);

      if(setActive !== false) {
        self.carousel.setActive(slide)
      }
    };

    this.removeSlide = function() {
      self.slides.splice(self.activeIndex, 1);
    };
  
    var x = 2;

    while(x--) {
      self.addSlide(false);
    }

     this.activeIndex = 0;
    //self.carousel.setActive(self.slides[2]);
  });

})(angular);