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
def test_page():
	return render_template('test.html')



def setup():
	db_manager.connect()
	runner.start()



if __name__ == '__main__':

	if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
		setup()

	socketio.run(app, debug=True)
