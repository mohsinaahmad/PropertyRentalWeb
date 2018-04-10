(function (angular) {
    'use strict';

    angular.module('gm.datepickerMultiSelect', ['ui.bootstrap'])
	.config(['$provide', '$injector', function ($provide, $injector) {

	    // extending datepicker (access to attributes and app scope through $parent)
	    var datepickerDelegate = function ($delegate) {
	        var directive = $delegate[0];

	        // Override compile
	        var link = directive.link;

	        directive.compile = function () {
	            return function (scope, element, attrs, ctrls) {
	                link.apply(this, arguments);

	                scope.selectedDates = [];
	                scope.$parent.$watchCollection(attrs.multiSelect, function (newVal) {
	                    scope.selectedDates = newVal || [];
	                });

	                attrs.$observe('selectRange', function (newVal) {
	                    scope.selectRange = !!newVal && newVal !== 'false';
	                });

	                var ngModelCtrl = ctrls[1];

	                ngModelCtrl.$viewChangeListeners.push(function () {
	                    var newVal = scope.$parent.$eval(attrs.ngModel);
	                    if (!newVal) {
	                        return;
	                    }

	                    var dateVal = newVal.getTime(),
							selectedDates = scope.selectedDates;

	                    if (scope.selectRange) {
	                        // reset range
	                        if (!selectedDates.length || selectedDates.length > 1 || selectedDates[0] === dateVal) {
	                            return selectedDates.splice(0, selectedDates.length, dateVal);
	                        }

	                        selectedDates.push(dateVal);

	                        var tempVal = Math.min.apply(null, selectedDates);
	                        var maxVal = Math.max.apply(null, selectedDates);

	                        // Start on the next day to prevent duplicating the	first date
	                        tempVal = new Date(tempVal).setHours(24);
	                        while (tempVal < maxVal) {
	                            selectedDates.push(tempVal);

	                            // Set a day ahead after pushing to prevent duplicating last date
	                            tempVal = new Date(tempVal).setHours(24);
	                        }
	                    } else {
	                        if (selectedDates.indexOf(dateVal) < 0) {
	                            selectedDates.push(dateVal);
	                        } else {
	                            selectedDates.splice(selectedDates.indexOf(dateVal), 1);
	                        }
	                    }
	                });
	            };
	        };

	        return $delegate;
	    };

	    if ($injector.has('datepickerDirective')) {
	        $provide.decorator('datepickerDirective', ['$delegate', datepickerDelegate]);
	    }

	    if ($injector.has('uibDatepickerDirective')) {
	        $provide.decorator('uibDatepickerDirective', ['$delegate', datepickerDelegate]);
	    }

	    // extending daypicker (access to day and datepicker scope through $parent)
	    var daypickerDelegate = function ($delegate) {
	        var directive = $delegate[0];

	        // Override compile
	        var link = directive.link;

	        directive.compile = function () {
	            return function (scope, element, attrs, ctrls) {
	                link.apply(this, arguments);

	                scope.$parent.$watchCollection('selectedDates', update);


	                var ctrl = angular.isArray(ctrls) ? ctrls[0] : ctrls;
	                scope.$watch(function () {
	                    return ctrl.activeDate.getTime();
	                }, update);

	                function update() {
	                    angular.forEach(scope.rows, function (row) {
	                        angular.forEach(row, function (day) {
	                            day.selected = scope.selectedDates.indexOf(day.date.setHours(0, 0, 0, 0)) > -1;
	                        });
	                    });
	                }
	            };
	        };

	        return $delegate;
	    };

	    if ($injector.has('daypickerDirective')) {
	        $provide.decorator('daypickerDirective', ['$delegate', daypickerDelegate]);
	    }

	    if ($injector.has('uibDaypickerDirective')) {
	        $provide.decorator('uibDaypickerDirective', ['$delegate', daypickerDelegate]);
	    }
	}]);
})(window.angular);