(function () {

    'use strict';
    angular.module('app.editcase')
        .directive('tmplEditcase', directiveFunction)
        .controller('EditCaseController', ControllerFunction);


    // ----- directiveFunction -----
    directiveFunction.$inject = [];

    /* @ngInject */
    function directiveFunction() {
        var directive = {
            restrict: 'E',
            templateUrl: 'components/editcase/editcase.html',
            scope: {
            },
            controller: 'EditCaseController',
            controllerAs: 'vm'
        };
        return directive;
    }

    // ----- ControllerFunction -----
    ControllerFunction.$inject = ['$scope', '$location', '$http', 'api','$stateParams','$window','$sce'];

    /* @ngInject */
    function ControllerFunction($scope, $location, $http, api, $stateParams, $window, $sce) {
        $scope.loadershow = false;
      
        var role = window.localStorage.role;
               var caseId=$stateParams.caseId;
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
                 $scope.loadershow = false;
                 if (result.data.statusCode === 200) {
                     for (var y = 0; y < $scope.propertycase.caseDocs.length; y++) {
                         if ($scope.propertycase.caseDocs[y].file === '') {
                             $scope.propertycase.caseDocs.splice(y, 1);
                         }
                     }
                     $scope.propertycase.caseDocs.push({ 'name': name, 'file': result.data.path });
                     $scope.doc.name = '';
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


// get case by id
        (function(){        
            $http.get(api + 'propertyCase/'+caseId)
            .then(function (result) {
                  if (result.data.statusCode === 200) {
                     $scope.propertycase=result.data.propertycase;
                      $scope.status=result.data.propertycase.status;
                     $scope.tenantUser=result.data.propertycase.tenantId;                    
                     $scope.propertyId=result.data.propertycase.propertyId;
                     $scope.caseDetail = result.data.propertycase.caseDetail;
                     $scope.issuesummary = result.data.propertycase.issuesummaryId + '/' + result.data.propertycase.issuesummaryName;
                  }
                  else {
                      $scope.unsuccess = result.data.msg;
                  }
            });
        })();

       
        if (role !== 'Landlord') {
            role = 'Tenant';
        }
        $scope.editcase = function () {
            $scope.loadershow = true;
            if ($scope.propertycase.caseDocs === undefined) {
                $scope.propertycase.caseDocs = null;
            }
            var userid = window.localStorage.userid;
            var createdByname = window.localStorage.fullname;
            var issuesummary = [];
            if ($scope.issuesummary) {
               issuesummary = $scope.issuesummary.split('/');
            }
            else {
                issuesummary[0] = '';
                issuesummary[1] = '';
            }
           
            $http.put(api + 'propertycase', {
                'caseId':caseId,
                'createdBy': userid,
                'tenantId': $scope.tenantUser,
                'propertyId': $scope.propertyId,
                'issuesummaryId': issuesummary[0],
                'issuesummaryName': issuesummary[1],
                'createdByname': createdByname,
                'caseDetail': $scope.caseDetail,
                'status': $scope.status,
                'caseDocs': $scope.propertycase.caseDocs
            })
              .then(function (result) {
                  $scope.loadershow = false;
                  if (result.data.statusCode === 200) {
                      if (role === 'Tenant') {
                          $location.path('welcomepage');
                      }
                      else {
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
        
        $scope.upeditcase = false;
        $scope.uploadeditcase = function () {
            $scope.upeditcase = !$scope.upeditcase;
        };

        $scope.remove = function remove(index) {
            $scope.caseDocs.splice(index, 1);
        };
    
        $scope.savedata = function (value) {
            if (value !== '' && value !== undefined) {
                $scope.data = { 'name': value, 'file': '' };
                $scope.propertycase.caseDocs.push($scope.data);
                $scope.upeditcase = false;
                $scope.upeditcasevalue = '';
            }
        };

        $scope.openplease = function (url) {
            $scope.modalimage = false;
            $scope.fadinw = '';
            var substr = url.substring(url.length - 3);
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

        $scope.closeclsthis = function () {
            $scope.modalimage = false;
            $scope.fadinw = '';
        };

        $scope.removeFadeIn = function () {
            $scope.modalimage = false;
            $scope.fadinw = '';

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



        $scope.cancelcase = function () {
            if (role === 'Tenant') {
                $location.path('welcomepage');
            }
            else {
                $location.path('managetenants');
            }
        };            
    }
})();