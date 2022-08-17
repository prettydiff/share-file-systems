<!-- documentation/test_browser - How this application achieves test automation. -->

# Share File Systems - Browser Test Automation
Execute test automation in the browser using just JavaScript and without dependencies.

[Video demo](https://prettydiff.com/share-test-automation.mp4)

## Contents
* [Why](#why)
* [Benefit of this approach](#benefit-of-this-approach)
* [Demonstration using this application](#demonstration-using-this-application)
* [How this works](#how-this-works)
   * [Preserve the test scenario](#preserve-the-test-scenario)
   * [Mouse movement](#mouse-movement)
   * [Event bubbling](#event-bubbling)
* [Page refresh events](#page-refresh-events)
   * [Refresh event](#refresh-event)
   * [Refresh-Interaction event](#refresh-interaction-event)
* [String values](#string-values)
   * [Backslash](#backslash)
* [Timed Delays](#timed-delays)
   * [Delay iterations](#delay-iterations)
   * [Test iterations](#test-iterations)
   * [Completion of all tests](#completion-of-all-tests)
* [Code location](#code-location)
* [Data structures](#data-structures)
   * [Data components, primary](#data-components-primary)
   * [Data components, tests/delay and interaction](#data-components-testsdelay-and-interaction)
   * [Data components, tests/delay only](#data-components-testsdelay-only)
   * [Data components, interaction only](#data-components-interaction-only)
* [A note about Firefox](#a-note-about-firefox)
* [Security considerations](#security-considerations)

---

<!-- cspell:words contextmenu, dblclick, keydown, keyup, mousedown, mouseleave, mousemove, mouseout, mouseup, testsdelay, touchend, touchstart -->

## Why
This application is a peer-to-peer browser application, which means multiple instances of this application present on different computers talk to each other.  That means I need a way to perform test automation that executes user interaction events in the browser and I need the freedom to specify on which computer a given event executes.

## Benefit of this approach
The tests specify locations in the browser using standard DOM methods and custom DOM methods created by this application.  By using a DOM based approach this method of testing can be **adapted to any JavaScript browser application written with any framework** and precisely target anything within that application.  The only thing this application cannot do is move the mouse cursor as this is restricted by browsers for security.

## Demonstration using this application
From the terminal use this command to run the browser test automation:

`share test_browser`

For options associated with any command please see the command documentation:

`share commands test_browser`

---

## How this works
All tests are specified outside the browser.  The code outside the browser determines which tests to execute in which order.  This library sends a given test to the default browser and waits for the evaluation before sending the next test.  Executing tests in serial order, as opposed to in parallel, is slower but is necessary because often later tests are dependent upon a state dictated by prior tests.

In the browser any event can be arbitrarily created using the method `document.createEvent`.  The event is then executed upon a specified DOM element.  Even mouse movement can be created in this way, **unfortunately there is not a convention available from the browsers to arbitrarily execute cursor movement using code automation so those mouse movement events cannot be executed for evaluation in visually meaningful way.**

Once the event executes in the browser the delay, if present, is evaluated as the first test unit of the current test.  The delay will either fulfill or will timeout.  Timed out delay will send failure messaging to the service while a fulfilled delay will move forward to evaluation.  Once all test units are evaluated a data structure is returned to the service indicating which test units passed and which failed.

Once the service has determined all test units have passed or the current test has a failure a final message is sent to the browser to close the current browser tab.  That's all there is to it.

### Preserve the test scenario
By default once the test completes, whether pass or fail, the service and the created browser tab closes.  Sometimes it is helpful to keep the test service running and the browser tab open so that a user can continuing experimenting manually.  This is possible using the *no_close* argument: `node js/lib/terminal/utilities/terminal.js test_browser no_close`.  Since this option keeps browser tabs open from prior tests it is strongly advised to close these tabs before running subsequent tests to reduce the potential of interference from any signals emitted by those prior browser tabs.

### Mouse movement
Mouse movement can be faked though by imposing a *mousedown* event on the target area and then arbitrarily dictating coordinates to dynamically modified CSS properties in question, and finally executing a *mouseup* event.  This is not an accurate reflection of mouse movement but may allow some limited testing of other concerns dependent upon mouse movement.

For Convenience a **move** event is supported.  A test interaction whose event is *move* requires use of a *coords* property.  The coords property takes an array of two numbers.  The first number represents a top offset and the second number represents a left offset.  The values are arbitrarily assigned to the target node's CSS properties *top* and *left*, respectively, using the CSS dimension **em**.

### Event bubbling
Event bubbling is turned on for events created by the tests.  This is intentional such that tests more closely align to real world behavior.

If bubbling behavior is required for a test to trigger an action one of two solutions are available:

* Additionally specify an event to action on the ancestor element.
* Modify the default test behavior to allow bubbling.  Open file `lib/browser/remote.ts`, change the following line of code and then rebuild the application:

```typescript
action.initEvent(config.event, true, true); // change that second argument from true to false
```

---

## Page Refresh events
### Refresh event
In the case of a test that needs to refresh the page use the **refresh**.  These limitations apply to the use of *refresh* event:

* The *refresh* must be the only event of the given test.
* Refresh tests must not contain a *delay* property.

### Refresh-Interaction event
Some interactions in a page may trigger a page refresh.  In this case a page is refreshed due to specified test events, but not the *refresh* event intentionally called by a test.  To account for a page refresh use the *refresh-interaction* event which instructs the code to not evaluate test units until after a page is refreshed.

---

## String values
### Backslash
In JavaScript and JSON the backslash character has syntax value as an escape character or an encoding character such that the character following a backslash is escaped from all meaning and interpreted as a string, for example: `"\""`.  In this example there are three quote characters, but the middle one is escaped by the backslash so that it is a literal printable character while the first and third quotes are syntax characters.

The backlash character is also the file system separator in Windows.  These two completely unrelated meanings for that character often results in problems.

Every time a string is interpreted in JavaScript backslashes are interpreted for their syntax quality of character escapes.  That means the earlier example becomes `"""` before printing the string the user as `"`.  If a backslash must be retained and printed the user then it and the quote character must be escaped: `"\\\""`.  A backslash is escaped by another backslash and the quote character continues to be escaped by a backslash so that the user reads: `\"`.

Backslashes are sacrificed to syntax every time a string in interpreted.  That is problematic in that it will change the value of the string.  In cases that changed value could result in a string that says something very different.  If the string is interpreted by a parser, such as conversion to JSON, it will likely result in broken syntax that breaks an application.

Bottom line: **for strings that contain backslashes and are not immediately and terminally assigned to a DOM property, such an input element's value property, a test author must be aware of that string's chain of custody to know how many times a backslash must be escaped.**

### Identity
Many aspects of identity, regardless of what they represent, are dynamically created.  Because they are often dynamic it is important to avoid including features of identity in test strings.  Instead provide, where possible, the means to create the identity value.

Sometimes it isn't feasible to include identity recreation without breaking an application.  In this case it makes more sense to perform string replacement such that a generic token representing an identity value is specified in the test string and replaced by a value in memory as the test event occurs in the browser.  This requires two steps:

* Create a unique enough value to represent the identity value of concern.
* Add that unique value as a *replace* method to the **stringReplace** function of the `lib/browser/remote.ts` file.  See this code example where a key *string-replace-hash-hashDevice* is provided in the test string for replacement by a dynamically created hash string:

```typescript
stringReplace = function local_remote_testEvent_stringReplace(str:string):string {
    return str
        .replace(/string-replace-hash-hashDevice/g, browser.data.hashDevice)
        .replace(/string-replace-hash-hashUser/g, browser.data.hashUser);
}
```

---

## Timed delays
The test runner eliminates timed delays between test scenarios thanks to the *delay* object provided in each test object, but internally there are a few timed delays.

### Delay iterations
On the browser side when executing the *delay* logic provided by the test object the application logic defaults to polling at a rate of 50ms for 40 iterations after which the test is marked as a failure due to delay time out.  These numbers can be customized in the *remote.delay* method in the `lib/browser/remote.ts` file.

### Test iterations
On the terminal side in the *browser.iterate* method within the file `lib/terminal/test/application/browser.ts` there is a timed delay between the logging of one test and sending the next one to the browser.  The default delay is 25ms which is enough time to ensure the current test object is stored in the `serverVars.testBrowser` property for access else where.  The only place that needs access to the test definition is the `lib/terminal/server/methodGET.ts` library which can make the test available to the page as an HTML comment.  That is necessary only when evaluating a browser refresh event to ensure the test logic is available within the page after the page loads without any request outside the browser.

If the prior test is a refresh event that default 25ms delay is increased to 500ms.  That increased delay is necessary to ensure the browser has enough time to complete a page refresh and request the page code before the delay elapses otherwise the methodGET.ts library will be a test ahead of what the browser expects and the browser thus receives the wrong test code to evaluate upon completing a page refresh.

### Completion of all tests
Once a test reports failure or all tests are complete there is a final timed delay.  The instruction within this last delay sends the instruction to kill the current executing process.  Immediately prior to the delay there is an instruction sent to the browser to close the browser window.  It takes longer to execute a network transmission instruction than it does to kill a process in the operating system, so a delay is necessary to ensure the network instruction is sent before the process is killed.

---

## Code location
The necessary code is almost exclusively located in these files:

* [../lib/browser/remote.ts](../lib/browser/remote.ts) - event execution, DOM traversal, and test evaluation
* [../lib/terminal/test/application/browser.ts](../lib/terminal/test/application/browser.ts) - test definitions, messaging, service
* [../lib/terminal/test/samples/browser_self.ts](../lib/terminal/test/samples/browser_self.ts) - test samples for a single computer only
* [../lib/terminal/test/samples/browser_device.ts](../lib/terminal/test/samples/browser_device.ts) - test samples for multiple computers
* [../lib/terminal/test/samples/browser_user.ts](../lib/terminal/test/samples/browser_user.ts) - test samples for multiple computers

The `browser_self` test list is the default that executes.  The `browser_device` tests execute with a mode argument of "device".  The `browser_user` tests execute with a mode argument of "user".  Both device and user tests require four local machines, or virtual machines, listening in mode "remote".  The mode is supplied as command argument from the terminal, such as: `mode:device`.

All test evaluation occurs in the remote.ts file, which almost exclusively consists of DOM traversal and event execution.  At this time the test automation is capable of executing all user events except events associated cursor movement.  The second file, browser.ts, starts the necessary service, opens the browser for testing, and stores the test instructions.

Those two files are sufficient for executing and messaging all tests except those that require a page refresh.  In order to sufficiently communicate test instructions to the browser that survive a page refresh a given test is stored in the *serverVars* object and communicated to the page as comment by the `lib/terminal/server/methodGET.ts` library.  The page receives this instruction on HTML request and executes the given refresh test from a single instruction in `lib/browser/index.ts`.

---

## Data structures
The test definitions follow the custom TypeScript interface *testBrowserItem*:

```typescript
    interface testBrowserItem {
        delay?: testBrowserTest;
        index?: number;
        interaction: testBrowserEvent[];
        name: string;
        unit: testBrowserTest[];
    }
    interface testBrowserEvent {
        coords?: [number, number];
        event: eventName;
        node: browserDOM[];
        value?: string;
    }
    interface testBrowserTest {
        node: browserDOM[];
        nodeString?: string;
        qualifier: qualifier;
        target: string[];
        type: "attribute" | "element" | "property";
        value: boolean | null | number | string;
    }
```

An example test:

```typescript
// expand a directory
[]
    delay: {
        // that file list contents are available
        node: [
            ["getModalsByModalType", "fileNavigate", 0],
            ["getElementsByClassName", "fileList", 0],
            ["getElementsByTagName", "li", 0],
            ["getElementsByTagName", "ul", 0]
        ],
        qualifier: "is",
        target: ["class"],
        type: "attribute",
        value: "fileList"
    },
    interaction: [
        {
            event: "click",
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "button", 0]
            ]
        },
        // resize browser window to a width of 350 pixels by 500 pixels.  the window uses pixels as the dimension
        {
            coords: [350, 500],
            event: "resize",
            node: [
                ["window", null, null]
            ]
        },
        // resize DOM element to 35em width and 50em height using CSS directly on the element
        {
            coords: [35, 50],
            event: "resize",
            node: [
                ["window", null, null]
            ]
        },
        // move an element to a different location 50em to the left and 70em from the top of the containing element and this will be applied using CSS left and top with "em" dimension on the DOM element which only works if conditions in the page allow
        {
            coords: [50, 70],
            event: "move",
            node: [
                ["getModalsByModalType", "fileNavigate", 0]
            ]
        }
    ],
    name: "Directory expansion",
    unit: [
        {
            // the first child list item of the expanded directory thus contains its own expansion button
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "span", 0]
            ],
            qualifier: "contains",
            target: ["innerHTML"],
            type: "property",
            value: "Expand this folder"
        },
        // the first child list of the expanded directory is itself a directory
        {
            node: [
                ["getModalsByModalType", "fileNavigate", 0],
                ["getElementsByClassName", "body", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "li", 0],
                ["getElementsByTagName", "span", 1]
            ],
            qualifier: "contains",
            target: ["innerHTML"],
            type: "property",
            value: "directory"
        },
        // test something from the global *window* object (notice that node is not used, because the window object is separate from the DOM)
        {
            node: [],
            qualifier: "begins",
            target: ["window", "location", "href"],
            type: "property",
            value: "http://localhost"
        }
    ]
];
```

### Data components, primary
* **delay** - An optional test unit for a change in the page.  This test unit follows an identical structure to other test units from the unit array.  The delay is used to invoke a timed delay before evaluating other test units which could be necessary to wait for timely changes in the page or for a data response.
* **interaction** - An array of event objects where each event object contains an event name and a DOM location.  Since this is an array a list of events and event locations can be specified to complete a given test goal.
* **name** - A string describing what a given test is evaluating.
* **unit** - An array of test units to evaluate. Whether from the optional delay or an index in the unit array there must be one test unit per test.

### Data components, units/delay and interaction
* **node** - The node array is used in the delay, unit array items, and interaction.  This specifies where in the page a given event or evaluation occurs.  This is an array of child arrays where each child array stores a DOM method, a value for that method, and an index for returned node lists.  If the index value isn't needed, such as with *getElementById* method, a value of null is sufficient.  Any negative number value will instruct the browser code to gather the last item in the returned node list.

### Data components, units/delay only
* **qualifier** - This determines the means of evaluation and currently supports these values:
   * *begins* - This value says to evaluate the returned value as a string with the provided value present starting at index 0 of the returned value.
   * *contains* - This value says to evaluate the returned value as a string with the provided value present at any position of the returned string.
   * *ends* - This value says to evaluate the returned value as a string with the provided value present at the end of the returned value.
   * *greater* - That the returned value is a number and greater than provided value which is also a number.
   * *is* - The provided value exactly matches the returned value.
   * *lesser* - That the returned value is a number and less than provided value which is also a number.
   * *not* - The provided value does not exactly match the returned value.
   * *not contains* - The returned value is a string and the provided value is not present at any location of the returned value.
* **target** - A string array specifying an attribute the properties to call on a given DOM node.  For example requesting a CSS value on a node: `node.style.display` would be provided as `["style", "display"]`.
* **type** - Where to look for a value.  Values: *attribute*, *element*, *property*.
    * *attribute* - Gathers the attribute value of a DOM element.
    * *element* - Gathers the DOM element and asserts against that DOM element directly.
    * *property* - Evaluates an object property on either a specified DOM node or the global Window object.
* **value** - The provided primitive to assert against.

### Data components, interaction only
* **coords** - An array of two integers that are required for use in an interaction when the event of that interaction is *move*.
* **event** - A string event name to execute in the browser:
   * *blur* - The standard blur event executes when a form field looses focus.  Form field can refer to these HTML elements: button, input, select, textarea, and other elements expecting user interaction.
   * *click* - The standard click event executes when a pointing device, such as a mouse cursor, is clicked and released on a given element and when the "Enter" key is pressed and released.
   * *contextmenu* - This standard event executes on right click of an element.
   * *dblclick* - This standard event is fired by a rapid two clicks where the timing of rapid is defined by the operating system.
   * *focus* - This standard event fires when an element becomes active as recognized by the DOM method `document.activeElement()`.
   * *keydown* - This standard event fires when a keyboard key is pressed and continues to fire multiple times if the key continues to be pressed.  The frequency of repeated event executions is defined by the machine operating system.
   * *keyup* - This standard event fires when a keyboard key that is pressed is then released.
   * *move* - This event is custom to the test environment.  For security reasons the browser will not allow JavaScript to capture and direct the mouse cursor position, so this event allows for arbitrary movement of a DOM element for the convenience of testing.  This event uses a `coords` property in the given interaction object which is an array of two numbers that serve as coordinates for CSS properties *top* and *left* respectively in CSS *em* dimensions.
   * *mousedown* - This standard event executes when a mouse button is pressed on a given element.
   * *mouseenter* - This standard event executes when a mouse cursor enters the bounding area of a given element.
   * *mouseleave* - This standard event executes when a mouse cursor exits the bounding area of a given element.
   * *mousemove* - This standard event executes when a mouse cursor moves while remaining within the bounding area of the given element.
   * *mouseover* - A standard event that is similar to the *mouseenter* event.  See this page for the distinction: https://developer.mozilla.org/en-US/docs/Web/API/Element/mouseover_event#example
   * *mouseout* - A standard event that is similar to the *mouseleave* event.  See this page for the distinction: https://developer.mozilla.org/en-US/docs/Web/API/Element/mouseout_event#examples
   * *mouseup* - This standard event executes when a mouse button that is pressed is released.
   * *refresh* - A custom event for this test environment that forces a page refresh and allows testing immediately upon the page becoming ready for evaluation.  A test with this event must have only one interaction.
   * *refresh-interaction* - A custom event for this test environment that executes an event which causes the page to refresh, such as *location.reload()* executing in the page in response to a user interaction, and evaluates the page once it is ready for evaluation.
   * *resize* - Resize either the browser window or a DOM element. This event uses a `coords` property to specify the width and height. To resize the browser window the node array must contain 1 item whose first index must be `window`.  Resize uses pixels as the dimension when applied to the browser window and CSS *em* dimensions when applied to a CSS element.
   * *select* - A standard event that executes upon text selection, such as dragging the cursor across text to highlight it.
   * *setValue* - A custom event for this test environment that sets a value on input and textarea elements instead of forcing test authors to write events for pressing each keyboard key.
   * *touchend* - A standard event for touch screen interfaces that executes when a pointer, such as a finger, leaves the device.
   * *touchstart* - A standard event for touch screen interfaces that executes when a point, such as a finger, first touches the device.
   * *wait* - A custom event for this test environment that imposes an arbitrary wait duration in the browser.  This event makes use of the `value` property it its interaction object and the value represents a number of milliseconds.
* **value** - Required for use in an interaction when that interaction's event is: *keydown*, *keyup*, or *setValue*.  In the case of *setValue* any string is accepted.  In the case of keyboard events any single character will be accepted or predefined names of keyboard functions: [https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values)

---

## A note about Firefox
If Firefox is your default or preferred browser it may not execute test automation properly.  Firefox tends to slow down in execution performance over time.  This may not be obvious to normal usage but this performance fatigue can break test automation, which attempts to execute instructions as fast as instructions allow.  To mitigate this problem delete your archived user profiles.  See this link for more information: [https://support.mozilla.org/en-US/questions/1229621](https://support.mozilla.org/en-US/questions/1229621)

---

## Security considerations
The ability to extensively automate user interaction with times precision through access to all aspects of a web page is powerful.  Such a technique can be used to build automated bots that traverse e-commerce shopping pages, screen scape data typically hidden from automation, or screen script private and person user data.  A few conventions should be considered in order to prevent malicious use of browser automation:

* If possible do not include the *remote.ts* library code in a page unless under a dedicated test exercise from the server.
* If the prior safeguard is not feasible then at least hide access to *remote.ts* library code to a flag.  This application uses a URL query string segment which sets a different data settings location so that user data never intermingles with event automation.
