(function () {
    'use strict';

    angular
        .module('app.header')
        .directive('tmplHeader', directiveFunction)
        .controller('headerController', ControllerFunction);


    // ----- directiveFunction -----
    directiveFunction.$inject = [];

    /* @ngInject */
    function directiveFunction() {

        var directive = {
            restrict: 'E',
            templateUrl: 'components/header/header.html',
            scope: {
            },
            controller: 'headerController',
            controllerAs: 'vm'
        };

        return directive;
    }

    // ----- ControllerFunction -----
    ControllerFunction.$inject = ['$location'];

    /* @ngInject */
    function ControllerFunction($location) {
       
        var vm = this;
        vm.looged = window.localStorage.logged;
        vm.username = window.localStorage.fullname;
       
        vm.logout = function () {
            window.localStorage.logged = false;
            vm.looged = false;
            window.localStorage.fullname = '';
            vm.username = '';
            window.localStorage.role = null;
            $location.path('login');
        };
        
       
    }

})();
