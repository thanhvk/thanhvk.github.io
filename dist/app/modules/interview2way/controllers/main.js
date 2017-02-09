'use strict';
angular.module('interview2wayModule').controller('ConferenceInterviewMainController', function($scope, $rootScope,
        $location, $routeParams, _, localStorageService,$conference, $interviewSocket, $socket,
        $interval, $sce,blockUI,$common,$window) {
    var init = function() {
        $scope.alertMessage = false;
        $scope.conference = JSON.parse(sessionStorage.getItem("conference"));
        $scope.job = $scope.conference.job;
        $scope.questionList = $scope.conference.questionList;
        $scope.meetingId = $routeParams.meetingId;
        $scope.memberId = $routeParams.memberId;
        $scope.moderator = $scope.conference.moderator;
        $scope.candidate = $scope.conference.candidate;
        if ($scope.moderator && $scope.moderator.memberId === $scope.memberId) {
            $scope.profile = $scope.moderator;
            $scope.otherProfile = $scope.candidate;
        }
        if ($scope.candidate && $scope.candidate.memberId === $scope.memberId) {
            $scope.profile = $scope.candidate;
            $scope.otherProfile = $scope.moderator;
        }

      if($scope.otherProfile.role === 'candidate'){
          $scope.you = {
            userId:$scope.profile.memberId,
            avatar:'assets/images/icon.png',
            userName:$scope.profile.name
        };
      } else {
        $scope.you = {
                userId:$scope.profile.memberId,
                avatar:'assets/images/icProfile.png',
                userName:$scope.profile.name
        };
      }
        $scope.chatMessages = [];
        $scope.callControl = {};
        
        $scope.completeQuestion = _.countBy($scope.questionList,function(question) {
            return question.attempted;
        })[true] === $scope.questionList.length;
        $scope.assessmentResult = {};
        
    };
    
    $scope.submitAssessment = function(){

        $scope.assessmentResult.candidateId = $scope.candidate.id;
        $scope.assessmentResult.questionList = [];
        if (!$scope.assessmentResult.comment){
            $scope.assessmentResult.comment = '';
        }
        var info = {
            meetingId: $scope.meetingId,
            memberId: $scope.memberId,
            candidateMemberId:$scope.candidate.memberId,
            assessmentResult: $scope.assessmentResult
        };
        $conference.submitCandidateAssessment(info, function(result){
            if(result.status && result.data.result){
                $scope.assessmentResult.id = result.data.assessmentId;
            }
        });
    };

    $scope.userChat = function(message) {
        var params = {
            userId: message.userId,
            text: message.text
        };
        $interviewSocket.chat(params, function() {});
    };
    
    $interviewSocket.onChatEvent(function(event) {
      var message = {};
      var dateChat = new Date();
      if($scope.otherProfile.role === 'candidate'){
        message = {
          id: Math.floor(Date.now() / 1000),
          userId: $scope.otherProfile.memberId,
          text:event.text,
          avatar:'assets/images/icProfile.png',
          userName:$scope.otherProfile.name,
          date:dateChat
        };
      } else {
        message = {
            id: Math.floor(Date.now() / 1000),
            userId: $scope.otherProfile.memberId,
            text:event.text,
            avatar:'assets/images/icon.png',
            userName:$scope.otherProfile.name,
            date:dateChat
        };
      }
        $scope.chatMessages.push(message);
      $scope.alertMessage = true;
    });
    
    $scope.closeAlertMessage = function() {
        $scope.alertMessage = false;
    };
   
    
    $scope.leaveMeeting = function() {
        if($scope.profile.role === 'moderator'){
            $window.open(location, '_self').close();
        } else {
            $location.path("/conference/thankyou");
        }
    };
    
    $scope.$on('$destroy', function() {
        $scope.$broadcast('timer-stop');
        sessionStorage.clear();
    });
    
    init();
    
    $scope.startRecord = function(question) {
        question.recordMode = true;
        $scope.$broadcast('timer-start');
        $scope.callControl.startRemoteRecording();
    };
    
    $scope.stopRecord = function(question) {
        $scope.$broadcast('timer-stop');
        question.recordMode = false;
        blockUI.start();
         var callback = function(file) {
             blockUI.stop();
             $common.uploadVideo({
                 file: file
             }, function(result) {
                 if (result.status && result.data.result) {
                     $conference.answerInterviewQuestion({
                         meetingId:$scope.meetingId,
                         memberId: $scope.memberId,
                         candidateMemberId: $scope.candidate.memberId,
                         questionId: question.id,
                         videoUrl: result.data.url
                     }, function(result) {
                         if (result.status && result.data.result) {
                             question.attempted = true;
                             $scope.completeQuestion = _.countBy($scope.questionList,function(question) {
                                return question.attempted;
                             })[true] === $scope.questionList.length;
                         } 
                     });
                 } 
             });
         };
         $scope.callControl.stopRemoteRecording(callback);
         
    };
    
    $scope.skip = function(question) {
         if (question.recordMode) {
             $scope.$broadcast('timer-stop');
             question.recordMode = false;
             $scope.callControl.stopRemoteRecording();
         }
         $conference.answerInterviewQuestion({
             meetingId:$scope.meetingId,
             memberId: $scope.memberId,
             candidateMemberId: $scope.candidate.memberId,
             questionId: question.id,
             videoUrl: ""
         }, function(result) {
             if (result.status && result.data.result) {
                 question.attempted = true;
                 $scope.completeQuestion = _.countBy($scope.questionList,function(question) {
                    return question.attempted;
                 })[true] === $scope.questionList.length;
             } 
         });
    
    };
    
    $interviewSocket.onEndMeetingEvent(function() {
        $location.path("/conference/");
    });
    
    $scope.endMeeting = function() {
        var params = {
            meetingId: $routeParams.meetingId,
            memberId: $routeParams.memberId
        };
        $interviewSocket.onEndMeetingEvent(params, function() {});
        $location.path("/conference/thankyou");
          
    };
    
    $scope.showTabset_ = function() {
      $scope.showTabset = false;
    };

});