#!/usr/bin/env python2

from dbmanager import DBManager
from mqtt import MQTTDatabaseRunner

from config import DB_CONNECTION_STRING

db_manager = DBManager(DB_CONNECTION_STRING)
db_manager.connect()

db_runner = MQTTDatabaseRunner(db_manager)
db_runner.start(threadded = False)

#db_runner.wait()
