'use strict';
angular.module('employerModule')
    .controller('ModalAssessmentReportCtrl', function($scope, $employer, $rootScope, toastr, $translate, localStorageService, $location, $uibModal, $uibModalInstance, _, FileSaver, Blob, $common, $log, $cache, data) {
        var alert = $translate.instant('toarster.alert');
        var updateSuccess = $translate.instant('toarster.updateSuccess');
        var updateError = $translate.instant('toarster.updateError');

        var candidate = data.candidate,
            employer  = data.employer;
        $scope.chooseAss = data.chooseAss;
        $scope.chooseInterview = data.interview;
        $scope.selfAssessmentResult = {};
        $scope.selfAssessmentResult.vote = 0;
        $scope.summaryAssessment = {};
        $scope.summaryAssessment.vote = 0;
        $scope.otherAssessmentResult = {};
        $scope.answerVideoUrl = {};
        $scope.chooseCandidate = candidate;

        // function loadAnswer(assessmentResult) {
        //     if (!assessmentResult || typeof assessmentResult.answerList === 'undefined') {
        //         return;
        //     }

        //     assessmentResult.answerList.forEach(function(answer) {
        //         var existQuestion = _.find($scope.assessment.questionList, function(question) {
        //             return question.id === answer.questionId;
        //         });

        //         if (existQuestion) {
        //             existQuestion.chooseVal =  Math.floor(answer.answer);
        //         }
        //     });
        // }

        // $rootScope.$watch('language', function(newValue, oldValue)
        // {
        //     var options = [
        //     {
        //         val: 0,
        //         name: $translate.instant('assessment.selectValue')
        //     },
        //     {
        //         val: 1,
        //         name: $translate.instant('assessment.bad')
        //     },
        //     {
        //         val: 2,
        //         name: $translate.instant('assessment.poor')
        //     },
        //     {
        //         val: 3,
        //         name: $translate.instant('assessment.na')
        //     },
        //     {
        //         val: 4,
        //         name: $translate.instant('assessment.good')
        //     },
        //     {
        //         val: 5,
        //         name: $translate.instant('assessment.excellent')
        //     }];
        //     if (!newValue) {
        //         return;
        //     }
        //     $cache.getAssessment({ lang: newValue }, function(result) {
        //         if (result.status)
        //         {
        //             $scope.assessment = result.data.assessment;
        //             $scope.assessment.questionList.forEach(function(question)
        //             {
        //                 question.options = options;
        //                 question.chooseVal = 3;
        //             });
        //             $scope.questionList = _.groupBy($scope.assessment.questionList, function(question){
        //                         return question.groupId;
        //                });
        //             // loadAnswer($scope.selfAssessmentResult);

        //             // if (typeof $scope.otherAssessmentResult !== 'undefined') {
        //             //     loadAnswer($scope.otherAssessmentResult[0]);
        //             // }

        //             // loadAnswer($scope.summaryAssessmentResult);
        //         }
        //     });
        // });

        function sumAssessment(){
            $scope.chooseCandidate.groupList.forEach(function(group) {
                group.chooseVal = 0;
                group.total = 0;
                group.data = [];
                _.map($scope.chooseCandidate.questionList,function(question) {
                    if(question.groupId === group.id){
                        group.chooseVal += question.chooseVal;
                        group.total += 5;
                    }
                });
                // group.data = [group.chooseVal , group.total - group.chooseVal];

                // var answerVal = _.find($scope.chooseCandidate.questionList, function(question) {
                //     return question.id === group.id;
                // });
                // group.chooseVal += answerVal.chooseVal;
            });
            $scope.name1 = $scope.chooseCandidate.groupList[0].name;
            $scope.name2 = $scope.chooseCandidate.groupList[1].name;
            $scope.name3 = $scope.chooseCandidate.groupList[2].name;
            $scope.percent1 = $scope.chooseCandidate.groupList[0].chooseVal / $scope.chooseCandidate.groupList[0].total * 100;
            $scope.percent2 = $scope.chooseCandidate.groupList[1].chooseVal / $scope.chooseCandidate.groupList[1].total * 100;
            $scope.percent3 = $scope.chooseCandidate.groupList[2].chooseVal / $scope.chooseCandidate.groupList[2].total * 100;
            $scope.data1 = [$scope.chooseCandidate.groupList[0].chooseVal , $scope.chooseCandidate.groupList[0].total - $scope.chooseCandidate.groupList[0].chooseVal ];
            $scope.data2 = [$scope.chooseCandidate.groupList[1].chooseVal , $scope.chooseCandidate.groupList[1].total - $scope.chooseCandidate.groupList[1].chooseVal ];
            $scope.data3 = [$scope.chooseCandidate.groupList[2].chooseVal , $scope.chooseCandidate.groupList[2].total - $scope.chooseCandidate.groupList[2].chooseVal ];
            // console.log($scope.chooseCandidate.questionList);
            console.log($scope.percent1);
        }

        // $scope.labels1 = [" ", " "];
        // $scope.data1 = [2,1];

        $scope.cancel = function () {
            $uibModalInstance.close();
        };

        function init() {
            $scope.labels = [" ", " "];
            $scope.data = [$scope.chooseCandidate.summaryAssessment.vote,5 - $scope.chooseCandidate.summaryAssessment.vote];
            $scope.percent = $scope.chooseCandidate.summaryAssessment.vote / 5 * 100;
            sumAssessment();
        }

        init();

    });