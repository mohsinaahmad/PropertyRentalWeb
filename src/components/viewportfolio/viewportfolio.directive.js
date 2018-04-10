
/* global $ */
(function () {

    'use strict';

    angular.module('app.viewportfolio')
        .directive('tmplViewportfolio', directiveFunction)
        .controller('ViewportfolioController', ControllerFunction)

    .directive('owlCarousel', function () {
        return {
            restrict: 'E',
            transclude: false,
            link: function (scope) {
                scope.initCarousel = function (element) {
                    // provide any default options you want
                    var defaultOptions = {
                    };
                    var customOptions = scope.$eval($(element).attr('data-options'));
                    // combine the two options objects
                    for (var key in customOptions) {
                        if (customOptions.hasOwnProperty(key)) {
                            defaultOptions[key] = customOptions[key];
                        }
                    }
                    // init carousel
                    $(element).owlCarousel(defaultOptions);
                };
            }
        };
    })
.directive('owlCarouselItem', [function () {
    return {
        restrict: 'A',
        transclude: false,
        link: function (scope, element) {
            // wait for the last item in the ng-repeat then call init
            if (scope.$last) {
                scope.initCarousel(element.parent());
            }
        }
    };
}]);

    // ----- directiveFunction -----
    directiveFunction.$inject = [];

    /* @ngInject */
    function directiveFunction() {

        var directive = {
            restrict: 'E',
            templateUrl: 'components/viewportfolio/viewportfolio.html',
            scope: {
            },
            controller: 'ViewportfolioController',
            controllerAs: 'vm'
        };

        return directive;
    }


    // ----- ControllerFunction -----
    ControllerFunction.$inject = ['$scope', '$http', 'api', '$location'];

    /* @ngInject */
    function ControllerFunction($scope, $http, api, $location) {
        $scope.loadershow = false;
        var userid = window.localStorage.userid;
        var role = window.localStorage.role;
        if (!userid || role !== 'Landlord') {
            $location.path('login');
        }

        allproperties();

        function allproperties() {
            $scope.loadershow = true;
            var userid = window.localStorage.userid;
            
            $http.get(api + 'properties/' + userid)
               
             .then(function (result) {
                 
                 if (result.data.statusCode === 200) {
                     $scope.loadershow = false;
                     $scope.properties = result.data.properties;

                     $scope.properties.filter(function (product) {
                         product.TotalSum = 0;
                     });
                    
                 }
             }, function (result) {
                 $scope.loadershow = false;
                 $scope.unsuccess = result;

             });
        }

        $scope.getrentalyield = function (monthlyrent, currentestimatedvalue) {
            var result = '';
           if (currentestimatedvalue !== undefined && monthlyrent !== undefined) {
                result = (monthlyrent * 12 / currentestimatedvalue) * 100;
                result = result;
            }
            else {
                result = '';
            }
            return result;           
        };

        $scope.onebyone = function (name) {
            $scope.filtername = name;
        };
        $scope.viewallprop = function () {
            $scope.filtername = '';
        };

        $scope.addyears = function (date, numberofyear) {
            if (date !== undefined && numberofyear !== undefined) {
                var date123 = new Date(date);
                $scope.newdate = date123.setFullYear(date123.getFullYear() + numberofyear);
                return $scope.newdate;
            }
        };
        $scope.getsumall = function (obj, currentestimatedvalue, prop) {
            
            if (prop) {
                var sum = 0;
                for (var i = 0; i < obj.length; i++) {
                    if (!obj[i].rent)
                    {
                        obj[i].rent = 0;
                    }

                    sum = sum + obj[i].rent;
                }
                $scope.totalyield = sum;
                prop.TotalSum = (sum * 12 / currentestimatedvalue) * 100; 
                return sum;
            }
        };

        $scope.gettotalrenyield = function (totalyield, currentEstimate) {
            var resulttotalyield = (totalyield * 12 / currentEstimate) * 100;
            return resulttotalyield;
        };

        $scope.proid = function (propertyid) {
            
            $scope.$root.propid = propertyid;
            $location.path('editproperty');
            
        };
        $scope.daydiff = function (endate) {
            var date2 = new Date();
            var date1 = new Date(endate);
            var date2time = date2.getTime();
            var date1time = date1.getTime();
            var timeDiff = date2.getTime() - date1.getTime();
            $scope.dayDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));
            if ($scope.dayDifference <= 0 && date2time < date1time) {
                return 'Active';
            }
            else {
                return 'InActive';
            }
        };
    }
})();