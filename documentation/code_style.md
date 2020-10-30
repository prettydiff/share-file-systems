<!-- documentation/code_style - Describes rules for code conformance. -->

# Share File Systems - Code Style

## DOM
1. Selectors are forbidden, because they are stupendously slow.

## Events
1. Events will be assigned to a DOM object's event property directly. Event listeners are forbidden.
2. Event handlers will infer DOM access from their implicit event object via `event.target`.  Access to a DOM reference assigned outside the event handler is forbidden.  This prevents memory leaks and increases performance.

## Extension
1. Inheritance, whether classes or prototypes, is forbidden.
2. Function methods `bind`, `call`, and `apply` are forbidden.
3. `Object.create` is forbidden.
4. Asynchronous flow control will be conducted with callbacks.  Promises and async functions are forbidden.  This ensures the least syntax and maximum visibility of flow control.
5. Functions are forbidden from specifying more than 3 arguments.  If more arguments are required the function will accept 1 argument which is a object.

## Loops
1. The array `forEach` method is allowed.
2. Function recursion is allowed, but a recursive call will reference the function name and not the variable it is assigned to.
3. The default loop style is `do/while`.
4. Other forms of loops are forbidden.

## Reuse
1. Nested functions are permitted.
2. Modules and methods are preferred.

## Syntax
1. Declare by using `const` as much as possible, but `let` is permitted only for primitives that require reassignment.  `var` is forbidden.
2. Declare functions as expressions (assignment to variables).
3. All functions will be named using a standard naming convention.
4. Curly braces will be explicitly used with conditions even if optional.
5. Statements will be terminated with semicolons.
6. Operators `++` and `--` are forbidden.
7. Keyword `this` is forbidden.
8. Do not use keyword `else` after a `return` or `break` statement.

## Types Declarations
1. All objects must be declared against an interface.
2. Function expressions need not receive a type definition.
3. All other types must be declared against either a built-in type or custom type.
4. The prior rules apply to function arguments and function declarations.
5. Custom primitive types are required where specific values are required by multiple variables or functions.

## White Space
1. 1 step of indentation is 4 spaces.
2. All code structures that contain an opening and closing brace and contain either statements or more than 4 items will have child contents indented.
3. There will be a space separating operators from adjacent code.
4. All other white space rules are largely insignificant.