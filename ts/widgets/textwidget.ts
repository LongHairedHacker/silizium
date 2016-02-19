import * as jsonutils from '../jsonutils';
import {Socket, MQTTMessage} from '../siliziumsocket';
import {WidgetConfigBase, BaseWidget} from './basewidget';


export interface TextWidgetConfig extends WidgetConfigBase {
	label : string;
}

export default class TextWidget extends BaseWidget {

	protected _value : JQuery;

	constructor(_socket : Socket, _element : JQuery, protected _config : TextWidgetConfig) {
		super(_socket, _element, _config);

		if(Object.keys(_config.topics).length !== 1) {
			throw new Error("TextWidget takes exactly one topic");
		}

		jsonutils.expectProperty('label', 'string', _config);

		_element.addClass('text-widget');
		$('<div class="label">' + _config.label + '</div>').appendTo(_element);
		this._value = $('<div class="value"></div>').appendTo(_element);

		_socket.getLastMessage(Object.keys(_config.topics)[0], (msg) => this._onMQTTMessage(msg));
	}

	protected _onMQTTMessage(msg : MQTTMessage) {
		this._value.text(this._format(msg));
	}
}
