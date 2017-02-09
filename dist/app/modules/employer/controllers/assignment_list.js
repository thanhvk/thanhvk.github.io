'use strict';
angular.module('employerModule').controller('AssignmentListController', function($scope, $employer,toastr,
    $translate, $rootScope,  localStorageService, $location, $q,_)
{
    var alert = $translate.instant('toarster.alert');
    var unablejob = $translate.instant('toaster.unablejob');
    $scope.editAssign = function(assign)
    {
        localStorageService.set('chooseAssignment', assign);
        localStorageService.remove("interviewQuestionList");
        localStorageService.remove('interview');
        $location.path("/employer/assignment");
    };

    $scope.deleteAssign = function(assign)
    {
        if (assign.status !== 'initial' && assign.status) {
            toastr.error( alert, unablejob);
        } else
        {
            $employer.deleteAssignment(
             {
                token: $scope.userEmployer.token,
                assignmentId: assign.id
            }, function(result)
            {
                if(result.status){
                    $scope.listAssignment = _.reject($scope.listAssignment,function(ass) {
                        return ass.id === assign.id;
                    });
                }
            });
        }
    };

    $scope.newAssign = function()
    {
        localStorageService.remove('chooseAssignment');
        localStorageService.remove("interviewQuestionList");
        localStorageService.remove('interview');
        $location.path("/employer/assignment");
    };


    function getAssign()
    {
        var info = {
            token: $scope.userEmployer.token
        };
        $employer.getAssignment(info, function(result)
        {
            if (result.status)
            {
                $scope.listAssignment = result.data.assignmentList;
            }
        });
    }

    function init()
    {
        $scope.userEmployer = localStorageService.get("userEmployer");
        if (!$scope.userEmployer)
        {
            $location.path("/");
            return;
        }
        getAssign();
    }

    init();
});