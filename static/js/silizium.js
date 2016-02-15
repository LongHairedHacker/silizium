var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var silizium;
(function (silizium) {
    var jsonutils;
    (function (jsonutils) {
        function expectProperty(name, type, json) {
            if (json[name] === undefined) {
                console.log(json);
                throw new Error("Expected property " + name);
            }
            if (typeof (json[name]) !== type) {
                console.log(json);
                throw new Error("Expected property " + name + " to be of type " + type);
            }
        }
        jsonutils.expectProperty = expectProperty;
        function expectNumber(name, min, max, json) {
            expectProperty(name, 'number', json);
            if (json[name] < min || json[name] > max) {
                throw new Error("Property " + name + " should be in range " + min + " to " + max);
            }
        }
        jsonutils.expectNumber = expectNumber;
        function expectMap(elementType, json) {
            if (Object.keys(json).length === 0) {
                throw new Error("Expected a map, got empty object");
            }
            for (var key in json) {
                if (typeof (json[key]) !== elementType) {
                    throw new Error("Expected elements of type " + elementType + " for " + key);
                }
            }
        }
        jsonutils.expectMap = expectMap;
    })(jsonutils = silizium.jsonutils || (silizium.jsonutils = {}));
})(silizium || (silizium = {}));
var silizium;
(function (silizium) {
    silizium.formatters = {};
    function float(value) {
        return value.toFixed(3);
    }
    silizium.formatters['float'] = float;
    function temperature(value) {
        return value.toFixed(2) + '°C';
    }
    silizium.formatters['temperature'] = temperature;
})(silizium || (silizium = {}));
var silizium;
(function (silizium) {
    var widgets;
    (function (widgets) {
        var BaseWidget = (function () {
            function BaseWidget(_socket, _element, _config) {
                var _this = this;
                this._socket = _socket;
                this._element = _element;
                this._config = _config;
                silizium.jsonutils.expectProperty('type', 'string', _config);
                silizium.jsonutils.expectProperty('width', 'number', _config);
                silizium.jsonutils.expectProperty('topics', 'object', _config);
                silizium.jsonutils.expectMap('string', _config.topics);
                _socket.onConnection(function () {
                    _this._registerCallbacks();
                });
            }
            ;
            BaseWidget.prototype._registerCallbacks = function () {
                var _this = this;
                for (var topic in this._config.topics) {
                    this._socket.onMQTTMessage(topic, function (msg) { return _this._onMQTTMessage(msg); });
                }
            };
            BaseWidget.prototype._format = function (msg) {
                if (this._config.topics[msg.topic] === undefined) {
                    console.log(msg);
                    throw new Error("No formatter defined for " + msg.topic);
                }
                var formatterName = this._config.topics[msg.topic];
                if (silizium.formatters[formatterName] === undefined) {
                    console.log(msg);
                    throw new Error("No formatter named " + formatterName);
                }
                return silizium.formatters[formatterName](msg.value);
            };
            return BaseWidget;
        }());
        widgets.BaseWidget = BaseWidget;
        ;
        widgets.widgetRegistry = {};
        widgets.widgetMaxWidth = 5;
    })(widgets = silizium.widgets || (silizium.widgets = {}));
})(silizium || (silizium = {}));
var silizium;
(function (silizium) {
    var Socket = (function () {
        function Socket(url) {
            var _this = this;
            this._connectionCallbacks = [];
            this._messageCallbacks = {};
            this._socket = io.connect(url);
            this._socket.on('connect', function () {
                _this._messageCallbacks = {};
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
        Socket.prototype.getWidgets = function (callback) {
            this._socket.emit('get_widgets', {}, function (json) {
                if (!(json instanceof Array) || !(json.every(function (row) { return row instanceof Array; }))) {
                    throw new Error("Invalid widget config.");
                }
                callback(json);
            });
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
var silizium;
(function (silizium) {
    var widgetInstances = [];
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
        socket.getWidgets(setupWidgets);
    });
    function setupWidgets(widgetConfig) {
        widgetInstances = [];
        var widgetContainer = $('#widget-container');
        widgetContainer.empty();
        for (var _i = 0, widgetConfig_1 = widgetConfig; _i < widgetConfig_1.length; _i++) {
            var row = widgetConfig_1[_i];
            var rowElement = $('<div class="pure-g"></div>').appendTo(widgetContainer);
            var rowWidth = 0;
            for (var _a = 0, row_1 = row; _a < row_1.length; _a++) {
                var widget = row_1[_a];
                silizium.jsonutils.expectNumber('width', 1, silizium.widgets.widgetMaxWidth, widget);
                silizium.jsonutils.expectProperty('type', 'string', widget);
                var gridElement = $('<div class="pure-u-1 pure-u-md-'
                    + widget.width + '-' + silizium.widgets.widgetMaxWidth + '"></div>').appendTo(rowElement);
                var widgetElement = $('<div class="grid-box"></div>').appendTo(gridElement);
                widgetInstances.push(new silizium.widgets.widgetRegistry[widget.type](socket, widgetElement, widget));
                rowWidth += widget.width;
            }
            var rest = silizium.widgets.widgetMaxWidth - rowWidth;
            rowElement.append('<div class="pure-u-1 pure-u-md-' + rest + '-' + silizium.widgets.widgetMaxWidth + '"></div>');
        }
    }
})(silizium || (silizium = {}));
var silizium;
(function (silizium) {
    var widgets;
    (function (widgets) {
        var TextWidget = (function (_super) {
            __extends(TextWidget, _super);
            function TextWidget(_socket, _element, _config) {
                var _this = this;
                _super.call(this, _socket, _element, _config);
                this._config = _config;
                if (Object.keys(_config.topics).length !== 1) {
                    throw new Error("TextWidget takes exactly one topic");
                }
                silizium.jsonutils.expectProperty('label', 'string', _config);
                _element.addClass('text-widget');
                $('<div class="label">' + _config.label + '</div>').appendTo(_element);
                this._value = $('<div class="value"></div>').appendTo(_element);
                _socket.getLastMessage(Object.keys(_config.topics)[0], function (msg) { return _this._onMQTTMessage(msg); });
            }
            TextWidget.prototype._onMQTTMessage = function (msg) {
                this._value.text(this._format(msg));
            };
            return TextWidget;
        }(widgets.BaseWidget));
        widgets.TextWidget = TextWidget;
        widgets.widgetRegistry['text-widget'] = TextWidget;
    })(widgets = silizium.widgets || (silizium.widgets = {}));
})(silizium || (silizium = {}));
var silizium;
(function (silizium) {
    var widgets;
    (function (widgets) {
        ;
        var GageWidget = (function (_super) {
            __extends(GageWidget, _super);
            function GageWidget(_socket, _element, _config) {
                var _this = this;
                _super.call(this, _socket, _element, _config);
                this._config = _config;
                if (Object.keys(_config.topics).length !== 1) {
                    throw new Error("GageWidget takes exactly one topic");
                }
                silizium.jsonutils.expectProperty('label', 'string', _config);
                silizium.jsonutils.expectProperty('min', 'number', _config);
                silizium.jsonutils.expectProperty('min', 'number', _config);
                _element.addClass('gage-widget');
                this._gage = new JustGage({
                    parentNode: _element.get(0),
                    title: _config.label,
                    value: 0,
                    min: _config.min,
                    max: _config.max,
                    decimals: true,
                    hideMinMax: true,
                    gaugeColor: "#42270a",
                    levelColors: ["#df8522"],
                    titleFontColor: "#df8522",
                    titleFontFamily: "px437_amstradpc1512regular",
                    valueFontColor: "#df8522",
                    valueFontFamily: "px437_amstradpc1512regular"
                });
                _socket.getLastMessage(Object.keys(_config.topics)[0], function (msg) { return _this._onMQTTMessage(msg); });
            }
            GageWidget.prototype._onMQTTMessage = function (msg) {
                this._gage.refresh(msg.value);
            };
            return GageWidget;
        }(widgets.BaseWidget));
        widgets.GageWidget = GageWidget;
        widgets.widgetRegistry['gage-widget'] = GageWidget;
    })(widgets = silizium.widgets || (silizium.widgets = {}));
})(silizium || (silizium = {}));
