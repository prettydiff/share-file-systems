<!-- documentation/invitation - Notes on the flow control of the invitation process. -->

# Adding A User
At the time of this writing, 21 SEP, this documentation is written in the perspective of one user inviting one other without consideration for additional users.


## Code
* The major steps of this list correspond with the steps indicated in the diagram below.
* Each sub-step starts with a function identifier and the file where that function resides.
* The described flow control assumes a fully accepted invitation so that all steps are described.  Declined invitations are killed at user response.

1. *Request*, Local Browser Interface
   1. `invite.start`, `lib/browser/invite.ts`: Invitation is initiated by the local user, which creates a form in the web browser.
   2. `invite.request`, `lib/browser/invite.ts`: Submitting the invitation form executes the request function, which builds the necessary data package with an *action* property value **invite**.
   3. `network.inviteRequest`, `lib/browser/network.ts`: A network call is executed to the local terminal application.
2. *Request*, Local Terminal Service
   1. `terminal_server_methodPOST_end_invite`, `lib/terminal/server/methodPOST.ts`: All application instructions out of the browser go to service methodPOST utility to route to the invitation utility.
   2. `terminal_server_invite_invite`, `lib/terminal/server/invite.ts`:  The service application sends the invitation transmission function which processes all invitation transmission actions looking at the *action* data property.  At this step it renames the data package's *action* property to **invite-request** and sends the request to the remote terminal application.
3. *Request*, Remote Terminal Service
   1. `terminal_server_methodPOST_end_invite`, `lib/terminal/commands/service.ts`: The remote computer receives the invitation request at its server post function.
   2. `terminal_server_invite_inviteRequest`, `lib/terminal/server/invite.ts`: The request is passed to invitation transmission function to broadcast to the listening browsers via WebSockets.
4. *Request*, Remote Browser Interface
   1. `browser.socketMessage`, `lib/browser/webSocket.ts`: The browser uses the same function to process all incoming WebSocket events.  At this step the WebSocket code does nothing but call the invitation response function.
   2. `invite.respond`, `lib/browser/invite.ts`: The invitation response function generates the form where a person on the remote device/user accepts, declines, or ignores the invitation.
5. *Response*, Remote Browser Interface
   1. `invite.accept`, `lib/browser/invite.ts`: The remote person executes the acceptance function, which prepares a data payload for the terminal application.
   2. `network.inviteAccept`, `lib/browser/network.ts`: The payload representing the accepted invitation is sent out of the browser with an *action* property of value **invite-response**.
6. *Response*, Remote Terminal Service
   1. `terminal_server_methodPOST_end_invite`, `lib/terminal/commands/service.ts`: All application instructions out of the browser go to server post function.
   2. `terminal_server_invite_inviteResponse`, `lib/terminal/server/invite.ts`: The service application sends the invitation transmission function which processes all invitation transmission actions looking at the *action* data property.  At this step it renames the data package's *action* property to **invite-complete**, saves the originating agent data to settings, and sends the request to the original local terminal application.
7. *Response*, Local Terminal Service
   1. `terminal_server_methodPOST_end_invite`, `lib/terminal/commands/service.ts`: The local computer receives the invitation response at its server post function.
   2. `terminal_server_invite_inviteComplete`, `lib/terminal/server/invite.ts`: The response is passed to invitation transmission function to broadcast to the listening browsers via WebSockets and it saves the remote agent data to settings.
8. *Response*, Local Browser Interface
   1. `browser.socketMessage`, `lib/browser/webSocket.ts`: The WebSocket code does nothing but call the invitation response function exactly as it did on the remote computer.
   2. `invite.respond`, `lib/browser/invite.ts`: The invitation response function sees the *action* data property has a value of **invite-complete** and add the new agent(s).

## Diagram of Message Flow
```
Start user, sending invitation        | End user, receiving the invitation
--------------------------------------|-------------------------------------
                                      |
 _    HTTP    ___       HTTP          |      ___      WS                  _
|_| 1 -----> |   | 2 -----------------|---> |   | 3 -----------------> 4 |_|
    <------- |   | <------------------|---- |   |
    (invite) |   |  (invite-request)  |     |   |
             |   |                    |     |   |
             |   |      HTTP          |     |   |    HTTP
       WS    |   | <------------------|-- 6 |   | <------------------- 5
8   <----- 7 |___| -------------------|---> |___| --------------------->
                    (invite-complete) |            (invite-response)
                                      | 
start        start                    |     remote                 remote
user         terminal                 |     terminal               user
(browser)    (local service)          |     (local service)        (browser)

data.action value is in parenthesis
```
