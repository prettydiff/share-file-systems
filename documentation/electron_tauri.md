<!-- documentation/electron_tauri - Documentation for launching the application as a desktop application. -->

# Share File Systems - Electron and Tauri
Electron and Tauri are application shells that allow executing web applications as desktop applications using a minimized browser for the visual rendering plus an internal Node.js instance.
All instructions below assume the current command shell is in the project root directory.

## Tauri
Tauri is a Rust language based alternative to the more popular Electron.
Tauri is designed principly for security and binary portability, which it requires a much greater setup effort to execute without an operating system installer.

1. Install Rust language from [https://www.rust-lang.org/tools/install] or if already installed execute `rustup update` and `cargo upgrade`.
1. See the [Tauri Getting Started](https://tauri.app/v1/guides/getting-started/prerequisites) page for application specific setup criteria.
1. Execute `npm tauri init` to create the configuration file and development binaries.  Supply these values to the 4 setup questions:
   1. `share-file-systems`
   1. `Share File Systems`
   1. `./`
   1. `https://localhost`
1. Execute `npm start` to launch the application.

### Tauri Notes
1. The Tauri application is a bit slow to open so **allow about 20 seconds** after executing `npm start`.
1. The Tauri configuration can be modified, including the 4 criteria mentioned above, by supplying changes to the new file at `src-tauri/tauri.conf.json`.  It might be more comfortable to change the default window size to a width of 1200 and a height of 900.

## Electron
Electron is the oldest and most popular web to desktop wrapper currently maintained.

### Electron Compatibility
At the time of this writing the application is not fully compatible with Electron due to outdated cryptography in Electron from what this application requires.
Node.js uses the OpenSSL library for cryptography while Electron uses a Google maintained fork of OpenSSL called BoringSSL.
BoringSSL makes available only a few types of hash algorithms which does not include the SHA3 family.
This application sets a default preference for the algorithm SHA3-512.
This application might work with Electron if the default hash algorithm were changed to SHA-512, which is specified as `settings.hashName` in the file `lib/terminal/utiliities/vars.ts`.

1. Execute `node module.mjs commonjs` to convert this application's preferences to the CommonJS module system as required by Electron.
1. Modify the `package.json` file:
   1. Add `"electron": "x.x.x"` to the list of devDependency.
   1. Change the value of `scripts.start` to `"electron js/lib/electron.js"`.
1. Execute `node install` to install the Electron code and rebuild the application using the CommonJS module system.
1. Execute `npm start` to launch the application.

## Browser
The application's build process is designed to execute in the terminal/browser using either CommonJS or ECMA module systems as compiled by either TypeScript's compiler or the faster SWC compiler.
The application preferences ECMA modules though for the compiled JavaScript because it most similar to the TypeScript source code, which eases development and troubleshooting.

The command to execute the application for the terminal/browser is **share**, but follow these steps to completely reset the compiled code back to default:
1. `node module.mjs standard`
1. `node install no_package`
1. `share`