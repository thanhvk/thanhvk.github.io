'use strict';
angular.module('employerModule')
.controller('CandidateApplyListController', function($scope, $employer, $profile, $translate, $rootScope, $filter, $window, $log, $uibModal, toastr, localStorageService, $location, $q, _, $common) {
    $scope.userEmployer = localStorageService.get('userEmployer');
    var styding         = $translate.instant('employee.styding');
    var stydingEnd      = $translate.instant('employee.stydingEnd');
    var ten     = $translate.instant('tenItemsPerPage'),
        twenty  = $translate.instant('twentyItemsPerPage'),
        thirty  = $translate.instant('thirtyItemsPerPage'),
        fourty  = $translate.instant('fourtyItemsPerPage'),
        fifty   = $translate.instant('fiftyItemsPerPage');

    $scope.videoCandidate = false;
    if (!$scope.userEmployer)
        {
            $location.path("/");
            return;
        }
    var info = {};

    $scope.pageOptions = {
        availableOptions: [
          {value: 10, name: ten},
          {value: 20, name: twenty},
          {value: 30, name: thirty},
          {value: 40, name: fourty},
          {value: 50, name: fifty}
        ],
        selectedOption: {value: 10, name: ten} 
    };

    $scope.showExcelAll = true;
    $scope.candidateListAll = [];

    var getEduLevelsList = function()
    {
        $scope.eduLevelsList = [];
        if (localStorageService.get('eduLevelsList'))
        {
            $scope.eduLevelsList = localStorageService.get('eduLevelsList');
        }
        else
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
                }
            });
        }
    };

    var getAssignment = function(){
        $employer.getAssignment({  token: $scope.userEmployer.token  },
        function(result) {
            if (result.status)
            {
                $scope.listAssignment = result.data.assignmentList;
            }
        });
    };

    function getCandidateApplyList(info) {
        var deffered    = $q.defer();

        $employer.getCandidateApplyList(info, function(result) {
            if (result.status) {
                deffered.resolve(result.data);
            } else {
                $log.info('Khong lay duoc list candidate');
                deffered.resolve(null);
            }
        });

        return deffered.promise;
    }

    var getHighestEdu = function()
    {
        $scope.candidateList.reduce(function(prev, curr)
        {
            return prev.then(function()
            {
                if(curr.eduList && curr.eduList.length > 0) {
                    var level = _.max(curr.eduList, function(edu)
                    {
                        return edu.levelId;
                    });
                    var levelObj = _.find($scope.eduLevelsList, function(eduLevel)
                    {
                        return level.levelId === eduLevel.id;
                    });
                    level.levelName = levelObj.title;
                    curr.profile.highestEduLevel = level ? level.levelName : null;
                }
            });
        }, Promise.resolve());
        _.defer(function(){$scope.$apply();});
    };

    var getNumberExp = function()
    {
        $scope.candidateList.reduce(function(prev, curr)
        {
            return prev.then(function()
            {
                $profile.calcNumberExp(curr);
            });
        }, Promise.resolve());
        _.defer(function(){$scope.$apply();});
    };

    $scope.changeItemsPerPage = function() {
        $scope.itemsPerPage = $scope.pageOptions.selectedOption.value;
        $scope.changePage($scope.currPage);
    }

    $scope.changePage = function(page) {
        $window.scrollTo(0, 0);
        $scope.currPage = page;

        var info = {
            token: $scope.userEmployer.token,
            offset: ($scope.currPage - 1) * $scope.itemsPerPage,
            length: $scope.itemsPerPage,
            count: true
        };

        getCandidateApplyList(info).then(function(data) {
            if (data) {
                $scope.candidateList = data.candidateList;
                $scope.totalCandidates = data.total;
            }
        }).then(function(){
            getHighestEdu();
            getNumberExp();
        });
    };

    $scope.findjob = function(job){
        if(job){
            $scope.showExcelAll = false;
            job = JSON.parse(job);
            $scope.titleJob = job.name;
            var info = {
                token: $scope.userEmployer.token,
                assignmentId: job.id
            };
            $employer.getCandidateByjob(info, function(result){
                if(result.status){
                    $scope.candidateList = result.data;
                    getHighestEdu();
                    getNumberExp();
                } else{
                    $scope.candidateList = null;
                }
                $scope.showExcel = true;
            });
        } else {
            $scope.showExcel = false;
            $scope.showExcelAll = true;
            var info = {
                token: $scope.userEmployer.token,
                offset: 0,
                length: 10,
                count: true
            };
            getCandidateApplyList(info).then(function(data) {
                if (data) {
                    $scope.candidateList = data.candidateList;
                    $scope.totalCandidates = data.total;
                }
            }).then(function(){
                getHighestEdu();
                getNumberExp();
            });
        }
    };

    $scope.exportToExcel = function() {
        var blob = new Blob([document.getElementById('export-to-excel').innerHTML], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
            });
        saveAs(blob, "Report.xls");
    };

    var getHighestEduAll = function()
    {
        $scope.candidateListAll.reduce(function(prev, curr)
        {
            return prev.then(function()
            {
                curr.profile.highestEduLevel = "";
                if(curr.eduList.length > 0) {
                    var level = _.max(curr.eduList, function(edu)
                    {
                        return edu.levelId;
                    });
                }
                if(level){
                    var levelObj = _.find($scope.eduLevelsList, function(eduLevel)
                    {
                        return eduLevel.id === level.levelId;
                    });
                }

                curr.profile.highestEduLevel = level ? levelObj.title : null;
            });
        }, Promise.resolve());
        _.defer(function(){$scope.$apply();});
    };

    var getNumberExpAll = function()
    {
        $scope.candidateListAll.reduce(function(prev, curr)
        {
            return prev.then(function()
            {
                $profile.calcNumberExp(curr);
            });
        }, Promise.resolve());
        _.defer(function(){$scope.$apply();});
    };

    $scope.exportToExcelAll = function() {
         var blob = new Blob([document.getElementById('export-to-excel-all').innerHTML], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
            });
        saveAs(blob, "Report_All.xls");
    };

    $scope.openModalCvCandidate = function (employee) {
        var modalInstance = $uibModal.open({
            animation: true,
            windowClass: "modal fade in",
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'modalCvCandidate.html',
            controller: 'ModalCvCandidateCtrl',
            size: 'lg',
            resolve: {
                data: function () {
                    return {
                            employee: employee,
                            employer: $scope.userEmployer,
                            candidateApply: true
                        };
                }
            }
        });

        modalInstance.result.then(function() {}, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.openModalCoverLetter = function (candidate) {
        var modalInstance = $uibModal.open({
            animation: true,
            windowClass: "modal fade in",
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'modalCoverLetter.html',
            controller: 'ModalCoverLetterCtrl',
            size: 'lg',
            resolve: {
                data: function () {
                    return {
                            candidate: candidate
                        };
                }
            }
        });

        modalInstance.result.then(function() {}, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    function init() {
        $scope.currPage = 1;
        $scope.itemsPerPage = $scope.pageOptions.selectedOption.value;
        $scope.maxSize = 4;

        var info = {
            token: $scope.userEmployer.token,
            offset: ($scope.currPage - 1) * $scope.itemsPerPage,
            length: $scope.itemsPerPage,
            count: true
        };

        getEduLevelsList();
        getAssignment();

        getCandidateApplyList(info)
        .then(function(data) {
            if (data) {
                $scope.candidateList = data.candidateList;
                $scope.totalCandidates = data.total;
            }
        }).then(function(){
            getHighestEdu();
            getNumberExp();
        });

        var info = {
            token: $scope.userEmployer.token,
            offset: 0,
            length: 20,
            count: true
        };
        info.length = $scope.totalCandidates;

        getCandidateApplyList(info).then(function(data) {
            if (data) {
                $scope.candidateListAll = _.reject(data.candidateList,function(candidate) {
                    return !candidate.profile;
                });
            }
        }).then(function(){
            getHighestEduAll();
        }).then(function(){
            $scope.candidateListAll = getNumberExpAll($scope.candidateListAll);
        });
    }

    init();
});