/// <reference path="definitions/es6-shim.d.ts"/>
/// <reference path="definitions/jquery.d.ts" />
/// <reference path="definitions/socket.io-client.d.ts"/>

/// <reference path="siliziumsocket.ts"/>

"use strict";

function addMessage(msg : silizium.MQTTMessage) : void {
	var date = new Date(msg.time);
	var dateStr = date.toLocaleDateString();
	var timeStr = date.toLocaleTimeString();

	$('.log p:first').before('<p>[' + dateStr + ' ' + timeStr + '] - '
								+ msg.topic + ' - ' + msg.value.toFixed(2) + ' </p>');

}

var socket = new silizium.Socket('http://' + document.domain + ':' + location.port);

socket.onConnection(() => {
	socket.getHistory('/esp/temp/0', 10 * 60, (history) =>{
		history.forEach(addMessage);

		socket.onMQTTMessage('/esp/temp/0', addMessage);
	})
});
