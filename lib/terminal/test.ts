
import build from "./build.js";

// run the test suite using the build application
const test = function node_apps_test():void {
    build(true);
};

export default test;