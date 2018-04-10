(function () {
    'use strict';

    angular.module('app', [
        // Common (everybody has access to these)
        'app.core',

        // Features (listed alphabetically)
        'app.approot',
        'app.login',
        'app.dashboard',
        'app.topnav',
        'app.signup',
        'app.reset',
        'app.forgot',
        'app.header',
        'app.footer',
        'app.addproperty',
        'app.viewportfolio',
        'app.managetenants',
        'app.editproperty',
        'app.confirmemail',
        'app.addtenant',
        'app.welcomepage',
        'app.createcase',
        'app.editcase'
    ]);
})();
