require 'em-http'
require 'json'

class TwitterStream

    URL = 'https://stream.twitter.com/1/statuses/filter.json'

    def initialize(username, password, keyword)
        @callbacks = []
        @username, @password, @keyword = username, password, keyword
    end

    def ontweet(&block)
        @callbacks << block
    end

    def start
        http = EventMachine::HttpRequest.new(URL).post({
            :head => { 'Authorization' => [ @username, @password ]},
            :query => { 'track' => @keyword }
        })

        http.callback do
            unless http.response_header.status == 200
                puts "Call failed with response code #{http.response_header.status}"
            end
        end

        buffer = ''
        http.stream do |chunk|
            buffer += chunk
            while line = buffer.slice!(/.+\r\n/)
                tweet = JSON.parse(line)
                @callbacks.each do |callback|
                    callback.call(tweet)
                end
            end
        end
    end

end
