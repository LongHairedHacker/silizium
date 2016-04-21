#!/bin/env python2
import calendar
import pytz

from datetime import datetime

from config import TIMEZONE

def now():
    return datetime.now(tz = pytz.timezone(TIMEZONE))


def js_timestamp(timestamp):
	if timestamp.tzinfo == None:
		raise ValueError("Unaware datetime objects are not supported")

	return calendar.timegm(timestamp.utctimetuple()) * 1000
