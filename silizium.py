#!/usr/bin/env python2
import eventlet
eventlet.monkey_patch()

from datetime import datetime
from flask import Flask, render_template
from flask_socketio import SocketIO

import time
import threading
import atexit


app = Flask(__name__)
app.config['SECRET_KEY'] = 'omg_so_secret!'
socketio = SocketIO(app)

test_thread = None
stop = False

def doStuff():
	while not stop:
		global test_thread
		print "[%s] Ping !" % datetime.now()

		socketio.emit('ping test', {"data" : "[%s] Ping !" % datetime.now()})

		time.sleep(5)


@socketio.on('my event')
def handle_my_custom_event(json):
	print('received json: ' + str(json))
	socketio.emit('ping test', {"data" : "[%s] Ping !" % datetime.now()})


@app.route('/')
def test_page():
	return render_template('test.html')


@app.before_first_request
def setup():
	test_thread = threading.Thread(target=doStuff)
	print "Starting thread"
	stop = False
	test_thread.start()

def teardown():
	print "Stopping thread"
	if test_thread != None:
		stop = True
		test_thread.join()


if __name__ == '__main__':
	atexit.register(teardown)
	socketio.run(app, debug=True)
