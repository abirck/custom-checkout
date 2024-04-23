#!/bin/sh
rsyslogd -n &
redis-server &
yarn start 2>&1 | logger -t node