"use strict";

angular.module('app').directive('whiteboard', function() {
    return {
        restrict: 'E',
        templateUrl: 'app/shared/whiteboard/whiteboard.html',
        controllerAs: 'ctrl',
        scope: {
            meetingId:'@',
            memberId:'@',
        },

        controller: function($rootScope, $scope, $element, $interviewSocket, $translate, toastr, $utilities) {
            
            var init = function() {
                $scope.whiteboard = {};
                $scope.displayImage = true;
            };
            var chooseFile = $translate.instant('chooseFile');
            var capacityUpload = $translate.instant('capacityUpload');

            $scope.insertFile = function(file) {
                if (!file)
                    return;
                if(file.size > 10485760){
                    toastr.error(capacityUpload);
                } else {
                    if(file.type === "application/pdf"){
                        $scope.pdfUrl = "";
                        var fileURL = URL.createObjectURL(file);
                        
                        // var params = {
                        //         meetingId: $scope.meetingId,
                        //         memberId: $scope.memberId,
                        //         event:'insertPdf',
                        //         object:fileURL
                        //     };
                        // $scope.pdfUrl = fileURL;
                        // $scope.displayImage = false;
                        // $interviewSocket.whiteboard(params,function() {});

                        var reader = new FileReader();
                        reader.onload = (function(theFile) {
                            var base64 = theFile.target.result;
                            var params = {
                                    meetingId: $scope.meetingId,
                                    memberId: $scope.memberId,
                                    event:'insertPdf',
                                    object:base64
                                };
                            // $scope.whiteboard.image = {
                            //         data:base64
                            // };
                            $scope.pdfUrl = fileURL;
                            $scope.displayImage = false;
                            $interviewSocket.whiteboard(params,function() {});
                        });
                        reader.readAsDataURL(file);
                    } else if(file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/jpg") {
                        var reader = new FileReader();
                        reader.onload = (function(theFile) {
                            var base64 = theFile.target.result;
                            var params = {
                                    meetingId: $scope.meetingId,
                                    memberId: $scope.memberId,
                                    event:'insertImage',
                                    object:base64
                                };
                            $scope.whiteboard.image = {
                                    data:base64
                            };
                            $scope.pdfUrl = null;
                            $scope.displayImage = true;
                            $interviewSocket.whiteboard(params,function() {});
                        });
                        reader.readAsDataURL(file);
                    } else {
                        toastr.error(chooseFile);
                    }
                }
            };

            $interviewSocket.onWhiteboardEvent (function(event) {
                if (event.event === 'insertImage') {
                    $scope.displayImage = true;
                    $scope.pdfUrl = "";
                    $scope.whiteboard.image = {
                        data:event.object
                    };
                }

                if (event.event === 'insertPdf') {
                    // console.log("test ok");
                    // 
                    $scope.displayImage = false;
                    // console.log("2");
                    var filePdf = event.object;
                    // console.log("3");
                    // console.log(filePdf);
                    var file = filePdf.split(',')[1];
                    var byteCharacters = atob(file);
                    var byteNumbers = new Array(byteCharacters.length);
                    for (var i = 0; i < byteCharacters.length; i++)
                    {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    var byteArray = new Uint8Array(byteNumbers);
                    var data = new Blob([byteArray],
                    {
                        type: 'application/pdf'
                    });

                    // // var currentBlob = $utilities.b64toBlob(filePdf,'application/pdf');
                    // // var currentBlob = new Blob([event.object], {type: 'application/pdf'});
                    // var binary = atob(base64str.replace(/\s/g, ''));
                    // // get binary length
                    // var len = binary.length;
                     
                    // // create ArrayBuffer with binary length
                    // var buffer = new ArrayBuffer(len);
                     
                    // // create 8-bit Array
                    // var view = new Uint8Array(buffer);
                     
                    // // save unicode of binary data into 8-bit Array
                    // for (var i = 0; i < len; i++) {
                    //  view[i] = binary.charCodeAt(i);
                    // }
                  //  var blob = $utilities.b64toBlob(file,'application/pdf');
                    $scope.pdfUrl = URL.createObjectURL(data);
                    $scope.$apply();
                    console.log($scope.pdfUrl);
                }
            });
        
            init();

        }
    };
});