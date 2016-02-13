#!/bin/env python2
import psycopg2

from datetime import timedelta

from timeutils import now


class DBManager(object):
	STATEMENTS = {
		'insert_message' : "INSERT INTO messages (time, topic, value) VALUES ($1,$2,$3)",
		'get_history' : "SELECT time, topic, value FROM messages WHERE topic = $1 AND time >= $2 ORDER BY time",
	}


	def __init__(self, connectionString):
		self._connectionString = connectionString


	def connect(self):
		self.conn = psycopg2.connect(self._connectionString)

		cur = self.conn.cursor()

		for name, query in self.STATEMENTS.items():
			cur.execute("PREPARE %s AS %s" % (name, query))


	def insert_message(self, time, topic, value):
		cur = self.conn.cursor()

		cur.execute("EXECUTE insert_message (%s, %s, %s)",
					(time, topic, value))
		self.conn.commit()


	def _result_to_dict(self, result):
		keys = ['time', 'topic', 'value']
		data = {}

		for i in range(0, len(keys)):
			data[keys[i]] = result[i]

		return data


	def get_history(self, topic, seconds_back):
		cur = self.conn.cursor()

		start = now() - timedelta(seconds = seconds_back)
		cur.execute("EXECUTE get_history (%s, %s)",
					(topic, start))

		data = cur.fetchall()

		return map(self._result_to_dict, data)
