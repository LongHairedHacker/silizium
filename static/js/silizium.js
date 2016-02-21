(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
exports.formatters = {};
function float(value) {
    return value.toFixed(3);
}
exports.formatters['float'] = float;
function temperature(value) {
    return value.toFixed(2) + '°C';
}
exports.formatters['temperature'] = temperature;

},{}],2:[function(require,module,exports){
"use strict";
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
exports.expectProperty = expectProperty;
function expectNumber(name, min, max, json) {
    expectProperty(name, 'number', json);
    if (json[name] < min || json[name] > max) {
        throw new Error("Property " + name + " should be in range " + min + " to " + max);
    }
}
exports.expectNumber = expectNumber;
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
exports.expectMap = expectMap;

},{}],3:[function(require,module,exports){
"use strict";
var siliziumsocket = require('./siliziumsocket');
var jsonutils = require('./jsonutils');
var registry_1 = require('./widgets/registry');
var widgetInstances = [];
var socket = new siliziumsocket.Socket('http://' + document.domain + ':' + location.port);
socket.onConnection(function () {
    socket.getWidgets(setupWidgets);
});
function setupWidgets(widgetConfig) {
    widgetInstances = [];
    var widgetContainer = $('.widget-container');
    widgetContainer.empty();
    for (var _i = 0, widgetConfig_1 = widgetConfig; _i < widgetConfig_1.length; _i++) {
        var row = widgetConfig_1[_i];
        var rowElement = $('<div class="row"></div>').appendTo(widgetContainer);
        for (var _a = 0, row_1 = row; _a < row_1.length; _a++) {
            var widget = row_1[_a];
            jsonutils.expectProperty('type', 'string', widget);
            var widgetElement = $('<div class="widget"></div>').appendTo(rowElement);
            widgetInstances.push(new (registry_1.default(widget.type))(socket, widgetElement, widget));
        }
    }
}

},{"./jsonutils":2,"./siliziumsocket":4,"./widgets/registry":7}],4:[function(require,module,exports){
"use strict";
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
exports.Socket = Socket;

},{}],5:[function(require,module,exports){
"use strict";
var jsonutils = require('../jsonutils');
var formatters_1 = require('../formatters');
var BaseWidget = (function () {
    function BaseWidget(_socket, _element, _config) {
        var _this = this;
        this._socket = _socket;
        this._element = _element;
        this._config = _config;
        jsonutils.expectProperty('type', 'string', _config);
        jsonutils.expectProperty('topics', 'object', _config);
        jsonutils.expectMap('string', _config.topics);
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
        if (formatters_1.formatters[formatterName] === undefined) {
            console.log(msg);
            throw new Error("No formatter named " + formatterName);
        }
        return formatters_1.formatters[formatterName](msg.value);
    };
    return BaseWidget;
}());
exports.BaseWidget = BaseWidget;
exports.widgetMaxWidth = 5;

},{"../formatters":1,"../jsonutils":2}],6:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var jsonutils = require('../jsonutils');
var basewidget_1 = require('./basewidget');
var formatters_1 = require('../formatters');
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
        jsonutils.expectProperty('label', 'string', _config);
        jsonutils.expectProperty('min', 'number', _config);
        jsonutils.expectProperty('min', 'number', _config);
        var topic = Object.keys(_config.topics)[0];
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
            valueFontFamily: "px437_amstradpc1512regular",
            textRenderer: formatters_1.formatters[_config.topics[topic]]
        });
        _socket.getLastMessage(topic, function (msg) { return _this._onMQTTMessage(msg); });
    }
    GageWidget.prototype._onMQTTMessage = function (msg) {
        this._gage.refresh(msg.value);
    };
    return GageWidget;
}(basewidget_1.BaseWidget));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GageWidget;

},{"../formatters":1,"../jsonutils":2,"./basewidget":5}],7:[function(require,module,exports){
"use strict";
var textwidget_1 = require('./textwidget');
var gagewidget_1 = require('./gagewidget');
;
var widgetRegistry = {
    'text-widget': textwidget_1.default,
    'gage-widget': gagewidget_1.default
};
function getWidget(name) {
    if (widgetRegistry[name] === undefined) {
        throw new Error("Unkown widget: " + name);
    }
    return widgetRegistry[name];
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getWidget;

},{"./gagewidget":6,"./textwidget":8}],8:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var jsonutils = require('../jsonutils');
var basewidget_1 = require('./basewidget');
var TextWidget = (function (_super) {
    __extends(TextWidget, _super);
    function TextWidget(_socket, _element, _config) {
        var _this = this;
        _super.call(this, _socket, _element, _config);
        this._config = _config;
        if (Object.keys(_config.topics).length !== 1) {
            throw new Error("TextWidget takes exactly one topic");
        }
        jsonutils.expectProperty('label', 'string', _config);
        _element.addClass('text-widget');
        $('<div class="label">' + _config.label + '</div>').appendTo(_element);
        this._value = $('<div class="value"></div>').appendTo(_element);
        _socket.getLastMessage(Object.keys(_config.topics)[0], function (msg) { return _this._onMQTTMessage(msg); });
    }
    TextWidget.prototype._onMQTTMessage = function (msg) {
        this._value.text(this._format(msg));
    };
    return TextWidget;
}(basewidget_1.BaseWidget));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TextWidget;

},{"../jsonutils":2,"./basewidget":5}]},{},[3]);
