![S.I.L/I.Z.I.U.M.](./artwork/silizium.png "Space In Lautern / Interaktive Zustands-Information und Monitoring")

**Space In Lautern / Interaktive Zustands-Information und Monitoring**

What is this ?
--------------
A MQTT-based monitoring system for the [ChaosInkl](http://chaos-inkl.de) hackerspace.


Install
-------
```
apt-get install build-essential postgresql postgresql-server-dev-9.4 python python-dev virtualenv
```

Create database user and database.

```
git clone https://github.com/LongHairedHacker/silizium
cd silizium
psql silizium < setup.sql 
virtualenv virtenv
source virtenv/bin/activate
pip install -r requirements.txt
pip install gunicorn
```



Licenses
--------
* License for the source code: to be determined
* License for the artwork: to be determined
* Font used in Logo:
    [amstradpc1512](http://int10h.org/oldschool-pc-fonts/fontlist/#amstradpc1512)
    [CC-BY-SA4.0](static/css/font/LICENSE) by [VileR](http://int10h.org/)
* [Socket.io](http://socket.io/) [MIT License](static/js/socketio/LICENSE)
* [jquery](https://jquery.com/) [BSD License](static/js/jquery/LICENSE)
* [justgage](http://justgage.com/) [MIT License](static/js/justgage/LICENSE)
* [flotr2](http://www.humblesoftware.com/flotr2/) [MIT License](static/js/flort2/LICENSE)
* [es6-shim](https://github.com/paulmillr/es6-shim) [MIT License](static/js/es6-shim/LICENSE.md)
* [normalize.css](https://necolas.github.io/normalize.css/) [MIT License](static/css/normalize/LICENSE.md)
