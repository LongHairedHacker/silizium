/// <reference path="../definitions/es6-shim.d.ts"/>
/// <reference path="../definitions/jquery.d.ts" />

/// <reference path="../siliziumsocket.ts"/>
/// <reference path="basewidget.ts"/>

module silizium.widgets {

	export interface TextWidgetConfig extends WidgetConfigBase {
		topic : string;
		label : string;
	}

	export class TextWidget extends BaseWidget {

		protected _value : JQuery;

		constructor(_socket : Socket, _element : JQuery, protected _config : TextWidgetConfig) {
			super(_socket, _element, _config);

			if(typeof(_config.topic) !== "string" || typeof(_config.label) !== "string") {
				console.log(_config);
				throw new Error("Invalid config for TextWidgetConfig");
			}

			_element.addClass('text-widget');
			$('<div class="label">' + _config.label + '</div>').appendTo(_element);
			this._value = $('<div class="value"></div>').appendTo(_element);

			_socket.getLastMessage(_config.topic, (msg) => this._updateText(msg));
		}


		protected _registerCallbacks() {
			this._socket.onMQTTMessage(this._config.topic, (msg) => this._updateText(msg));
		}

		protected _updateText(msg : MQTTMessage) {
			this._value.text(msg.value);
		}
	}

	widgetRegistry['text-widget'] = TextWidget;
}
