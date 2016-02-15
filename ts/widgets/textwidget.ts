/// <reference path="../definitions/es6-shim.d.ts"/>
/// <reference path="../definitions/jquery.d.ts" />

/// <reference path="../siliziumsocket.ts"/>
/// <reference path="basewidget.ts"/>

module silizium.widgets {

	export interface TextWidgetConfig extends WidgetConfigBase {
		label : string;
	}

	export class TextWidget extends BaseWidget {

		protected _value : JQuery;

		constructor(_socket : Socket, _element : JQuery, protected _config : TextWidgetConfig) {
			super(_socket, _element, _config);

			if(Object.keys(_config.topics).length !== 1) {
				throw new Error("TextWidget takes exactly one topic");
			}

			if(typeof(_config.label) !== "string") {
				console.log(_config);
				throw new Error("Invalid config for TextWidgetConfig");
			}

			_element.addClass('text-widget');
			$('<div class="label">' + _config.label + '</div>').appendTo(_element);
			this._value = $('<div class="value"></div>').appendTo(_element);

			_socket.getLastMessage(Object.keys(_config.topics)[0], (msg) => this._onMQTTMessage(msg));
		}

		protected _onMQTTMessage(msg : MQTTMessage) {
			this._value.text(this._format(msg));
		}
	}

	widgetRegistry['text-widget'] = TextWidget;
}
