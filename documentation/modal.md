<!-- documentation/modal - Notes about modals and the graphic user interface that displays in the browser. -->
<!-- cspell:words keyup -->

# Share File Systems - Modals
The modals are the central means of communicating specific content to the user in the browser.  They are designed to be fluid and flexible to visual users much like an OS graphic user interface without sacrificing keyboard access or accessibility.

## Features
* *Buttons* - The interactive buttons available to a modal are all optional specified.
* *Movement* - The modals can be moved around the content area by holding the mouse down on the modal's title bar and moving the mouse cursor.
* *Resize* - If a modal allows resizing it can be adjusted by holding the mouse down on any side or corner and dragging the mouse cursor around the content area.

## API
The API is defined as a TypeScript interface.

### Primary modal interface
```typescript
interface ui_modal {
    agent: string;
    agentIdentity: boolean;
    agentType: agentType;
    content: Element;
    focus?: Element;
    height?: number;
    history?: string[];
    id?: string;
    inputs?: ui_input[];
    left?: number;
    move?: boolean;
    read_only: boolean;
    resize?: boolean;
    search?: [string, string];
    selection?: selection;
    share?: string;
    single?: boolean;
    status?: modalStatus;
    status_bar?: boolean;
    status_text?: string;
    text_event?: EventHandlerNonNull;
    text_placeholder?: string;
    text_value?: string;
    timer?: number;
    title: string;
    top?: number;
    type: modalType;
    width?: number;
    zIndex?: number;
}
```

* **agent** - The user/device the given modal is displaying content from.
* **agentIdentity** - When true the modal title is appended with a formatted agent type and agent name.
* **agentType** - Whether the modal's agent is of type *device* or *user*.
* **content** - A DOM node containing the modal's content that is appended to the modal's content body.
* **focus** - The DOM element holding the current focus, similar to `document.activeElement` but can apply to elements that don't normally hold a focus.
* **footer** - An optional custom content area separate from and following the modal's primary content area for us by things like a file navigate status bar or text message input area.
* **history** - File Navigator type modal's retain a history of prior locations. This is necessary for the *back* button's operation.
* **height** - Determines the height of the modal's content area.  Optional footer elements generate height in addition to this value.  The default is 400, which is 400 pixels.
* **id** - The unique identifier for the given modal.  This usually created dynamically as the modal is created unless the modal already exists upon page load.
* **inputs** - An array of buttons to appear in the modal.  See the next section for a description of the buttons available.
* **left** - The horizontal location of the modal as measured by the distance it's left side is offset from the left edge of the content area in pixels.
* **move** - Whether or not the modal can be moved by dragging onto the title bar.
* **read_only** - Whether or not the modal is in read_only mode.  A read_only modal receives a different context menu with fewer buttons and rejects certain actions.
* **resize** - Whether or not the modal can be resized.  If false the resize controls are not created for the modal.
* **search** - A text fragment of something to search for, such as a searching a file system location only for a certain file extension.  The search field does not support wildcards like file system search in most operating systems.
* **selection** - A list of selected items, such as selected file system items so that selection data is maintained even if the application is turned off.
* **share** - If a modal is representative of a *share* that identifier is stored here.  This identity is necessary to ensure content shared by a user is accessible via the security model.
* **single** - Whether only one instance of the given modal type may be available at a time or if many instances may be available.
* **status** - The display state of the modal which is: *normal*, *minimized*, *maximized*.
* **text_event** - The event to execute on the *keyup* event of input type *text*.
* **text_placeholder** - The default place holder text that is to appear in input type *text*.
* **text_value** - A default or stored value that should be populated in input type *text*, if present.
* **timer** - A numeric value representing milliseconds since Unix epoch 1 JAN 1970 as based upon local device clock. This is optionally supplied in case timed events or periodic delays are necessary.
* **title** - The text will populate the modal's title bar.
* **top** - The vertical placement of the modal as measured by the modal's top edge offset from the content area's top in pixels.
* **type** - The types of modals available.  See the section below on *type modalType*.
* **width** - The width of the modal.  The default is 400, which is 400 pixels.
* **zIndex** - Determines which modals visually overlap other modals.

### type ui_input, Buttons available to the modal
```typescript
type ui_input = "cancel" | "close" | "confirm" | "maximize" | "minimize" | "save" | "text";
```

* **cancel** - A red button that appears in a summary area below the modal's body content.  This button is intended to be optional neighbor to a *confirm* type button.  This button is identical functionality to the *close* button and is only different in appearance and location.
* **close** - A red button that looks like the letter X and appears near the top right corner of the modal.  Clicking this button will close the modal.  Once closed the modal is gone forever.
* **confirm** - A green confirmation button that appears in a summary area below the modal's body content.  Clicking this button will execute specific task depending upon the modal type.
* **maximize** - A blue button with an arrow icon pointing to a rectangular corner located near the top right corner of the modal.  Clicking this button will change the modal's size so that it occupies the entirety of the content area.
* **minimize** - An orange button with a diagonal downward pointing arrow that appears near the top right corner of the modal.  Clicking this button will visually hide all aspects of the modal except for a size reduced title bar and move the modal into the tray at the bottom of the content area.
* **save** - A button that appears in a summary area under the body content.  Clicking this button allows functionality for writing modal content to a file saved onto the file system.
* **text** - Provides a text input area near the top of the modal.  The file address at the top of the File Navigator modals is an example of this text feature.

### type modal_types, The type of modal supported
```typescript
type modalType = "agent-management" | "configuration" | "console" | "details" | "document" | "export" | "fileEdit" | "fileNavigate" | "invite-accept" | "message" | "shares" | "textPad";
```

* **agent-management** - Displays forms to invite new agents, rename existing agents, or delete agents.
* **configuration** - Displays the user's configuration preferences.
* **details** - Details recursive details about a file system artifact.
* **document** - A generic modal that displays an empty modal body element without any content or formatting.  The intention of this modal is to allow messaging directly to the end user whether formatted as HTML, markdown, PDF, or some other format.
* **export** - A text pad modal with the settings loaded as the default value and a confirmation button to apply changes.
* **fileEdit** - Allows editing a file as text and writing those changes back into the file.
* **fileNavigate** - A means of walking, visualizing, and interacting with a device's file system.
* **invite-accept** - The modal that appears on the remote device when an invitation is sent.
* **message** - Allows display and writing of text messages.
* **shares** The modal that displays a user's current shares when click on the user's button from the right side user list.
* **textPad** - A minimal modal where the body area is filled with a textarea HTML element for free type text.

### type modalStatus, The visual state of a modal
```typescript
type modalStatus = "hidden" | "maximized" | "minimized" | "normal";
```

* **hidden** - Some modals dynamically receive updates irrespective of other data states.  In this case the modal must remain available to continue to receive informational updates.  When a user closes such a modal it is isn't removed from the document, but instead visually hidden as though it were removed.  The status *hidden* reflects this hidden pseudo-closed state.
* **maximized** - A modal that is maximized to fill the entirety of the content area.
* **minimized** - A modal that is minimized to the bottom tray.  Only the title of this modal is available and everything else is hidden from both visual users and assistive technologies.
* **normal** - A modal that occupies space in the content area without being maximized or minimized.