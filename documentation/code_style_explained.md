<!-- documentation/code_style_explained - Describes rules for code conformance. -->

# Share File Systems - Explanation of Code Style Conventions
This document explains why I intentionally choose older and often more verbose means of writing code as defined in the document [Code Style](./code_style.md).

## General JavaScript Language Considerations

### Array Iteration Methods
I don't make any rules around use or eliminate of things like map, filter, or reduce Array methods.
I only mention this because the popular code style of the moment among junior developers in the workforce appears to make heavy use of these methods with React framework.
This perception appears so strongly that, at the time of this writing, code making use of alternate conventions is frequently viewed with suspicion and/or hostility in hiring and candidate selection.

I prefer loops, because they are [imperative](https://en.wikipedia.org/wiki/Imperative_programming).
I prefer imperative code as a form of directness and explicitness.
A loop looks like a loop and is not easily confused for an event handler when quickly glossing through code.
The argument that declarative approaches are preferable as they ease reading of code evaporate as the size of an application increases, because large applications will require tremendous reading of code to maintain regardless of code style or paradigm.

### Explicitness - Braces
The code styles and conventions in place suggest maximum explicitness.
JavaScript supports optional syntax the way C language supports optional syntax, such as that curly braces are not required to contain a statement following an *if* expression.
The following is valid code JavaScript code that is not explicit:
`if (something) x += 1; return x;`

The above code omits use of curly braces.
When curly braces are omitted in this fashion only the first statement is applied by the preceding expression.
So, in that code example the complete *if* statement is:
`if (something) x += 1;`;

### Explicitness - Semicolons
Semicolons are somewhat optional in JavaScript.
More clearly, the language specification states that statements must be terminated with semicolons and if not supplied by the user they will be inserted via an automated process called Automatic Semicolon Insertion (ASI).
The rules for ASI are many and frequently result in unintended consequences when executing code.
As a result semicolons are required by this application under the reasoning that code predictability is more important that developer vanity.
Furthermore, semicolons ease reading of source code in exactly the same way as terminating at statement with a period or question mark in the English language.

Imagine reading a book without periods or question marks.
The book would likely be many characters shorter, but I suspect it would be slower to read and understand.

# Explicitness - Types
JavaScript is a loosely typed language.
This means values in comparison are coerced to boolean equivalents at run time, called *truthy* and *falsy*.
Examples of falsy values include: false, 0, null, undefined, NaN, and some other less common values.

Consider the code sample above:
`if (something) x += 1;`;

In that code sample a variable named *something* is coerced to a boolean equivalent and compared to boolean true:
`if (something === true) x += 1;`;

That type coercion may result in unintended consequences.
For example if the variable is numeric and is populated with value *0* it will be coerced to false even if we were really just interested if the variable had any value, as in not null or undefined.
These sorts of unintended consequences result in challenging to identify defects.
As a result explicit comparisons are required:
`if (isNaN(numericVariable) === false) {};`

Yes, TypeScript should catch many of these type violations, but for clarity and code maintenance explicit comparisons required regardless of automation.

### Named Functions
JavaScript made available arrow function syntax to the language in ES6 officially in June of 2015.
Arrow functions provide a far cleaner way to write code because they do not contain the keyword *function* or a function name.
As a result arrow functions are always anonymous.

In a decentralized application a single operation is a conversation across a network they may require multiple stages of listening and responding to a remote device.
When an application task fully resides on a single device a single call stack is often sufficient to determine where a problem occurs and how the logic arrives at the problematic location.
Once an operation leaves a device and traverses a network that call stack is abandoned.
Application instructions responding to incoming data will start a new call stack unrelated to the prior call stack.
Multiple various call stacks make troubleshooting errors more challenging, when much greater effort is required to retain and access prior call stacks.

Due to the added complexity incumbent upon a conversational back and forth of service data between devices a greater level of explicitness becomes warranted to assign in debugging.
That explicitness implies named functions, but as an application grows to contain many hundreds of functions a naming convention becomes necessary to ensure functions maintain a unique identity in any generated call stack.

### Inheritance and *this*
The keyword *this* is the pronoun of the JavaScript language.
In most cases using that keyword greatly extends maintenance time because you cannot determine the value of *this* by simply reading the code.

In most cases *this* refers to the prior step of the call stack.
In the case of arrow functions *this* is lexical, so it refers to the containing function.
For people new to the language the various *this* rules are incredibly complicated when diagnosing a defect.

In order to ease maintenance concerns use of *this* and any method that primary exists to modify *this* is forbidden.

## Browser Specific Conventions

### DOM Access
Query selectors are forbidden for accessing the DOM.
In the best case scenario query selectors execute about 500x slower than static DOM methods in Chrome and about 250,000x slower in Firefox as measured by micro-benchmarks.
In real world conditions these performance differences multiply according to the complexity of access to the DOM and the frequency of access.
Performance reasons alone are sufficient to ban query selectors because they are so stupendously slow.

Uniformity is additional reason to ban query selectors.
Query selectors allow reading of the DOM, but not modification.
As a result you must use a other conventions, such as the old static DOM methods, or some abstraction library that uses those static DOM methods for you.

### Events - Listeners
Event listeners are absolutely required in public applications.
The DOM is globally available and so any code that runs in a page has equal access to the DOM.
Without listeners only a single method is assignable to a DOM node's given event property, which means code that executes later will likely overwrite event assignments.

Event listeners dramatically increase code complexity in two ways.
First, assigning event handlers directly to a DOM node's given event property is a form of forced simplicity, such that simple means fewer.
Forced simplicity results in faster execution because there are fewer things executing.
It also forces the developer to organize their event handling logic into single functions which eases maintenance and eases potentials for race conditions.

Second, event handlers assigned via listeners are not directly associated to the DOM nodes on which they execute, such that the listener acts as proxy between the event source and handling logic.
This can frequently result in memory leaks as when elements are removed from the page the associated DOM artifacts and corresponding logic are garbage collected from memory, but the event handler may not be garbage collected.

Fortunately, this application executes code privately in a localhost environment without any third party code, and so listeners are not required.
As such, they are forbidden.