(function () {

    'use strict';

    angular.module('app.confirmemail')
        .directive('tmplConfirmemail', directiveFunction)
        .controller('ConfirmemailController', ControllerFunction);


    // ----- directiveFunction -----
    directiveFunction.$inject = [];

    /* @ngInject */
    function directiveFunction() {

        var directive = {
            restrict: 'E',
            templateUrl: 'components/confirmemail/confirmemail.html',
            scope: {
            },
            controller: 'ConfirmemailController',
            controllerAs: 'vm'
        };

        return directive;
    }


    // ----- ControllerFunction -----
    ControllerFunction.$inject = [ '$stateParams', '$scope', '$http', 'api'];

    /* @ngInject */
    function ControllerFunction( $stateParams, $scope, $http, api) {
      
        $scope.username = $stateParams.userName;
        $scope.token = $stateParams.confirmToken;
        $http.post(api + 'confirmEmail', {
            'userName': $scope.username,
            'confirmToken': $scope.token
        })
                .then(function (result) {
                    

                    if (result.data.statusCode === 200) {
                        $scope.success = result.data.msg;
                    }
                    else {
                        $scope.unsuccess = result.data.msg;
                    }
                }, function (result) {
                  
                    $scope.unsuccess = result;
                });
        
    }

})();
