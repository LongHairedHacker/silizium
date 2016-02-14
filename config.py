#!/usr/bin/env python2

MQTT_BROKER = 'localhost'
MQTT_USER = ''
MQTT_PASSWORD = ''

TIMEZONE = 'Europe/Berlin'

DB_CONNECTION_STRING = 'dbname=silizium user=silizium'

MQTT_TOPICS = {
	'/esp/temp/0' : 'float'
}


TEXT_ROOMTEMP = {
	'type': 'text-widget',
	'formater' : 'temperature',
	'width' : 1,
	'topic' : '/esp/temp/0',
	'label' : 'Room Temperature'
}

OTHER_ROOMTEMP = {
	'type': 'text-widget',
	'formater' : 'temperature',
	'width' : 1,
	'topic' : '/esp/temp/0',
	'label' : 'Another Temp'
}



WIDGETS = [
	[TEXT_ROOMTEMP, OTHER_ROOMTEMP],
]
