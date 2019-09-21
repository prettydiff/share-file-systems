# Adding A User
At the time of this writing, 21 SEP, this documentation is written in the perspective of one user inviting one other without consideration for additional users.

## Message Flow
1. Start user (browser) must know the IP, Port, and IP version (family) of the remote user.  Start user initiates invitation in the UI with the remote user's network data, their user name, and a message (free text).
2. Start user sends a package to their local service in the data type **invite** with *action* of value *invite-request*.
3. Start local service receives *invite-request* sends to specified ip/port similar data, but instead provides its own ip and service (TCP) port.
4. Remote local service receives a TCP socket and forwards its data package to the remote browser as web socket broadcast.
5. The remote browser listens for the web socket broadcast beginning with `invite:`.
6. The remote browser application generates a modal with the invitation request and a confirm or deny choice.
7. Clicking the "Confirm" button accepts the invite.  Closing the modal by other means declines the request. A confirmation adds the start user and the start user's shares to the remote user's environment.  With either choice a network response is sent to the remote user's local service (node instance).
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

## Flow According To The Code
### Sending
1. **localhost.ts, origin** - ui.util.invite
2. **localhost.ts, origin** - network.invite
3. **application.ts, origin** - server => node_apps_server_create_end_inviteConnect (create a socket)
4. **application.ts, remote** - start => node_apps_server_start_listener_data (socket listener)
5. **localhost.ts, remote** - local_socketMessage - (ui.util.inviteResponse)

### Responding
6. **localhost.ts, remote** - ui.util.inviteResponse
7. **localhost.ts, remote** - ui.modal.confirm => ui.util.addUser, network.invitationAcceptance
8. **application.ts, remote** - start => node_apps_server_start_server_data (create a socket)
9. **application.ts, origin** - start => node_apps_server_start_listener_data (socket listener)
10. **localhost.ts, remote** - local_socketMessage - (ui.util.inviteResponse)

## Data Package
### TypeScript Interface

```typescript
interface invite {
    action: "invite-status";
    family: "ipv4" | "ipv6";
    ip: string;
    message: string;
    modal: string;
    name: string;
    port: number;
    shares: [string, string][];
    status: "accepted" | "declined" | "invited";
}
```

* **action** - This is present to conform to a convention used by other services, but is not used.
* **family** - This explicitly identifies the format of IP address, which is helpful in formatting addresses during user facing messaging.
* **ip** - An IP address.
* **message** - A text message the users can pass between.
* **modal** - The id attribute value of the originating modal, so that the acceptance or declination can be communicated back to the modal.
* **name** - The originator's user name.
* **port** - Port number of the remote socket listener.
* **shares** - The various things a user is sharing.
* **status** - This is a flag letting the application known how to route messages.

### Data Package According to the Message Flow

1. The initial *invite* object is created by the origin in the localhost.ts file.  The IP address and port refer to the remote user.  The starting value for status is *invited*.  The *shares* refers to the origin's shares.
2. No change.
3. A socket is created on the origin from the remote's IP and port data provided to the data package.  The invite data package is sent forward to the remote except now the IP and port data refer to the origin.
4. No change.
5. No change.
6. The remote user must accept or decline the invitation.  The resulting status will be either *accepted* or *declined*.  Acceptance adds the origin's shares and populate the remotes shares.  A declination assigns an empty array for shares.
7. No change.
8. A repeat of step 3, but from the remote's perspective.  A socket is created with the supplied IP and port data of the origin and is reassigned to the remote's data.
9. No change.
10. Messaging is populated into the origin's original invitation modal, if still available.  If the invitation is accepted the remote user and their shares are added to the origin.