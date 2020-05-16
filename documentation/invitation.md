<!-- documentation/invitation - Notes on the flow control of the invitation process. -->

# Adding A User
At the time of this writing, 21 SEP, this documentation is written in the perspective of one user inviting one other without consideration for additional users.

## Invitation Message Flow
1. A user initiates an invitation from the browser using an HTTP request to the local terminal application with the HTTP POST body prefixed by `invite:` and an action value of `invite`.
2. The local terminal application strips the `invite:` prefix and changes the action property to `invite-request`.  An HTTP response is generated for the local browser and an HTTP request is sent to the specified IP and port.
3. The remote terminal application receives the HTTP request and sends an HTTP response.  The HTTP body is sent to the remote's web browser via Web Socket.
4. On the remote web browser a modal is generated with the invitation content.  The remote user can accept or deny the request, but both generate an HTTP request with that status back to the remote terminal application.  The action property is changed to value `invite-response`.
5. The remote terminal issues an HTTP response for the remote browser and generates an HTTP request to the originating terminal application.  The action property is changed to `invite-complete`.
6. The originating terminal application receives the HTTP request and generates a response for the remote terminal application.  The originating terminal application sends the HTTP body to the local browser via Web Socket.
7. The originating browser receives the invitation response and performs the necessary messaging for the user.


## Diagram of Message Flow
```
Start user, sending invitation        | End user, receiving the invitation
--------------------------------------|-----------------------------------
    (invite)        (invite-request)  |
 _    HTTP    ___       HTTP          |    ___      WS              _
|_| 1------> |   | 2------------------|-> |   | 3----------------> |_|
    <------- |   | <------------------|-- |   |
             |   |      HTTP          |   |   |    HTTP
       WS    |   | <------------------|-5 |   | <----------------4
7   <------6 |___| -------------------|-> |___| ----------------->
                    (invite-complete) |          (invite-response)
                                      | 
start        start                    |   remote                   remote
user         terminal                 |   terminal                 user
(browser)    (local service)          |   (local service)          (browser)

data.action value is in parenthesis
```

## Code
* All related code for this process can be found in `/lib/terminal/server/invite.ts` imported by `/lib/terminal/server.ts`.
* Steps 2 and 5 (invite-request and invite-complete) change the IP and port data to direct traffic across the network.
