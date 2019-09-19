# Adding A User

## Message Flow
1. Start user (browser) must know the IP, Port, and IP version (family) of the remote user.  Start user initiates invitation in the UI with the remote user's network data, their user name, and a message (free text).
2. Start user sends a package to their local service in the data type **invite** with *action* of value *invite-request*.
3. Start local service receives *invite-request* sends to specified ip/port similar data, but instead provides its own ip and service (TCP) port.
4. Remote local service receives a TCP socket and forwards its data package to the remote browser as web socket broadcast.
5. The remote browser application generates a modal with the invitation request and a confirm or deny choice.
6. Clicking the "Confirm" button accepts the invite.  Closing the modal by other means declines the request. A confirmation adds the start user and the start user's shares to the remote user's environment.
7. With either choice a network response is sent to the remote user's local service (node instance).
8. The response is forwarded to the start node instance
9. The response is send to the start user's browser with a web socket broadcast
10. The final step is to notify the start user of the declination or add the new user and publisher the remote user's share list.


## Diagram of Message Flow
```
Start user, sending invitation  | End user, receiving the invitation
--------------------------------|-----------------------------------
 _            ___               |    ___               _
|_| 1,2----> |   | 3------------|-> |   | 4---------> |_| 5,6
10  <------9 |___| <------------|-8 |___| <---------7
                                | 
start        start              |   remote           remote
user         node               |   node             user
(browser)    (local service)    |   (local service)  (browser)
```
