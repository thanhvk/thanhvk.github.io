'use strict';
angular.module('employerModule').filter('recruit', function(_)
{
    return function(assignList)
    {
        return _.filter(assignList, function(ass)
        {
            return ass.status !== 'initial';
        });
    };
}).controller('AssessmentController', function($scope, $employer, $rootScope, toastr, $translate, localStorageService, $location, $admin, $uibModal, _, FileSaver,
    Blob, $common, $log, $cache)
{
    var alert = $translate.instant('toarster.alert');
    var updateSuccess = $translate.instant('toarster.updateSuccess');
    var updateError = $translate.instant('toarster.updateError');
    var name        = $translate.instant('employer.assignment.Csv.name'),
        email       = $translate.instant('employer.assignment.Csv.email'),
        score       = $translate.instant('employer.assignment.Csv.score'),
        result      = $translate.instant('employer.assignment.Csv.result'),
        select      = $translate.instant('employer.assignment.Csv.select'),
        pass        = $translate.instant('employer.assignment.Csv.pass'),
        unPass      = $translate.instant('employer.assignment.Csv.unPass'),
        choose      = $translate.instant('employer.assignment.Csv.choose'),
        unChoose    = $translate.instant('employer.assignment.Csv.unChoose');
    
    $scope.isEmpty = function(obj)
    {
        if (obj === null) {
            return true;
        }
        for (var i in obj){
            if (obj.hasOwnProperty(i)){ 
                return false;
            }
        }
    };

    function init()
    {
        $scope.headerArrCsv = [name, email, score, result, select];
        $scope.userEmployer = localStorageService.get('userEmployer');
        if (!$scope.userEmployer)
        {
            $location.path("/");
            return;
        }
        $employer.getAssignment({  token: $scope.userEmployer.token  },
                function(result) {
                    if (result.status)
                    {
                        $scope.listAssignment = result.data.assignmentList;
                    }
                });
    }

    $scope.selectAssignment = function(assign)
    {
        $scope.chooseCandidate = {};
        $scope.chooseInterview = {};
        $scope.myAssessmentResult = {comment:'',vote:0};
        $scope.otherAssessmentResult = {};
        $scope.chooseOtherAssessment = {};
        $scope.summaryAssessment = {};
        $scope.candidateList = [];
        $scope.interviewStats = {};
        assign = JSON.parse(assign);
        var info = {
            token: $scope.userEmployer.token,
            assignmentId: assign.id
        };
        $employer.getInterview(info, function(result)
        {
            if (result.status && result.data.result)
            {
                // $scope.interviewList = result.data.interviewList;
                $scope.interviewRounds = {
                    model: null,
                    availableOptions: result.data.interviewList
                }
            }
        });
    };
    
    $scope.selectInterview = function(interview)
    {
        $scope.interview = JSON.parse(interview);
        $scope.chooseCandidate = {};
        $scope.myAssessmentResult = {comment:'',vote:0};
        $scope.otherAssessmentResult = {};
        $scope.chooseOtherAssessment = {};
        $scope.summaryAssessment = {};
        $scope.chooseInterview = JSON.parse(interview);
        var info = {
            token: $scope.userEmployer.token,
            interviewId: $scope.chooseInterview.id
        };
        $employer.getInterviewStatistic(info, function(response)
        {
            if (response.status && response.data.result)
            {
                $scope.interviewStats = response.data.stats;
                $employer.getCandidateResponse(info, function(result)
                {
                    if (result.status)
                    {
                        $scope.candidateList = result.data.responseList;
                        $scope.candidateArrCsv = [];

                        $scope.candidateList.map(function(candidate) {
                            var candidateToExport = {
                                name: candidate.candidate.name,
                                email: candidate.candidate.email,
                                score: candidate.candidate.score,
                                pass: candidate.candidate.pass ? pass : unPass,
                                shortlist: candidate.candidate.shortlist ? choose : unChoose
                            };

                            $scope.candidateArrCsv.push(candidateToExport);
                        });

                        if ($scope.candidateList.length > 0)
                        {
                            $scope.candidateList.forEach(function(candidate)
                            {
                                if (candidate.answerList.length > 0)
                                {
                                    $employer.getInterviewQuestion(info, function(resultInterview)
                                    {
                                        if (resultInterview.status)
                                        {
                                            candidate.answerList.forEach(function(answer)
                                            {
                                                var existQuestion = _.find(resultInterview.data.questionList,
                                                    function(question)
                                                    {
                                                        return question.id === answer.questionId;
                                                    });
                                                if (existQuestion)
                                                {
                                                    answer.nameQuestion = existQuestion.title;
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }
        });
    };

    $scope.shortList = function(candidateId) {
        var info = {
            token: $scope.userEmployer.token,
            candidateId: candidateId
        };

        $employer.shortListCandidate(info, function(result) {
            if (!result.status && !result.data.result) {               

                $log.error(result);
            } else {
                var candidate = _.find($scope.candidateList, function(candidate) {
                    return candidateId == candidate.candidate.id;
                });

                if (candidate) {
                    candidate.candidate.shortlist = !candidate.candidate.shortlist;
                }
            }
        });
    };

    $scope.chooseEmployee = function(candidate) {
        var modalInstance = $uibModal.open(
        {
            animation: true,
            templateUrl: 'modalCvCandidate.html',
            controller: 'ModalCvCandidateCtrl',
            controllerAs: 'employer/ModalCvCandidateCtrl',
            size: 'lg',
            resolve:
            {
                data : function() {
                    return {
                        employer: $scope.userEmployer,
                        employee: {
                            viewedOld: true,
                            employeeId: false,
                            employeeEmail: candidate.email
                        },
                        candidateApply: true,
                    };
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
   
    $scope.openModalAssessmentResult = function (size, candidate) {
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'modalAssessmentResultView.html',
            controller: 'ModalAssessmentResultCtrl',
            size: size,
            resolve: {
                    data: function () {
                        return { 
                                candidate: candidate,
                                interview: $scope.interview,
                                chooseAss: $scope.chooseAss,
                                employer: $scope.userEmployer
                            };
                    }
                }
        });
        
        modalInstance.result.then(function (selectedItem) {

        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.openModalTestResult = function (size, candidate) {
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'modalTestResultView.html',
            controller: 'ModalTestResultCtrl',
            size: size,
            resolve: {
                    data: function () {
                        return { 
                                candidate: candidate,
                                interview: $scope.interview,
                                chooseAss: $scope.chooseAss,
                                employer: $scope.userEmployer
                            };
                    }
                }
        });
        
        modalInstance.result.then(function (selectedItem) {

        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.exportToExcel = function() {
        var blob = new Blob([document.getElementById('table-export-to-excel').innerHTML], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
            });
        
        saveAs(blob, "Report.xls");
    };

    init();
});