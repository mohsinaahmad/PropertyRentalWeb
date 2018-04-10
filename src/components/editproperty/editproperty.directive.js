(function () {

    'use strict';
    angular.module('app.editproperty')
        .directive('tmplEditproperty', directiveFunction)
        .directive('demoFileModel', dirparseupload)

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

                            var clean = val.replace(/[^0-9\.]/g, '');
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

        .service('fileUploadService', uploadser)

             .controller('EditpropertyController', ControllerFunction);

    // ----- directiveFunction -----
    directiveFunction.$inject = [];
    uploadser.$inject = ['$http', '$scope'];
    function uploadser($http, $scope) {
        $scope.uploadFileToUrl = function (file, uploadUrl) {
            var fileFormData = new FormData();
            fileFormData.append('file', file);
            $http.post(uploadUrl, fileFormData, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            })
              .then(function (result) {
                  if (result.data.statusCode === 200) {
                      return result;
                  }
                  else {
                      return result;
                  }

              }, function (result) {
                  return result;
              });
        };
    }

    /* @ngInject */
    function directiveFunction() {
        var directive = {
            restrict: 'E',
            templateUrl: 'components/editproperty/editproperty.html',
            scope: {
            },
            controller: 'EditpropertyController',
            controllerAs: 'vm'
        };
        return directive;
    }

    // ----- ControllerFunction -----
    ControllerFunction.$inject = ['$scope', '$http', 'api', '$location', '$filter', '$window', '$sce', '$modal'];

    /* @ngInject */
    function ControllerFunction($scope, $http, api, $location, $filter, $window, $sce, $modal) {
        $scope.loadershow = false;
        $scope.loaderbegin = true;
        $scope.loaderedit = false;
        $scope.showast = true;
        $scope.showgas = true;
        $scope.changed = false;
        $scope.modalimage = false;
        $scope.modalimages = false;
        $scope.modaldoc = false;
        $scope.replaceextenant = false;
        $scope.editrentalunit = false;
        $scope.loadereditrental = false;
        $scope.loaderaddrental = false;
        $scope.showhide = false;
        $scope.loaderprofile = false;
        $scope.imgmsg = false;
        $scope.maxDate = new Date();
        $scope.errrent = '';
        $scope.errrent1 = '';
        $scope.multitenant = [];
        $scope.todaydate = new Date();
        var userid = window.localStorage.userid;
        $scope.propertyid = $scope.$root.propid;
        window.localStorage.propertyId = $scope.propertyid;
        if ($scope.propertyid !== undefined) {
            $scope.openaddunit = false;
            getdata($scope.propertyid);
        }
        else {
            $location.path('viewportfolio');
        }
        $scope.close = function (num) {
            if (num === 1) {
                $scope.tenentedit = !$scope.tenentedit;
            }
            else {
                $scope.addrentalunit = !$scope.addrentalunit;
            }
        };
        $scope.closeedit = function (num) {
            if (num === 1) {
                $scope.editrentalunit = !$scope.editrentalunit;
            }
            else {
                $scope.editrentalunit = !$scope.editrentalunit;
            }
        };
        var role = window.localStorage.role;
        if (!userid || role !== 'Landlord') {
            $location.path('login');
        }
        $scope.openclosemenu = function () {
            $scope.menuitems = !$scope.menuitems;
        };
        $scope.uploadFile = function (name, type) {
            $scope.loadershow = true;
            var filegas = [];
            var fileast = [];
            fileast = document.getElementById('myFileFieldast').files[0];
            filegas = document.getElementById('myFileFieldgas').files[0];
            var filedoc = [];
            if (type === undefined) {
                filedoc = document.getElementById('myFileFielddoc').files[0];
            }
            var file = [];
            if (type === 'ast') {
                file = fileast;
            }
            else if (type === 'gas') {
                file = filegas;
            }
            else {
                file = filedoc;
            }
            var uploadUrl = 'upload'; //Url of web service
            var fileFormData = new FormData();
            fileFormData.append('file', file);
            $http.post(api + uploadUrl, fileFormData, {
                headers: { 'Content-Type': undefined }
            })
             .then(function (result) {
                 if (result.data.statusCode === 200) {
                     $scope.loadershow = false;
                     for (var y = 0; y < $scope.propertyDocs.length; y++) {

                         if ($scope.propertyDocs[y].file === '') {

                             $scope.propertyDocs.splice(y, 1);
                         }
                     }
                     if (type === 'ast') {
                         $scope.propertyDocs.push({ 'name': name, 'file': result.data.path, type: 'ast' });
                         $scope.showast = false;
                     }
                     else if (type === 'gas') {
                         $scope.propertyDocs.push({ 'name': name, 'file': result.data.path, type: 'gas' });
                         $scope.showgas = false;
                     }
                     else {
                         $scope.propertyDocs.push({ 'name': name, 'file': result.data.path, type: 'doc' });
                     }
                 }
                 else {
                     $scope.loadershow = false;
                     $scope.unsuccess = result.data.msg;
                 }
             },
             function (result) {
                 $scope.loadershow = false;
                 $scope.unsuccess = 'API Not responding' + result;
             }
             );
        };
        $scope.uploadFiles = function (name) {
            var file = document.getElementById('myFileFieldst').files[0];
            var uploadUrl = 'upload'; //Url of web service
            var fileFormData = new FormData();
            fileFormData.append('file', file);
            $http.post(api + uploadUrl, fileFormData, {
                headers: { 'Content-Type': undefined }
            })
             .then(function (result) {
                 if (result.data.statusCode === 200) {
                     for (var y = 0; y < $scope.unit1.tenantDocs1.length; y++) {
                         if ($scope.unit1.tenantDocs1[y].file === '') {
                             $scope.unit1.tenantDocs1.splice(y, 1);
                         }
                     }
                     $scope.unit1.tenantDocs1.push({ 'name': name, 'file': result.data.path });
                 }
                 else {
                     $scope.unsuccess = result.data.msg;
                 }
             },
             function (result) {
                 $scope.unsuccess = 'API Not responding' + result;
             }
             );
        };

        $scope.profileuploadFile = function () {
            $scope.imgmsg = false;
            $scope.loaderprofile = true;
            var file = document.getElementById('myFileFields').files[0];
            if (file) {
     
                var splitfile = file.name;
                splitfile = splitfile.split('.');
                splitfile = splitfile[1];
                splitfile = splitfile.toLowerCase();
                var tempsize = (file.size / 1024) / 1024;
                if (splitfile === 'jpg' || splitfile === 'png' || splitfile === 'jpeg' || splitfile === 'svg' || splitfile === 'PNG' || splitfile === 'JPG') {
                    if (tempsize <= 2) {
                        var uploadUrl = 'upload'; //Url of web service
                        var fileFormData = new FormData();
                        fileFormData.append('file', file);
                        $http.post(api + uploadUrl, fileFormData, {
                            headers: { 'Content-Type': undefined }
                        })
                         .then(function (result) {
                             if (result.data.statusCode === 200) {
                                 $scope.loaderprofile = false;
                                 $scope.uel = result.data.path;
                                 $http.put(api + 'property/' + $scope.propertyid, {
                                     'createdBy': userid,
                                     'address': $scope.address,
                                     'name': $scope.name,
                                     'purchaseAmount': $scope.purchaseAmount,
                                     'currentEstimate': $scope.currentEstimate,
                                     'prchaseDate': $scope.prchaseDate,
                                     'keyExpirydates': $scope.keyExpirydates,
                                     'propertyDocs': $scope.propertyDocs,
                                     'interestRate': $scope.interestRate,
                                     'mortgageEndDate': $scope.mortgageEndDate,
                                     'mortgageStartDate': $scope.mortgageStartDate,
                                     'mortgagePayment': $scope.mortgagePayment,
                                     'mortgageOutstanding': $scope.mortgageOutstanding,
                                     'mortgageProvider': $scope.mortgageProvider,
                                     'mortgageType': $scope.mortgageType,
                                     'holdingType': $scope.holdingType,
                                     'propertyType': $scope.propertyType,
                                     'propimageurl': $scope.uel,
                                     'tenantDocs': $scope.tenantDocs
                                 })
                     .then(function (result) {
                         if (result.data.statusCode === 200) {
                             $scope.loaderprofile = false;
                             $scope.$root.propsave = $scope.propertyid;
                         }
                         else {
                             $scope.unsuccess = result.data.msg;
                         }

                     }, function (result) {
                         $scope.loaderprofile = false;
                         $scope.unsuccess = 'API Not responding' + result;
                     });
                             }
                             else {
                                 $scope.unsuccess = result.data.msg;
                             }
                         },
                         function (result) {
                             $scope.loaderprofile = false;
                             $scope.unsuccess = 'API Not responding' + result;
                         }
                         );
                    }
                    else {
                        $scope.loaderprofile = false;
                        $scope.imgmsg = true;
                    }
                }
                else {
                    $scope.loaderprofile = false;
                    $scope.imgmsg = true;
                }
            }
            else {
                $scope.loaderprofile = false;
                $scope.imgmsg = true;
            }
        };
        $scope.setInitialState = function () {
            $scope.morespec = false;
            $scope.morespec1 = false;
            $scope.tenentedit = false;
            $scope.morespace = false;
            $scope.menuitems = false; $scope.TStart = []; $scope.Gas = false;
            $scope.number = 31; $scope.formats = ['dd/MM/yyyy'];
            $scope.format = $scope.formats[0]; $scope.todaysdate = new Date();
        };
        $scope.setInitialState();
        $scope.morespecname = function () {
            $scope.morespec = !$scope.morespec;
        };
        $scope.morespecname1 = function () {
            $scope.morespec1 = !$scope.morespec1;
        };
        $scope.spacename = function () {
            $scope.morespace = !$scope.morespace;
        };
        $scope.propsave = function () {
            var userid = window.localStorage.userid;
            if ($scope.interestRate === '') {
                $scope.interestRate = null;
            }
            if ($scope.mortgageEndDate === undefined) {
                $scope.mortgageEndDate = null;
            }
            $scope.mortgageStartDate = $filter('date')($scope.mortgageStartDate);
            if ($scope.mortgageStartDate === undefined) {
                $scope.mortgageStartDate = null;
            }
            $http.put(api + 'property/' + $scope.propertyid, {
                'createdBy': userid,
                'address': $scope.address,
                'name': $scope.name,
                'purchaseAmount': $scope.purchaseAmount,
                'currentEstimate': $scope.currentEstimate,
                'prchaseDate': $scope.prchaseDate,
                'keyExpirydates': $scope.keyExpirydates,
                'propertyDocs': $scope.propertyDocs,
                'interestRate': $scope.interestRate,
                'mortgageEndDate': $scope.mortgageEndDate,
                'mortgageStartDate': $scope.mortgageStartDate,
                'mortgagePayment': $scope.mortgagePayment,
                'mortgageOutstanding': $scope.mortgageOutstanding,
                'mortgageProvider': $scope.mortgageProvider,
                'mortgageType': $scope.mortgageType,
                'holdingType': $scope.holdingType,
                'propertyTypeId': $scope.propertyType,
                'propimageurl': $scope.uel,
                'tenantDocs': $scope.tenantDocs
            })
          .then(function (result) {
              if (result.data.statusCode === 200) {
                  $scope.$root.propsave = $scope.propertyid;
                  $location.path('editproperty');
              }
              else {
                  $scope.unsuccess = result.data.msg;
              }
          }, function (result) {
              $scope.unsuccess = 'API Not responding' + result;
          });
        };
        $scope.remove = function remove() {
            $scope.propertyDocs.splice($scope.latestindex, 1);
            if ($scope.latesttype === 'ast') {
                $scope.showast = true;
            }
            else if ($scope.latesttype === 'gas') {
                $scope.showgas = true;
            }
        };
        $scope.closethis = function () {
            $scope.modaldoc = false;
            $scope.fadinwa = '';
        };
        $scope.closeclsthis = function () {
            $scope.modalimage = false;
            $scope.fadinw = '';
        };

        $scope.removeFadeIn = function () {
            $scope.modalimage = false;
            $scope.fadinw = '';
            $scope.modaldoc = false;
            $scope.fadinwa = '';
            $scope.modalimages = false;
            $scope.fadinwnn = '';
        };

        $scope.openplease = function (url) {
            $scope.modalimage = false;
            $scope.fadinw = '';
            var substr = url.substring(url.length - 3);
            console.log(substr);
            if (substr === 'doc' || substr === 'ocx') {
                $scope.removeFadeIn();
                $window.open(url, '_blank');
               
            }
            else {
                $scope.modalimage = true;
                $scope.fadinw = 'in';
                $scope.currenturl = $sce.trustAsResourceUrl(url);
            }
        };
        $scope.openpleasetenant = function (url) {
            $scope.modalimages = false;
            $scope.fadinwnn = '';
            var substr = url.substring(url.length - 3);
            console.log(substr);
            if (substr === 'doc' || substr === 'ocx') {
                $scope.removeFadeIn();
                $window.open(url, '_blank');
              
            }
            else {
                $scope.modalimages = true;
                $scope.fadinwnn = 'in';
                $scope.currenturl = $sce.trustAsResourceUrl(url);
            }
        };
        $scope.closeclsthisapp = function () {
            $scope.modalimages = false;
            $scope.fadinwnn = '';
        };
        $scope.openpleasegas = function (url) {
            $scope.modaldoc = false;
            $scope.fadinwa = '';
           
            var substr = url.substring(url.length - 3);
            console.log(substr);
            if (substr === 'doc' || substr === 'ocx') {
                $scope.removeFadeIn();
                $window.open(url, '_blank');
               
            }
            else {
                $scope.modaldoc = true;
                $scope.fadinwa = 'in';
                $scope.currenturl = $sce.trustAsResourceUrl(url);
            }
        };
        $scope.changeid = function (changeiddd) {
            $scope.oldunitid = changeiddd;
        };
        $scope.ccc = function () {
            $scope.changed = true;
        };
        $scope.savetreplace = function () {
            $http.put(api + 'tenant/' + $scope.currid, {
                'oldunitname': $scope.oldunitname,
                'unitName': $scope.unitName1,
                'createdBy': $scope.unit1.createdBy,
                'propertyId': $scope.unit1.propertyId,
                'tenantDocs': $scope.tenantDocs1,
                'rent': $scope.rent1,
                'deposit': $scope.deposit1,
                'firstName': $scope.firstName1,
                'lastName': $scope.lastName1,
                'contactNum': $scope.contactNum1,
                'tenancyStartDate': $scope.unit1.tenancyStartDate1,
                'tenancyEndDate': $scope.unit1.tenancyEndDate1,
                'rentDueDate': $scope.rentDueDate1,
                'tenantBank': $scope.tenantBank1,
                'bankAccountNumber': $scope.bankAccountNumber1,
                'bankSortCode': $scope.bankSortCode1
            })
.then(function (result) {
    if (result.data.statusCode === 200) {
        $scope.rtent = '';
        $scope.replaceextenant = false;
        $scope.changed = false;
        $scope.tenentedit = !$scope.tenentedit;
        getdata($scope.propertyid);

    }
    else {
        $scope.unsuccess = result.data.msg;
    }
}, function (result) {
    $scope.unsuccess = 'API Not responding' + result;
});
        };
        $scope.replacetenant = function (currid) {
            $scope.currid = currid;
            if ($scope.changed === true) {
                $scope.rtent = 'in';
                $scope.replaceextenant = true;
            }
            else {
                $http.put(api + 'tenant/' + $scope.currid, {
                    'oldunitname': $scope.oldunitname,
                    'unitName': $scope.unitName1,
                    'createdBy': $scope.unit1.createdBy,
                    'propertyId': $scope.unit1.propertyId,
                    'tenantDocs': $scope.unit1.tenantDocs1,
                    'rent': $scope.rent1,
                    'deposit': $scope.deposit1,
                    'firstName': $scope.firstName1,
                    'lastName': $scope.lastName1,
                    'contactNum': $scope.contactNum1,
                    'tenancyStartDate': $scope.unit1.tenancyStartDate1,
                    'tenancyEndDate': $scope.unit1.tenancyEndDate1,
                    'rentDueDate': $scope.rentDueDate1,
                    'tenantBank': $scope.tenantBank1,
                    'bankAccountNumber': $scope.bankAccountNumber1,
                    'bankSortCode': $scope.bankSortCode1
                })
.then(function (result) {
    if (result.data.statusCode === 200) {
        $scope.tenentedit = !$scope.tenentedit;
        getdata($scope.propertyid);

    }
    else {
        $scope.unsuccess = result.data.msg;
    }
}, function (result) {
    $scope.unsuccess = 'API Not responding' + result;
});
            }
        };

        $scope.noreplace = function () {
            $scope.rtent = '';
            $scope.replaceextenant = false;
        };
        getpropertytypes();
        $scope.holdingType = 'Freehold';
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

        $scope.openitplz = function () {
            $scope.Gass = !$scope.Gass;
        };

        $scope.removeast = function (index, type) {
            $scope.latestindex = index;
            $scope.latesttype = type;
        };
        $scope.open1 = function ($event, $index) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.TStart[$index] = true;
        };
        $scope.opengass = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.Gass = true;
        };
        $scope.dateOptions = {
            formatYear: 'yyyy',
            showWeeks: false,
            startingDay: 1

        };
        $scope.passdastaname = function (name, index) {
            $scope.currindex = index;
            $scope.keyname = name;
        };
        $scope.getNumber = function (num) {
            return new Array(num);
        };
        $scope.addtenant = function (unitid, rent, tenancyStartDate, tenancyEndDate) {
            window.localStorage.unitid = unitid;
            window.localStorage.rent = rent;
            window.localStorage.tenancyStartDate = $filter('date')(tenancyStartDate, 'dd/MM/yyyy');

            window.localStorage.tenancyEndDate = $filter('date')(tenancyEndDate, 'dd/MM/yyyy');

            $location.path('addtenant');
        };
        $scope.edit = function (MyData, id, name) {
            $scope.loaderedit = true;
            $scope.tenentedit = false;
            $scope.editrentalunit = false;
            $scope.addrentalunit = false;
            $scope.fendeditdateerror = 0;
            if (MyData === 'Edit AST') {
                for (var i = 0; i < $scope.units.length; i++) {
                    if ($scope.units[i].id === id) {

                        $scope.unit1 = $scope.units[i];
                        $scope.oldunitid = $scope.unit1.id;
                        $scope.oldunitname = $scope.unit1.unitName;
                        if ($scope.unit1.tenancyEndDate) {
                            $scope.unit1.tenancyEndDate1 = new Date($scope.unit1.tenancyEndDate);
                        }
                        if ($scope.unit1.tenancyStartDate) {
                            $scope.unit1.tenancyStartDate1 = new Date($scope.unit1.tenancyStartDate);
                        }
                        $scope.unit1.daydif1 = $scope.daydiff($scope.unit1.tenancyEndDate);
                        $scope.unitName1 = $scope.unit1.unitName;
                        $scope.tenantBank1 = $scope.unit1.tenantBank;
                        $scope.email1 = $scope.unit1.email;
                        $scope.contactNum1 = $scope.unit1.contactNum;
                        $scope.firstName1 = $scope.unit1.firstName;
                        $scope.lastName1 = $scope.unit1.lastName;
                        $scope.deposit1 = $scope.unit1.deposit;
                        $scope.rent1 = $scope.unit1.rent;
                        $scope.rentDueDate1 = $scope.unit1.rentDueDate;
                        $scope.bankSortCode1 = $scope.unit1.bankSortCode;
                        $scope.bankAccountNumber1 = $scope.unit1.bankAccountNumber;
                        $scope.unit1.tenantDocs1 = $scope.unit1.tenantDocs;
                        if (!$scope.unit1.tenantDocs1) {
                            $scope.unit1.tenantDocs1 = [];
                        }
                        $scope.tenentedit = !$scope.tenentedit;

                    }
                }
                $scope.loaderedit = false;
            }
            else if (MyData === 'Delete Tenant') {
                $scope.currenttenatname = name;
                $scope.deleteid = id;
                $scope.tenentedit1 = !$scope.tenentedit1;
                $scope.loaderedit = false;
            }
            else if (MyData === 'Delete Rental Unit') {
                $scope.currentunitrental = name;
                $scope.deletedid = id;
                $scope.tenentedit1 = !$scope.tenentedit1;
                $scope.loaderedit = false;
            }
            else if (MyData === 'Edit Rental Unit') {
                $scope.editrentalunit = true;

                $scope.editedid = id;
                for (var m = 0; m < $scope.units.length; m++) {
                    if ($scope.units[m].id === id) {
                        if ($scope.units[m].tenancyEndDate) {
                            $scope.tenancyEndDate2 = new Date($scope.units[m].tenancyEndDate);
                        }
                        if ($scope.units[m].tenancyStartDate) {
                            $scope.tenancyStartDate2 = new Date($scope.units[m].tenancyStartDate);
                        }
                        $scope.unitName2 = $scope.units[m].unitName;
                        $scope.rent2 = $scope.units[m].rent;
                        $scope.isVacant2 = $scope.units[m].isVacant;

                        if ($scope.isVacant2 === false) {
                            $scope.isVacant2 = 'let';
                        }
                        else {
                            $scope.isVacant2 = 'vacant';
                        }
                    }
                }
                $scope.loaderedit = false;
            }
            else {
                $scope.loaderedit = false;
                $scope.tenentedit = false;
            }
        };
        $scope.daydiff = function (endate) {
            var date2 = new Date();
            var date1 = new Date(endate);
            var date2time = date2.getTime();
            var date1time = date1.getTime();
            var timeDiff = date2.getTime() - date1.getTime();
            $scope.dayDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));
            if ($scope.dayDifference <= 0 && date2time < date1time) {
                return 'Active';
            }
            else {
                return 'InActive';
            }
        };
        $scope.daydiffpur = function (endate) {
            var date2 = new Date();
            var date1 = new Date(endate);
            var timeDiff = date2.getTime() - date1.getTime();
            $scope.dayDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));
            if ($scope.dayDifference <= 0) {
                $scope.futurepurdateerror = 1;
            }
            else {
                $scope.futurepurdateerror = 0;
            }
        };
        $scope.futurestrteditdateerror = [];
        $scope.daydifftedittstart = function (endate, index) {
            var date2 = new Date();
            var date1 = new Date(endate);
            var timeDiff = date2.getTime() - date1.getTime();
            $scope.dayDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));
            if ($scope.dayDifference <= 0) {
                $scope.futurestrteditdateerror[index] = 1;
            }
            else {
                $scope.futurestrteditdateerror[index] = 0;
            }
        };
        $scope.daydebdttstart = function (startdate, endate) {
            var date2 = new Date(endate);
            var date1 = new Date(startdate);
            var timeDiff = date2.getTime() - date1.getTime();
            $scope.dayDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));
            if ($scope.dayDifference <= 0) {

                $scope.fendeditdateerror = 1;
            }
            else {
                $scope.fendeditdateerror = 0;
            }
        };

        $scope.yeschangeplz = function (tomy) {
            if (tomy === '0') {
                $scope.bop = true;
            }
            else {
                $scope.bop = false;
            }
        };

        $scope.daydedrtittstart = function (endate) {
            var date2 = new Date();
            var date1 = new Date(endate);
            var timeDiff = date2.getTime() - date1.getTime();
            $scope.dayDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));
            if ($scope.dayDifference >= 0) {
                $scope.fenr = 1;
            }
            else {
                $scope.fenr = 0;
            }
        };

        $scope.dayttennttart = function () {
            if ($scope.tenancyStartDate && $scope.tenancyEndDate) {
                var date2 = new Date($scope.tenancyStartDate);
                var date1 = new Date($scope.tenancyEndDate);
                var timeDiff = date2.getTime() - date1.getTime();
                $scope.dayDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));
                if ($scope.dayDifference >= 0) {
                    $scope.fendhhrror = 1;
                }
                else {
                    $scope.fendhhrror = 0;
                }
            }
        };

        $scope.daydifftstart = function () {
            if ($scope.tenancyStartDate && $scope.tenancyEndDate) {
                var date2 = new Date($scope.tenancyStartDate);
                var date1 = new Date($scope.tenancyEndDate);
                var timeDiff = date1.getTime() - date2.getTime();
                $scope.dayDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));
                if ($scope.dayDifference <= 0) {
                    $scope.futurestrtdateerror = 1;
                }
                else {
                    $scope.futurestrtdateerror = 0;
                }
            }
        };

        $scope.daydiffteditstart = function (endate) {
            var date2 = new Date();
            var date1 = new Date(endate);
            var timeDiff = date2.getTime() - date1.getTime();
            $scope.dayDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));
            if ($scope.dayDifference <= 0) {
                $scope.futureeditstrtdateerror = 1;
            }
            else {
                $scope.futureeditstrtdateerror = 0;
            }
        };

        $scope.checkenddate = function (endate) {
            if (endate) {
                var date2 = new Date();
                var date1 = new Date(endate);
                var date2time = date2.getTime();
                var date1time = date1.getTime();
                var timeDiff = date2.getTime() - date1.getTime();
                $scope.dayDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));
                if ($scope.dayDifference <= 0 && date2time < date1time) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return true;
            }
        };
        $scope.calss = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened1 = true;
        };
        $scope.call = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened5 = true;
        };
        $scope.openpruchasedate = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.openpdate = true;
        };
        $scope.openrentalunit = function () {
            $scope.addrentalunit = true;
            $scope.tenentedit = false;
            $scope.editrentalunit = false;
        };

        $scope.saverentalunit = function () {
            $scope.errrent1 = '';
            
            $scope.showhideadd = false;
            if ($scope.isVacant === '0') {
                if (!$scope.tenancyStartDate || !$scope.tenancyEndDate) {
                    $scope.loadereditrental = false;
                    $scope.showhideadd = true;
                }
                else {
                    if ($scope.fendhhrror === 1) {
                        $scope.loaderaddrental = false;
                    }
                    else {
                        $scope.loaderaddrental = true;
                        var listrent1 = false;
                        if ($scope.rent === undefined && $scope.isVacant === '0') {
                            listrent1 = true;
                        }

                        if (listrent1 === true) {
                            $scope.loaderaddrental = false;
                            $scope.errrent1 = 'Please enter Rent';
                        }
                        else {
                            $http.post(api + 'propertyUnit/', {
                                'unitName': $scope.unitName,
                                'createdBy': window.localStorage.userid,
                                'propertyId': $scope.propertyid,
                                'rent': $scope.rent,
                                'tenancyStartDate': $scope.tenancyStartDate,
                                'tenancyEndDate': $scope.tenancyEndDate,
                                'isVacant': $scope.isVacant,
                            })
                .then(function (result) {
                    if (result.data.statusCode === 200) {
                        $scope.loaderaddrental = false;

                        $http.get(api + 'property/' + $scope.propertyid)
                               .then(function (result) {
                                   if (result.data.statusCode === 200) {

                                       $scope.address = result.data.property.address;
                                       $scope.name = result.data.property.name;
                                       $scope.purchaseAmount = result.data.property.purchaseAmount;
                                       $scope.currentEstimate = result.data.property.currentEstimate;
                                       $scope.prchaseDate = result.data.property.prchaseDate;
                                       $scope.units = result.data.property.propertyUnits;
                                       $scope.keyExpirydates = result.data.property.keyExpirydates;
                                       $scope.propertyDocs = result.data.property.propertyDocs;
                                       $scope.interestRate = result.data.property.interestRate;
                                       $scope.mortgageEndDate = result.data.property.mortgageEndDate;
                                       $scope.mortgagePayment = result.data.property.mortgagePayment;
                                       $scope.mortgageStartDate = result.data.property.mortgageStartDate;
                                       $scope.mortgageOutstanding = result.data.property.mortgageOutstanding;
                                       $scope.mortgageProvider = result.data.property.mortgageProvider;
                                       $scope.mortgageType = result.data.property.mortgageType;
                                       $scope.propertyType = result.data.property.propertyTypeId;
                                       $scope.holdingType = result.data.property.holdingType;
                                       $scope.uel = result.data.property.propimageurl;
                                       var test = $scope.$root.movetoedit;
                                       if (test) {
                                           $scope.edit('Edit AST', test);
                                       }
                                       $scope.loaderbegin = false;
                                   }
                               },
                               function (result) {
                                   $scope.unsuccess = result;
                               });
                        $scope.addrentalunit = false;
                        $scope.unitName = null;
                        $scope.rent = null;
                        $scope.tenancyStartDate = null;
                        $scope.tenancyEndDate = null;
                        $scope.isVacant = null;
                    }
                    else {
                        $scope.loaderaddrental = false;
                        $scope.unsuccess = result.data.msg;
                    }
                }, function (result) {
                    $scope.loaderaddrental = false;
                    $scope.unsuccess = 'API Not responding' + result;
                });
                        }
                    }
                }
            }
            else {
                if ($scope.fendhhrror === 1) {
                    $scope.loaderaddrental = false;
                }
                else {
                    $scope.loaderaddrental = true;
                    var listrent2 = false;
                    if ($scope.rent === undefined && $scope.isVacant === '0') {
                        listrent2 = true;
                    }

                    if (listrent2 === true) {
                        $scope.loaderaddrental = false;
                        $scope.errrent1 = 'Please enter Rent';
                    }
                    else {
                        $http.post(api + 'propertyUnit/', {
                            'unitName': $scope.unitName,
                            'createdBy': window.localStorage.userid,
                            'propertyId': $scope.propertyid,
                            'rent': $scope.rent,
                            'tenancyStartDate': $scope.tenancyStartDate,
                            'tenancyEndDate': $scope.tenancyEndDate,
                            'isVacant': $scope.isVacant,
                        })
            .then(function (result) {
                if (result.data.statusCode === 200) {
                    $scope.loaderaddrental = false;
                    $http.get(api + 'property/' + $scope.propertyid)
                           .then(function (result) {

                               if (result.data.statusCode === 200) {

                                   $scope.address = result.data.property.address;
                                   $scope.name = result.data.property.name;
                                   $scope.purchaseAmount = result.data.property.purchaseAmount;
                                   $scope.currentEstimate = result.data.property.currentEstimate;
                                   $scope.prchaseDate = result.data.property.prchaseDate;
                                   $scope.units = result.data.property.propertyUnits;
                                   $scope.keyExpirydates = result.data.property.keyExpirydates;
                                   $scope.propertyDocs = result.data.property.propertyDocs;
                                   $scope.interestRate = result.data.property.interestRate;
                                   $scope.mortgageEndDate = result.data.property.mortgageEndDate;
                                   $scope.mortgagePayment = result.data.property.mortgagePayment;
                                   $scope.mortgageStartDate = result.data.property.mortgageStartDate;
                                   $scope.mortgageOutstanding = result.data.property.mortgageOutstanding;
                                   $scope.mortgageProvider = result.data.property.mortgageProvider;
                                   $scope.mortgageType = result.data.property.mortgageType;
                                   $scope.propertyType = result.data.property.propertyTypeId;
                                   $scope.holdingType = result.data.property.holdingType;
                                   $scope.uel = result.data.property.propimageurl;
                                   var test = $scope.$root.movetoedit;
                                   if (test) {
                                       $scope.edit('Edit AST', test);
                                   }
                                   $scope.loaderbegin = false;
                               }
                           },
                           function (result) {
                               $scope.unsuccess = result;
                           });
                    $scope.addrentalunit = false;
                    $scope.unitName = null;
                    $scope.rent = null;
                    $scope.tenancyStartDate = null;
                    $scope.tenancyEndDate = null;
                    $scope.isVacant = null;
                }
                else {
                    $scope.loaderaddrental = false;
                    $scope.unsuccess = result.data.msg;
                }
            }, function (result) {
                $scope.loaderaddrental = false;
                $scope.unsuccess = 'API Not responding' + result;
            });
                    }
                }
            }
        };

        $scope.nocal = function () {
            $scope.calmssg = !$scope.eyeclosecal;
        };

        $scope.saveeditrentalunit = function () {
            $scope.errrent = '';
            $scope.showhide = false;
            $scope.loadereditrental = true;

            var listrent = false;
            if ($scope.rent2 === '' && $scope.isVacant2 === 'let') {
                listrent = true;
            }

            if (listrent === true) {
                $scope.loadereditrental = false;
                $scope.errrent = 'Please enter Rent';
            }
            else {
                if ($scope.unitName2 === '') {
                    $scope.loadereditrental = false;
                }
                else {
                    if ($scope.isVacant2 === 'let') {
                        if (!$scope.tenancyStartDate2 || !$scope.tenancyEndDate2) {
                            $scope.loadereditrental = false;
                            $scope.showhide = true;
                        }
                        else {
                            if (!$scope.rent2) {
                                $scope.rent2 = 0;
                            }

                            if ($scope.isVacant2 === 'vacant') {
                                $scope.tenancyStartDate2 = null;
                                $scope.tenancyEndDate2 = null;
                                $scope.isVacant2 = true;
                            }
                            else {
                                $scope.isVacant2 = false;
                            }

                            $http.put(api + 'propertyUnit/' + $scope.editedid, {
                                'unitName': $scope.unitName2,
                                'createdBy': window.localStorage.userid,
                                'propertyId': $scope.propertyid,
                                'rent': $scope.rent2,
                                'tenancyStartDate': $scope.tenancyStartDate2,
                                'tenancyEndDate': $scope.tenancyEndDate2,
                                'isVacant': $scope.isVacant2,
                            })
                                .then(function (result) {
                                    if (result.data.statusCode === 200) {
                                        $scope.loadereditrental = false;
                                        $scope.editrentalunit = !$scope.editrentalunit;
                                        $http.get(api + 'property/' + $scope.propertyid)
                               .then(function (result) {
                                   if (result.data.statusCode === 200) {

                                       $scope.address = result.data.property.address;
                                       $scope.name = result.data.property.name;
                                       $scope.purchaseAmount = result.data.property.purchaseAmount;
                                       $scope.currentEstimate = result.data.property.currentEstimate;
                                       $scope.prchaseDate = result.data.property.prchaseDate;
                                       $scope.units = result.data.property.propertyUnits;
                                       $scope.keyExpirydates = result.data.property.keyExpirydates;
                                       $scope.propertyDocs = result.data.property.propertyDocs;
                                       $scope.interestRate = result.data.property.interestRate;
                                       $scope.mortgageEndDate = result.data.property.mortgageEndDate;
                                       $scope.mortgagePayment = result.data.property.mortgagePayment;
                                       $scope.mortgageStartDate = result.data.property.mortgageStartDate;
                                       $scope.mortgageOutstanding = result.data.property.mortgageOutstanding;
                                       $scope.mortgageProvider = result.data.property.mortgageProvider;
                                       $scope.mortgageType = result.data.property.mortgageType;

                                       $scope.propertyType = result.data.property.propertyTypeId;
                                       $scope.holdingType = result.data.property.holdingType;
                                       $scope.uel = result.data.property.propimageurl;
                                       var test = $scope.$root.movetoedit;
                                       if (test) {
                                           $scope.edit('Edit AST', test);
                                       }
                                       $scope.loaderbegin = false;

                                   }
                               },
                               function (result) {
                                   $scope.unsuccess = result;
                               });
                                    }
                                    else {
                                        $scope.loadereditrental = false;
                                        $scope.unsuccess = result.data.msg;
                                    }
                                }, function (result) {
                                    $scope.loadereditrental = false;
                                    $scope.unsuccess = 'API Not responding' + result;
                                });
                        }
                    }
                    else {
                        if (!$scope.rent2) {
                            $scope.rent2 = 0;
                        }

                        if ($scope.isVacant2 === 'vacant') {
                            $scope.tenancyStartDate2 = null;
                            $scope.tenancyEndDate2 = null;
                        }
                        $http.put(api + 'propertyUnit/' + $scope.editedid, {
                            'unitName': $scope.unitName2,
                            'createdBy': window.localStorage.userid,
                            'propertyId': $scope.propertyid,
                            'rent': $scope.rent2,
                            'tenancyStartDate': $scope.tenancyStartDate2,
                            'tenancyEndDate': $scope.tenancyEndDate2,
                            'isVacant': $scope.isVacant2,
                        })
                            .then(function (result) {
                                if (result.data.statusCode === 200) {
                                    $scope.loadereditrental = false;
                                    $scope.editrentalunit = !$scope.editrentalunit;
                                    $http.get(api + 'property/' + $scope.propertyid)
                           .then(function (result) {
                               if (result.data.statusCode === 200) {

                                   $scope.address = result.data.property.address;
                                   $scope.name = result.data.property.name;
                                   $scope.purchaseAmount = result.data.property.purchaseAmount;
                                   $scope.currentEstimate = result.data.property.currentEstimate;
                                   $scope.prchaseDate = result.data.property.prchaseDate;
                                   $scope.units = result.data.property.propertyUnits;
                                   $scope.keyExpirydates = result.data.property.keyExpirydates;
                                   $scope.propertyDocs = result.data.property.propertyDocs;
                                   $scope.interestRate = result.data.property.interestRate;
                                   $scope.mortgageEndDate = result.data.property.mortgageEndDate;
                                   $scope.mortgagePayment = result.data.property.mortgagePayment;
                                   $scope.mortgageStartDate = result.data.property.mortgageStartDate;
                                   $scope.mortgageOutstanding = result.data.property.mortgageOutstanding;
                                   $scope.mortgageProvider = result.data.property.mortgageProvider;
                                   $scope.mortgageType = result.data.property.mortgageType;
                                   $scope.propertyType = result.data.property.propertyType;
                                   $scope.holdingType = result.data.property.holdingType;
                                   $scope.uel = result.data.property.propimageurl;
                                   var test = $scope.$root.movetoedit;
                                   if (test) {
                                       $scope.edit('Edit AST', test);
                                   }
                                   $scope.loaderbegin = false;
                               }
                           },
                           function (result) {
                               $scope.unsuccess = result;
                           });
                                }
                                else {
                                    $scope.loadereditrental = false;
                                    $scope.unsuccess = result.data.msg;
                                }
                            }, function (result) {
                                $scope.loadereditrental = false;
                                $scope.unsuccess = 'API Not responding' + result;
                            });
                    }
                }
            }
        };

        $scope.no = function () {
            $scope.tenentedit1 = !$scope.tenentedit1;
        };
        $scope.yes = function () {
            $http.post(api + 'tenant/' + $scope.deleteid)
          .then(function (result) {
              if (result.data.statusCode === 200) {
                  $scope.tenentedit1 = !$scope.tenentedit1;
                  $scope.$root.propid = $scope.propertyid;
                  getdata($scope.propertyid);

              }
              else {
                  $scope.unsuccess = result.data.msg;
              }
          }, function (result) {
              $scope.unsuccess = 'API Not responding' + result;
          });
        };
        $scope.removeproperty = function () {
            $http.post(api + 'propertys/' + $scope.propertyid)
          .then(function (result) {

              if (result.data.statusCode === 200) {
                  $location.path('viewportfolio');
              }
              else {
                  $scope.unsuccess = result.data.msg;
              }
          }, function (result) {
              $scope.unsuccess = 'API Not responding' + result;
          });
        };
        $scope.yesunit = function () {
            $http.post(api + 'tenantunit/' + $scope.deletedid)
            .then(function (result) {
                if (result.data.statusCode === 200) {
                    $scope.$root.propid = $scope.propertyid;
                    getdata($scope.propertyid);

                }
                else {
                    $scope.unsuccess = result.data.msg;
                }
            }, function (result) {
                $scope.unsuccess = 'API Not responding' + result;
            });

        };
        $scope.removedel = function removedel(index, num) {
            if (num === 1) {
                $scope.keyExpirydates.splice($scope.currindex, 1);
            }
            else {
                $scope.unit.tenantDocs.splice($scope.currindex, 1);
            }
        };
        $scope.opens = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.openeds = true;
        };
        $scope.open2 = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened2 = true;
        };
        $scope.openunit = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.openedunit = true;
        };
        $scope.openunitforend = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.openedunitforend = true;
        };
        $scope.open3 = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened3 = true;
        };
        $scope.savekeydirect = function (value) {
            if (value !== '' && value !== undefined) {
                $scope.data = { 'name': value, 'file': '' };
                $scope.keyExpirydates.push($scope.data);
                $scope.morespec1 = false;
                $scope.valueabove1 = '';
            }
        };
        $scope.savedata = function (value) {
            if (value !== '' && value !== undefined) {
                $scope.data1 = { 'name': value, 'file': '', type: 'doc' };
                $scope.propertyDocs.push($scope.data1);
                $scope.morespec = false;
                $scope.valueabove = '';
            }
        };
        $scope.savedatain = function (value) {

            if (value !== '' && value !== undefined) {
                $scope.mor = { 'name': value, 'file': '' };

                $scope.unit1.tenantDocs1.push($scope.mor);
                $scope.tenentedit = true;
                $scope.morespace = false;
                $scope.valuebelow = '';
            }
        };
        $scope.addyears = function (date, numberofyear) {
            if (date !== undefined && numberofyear !== undefined) {
                var date123 = new Date(date);
                $scope.newdate = date123.setFullYear(date123.getFullYear() + numberofyear);
                return $scope.newdate;
            }
        };
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

        function getdata(propid) {
            $http.get(api + 'property/' + propid)
               .then(function (result) {

                   if (result.data.statusCode === 200) {
                       $scope.address = result.data.property.address;
                       $scope.name = result.data.property.name;
                       $scope.purchaseAmount = result.data.property.purchaseAmount;
                       $scope.currentEstimate = result.data.property.currentEstimate;
                       $scope.prchaseDate = result.data.property.prchaseDate;
                       $scope.units = result.data.property.propertyUnits;
                       $scope.keyExpirydates = result.data.property.keyExpirydates;
                       var testgasdoc = false;
                       for (var i = 0; i < $scope.keyExpirydates.length; i++) {
                           if ($scope.keyExpirydates[i].name === 'Gas Safety Certificate') {
                               testgasdoc = true;
                           }
                       }
                       if (testgasdoc === false) {
                           $scope.data = { 'name': 'Gas Safety Certificate', 'file': '' };
                           $scope.keyExpirydates.push($scope.data);
                       }
                       $scope.propertyDocs = result.data.property.propertyDocs;
                       $scope.interestRate = result.data.property.interestRate;
                       $scope.mortgageEndDate = result.data.property.mortgageEndDate;
                       $scope.mortgagePayment = result.data.property.mortgagePayment;
                       $scope.mortgageStartDate = result.data.property.mortgageStartDate;
                       $scope.mortgageOutstanding = result.data.property.mortgageOutstanding;
                       $scope.mortgageProvider = result.data.property.mortgageProvider;
                       $scope.mortgageType = result.data.property.mortgageType;

                       $scope.propertyType = result.data.property.propertyTypeId;
                       $scope.holdingType = result.data.property.holdingType;
                       $scope.uel = result.data.property.propimageurl;
                       var test = $scope.$root.movetoedit;
                       if (test) {
                           $scope.edit('Edit AST', test);
                       }
                       for (var b = 0; b < $scope.propertyDocs.length; b++) {
                           if ($scope.propertyDocs[b].type === 'ast') {
                               $scope.showast = false;
                           }
                           if ($scope.propertyDocs[b].type === 'gas') {
                               $scope.showgas = false;
                           }
                       }
                       $scope.loaderbegin = false;
                   }
               },
               function (result) {
                   $scope.unsuccess = result;

               });
        }
    }

    dirparseupload.$inject = ['$parse'];
    function dirparseupload($parse) {
        return {
            restrict: 'A', //the directive can be used as an attribute only
            link: function (scope, element, attrs) {
                var model = $parse(attrs.demoFileModel),
                    modelSetter = model.assign; //define a setter for demoFileModel
                //Bind change event on the element
                element.bind('change', function () {
                    //Call apply on scope, it checks for value changes and reflect them on UI
                    scope.$apply(function () {
                        //set the model value
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
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

})();