<!-- documentation/test_browser - How this application achieves test automation. -->

# Share File Systems - Browser Test Automation

## Code location
The necessary code is almost exclusively located in two files:

* [../lib/browser/remote.ts](../lib/browser/remote.ts) - event execution, DOM traversal, and test evaluation
* [../lib/terminal/test/samples/browser.ts](../lib/terminal/test/samples/browser.ts) - test definitions, messaging, service

All test evaluation occurs in the remote.ts file, which almost exclusively consists of DOM traversal and event execution.  At this time the test automation is capable of executing all user events except events associated cursor movement.  The second file, browser.ts, starts the necessary service, opens the browser for testing, and stores the test instructions.

Those two files are sufficient for executing and messaging all tests except those that require a page refresh.  In order to sufficiently communicate test instructions to the browser that survive a page refresh a given test campaign is stored in the *serverVars* object and communicated to the page as comment by the *methodGET.ts* library.  The page receives this instruction on HTML request and executes the given refresh test from a single instruction in *localhost.ts*.

## Security considerations
The ability to extensively automate user interaction with times precision through access to all aspects of a web page is powerful.  Such a technique can be used to build automated bots that traverse e-commerce shopping pages, screen scape data typically hidden from automation, or screen script private and person user data.  A few conventions should be considered in order to prevent malicious use of browser automation:

* If possible do not include the *remote.ts* library code in a page unless under a dedicated test exercise from the server.
* If the prior safeguard is not feasible then at least hide access to *remote.ts* library code to a flag.  This application uses a URL query string segment which sets a different data storage location so that user data never intermingles with event automation.
* Browser refresh tests should be separated from other tests and execute under an additional flag as an additional safeguard.

## Data structure
The test definitions follow the custom TypeScript interface *testBrowserItem*:

```typescript
    interface testBrowserItem {
        delay?: testBrowserTest;
        index?: number;
        interaction: testBrowserEvent[];
        name: string;
        test: testBrowserTest[];
    }
```

An example test campaign:

```typescript
// expand a directory
browser.push({
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
        }
    ],
    name: "Directory expansion",
    test: [
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
        }
    ]
});
```

### Data components, primary
* **delay** - An optional test for a change in the page.  This test follows an identical structure to other tests, but is especially select apart from the other tests.  The delay is used to invoke a timed delay before evaluating other tests which could be necessary to wait for timely changes in the page or for a data response.
* **interaction** - An array of event objects where each event object contains an event name and a DOM location.  Since this is an array a list of events and event locations can be specified to complete a given test campaign goal.
* **name** - A string describing what a given test campaign is evaluating.
* **test** - An array of tests to evaluate.  While the delay provides an optional test item this test array is mandatory and must have at least one test item.

### Data components, child
* **event** - A string event name to execute in the browser.
* **node** - The node array is used in the delay, test array items, and interaction.  This specifies where in the page a given event or evaluation occurs.  This is an array of child arrays where each child array stores a DOM method, a value for that method, and an index for returned node lists.  If the index value isn't needed, such as with *getElementById* method, a value of null is sufficient.  Any negative number value will instruct the browser code to gather the last item in the returned node list.
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
* **property** - Whether the target value is an object property or a DOM element attribute.
* **value** - The provided value to evaluate against the returned value.

## How this works
All tests are specified outside the browser.  The code outside browser determines which tests to execute in which order.  This library sends a given test campaign to the browser and waits for the test evaluation before sending the next test.  Executing tests in serial order, as opposed to in parallel, is slower but is necessary because often later tests are dependent upon a state dictated by prior tests.

In the browser any event can be arbitrarily created using the method *document.createEvent*.  The event is then executed upon a specified DOM element.  Even mouse movement can be created in this way, unfortunately there is not a convention available to arbitrarily execute cursor movement using code automation so those mouse movement events cannot be executed for evaluation.

Once the event executes in the browser the delay is evaluated as the first test of the current test campaign.  The delay will either fulfill or will timeout.  Timed out delay will send failure messaging to the service where a fulfilled delay will move forward to test evaluation.  Once all tests are evaluated a data structure is returned to the service indicating which tests passed and which failed.

Once the service has determined all tests have passed or the current test campaign has a failure a final message is sent to the browser to close the current browser tab.  That's all there is to it.

## Timed delays
The test runner eliminates timed delays between test scenarios thanks to the *delay* object provided in each test object, but internally there are a few timed delays.

### Delay iterations
On the browser side when executing the *delay* logic provided by the test object the application logic defaults to polling at a rate of 50ms for 40 iterations after which the test is marked as a failure due to delay time out.  These numbers can be customized in the *remote.delay* method in the `lib/browser/remote.ts` file.

### Test iterations
On the terminal side in the *browser.iterate* method within the file `lib/terminal/test/samples/browser.ts` there is a timed delay between the logging of one test and sending the next one to the browser.  The default delay is 25ms which is enough time to ensure the current test object is stored in the `serverVars.testBrowser` property for access else where.  The only place that needs access to the test definition is the `lib/terminal/server/methodGET.ts` library which can make the test available to the page as an HTML comment.  That is necessary only when evaluating a browser refresh event to ensure the test logic is available within the page after the page loads without any request outside the browser.

If the prior test is a refresh event that default 25ms delay is increased to 500ms.  That increased delay is necessary to ensure the browser has enough time to complete a page refresh and request the page code before the delay elapses otherwise the methodGET.ts library will be a test ahead of what the browser expects and the browser thus receives the wrong test code to evaluate upon completing a page refresh.

### Completion of all tests
Once a test campaign reports failure or all tests are complete there is a final timed delay.  The instruction within this last delay sends the instruction to kill the current executing process.  Immediately prior to the delay there is an instruction sent to the browser to close the browser window.  It takes longer to execute a network transmission instruction than it does to kill a process in the operating system, so a delay is necessary to ensure the network instruction is sent before the process is killed.