import * as jsonutils from '../jsonutils';
import {Socket, MQTTMessage} from '../siliziumsocket';
import {WidgetConfigBase, BaseWidget} from './basewidget';
import {formatters} from '../formatters';

interface GageWidgetConfig extends WidgetConfigBase {
	label: string,
	min : number,
	max : number
}


declare class JustGage {
	constructor(opts : any);
	public refresh(value : number);
};

export default class GageWidget extends BaseWidget {

	private _gage : any;

	constructor(_socket : Socket, _element : JQuery, protected _config : GageWidgetConfig) {
		super(_socket, _element, _config);

		if(Object.keys(_config.topics).length !== 1) {
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
			hideMinMax : true,
			gaugeColor: "#42270a",
			levelColors: ["#df8522"],
			titleFontColor: "#df8522",
			titleFontFamily: "px437_amstradpc1512regular",
			valueFontColor: "#df8522",
			valueFontFamily: "px437_amstradpc1512regular",
			textRenderer: formatters[_config.topics[topic]]
		});

		_socket.getLastMessage(topic, (msg) => this._onMQTTMessage(msg));
	}

	protected _onMQTTMessage(msg : MQTTMessage) {
		this._gage.refresh(msg.value);
	}
}
