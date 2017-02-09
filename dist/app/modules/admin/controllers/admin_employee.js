'use strict';
angular.module('adminModule').controller('AdminEmployeeController', function($scope, $admin, $translate,
    $rootScope, $common,  localStorageService, $location, $window, _, $log)
{
    // var alert = $translate.instant('toarster.alert');
    $scope.newEmployee = function()
    {
        var newemployee = {};
        localStorageService.set('chooseEmployeeAdmin', newemployee);
        $location.path("/admin/employee/detail");
    };
    $scope.detailEmployee = function(employee)
    {
        localStorageService.set('chooseEmployeeAdmin', employee);
        $window.open("#/admin/employee/detail", '_blank');
    };
    $scope.setPage = function(pageNo)
    {
        $scope.currentPage = pageNo;
    };
    $scope.pageChanged = function()
    {
        $log.info('Page changed to: ' + $scope.currentPage);
    };
    $scope.setItemsPerPage = function(num)
    {
        $scope.itemsPerPage = num;
        $scope.currentPage = 1; //reset to first paghe
    };
    $scope.setSearch = function()
    {
        $scope.totalItems = $scope.list.length;
    };
    var getLocation = function()
    {
        if (!localStorageService.get('listLocation') || !localStorageService.get('listLevel'))
        {
            $common.getJobLocation(
            {
                lang: 'en'
            }, function(result)
            {
                // $log.info(result.data);
                if (result.status)
                {
                    $scope.listLocation = result.data.countryList;
                    $scope.listLevel = result.data.provinceList;
                    localStorageService.set('listLocation', result.data.countryList);
                    localStorageService.set('listLevel', result.data.provinceList);
                }
            });
        }
        else
        {
            $scope.listLocation = localStorageService.get('listLocation');
            $scope.listLevel = localStorageService.get('listLevel');
        }
    };
    var getEmployee = function()
    {
        //if (!localStorageService.get('listAssignmentAdmin')) {
        $admin.getEmployee(
        {
            token: $scope.userAdmin.token
        }, function(result)
        {
            if (result.status)
            {
                $scope.listEmployee = result.data.companyList;
                var num_length = $scope.listEmployee.length;
                for (var i = 0; i < $scope.listEmployee.length; i++)
                {
                    $scope.listEmployee[i].index = num_length;
                    num_length = num_length - 1;
                }
                angular.forEach($scope.listEmployee, function(employee)
                {
                    var location = _.find($scope.listLocation, function(local)
                    {
                        return local.id === employee.countryId;
                    });
                    employee.country = location;
                });
                localStorageService.set("listEmplyeeAdmin", $scope.listEmployee);
                $scope.totalItems = $scope.listEmployee.length;
                $scope.currentPage = 1;
                $scope.itemsPerPage = 8;
                $scope.maxSize = 5;
                //Number of pager buttons to show
            }
        });
        // } else {
        //    $scope.listAssignment = localStorageService.get('listAssignmentAdmin');
        //    $scope.totalItems = $scope.listAssignment.length;
        //             $scope.currentPage = 1;
        //             $scope.itemsPerPage = 6;
        //             $scope.maxSize = 5;
        // }
    };
    var init = function()
    {
        localStorageService.set("page", "employee");
        $scope.userAdmin = localStorageService.get('userAdmin');
        $scope.listEmployee = [];
        getLocation();
        getEmployee();
    };
    init();
});