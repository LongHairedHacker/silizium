/// <reference path="definitions/es6-shim.d.ts"/>
/// <reference path="definitions/jquery.d.ts" />
/// <reference path="definitions/socket.io-client.d.ts"/>

/// <reference path="siliziumsocket.ts"/>
/// <reference path="widgets/basewidget.ts"/>

"use strict";
module silizium {

	var widgetInstances : widgets.BaseWidget[] = [];

	function addMessage(msg : silizium.MQTTMessage) : void {
		var date = new Date(msg.time);
		var dateStr = date.toLocaleDateString();
		var timeStr = date.toLocaleTimeString();

		$('.log p:first').before('<p>[' + msg.time + ' ' + dateStr + ' ' + timeStr + '] - '
									+ msg.topic + ' - ' + msg.value.toFixed(2) + ' </p>');

	}

	var socket = new silizium.Socket('http://' + document.domain + ':' + location.port);

	socket.onConnection(() => {
		socket.getHistory('/esp/temp/0', 10 * 60, (history) =>{
			history.forEach(addMessage);
			socket.onMQTTMessage('/esp/temp/0', addMessage);
		})

		socket.getWidgets(setupWidgets);
	});


	function setupWidgets(widgetConfig : widgets.WidgetConfigBase[][]) {
		widgetInstances = [];

		var widgetContainer = $('#widget-container');
		widgetContainer.empty();

		for(var row of widgetConfig) {

			var rowElement = $('<div class="pure-g"></div>').appendTo(widgetContainer);
			var rowWidth = 0;

			for(var widget of row) {
				jsonutils.expectNumber('width', 1, widgets.widgetMaxWidth, widget);
				jsonutils.expectProperty('type', 'string', widget);

				var gridElement = $('<div class="pure-u-1 pure-u-md-'
										+ widget.width + '-' + widgets.widgetMaxWidth + '"></div>').appendTo(rowElement);
				var widgetElement = $('<div class="widget"></div>').appendTo(gridElement);
				var widgetContent = $('<div></div>').appendTo(widgetElement);

				widgetInstances.push(new widgets.widgetRegistry[widget.type](socket, widgetContent, widget));

				rowWidth += widget.width;
			}

			var rest = widgets.widgetMaxWidth - rowWidth;
			rowElement.append('<div class="pure-u-1 pure-u-md-' + rest + '-' + widgets.widgetMaxWidth + '"></div>');
		}
	}

}
