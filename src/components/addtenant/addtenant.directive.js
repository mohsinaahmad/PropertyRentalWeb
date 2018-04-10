(function () {

    'use strict';
    angular.module('app.addtenant')
         
        .directive('tmplAddtenant', directiveFunction)
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

        .service('fileUploadService', uploadser)

        .controller('AddTenantController', AddTenantControllerFunction);
     

    // ----- directiveFunction -----
    directiveFunction.$inject = [];
    uploadser.$inject = ['$http','$scope'];
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
            templateUrl: 'components/addtenant/addtenant.html',
            scope: {
            },
            controller: 'AddTenantController',
            controllerAs: 'vm'
        };
        return directive;
    }

    // ----- ControllerFunction -----
    AddTenantControllerFunction.$inject = ['$scope', '$http', 'api', '$location'];

    /* @ngInject */
    function AddTenantControllerFunction($scope, $http, api, $location) {
       
        $scope.loaderhide = false;
        $scope.simplextenant = false;
        var userid = window.localStorage.userid;
        $scope.arent = window.localStorage.rent;
        
        $scope.maxDate = new Date();
        $scope.arent = parseInt($scope.arent,10);
        $scope.sdate = window.localStorage.tenancyStartDate;
        $scope.edate = window.localStorage.tenancyEndDate;
        if ($scope.edate === 'null' || $scope.edate === 'undefined') {
            $scope.edate = '';
        }
        if ($scope.sdate === 'null' || $scope.sdate === 'undefined') {
            $scope.sdate = '';
        }
        if ($scope.arent === 'null') {
            $scope.arent = '';
        }
        var role = window.localStorage.role;
        if (!userid || role !== 'Landlord') {
            $location.path('login');
        }
        $scope.unitid = $scope.$root.propid;

        $scope.uploadFile = function (name) {
            $scope.loaderhide = true;
            var file = document.getElementById('myFileField').files[0];
            var uploadUrl = 'upload';
            var fileFormData = new FormData();
            fileFormData.append('file', file);

            $http.post(api + uploadUrl, fileFormData, {
                headers: { 'Content-Type': undefined }
            })
             .then(function (result) {
                 if (result.data.statusCode === 200) {
                     $scope.loaderhide = false;
                     for (var y = 0; y < $scope.tenantDocs.length; y++) {
                         if ($scope.tenantDocs[y].file === '') {
                             $scope.tenantDocs.splice(y, 1);
                         }
                     }
                     $scope.tenantDocs.push({ 'name': name, 'file': result.data.path });
                 }
                 else {
                     $scope.loaderhide = false;
                     $scope.unsuccess = result.data.msg;
                 }

             }, function (result) {
                 $scope.loaderhide = false;
                 $scope.unsuccess = 'API Not responding' + result;
             });
        };

        $scope.tenantDocs = [];
        if ($scope.unitid !== undefined) {

            $http.get(api + 'propertyUnits/' + window.localStorage.propertyId)
               .then(function (result) {
                   
                   if (result.data.statusCode === 200) {

                       $scope.data = result.data.propertyunits;
                       $scope.selectedunit = window.localStorage.unitid;
                       $scope.selectedunitorg = window.localStorage.unitid;
                   }
               },
               function (result) {
                   $scope.unsuccess = result;

               });
            $scope.openaddunit = false;
            $scope.open = function () {
                $scope.openaddunit = !$scope.openaddunit;
            };
           
            $scope.remove = function remove() {
                $scope.tenantDocs.splice($scope.variremove, 1);
            };
            $scope.number = 31;
            $scope.getNumber = function (num) {
                return new Array(num);
            };
            $scope.removeast = function (index) {
                $scope.variremove = index;
            };
            $scope.morespec = false;
            $scope.morespecname = function () {
                $scope.morespec = !$scope.morespec;
            };
            $scope.savetenant = function (form) {
              
                if (form.$invalid) {
                    $scope.changeed = true;
                }
                else {
                    if (!angular.isObject($scope.edate)) {
                        var parts = $scope.edate.split('/');
                        $scope.edate = new Date(parts[2], parts[1] - 1, parts[0]);
                    }

                    if (!angular.isObject($scope.sdate)) {
                        var part = $scope.sdate.split('/');
                        $scope.sdate = new Date(part[2], part[1] - 1, part[0]);
                    }

                    $scope.loadershow = true;
                    if ($scope.tenantDocs === undefined) {
                        $scope.tenantDocs = null;
                    }

                    var savea = $scope.Name.split(' ');
                    var userid = window.localStorage.userid;
                    var unitid = window.localStorage.unitid;
                    var proid = window.localStorage.propertyId;
                    var isVacant = true;
                    if ($scope.sdate && $scope.edate) {
                        isVacant = false;
                    }
                  
                    $http.post(api + 'tenant', {
                        'createdBy': userid,
                        'unitId': unitid,
                        'propertyId': proid,
                        'contactNum': $scope.Phone,
                        'firstName': savea[0],
                        'lastName': savea[1],
                        'email': $scope.Email,
                        'tenancyEndDate': $scope.edate,
                        'tenancyStartDate': $scope.sdate,
                        'deposit': $scope.deposit,
                        'rentDueDate': $scope.rentDueDate,
                        'bankSortCode': $scope.scode,
                        'tenantBank': $scope.bank,
                        'tenantDocs': $scope.tenantDocs,
                        'rent': $scope.arent,
                        'isVacant':isVacant,
                        'bankAccountNumber': $scope.accnum
                    })
                      .then(function (result) {
                        
                          if (result.data.statusCode === 200) {
                              $scope.loadershow = false;
                              $location.path('editproperty');
                          }
                          else {
                            
                              $scope.loadershow = false;
                              $scope.unsuccess = result.data.msg;
                          }

                      }, function (result) {
                          $scope.loadershow = false;
                          $scope.unsuccess = 'API Not responding' + result;
                      });
                }
            };

            $scope.canceltenant = function () {
                $location.path('editproperty');
            };
          
            $scope.daytentstart = function () {
                if ($scope.sdate && $scope.edate){
                    var date2 = new Date($scope.sdate);
                var date1 = new Date($scope.edate);
               
                var timeDiff = date1.getTime() - date2.getTime();
                $scope.dayDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));
                if ($scope.dayDifference <= 0) {
                    $scope.startfuture = 1;
                }
                else {
                    $scope.startfuture = 0;
                }
            }
            };
           
            $scope.daytccentstart = function () {
                if ($scope.sdate && $scope.edate) {
                    var date2 = new Date($scope.sdate);
                    var date1 = new Date($scope.edate);
                   
                    var timeDiff = date2.getTime() - date1.getTime();
                    $scope.dayDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    if ($scope.dayDifference >= 0) {
                        $scope.futureend = 1;
                    }
                    else {
                        $scope.futureend = 0;
                    }
                }
            };

            $scope.open = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.opened = true;
            };
            $scope.cal = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.opened1 = true;
            };
            $scope.open2 = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.opened2 = true;
            };

            $scope.cccc = function (wa) {
                if (wa === window.localStorage.unitid) {
                    $scope.schnge = '';
               $scope.simplextenant = false;
             
                }
                else {
                    $scope.simplextenant = true;
                    $scope.schnge = 'in poptent';
                }
            };
            $scope.nosimple = function () {
                $scope.schnge = '';
                $scope.simplextenant = false;
            };

            $scope.dateOptions = {
                formatYear: 'yyyy',
                showWeeks: false,
                startingDay: 1
            };
            $scope.todaysdate = new Date();

            $scope.formats = ['dd/MM/yyyy'];
            $scope.format = $scope.formats[0];

            $scope.savedata = function (value) {
                if (value !== '' && value !== undefined) {
                    $scope.morr = { 'name': value, 'file': '' };
                    $scope.tenantDocs.push($scope.morr);
                    $scope.morespace = false;
                    $scope.valueabove = '';
                }
            };

            $scope.addyears = function (date, numberofyear) {
                if (date !== undefined && numberofyear !== undefined) {
                    var date123 = new Date(date);
                    $scope.newdate = date123.setFullYear(date123.getFullYear() + numberofyear);
                    return $scope.newdate;
                }
            };
        }
        else {
            $location.path('viewportfolio');
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

})();