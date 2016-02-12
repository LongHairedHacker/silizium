#!/usr/bin/env python2
import eventlet
eventlet.monkey_patch()

import os
import time
import threading
import atexit

from datetime import datetime
from flask import Flask, render_template
from flask_socketio import SocketIO

from dbmanager import DBManager
from mqtt import MQTTRunner

from config import DB_CONNECTION_STRING


app = Flask(__name__)
app.config['SECRET_KEY'] = 'omg_so_secret!'
socketio = SocketIO(app)
db_manager = DBManager(DB_CONNECTION_STRING)
runner = MQTTRunner(socketio, db_manager)


@app.route('/')
def index():
	return render_template('index.html')

@socketio.on('get history')
def handle_get_history(json):
	if not 'topic' in json.keys() or not 'secondsBack' in json.keys():
		return {'error': 'Invalid request'}

	history = db_manager.get_history(json['topic'], json['secondsBack'])
	history = map(lambda msg: {'topic' : msg['topic'], 'time' : msg['time'] * 1000, 'value' : msg['value']}, history)
	return history

def setup():
	db_manager.connect()
	runner.start()


if __name__ == '__main__':

	if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
		setup()

	socketio.run(app, debug=True)
