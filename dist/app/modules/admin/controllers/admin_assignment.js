'use strict';
angular.module('adminModule').controller('AdminAssignmentController', function($scope, $admin, $translate,
    $rootScope, toastr, localStorageService, $location, $log)
{
    // var alert = $translate.instant('toarster.alert');
    // var unablejob = $translate.instant('toaster.unablejob');
    var getAssignment = function()
    {
        //if (!localStorageService.get('listAssignmentAdmin')) {
        $admin.getAssignment(
        {
            token: $scope.userAdmin.token
        }, function(result)
        {
            if (result.status)
            {
                $scope.listAssignment = result.data.assignmentList;
                var num_length = $scope.listAssignment.length;
                for (var i = 0; i < $scope.listAssignment.length; i++)
                {
                    $scope.listAssignment[i].index = num_length;
                    num_length = num_length - 1;
                }
                localStorageService.set("listAssignmentAdmin", $scope.listAssignment);
                $scope.totalItems = $scope.listAssignment.length;
                $scope.currentPage = 1;
                $scope.itemsPerPage = 6;
                $scope.maxSize = 5;
                //Number of pager buttons to show
            }
        });
    };
    
    $scope.approveAssign = function(assign)
    {
        if (!assign.approved)
        {
            $admin.approveAssignment(
            {
                token: $scope.userAdmin.token,
                assignmentId: assign.id
            }, function(result)
            {
                if (result.status){
                    getAssignment();
                }
            });
        }
    };
    $scope.newJob = function()
    {
        var assignnew = {};
        localStorageService.set('chooseAssignmentAdmin', assignnew);
        $location.path("/admin/job/detail");
    };
    $scope.detailAssignment = function(assign)
    {
        localStorageService.set('chooseAssignmentAdmin', assign);
        $location.path("/admin/job/detail");
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
    
    var init = function()
    {
        localStorageService.set("page", "assignment");
        $scope.userAdmin = localStorageService.get('userAdmin');
        $scope.listAssignment = [];
        getAssignment();
    };
    init();
});