(function () {

    'use strict';

    angular.module('app.reset')
        .directive('tmplReset', directiveFunction)
        .directive('passwordVerify', passwordVerify)
		
        .controller('resetController', ControllerFunction);


    // ----- directiveFunction -----
    directiveFunction.$inject = [];

    /* @ngInject */
    function directiveFunction() {

        var directive = {
            restrict: 'E',
            templateUrl: 'components/reset/reset.html',
            scope: {
            },
            controller: 'resetController',
            controllerAs: 'vm'
        };

        return directive;
    }


    // ----- ControllerFunction -----
    ControllerFunction.$inject = ['logger', '$scope','$stateParams','$http','api','$location','$modal'];
 
    /* @ngInject */
    function ControllerFunction(logger, $scope, $stateParams, $http, api, $location, $modal) {
       
        activate();
        $scope.sucessreset = false;
        $scope.token=$stateParams.token;
        $scope.submitForm = function () {

            // check to make sure the form is completely valid
            if ($scope.resetForm.$valid) {
                //logger.log('our form is amazing');
                $http.post(api + 'reset?token='+ $scope.token, {
                    
                    'password': $scope.password
                   
                })
               .then(function (result) {
                  if(result.data.statusCode===200)
                  {
                      $modal.open({
                          templateUrl: 'myModal.html',
                          controller: 'ModalDialogController',
                          backdrop: 'static',
                          keyboard:false
                      })
                       .result.then(
                function () {

                    $location.path('login');
                },
                function () {


                }
            );
                      $scope.confirm = null;
                      $scope.password = null;
                  }
                  else{
                    $scope.unsuccess = result.data.msg;
                  }
                  
                }, function (result) {
         
                     $scope.unsuccess = 'API Not responding' +result;
                });
            }

        };
        function activate() {
            logger.log('Activated reset View');
        }
         $scope.close = function () {
            countUp();
         };

        



        function countUp() {
            $scope.unsuccess = '';
            
        }  
         $scope.login=function (){
            $location.path('login');
        };
    }

    function passwordVerify() {
        return {
            restrict: 'A', // only activate on element attribute
            require: '?ngModel', // get a hold of NgModelController
            link: function (scope, elem, attrs, ngModel) {
                var validate;
                if (!ngModel) { return; } // do nothing if no ng-model

                // watch own value and re-validate on change
                scope.$watch(attrs.ngModel, function () {
                    validate();
                });

                // observe the other value and re-validate on change
                attrs.$observe('passwordVerify', function () {
                    validate();
                });

                validate = function () {
                    // values

                    var val1 = ngModel.$viewValue;
                    var val2 = attrs.passwordVerify;
                    if (val1 === undefined) {
                        return true;
                    }
                    else {
                        // set validity
                        ngModel.$setValidity('passwordVerify', val1 === val2);
                    }
                };
            }
        };
    }


    ModalDialogControllerFunction.$inject = ['$scope', '$modalInstance'];
    function ModalDialogControllerFunction($scope, $modalInstance) {

        $scope.ok = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }
})();
