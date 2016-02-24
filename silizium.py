#!/usr/bin/env python2
import eventlet
eventlet.monkey_patch()

import os
import threading
import atexit

from datetime import datetime
from flask import Flask, render_template
from flask_socketio import SocketIO

from dbmanager import DBManager
from mqtt import MQTTSocketIORunner, MQTTDatabaseRunner
from timeutils import js_timestamp

from config import DB_CONNECTION_STRING, WIDGETS


app = Flask(__name__)
app.config['SECRET_KEY'] = 'omg_so_secret!'
socketio = SocketIO(app)
db_manager = DBManager(DB_CONNECTION_STRING)

initialized = False

@app.route('/')
def index():
	return render_template('index.html')


@socketio.on('get_history')
def handle_get_history(json):
	if not 'topic' in json.keys() or not 'secondsBack' in json.keys():
		return {'error': 'Invalid request'}

	history = db_manager.get_history(json['topic'], json['secondsBack'])
	history = map(lambda msg: {'topic' : msg['topic'], 'time' : js_timestamp(msg['time']), 'value' : msg['value']}, history)
	return history


@socketio.on('get_last_message')
def handle_get_last_message(json):
	if not 'topic' in json.keys():
		return {'error': 'Invalid request'}

	msg = db_manager.get_last_message(json['topic'])
	msg = {'topic' : msg['topic'], 'time' : js_timestamp(msg['time']), 'value' : msg['value']}
	return msg


@socketio.on('get_widgets')
def handle_get_history(json):
	return WIDGETS


def setup_runners():
	global initialized
	if not initialized:
		db_manager.connect()

		socket_runner = MQTTSocketIORunner(socketio)
		socket_runner.start()

		if app.config['DEBUG']:
			db_runner = MQTTDatabaseRunner(db_manager)
			db_runner.start()

	initialized = True

@app.before_first_request
def setup_on_request():
		setup_runners()


# If the applications reloads we might get socketio connectons before the first request
@socketio.on('connect')
def setup_on_socketio():
		setup_runners()

if __name__ == '__main__':
	socketio.run(app, debug=True)
