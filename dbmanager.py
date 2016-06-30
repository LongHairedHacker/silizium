#!/bin/env python2
import psycopg2

from datetime import timedelta

from timeutils import now


class DBManager(object):
	STATEMENTS = {
		'insert_topic' : "INSERT INTO topics (topic) SELECT CAST($1 AS VARCHAR) WHERE NOT EXISTS (SELECT id FROM topics WHERE topic = $1)",
		'insert_message' : "INSERT INTO messages (time, topic_id, value) VALUES ($1, (SELECT id FROM topics WHERE topic = $2),$3)",
		'get_last_message' : "SELECT time, topic, value FROM messages INNER JOIN topics ON messages.topic_id = topics.id WHERE topic = $1 ORDER BY time DESC LIMIT 1",
		'get_history' : "SELECT time, topic, value FROM messages INNER JOIN topics ON messages.topic_id = topics.id WHERE topic = $1 AND time >= $2 ORDER BY time ASC",
	}


	def __init__(self, connection_string):
		self._connection_string = connection_string
		self._connection_pool = []


	def connect(self):
		conn = psycopg2.connect(self._connection_string)

		cur = conn.cursor()

		for name, query in self.STATEMENTS.items():
			cur.execute("PREPARE %s AS %s" % (name, query))

		self._connection_pool += [conn]


	def _borrow_connection(self):
		if self._connection_pool == []:
			self.connect()

		return self._connection_pool.pop()


	def _retun_connection(self, conn):
		self._connection_pool += [conn]


	def insert_topic(self, topic):
		conn = self._borrow_connection()
		cur = conn.cursor()

		cur.execute("EXECUTE insert_topic (%s)", (topic,))

		conn.commit()
		self._retun_connection(conn)

	def insert_message(self, time, topic, value):
		conn = self._borrow_connection()
		cur = conn.cursor()

		cur.execute("EXECUTE insert_message (%s, %s, %s)",
					(time, topic, value))
		conn.commit()
		self._retun_connection(conn)


	def _result_to_dict(self, result):
		keys = ['time', 'topic', 'value']
		data = {}

		for i in range(0, len(keys)):
			data[keys[i]] = result[i]

		return data


	def get_history(self, topic, seconds_back):
		conn = self._borrow_connection()
		cur = conn.cursor()

		start = now() - timedelta(seconds = seconds_back)
		cur.execute("EXECUTE get_history (%s, %s)",
					(topic, start))

		data = cur.fetchall()

		self._retun_connection(conn)

		return map(self._result_to_dict, data)


	def get_last_message(self, topic):
		conn = self._borrow_connection()
		cur = conn.cursor()

		cur.execute("EXECUTE get_last_message (%s)", (topic,))
		data = cur.fetchone()

		if data == None:
			data = {'topic' : topic, 'time' : now(), 'value' : 0.0}
		else:
			data = self._result_to_dict(data)

		self._retun_connection(conn)
		return data
