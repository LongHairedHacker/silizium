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
	'topics' : {'/esp/temp/0': 'temperature'},
	'label' : 'Room Temperature'
}

GAGE_ROOMTEMP = {
	'type': 'gage-widget',
	'topics' : {'/esp/temp/0': 'temperature'},
	'label' : 'Another\nTemperature',
	'min' : -10.0,
	'max' : 40.0
}



WIDGETS = [
	[TEXT_ROOMTEMP, GAGE_ROOMTEMP, TEXT_ROOMTEMP, GAGE_ROOMTEMP],
]
