#!/usr/bin/env python2

import threading
import atexit

import paho.mqtt.client as mqtt

from config import MQTT_BROKER, MQTT_USER, MQTT_PASSWORD

class MQTTRunner(object):

    def _on_connect(self, client, userdata, flags, rc):
        print "Subscribing"
        client.subscribe("/esp/temp/0")


    def _on_message(self, client, userdata, msg):
        print msg.topic + "\t" + str(msg.payload)
        self._socketio.emit("mqtt_message", {'topic' : msg.topic, 'payload' : msg.payload})


    def _run(self):
        while not self._thread_stop:
            self._client.loop()


    def _teardown(self):
        if self._thread != None:
            self._thread_stop = True
            self._thread.join()

        if self._client != None:
            self._client.disconnect()


    def start(self):
        self._client.connect(MQTT_BROKER)
        self._thread_stop = False
        self._thread.start()


    def __init__(self, socketio):
        self._socketio = socketio

        atexit.register(self._teardown)

        self._client = mqtt.Client()
        self._client.on_connect = self._on_connect
        self._client.on_message = self._on_message

        self._thread = threading.Thread(target=self._run)
