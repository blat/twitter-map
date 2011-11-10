twitter-map
===============
Allow you to display a map with geolocalised tweets which match a given keyword.

setup
------------------
depends on: ruby, [em-http-request](https://github.com/igrigorik/em-http-request)]

1. setup an http server with a vhost on **/public**
2. run server
    ruby server.rb <username> <password> <keyword>
