(function () {

    'use strict';

    angular.module('app.signup')
        .directive('tmplSignup', directiveFunction)
        .controller('ModalDialogController', ModalDialogControllerFunction)
        .directive('passwordVerify', passwordVerify)
        .directive('passwordStrength', [
    function () {
        return {
            require: 'ngModel',
            restrict: 'E',
            scope: {
                password: '=ngModel'
            },
            link: function (scope) {
                scope.$watch('password', function (newVal) {
                    scope.strength = isSatisfied(newVal && newVal.length >= 8) +
                      isSatisfied(newVal && /[A-z]/.test(newVal)) +
                      isSatisfied(newVal && /(?=.*\W)/.test(newVal)) +
                      isSatisfied(newVal && /\d/.test(newVal));
                    function isSatisfied(criteria) {
                        return criteria ? 1 : 0;
                    }
                }, true);
            },
            template: '<div class="progress">' +
              '<div class="progress-bar progress-bar-danger" style="width: {{strength >= 1 ? 25 : 0}}%"></div>' +
              '<div class="progress-bar progress-bar-warning" style="width: {{strength >= 2 ? 25 : 0}}%"></div>' +
              '<div class="progress-bar progress-bar-warning" style="width: {{strength >= 3 ? 25 : 0}}%"></div>' +
              '<div class="progress-bar progress-bar-success" style="width: {{strength >= 4 ? 25 : 0}}%"></div>' +
              '</div>'
        };
    }
        ])
        .controller('signupController', ControllerFunction);


    // ----- directiveFunction -----
    directiveFunction.$inject = [];

    /* @ngInject */
    function directiveFunction() {

        var directive = {
            restrict: 'E',
            templateUrl: 'components/signup/signup.html',
            scope: {
            },
            controller: 'signupController',
            controllerAs: 'vm'
        };

        return directive;
    }


    // ----- ControllerFunction -----
    ControllerFunction.$inject = ['logger', '$scope', '$http', 'api', '$location', '$anchorScroll','$modal'];

    /* @ngInject */
    function ControllerFunction(logger, $scope, $http, api, $location, $anchorScroll, $modal) {
        $scope.gggggg = false;
        $scope.gender = '';
        $scope.dateodbirthchk = false;
        getlocations();
        function getlocations() {
            $http.get(api + 'locations')
                          .then(function (result) {

                              if (result.data.statusCode === 200) {
                                  $scope.locations = result.data.locations;
                              }
                          }, function (result) {

                              $scope.unsuccess = result;
                          });

        }
        $scope.submitForm = function () {
            $scope.dateodbirthchk = false;
            // check to make sure the form is completely valid
            if ($scope.signupForm.$valid) {
                //genrate uniquue token
                var Token = Math.random().toString(36).substr(2, 9);
                /*Convert to date*/
                var collectionDate = $scope.dobMonth + '-' + $scope.dobDay + '-' + $scope.dobYear + ' 00:00:00';

               
                var dateofbirth = new Date(collectionDate);
                if (dateofbirth === undefined) {
                    dateofbirth = null;
                }
                /*check date is valid on not*/
                var myDate = new Date();
                var previousDay = new Date(myDate);
                previousDay.setDate(myDate.getDate() - 1);
           
                $http.post(api + 'signup', {
                    
                    'confirmEmailtoken': Token,
                    'userName': $scope.userName,
                    'password': $scope.password,
                    'email': $scope.email,
                    'gender': $scope.gender,
                    'lastName': $scope.lastName,
                    'firstName': $scope.firstName,
                    'contactNum': $scope.contactNum,
                    'dob': dateofbirth,
                    'location': $scope.location,
                    'title': $scope.prefixed
                })
              .then(function (result) {

                  if (result.data.statusCode === 200) {
                      $scope.$root.propname = result.data.msg;
                      $scope.success = result.data.msg;
                      $scope.unsuccess = null;
                      $modal.open({
                          templateUrl: 'myModal.html',
                          controller: 'ModalDialogController'
                      })
            .result.then(
                function () {

                    $location.path('login');
                },
                function () {                   
                }
            );                    
                  }
                  else {
                      $scope.gggggg = true;
                      $scope.unsuccess = result.data.msg;
                      $scope.success = null;
                      $location.hash('testing');
                      $anchorScroll();
                  }

              }, function (result) {
                
                  $scope.unsuccess = 'API Not responding' + result;
                  $location.hash('testing');
                  $anchorScroll();
              });

            }

        };

        $scope.yes = function () {
            $location.path('login');
        };

        $scope.dateOptions = {
            formatYear: 'yyyy',
            showWeeks: false,
            startingDay: 1
        };
        $scope.cal = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened1 = true;
        };
        $scope.formats = ['dd/MM/yyyy'];
        $scope.format = $scope.formats[0];


        $scope.close = function () {
            countUp();
        };
        function countUp() {
            $scope.unsuccess = '';

        }
        $scope.login = function () {
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
