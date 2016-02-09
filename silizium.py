#!/usr/bin/env python2
import eventlet
eventlet.monkey_patch()

from datetime import datetime
from flask import Flask, render_template
from flask_socketio import SocketIO

import time
import threading
import atexit


from mqtt import MQTTRunner

app = Flask(__name__)
app.config['SECRET_KEY'] = 'omg_so_secret!'
socketio = SocketIO(app)
runner = MQTTRunner(socketio)


@app.route('/')
def test_page():
	return render_template('test.html')


@app.before_first_request
def setup():
	runner.start()


if __name__ == '__main__':
	socketio.run(app, debug=True)
