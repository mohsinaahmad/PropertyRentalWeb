(function () {

    'use strict';
    angular.module('app.createcase')
        .directive('tmplCreatecase', directiveFunction)
        .controller('CreateCaseController', ControllerFunction);


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
            templateUrl: 'components/createcase/createcase.html',
            scope: {
            },
            controller: 'CreateCaseController',
            controllerAs: 'vm'
        };
        return directive;
    }

    // ----- ControllerFunction -----
    ControllerFunction.$inject = ['$scope', '$location', '$http', 'api','$stateParams','$sce','$window'];

    /* @ngInject */

    function ControllerFunction($scope, $location, $http, api, $stateParams, $sce, $window) {
        $scope.loadershow = false;
        var role = window.localStorage.role;
        var propertyid = $scope.$root.propertyidgo;
        var cute = $scope.$root.checktenantlandlord;
        $scope.onlylord = cute;
        var proid = window.localStorage.propertyId;
        if (!proid)
        {
            proid = propertyid;
        }
        if ($stateParams.propertyId) {
            proid = $stateParams.propertyId;
        }
        (function(){ 
            $http.get(api + 'issuesummaries')
            .then(function (result) {              
                if (result.data.statusCode === 200) {
                   
                     $scope.issusummaries=result.data.issuesummaries;
                  }
                  else {
                      $scope.unsuccess = result.data.msg;
                  }
            });
        })();

         (function(){         
            $http.get(api + 'property/'+proid)
            .then(function (result) {
               
                  if (result.data.statusCode === 200) {
                      $scope.propertyunits = result.data.property.propertyUnits;
                      $scope.tenantUser = result.data.property.propertyUnits[0].firstName;
                      $scope.tenantUserId = result.data.property.propertyUnits[0].tenantUserId;
                  }
                  else {
                      $scope.unsuccess = result.data.msg;
                  }
            });
        })();
        
         $scope.uploadFile = function (name) {
             $scope.loadershow = true;
             var file = document.getElementById('myFileField').files[0];
             var uploadUrl = 'upload'; //Url of web service
             var fileFormData = new FormData();
             fileFormData.append('file', file);

             $http.post(api + uploadUrl, fileFormData, {
                 headers: { 'Content-Type': undefined }
             })
              .then(function (result) {               
                  if (result.data.statusCode === 200) {
                      $scope.loadershow = false;
                      for (var y = 0; y < $scope.caseDocs.length; y++) {
                          if ($scope.caseDocs[y].file === '') {
                              $scope.caseDocs.splice(y, 1);
                          }
                      }
                      $scope.caseDocs.push({ 'name': name, 'file': result.data.path });
                      $scope.case.name = '';
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

         $scope.openplease = function (url) {
             if (url) {
                 var substr = url.substring(url.length - 3);
                 if (substr === 'doc' || substr === 'ocx') {
                     $window.open(url, '_blank');
                 }
                 else {
                     $scope.modalimage = true;
                     $scope.fadinw = 'in';
                     $scope.currenturl = $sce.trustAsResourceUrl(url);
                 }
             }
         };

         $scope.closeclsthis = function () {
             $scope.modalimage = false;
             $scope.fadinw = '';
         };

         $scope.gotodash = function () {          
             if (cute === 'Tenant') {
                 $location.path('welcomepage');
             }
             else {
                 $location.path('dashboard');
             }
         };
        
         $scope.vbg = function (bg) { 
             $scope.tenantUser = bg;
         };

         $scope.savecase = function () {
             $scope.loadershow = true;   
            if ($scope.caseDocs === undefined) {
                $scope.caseDocs = null;
            }
            var userid = window.localStorage.userid;            
            if (role !== 'Landlord') {
                role = 'Tenant';
            }

            var issuesummary = $scope.issuesummary.split('/');  
            if (!$scope.tenantUser) {              
                $scope.tenantUser = userid;
            }
          
             $http.post(api + 'propertycase', {                 
                 'createdBy': window.localStorage.userid,                
                 'tenantId': $scope.tenantUserId,
                 'propertyId': proid,
                 'issuesummaryId': $scope.issusummaries[0].id,
                 'issuesummaryName': $scope.issusummaries[0].name,
                'createdByname': window.localStorage.fullname,
                'caseDetail': $scope.caseDetail,
                'createdByrole': role,
                'caseDocs': $scope.caseDocs
            })
              .then(function (result) {
                  $scope.loadershow = false;
                  if (result.data.statusCode === 200) {
                      if (role === 'Tenant') {
                          $location.path('welcomepage');
                      }
                      else{
                      $location.path('managetenants');
                  }
                  }
                  else {
                      $scope.loadershow = false;
                      $scope.unsuccess = result.data.msg;
                  }

              }, function (result) {
                  $scope.loadershow = false;
                  $scope.unsuccess = 'API Not responding' + result;
              });
        };
      
         $scope.cancelcase = function () {
             if (role === 'Tenant') {
                 $location.path('welcomepage');
             }
             else {
                 $location.path('managetenants');
             }
         };

        $scope.upcase = false;
        $scope.uploadcase = function () {
            $scope.upcase = !$scope.upcase;
        };

        $scope.remove = function remove(index) {
            $scope.caseDocs.splice(index, 1);
        };
   
        $scope.caseDocs = [];
        $scope.savedata = function (value) {         
            if (value !== '' && value !== undefined) {
                $scope.data = { 'name': value, 'file': '' };
                $scope.caseDocs.push($scope.data);
                $scope.upcase = false;
                $scope.upcasevalue = '';
            }
        };
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