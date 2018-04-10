(function () {
    'use strict';

    angular
        .module('app.footer')
        .directive('tmplFooter', directiveFunction)
        .controller('footerController', ControllerFunction);


    // ----- directiveFunction -----
    directiveFunction.$inject = [];

    /* @ngInject */
    function directiveFunction() {

        var directive = {
            restrict: 'E',
            templateUrl: 'components/footer/footer.html',
            scope: {
            },
            controller: 'footerController',
            controllerAs: 'vm'
        };

        return directive;
    }

    // ----- ControllerFunction -----
    ControllerFunction.$inject = [];

    /* @ngInject */
    function ControllerFunction() {
        var vm = this;
        vm.isCollapsed = true;
    }

})();
