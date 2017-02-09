'use strict';
angular.module('config', [])
  .constant('apiUrl', "https://demo.vietinterview.com/api")
  .constant('socketUrl', "wss://demo.vietinterview.com:9443/one2one")
  .constant('iceServers', [{"url":"turn:125.212.233.5:3478?transport=udp","credential":"123456","username":"quang"}])
  .constant('enabledLog', true);
