<!-- documentation/code_style - Describes rules for code conformance. -->

# Share File Systems - Code Style
For reasoning and design considerations see the document [Code Style Explained](./code_style_explained.md).

## User Facing Concerns
These are the design criteria which determine code style guidance.

* **Accessibility** - Can all users, regardless of disabilities, make use of the application relatively equally?  It is accepted the user experience will be different for users accessing the application with assistive technologies, but even still those users must be able to access the various features and utilities the application offers.
* **Availability** - Does the application/feature/utility consistently work as intended?  This is one of the three cornerstones of security.
* **Brevity** - Does the application/feature/utility do exactly as it suggests and nothing more and nothing different?  Code should be purposely written with the fewest instructions possible.
* **Confidentiality** - Is the users data protected from unauthorized disclosure?  This is one of the three cornerstones of security.
* **Integrity** - Does the application present and transmit data exactly as the data exists outside the application?  The contrary state is data corruption.  This is one of the three cornerstones of security.
* **Performance** - Does a provided event or information request execute as quickly as possible?  A user must never have to wait for the convenience of the developer.
* **Understandability** - Does the application communicate its utilities, error states, interactions, and intentions clearly?  Be clear, direct, and precise.  This focuses solely upon directed communications such as messaging, documentation, and guidance written for the user to read.
* **Usability** - Is the application clearly understood in its interaction, use cases, and access?  This focuses solely upon indirect communications such as event interactions, information binding, use cases, and interpretation.

These concerns determine what code decisions are most desirable.  For example querySelectors are forbidden, because while they reduce the number of instructions in the code they execute extraordinarily slowly compared to other means of access, thus violating performance.  The goal is not to write software primarily for the convenience of the developer writing that software, but instead for the user consuming that software.

## Rules
These are the rules by which code is an objective pass or failure.  Any exceptions to these rules will be individual considered.

### Automation
1. Build must complete successfully.
2. Automation tests must complete successfully.

### DOM
1. Selectors are forbidden, such as querySelector or querySelectorAll.

### Browser Events
1. Events will be assigned to a DOM object's event property directly. Event listeners are forbidden.
2. Event handlers will infer DOM access from their implicit event object via `event.target`.  Access to a DOM reference assigned outside the event handler is forbidden.  This prevents memory leaks and increases performance.

### Extension
1. Inheritance, whether classes or prototypes, is forbidden.
2. Function methods `bind`, `call`, and `apply` are forbidden.
3. `Object.create` is forbidden.
4. Asynchronous flow control will be conducted with callbacks.  Promises and async functions are forbidden.  This ensures the least syntax and maximum visibility of flow control.
5. Functions are forbidden from specifying more than 3 arguments.  If more arguments are required the function will accept 1 argument which is a object.

### Loops
1. The array `forEach` method is allowed.
2. Function recursion is allowed, but a recursive call will reference the function name and not the variable it is assigned to.
3. The default loop style is `do/while`.
4. Other forms of loops are forbidden.

### Naming Conventions
1. All variables will use camel case notation.  Names should describe the variable's primary purpose and should be short.
2. Variables must not share a name with a variable they can access in a higher scope.
3. Iterators will be named a single lowercase letter starting with `a`.  In the case of nested loops the outermost iterator will be `a`, the next will be `b`, and so forth.
4. The function naming convention is an underscore separated list of words.  The first part of that list describes the structure in which the file occur followed by the name of the module or file and then followed by the function's lexical scope.  This cumbersome naming convention exists to speed maintenance and debugging by reading a call stack and able to logically identify the flow control and placement of the given error from the entirety of the project.  Examples:
   * `browser_share_content_fileNavigate_getElement` where the function occurs in file module *share* of directory *browser*, is a child of the function `browser_share_content_fileNavigate` which is a child of function `browser_share_content`, and is assigned to variable `getElement`.
   * Avoid repeated names, such as `terminal_server_rename_rename` as this is confusing and lacks descriptive specificity.
5. All functions will be named using the function naming convention.
6. All function names will be unique.
7. Files will use lowercase names with words separated by underscores.

### Node
1. Synchronous methods are forbidden if an asynchronous method is available.

### Reuse
1. Nested functions are permitted.
2. Modules and methods are preferred.

### Syntax
1. Declare by using `const` as much as possible, but `let` is permitted only for primitives that require reassignment.  `var` is forbidden.
2. Declare functions as expressions (assignment to variables).
3. All functions will be declared as either an assignment to a variable, an object property, or as an argument of a function.
4. Curly braces will be explicitly used with conditions even if optional.
5. Statements will be terminated with semicolons.
6. Operators `++` and `--` are forbidden.
7. Keyword `this` is forbidden.
8. Do not use keyword `else` after a `return` or `break` statement.
9. Console statements can be used for testing and troubleshoot, but are otherwise forbidden without a qualified exception.
10. Try/catch blocks are forbidden.  This convention prevents execution via JIT.  Do not intentionally provide fragile code.

### Types Declarations
1. Type *any* is mostly forbidden, but exceptions are allowed.
2. All variable declarations must provide a type definition except for functions. Violations are found by search the project's code with the regular expression `((const)|(let)) \w+ = (?!(function))`.
3. The prior rules apply to function arguments and function declarations.
4. Custom primitive types are required where specific values are required by multiple variables or functions.

### White Space
1. 1 step of indentation is 4 spaces.
2. All code structures that contain an opening and closing brace and contain either statements or more than 4 items will have child contents indented.
3. There will be a space separating operators from adjacent code.
4. All other white space rules are largely insignificant.