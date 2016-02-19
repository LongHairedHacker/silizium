import * as siliziumsocket from './siliziumsocket';
import * as jsonutils from './jsonutils';
import * as widgets from './widgets/basewidget';
import getWidget from './widgets/registry';

var widgetInstances : widgets.BaseWidget[] = [];

function addMessage(msg : siliziumsocket.MQTTMessage) : void {
	var date = new Date(msg.time);
	var dateStr = date.toLocaleDateString();
	var timeStr = date.toLocaleTimeString();

	$('.log p:first').before('<p>[' + msg.time + ' ' + dateStr + ' ' + timeStr + '] - '
								+ msg.topic + ' - ' + msg.value.toFixed(2) + ' </p>');

}


var	socket = new siliziumsocket.Socket('http://' + document.domain + ':' + location.port);
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

			widgetInstances.push(new (getWidget(widget.type))(socket, widgetContent, widget));

			rowWidth += widget.width;
		}

		var rest = widgets.widgetMaxWidth - rowWidth;
		rowElement.append('<div class="pure-u-1 pure-u-md-' + rest + '-' + widgets.widgetMaxWidth + '"></div>');
	}
}
