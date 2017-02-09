'use strict';
angular.module('api').factory('$socket', function(
    socketUrl, $log)
{
    var ws = new WebSocket(socketUrl);
    var handlers = {};
    ws.onopen = function()
    {
        ws.onmessage = function(message)
        {
            var parsedMessage = angular.fromJson(message.data);
            if (handlers[parsedMessage.id])
            {
                handlers[parsedMessage.id](parsedMessage);
            }
        };
    };
    return {
        instance: ws,
        close: function()
        {
            ws.close();
        },
        send: function(message)
        {
            ws.send(message);
        },
        on: function(event, callback)
        {
            handlers[event] = callback;
        }
    };
}).factory('$interviewSocket', function($socket)
{
    return {
        chat: function(info, callback)
        {
            $socket.send(angular.toJson(
            {
                'id': 'chat',
                'userId': info.userId,
                'text': info.text
            }), callback);
        },
        onChatEvent: function(callback)
        {
            $socket.on('chatEvent', callback);
        },
        whiteboard: function(info, callback)
        {
            $socket.send(angular.toJson(
            {
                'id': 'whiteboard',
                'userId': info.userId,
                'object': info.object,
                'event': info.event
            }), callback);
        },
        onWhiteboardEvent: function(callback)
        {
            $socket.on('whiteboardEvent', callback);
        },
        onEndMeetingEvent: function(callback)
        {
            $socket.on('endMeetingEvent', callback);
        }
    };
});