(function () {

    'use strict';
    angular.module('app.managetenants')
        .directive('tmplManagetenants', directiveFunction)
        .controller('ManagetenantsController', ControllerFunction);


    // ----- directiveFunction -----
    directiveFunction.$inject = [];

    /* @ngInject */
    function directiveFunction() {

        var directive = {
            restrict: 'E',
            templateUrl: 'components/managetenants/managetenants.html',
            scope: {
            },
            controller: 'ManagetenantsController',
            controllerAs: 'vm'
        };

        return directive;
    }


    // ----- ControllerFunction -----
    ControllerFunction.$inject = ['$scope', '$http', 'api', '$location','$sce','$window'];

    function ControllerFunction($scope, $http, api, $location, $sce, $window) {
        
        $scope.loadershow = true;
        $scope.modalimage = false;
        var userid = window.localStorage.userid;

        $scope.addtenant = function (unitid) {
            window.localStorage.unitid = unitid;
           
            $location.path('managetenant');
        };

        $scope.createcasepage = function () {
            $location.path('createcase');
        };
        $scope.Propertygo = function (id) {
            
            $scope.$root.propertyidgo = id;
            $scope.$root.checktenantlandlord = 'LandLord';
            $location.path('createcase/' + id);
        };
      

        //get all properties
        properties();
        function properties() {
            $http.get(api + 'properties/' + userid)
                                  .then(function (result) {
                                      $scope.loadershow = false;
                                      if (result.data.statusCode === 200) {
                                          $scope.properties = result.data.properties;
                                          if ($scope.properties.length > 0) {
                                              $scope.getproperty($scope.properties[0].id);
                                          }
                                      }
                                  }, function (result) {
                                      $scope.loadershow = false;
                                      $scope.unsuccess = result;
                                  });

        }

        $scope.getproperty = function (id) {
            $scope.filtername = id;
            $http.get(api + 'property/' + id)
                          .then(function (result) {                                
                              if (result.data.statusCode === 200) {                                 
                                  $scope.property = result.data.property;
                                  $scope.property.currentDate = new Date();
                                  $http.get(api + 'propertyCases/' + id)
                          .then(function (result) {
                              if (result.data.statusCode === 200) {                                  
                                  $scope.propertyCases = result.data.propertycases;
                              }
                          }, function (result) {
                              $scope.unsuccess = result;
                          });
                              }
                          }, function (result) {
                              $scope.unsuccess = result;
                          });
        };

        $scope.viewallprop = function () {         
            $scope.filtername = '';
        };

        $scope.openplease = function (url) {        
            var substr = url.substring(url.length - 3);
            if (substr === 'doc' || substr === 'ocx') {
                $window.open(url, '_blank');
            }
            else {
                $scope.modalimage = true;
                $scope.fadinw = 'in';
                $scope.currenturl = $sce.trustAsResourceUrl(url);
            }
        };

        $scope.closeclsthis = function () {
            $scope.modalimage = false;
            $scope.fadinw = '';
        };

        $scope.movetoeditprop = function (unitid, propertyid) {
            $scope.$root.movetoedit = unitid;
            $scope.$root.propid = propertyid;
            $location.path('editproperty');
        };

        $scope.getClass = function (dt1,dt2)
        {
            var endDate = new Date(dt1);
            var stDate = new Date(dt2);
         
            if (endDate < stDate) {
                return 'In-Active';
            }
            else {
                return 'Active';
            }
        };

    }
})();
