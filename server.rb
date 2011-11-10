require 'eventmachine'
require 'em-websocket'
require 'json'
require './stream.rb'

usage = "#{$0} <username> <password> <keyword>"
abort usage unless username = ARGV.shift
abort usage unless password = ARGV.shift
abort usage unless keyword  = ARGV.shift

EM.run do

    websocket_connections = []
    EM::WebSocket.start(:host => "0.0.0.0", :port => 8080) do |ws|

        ws.onopen do
            puts "Websocket connection opened"
            websocket_connections << ws
        end

        ws.onclose do
            puts "Websocket connection closed"
            websocket_connections.delete(ws)
        end

    end

    stream = TwitterStream.new(username, password, keyword)
    stream.start
    stream.ontweet do |tweet|
        puts "New tweet: #{tweet['text']}"
        websocket_connections.each do |socket|
            socket.send(JSON.generate(tweet))
        end
    end

end
