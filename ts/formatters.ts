module silizium {

	export interface Formatter {
		(value : number) : string;
	}

	export var formatters : {[name: string] : Formatter} = {};


	function float(value : number) : string {
		return value.toFixed(3);
	}
	formatters['float'] = float;

	function temperature(value : number) : string {
		return value.toFixed(2) + '°C';
	}
	formatters['temperature'] = temperature;
}
