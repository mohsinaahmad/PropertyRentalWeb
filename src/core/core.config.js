(function () {
    'use strict';

    var core = angular.module('app.core');

    // Application configuration values
    var config = {
        appErrorPrefix: '[Angular Template Error] ',
        appTitle: 'Angular Template'
    };

    core.value('config', config);

    // Configure the app
    core.config(configFunction); 

   

 

    configFunction.$inject =
        ['$compileProvider', '$logProvider', 'exceptionHandlerProvider','GoogleSigninProvider'];

    /* @ngInject */
    function configFunction(
        
        $compileProvider, $logProvider, exceptionHandlerProvider,GoogleSigninProvider) {

        // During development, you may want to set debugInfoEnabled to true. This is required for tools like
        // Protractor, Batarang and ng-inspector to work correctly. However do not check in this change.
        // This flag must be set to false in production for a significant performance boost.
        $compileProvider.debugInfoEnabled(false);

        // turn debugging off/on (no info or warn)
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }
        GoogleSigninProvider.init({
            client_id: '795829335517-dmvvcp0bj71llj5p4m8rnu33k4e04dcg.apps.googleusercontent.com'
        });
        
        exceptionHandlerProvider.configure(config.appErrorPrefix);
    }
})();
