(function () {

    'use strict';

    angular.module('app.login')
        .directive('tmplLogin', directiveFunction)
        .controller('loginController', ControllerFunction);


    // ----- directiveFunction -----
    directiveFunction.$inject = [];

    /* @ngInject */
    function directiveFunction() {

        var directive = {
            restrict: 'E',
            templateUrl: 'components/login/login.html',
            scope: {
            },
            controller: 'loginController',
            controllerAs: 'vm'
        };

        return directive;
    }


    // ----- ControllerFunction -----
    ControllerFunction.$inject = ['logger', '$scope', '$http', 'api',
     '$cookies', '$crypto', '$location', 'GoogleSignin'];

    /* @ngInject */
    function ControllerFunction(logger, $scope, $http, api, $cookies, $crypto, $location, GoogleSignin) {
        $scope.loadershow = false;
        activate();
        $scope.submitForm = function () {
            $scope.loadershow = true;
            // check to make sure the form is completely valid
            if ($scope.loginForm.$valid) {
                $http.post(api + 'login', {
                    'userName': $scope.userName,
                    'password': $scope.password
                })
               .then(function (result) {
                   if (result.data.msg === 'Success') {
                       $scope.loadershow = false;
                     
                       window.localStorage.userid = result.data.user.id;
                       window.localStorage.logged = true;
                       window.localStorage.fullname = result.data.user.profile.firstName + ' ' +
                           result.data.user.profile.lastName;

                       $scope.$root.looged = window.localStorage.logged;
                       if (result.data.user.roles[0].roleName === 'Landlord') {
                           window.localStorage.role = 'Landlord';
                       }
                       else {
                           window.localStorage.fullname = result.data.user.userName;
                           window.localStorage.role = 'Tenant';
                       }
                       if ($scope.rememberme) {
                           var expireDate = new Date();
                           expireDate.setDate(expireDate.getDate() + 15);

                           var pss = $crypto.encrypt($scope.password, 'supersecretkey');
                           $cookies.put('userName', result.data.user.userName, { 'expires': expireDate });
                           $cookies.put('password', pss, { 'expires': expireDate });

                       }
                       else {
                           $cookies.remove('userName', '');
                           $cookies.remove('password', '');
                       }

                       if (window.localStorage.role === 'Landlord') {
                         
                            var role = window.localStorage.role;
                           var userid = window.localStorage.userid;

                           if (userid && role) {
                               $scope.loadershow = false;
}
                           $location.path('dashboard');

                       }
                       else {
                           $location.path('welcomepage');
                       }
                   }
                   else {
                       $scope.loadershow = false;
                       $scope.unsuccess = result.data.msg;
                   }
               }, function (result) {
                   $scope.loadershow = false;
                   $scope.unsuccess = result.data.msg;
               });
            }


        }; 
        function activate() {
            if (window.localStorage.logged !== 'true') {

                $scope.userName = $cookies.get('userName');
                var pass1 = $cookies.get('password');
                var pass = '';
                if (pass1) {
                    pass = $crypto.decrypt(pass1, 'supersecretkey');
                }
                if ($scope.userName) {
                    $scope.rememberme = true;
                    $scope.password = pass;
                }

            }
            else {
                
                var role = window.localStorage.role;
                if (role === 'Landlord') {
                    $location.path('dashboard');
                }
                else {
                    $location.path('welcomepage');
                }
            }
        }
        $scope.close = function () {
            countUp();
        };
        function countUp() {
            $scope.unsuccess = '';
            $scope.success = '';
        }
        $scope.googlecall = function () {
           
            GoogleSignin.signIn().then(function (user) {
                
                var googleId = user.w3.Eea;
                var email = user.w3.U3;
                var lastName = user.w3.wea;
                var firstName = user.w3.ofa;
                var accessToken = user.Zi.access_token;
                window.localStorage.fullname = firstName + ' ' + lastName;

                $http.post(api + 'googleLogin', {
                    'googleId': googleId,
                    'email': email,
                    'lastName': lastName,
                    'firstName': firstName,
                    'gender': '',
                    'accessToken': accessToken
                })
                  .then(function (result) {
                      window.localStorage.userid = result.data.user.id;
                      window.localStorage.logged = true;
                      $scope.$root.looged = window.localStorage.logged;
                      window.localStorage.role = 'Landlord';
                      if (result.data.statuscode === 200) {
                          $location.path('dashboard');
                      }
                      else {
                          $location.path('dashboard');
                      }

                  }, function (result) {

                      $scope.unsuccess = 'API Not responding' + result;
                  });
            }, function (err) {
                if (err.error !== 'popup_closed_by_user') {
                    $scope.unsuccess = err;
                }
            });
        };
    }

})();
