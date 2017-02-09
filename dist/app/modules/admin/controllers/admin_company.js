'use strict';
angular.module('adminModule').controller('AdminCompanyController', function($scope, $rootScope, $location, $admin, localStorageService, $q, $log)
{
    $scope.userAdmin = localStorageService.get('userAdmin');
    $scope.viewAdmin = {
        page: "company"
    };
    var token = $scope.userAdmin.token;
    //var code = 0;
    $rootScope.doLogout = function()
    {
        $admin.logoutAccount(
        {
            token: $rootScope.userAdmin.token
        }, function(result)
        {
            if (result.status)
            {
                $scope.userAdmin = null;
                localStorageService.remove('userAdmin');
                $location.path('/admin');
            }
        });
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
    var getLicense = function(defer)
    {
        if (!localStorageService.get('licenseList'))
        {
            $admin.getLicense(
            {
                token: $scope.userAdmin.token
            }, function(result)
            {
                if (result.status && result.data.result)
                {
                    $scope.listLicense = result.data.licenseList;
                    localStorageService.set('licenseList', $scope.listLicense);
                    defer.resolve();
                }
            });
        }
        else
        {
            $scope.listLicense = localStorageService.get('licenseList');
            defer.resolve();
        }
    };
    var getCompany = function(defer)
    {
        if (!localStorageService.get('companyList'))
        {
            $admin.getCompany(
            {
                token: $scope.userAdmin.token
            }, function(result)
            {
                if (result.status && result.data.result)
                {
                    $scope.listCompany = result.data.companyList;
                    localStorageService.set('companyList', $scope.listCompany);
                }
                $scope.totalItems = $scope.listCompany.length;
                defer.resolve();
            });
        }
        else
        {
            $scope.listCompany = localStorageService.get('companyList');
            $scope.totalItems = $scope.listCompany.length;
            defer.resolve();
        }
        // localStorageService.set('companyList', $scope.listCompany);
        $scope.viewby = 8;
        $scope.currentPage = 1;
        $scope.itemsPerPage = $scope.viewby;
        $scope.maxSize = 5;
    };
    $scope.getEmail = function(Companyid)
    {
        var deferred = $q.defer();
        var email = 0;
        var company = "";
        $admin.getLicenseInfo(
        {
            token: token,
            companyId: Companyid
        }, function(result)
        {
            if (result.status)
            {
                email = result.data.licenseInfo.email;
                company = email + " / " + result.data.licenseInfo.license.email;
                deferred.resolve(company);
            }
            else
            {
                company = email + " / ";
                deferred.resolve(company);
            }
        });
        return deferred.promise;
    };
    $scope.getPoint = function(Companyid)
    {
        var deferred = $q.defer();
        var pointed = 0;
        var point = "";
        $admin.getLicenseInfo(
        {
            token: token,
            companyId: Companyid
        }, function(result)
        {
            if (result.status)
            {
                pointed = result.data.licenseInfo.point;
                point = pointed + " / " + result.data.licenseInfo.license.point;
                deferred.resolve(point);
            }
            else
            {
                point = pointed + " / ";
                deferred.resolve(point);
            }
        });
        return deferred.promise;
    };
    var getPointCompany = function(defer)
    {
        $scope.listCompany.reduce(function(prev, curr)
        {
            return prev.then(function()
            {
                return $scope.getPoint(curr.id).then(function(pointC)
                {
                    if(pointC) {
                        curr.point = pointC;
                    }                   
                });
            });
        }, Promise.resolve());
        defer.resolve();
    };
    $scope.editCompany = function(comp)
    {
        localStorageService.set('chooseCompany', comp);
        $location.path("/admin/company/create_update");
    };
    $scope.newCompany = function()
    {
        localStorageService.remove('chooseCompany');
        $location.path("/admin/company/create_update");
    };
    var init = function()
    {
        var deferArray = [$q.defer(), $q.defer(), $q.defer()];
        var loopPromises = [];
        angular.forEach(deferArray, function(deferItem)
        {
            loopPromises.push(deferItem.promise);
        });
        deferArray[0].promise.then(function()
        {
            getCompany(deferArray[1]);
        });
        deferArray[1].promise.then(function()
        {
            getPointCompany(deferArray[2]);
        });
        getLicense(deferArray[0]);
        $q.all(loopPromises).then(function()
        {
            $scope.listCompany.reduce(function(prev, curr)
            {
                return prev.then(function()
                {
                    return $scope.getEmail(curr.id).then(function(company)
                    {
                        if(company) {
                            curr.used = company;
                        }
                    });
                });
            }, Promise.resolve());
        });
    };
    init();
});