'use strict';
angular.module('employerModule')
    .controller('ModalTestResultCtrl', function($scope, $employer, $rootScope, toastr, $translate, localStorageService, $location, $uibModal, $uibModalInstance, _, FileSaver, Blob, $common, $log, $cache, data) {
        var alert = $translate.instant('toarster.alert');
        var updateSuccess = $translate.instant('toarster.updateSuccess');
        var updateError = $translate.instant('toarster.updateError');

        var candidate = data.candidate,
            employer  = data.employer;
        $scope.chooseAss = JSON.parse(data.chooseAss);
        $scope.chooseInterview = data.interview;
        $scope.chooseCandidate = candidate;
        $scope.answerlist = $scope.chooseCandidate.answerList;

        function makeTest() {
            $employer.getInterviewQuestion(
            {
                token: employer.token,
                interviewId: $scope.chooseInterview.id
            }, function(result)
            {
                if (result.status)
                {
                    $scope.questionList = result.data.questionList;
                    _.each($scope.questionList,function(questionItem) {
                        var answerQuestion = _.find($scope.answerlist, function(answer)
                        {
                            return answer.questionId === questionItem.id;
                        });
                        questionItem.optionId = answerQuestion.optionId;
                        _.each(questionItem.options,function(option) {
                            if(option.id == questionItem.optionId){
                                option.answer = true;
                            } else {
                                option.answer = false;
                            }
                        });
                    });
                    console.log($scope.questionList);
                }
            });
        }

        $scope.cancel = function () {
            $uibModalInstance.close();
        };

        function init() {
            $scope.labels = [" ", " "];
            // $scope.data = [$scope.chooseCandidate.summaryAssessment.vote,5 - $scope.chooseCandidate.summaryAssessment.vote];
            // $scope.percent = Math.ceil($scope.chooseCandidate.summaryAssessment.vote / 5 * 100 * 10) / 10;
            $scope.countPoint = 0;
            $scope.totalQ = 0;
            _.each($scope.answerlist,function(ans) {
                $scope.totalQ++;
                if(ans.score === 1){
                    $scope.countPoint++;
                }
            });
            $scope.data = [$scope.countPoint,$scope.totalQ - $scope.countPoint];
            makeTest();
        }

        init();

    });