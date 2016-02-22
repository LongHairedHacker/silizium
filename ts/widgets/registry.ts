import * as jsonutils from '../jsonutils';
import {Socket, MQTTMessage} from '../siliziumsocket';
import {WidgetConfigBase, BaseWidget} from './basewidget';

import TextWidget from './textwidget';
import GageWidget from './gagewidget';
import GraphWidget from './graphwidget';

interface widgetConstructor { new (_socket : Socket, _element : JQuery, _config : WidgetConfigBase): BaseWidget };

const widgetRegistry : {[name : string] : widgetConstructor} = {
    'text-widget' : TextWidget,
    'gage-widget' : GageWidget,
    'graph-widget' : GraphWidget
};



export default function getWidget(name : string) : widgetConstructor{
	if(widgetRegistry[name] === undefined) {
		throw new Error("Unkown widget: " + name);
	}
	return widgetRegistry[name];
}
