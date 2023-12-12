<!-- documentation/decentralization - A brief write up explaining how this application invents full decentralization. -->

# Decentralization and Share File Systems
Decentralization simply means to transmit without an intermediary.
An intermediary is any party not specified as a terminal point of a transmission operating at the same topological level of technology as the given transmission message.
This project is written to achieve decentralization and exceed full [Zero Trust Conformance](https://en.wikipedia.org/wiki/Zero_trust_security_model) for [OSI layers](https://en.wikipedia.org/wiki/OSI_model) [5](https://en.wikipedia.org/wiki/Session_layer), [6](https://en.wikipedia.org/wiki/Presentation_layer), and [7](https://en.wikipedia.org/wiki/Application_layer) according to both US Army and Microsoft zero trust definitions.
This project makes no use of block chain, ledgers, or other shared artifacts.

## Project Status
* Document Dated: 26 July 2023.
* Application Version: 0.3.0
* Platform: Node.js / TypeScript
* OS Support
   - Windows 10
   - Fedora Linux
   - Debian Linux (Ubuntu)
   - Arch Linux
   - Mac OS 10.15 (Catalina) - requires manual certificate trust

## Introduction to Decentralization
[Vitalik Buterin](https://en.wikipedia.org/wiki/Vitalik_Buterin), inventor of the Ethereum blockchain, defines decentralization as a [matrix of three dimensions](https://medium.com/@VitalikButerin/the-meaning-of-decentralization-a0c92b76a274):
* Architectural - Degree of convergence of physical and topological assets.
* Political - Degree of convergence amongst owners and maintainers.
* Logical - Degree of cooperation or consolidation into a software artifact.

According to Buterin, his invention Ethereum was created to achieve some degree of decentralization and yet remains logically centralized where the resulting artifact, a distributed ledger, behaves as if a single software instance.
Share File Systems achieves complete decentralization through a model of fully separated spheres of influence, its security model.
By-products of decentralization include inherent privacy, regulatory avoidance, freedom from government oversight, improved security, more durable connectivity, and its free.

### Decentralization and Historical Precedent
Examples of decentralization are littered through out history.
Perhaps the most well known such example features the [Gutenberg Printing Press](https://www.gutenberg.org/cache/epub/51034/pg51034-images.html).
At that time in late medieval Europe, two converging social conditions were growing in direct collision.
On one hand, international trade unleashed wealth, individual prosperity, and education like European society had never experienced.
Simultaneously the publishing, transmission, and dissemination of ideas had contracted to the fewest hand-written transcriptions funded by only the most wealthy of institutions.
Both the increased demand for literature and the unwillingness of contemporary methods to supply for that demand resulted in new technology.

Although it took over 15 years to develop commercially reproducible models of the Gutenberg Press and nearly 50 more years for the idea to approach local popularity reaching 270 locations in southern Germany there was no political reaction to the press until it became popular.
The first reaction of many ruling governments, only after popular reproduction of the press, involved various forms of licensing, permits, and other restrictions.
These restrictions occurred as a means to generate tax revenue but the purpose was to limit the free exercise of speech by commoners in opposition to the ruling elite.
Many of these restrictions only served to further popularize the printing press as a form of social rebellion more recently termed the [Streisand Effect](https://en.wikipedia.org/wiki/Streisand_effect).

Another critical example of decentralization is the [US Army Signal Corps](https://en.wikipedia.org/wiki/United_States_Army_Signal_Corps).
At its creation, the Signal Corps existed to route information across a battlefield to speed orders from field command to front line troops and simultaneously inform field commanders of events on the front line.
The success of indirect field communications was first proven in battle as an enabling factor for tactical superiority by confederate forces during the US Civil War by [Edward Porter Alexander](https://en.wikipedia.org/wiki/Edward_Porter_Alexander) during the [First Battle of Bull Run](https://en.wikipedia.org/wiki/First_Battle_of_Bull_Run).
Field communications are now the supreme enabling factor of command and control in modern combat both tactically and strategically.
Like the examples enabling the printing press, modern military communications are becoming [more centralized and expensive](https://api.army.mil/e2/c/downloads/2022/10/14/106b220e/army-cloud-plan-2022.pdf) yet simultaneously there exists a [growing need for modular flexibility](https://www.armyupress.army.mil/Journals/Military-Review/English-Edition-Archives/May-June-2023/Graveyard-of-Command-Posts/) in direct opposition to centralized command and control systems.

### Decentralization, Perceptions and Bias
The primary benefit of decentralization is its near impossibility to regulate and/or restrict.
The first communications perceived to immediately benefit from such expanded freedoms are social deviations such as obscenities, criminal activity, and persecuted minorities.
In reality, everyone benefits equally immediately upon accepting such expanded freedoms.

In that regard decentralization directly resembles accessibility.
When the [Americans with Disabilities Act](https://en.wikipedia.org/wiki/Americans_with_Disabilities_Act_of_1990) first became law one of the most public changes to occur was the mandate of wheelchair ramps to all public entrances of Airports.
At first the common opinion was disapproval that the government mandated such great expense to unnecessarily refactor various entry ways for such a small minority group.
In practice everybody benefitted equally, for example: people with rolling luggage, child strollers, and many people just preferred ramps to stairs even if not disabled.
This same bias continues to falsely apply to various forms of digital communications and yet various studies continue to demonstrate that accessible digital communications benefit everybody equally.

Decentralization seeks to liberate people from various forms of regulation and restriction.
Information wants to be freely expressed as much as people are willing to express it without it being used as a weapon against those people for such acts of expression.

## Security Model
The security model exists to define relationships between types of identity.
There exists 3 foundational levels of identity types:
* User - An identity representing a point of ownership whether a person or some organization.
* Device - A physical asset comprising information storage, information processing, and a network connection.
* Share - A point access to a storage or processing location upon a device.

This model defines a restricted set of relationships amongst the mentioned identity types at a foundational level.
This model provides no restrictions for higher order identity types, for example groups of users as necessary to achieve [role based access control](https://en.wikipedia.org/wiki/Role-based_access_control) considerations in a larger system or even groups of user groups.

The security model achieves decentralization on all three of Buterin's criteria.
Physical units are fully distributed within a given user and fully decentralized between users to achieve architectural decentralization.
Ownership is limited to users and all users are separately equal peers to achieve complete political decentralization.

The degree of logical centralization is up to a given user in how they manage their own devices thereby potentially achieving complete logical decentralization.
Each device can achieve full computational isolation apart from other peer devices or a user may choose to invoke automated replication schemes to create logical redundancies of data and transmission.

### Formulation
All identity types are SHA3-512 hash sequences expressed in 128 character hexadecimal format.
The user identity type is formulated from a combination of hardware criteria of the local device, a user supplied user name, a date time sequence, and some other factors.
The device identity type is formulated from the user identity and a device name supplied by the user.
Share type identities are formulated from the respective device identity, shared location, and other factors.

### Relationship Restrictions
The user identity, and any future higher identity types, present a privacy barrier as in a [lexical scope](https://en.wikipedia.org/wiki/Scope_(computer_science)#Lexical_scope) model.
That means artifacts associated to a given user identity share unrestricted internal visibility, as in a mesh.
So, device identities present as visible and unrestricted to all other devices associated with the same user.
That also means any connected artifacts have no visibility to devices associated with user identities other than their own.
So, the model restricts knowledge of how many devices another user has, where those devices physically reside, or what they are.

The share identity type exists to provide points of access to other users without revealing the identity, location, or composition of the device.
For example, another user might need important legal documents you own, so you can create a directory on one of your devices containing the desired documents, and share that directory.
The external user then knows of a share associated with your user and that share contains the documents they need.
That external user does not know how many devices represent your user and of those which device holds the given share location.

## Identifiers
Each device stores 6 pieces of identifying information all created when the user creates a new identity for a given device.
In the spirit of decentralization there is no centralized regulatory authority preventing a user from creating and/or abandoning new identities as frequently as they wish.
The code for identity creation is located in project location: [/lib/terminal/server/services/agent_hash.ts](/lib/terminal/server/services/agent_hash.ts).

* Device hash - SHA3-512 hash string in hexadecimal format uniquely identifying the current physical device.
* Device name - A non-unique human friendly label naming the physical device.
* Device secret - A SHA3-512 hash string in hexadecimal format that is only distributed during the invitation process and used to prevent identity spoofing during socket establishment between devices of the same user.
* User hash - SHA3-512 hash string in hexadecimal format uniquely identifying the user owner of the device.
* User name - A non-unique human-friendly label naming the user.
* User secret - A SHA3-512 hash string in hexadecimal format that is only distributed during the invitation process and used to prevent identity spoofing during socket establishment between users.

### Identity Masking
Identity masking serves as a form of one-way password by which a SHA3-512 hash is computed from two pieces of information of which only one of those pieces of information is shared.
If the remote end can compute the same hash sequence from the shared data fragment plus something they already possess then the system achieves a form of pseudo two-factor authentication (something the system has and something the system knows) via an automation sequence.
The masking and unmasking logic is location in project location: [/lib/terminal/utilities/mask.ts](/lib/terminal/utilities/mask.ts).

## Connectivity
The application uses HTTP 1.1 for the invitation process because HTTP 1.1 is both session-less and anonymous.
HTTP 1.1 is also used to load file assets into the user interface at page load time.

All other communication occurs in the style of remote procedure call using a custom extended form of WebSockets as defined by [RFC 6455](https://datatracker.ietf.org/doc/html/rfc6455).
All WebSocket messages occur as JSON message bodies in the form of: `{ data: <data payload>, service: <text, service name> }`.
The data property provides the information to process and the service name determines which set of instructions will perform that processing.

Connectivity occurs in a client/server fashion where all instances of the Share File Systems application contains both client and server execution instructions.
The device that comes online latest always take the role of client in connection establishment.
Connection establishment requires the client to include their hash identifier (device hash for connections to devices or user hash for connections to other users).
Also included is a masked identifier representing the respective secret identifier for that remote agent.
Secret identifiers are shared only during the invitation process as a form of pre-shared secret.
On the server side, the socket connection will be dropped if the hash identifier is unknown or if the secret identifier cannot be unmasked according to the server's own secret identifier within 48 hours of clock time from the time of masking.

The code for this custom WebSocket implementation is located in project location: [/lib/terminal/server/transmission/transmit_ws.ts](/lib/terminal/server/transmission/transmit_ws.ts).

## Invitation Process
More important than the identities that comprise the security model are the relationships between those identities.
An 8 step invitation process exists to establish these relationships.
The invitation process was recently rewritten to prevent unauthorized instruction injection, unauthorized access, and eliminate sharing of any identifiers until both parties access the invitation.
The code for the invitation process is located in project location: [/lib/terminal/server/services/invite.ts](/lib/terminal/server/transmission/transmit_ws.ts).


```text
              Local               |              Remote
----------------------------------|----------------------------------
                start 1           |    request 2                ask 3
x >----------------> xx >>--------|-------->> xx >----------------> x
6 complete            5 response  |            4 answer
x <----------------< xx <<--------|--------<< xx <----------------< x
                                  |   identity 7           complete 8
                     xx >>--------|-------->> xx >----------------> x
KEY
> - Movement in/out of browser
>> - Movement across a network
x - UI instance
xx - Shell instance
```

### Invitation Steps
1. start
2. request
3. ask
4. answer
5. response
6. complete (local)
7. identity
8. complete (remote)

### 1 - Start Step
The start step occurs in the user interface from a user interaction wishing to initiate an invitation to a remote party.
The user must choose whether the invitation is of type *user* or *device*.
Be aware that device relationships offer no access restrictions.
The user interface sends the invitation to the network processing application instance.
The invitation message contains the proposed relationship type (device or user), an IP address, an optional port number, and a message explaining why the remote end should trust this relationship.

### 2 - Request Step
The start message arrives at the network processing application instance.
The application forms a session identifier which is a SHA3-512 hash from the local device's current date/time and the device's identity.
The session identifier will be used in a later step to eliminate all invitation messages from external identities not containing the session identifier within a 48 hour window of the local device clock.
The application renames the action in the invitation message payload from `start` to `request` and sends it to the remote party over the network.

### 3 - Ask Step
The remote party receives the invitation, changes the action to `ask`, and broadcasts the invitation data to all listening user interfaces of the remote device.

### 4 - Answer Step
The remote user views invitation and either accepts the invitation or rejects it.
Upon answering the invitation the user interface sends the invitation message to the network processing application instance with action `answer`.

At the network processing application instance the message action changes to `response`.
If the invitation is accepted, a session identifier for the remote is added to the invitation message as well as the remote's user identifiers.
If the invitation is of type device then all device data and device identifiers are added to the message as well.
Finally, a session identifier representing the remote is added to the invitation message before sending it back to the originating device.

### 5 - Response Step
On the originating device the originating device's session identifier is unmasked and only processed if the session id is valid to the given device.
if the invitation is declined, the user interface instances are informed.
If the invitation is approved from the remote a few things occur:

1. The action on the message is changed to `complete`.
2. The invitation message is updated with user identifiers representing the originating user.
3. If the invitation is of type *device*, all device data is added to the invitation message, which contains device specific identifiers per each device.
4. All devices associated with the originating user are informed as necessary to add the new relationships or a new user or new device(s).
5. All user interface instances of the current device are informed of the invitation.
6. The action on the message is changed to `identity` and the message is sent back to the remote with the originator's data attached.

### 6 - Complete Step (Local Side)
This step represents the processing that occurs on other prior existing devices of the originating user and the user interface instances of all these devices when they receive an invitation message of action `complete`.

### 7 - Identity Step
When the remote device receives the invitation message it immediately unmasks its session identifier to determine the validity of the message.
If the invitation is of type *device*, all devices associated with the remote user must change to the originator's user identifiers.
Relationships are added to each of the remote's devices for each of the originator's devices.
Once all relationships are established all remote devices will open socket connections to each of the originator's devices using the now shared identifiers to create a single user mesh connectivity.

If the invitation is of type *user*, then the originator user identifiers is added to all remote devices as a user relationship.

### 8 - Complete Step (Remote Side)
This step represents the processing that occurs on other prior existing devices of the remote user and the user interface instances of all these devices when they receive an invitation message of action `complete`.

## Data Transmission
At the time of this project version the primary data artifact is a given devices file system or a file system segment identifier by a share for user relationships.
Complete file system operations include the ability to read from the file system and to modify the file system.
Relationships between devices of the same user are unrestricted, each device can remotely read and modify the file system of peer devices in the fashion of a remote desktop protocol.

Shares receive a read only restriction by default at creation time, which allows a remote user to read and navigate file system contents from the shared location.
A share can be upgrade to full access which allows remote users to write and modify artifacts within that shared file system location.

Since shares point to a location on a device and device identity is never disclosed to other users there must exist a routing scheme to transfer file system messages between a shared device location and a given device of a remote user.
In the most complex scenario there exists three users each involving two or more of their devices.
This scenario occurs when User A wishes to copy file system data from a share of User B to a share of User C.
The routing logic is defined in these project locations:
* [/lib/terminal/server/services/fileCopy.ts](/lib/terminal/server/services/fileCopy.ts)
* [/lib/terminal/server/services/fileSystem.ts](/lib/terminal/server/services/fileSystem.ts)
* [/lib/terminal/server/transmission/network.ts](/lib/terminal/server/transmission/network.ts)

### Socket List
The routing logic directly relies upon a living socket list.
Every time a socket is opened from either side or an active socket closes the socket list is updated and broadcasted to all other peer devices.
This socket list allows each device to immediately know which devices have sockets to which external users.

### Masked Device
In the scenario where User A wishes to copy data from a shared location of User B to an unshared device of User A they will need to mask their device identity.
In that scenario User A has restricted access to all their devices but no share identifier to describe the location with which to route that data when it returns from User B.

## Pros and Cons of Decentralization
There are challenges, limitations, and superior functional capabilities provided by decentralization that cannot be realized by other prior existing communications methods.

### Pros
Decentralization allows for a near invincible network.
To defeat the cloud or access to any web server an adversary must only eliminate access to the given server's domain, a central point of failure.
A decentralized system has no central point of failure.
Consider a decentralized network like a swarm, where killing the network means independently finding and killing each individual unit comprising that swarm.
Furthermore decentralization occurs both horizontally, as in the swarm example, and also vertically through redundant relationships between users and their redundant relationships to their users.
In battle, if an enemy destroys one tactical operations center, all data associated with that hardware is lost only if they were not transferring that data to peer devices/users in alternate locations.

Decentralization allows online privacy by default, which makes it the opposite of the web.
From a technological perspective everything on the web is public by default and it requires great effort to impose even the smallest of privacy enhancements.
In the scenario of Share File Systems it takes great effort to give privacy away, and unlike the web privacy, can be easily reclaimed by instantly creating new device identifiers.

Decentralization allows for cheap fault tolerance.
Organizations like Google, Microsoft, and Facebook have invested billions of dollars into large data centers with sophisticated fault tolerant schemes.
In the model of Shared File Systems, each user owns their own fault tolerance risk where recovery is as fast as swapping physical devices or cloning a hard disk.
This level of fault tolerance requires a little bit of discipline and almost no money.

Decentralization allows for regulation avoidance.
Government regulation typically exists for very good reasons, but digital conduct is most frequently regulated by commercial entities acting in a governmental capacity.
This commercial regulatory conduct can occur for a variety of reasons such as limiting access to competition, reducing publication of violent and hateful communication, limiting access to media for revenue generating interests, prioritizing proprietary technology interests, and so forth.
Some of these reasons are necessary for the health of online discourse, but many exists primarily for self-serving reasons that are disadvantageous to choice, liberty, and freedom of information access.
Decentralization eliminates these issues by preventing access to personal messaging and data from unauthorized third parties.

### Cons
By far the greatest challenge with decentralization is logical complexity.
I have been studying the practical application of decentralization for 4 years and its tremendously more challenging to manage than the simplicity of a traditional client/server model.

If everything were connected to the internet through an IPv6 interface somebody else would have invented decentralization years ago.
IPv4 imposes network address translation (NAT).
NAT eliminates the possibility of connectivity from outside a local network, which then requires either unidirectional access from within a private network or reliance upon a trusted intermediary with violates both decentralization and breaks Zero Trust Conformance.