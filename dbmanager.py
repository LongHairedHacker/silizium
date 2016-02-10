#!/bin/env python2
import psycopg2

from datetime import datetime

class DBManager(object):
	STATEMENTS = {
		'insert_message' : "INSERT INTO messages (time, topic, value) VALUES ($1,$2,$3)",
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
					(datetime.utcfromtimestamp(time), topic, value))
		self.conn.commit()
