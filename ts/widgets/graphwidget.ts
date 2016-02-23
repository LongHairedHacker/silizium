import * as jsonutils from '../jsonutils';
import {Socket, MQTTMessage} from '../siliziumsocket';
import {WidgetConfigBase, BaseWidget} from './basewidget';
import {formatters} from '../formatters';

interface GraphWidgetConfig extends WidgetConfigBase {
	label: string,
	secondsBack : number;
}

declare var Flotr : any;

const Colors = ['#ff9827', '#a8641a', '#54320d'];

export default class GraphWidget extends BaseWidget {

	private _data : [number, number][][];
	private _min : number;
	private _max : number;

	private _topics : string[];

	private _timeout : number;
	private _graphElement : JQuery;
	private _legendElement : JQuery;

	constructor(_socket : Socket, _element : JQuery, protected _config : GraphWidgetConfig) {
		super(_socket, _element, _config);

		if(Object.keys(_config.topics).length > 3) {
			throw new Error("GageWidget takes at most 3 topics");
		}

		jsonutils.expectProperty('label', 'string', _config);
		jsonutils.expectProperty('secondsBack', 'number', _config);

		_element.addClass('graph-widget');
		this._graphElement = $('<div class="graph"></div>').appendTo(_element);
		$('<br/>').appendTo(_element);
		this._legendElement = $('<div class="legend"></div>').appendTo(_element);

		this._topics = Object.keys(_config.topics);

		this._data = [];
		var index = 0;
		for(var topic of this._topics) {
			$('<div style="color : ' + Colors[index] + ';">&#x25a0; ' + topic + '</div>').appendTo(_element);
			index++;

			var series : [number, number][] = [];
			this._data.push(series);

			_socket.getHistory(topic, _config.secondsBack, (msgs : MQTTMessage[]) => {
				for(var {topic, time, value} of msgs) {
					var index = this._topics.indexOf(topic);
					this._data[index].push([time, value]);

					this._updateRange(value);
				}
				this._redrawGraph();
			});
		}
	}

	private _redrawGraph(): void {
		window.clearTimeout(this._timeout);

		var now = (new Date()).getTime();
		var backThen = now - this._config.secondsBack * 1000;

		var delta = (this._max - this._min) * 0.1;

		var graph = Flotr.draw(this._graphElement.get()[0], this._data, {
			title: this._config.label,
			colors: Colors,
			xaxis: {
				mode: 'time',
				timeMode : 'local',
				min : backThen,
				max : now
			},
			yaxis: {
				min : this._min - delta,
				max : this._max + delta,
			},
			grid: {
				outlineWidth: 2,
				labelMargin: 6,
				color: '#42270a',
				tickColor: '#42270a'
			},
		});

		var delay = (now - backThen) / graph.plotWidth;
		this._timeout = window.setTimeout(() => this._redrawGraph(), delay);
	}

	private _updateRange(value : number) {
		if(this._min === undefined) {
			this._min = value;
		}

		if(this._max === undefined) {
			this._max = value;
		}

		this._max = Math.max(value, this._max);
		this._min = Math.min(value, this._min);
	}

	protected _onMQTTMessage(msg : MQTTMessage) {
		var index = this._topics.indexOf(msg.topic);

		this._data[index].push([msg.time, msg.value])
		this._updateRange(msg.value);

		var now = (new Date()).getTime();
		var backThen = now - this._config.secondsBack * 1000;
		this._data[index] = this._data[index].filter((point) => point[0] >= backThen && point[0] <= now);

		this._redrawGraph();
	}
}
