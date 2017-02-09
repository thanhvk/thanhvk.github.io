'use strict';
angular.module('employerModule').controller('InvitationCandidateController', function($scope, $employer,
    $common, $translate, $rootScope, toastr, localStorageService, $location, $q, _, $uibModal,$filter)
{
    var alert = $translate.instant('toarster.alert');
    var emailSuccess = $translate.instant('toarster.emailSuccess');
    var alertEmail = $translate.instant('alertEmail');
    var finishEmail = $translate.instant('finishEmail');
    var noEmail = $translate.instant('invitation.noemail');
    var employeeData = null;
    var candidateList = [];
    
    var getCandidate = function()
    {
        var info = {
            token: $scope.userEmployer.token,
            interviewId: $scope.interview.id
        };
        $employer.getCandidate(info, function(response)
        {
            if (response.status && response.data.result)
            {
                candidateList = response.data.candidateList;
                _.each(candidateList, function(candidate)
                {
                    candidate.select = false;
                    candidate.potential = false;
                });
                var uniqueList = _.uniq(candidateList, function(item, key, email) { 
                    return item.email;
                });
                $scope.candidateList = uniqueList;
            }
        });
    };
    var getAssignment = function()
    {
        $employer.getAssignment(
        {
            token: $scope.userEmployer.token
        }, function(result)
        {
            if (result.status && result.data.result)
            {
                $scope.listAssignment = _.filter(result.data.assignmentList, function(assignment)
                {
                    return assignment.status === 'published';
                });
                var ass = localStorageService.get('chooseAssInvitation');
                // var interList = localStorageService.get('interviewListInvitation');
                var inter = localStorageService.get('InterviewInvitation');
                if(ass){
                    var assresult = _.find($scope.listAssignment, function(assign)
                    {
                        return assign.id === ass.id;
                    });
                    if(assresult) {
                        $scope.chooseAss = JSON.stringify(assresult);
                        var info = {
                            token: $scope.userEmployer.token,
                            assignmentId: assresult.id
                        };
                        $employer.getInterview(info, function(result) {
                            if (result.status && result.data.result) {
                                $scope.interviewList = _.filter(result.data.interviewList,function(interview) {
                                    return interview.status === 'published';
                                });
                                localStorageService.set('interviewListInvitation',$scope.interviewList);
                                var interresult = _.find($scope.interviewList, function(interview) {
                                    return interview.id === inter.id;
                                });
                                $scope.chooseInterview = JSON.stringify(interresult);
                                $scope.interview = interresult;
                                if(interresult && interresult.id){
                                    getCandidate();
                                }
                            }
                        });
                    }
                }
            }
        });
    };

    var _validateEmail = function(email)
    {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    $scope.getEmployeeByEmail = function()
    {
        employeeData = null;
        $employer.getEmployeeByEmail(
        {
            email: $scope.inputEmail,
            token: $scope.userEmployer.token
        }, function(result)
        {
            if (result.status && result.data.result)
            {
                employeeData = result.data.employeeProfile[0];
                var emprofile = employeeData.profile;
                if (emprofile.name.indexOf('-') !== -1)
                {
                    var firstname = emprofile.name.split('-')[0];
                    var lastname = emprofile.name.split('-')[1];
                    $scope.inputName = firstname + ' ' + lastname;
                }
                else
                {
                    $scope.inputName = emprofile.name;
                }
                employeeData.name = $scope.inputName;
            }
        });
    };
    $scope.chooseAssignment = function()
        {
            localStorageService.remove('chooseAssInvitation');
            localStorageService.remove('InterviewInvitation');
            localStorageService.remove('interviewListInvitation');
            $scope.interviewList = [];
            $scope.chooseInterview = {};
            $scope.inviteList = [];
            $scope.candidateList = [];
            $scope.potential = false;
            $scope.interview = {};
            localStorageService.remove('potentialCandidateList');
            if($scope.chooseAss){
                var assign = JSON.parse($scope.chooseAss);
                var info = {
                    token: $scope.userEmployer.token,
                    assignmentId: assign.id
                };
                localStorageService.set('chooseAssInvitation', assign);
                $employer.getInterview(info, function(result)
                {
                    if (result.status && result.data.result)
                    {
                        $scope.interviewList = _.filter(result.data.interviewList,function(interview) {
                            return interview.status === 'published';
                        });
                        localStorageService.set('interviewListInvitation', $scope.interviewList);
                    }
                });
            }
        };
        
    $scope.changeInterview = function()
    {
        localStorageService.remove('InterviewInvitation');
        $scope.inviteList = [];
        $scope.candidateList = [];
        $scope.potential = false;
        $scope.interview = JSON.parse($scope.chooseInterview);
        localStorageService.remove('potentialCandidateList');
        localStorageService.set('InterviewInvitation', $scope.interview);
        getCandidate();
    };

    var getLicense = function()
    {
        $employer.getLicenseInfo(
        {
            token: $scope.userEmployer.token
        }, function(result)
        {
            if (result.status)
            {
                $scope.licenseInfo = result.data.licenseInfo;
                $scope.maxEmail = $scope.licenseInfo.license.email;
                $scope.useEmail = $scope.licenseInfo.email;
            }
        });
    };

    $scope.sendEmail = function()
    {
        localStorageService.set('interview', $scope.interview);
        var inviteList = _.filter($scope.candidateList, function(candidate)
        {
            return candidate.select;
        });
        if (inviteList.length > 0)
        {
            var numberEmail = $scope.maxEmail - inviteList.length - $scope.useEmail;
            if(numberEmail >= 0){
                var info = {
                    token: $scope.userEmployer.token,
                    candidateList: inviteList,
                    subject: $scope.subject,
                    interviewId: $scope.interview.id
                };
                $employer.sendInterviewInvitation(info, function(result)
                {
                    if (result.status && result.data.result)
                    {
                        getCandidate();
                        toastr.success( emailSuccess,alert);
                    }
                    else
                    {
                        toastr.error(alertEmail);
                    }
                });
            } else {
                toastr.warning(finishEmail);
            }
        }
        else
        {
            toastr.warning(noEmail,alert);
        }
    };
    $scope.addCandidate = function(name, email)
    {
        if (!_.contains(_.pluck($scope.candidateList, "email"), email) && _validateEmail(email))
        {
            var candidate = {
                select: true,
                potential: false,
                shortlist: false,
                invited: false,
                name: name,
                email: email
            };
            if (!candidate.name)
            {
                candidate.name = candidate.email;
            }
            if (employeeData)
            {
                candidate.certList = employeeData.certList;
                candidate.docList = employeeData.docList;
                candidate.eduList = employeeData.eduList;
                candidate.expList = employeeData.expList;
                candidate.profile = employeeData.profile;
                candidate.viewed = employeeData.viewed;
                candidate.employeeId = employeeData.employeeId;
            }
            $scope.candidateList.push(candidate);
            $scope.inputName = "";
            $scope.inputEmail = "";
            return candidate;
        }
        return null;
    };
    
    $scope.addCandidateWithSchedule = function(name, email)
    {
        var candidate = $scope.addCandidate (name,email);
        if (candidate){
            candidate.schedule =   $filter('date')($scope.schedule, $scope.dateFormat);
        }
        return candidate;
    };
    var getCategory = function(lang)
    {
        var deferred = $q.defer();
        if (!localStorageService.get('listCategories_' + lang))
        {
            $common.getJobCategory(
            {
                lang: lang
            }, function(result)
            {
                if (result.status)
                {
                    localStorageService.set('listCategories_' + lang, result.data.categoryList);
                    deferred.resolve(result);
                }
            });
        }
        return deferred.promise;
    };
    var getLocation = function()
    {
        var deferred = $q.defer();
        if (!localStorageService.get('listLocation') || !localStorageService.get('listLevel'))
        {
            $common.getJobLocation(
            {
                lang: 'en'
            }, function(result)
            {
                if (result.status)
                {
                    localStorageService.set('listLocation', result.data.countryList);
                    localStorageService.set('listLevel', result.data.provinceList);
                    deferred.resolve(result);
                }
            });
        }
        return deferred.promise;
    };
    var geteduList = function()
    {
        var deferred = $q.defer();
        if (!localStorageService.get('eduLevelsList'))
        {
            $common.getEducationLevel(
            {
                lang: 'vi'
            }, function(result)
            {
                if (result.status)
                {
                    localStorageService.set('eduLevelsList', result.data.levelList);
                    $scope.eduLevelsList = result.data.levelList;
                    deferred.resolve(result);
                }
            });
        }
        return deferred.promise;
    };

    var init = function()
    {
        $scope.userEmployer = localStorageService.get('userEmployer');
        if (!$scope.userEmployer)
        {
            $location.path("/");
            return;
        }
        $scope.dateFormat ="dd MMM yyyy HH:mm";
        $scope.schedule  = new Date();
        getAssignment();
        getCategory('vi').then(function()
        {
            return getLocation();
        }).then(function()
        {
            return geteduList();
        });
        getLicense();
    };
    
    $scope.chooseEmployee = function(candidate)
    {
        var modalInstance = $uibModal.open(
        {
            animation: true,
            templateUrl: 'modalCvInvitationCtrl.html',
            controller: 'ModalCvInvitationController',
            controllerAs: 'employer/popup_cv_candidate',
            resolve:
            {
                candidate: function()
                {
                    return candidate;
                }
            }
        });
        modalInstance.result.then(function(selectedItem)
        {
            $scope.selected = selectedItem;
        }, function()
        {
            // $log.info('Modal dismissed at: ' + new Date());
        });
    };
    init();

    $scope.importCandidate = function (workbook) {
        for (var sheetName in workbook.Sheets) {
            var jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            if (jsonData.length === 0) {continue};
            // Get keys of object to use (case insensitive, name)
            var keys = _.keys(jsonData[0]);
            var list =  _.uniq(jsonData);

            for(var i=0; i< list.length; i++){
                $scope.addCandidate(list[i][keys[0]],list[i][keys[1]]);
                $scope.$apply();
            }
        }
    };

    $scope.error = function (e) {
        /* DO SOMETHING WHEN ERROR IS THROWN */
        console.log(e);
    };
});