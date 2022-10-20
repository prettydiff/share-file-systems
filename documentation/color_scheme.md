<!-- documentation/color_scheme - Describes how to create color schemes for the application -->

# Share File Systems - Color Scheme

## Technical Requirements
1. Scheme Name
1. Background Image
1. Credits
1. CSS File
1. Modal defaults
1. Code Build

### Scheme Name
The name for the new scheme must be one word that visually describes the new scheme.

### Background Image
Find an image from the internet to use as the background of the new color scheme.  The image must be 4K resolution (3840 x 2160 pixels) and saved with a descriptive file name into this project's `/lib/media` directory.  The background image sets the tone and color impression for the scheme.  There are many websites offering high quality images by searching for *4k desktop wallpaper*.

### Credits
Open this projects file `/documentation/credits.md`.  Add the new background image data to the images list using the criteria already established.

### CSS File
The CSS files are located in project directory `/lib/css`.  The CSS files dedicated to color schemes are named with the convention `color-${your scheme name}.css` in all lower case.  Copy an existing CSS color file and rename it to the new scheme name.  If the new scheme name is *Metallica* the new file would be named `color-metallica.md`.

Inside the new CSS file you will need to perform a find and replace operation.  If the file was cloned from `color-default` and the scheme name is `Metallica` all instances of `.default` must be replaced with `.metallica`, which is typically one change as the start of each code line.  Once the changes are complete save the file.

### Modal Defaults
Open project file `/lib/browser/content/configuration.ts`.  In that code file find the object named `colorDefaults`.  Add your scheme name and assign a value where the value is an array of two colors just like the other color schemes, for example: `metallica: [111, f00]`.  The first of those two color values will be the background color of windows in the application and the second color value will be these windows' borders.  Any values are fine, so long as they are actual color values, as they can be changed at any time.

### Code Build
Once all the technical requirements are complete the code will need to be rebuilt, which takes about 3 seconds.  In a command terminal execute the following two commands.  The first command will rebuild the application and the second command will start the application:

```
share build
share
```

## Understanding Color Codes.
The web uses an additive color format called **RGB** which stands for red, green, blue.  Both 3 digit color code and 6 digit color code values are supported.  These values are expressed as hexadecimal number triplets following a hash character.

Hexadecimal is a base-16 counting scheme as opposed to decimal that is a base-10 counting scheme.  Because decimal is base-10, which means each digit can store any of 10 values, it is expressed as 0-9.  Since hexadecimal is base-16 each digit can stores any of 16 values, so it is expressed as 0-f where a is the decimal equivalent of 10, b is the decimal equivalent of 11, and up to f which is the decimal equivalent of 15.  Consider the following value:

`#f00`

The color code means bright red.  Remember the color format is RGB, so the first digit is the maximum value for red followed by the minium values for green and then blue.  The 6 digit equivalent is `#ff0000`.  When all the red, green, and blue values are equivalent the resulting color is a grey scale color, for example `#222` is a dark grey and `#cbcbcb` is a medium bright grey.  The `#` character only serves to indicate the value is a color code if followed by 3 or 6 digits 0-f.

## Testing Changes
Apply any changes to the new CSS file and save the file.  Then rebuild the code and start the application as specified in the *Code Build* section above.  Launch the application in a browser with address https://localhost and if necessary supply a user and device name.  In the application, using the web browser, open the *Configuration* window.  The configuration window contains a section named *Color Scheme* that allows changing to any of the color schemes.