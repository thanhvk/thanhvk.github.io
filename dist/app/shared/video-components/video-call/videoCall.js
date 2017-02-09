"use strict";
angular.module('app').directive('videoCall', function() {
    return {
        restrict: 'E',
        templateUrl: 'app/shared/video-components/video-call/videoCall.html',
        scope: {
            moderator: '@',
            candidate: '@',
            meetingId: '@',
            memberId: '@',
            role: '@',
            control: '=?control'
        },
        controller: function($rootScope, $scope, deviceDetector, $socket, $interval, $sce, $translate,$log,iceServers,_) {
            var mediaRecorder;
            var recordedBlobs;
            // var sourceBuffer;
            var onRecordDataReady;

            var localWebcam = document.getElementById('localCamera');
            var remoteWebcam = document.getElementById('remoteCamera');
            var callAvail = false;
            $scope.isStarted = false;
            var registered =  false;
            
            function sendMessage(message) {
                var jsonMessage = JSON.stringify(message);
                $log.info('Senging message: ' + jsonMessage);
                $socket.send(jsonMessage);
            }
            
            function onIceCandidate(candidate) {
                $log.info('Local candidate' + JSON.stringify(candidate));
                var message = {
                    id: 'onIceCandidate',
                    candidate: candidate
                };
                sendMessage(message);
            }
            
            var options = {
                    localVideo: localWebcam,
                    remoteVideo: remoteWebcam,
                    onicecandidate: onIceCandidate,
                    iceServers:iceServers
                };
            var  webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options, function(error) {
                if (error) {
                    $log.error(error);
                }});        

            function register() {
                var message = {
                    id: 'register',
                    name: $scope.memberId,
                    callId: $scope.meetingId
                };
                sendMessage(message);
            }           
            
            var joinToken =  $interval(function() {
                if (!registered && $socket.instance.readyState === 1) {
                    register();
                    registered = true;
                }
            },1000);
                
            function stop(message) {
                $scope.isStarted = false;
                callAvail = false;
                if (webRtcPeer) {
                    webRtcPeer.dispose();
                    webRtcPeer = null;
                    if (!message) {
                        message = {
                            id: 'stop'
                        };
                        sendMessage(message);
                    }
                } 
            } 
            
            function stopCommunication(){
                $log.info("Communication ended by remote peer");
                 stop(true);
            }
            
            function iceCandidate(message) {
                webRtcPeer.addIceCandidate(message.candidate);
            }

            function memberStatus(message) {
                var memberList = message.memberList;
                var remoteMember = _.find(memberList, function(m) {
                    return m.memberId === $scope.remoteParty.memberId;
                });
                var localMember = _.find(memberList, function(m) {
                    return m.memberId === $scope.localParty.memberId;
                });
                if (remoteMember && localMember) {
                    $scope.remoteParty.id = remoteMember.id;
                    $scope.localParty.id = localMember.id;
                    callAvail = true;
                } else {
                    callAvail = false;
                }
            }
            var call = $interval(function() {
                
                if ($scope.role === 'candidate' || !callAvail || $scope.isStarted){ 
                    return;
                }               
                
                webRtcPeer.generateOffer(function(error, offerSdp) {
                        if (error) {
                            $log.error(error);
                        } else {
                            var message = {
                                id: 'call',
                                from: $scope.localParty.id,
                                to: $scope.remoteParty.id,
                                sdpOffer: offerSdp
                            };
                            $scope.isStarted = true;
                            sendMessage(message);
                        }
                    
                });
            }, 1000);

            function resgisterResponse(message) {
                if (message.response !== 'accepted'){
                    $log.info('user not registered');
                }
            }
                
            function callResponse(message) {
                if (message.response !== 'accepted') {
                    $log.info('Call not accepted by peer. Closing call');
                    var errorMessage = message.message ? message.message : 'Unknown reason for call rejection.';
                    $log.info(errorMessage);
                    stop(true);
                } else {
                    webRtcPeer.processAnswer(message.sdpAnswer);
                    $scope.isStarted = true;
                }
            }

            function startCommunication(message) {
                webRtcPeer.processAnswer(message.sdpAnswer);
            }

            function incomingCall() {
                if ( !callAvail || $scope.isStarted) {
                    return;
                }
                webRtcPeer.generateOffer(function(error, offerSdp) {
                        if (error) {
                            $log.error(error);
                        }
                        var response = {
                            id: 'incomingCallResponse',
                            from: $scope.localParty.id,
                            to: $scope.remoteParty.id,
                            callResponse: 'accept',
                            sdpOffer: offerSdp
                        };
                        sendMessage(response);
                    
                });
            }      

            $scope.toggleAudio = function() {
                if (localWebcam && localStream) {
                    var audioTrack = localStream.getAudioTracks()[0];
                    $scope.audio = !$scope.audio;
                    audioTrack.enabled = $scope.audio;
                }
            };
            $scope.toggleVideo = function() {
                if (localWebcam && localStream) {
                    var videoTrack = localStream.getVideoTracks()[0];
                    $scope.video = !$scope.video;
                    videoTrack.enabled = $scope.video;
                }
            };
            var handleDataAvailable = function(event) {
                if (event.data && event.data.size > 0) {
                    recordedBlobs.push(event.data);
                }
                if (deviceDetector.browser === 'firefox' && !$scope.recordMode) {
                    var superBuffer = new Blob(recordedBlobs, {
                        type: 'video/webm'
                    });
                    $scope.control.file = new File([superBuffer], "upload.webm");
                    onRecordDataReady($scope.control.file);
                }
            };
            var handleStop = function(event) {
                $log.info('Recorder stopped: ', event);
            };
            $scope.startRemoteRecording = function() {
                if ($scope.recordMode) {
                    return;
                }
                recordedBlobs = [];
                var options = {
                    mimeType: 'video/webm;codecs=vp8'
                };
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    $log.info(options.mimeType + ' is not Supported');
                    options = {
                        mimeType: 'video/webm;codecs=vp8'
                    };
                    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                        $log.info(options.mimeType + ' is not Supported');
                        options = {
                            mimeType: 'video/webm'
                        };
                        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                            $log.info(options.mimeType + ' is not Supported');
                            options = {
                                mimeType: ''
                            };
                        }
                    }
                }
                try {
                    mediaRecorder = new MediaRecorder(webRtcPeer.getRemoteStream(), options);
                } catch (e) {
                    $log.error('Exception while creating MediaRecorder: ' + e);
                    $log.error('Exception while creating MediaRecorder: ' + e + '. mimeType: ' + options.mimeType);
                    return;
                }
                $log.info('Created MediaRecorder', mediaRecorder, 'with options', options);
                mediaRecorder.onstop = handleStop;
                mediaRecorder.ondataavailable = handleDataAvailable;
                mediaRecorder.start();
                $scope.recordMode = true;
            };
            $scope.stopRemoteRecording = function(callback) {
                onRecordDataReady = callback;
                mediaRecorder.stop();
                $log.info("Stop recording", recordedBlobs);
                $scope.recordMode = false;
                // For Firefox, the browser buffer media data and release upon stop recording
                // For Chrome, the browser release data whenever it is available
                if (deviceDetector.browser === 'chrome') {
                    var superBuffer = new Blob(recordedBlobs, {
                        type: 'video/webm'
                    });
                    $scope.control.file = new File([superBuffer], "upload.webm");
                    onRecordDataReady($scope.control.file);
                }
            };
            
            $rootScope.$on('$routeChangeStart', function (event, next, current) {
              if (!current) {
                  $interval.cancel(joinToken);
                  $interval.cancel(call);
                  $socket.close();
                  stop();
              }
            });

            function init() {
                if ($scope.role === 'moderator') {
                    $scope.remoteParty = JSON.parse($scope.candidate);
                    $scope.localParty = JSON.parse($scope.moderator);
                    $scope.remoteParty.title = $translate.instant("conference.candidate");
                    $scope.localParty.title = $translate.instant("conference.interviewer");
                }
                if ($scope.role === 'candidate') {
                    $scope.localParty = JSON.parse($scope.candidate);
                    $scope.remoteParty = JSON.parse($scope.moderator);
                    $scope.remoteParty.title = $translate.instant("conference.interviewer");
                    $scope.localParty.title = $translate.instant("conference.candidate");
                }
                $scope.recordMode = false;
                $scope.control = {
                    stopRemoteRecording: $scope.stopRemoteRecording,
                    startRemoteRecording: $scope.startRemoteRecording,
                    file: null,
                };
               
                $socket.on('registerResponse',resgisterResponse);
                $socket.on('memberStatus',memberStatus);
                $socket.on('callResponse',callResponse);
                $socket.on('incomingCall',incomingCall);
                $socket.on('startCommunication',startCommunication);
                $socket.on('stopCommunication',stopCommunication);
                $socket.on('iceCandidate',iceCandidate);
                
            }

            init();
        }
    };
});