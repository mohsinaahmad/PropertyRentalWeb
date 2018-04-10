
/* global paypal */
(function () {

    'use strict';
    angular.module('app.welcomepage', ['paypal-button'])
        .directive('tmplWelcomepage', directiveFunction)
        .controller('ControllerFunction', ControllerFunction);


    // ----- directiveFunction -----
    directiveFunction.$inject = [];
    uploadser.$inject = ['$http', '$scope'];
    function uploadser($http, $scope) {

        $scope.uploadFileToUrl = function (file, uploadUrl) {
            var fileFormData = new FormData();
            fileFormData.append('file', file);

            // var deffered = $q.defer();
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
            templateUrl: 'components/welcomepage/welcomepage.html',
            scope: {
            },
            controller: 'ControllerFunction',
            controllerAs: 'vm'
        };
        return directive;
    }


    // ----- ControllerFunction -----
    ControllerFunction.$inject = ['$scope', '$http', 'api', '$location', '$sce', '$window'];

    /* @ngInject */
    function ControllerFunction($scope, $http, api, $location, $sce, $window) {
        $scope.showhide = false;
        $scope.paypalpopup = false;
        $scope.loaderhide = false;
        $scope.over = false;

        var id = window.localStorage.userid;
        getPayments(id);
        $scope.misub = 0;
        tenantproperty(id);

        $scope.uploadFile = function (name, type) {
         
            $scope.showhide = false;
            $scope.loadershow = true;
            var myFiles = [];
            var myFilebill = [];
            myFiles = document.getElementById('myFileFields').files[0];
            myFilebill = document.getElementById('myFileFieldbill').files[0];
            var myFile = [];
            if (type === undefined) {
                myFile = document.getElementById('myFileField').files[0];
            }
            var file = [];
            if (type === 'passport') {
                file = myFiles;
            }
            else if (type === 'bill') {
                file = myFilebill;
            }
            else {
                file = myFile;
            }
            if (file == undefined) {
                $scope.loadershow = false;
            }
            else {
                var uploadUrl = 'upload'; //Url of web service
                var fileFormData = new FormData();
                fileFormData.append('file', file);
                $http.post(api + uploadUrl, fileFormData, {
                    headers: { 'Content-Type': undefined }
                })
                 .then(function (result) {
                     if (result.data.statusCode === 200) {
                        
                         for (var y = 0; y < $scope.docs.length; y++) {
                             if ($scope.docs[y].file === '') {
                                 $scope.docs.splice(y, 1);
                             }
                         }
                         if (type === 'passport') {
                             $scope.docs.push({ 'name': 'Passport', 'file': result.data.path, type: 'passport' });
                         }
                         else if (type === 'bill') {
                             $scope.docs.push({ 'name': 'Utility Bill', 'file': result.data.path, type: 'bill' });
                         }
                         else {
                             $scope.docs.push({ 'name': 'Others', 'file': result.data.path, type: 'myFile' });
                         }
                     }
                     var uid = window.localStorage.unitid;
                     $http.put(api + 'tenant/' + uid, {
                         'createdBy': $scope.createdBy,
                         'propertyId': $scope.propertyId,
                         'unitName': $scope.unitname,
                         'tenantDocs': $scope.docs,
                         'rent': $scope.rent,
                         'deposit': $scope.deposit,
                         'tenancyStartDate': $scope.tenancyStartDate,
                         'tenancyEndDate': $scope.tenancyEndDate,
                         'rentDueDate': $scope.rentDueDate
                     })
    .then(function (result) {

        if (result.data.statusCode === 200) {
            $scope.myFile = null;           
            document.getElementById('myFileFields').value = "";
            document.getElementById('myFileFieldbill').value = "";
            document.getElementById('myFileField').value = "";
            $scope.loaderhide = false;
            $scope.loadershow = false;
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
                 });
            }
        };

        $scope.remove = function remove() {
            $scope.tenantDocs.splice($scope.variremove, 1);
        };

        function tenantproperty(id) {

            $http.get(api + 'tenantproperty/' + id)
                 .then(function (result) {

                     $scope.propertytenantUnits = [];
                     $scope.unitname = result.data.propertyunits[0].unitName;
                     $scope.tenantid = result.data.propertyunits[0].tenantUserId;
                     $scope.propertytenantUnits = result.data.propertyunits[0];
                     $scope.propertyId = result.data.propertyunits[0].propertyId;
                     $scope.docs = result.data.propertyunits[0].tenantDocs;
                     $scope.rent = result.data.propertyunits[0].rent;
                     $scope.deposit = result.data.propertyunits[0].deposit;
                     $scope.rentDueDate = result.data.propertyunits[0].rentDueDate;
                     $scope.tenancyStartDate = result.data.propertyunits[0].tenancyStartDate;
                     $scope.tenancyEndDate = result.data.propertyunits[0].tenancyEndDate;
                     $scope.createdBy = result.data.propertyunits[0].createdBy;
                     if (result.data.propertyunits[0].property.propertyDocs.length > 0) {
                         $scope.propertyDocs = result.data.propertyunits[0].property.propertyDocs[0].file;
                     }
                     else {
                         $scope.propertyDocs = [];
                     }
                     window.localStorage.unitid = result.data.propertyunits[0].id;
                     $http.get(api + 'propertyCases/' + result.data.propertyunits[0].propertyId)
                              .then(function (result) {
                                  if (result.data.statusCode === 200) {
                                      $scope.propertyCases = result.data.propertycases;
                                  }
                              }, function (error) {
                                  $scope.unsuccess = error;
                              });
                 },
                 function (result) {
                     $scope.unsuccess = result;
                 });

        }
        $scope.getresponsestatus = function (todaydate) {
            var today = (new Date()).getDate();

            if (todaydate) {
                if (todaydate > today) {
                    var minus1 = todaydate - today;
                    if (minus1 <= 10) {
                        $scope.over = true;
                    }
                    return 'Due in ' + minus1 + ' Days';
                }
                else if (todaydate === today) {
                    return 'Today';
                }
                else {


                    var now = new Date();
                    var currmonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                    var minus = currmonth - today;
                    minus = minus + todaydate;
                    if (minus > 0) {
                        $scope.over = true;
                        return 'OverDue';
                    }
                    else if (minus === 0) {
                        return 'Due Today';
                    }
                    else {
                        $scope.over = false;
                        return 'Received';
                    }
                }
            }
        };


        $scope.getrespon = function (todaydate) {
            var today = (new Date()).getDate();
            if (todaydate) {
                var now = new Date();
                var currmonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                var minus = currmonth - today;

                minus = minus + todaydate;
                $scope.misub = minus;
                if (minus > 0) {
                    if (minus <= 10) {
                        $scope.over = true;
                    }
                    return 'Due in ' + minus + ' Days';
                }
                else if (minus === 0) {
                    return 'Due Today';
                }
                else {
                    $scope.over = false;
                    return 'Received';
                }
            }
        };


        $scope.currentm = function () {
            var now = new Date();
            var currmonth = now.getMonth() + 1;
            var curryear = now.getFullYear();
            return currmonth + '/' + curryear;
        };

        $scope.currentmnow = function () {
            var now = new Date();
            var currmonth = now.getMonth() + 2;
            var curryear = now.getFullYear();
            return currmonth + '/' + curryear;
        };

        $scope.savedata = function (value) {
            if (value !== '' && value !== undefined) {
                $scope.morr = { 'name': value, 'file': '' };
                $scope.docs.push($scope.morr);
                $scope.morespace = false;
                $scope.valueabove = '';
            }
        };

        $scope.openplease = function (url) {
            var substr = url.substring(url.length - 3);
            if (substr === 'doc' || substr === 'ocx') {
                $window.open(url, '_blank');
            }
            else {
                $scope.modalimage = true;
                $scope.fadinw = 'in';
                $scope.currenturl = $sce.trustAsResourceUrl(url);
            }
        };

        $scope.morespec = false;
        $scope.morespecname = function () {
            $scope.morespec = !$scope.morespec;
        };

        $scope.openpleasetenant = function (url) {
            if (url.length > 0 && url) {
                var substr = url.substring(url.length - 3);
                if (substr === 'doc' || substr === 'ocx') {
                    $window.open(url, '_blank');
                }
                else {
                    $scope.modalimages = true;
                    $scope.fadinwnn = 'in';
                    $scope.currenturl = $sce.trustAsResourceUrl(url);
                }
            }
        };

        $scope.closeclsthisapp = function () {
            $scope.modalimages = false;
            $scope.fadinwnn = '';
        };

        function getPayments(tenantId) {
            $http.get(api + 'payments/' + tenantId)
                       .then(function (result) {

                           if (result.data.statusCode === 200) {
                               $scope.payments = result.data.payments;
                           }
                       }, function (result) {

                           $scope.unsuccess = result;
                       });
        }

        $scope.closeclsthis = function () {
            $scope.modalimage = false;
            $scope.fadinw = '';
        };
        $scope.opts = {
            env: 'sandbox',
            client: {
                sandbox: 'AUv9EYUZB5twjkwjpltJV1L6nuTHgUJDftpwhVTugSX9ucJxLhDceFiT1qALTCvC7NQc_F2MLaRNFsrG',
                production: ''
            },
            payment: function () {
                var env = this.props.env;
                var client = this.props.client;
                return paypal.rest.payment.create(env, client, {
                    transactions: [
                        {
                            amount: { total: $scope.propertytenantUnits.rent, currency: 'GBP' }
                        }
                    ]
                });
            },
            commit: true, // Optional: show a 'Pay Now' button in the checkout flow
            onAuthorize: function (data, actions) {
                // Optional: display a confirmation page here
                return actions.payment.execute().then(function () {
                    // Show a success page to the buyer
                    $http.post(api + 'payment', {
                        'transationId': data.paymentID,
                        'propertyId': $scope.propertyId,
                        'propertyName': $scope.propertytenantUnits.property.name,
                        'unitId': $scope.propertytenantUnits.id,
                        'unitName': $scope.unitname,
                        'tenantId': $scope.tenantid,
                        'tenantName': window.localStorage.fullname,
                        'landlordId': $scope.propertytenantUnits.createdBy,
                        'landlordName': '',
                        'amount': $scope.propertytenantUnits.rent,
                        'transationDate': new Date(),
                        'createdBy': window.localStorage.fullname,
                        'updatedBy': window.localStorage.fullname
                    })
  .then(function (result) {
      if (result.data.statusCode === 200) {
          $scope.paypalpopup = true;
          var id = window.localStorage.userid;
          tenantproperty(id);
          getPayments(id);
      }
  },
      function (result) {
          $scope.unsuccess = 'API Not responding' + result;
      });
                });
            }
        };

        $scope.ok = function () {
            $scope.paypalpopup = false;
        };

        $scope.Propertygo = function (id) {
            $scope.$root.propertyidgo = id;
            $scope.$root.checktenantlandlord = 'Tenant';
            $location.path('createcase/' + id);
        };
    }
})();