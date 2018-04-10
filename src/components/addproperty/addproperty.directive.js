(function () {

    'use strict';
    angular.module('app.addproperty')
        .directive('tmplAddproperty', directiveFunction)
        .directive('validNumber', function () {
            return {
                require: '?ngModel',
                link: function (scope, element, attrs, ngModelCtrl) {
                    if (!ngModelCtrl) {
                        return;
                    }

                    ngModelCtrl.$parsers.push(function (val) {
                        if (angular.isUndefined(val)) {
                            val = '';
                        }

                        var clean = val.replace(/[^-0-9\.]/g, '');
                        var negativeCheck = clean.split('-');
                        var decimalCheck = clean.split('.');
                        if (!angular.isUndefined(negativeCheck[1])) {
                            negativeCheck[1] = negativeCheck[1].slice(0, negativeCheck[1].length);
                            clean = negativeCheck[0] + '-' + negativeCheck[1];
                            if (negativeCheck[0].length > 0) {
                                clean = negativeCheck[0];
                            }
                        }

                        if (!angular.isUndefined(decimalCheck[1])) {
                            decimalCheck[1] = decimalCheck[1].slice(0, 2);
                            clean = decimalCheck[0] + '.' + decimalCheck[1];
                        }
                        if (val !== clean) {
                            ngModelCtrl.$setViewValue(clean);
                            ngModelCtrl.$render();
                        }
                        return clean;
                    });
                    element.bind('keypress', function (event) {
                        if (event.keyCode === 32) {
                            event.preventDefault();
                        }
                    });
                }
            };
        })


        .controller('ModalDialogController', ModalDialogControllerFunction)
      .controller('ModalDialogControllerMortgage', ModalDialogControllerMortgageFunction)
         .controller('congratulationController', congratulationControllerFunction)
        .controller('AddpropertyController', ControllerFunction);


    // ----- directiveFunction -----
    directiveFunction.$inject = [];

    /* @ngInject */
    function directiveFunction() {
        var directive = {
            restrict: 'E',
            templateUrl: 'components/addproperty/addproperty.html',
            scope: {
            },
            controller: 'AddpropertyController',
            controllerAs: 'vm'
        };
        return directive;
    }


    // ----- ControllerFunction -----
    ControllerFunction.$inject = ['$scope', '$modal', '$http', 'api', '$location', '$window', '$filter'];

    /* @ngInject */
    function ControllerFunction($scope, $modal, $http, api, $location, $window, $filter) {
        var userid = window.localStorage.userid;
        $scope.loadershow = false;
        $scope.ismultiple = false;
        $scope.buydate = null;
        $scope.mordate = null;
        $scope.mindate = null;
        $scope.a = false;
        $scope.b = false;
        $scope.c = false;
        $scope.d = false;
        $scope.errrent = '';
        $scope.maxDate = new Date();
        var role = window.localStorage.role;
        if (!userid || role !== 'Landlord') {
            $location.path('login');
        }

        getpropertytypes();
        $scope.freeleasehold = 'Freehold';
        $scope.propertylist = {};
        $scope.propertylist = [{
            'unitName': null, 'bedRooms': null,
            'rent': null, 'isVacant': null, 'tenancyStartDate': null, 'tenancyTerm': null, 'tenancyEndDate': null
        }];
        function getpropertytypes() {
            $http.get(api + 'propertyTypes')
             .then(function (result) {
                 if (result.data.statusCode === 200) {
                     $scope.propertyTypes = result.data.propertyTypes;
                 }

             }, function (result) {
                 $scope.unsuccess = result;
             });
        }
        $scope.cloneobject = function () {
            $scope.ismultiple = true;
            $scope.propertylist.push({
                'unitName': null, 'bedRooms': null, 'rent': null,
                'isVacant': null, 'tenancyStartDate': null, 'tenancyTerm': null, 'tenancyEndDate': null
            });
        };

        $scope.today = function () {
            $scope.buydate = null;
        };
        $scope.today();

        $scope.clear = function () {
            $scope.buydate = null;
        };

        //Save the property
        $scope.addproperty = function (form) {
         
            $scope.errrent = '';
            var listrent = false;
            var index = 0;
            for (var i = 0; i < $scope.propertylist.length; i++) {
                if ($scope.propertylist[i].rent === null && $scope.propertylist[i].isVacant == '0') {
                    listrent = true;
                    index = i + 1;
                    var test = document.getElementById('errorid' + index);
                    test.innerHTML = 'Please enter Rent';
                }
                else {
                    index = i + 1;
                    var test1 = document.getElementById('errorid' + index);
                    test1.innerHTML = '';
                }
            }
            if ($scope.propertylist.length == 1) {
                $scope.propertylist[0].unitName = 'Unit 1';
            }
            if (listrent === true) {
                $scope.loadershow = false;            
            }
            else {
                $scope.error = undefined;
                if (form.$invalid) {
                    $scope.changeeeed = true;
                }
                else {
                    if ($scope.propname !== undefined) {
                        var proprtype = [];
                        var mortgageProvider = [];
                        if (!$scope.Currentmortgageoutstanding) {
                            $scope.Currentmortgageoutstanding = 0;
                        }
                        if (!$scope.Currentmortgagepayment) {
                            $scope.Currentmortgagepayment = 0;
                        }
                        if (!$scope.currentinterestrate) {
                            $scope.currentinterestrate = 0;
                        }
                        
                        if ($scope.propertytype !== undefined) {
                            proprtype = $scope.propertytype.split('/');
                        }
                        else {
                            proprtype[0] = null;
                            proprtype[1] = null;
                        }
                        if ($scope.mortgageprovider !== undefined) {
                            mortgageProvider = $scope.mortgageprovider.split('/');
                        }
                        else { mortgageProvider[0] = null; mortgageProvider[1] = null; }
                        $scope.loadershow = true;
                        $http.post(api + 'property', {
                            createdBy: userid,
                            name: $scope.propname,
                            currentEstimate: $scope.estvalue,
                            address: $scope.address,
                            propertyTypeId: proprtype[0],
                            propertyType: proprtype[1],
                            holdingType: $scope.freeleasehold,
                            prchaseDate: $scope.buydate,
                            purchaseAmount: $scope.purprice,
                            isMortgaged: true,
                            mortgageProviderId: mortgageProvider[0],
                            mortgageProvider: mortgageProvider[1],
                            mortgageType: $scope.mortgagetype,
                            mortgageTerm: $scope.mortgageterm,
                            interestRate: $scope.currentinterestrate,
                            mortgagePayment: $scope.Currentmortgagepayment,
                            mortgageOutstanding: $scope.Currentmortgageoutstanding,
                            mortgageEndDate: $scope.mindate,
                            mortgageStartDate: $scope.mordate,
                            propertyUnits: $scope.propertylist
                        })
                           .then(function (result) {
                               if (result.data.statusCode === 200) { $scope.loadershow = false; finalcongratulation(); }
                               else { $scope.unsuccess = result.data.msg; }
                           }, function (result) { $scope.unsuccess = 'API Not responding' + result; });
                    }
                }
            }
        };
        $scope.close = function () {
            countUp();
        };
        function countUp() {
            $scope.unsuccess = '';
            $scope.success = '';
        }
        $scope.open = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };
        $scope.open1 = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened1 = true;
        };

        $scope.TStart = [];
        $scope.openn = function ($event, $index) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.TStart[$index] = true;
        };

        $scope.TEnd = [];
        $scope.opnn = function ($event, $index) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.TEnd[$index] = true;
        };
        $scope.open4 = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened4 = true;
        };
        $scope.comparevalue = function (Currentmortgageoutstanding, estvalue) {
            if (Currentmortgageoutstanding && estvalue) {
                var cur = parseFloat(Currentmortgageoutstanding, 20);
                var curpay = parseFloat(estvalue, 20);
                if (cur > curpay) {
                    $scope.errmsgcur = true;
                    return true;
                }
                else {
                    $scope.errmsgcur = false;
                    return false;
                }
            }
            else {
                $scope.errmsgcur = false;
                return false;
            }
        };
        $scope.dateOptions = {
            formatYear: 'yyyy',
            showWeeks: false,
            startingDay: 1
        };
        $scope.getindex = function (index) {
            $scope.currentindex = index;
        };
        $scope.todaydate = new Date();
        $scope.startSelect = function (v) {

            $scope.todaydate = $filter('date')(new Date(v), 'dd/MM/yyyy');
        };
        $scope.formats = ['dd/MM/yyyy'];
        $scope.format = $scope.formats[0];
        getmortgage();
        function getmortgage() {
            $http.get(api + 'mortgageProviders')
             .then(function (result) {
                 if (result.data.statusCode === 200) {
                     $scope.mortgageProviders = result.data.mortgageProviders;
                 }
             }, function (result) {
                 $scope.unsuccess = result;
             });
        }
        $scope.firsttab = true;
        $scope.secoundtab = false;
        $scope.thirdtab = false;
        $scope.showModal = function (form) {
            if ($scope.a === true) {
                $scope.firsttab = false;
                $scope.secoundtab = true;
                $scope.thirdtab = false;
            }
            else {
                $scope.$root.propname = $scope.propname;
                if (form.$invalid || $scope.futuredateerror) {
                    $scope.changeeed = true;
                }
                else {
                    $modal.open({
                        templateUrl: 'myModal.html',
                        controller: 'ModalDialogController'
                    })
        .result.then(
            function () {
                $scope.a = true;
                $scope.firsttab = false;
                $scope.secoundtab = true;
                $scope.thirdtab = false;
            },
            function () {
                $scope.b = true;
                getmortagepopup();
            }
        );
                }
            }
        };

        $scope.daydiff = function (endate) {
            var date2 = new Date();
            var date1 = new Date(endate);
            var timeDiff = date2.getTime() - date1.getTime();
            $scope.dayDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));
            if ($scope.dayDifference <= 0) {
                $scope.futuredateerror = 1;
            }
            else {
                $scope.futuredateerror = 0;
            }
        };

        $scope.daydiffmortge = function (endate) {
            var date2 = new Date();
            var date1 = new Date(endate);
            var timeDiff = date2.getTime() - date1.getTime();
            $scope.dayDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));
            if ($scope.dayDifference <= 0) {
                $scope.futuremordateerror = 1;
            }
            else {
                $scope.futuremordateerror = 0;
            }
        };
        $scope.futureunitdateerror = [];
        $scope.daydifftentunit = function (startdate, endate, index) {
            if (startdate && endate) {
                var date2 = new Date(startdate);
                var date1 = new Date(endate);
                var timeDiff = date2.getTime() - date1.getTime();
                $scope.dayDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));
                if ($scope.dayDifference <= 0) {
                    $scope.futureunitdateerror[index] = 1;
                }
                else {
                    $scope.futureunitdateerror[index] = 0;
                }
            }
        };
        $scope.daydiffendmortge = function (endate) {
            var date2 = new Date();
            var date1 = new Date(endate);
            var timeDiff = date2.getTime() - date1.getTime();
            $scope.dayDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));
            if ($scope.dayDifference >= 0) {
                $scope.futurendemordateerror = 1;
            }
            else {
                $scope.futurendemordateerror = 0; 
            }
        };

        $scope.futurendror = [];
        $scope.daydiffenddunit = function (startdate, endate, index) {
            if (startdate && endate) {
                var date2 = new Date(startdate);
                var date1 = new Date(endate);
                var timeDiff = date2.getTime() - date1.getTime();
                $scope.dayDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));
                if ($scope.dayDifference >= 0) {
                    $scope.futurendror[index] = 1;
                }
                else {
                    $scope.futurendror[index] = 0;
                }
            }
        };

        $scope.yesunit = function () {
            $scope.propertylist.splice($scope.currentindex, 1);
        };
        $scope.Mortgage = function (form) {
            getmortagepopup(form);
        };

        function getmortagepopup(form) {
            if (form) {
                if (form.$invalid || $scope.futuremordateerror || $scope.futurendemordateerror) {
                    $scope.changeeeed = true;
                }
                else {
                    $modal.open({
                        templateUrl: 'Mortgage.html',
                        controller: 'ModalDialogControllerMortgage'
                    })
                    .result.then(
                        function () {
                            $scope.firsttab = false;
                            $scope.secoundtab = false;
                            $scope.thirdtab = true;
                            $scope.ismultiple = false;
                            $scope.singleproperty = false;
                        },
                        function () {
                            $scope.firsttab = false;
                            $scope.secoundtab = false;
                            $scope.thirdtab = true;
                            $scope.ismultiple = true;
                            $scope.singleproperty = true;
                        }
                    );
                }
            }
            else {
                $modal.open({
                    templateUrl: 'Mortgage.html',
                    controller: 'ModalDialogControllerMortgage'
                })
                .result.then(
                    function () {
                        $scope.firsttab = false;
                        $scope.secoundtab = false;
                        $scope.thirdtab = true;
                        $scope.ismultiple = false;
                        $scope.singleproperty = false;
                    },
                    function () {
                        $scope.firsttab = false;
                        $scope.secoundtab = false;
                        $scope.thirdtab = true;
                        $scope.ismultiple = true;
                        $scope.singleproperty = true;
                    }
                );
            }
        }
        $scope.change = function (value) {
            if (value === 'firsttab') {
                $scope.firsttab = true;
                $scope.secoundtab = false;
                $scope.thirdtab = false;
            }
            else if (value === 'secoundtab') {
                $scope.propertylist = {};
                $scope.propertylist = [{
                    'unitName': null, 'bedRooms': null,
                    'rent': null, 'isVacant': null, 'tenancyStartDate': null, 'tenancyTerm': null, 'tenancyEndDate': null
                }];
                if ($scope.b === true) {
                    $scope.firsttab = true;
                    $scope.secoundtab = false;
                    $scope.thirdtab = false;
                }
                else {
                    $scope.firsttab = false;
                    $scope.secoundtab = true;
                    $scope.thirdtab = false;
                }
            }
            else {
                getmortagepopup();
            }
        };
        function finalcongratulation() {
            $scope.$root.propname = $scope.propname;
            $modal.open({
                templateUrl: 'congratulation.html',
                controller: 'congratulationController'
            })
            .result.then(
                function () {
                    $location.path('viewportfolio');
                },
                function () {
                    $window.location.reload();
                }
            );
        }
    }
    ModalDialogControllerFunction.$inject = ['$scope', '$modalInstance'];
    function ModalDialogControllerFunction($scope, $modalInstance) {
        $scope.myclick = function (val) {
            $scope.ismultiple = val;
        };
        $scope.ok = function () {
            $modalInstance.close();
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }

    ModalDialogControllerMortgageFunction.$inject = ['$scope', '$modalInstance'];
    function ModalDialogControllerMortgageFunction($scope, $modalInstance) {
        $scope.ok = function () {
            $modalInstance.close();
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }

    congratulationControllerFunction.$inject = ['$scope', '$modalInstance'];
    function congratulationControllerFunction($scope, $modalInstance) {
        $scope.ok = function () {
            $modalInstance.close();
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }
})();