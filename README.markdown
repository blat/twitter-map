Twitter Map
===============

Allow you to display a map (updated in real-time!) with geolocalised tweets which match a given keyword.


Requirements
------------------

* A browser with [web sockets](http://caniuse.com/websockets) support.


Dependances
------------------

* [em-http-request](https://github.com/igrigorik/em-http-request)


Setup
------------------

1. Install ruby and all dependancies (see above)

2. Setup an HTTP server with a vhost on `/public`

3. Run backend:

        ruby server.rb <username> <password> <keyword>
