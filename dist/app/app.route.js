'use strict';
angular.module('app').config(function ($routeProvider)
{
    $routeProvider.when('/',
    {
        templateUrl: 'app/modules/main/views/default.html',
        controller: 'DefaultController',
        cache: false,
        controllerAs: 'app/modules/main/controllers/default'
    });
});
