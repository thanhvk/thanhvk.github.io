'use strict';
angular.module('employerModule')
.controller('CandidateListController', function($rootScope, $scope, $common, $filter, $employer, $q, $employee, $location, $translate, $window, $log, $uibModal, localStorageService, _) {
        $scope.employer = localStorageService.get('userEmployer');

    if (!$scope.employer)
        {
            $location.path("/");
            return;
        }
    var config = {
        countryId: 243, // Viet Nam
        provinceId: 60 // Ha Noi
    };
    var onecv = $translate.instant('employer.tencv');
    var twocv = $translate.instant('employer.twentycv');
    var threecv = $translate.instant('employer.thirtycv');
    var fourcv = $translate.instant('employer.fourtycv');
    var fivecv = $translate.instant('employer.fivetycv');
    // var alllocation = $translate.instant('employee.searchPostions');
    
    $scope.searching = false;
    $scope.resultSearch = true;
    $scope.countriesList = [];
    $scope.provincesList = [];
    $scope.categoriesList = [];
    // Pagination
    $scope.candidateListPagination = [];
    $scope.totalCandidates = 0;
    $scope.currPage = 1;
    $scope.itemsPerPage = 10;
    $scope.maxSize = 4;
    $scope.search = {
        options: {
            email: '',
            countryId: '',
            provinceId: '',
            categoryId: '',
            positionId: ''
        }
    };
    $scope.optionNumbers = {
        availableNumbers: [
                            { id: 1, value: 10, lable: onecv }, 
                            { id: 2, value: 20, lable: twocv }, 
                            { id: 3, value: 30, lable: threecv },
                            { id: 4, value: 40, lable: fourcv },
                            { id: 5, value: 50, lable: fivecv }
                         ],
        selectedNumber: { id: 1, value: 10 }
    };

    // Get countries and provinces list
    var getLocation = function() {
        var deferred = $q.defer();
            if (!localStorageService.get('countriesList') || !localStorageService.get('provincesList')) {
                $common.getJobLocation({ lang: 'vi' }, function(result){
                  if(result.status){
                    result.data.countryList.unshift({
                        id: '',
                        title: 'Tất cả đất nước'
                    });
                    result.data.provinceList.unshift({
                        id: '',
                        title: 'Tất cả tỉnh/thành phố'
                    });

                    $scope.countriesList = result.data.countryList;
                    $scope.provincesList = result.data.provinceList;
                    
                    localStorageService.set('countriesList', result.data.countryList);
                    localStorageService.set('provincesList', result.data.provinceList);
                    deferred.resolve(true);
                  } else {
                    // $log.info('error', 'Khong lay duoc danh sach country va province');
                    deferred.resolve(true);
                  }
                });      
            } else {
                $scope.countriesList = localStorageService.get('countriesList');
                $scope.provincesList = localStorageService.get('provincesList');  
                deferred.resolve(true);
            } 

        return deferred.promise;
    };

    // Get categories list
    var getCategories = function(lang) {
        var deferred = $q.defer();

        if(!localStorageService.get('categoriesList_' + lang)){
            $common.getJobCategory({ 'lang': lang }, function(result){
                if(result.status){
                    $scope.categoriesList = result.data.categoryList;
                    localStorageService.set('categoriesList_' + lang, result.data.categoryList);
                    deferred.resolve(true);
                } else {
                    // $log.info('Khong lay duoc danh sach category');
                    deferred.resolve(false);
                }            
            });
        } else{
            $scope.categoriesList = localStorageService.get('categoriesList_' + lang);
            deferred.resolve(true);
        }

        return deferred.promise;
    };

    // Set current country
    var setCurrCountry = function(countryId) {
        $scope.currCountry = _.find($scope.countriesList, function(country) {
            return (country.id === countryId);
        });

        $scope.countries = {
            availableCountries: $scope.countriesList,
            selectedCountry: $scope.currCountry
        };
    };

    // Set current province
    var setCurrProvince = function(provinceId) {
        $scope.currProvince = _.find($scope.provincesList, function(province) {
            return (province.id === provinceId);
        });

        $scope.provinces = {
            availableProvinces: $scope.provincesList,
            selectedProvince: $scope.currProvince
        };
    };

    var calcPagination = function(currPage) {
        var start = (currPage - 1)*$scope.itemsPerPage;
        var end = currPage*$scope.itemsPerPage;

        $scope.currPage = currPage;
        $scope.candidateListPagination = $scope.candidatesList.slice(start, end);
    };

    var getFullname = function(candidatesList) {
        candidatesList.map(function(candidate) {

            if (candidate.name.indexOf('-') !== -1) {
                var firstname = candidate.name.split('-')[0];
                var lastname = candidate.name.split('-')[1];
                candidate.fullname = firstname + ' ' + lastname;
            } else {
                candidate.fullname = candidate.name;
            }

            return candidate;
        });
    };

    var getLocationName = function(candidatesList, countriesList, provincesList) {
        candidatesList.map(function(candidate) {
            // Get country name
            var country = _.find(countriesList, function(country) {
                return (candidate.countryId === country.id);
            });

            candidate.countryName = country ? country.title : '';

            // Get province name
            var province = _.find(provincesList, function(province) {
                return (candidate.provinceId === province.id);
            });

            candidate.provinceName = province ? province.title : '';

            return candidate;
        });
    };

    var getCategoryName = function(categoryId, categoriesList) {
        var category = _.find(categoriesList, function(category) {
            return (categoryId === category.id);
        });

        var categoryName = category ? category.title : null;
        return categoryName;
    };

    var getInfoObj = function() {
        $scope.search.options.countryId = config.countryId;
        $scope.search.options.provinceId = $scope.provinces.selectedProvince.id;
        $scope.search.options.positionId = $scope.positions.seletedPosition;

        var info = {
            token: $scope.employer.token,
            option: $scope.search.options
        };

        return info;
    };

    var setSearchResult = function(candidateList) {
        $scope.candidatesList = candidateList;
        $scope.totalCandidates = $scope.candidatesList.length;

        $scope.candidatesList.map(function(candidate) {
            candidate.categories = candidate.categoryIds.map(function(categoryId) {
                var category = {
                    id: categoryId,
                    title: getCategoryName(categoryId, $scope.categoriesList)
                };
                return category;
            });
        });

        getFullname($scope.candidatesList);
        getLocationName($scope.candidatesList, $scope.countriesList, $scope.provinces.availableProvinces);
        calcPagination($scope.currPage);
    };

    var getSearchResult = function(info) {
        var deferred = $q.defer();

        $employer.searchCandidate(info, function(result) {
            if (result.status && result.data.employeeList.length !== 0) {
                var candidateList = result.data.employeeList;
                candidateList = $filter('orderBy')(candidateList, 'id', true);
                
                deferred.resolve(candidateList);
            } else {
                deferred.resolve(null);
                $log.info('Da co loi khi search');
            }
        });

        return deferred.promise;
    };

    // Get 10 new candidate
    var getNewCandidate = function() {
        var info = {
                token: $scope.employer.token,
                option: {
                    countryId: '',
                    provinceId: '',
                    categoryId: '',
                    positionId: ''
                }
            };
        getSearchResult(info).then(function(candidateList) {
            if (candidateList) {
                $scope.totalCandidates = candidateList.length + 11561;
                candidateList = candidateList.slice(0, 10);
                
                candidateList.map(function(candidate) {                
                    candidate.categories = candidate.categoryIds.map(function(categoryId) {
                        var category = {
                            id: categoryId,
                            title: getCategoryName(categoryId, $scope.categoriesList)
                        };
                        return category;
                    });
                });

                getFullname(candidateList);
                getLocationName(candidateList, $scope.countriesList, $scope.provinces.availableProvinces);

                $scope.candidateListPagination = candidateList;
            } 
        });
    };

    var getPositionListPromise = function(lang) {
        var deferred = $q.defer();

        if(!localStorageService.get('listPosition_' + lang)){
            $common.getJobPosition({ 'lang': lang }, function(result){
                if(result.status){
                    deferred.resolve(result.data.positionList);
                } else {
                    // $log.info('Khong lay duoc danh sach vi tri');
                    deferred.resolve(null);
                }
            });
        } else{
            deferred.resolve(localStorageService.get('listPosition_' + lang));
        } 

        return deferred.promise;
    };

    var getPositionList = function(lang) {
        getPositionListPromise(lang)
        .then(function(result) {
            if (result) {
                localStorageService.set('listPosition_' + lang, result);
                $scope.positions = {
                    availabePositions: result,
                };
            }            
        });
    };

    getLocation().then(function() {
        return getCategories('en');
    }).then(function() {
        return getCategories('vi');
    }).then(function() {
        return getPositionList('en');
    }).then(function() {
        return getPositionList('vi');
    }).then(function() {
        var provincesLilstOri = localStorageService.get('provincesList');
        setCurrCountry(config.countryId);
        $scope.provincesList = $employee.getProvincesListByCountry(config.countryId, provincesLilstOri);
        localStorageService.set('provincesList', $scope.provincesList);
        setCurrProvince(config.provinceId);
    }).then(function() {
        getNewCandidate();
    });

    $scope.changePage = function(currPage) {
        $window.scrollTo(0, 70);
        calcPagination(currPage);
    };
    
    $rootScope.$watch('language', function(newValue, oldValue)
    {
        if (localStorageService.get("listPosition_" + newValue))
        {
            if(!$scope.positions) {
                $scope.positions = {};
            }
            $scope.positions.availabePositions = localStorageService.get("listPosition_" + newValue);
        }
        if (localStorageService.get("categoriesList_" + newValue))
        {
            $scope.categoriesList = localStorageService.get("categoriesList_" + newValue);
        }
        if (localStorageService.get("provincesList"))
        {
            if(!$scope.provinces) {
                $scope.provinces = {};
            }
            $scope.provinces.availableProvinces = localStorageService.get("provincesList");
        }
    });

    $scope.openModalCvCandidate = function (employee) {
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'modalCvCandidate.html',
            controller: 'ModalCvCandidateCtrl',
            size: 'lg',
             resolve: {
                data: function () {
                    return {
                            employee: {
                                employeeId: employee.employeeId,
                                employeeEmail: false
                            },
                            employer: $scope.employer
                        };
                }
            }
        });

        modalInstance.result.then(function(candidate) {
            if (candidate) {
                $scope.candidateListPagination.map(function(candidateOri) {
                    if (candidateOri.employeeId === candidate.employeeId) {
                        candidateOri.viewed = candidate.viewed;
                    }
                });
            }
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    // Search candidate
    $scope.searchCandidate = function() {
        $scope.searching = true;
        var info = getInfoObj();
        getSearchResult(info).then(function(candidateList) {
            if (candidateList) {
                $scope.resultSearch = true;
                setSearchResult(candidateList);
            } else {
                $scope.resultSearch = false;
            }          
        });
    };

    $scope.changeItemsPerPage = function() {
        $scope.itemsPerPage = $scope.optionNumbers.selectedNumber.value;
        $scope.numPages = Math.ceil($scope.candidatesList/$scope.itemsPerPage);

        if ($scope.currPage > $scope.totalPages) {
            $scope.currPage = $scope.totalPages;
        } 

        var start = ($scope.currPage - 1)*$scope.itemsPerPage;
        var end = $scope.currPage*$scope.itemsPerPage;
        $scope.candidateListPagination = $scope.candidatesList.slice(start, end);
    };
});