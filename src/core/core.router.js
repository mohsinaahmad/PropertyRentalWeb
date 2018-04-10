(function () {
    'use strict';

    var core = angular.module('app.core');

    core.config(configFunction);

    configFunction.$inject = ['$locationProvider', '$stateProvider', '$urlRouterProvider'];

    /* @ngInject */
    function configFunction($locationProvider, $stateProvider, $urlRouterProvider) {

        $locationProvider.html5Mode(true);

        $urlRouterProvider.otherwise('/');

        $stateProvider
        .state('login', {
            url: '/',
            template: '<tmpl-login></tmpl-login>'
        })
            .state('dashboard', {
                url: '/dashboard',
                template: '<tmpl-dashboard></tmpl-dashboard>'
            })
             .state('header', {
                 url: '/header',
                 template: '<tmpl-header></tmpl-header>'
             })
            .state('footer', {
                url: '/footer',
                template: '<tmpl-footer></tmpl-footer>'
            })
            .state('signup', {
                url: '/signup',
                template: '<tmpl-signup></tmpl-signup>'
            })
            .state('reset', {
                url: '/reset/:token',
                template: '<tmpl-reset></tmpl-reset>'
            })
            .state('forgot', {
                url: '/forgot',
                template: '<tmpl-forgot></tmpl-forgot>'
            })
            .state('addproperty', {
                url: '/addproperty',
                template: '<tmpl-addproperty></tmpl-addproperty>'
            })
            .state('viewportfolio', {
                url: '/viewportfolio',
                template: '<tmpl-viewportfolio></tmpl-viewportfolio>'
            })
            .state('managetenants', {
                url: '/managetenants',
                template: '<tmpl-managetenants></tmpl-managetenants>'
            })
            .state('editproperty', {
                url: '/editproperty',
                template: '<tmpl-editproperty></tmpl-editproperty>'
            })
        .state('ConfirmEmail', {
            url: '/ConfirmEmail?userName&confirmToken',
            template: '<tmpl-confirmemail></tmpl-confirmemail>'
        })
        .state('addtenant', {
            url: '/addtenant',
            template: '<tmpl-addtenant></tmpl-addtenant>'
        })
        .state('welcomepage', {
            url: '/welcomepage',
            template: '<tmpl-welcomepage></tmpl-welcomepage>'
        })      
        .state('createcase', {
            url: '/createcase/:propertyId',
            template: '<tmpl-createcase></tmpl-createcase>'
        })
        .state('editcase', {
            url: '/editcase/:caseId',
            template: '<tmpl-editcase></tmpl-editcase>'
        });

    }
})();
