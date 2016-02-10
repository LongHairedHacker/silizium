#!/usr/bin/env python2

import threading
import atexit
import time

import paho.mqtt.client as mqtt

from config import MQTT_BROKER, MQTT_USER, MQTT_PASSWORD, MQTT_TOPICS

from messageparsers import mqtt_parse_message

class MQTTRunner(object):

    def _on_connect(self, client, userdata, flags, rc):
        for topic in MQTT_TOPICS.keys():
            print "[Info] Subscribing to %s" % topic
            client.subscribe(topic)


    def _on_message(self, client, userdata, msg):
        print "[Debug] %s\t%s" % (msg.topic, msg.payload)

        data = mqtt_parse_message(MQTT_TOPICS[msg.topic], msg.topic, msg.payload)
        if data != None:
            timestamp = data['time'] * 1000.0
            self._socketio.emit("mqtt_message", {'topic' : msg.topic, 'time': timestamp, 'value': data['value']})

            self._dbmanager.insert_message(data['time'], msg.topic, data['value'])


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
        self._client = mqtt.Client()
        self._client.on_connect = self._on_connect
        self._client.on_message = self._on_message

        self._client.connect(MQTT_BROKER)

        self._thread = threading.Thread(target=self._run)
        self._thread_stop = False
        self._thread.start()


    def __init__(self, socketio, dbmanager):
        self._socketio = socketio
        self._dbmanager = dbmanager

        self._thread = None
        self._client = None

        atexit.register(self._teardown)
