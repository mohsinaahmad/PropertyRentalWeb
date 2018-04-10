/* jshint node: true */

'use strict';

module.exports = function (config) {

    config.set({
            // base path that will be used to resolve all patterns (eg. files, exclude)
            basePath: './',

            // frameworks to use
            frameworks: ['mocha', 'chai', 'sinon', 'chai-sinon'],

            // list of files / patterns to load in the browser
            files: [
                'bower_components/angular/angular.js',
                'bower_components/chart.js/dist/Chart.min.js',
                'bower_components/angular-chart.js/dist/angular-chart.min.js',
                'bower_components/angular-cookies/angular-cookies.min.js',
                'bower_components/angular-animate/angular-animate.js',
                'bower_components/angular-bootstrap/ui-bootstrap.js',
                'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
                'bower_components/angular-sanitize/angular-sanitize.js',
                'bower_components/angular-toastr/dist/angular-toastr.js',
                'bower_components/angular-toastr/dist/angular-toastr.tpls.js',
                'bower_components/angular-ui-router/release/angular-ui-router.js',
                'bower_components/angular-mocks/angular-mocks.js',
                'bower_components/bardjs/dist/bard.js',
                'bower_components/lodash/lodash.js',
                'bower_components/cryptojslib/rollups/aes.js',
                'bower_components/angular-cryptography/mdo-angular-cryptography.js',
                'bower_components/ng-google-signin/dist/ng-google-signin.js',
                '//ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js',
                '//maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js',
                'test/helpers/*.js',
                'src/**/*.module.js',
                'src/**/*.js',
                '.tmp/templates.js',
                'test/**/*.spec.js'
            ],

            // list of files to exclude
            exclude: [],

            proxies: {
                '/': 'http://localhost:8888/'
            },

            // preprocess matching files before serving them to the browser
            // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
            preprocessors: {
                'src/**/*.js': ['coverage']
            },

            // test results reporter to use
            // possible values: 'dots', 'progress', 'coverage'
            // available reporters: https://npmjs.org/browse/keyword/karma-reporter
            reporters: ['progress', 'coverage'],

            coverageReporter: {
                dir: 'report/coverage',
                reporters: [
                    // reporters not supporting the `file` property
                    {type: 'html', subdir: 'report-html'},
                    {type: 'lcov', subdir: 'report-lcov'},
                    {type: 'text-summary'}
                ]
            },

            // web server port
            port: 9876,

            // enable / disable colors in the output (reporters and logs)
            colors: true,
            logLevel: config.LOG_INFO,

            // enable / disable watching file and executing tests whenever any file changes
            autoWatch: true,

            // start these browsers
            browsers: ['Chrome'],

            // Continuous Integration mode
            // if true, Karma captures browsers, runs the tests and exits
            singleRun: false
        }
    );
};
