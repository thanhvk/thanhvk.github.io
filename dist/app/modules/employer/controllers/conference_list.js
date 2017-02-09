'use strict';
angular.module('employerModule').controller('ConferenceListController', function($scope, $employer,
    $translate, $rootScope, localStorageService, $location, $window)
{
    // var alert = $translate.instant('toarster.alert');
    // var unablejob = $translate.instant('toaster.unablejob');
    // var serverError = $translate.instant('toarster.serverError');
    $scope.launchConference = function(conference)
    {
        conference.memberList.forEach(function(member)
        {
            if (member.role === 'moderator')
            {
                if (conference.status === 'pending')
                {
                    var url1 = "/#/conference?meetingId=" + conference.meetingId + "&memberId=" + member.memberId + "&translate=" + conference.language;
                    $window.open(url1,'_blank');
                    
                    $employer.openMeeting(
                    {
                        token: $scope.userEmployer.token,
                        conferenceId: conference.id
                    }, function()
                    {
                        
                    });
                }
                else
                {
                    var url = "/#/conference?meetingId=" + conference.meetingId + "&memberId=" + member.memberId + "&translate=" + conference.language;
                    $window.open(url,'_blank');
                }
            }
        });
    };

    function  getConference()
    {
        $employer.getConference(
        {
            token: $scope.userEmployer.token
        }, function(result)
        {
            if (result.status && result.data.result)
            {
                $scope.listConference = result.data.conferenceList;
                localStorageService.set("listConference", $scope.listConference);
                $scope.totalItems = $scope.listConference.length;
            }
        });
    }
    var init = function()
    {
        $scope.userEmployer = localStorageService.get('userEmployer');
        if (!$scope.userEmployer)
        {
            $location.path("/");
            return;
        }
        $scope.listConference = [];
        getConference();
    };
    init();
});