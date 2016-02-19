import * as jsonutils from '../jsonutils';
import {Socket, MQTTMessage} from '../siliziumsocket';
import {formatters} from '../formatters';

export interface WidgetConfigBase {
	type: string;
	topics : {[topic: string] : string};
	width : number;
}

export abstract class BaseWidget {

	constructor(protected _socket : Socket, protected _element : JQuery, protected _config : WidgetConfigBase) {
		jsonutils.expectProperty('type', 'string', _config);
		jsonutils.expectProperty('width', 'number', _config);
		jsonutils.expectProperty('topics', 'object', _config);
		jsonutils.expectMap('string', _config.topics);

		_socket.onConnection(() => {
			this._registerCallbacks();
		});
	};


	protected _registerCallbacks() {
		for(var topic in this._config.topics) {
			this._socket.onMQTTMessage(topic, (msg) => this._onMQTTMessage(msg));
		}
	}


	protected abstract _onMQTTMessage(msg : MQTTMessage);


	protected _format(msg: MQTTMessage) : string {
		if(this._config.topics[msg.topic] === undefined) {
			console.log(msg);
			throw new Error("No formatter defined for " + msg.topic);
		}

		var formatterName = this._config.topics[msg.topic]
		if(formatters[formatterName] === undefined) {
			console.log(msg);
			throw new Error("No formatter named " + formatterName);
		}

		return formatters[formatterName](msg.value);
	}
}


export const widgetMaxWidth : number = 5;
