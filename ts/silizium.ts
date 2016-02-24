import * as siliziumsocket from './siliziumsocket';
import * as jsonutils from './jsonutils';
import * as widgets from './widgets/basewidget';
import getWidget from './widgets/registry';

var widgetInstances : widgets.BaseWidget[] = [];



var	socket = new siliziumsocket.Socket();
socket.onConnection(() => {
	socket.getWidgets(setupWidgets);
});



function setupWidgets(widgetConfig : widgets.WidgetConfigBase[][]) {
	widgetInstances = [];

	var widgetContainer = $('.widget-container');
	widgetContainer.empty();

	for(var row of widgetConfig) {

		var rowElement = $('<div class="row"></div>').appendTo(widgetContainer);

		for(var widget of row) {
			jsonutils.expectProperty('type', 'string', widget);

			var widgetElement = $('<div class="widget"></div>').appendTo(rowElement);

			widgetInstances.push(new (getWidget(widget.type))(socket, widgetElement, widget));
		}
	}
}
