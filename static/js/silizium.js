var silizium;
(function (silizium) {
    var Socket = (function () {
        function Socket(url) {
            var _this = this;
            this._connectionCallbacks = [];
            this._messageCallbacks = {};
            this._socket = io.connect(url);
            this._socket.on('connect', function () {
                _this._socket.on('mqtt_message', function (msg) { return _this._emitMQTTMessage(msg); });
                _this._connectionCallbacks.forEach(function (callback) {
                    callback();
                });
            });
        }
        Socket.prototype.onConnection = function (callback) {
            if (this._socket.connected) {
                callback();
            }
            else {
                this._connectionCallbacks.push(callback);
            }
        };
        Socket.prototype.onMQTTMessage = function (topic, callback) {
            if (this._messageCallbacks[topic] === undefined) {
                this._messageCallbacks[topic] = [];
            }
            this._messageCallbacks[topic].push(callback);
        };
        Socket.prototype._emitMQTTMessage = function (msg) {
            if (msg['time'] === undefined || msg['topic'] === undefined || msg['value'] === undefined) {
                console.error("Ignoring invalid message: ", msg);
                return;
            }
            if (this._messageCallbacks[msg.topic] !== undefined) {
                this._messageCallbacks[msg.topic].forEach(function (callback) {
                    callback(msg);
                });
            }
        };
        Socket.prototype.getHistory = function (topic, secondsBack, callback) {
            this._socket.emit('get_history', { topic: topic, secondsBack: secondsBack }, function (json) { return callback(json); });
        };
        Socket.prototype.getLastMessage = function (topic, callback) {
            this._socket.emit('get_last_message', { topic: topic }, function (json) { return callback(json); });
        };
        return Socket;
    }());
    silizium.Socket = Socket;
})(silizium || (silizium = {}));
"use strict";
function addMessage(msg) {
    var date = new Date(msg.time);
    var dateStr = date.toLocaleDateString();
    var timeStr = date.toLocaleTimeString();
    $('.log p:first').before('<p>[' + msg.time + ' ' + dateStr + ' ' + timeStr + '] - '
        + msg.topic + ' - ' + msg.value.toFixed(2) + ' </p>');
}
var socket = new silizium.Socket('http://' + document.domain + ':' + location.port);
socket.onConnection(function () {
    socket.getHistory('/esp/temp/0', 10 * 60, function (history) {
        history.forEach(addMessage);
        socket.onMQTTMessage('/esp/temp/0', addMessage);
    });
});
