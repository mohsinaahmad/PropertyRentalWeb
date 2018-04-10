(function () {

    'use strict';

    angular.module('app.forgot')
        .directive('tmplForgot', directiveFunction)
        .controller('forgotController', ControllerFunction);


    // ----- directiveFunction -----
    directiveFunction.$inject = [];

    /* @ngInject */
    function directiveFunction() {

        var directive = {
            restrict: 'E',
            templateUrl: 'components/forgot/forgot.html',
            scope: {
            },
            controller: 'forgotController',
            controllerAs: 'vm'
        };

        return directive;
    }


    // ----- ControllerFunction -----
    ControllerFunction.$inject = ['logger','$scope','$http','api','$location'];
 
    /* @ngInject */
    function ControllerFunction(logger, $scope, $http, api,$location) {
        var vm=this;
        activate();
        $scope.mailed=false;
        $scope.submitForm = function () {
       
        $scope.unsuccess='';
            // check to make sure the form is completely valid
            if ($scope.forgetForm.$valid) {
                 $http.post(api + 'forgot', {
                   
                 'email': vm.email  

                })
               .then(function (result) {
                
                  if(result.data.statusCode===200)
                  {
                    $scope.mailed=true;
                    $scope.success = result.data.msg;
                  }
                  else{
                    $scope.unsuccess = result.data.msg;
                  }
                  
                }, function (result) {
                  
                     $scope.unsuccess = 'API Not responding '+ result;
                });
            }

        };
        function activate() {
            logger.log('Activated forgot View');
        }
         $scope.close = function () {
            countUp();
        };
        function countUp() {
            $scope.unsuccess = '';
            
        }  
        vm.gologin=function(){
            $location.path('login');
        };
    }

})();
