/// <reference path="definitions/socket.io-client.d.ts"/>

/// <reference path="widgets/basewidget.ts"/>

module silizium {

	interface ConnectionCallback {
		() : void;
	}

	export interface MQTTMessage {
		time : number;
		topic : string;
		value : number;
	}

	interface MQTTMessageCallback {
		(msg : MQTTMessage) : void;
	}

	interface WidgetsCallback {
		(widgets : widgets.WidgetConfigBase[][]) : void;
	}

	interface HistoryCallback {
		(history : MQTTMessage[]) : void;
	}

	export class Socket {
		private _socket : SocketIOClient.Socket;

		private _connectionCallbacks : ConnectionCallback[];
		private _messageCallbacks : {[topic : string] : MQTTMessageCallback[]};


		constructor(url: string) {
			this._connectionCallbacks = [];
			this._messageCallbacks = {};

			this._socket = io.connect(url);

			this._socket.on('connect', () : void => {
				this._messageCallbacks = {};

				this._socket.on('mqtt_message', (msg : MQTTMessage) : void => this._emitMQTTMessage(msg));

				this._connectionCallbacks.forEach((callback) => {
					callback();
				});
			});
		}


		public onConnection(callback : ConnectionCallback) {
			if(this._socket.connected) {
				callback();
			} else {
				this._connectionCallbacks.push(callback);
			}
		}


		public onMQTTMessage(topic : string, callback: MQTTMessageCallback) : void {
			if(this._messageCallbacks[topic] === undefined) {
				this._messageCallbacks[topic] = [];
			}

			this._messageCallbacks[topic].push(callback);
		}


		private _emitMQTTMessage(msg : MQTTMessage) : void {
			if(msg['time'] === undefined  || msg['topic'] === undefined || msg['value'] === undefined) {
				console.error("Ignoring invalid message: ", msg);
				return;
			}

			if(this._messageCallbacks[msg.topic] !== undefined) {
				this._messageCallbacks[msg.topic].forEach((callback) => {
					callback(msg);
				});
			}
		}

		public getWidgets(callback: WidgetsCallback) {
			this._socket.emit('get_widgets', {}, (json : widgets.WidgetConfigBase[][]) => {
				if(!(json instanceof Array) || !(json.every((row) => row instanceof Array))) {
					throw new Error("Invalid widget config.");
				}

				callback(json)
			});
		}


		public getHistory(topic : string, secondsBack : number, callback : HistoryCallback) {
			this._socket.emit('get_history',
								{topic: topic, secondsBack: secondsBack},
								(json : MQTTMessage[]) => callback(json));
		}

		public getLastMessage(topic : string, callback : MQTTMessageCallback) {
			this._socket.emit('get_last_message',
								{topic: topic},
								(json : MQTTMessage) => callback(json));
		}

	}
}
