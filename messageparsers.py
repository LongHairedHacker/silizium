#!/usr/bin/env python2
import traceback

from timeutils import now

_mqtt_message_parsers = {}


def mqtt_register_message_parser(key, parser):
    if key in _mqtt_message_parsers.keys():
        raise ValueError("Duplicate key for mqtt message parser: %s" % key)

    _mqtt_message_parsers[key] = parser


def mqtt_parse_message(parser, topic, message):
    if not parser in _mqtt_message_parsers.keys():
        print "[Error] Message parser %s not found" % parser
        return None

    try:
        data = _mqtt_message_parsers[parser](message)
        return data
    except Exception as e:
        print "[Warning] Expection while trying to parse a message for %s" % (topic)
        traceback.print_exc()
        return None


def float_parser(message):
	value = float(message)

	return {'time': now(), 'value': value}

mqtt_register_message_parser('float', float_parser)
