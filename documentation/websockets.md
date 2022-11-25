<!-- documentation/websockets - Notes and learnings from socket first communication. -->
<!-- cspell:words websockets -->

# Share File Systems - WebSockets
Websockets are a means of network messaging over [TCP](https://en.wikipedia.org/wiki/Transmission_Control_Protocol) in a format defined by [RFC6455](https://www.rfc-editor.org/rfc/rfc6455).
Websocket messages are binary payloads preceded by a frame header of 2 to 14 bytes that defines the length and encoding of the message.

## Benefits
### Full Duplex
WebSockets are the only means of bidirectional communication supported by web browsers.
This means that at any point a web browser can talk to a web server and like wise a web server can talk to a web browser.
All other means of communication in the web browser are either [HTTP](https://www.rfc-editor.org/rfc/rfc2616) or a protocol closely related to HTTP.

HTTP communications occur in a process commonly referred to as a *round trip*.
In this process communications are always initiated from the browser called a *request*.
The request either sends data directly to the server, as is the case for PUT and POST type HTTP messages, or asks the server for files, as is the case for GET type HTTP messages.
The web server processes the HTTP request message according to any associated applications executing along-side the HTTP server and then sends a message to the browser called a *response*.
This request/response sequence is the HTTP round trip.
The HTTP communication is not complete until the browser receives a response to a given request or that response exceeds a time to live provided by either a browser default or a setting in the HTTP request header.
With HTTP there is fidelity and closure because there is always a response to a request and that response indicate the status and health of the message transmission.

WebSockets do not have round trips.
With WebSockets a message may start at either the browser or the server and there is nothing like an HTTP response, which means there is no indication the message fulfilled the desired application output at the other end.
Because messaging may originate at either the browser or server and that transmission is never waiting on the activity status of the remote end WebSockets achieve [full duplex communication](https://www.comms-express.com/infozone/article/half-full-duplex/).

The primary advantage of full duplex communication is that messages may send irrespective of the remote party, which isn't the case of HTTP.
Compare the difference between radio communication and telephone communication.
With radios messages can send from either end, but cannot simultaneously send and receive at the same time.
That is called half duplex communication.
With telephones both parties can talk and listen simultaneously.
In that respect WebSockets are like conversing over a telephone and HTTP just is unidirectional.

### Overhead and Performance
WebSocket messaging has extremely low processing overhead compared to HTTP.
Each HTTP transmission opens a new TCP socket, while all WebSocket transmissions occur on a single dedicated TCP socket.
This means each HTTP message must wait for a TCP socket to open and the response must close that TCP socket at the browser once complete.
With WebSockets the dedicated TCP socket is opened and managed in advance and all messaging traverses this TCP socket.

HTTP headers are a variable amount of text and can be quite large.
HTTP headers are often a little over 1 kilobyte but there is no maximum length.
Those headers must be parsed by both the browser (response headers) and the server (request headers).
With WebSockets the header data is a binary frame header 2-14 bytes long that can be interpreted by machine code natively.

The round trip nature of HTTP imposes wait time, waiting for the response, that does not exist with WebSockets.
All this overhead results in large performance costs that are eliminated from WebSockets.
In this application I increased browser test automation speed by 8x by using WebSockets for all test messaging where before I used HTTP.

### Event-Oriented Communication
Because of the faster messaging provided by WebSockets and the elimination of round trips imposed by HTTP this application achieves event-oriented communication.
In event-oriented communication all network activity is executed as a stateless event only at the moment network messages are either sent or received.
Like events associated with user interactions network events occur asynchronously and independently of other activity occurring at both the browser and server.
The browser does not have to ask for updates from the server, because the server can independently send messaging at any time.

With HTTP communication the user experience is held hostage awaiting the completion of an HTTP response in the browser, and since all HTTP communications originate in the browser there is no way to get data from the server without explicitly asking for it.
With event-oriented communication the browser sends data to the server as necessary to fulfill activity on the server the browser either cannot or should not process itself, such as updating a central database.
If the browser requires feedback about that transmission the server will send an update to the browser the moment the server is ready.
In that scenario up to 4 network messaging events occur:

1. The browser sends a message to the server.
2. The server receives the message and executes an application task.
3. The server sends a message to the browser.
4. The browser receives the server's message and processes application tasks for display by the user.

In that scenario the steps must occur in a specific order, but nothing is waiting on a previous step.
Each step executes independently as an original event and fulfills a given task as rapidly as its application allows.

## Challenges
While WebSockets are fully justified by the event-oriented communication capabilities that aren't possible in HTTP they do come with some considerable challenges.

### Sequential Messaging
Since WebSockets messages occur over a single socket the messages are sequential.
Furthermore, RFC6455 explicitly states that message frames must not be interlaced, which ensures messages transmit one-by-one in the order provided.

With HTTP parallel messages regularly occur as each HTTP message opens a new TCP socket and many such sockets may be opened simultaneously.
In most cases the faster message processing provided to WebSockets is enough to compensate for the lost of parallel messaging capabilities.
One notable exception is when requesting webpage asset files, where the data is large enough and numerous enough that parallel requests using HTTP is often much faster than waiting sequential messages over a single socket.

### Message Parsing Complexity
Parsing received messages over WebSockets is extremely challenging due to these five constraints:

1. If a given socket receives messages too quickly messages will be dropped, imposing a serious integrity problem.
2. RFC6455 allows messages to be fragmented from a single transmission into multiple transmission frames independently sent and received.
3. Firefox sends frame headers separated from frame bodies.
4. If Node.js receives message frames too quickly the various binary buffers are concatenated into a single deliverable to the processing application.
5. TLS forces a maximum payload size of 65536 bytes.

These four constraints wildly increase message processing complexity.

The first, and perhaps most serious constraint, can be easily solved by imposing message queues.
This integrity problem can occur because the JavaScript language executes instructions faster than it can send message traffic to a TCP socket, which exists outside the language.
If messages were pushed into a queue whereby the application looks for things to push onto the network as quickly as it can execute nothing is lost or overwritten.
Unfortunately the browser provides no queue mechanism and the [WHATWG doesn't seem interested in adding such](https://github.com/whatwg/websockets/issues/33).

The last four issues all deal with competing ways a single message may be transmitted as smaller or unexpectedly joined parts. The receiving end must contend with these four concerns simultaneously and also evaluate for integrity according to the size data in the frame headers.

In my experience there is considerable processing overhead to contend with these constraints, but that processing overhead is almost exclusive memory bound rather than CPU bound.
This is due to the various acts of concatenating and slicing numerous large binary buffers residing in memory.
The performance gaps between message sending, transmission effects, and received processing time grows as the frequency of transmission increases irrespective of message size.
This can make WebSockets extremely challenging to performance test.

Fortunately, such processing and performance restrictions only produce execution penalties in the artificial world of performance testing.
It is unlikely an application will ever need to send more than 200,000 messages over a single socket in the shortest time possible, because this does not reflect real world concerns.
The actual performance goals of WebSockets is to:
1. Reduce transmission times compared to other transmission mechanisms
2. Simultaneously lower application processing overhead to send and receive messaging from the network compared to other transmission mechanisms

**Do not trust WebSocket benchmarks that do not contend with the 5 processing constraints, especially if a given WebSocket application does not impose a message queue.**