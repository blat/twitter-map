require 'eventmachine'
require 'em-http'
require 'json'

usage = "#{$0} <username> <password>"
abort usage unless username = ARGV.shift
abort usage unless password = ARGV.shift

URL = 'https://stream.twitter.com/1/statuses/sample.json'

EM.run do

    http = EventMachine::HttpRequest.new(URL).get({
        :head => { 'Authorization' => [ username, password ] }
    })

    buffer = ''
    http.stream do |chunk|
        buffer += chunk
        while line = buffer.slice!(/.+\r\n/)
            tweet = JSON.parse(line)
            puts "New tweet:#{tweet['text']}"
        end
    end
end
