/*global $*/
(function () {

    'use strict';

    angular.module('app.dashboard')
        .directive('tmplDashboard', directiveFunction)
        .directive('webTicker', [function () {
            return {
                restrict: 'A',
                link: function () {

                    setTimeout(function () { $('.table_datepicker th[colspan=6]').attr('colspan', 5); }, 1000);

                }
            };
        }])
        .controller('DashboardController', ControllerFunction)
        .filter('myfilter', filterfunction);


    filterfunction.$inject = ['$filter'];

    /* @ngInject */
    function filterfunction($filter) {

        return function (items, from) {
            if (from) {
                var arrayToReturn = [];
                for (var i = 0; i < items.length; i++) {
                    var dd = $filter('date')(from, 'dd/MM/yyyy');
                    var dd1 = $filter('date')(items[i].scheduleDate, 'dd/MM/yyyy');
                    if (dd1 === dd) {
                        arrayToReturn.push(items[i]);
                    }
                }
                return arrayToReturn;
            }
        };
    }


    // ----- directiveFunction -----
    directiveFunction.$inject = [];

    /* @ngInject */
    function directiveFunction() {

        var directive = {
            restrict: 'E',
            templateUrl: 'components/dashboard/dashboard.html',
            scope: {
            },
            controller: 'DashboardController',
            controllerAs: 'vm'
        };

        return directive;
    }


    // ----- ControllerFunction -----
    ControllerFunction.$inject = ['$http', 'api', 'rssfeed', '$location', '$window', '$filter'];

    /* @ngInject */
    function ControllerFunction($http, api, rssfeed, $location, $window, $filter) {
       
        var vm = this;
        vm.propertyCases = [];
        gettenant();
        vm.filtered = {};
        vm.tempfiltered = {};
        vm.loadershow = false;
        vm.loaderyearly = false;
        var userid = window.localStorage.userid;

        var role = window.localStorage.role;
        if (!userid && role !== 'Landlord') {
            $location.path('login');
        }
        vm.property = undefined;

        //get all properties
        (function () {
            
            $http.get(api + 'properties/' + userid)
                          .then(function (result) {
                              if (result.data.statusCode === 200) {
                                 
                                  vm.properties = result.data.properties;
                                  if (vm.properties.length > 0) {
                                      vm.selectproperty(result.data.properties[0].id, 'year');
                                      vm.alertmessageobj = [];

                                      for (var m = 0; m < vm.properties.length; m++) {
                                          /**Start inner loop*/
                                          var date = new Date();
                                          date.setDate(date.getDate() - 30);
                                          var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                                          for (var k = 0; k < vm.properties[m].keyExpirydates.length; k++) {
                                              if (vm.properties[m].keyExpirydates[k].name.includes('Gas') || vm.properties[m].keyExpirydates[k].name.includes('Gas Safety Certificate')) {
                                                  var firstDate = new Date();
                                                  var secondDate = new Date(vm.properties[m].keyExpirydates[k].value);

                                                  var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
                                                  if (!vm.properties[m].keyExpirydates[k].value) {
                                                      diffDays = 0;
                                                  }
                                                  var alertMsg =
                                                 {
                                                     message: "Alert for Gas Safety Certificate due " + vm.properties[m].name + ", Gas Safety Certificate is due in  " + diffDays + " days.",
                                                     expiredOn: vm.properties[m].keyExpirydates
                                                 };
                                                  if (diffDays !== 0) {
                                                      vm.alertmessageobj.push({ alertMsg: alertMsg, propid: vm.properties[m].id });
                                                  }
                                              }
                                          }
                                          /**End inner loop*/

                                          if (vm.properties[m].mortgageEndDate) {

                                              var firstDate1 = new Date();
                                              var secondDate1 = new Date(vm.properties[m].mortgageEndDate);
                                              var diffDays1 = Math.round(Math.abs((firstDate1.getTime() - secondDate1.getTime()) / (oneDay)));
                                              var alertMsg1 =
                                              {
                                                  message: "For property " + vm.properties[m].name + ", mortgage is due for renewal in  " + diffDays1 + " days.",
                                                  expiredOn: vm.properties[m].mortgageEndDate
                                              };
                                              vm.alertmessageobj.push({ alertMsg: alertMsg1, propid: vm.properties[m].id });
                                          }

                                          /****/
                                          for (var j = 0; j < vm.properties[m].propertyUnits.length; j++) {
                                              if (vm.properties[m].propertyUnits[j].isDeleted === false) {

                                                  var dateAsString = $filter('date')(vm.properties[m].propertyUnits[j].tenancyEndDate, "dd-MM-yyyy");
                                                  if (vm.properties[m].propertyUnits[j].tenantUserId) {
                                                      var alertMsg2 =
                                                      {

                                                          message: "For property " + vm.properties[m].name + "(unit " + vm.properties[m].propertyUnits[j].unitName + "), the tenancy is ending on " + dateAsString + " date, you need to find new tenants.",
                                                          expiredOn: vm.properties[m].propertyUnits[j].tenancyEndDate
                                                      };
                                                      vm.alertmessageobj.push({ alertMsg: alertMsg2, propid: vm.properties[m].id });
                                                  }
                                                  if (vm.properties[m].propertyUnits[j].rentDueDate) {
                                                      var firstDate2 = new Date();
                                                      var secondDate2 = new Date(vm.properties[m].propertyUnits[j].rentDueDate);
                                                      var diffDays2 = Math.round(Math.abs((firstDate2.getTime() - secondDate2.getTime()) / (oneDay)));
                                                      var alertMsg3 =
                                                      {
                                                          message: "For property " + vm.properties[m].name + " rent is overdue by " + diffDays2 + " days.",
                                                          color: 'red',
                                                          expiredOn: vm.properties[m].propertyUnits[j].rentDueDate
                                                      };
                                                      vm.alertmessageobj.push({ alertMsg: alertMsg3, propid: vm.properties[m].id });
                                                  }
                                              }
                                          }

                                      }
                                  }
                                  console.log(vm.alertmessageobj);
                                  if (vm.properties.length > 0) {
                                      vm.getproperty(vm.properties[0].id);
                                  }
                              }
                          }, function (result) {
                              vm.unsuccess = result;
                          });
        })();

        (function () {
         
            $http.get(api + 'payment/' + userid)
                          .then(function (result) {
                              if (result.data.statusCode === 200) {
                                  vm.payments = result.data.payments;
                              }
                          }, function (result) {
                              vm.unsuccess = result;
                          });
        })();

        function monthDiff(d1, d2) {
            var year1 = d1.getFullYear();
            var year2 = d2.getFullYear();
            var month1 = d1.getMonth();
            var month2 = d2.getMonth();
            if (month1 === 0) { //Have to take into account
                month1++;
                month2++;
            }
            var month_Diff = (((year2 - year1) * 12 + (month2 - month1)) + 1);
            return month_Diff;
        }

        /*Select on dropdown for bar chat*/
        vm.selectproperty = function (propertyId, type) {

            if (propertyId === '') {
                document.getElementById('test').innerHTML = '&nbsp';
                vm.startyear = '';
                vm.startmonth = '';
            }
            if (type === 'month') {
                vm.startmonth = 'Active';
                vm.startyear = '';
            }
            else {
                vm.startmonth = '';
                if (propertyId === '') {
                    vm.startyear = '';
                }
                else {
                    vm.startyear = 'Active';
                }
            }

            vm.loaderyearly = true;
            if (propertyId) {

                //Get API service to get payment done by this property
                $http.get(api + '/paymentproperties/' + propertyId)
                              .then(function (result) {
                                  document.getElementById('test').innerHTML = '&nbsp';
                                  document.getElementById('test').innerHTML = '<canvas id="chart"></canvas>';
                                  var ctx = document.getElementById('chart').getContext('2d');

                                  vm.labels = [];
                                  vm.paid = [];
                                  vm.due = [];
                                  for (var i = 0; i < vm.properties.length; i++) {
                                      if (vm.properties[i].id === propertyId) {
                                          for (var j = 0; j < vm.properties[i].propertyUnits.length; j++) {
                                              var sum = 0;
                                              if (vm.properties[i].propertyUnits[j].unitName) {
                                                  vm.labels.push(vm.properties[i].propertyUnits[j].unitName);
                                              }
                                              else {
                                                  vm.labels.push('Unit');
                                              }
                                              if (vm.properties[i].propertyUnits[j].tenancyStartDate) {
                                                  var d1 = new Date(vm.properties[i].propertyUnits[j].tenancyStartDate);
                                                  var d2 = new Date(vm.properties[i].propertyUnits[j].tenancyEndDate);
                                                  var diffrence = monthDiff(d1, d2);
                                                  if (diffrence > 11) {
                                                      diffrence = 12;
                                                  }
                                                  if (type === 'month') {
                                                      diffrence = 1;
                                                  }

                                                  var total = diffrence * vm.properties[i].propertyUnits[j].rent;
                                                  for (var k = 0; k < result.data.payments.length; k++) {
                                                      if (vm.properties[i].propertyUnits[j].id ===
                                                          result.data.payments[k].unitId) {
                                                          sum = sum + result.data.payments[k].amount;
                                                      }
                                                  }
                                                  vm.paid.push(sum);
                                                  vm.due.push(total - sum);
                                              }
                                              else {
                                                  vm.paid.push(0);
                                                  vm.due.push(0);
                                              }
                                          }
                                      }
                                  }
                                  vm.avc = 'Due on x date';
                                  var myChart = new Chart(ctx, {
                                      type: 'bar',
                                      data: {
                                          labels: vm.labels,
                                          datasets: [
                                            {
                                                label: 'Paid',
                                                data: vm.paid,
                                                backgroundColor: '#8064a2'
                                            },
                                            {
                                                label: 'Overdue',
                                                data: vm.due,
                                                backgroundColor: '#f79646'
                                            }
                                          ]

                                      },
                                      options: {
                                          scales: {
                                              xAxes: [{ stacked: true }],
                                              yAxes: [{ stacked: true, ticks: { min: 0 } }]
                                          }
                                      }
                                  });
                                  vm.loaderyearly = false;
                              }, function (result) {
                                  vm.loaderyearly = false;
                                  vm.unsuccess = result;
                              });
            }
            else {
                vm.loaderyearly = false;
            }
        };

        vm.title = '';
        vm.scheduleDate = '';

        // get schedule events
        scheduleevents();
        function scheduleevents() {

            $http.get(api + 'schedules/' + userid)
             .then(function (result) {
                 if (result.data.statusCode === 200) {
                     vm.filtered = result.data.schedules;
                     vm.tempfiltered = vm.filtered;
                     vm.selectedDates = [];
                     for (var k = 0; k < vm.filtered.length; k++) {
                         vm.selectedDates.push(new Date(vm.filtered[k].scheduleDate).setHours(0, 0, 0, 0));
                     }
                 }
             }, function (result) {
                 vm.unsuccess = result;
             });
        }

        vm.deleteschedule = function (id) {
            vm.deleteid = id;
            vm.deleteschedule1 = !vm.deleteschedule1;
        };

        vm.no = function () {
            vm.deleteschedule1 = !vm.deleteschedule1;
        };

        // delete schedule
        vm.yes = function () {
            $http.post(api + 'schedule/' + vm.deleteid)
          .then(function (result) {
              if (result.data.statusCode === 200) {
                  vm.deleteschedule1 = !vm.deleteschedule1;
                  scheduleevents();
              }
              else {
                  vm.unsuccess = result.data.msg;
              }
          }, function (result) {
              vm.unsuccess = 'API Not responding' + result;
          });

        };

        vm.scheduleEvents = [];

        // save schedule event
        vm.saveschedule = function () {
             $("#addeventModal").modal('hide');
            vm.loadershow = true;
            var userid = window.localStorage.userid;
            $http.post(api + 'schedule', {
                'createdBy': userid,
                'title': vm.title,
                'scheduleDate': vm.scheduleDate
            })
              .then(function (result) {
                  vm.loadershow = false;
                  if (result.data.statusCode === 200) {
                      vm.title = '';
                      vm.scheduleDate = new Date();
                      vm.proprtylist = '';
                      vm.tenantlist = '';
                      scheduleevents();
                  }
                  else {
                      vm.unsuccess = result.data.msg;
                  }
              }, function (result) {
                  vm.loadershow = false;
                  vm.unsuccess = 'API Not responding' + result;
              });
        };

        vm.currentm = function () {
            var now = new Date();
            var currmonth = now.getMonth() + 1;
            var curryear = now.getFullYear();
            return currmonth + '/' + curryear;
        };

        // get news/blog alerts
        vm.init = function () {
            $http.get(api + 'propertynews')
                .then(function (data) {
                    vm.entries = data.data.articles;
                },
                 function (result) {
                     vm.unsuccess = 'ERROR:' + result;
                 });
        };

        function gettenant() {
            $http.get(api + 'property/' + window.localStorage.userid)
                .then(function (data) {
                },
                 function (result) {
                     vm.unsuccess = 'ERROR:' + result;
                 });
        }

        vm.gettenat = function () {
            var id = vm.proprtylist;
            for (var t = 0; t < vm.properties.length; t++) {
                if (vm.properties[t].id == id) {
                    vm.allteants = vm.properties[t].propertyUnits;
                }
            }
        };


        vm.todaydate = new Date();
        vm.daydiffmortge = function (endate) {
            var date2 = new Date();
            var date1 = new Date(endate);
            var timeDiff = date2.getTime() - date1.getTime();
            vm.dayDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));
            if (vm.dayDifference <= 0) {
                vm.futuremordateerror = 1;
            }
            else {
                vm.futuremordateerror = 0;
            }
        };


        vm.open = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            vm.opened = true;
        };

        vm.getproperty = function (id) {
            var userid = window.localStorage.userid;
            vm.userid = userid;
            $http.get(api + 'properties/' + userid)
             .then(function (result) {
                 if (result.data.statusCode === 200) {
                     vm.property = result.data.properties;
                     vm.property.currentDate = new Date();
                     $http.get(api + 'propertyCasesAll')
                            .then(function (result) {
                                if (result.data.statusCode === 200) {
                                    for (var j = 0; j < result.data.propertycases.length; j++) {
                                        vm.propertyCases.push(result.data.propertycases[j]);
                                    }
                                }
                            },
                            function (result) {
                                vm.unsuccess = result;
                            });
                 }
             }, function (result) {
                 vm.unsuccess = result;
             });
        };

        vm.no = function () {
            vm.tenentedit1 = !vm.eyeclose;
        };

        vm.alertmsg = function (msg) {
            vm.msgget = msg;
        };
        vm.nocal = function () {
            vm.calmssg = !vm.eyeclosecal;
        };

        vm.daydiffendmortge = function (endate) {
            
            var date2 = new Date();
            var date1 = new Date(endate);
            var timeDiff = date2.getTime() - date1.getTime();
            vm.dayDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));
            if (vm.dayDifference >= 0) {
                vm.futurendemordateerror = 1;
            }
            else {
                vm.futurendemordateerror = 0;
            }
        };

        vm.alertmsgcal = function (msgg) {
            vm.currenttitle = msgg;
        };

        vm.filterResults = function (dt) {
            vm.currentfilter = vm.selectedDates[0];
            vm.tempfiltered = [];
            var alignFillDate = $filter('date')(new Date(vm.activeDate), 'yyyy-MM-dd');
            for (var q = 0; q < vm.filtered.length; q++) {
                var tempvar = $filter('date')(new Date(vm.filtered[q].scheduleDate), 'yyyy-MM-dd');
                if (tempvar == alignFillDate) {
                    vm.tempfiltered.push(vm.filtered[q]);
                }                
            }        
        };

        vm.dateOptions = {
            formatYear: 'yyyy',
            showWeeks: false,
            startingDay: 1
        };
        vm.todaysdate = new Date();

        vm.formats = ['dd/MM/yyyy'];
        vm.format = vm.formats[0];

        var d = new Date();
        var year = d.getFullYear();
        var month = d.getMonth();
        var day = d.getDate();
        var maxdate = new Date(year + 1, month, day);

        vm.startDate = new Date();
        vm.endDate = maxdate;
        vm.maxEndDate = new Date(maxdate);
        vm.options = {
            customClass: getDayClass,
            minDate: new Date(),
            showWeeks: true
        };
        this.activeDate = null;
        this.activeDate2 = null;
        vm.type = 'individual';
        vm.show2pickers = false;

        vm.toggleMin = function () {
            vm.options.minDate = vm.options.minDate ? null : new Date();
        };
        vm.toggleMin();
        vm.setDate = function (year, month, day) {
            vm.dt = new Date(year, month, day);
        };

        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        var afterTomorrow = new Date(tomorrow);
        afterTomorrow.setDate(tomorrow.getDate() + 1);
        vm.events = [
          {
              date: tomorrow,
              status: 'full'
          },
          {
              date: afterTomorrow,
              status: 'partially'
          }
        ];

        function getDayClass(data) {
            var date = data.date,
              mode = data.mode;
            if (mode === 'day') {
                var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                for (var i = 0; i < vm.events.length; i++) {
                    var currentDay = new Date(vm.events[i].date).setHours(0, 0, 0, 0);

                    if (dayToCheck === currentDay) {
                        return vm.events[i].status;
                    }
                }
            }
            return '';
        }
    }

})();