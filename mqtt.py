#!/usr/bin/env python2

import threading
import atexit

import paho.mqtt.client as mqtt

from timeutils import js_timestamp
from messageparsers import mqtt_parse_message

from config import MQTT_BROKER, MQTT_USER, MQTT_PASSWORD, MQTT_TOPICS


class MQTTRunner(object):

    def _on_connect(self, client, userdata, flags, rc):
        for topic in MQTT_TOPICS.keys():
            print "[Info] Subscribing to %s" % topic
            client.subscribe(topic)


    def _teardown(self):
        print "[Debug] tearing down"
        if self._client != None:
            self._client.disconnect()
            self._client.loop_stop()


    def start(self, threadded = True):
        self._client = mqtt.Client()
        self._client.on_connect = self._on_connect
        self._client.on_message = self._on_message

        self._client.connect(MQTT_BROKER)

        if threadded:
            atexit.register(self._teardown)
            self._client.loop_start()
        else:
            self._client.loop_forever()




    def __init__(self):

        self._thread = None
        self._client = None





class MQTTSocketIORunner(MQTTRunner):

    def _on_message(self, client, userdata, msg):
        #print "[Debug] %s\t%s" % (msg.topic, msg.payload)

        if msg.topic in MQTT_TOPICS.keys():
            data = mqtt_parse_message(MQTT_TOPICS[msg.topic], msg.topic, msg.payload)
            if data != None:
                timestamp = js_timestamp(data['time'])
                self._socketio.emit("mqtt_message", {'topic' : msg.topic, 'time': timestamp, 'value': data['value']})

    def _run(self):
        print "[Debug] running socketio runner"
        while not self._thread_stop:
            self._client.loop()


    def __init__(self, socketio):
        super(MQTTSocketIORunner, self).__init__()
        self._socketio = socketio



class MQTTDatabaseRunner(MQTTRunner):

    def _on_message(self, client, userdata, msg):
        #print "[Debug] %s\t%s" % (msg.topic, msg.payload)

        if msg.topic in MQTT_TOPICS.keys():
            data = mqtt_parse_message(MQTT_TOPICS[msg.topic], msg.topic, msg.payload)
            if data != None:
                self._dbmanager.insert_message(data['time'], msg.topic, data['value'])


    def _run(self):
        print "[Debug] running database runner"
        while not self._thread_stop:
            self._client.loop()


    def __init__(self, dbmanager):
        super(MQTTDatabaseRunner, self).__init__()
        self._dbmanager = dbmanager
