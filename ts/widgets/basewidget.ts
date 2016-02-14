/// <reference path="../definitions/es6-shim.d.ts"/>
/// <reference path="../definitions/jquery.d.ts" />


/// <reference path="../siliziumsocket.ts"/>

module silizium.widgets {

	export interface WidgetConfigBase {
		type: string;
		formater : string;
		width : number;
	}

	export abstract class BaseWidget {
		constructor(protected _socket : Socket, protected _element : JQuery, protected _config : WidgetConfigBase) {
			if(typeof(_config.type) !== "string" || typeof(_config.formater) !== "string" || typeof(_config.width) !== "number") {
				console.log(_config);
				throw new Error("Invalid config format for WidgetConfigBase");
			}

			_socket.onConnection(() => {
				this._registerCallbacks();
			});
		};

		protected abstract _registerCallbacks() : void;
	}


	interface widgetConstructor { new (_socket : Socket, _element : JQuery, _config : WidgetConfigBase): BaseWidget };

	export var widgetRegistry : {[name : string] : widgetConstructor} = {};

	export const widgetMaxWidth : number = 5;
}
