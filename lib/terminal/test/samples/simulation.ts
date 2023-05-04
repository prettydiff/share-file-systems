
/* lib/terminal/test/samples/simulation - A list of command related tests for running shell simulations against the supported commands. */

import filePathEncode from "../application/browserUtilities/file_path_encode.js";
import vars from "../../utilities/vars.js";

// tests structure
// * artifact - the address of anything written to disk, so that it can be removed
// * command - the command to execute minus the `node js/services` part
// * file - a file system address to open
// * qualifier - how to test, see simulationItem in index.d.ts for appropriate values
// * test - the value to compare against

const // the tsconfig.json file hash used in multiple tests
    base64:string = "ewogICAgImNvbXBpbGVyT3B0aW9ucyI6IHsKICAgICAgICAiYWx3YXlzU3RyaWN0IjogdHJ1ZSwKICAgICAgICAibW9kdWxlIjogIkVTMjAyMCIsCiAgICAgICAgIm1vZHVsZVJlc29sdXRpb24iOiAibm9kZSIsCiAgICAgICAgIm91dERpciI6ICIuL2pzL2xpYiIsCiAgICAgICAgIm5vRW1pdCI6IHRydWUsCiAgICAgICAgIm5vSW1wbGljaXRBbnkiOiB0cnVlLAogICAgICAgICJwcmV0dHkiOiB0cnVlLAogICAgICAgICJzdHJpY3RGdW5jdGlvblR5cGVzIjogdHJ1ZSwKICAgICAgICAidGFyZ2V0IjogIkVTMjAyMCIsCiAgICAgICAgInR5cGVzIjogWyJub2RlIl0sCiAgICAgICAgInR5cGVSb290cyI6IFsiLi9ub2RlX21vZHVsZXMvQHR5cGVzIl0KICAgIH0sCiAgICAiZXhjbHVkZSI6IFsKICAgICAgICAianMiLAogICAgICAgICJsaWIvdGVybWluYWwvdGVzdC9zdG9yYWdlVGVzdC90ZW1wIiwKICAgICAgICAiKiovbm9kZV9tb2R1bGVzIiwKICAgICAgICAiKiovLiovIgogICAgXSwKICAgICJpbmNsdWRlIjogWwogICAgICAgICIqKi8qLnRzIgogICAgXQp9",
    hash:string = "7afd87e5c2ba29c3b437413d16e239fd4757881ffae55e347bbe2b4f1ab41bc97f1434523e06bc51101029a029f2eb13388117481321137af7bee17b452014e9",
    testLocation:string = `${vars.path.project}lib${vars.path.sep}terminal${vars.path.sep}test${vars.path.sep}storageTest${vars.path.sep}temp`,
    md5:string = "3f2b87fa3e2bd73c1a7ba4e33a22f743",
    simulation:test_item[] = [
        {
            command: "anUnsupportedCommand",
            qualifier: "contains",
            test: " is not a supported command"
        },
        {
            command: "b",
            qualifier: "is",
            test: `Command '${vars.text.angry}b${vars.text.none}' is ambiguous as it could refer to any of: [${vars.text.cyan}base64, build${vars.text.none}]`
        },
        {
            command: "base64",
            qualifier: "contains",
            test: "No path to encode."
        },
        {
            command: `base64 ${filePathEncode("absolute", "tsconfig.json")}`,
            qualifier: "is",
            test: base64
        },
        {
            //cspell:disable-next-line
            command: "base64 decode string:\"bXkgYmlnIHN0cmluZyBzYW1wbGU=\"",
            qualifier: "is",
            test: "my big string sample"
        },
        {
            command: "base64 decode string:\"ewogICAgImNvbXBpbGVyT3B0aW9ucyI6IHsKICAgICAgICAidGFyZ2V0IjogIkVTNiIsCiAgICAgICAgIm91dERpciI6ICJqcyIKICAgIH0sCiAgICAiaW5jbHVkZSI6IFsKICAgICAgICAiKi50cyIsCiAgICAgICAgIioqLyoudHMiCiAgICBdLAogICAgImV4Y2x1ZGUiOiBbCiAgICAgICAgImpzIiwKICAgICAgICAibm9kZV9tb2R1bGVzIiwKICAgICAgICAidGVzdCIKICAgIF0KfQ==\"",
            qualifier: "ends",
            test: "{\n    \"compilerOptions\": {\n        \"target\": \"ES6\",\n        \"outDir\": \"js\"\n    },\n    \"include\": [\n        \"*.ts\",\n        \"*\u002a/\u002a.ts\"\n    ],\n    \"exclude\": [\n        \"js\",\n        \"node_modules\",\n        \"test\"\n    ]\n}"
        },
        {
            command: "base64 https://duckduckgo.com/assets/logo_homepage.normal.v107.svg",
            qualifier: "is",
            test: "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMjUwcHgiIGhlaWdodD0iMjAwcHgiIHZpZXdCb3g9IjAgMCAyNTAgMjAwIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyNTAgMjAwIiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxjaXJjbGUgZmlsbD0iI0RFNTgzMyIgY3g9IjEyNy4zMzIiIGN5PSI3OC45NjYiIHI9IjUxLjE1Ii8+DQoJPGc+DQoJCTxnPg0KCQkJPHBhdGggZmlsbD0iIzRDNEM0QyIgZD0iTTIyLjU2NCwxODAuNTc0di0yNC41OThoOC45MTRjOC40ODcsMCwxMi4zNTIsNi4yMzQsMTIuMzUyLDEyLjAzMWMwLDYuMjU2LTMuODE5LDEyLjU2Mi0xMi4zNTIsMTIuNTYyDQoJCQkJTDIyLjU2NCwxODAuNTc0TDIyLjU2NCwxODAuNTc0eiBNMjUuMzk4LDE3Ny43NGg2LjA4YzYuNTc1LDAsOS41MTgtNC45MDQsOS41MTgtOS43NjZjMC00LjQ2Ny0yLjk3OS05LjI3MS05LjUxOC05LjI3MWgtNi4wOA0KCQkJCVYxNzcuNzRMMjUuMzk4LDE3Ny43NHoiLz4NCgkJPC9nPg0KCQk8Zz4NCgkJCTxwYXRoIGZpbGw9IiM0QzRDNEMiIGQ9Ik01NS4wNTUsMTgwLjg1N2MtNC41NTQsMC03LjQ5Ny0zLjEzNy03LjQ5Ny03Ljk5MnYtOS41NTFoMi42NTd2OS41MTZjMCwzLjQ5NiwyLjAzNCw1LjU4NCw1LjQ0Miw1LjU4NA0KCQkJCWMzLjE5NS0wLjAzNSw1LjUxMy0yLjQ4OCw1LjUxMy01LjgzMnYtOS4yNjhoMi42NTd2MTcuMjZoLTIuNDE0bC0wLjE1Mi0zLjAwMmwtMC40MTIsMC41MTgNCgkJCQlDNTkuNDE3LDE3OS44OTEsNTcuNDY4LDE4MC44MjIsNTUuMDU1LDE4MC44NTd6Ii8+DQoJCTwvZz4NCgkJPGc+DQoJCQk8cGF0aCBmaWxsPSIjNEM0QzRDIiBkPSJNNzYuNzg2LDE4MC44OTNjLTQuNDksMC05LjAyLTIuNzcxLTkuMDItOC45NDljMC01LjM1NCwzLjYyNS04Ljk0Nyw5LjAyLTguOTQ3DQoJCQkJYzIuMzYxLDAsNC40MzYsMC44NDIsNi4xNjgsMi41MDJsLTEuNjcsMS43MzJjLTEuMTc1LTEuMDk2LTIuNzgxLTEuNzIxLTQuNDI3LTEuNzIxYy0zLjc2OCwwLTYuMzk5LDIuNjQ2LTYuMzk5LDYuNDM0DQoJCQkJYzAsNC40NDUsMy4xOTYsNi40MzgsNi4zNjQsNi40MzhjMS43ODIsMCwzLjQtMC42MzYsNC41NzMtMS43OTFsMS43MzYsMS43MzZDODEuMzg0LDE4MC4wMjksNzkuMjUsMTgwLjg5Myw3Ni43ODYsMTgwLjg5M3oiLz4NCgkJPC9nPg0KCQk8Zz4NCgkJCTxwb2x5Z29uIGZpbGw9IiM0QzRDNEMiIHBvaW50cz0iOTcuNjgzLDE4MC41NzQgODkuMjQ4LDE3Mi4xMzkgODkuMjQ4LDE4MC41NzQgODYuNjI2LDE4MC41NzQgODYuNjI2LDE1Ni4wMTIgODkuMjQ4LDE1Ni4wMTIgDQoJCQkJODkuMjQ4LDE3MC44NjkgOTYuNjIxLDE2My4zMTQgMTAwLjA1OCwxNjMuMzE0IDkxLjkyNCwxNzEuNDQ4IDEwMS4wNTEsMTgwLjUzOSAxMDEuMDUxLDE4MC41NzQgCQkJIi8+DQoJCTwvZz4NCgkJPGc+DQoJCQk8cGF0aCBmaWxsPSIjNEM0QzRDIiBkPSJNMTA0LjMxNywxODAuNTc0di0yNC41OThoOC45MTNjOC40ODcsMCwxMi4zNTQsNi4yMzQsMTIuMzU0LDEyLjAzMWMwLDYuMjU2LTMuODE1LDEyLjU2Mi0xMi4zNTQsMTIuNTYyDQoJCQkJTDEwNC4zMTcsMTgwLjU3NEwxMDQuMzE3LDE4MC41NzR6IE0xMDcuMTUsMTc3Ljc0aDYuMDhjNi41NzUsMCw5LjUxOS00LjkwNCw5LjUxOS05Ljc2NmMwLTQuNDY3LTIuOTc5LTkuMjcxLTkuNTE5LTkuMjcxaC02LjA4DQoJCQkJVjE3Ny43NHoiLz4NCgkJPC9nPg0KCQk8Zz4NCgkJCTxwYXRoIGZpbGw9IiM0QzRDNEMiIGQ9Ik0xMzYuODA3LDE4MC44NTdjLTQuNTU2LDAtNy40OTYtMy4xMzctNy40OTYtNy45OTJ2LTkuNTUxaDIuNjU2djkuNTE2YzAsMy40OTYsMi4wMzQsNS41ODQsNS40NDEsNS41ODQNCgkJCQljMy4xODktMC4wMzUsNS41MTQtMi40ODgsNS41MTQtNS44MzJ2LTkuMjY4aDIuNjU2djE3LjI2aC0yLjQxNmwtMC4xNS0zLjAwMmwtMC40MTIsMC41MTgNCgkJCQlDMTQxLjE2OCwxNzkuODkxLDEzOS4yMTksMTgwLjgyMiwxMzYuODA3LDE4MC44NTd6Ii8+DQoJCTwvZz4NCgkJPGc+DQoJCQk8cGF0aCBmaWxsPSIjNEM0QzRDIiBkPSJNMTU4LjUzOSwxODAuODkzYy00LjQ5LDAtOS4wMjEtMi43NzEtOS4wMjEtOC45NDljMC01LjM1NCwzLjYyNS04Ljk0Nyw5LjAyMS04Ljk0Nw0KCQkJCWMyLjM1OSwwLDQuNDM4LDAuODQyLDYuMTY4LDIuNTAybC0xLjY3LDEuNzMyYy0xLjE3Ni0xLjA5Ni0yLjc4MS0xLjcyMS00LjQyOC0xLjcyMWMtMy43NywwLTYuMzk4LDIuNjQ2LTYuMzk4LDYuNDM0DQoJCQkJYzAsNC40NDUsMy4xOTcsNi40MzgsNi4zNjMsNi40MzhjMS43ODEsMCwzLjQtMC42MzYsNC41NzItMS43OTFsMS42ODYsMS42ODhsLTAuMDg4LDAuMDkxbDAuMDQ5LDAuMDQ5DQoJCQkJQzE2My4wNjIsMTgwLjA1OSwxNjAuOTYxLDE4MC44OTMsMTU4LjUzOSwxODAuODkzeiIvPg0KCQk8L2c+DQoJCTxnPg0KCQkJPHBvbHlnb24gZmlsbD0iIzRDNEM0QyIgcG9pbnRzPSIxNzkuNDM2LDE4MC41NzQgMTcxLDE3Mi4xMzkgMTcxLDE4MC41NzQgMTY4LjM3OSwxODAuNTc0IDE2OC4zNzksMTU2LjAxMiAxNzEsMTU2LjAxMiANCgkJCQkxNzEsMTcwLjg2OSAxNzguMzczLDE2My4zMTQgMTgxLjgxMSwxNjMuMzE0IDE3My42NzgsMTcxLjQ0OCAxODIuODAzLDE4MC41MzkgMTgyLjgwMywxODAuNTc0IAkJCSIvPg0KCQk8L2c+DQoJCTxnPg0KCQkJPHBhdGggZmlsbD0iIzRDNEM0QyIgZD0iTTE5Ni43MTksMTgxLjAzNWMtOS40NTcsMC0xMi44MTItNi43NS0xMi44MTItMTIuNTI5Yy0wLjAyMS0zLjc2NSwxLjI1Ni03LjEyNSwzLjU4NC05LjQ2Nw0KCQkJCWMyLjI5My0yLjMwNSw1LjQ3My0zLjUyMyw5LjE5Mi0zLjUyM2MzLjM2NiwwLDYuNTM3LDEuMjc5LDguOTM4LDMuNjA0bC0xLjYwNCwxLjg2OWMtMS44OS0xLjc2My00LjY4NS0yLjg1My03LjMzLTIuODUzDQoJCQkJYy02Ljg1NCwwLTkuOTc5LDUuMzc1LTkuOTc5LDEwLjM2N2MwLDQuOTA4LDMuMTA0LDkuODczLDEwLjA1MSw5Ljg3M2MyLjUyNywwLDQuODg2LTAuODY1LDYuODEyLTIuNTE4bDAuMDkxLTAuMDcydi02LjA2Mg0KCQkJCWgtNy43Mjl2LTIuNDc5aDEwLjI3NnY5LjY0NkMyMDMuNTU1LDE3OS42OTEsMjAwLjQ2MywxODEuMDM1LDE5Ni43MTksMTgxLjAzNXoiLz4NCgkJPC9nPg0KCQk8Zz4NCgkJCTxwYXRoIGZpbGw9IiM0QzRDNEMiIGQ9Ik0yMTguNDUzLDE4MC44OTNjLTUuMTg4LDAtOC45NDktMy43NDgtOC45NDktOC45MTRjMC01LjI0NiwzLjc3LTkuMDU1LDguOTQ5LTkuMDU1DQoJCQkJYzUuMjg5LDAsOC45ODIsMy43MjMsOC45ODIsOS4wNTVDMjI3LjQzNiwxNzcuMTQ1LDIyMy42NTgsMTgwLjg5MywyMTguNDUzLDE4MC44OTN6IE0yMTguNDg2LDE2NS4zMzINCgkJCQljLTMuNzI3LDAtNi4zMjYsMi43MzQtNi4zMjYsNi42NDZjMCwzLjcyOSwyLjY0Niw2LjQzNiw2LjI5Myw2LjQzNmMzLjcwOSwwLDYuMzI2LTIuNjQ2LDYuMzYxLTYuNDM0DQoJCQkJQzIyNC44MTQsMTY4LjEyNywyMjIuMTU0LDE2NS4zMzIsMjE4LjQ4NiwxNjUuMzMyeiIvPg0KCQk8L2c+DQoJPC9nPg0KCTxnPg0KCQk8Zz4NCgkJCTxnPg0KCQkJCTxnPg0KCQkJCQk8Zz4NCgkJCQkJCTxnPg0KCQkJCQkJCTxnPg0KCQkJCQkJCQk8Zz4NCgkJCQkJCQkJCTxnPg0KCQkJCQkJCQkJCTxnPg0KCQkJCQkJCQkJCQk8Zz4NCgkJCQkJCQkJCQkJCTxnPg0KCQkJCQkJCQkJCQkJCTxkZWZzPg0KCQkJCQkJCQkJCQkJCQk8cGF0aCBpZD0iU1ZHSURfMV8iIGQ9Ik0xNzguNjg0LDc4LjgyNGMwLDI4LjMxNi0yMy4wMzUsNTEuMzU0LTUxLjM1NCw1MS4zNTRjLTI4LjMxMywwLTUxLjM0OC0yMy4wMzktNTEuMzQ4LTUxLjM1NA0KCQkJCQkJCQkJCQkJCQkJYzAtMjguMzEzLDIzLjAzNi01MS4zNDksNTEuMzQ4LTUxLjM0OUMxNTUuNjQ4LDI3LjQ3NSwxNzguNjg0LDUwLjUxMSwxNzguNjg0LDc4LjgyNHoiLz4NCgkJCQkJCQkJCQkJCQk8L2RlZnM+DQoJCQkJCQkJCQkJCQkJPGNsaXBQYXRoIGlkPSJTVkdJRF8yXyI+DQoJCQkJCQkJCQkJCQkJCTx1c2UgeGxpbms6aHJlZj0iI1NWR0lEXzFfIiAgb3ZlcmZsb3c9InZpc2libGUiLz4NCgkJCQkJCQkJCQkJCQk8L2NsaXBQYXRoPg0KCQkJCQkJCQkJCQkJCTxnIGNsaXAtcGF0aD0idXJsKCNTVkdJRF8yXykiPg0KCQkJCQkJCQkJCQkJCQk8cGF0aCBmaWxsPSIjRDVEN0Q4IiBkPSJNMTQ4LjI5MywxNTUuMTU4Yy0xLjgwMS04LjI4NS0xMi4yNjItMjcuMDM5LTE2LjIzLTM0Ljk2OQ0KCQkJCQkJCQkJCQkJCQkJYy0zLjk2NS03LjkzMi03LjkzOC0xOS4xMS02LjEyOS0yNi4zMjJjMC4zMjgtMS4zMTItMy40MzYtMTEuMzA4LTIuMzU0LTEyLjAxNQ0KCQkJCQkJCQkJCQkJCQkJYzguNDE2LTUuNDg5LDEwLjYzMiwwLjU5OSwxNC4wMDItMS44NjJjMS43MzQtMS4yNzMsNC4wOSwxLjA0Nyw0LjY4OS0xLjA2YzIuMTU4LTcuNTY3LTMuMDA2LTIwLjc2LTguNzcxLTI2LjUyNg0KCQkJCQkJCQkJCQkJCQkJYy0xLjg4NS0xLjg3OS00Ljc3MS0zLjA2LTguMDMtMy42ODdjLTEuMjU0LTEuNzEzLTMuMjc1LTMuMzYtNi4xMzgtNC44NzljLTMuMTg4LTEuNjk3LTEwLjEyMS0zLjkzOC0xMy43MTctNC41MzUNCgkJCQkJCQkJCQkJCQkJCWMtMi40OTItMC40MS0zLjA1NSwwLjI4Ny00LjExOSwwLjQ2MWMwLjk5MiwwLjA4OCw1LjY5OSwyLjQxNCw2LjYxNSwyLjU0OWMtMC45MTYsMC42MTktMy42MDctMC4wMjgtNS4zMjQsMC43NDINCgkJCQkJCQkJCQkJCQkJCWMtMC44NjUsMC4zOTItMS41MTIsMS44NzctMS41MDYsMi41OGM0LjkxLTAuNDk2LDEyLjU3NC0wLjAxNiwxNy4xLDJjLTMuNjAyLDAuNDEtOS4wOCwwLjg2Ny0xMS40MzYsMi4xMDUNCgkJCQkJCQkJCQkJCQkJCWMtNi44NDgsMy42MDgtOS44NzMsMTIuMDM1LTguMDcsMjIuMTMzYzEuODA0LDEwLjA3NSw5LjczOCw0Ni44NSwxMi4yNjIsNTkuMTI5DQoJCQkJCQkJCQkJCQkJCQljMi41MjUsMTIuMjY0LTUuNDA4LDIwLjE4OS0xMC40NTUsMjIuMzU0bDUuNDA4LDAuMzYzbC0xLjgwMSwzLjk2N2M2LjQ4NCwwLjcxOSwxMy42OTUtMS40MzksMTMuNjk1LTEuNDM5DQoJCQkJCQkJCQkJCQkJCQljLTEuNDM4LDMuOTY1LTExLjE3Niw1LjQxMi0xMS4xNzYsNS40MTJzNC42OTEsMS40MzgsMTIuMjU4LTEuNDQ3YzcuNTc4LTIuODgzLDEyLjI2My00LjY4OCwxMi4yNjMtNC42ODgNCgkJCQkJCQkJCQkJCQkJCWwzLjYwNCw5LjM3M2w2Ljg1NC02Ljg0N2wyLjg4NSw3LjIxMUMxNDQuNjg2LDE2NS4yNiwxNTAuMDk2LDE2My40NTMsMTQ4LjI5MywxNTUuMTU4eiIvPg0KCQkJCQkJCQkJCQkJCQk8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMTUwLjQ3MSwxNTMuNDc3Yy0xLjc5NS04LjI4OS0xMi4yNTYtMjcuMDQzLTE2LjIyOC0zNC45NzkNCgkJCQkJCQkJCQkJCQkJCWMtMy45Ny03LjkzNi03LjkzNS0xOS4xMTItNi4xMy0yNi4zMjFjMC4zMzUtMS4zMDksMC4zNDEtNi42NjgsMS40MjktNy4zNzljOC40MTEtNS40OTQsNy44MTItMC4xODQsMTEuMTg3LTIuNjQ1DQoJCQkJCQkJCQkJCQkJCQljMS43NC0xLjI3MSwzLjEzMy0yLjgwNiwzLjczOC00LjkxMmMyLjE2NC03LjU3Mi0zLjAwNi0yMC43Ni04Ljc3My0yNi41MjljLTEuODc5LTEuODc5LTQuNzY4LTMuMDYyLTguMDIzLTMuNjg2DQoJCQkJCQkJCQkJCQkJCQljLTEuMjUyLTEuNzE4LTMuMjcxLTMuMzYxLTYuMTMtNC44ODJjLTUuMzkxLTIuODYyLTEyLjA3NC00LjAwNi0xOC4yNjYtMi44ODNjMC45OSwwLjA5LDMuMjU2LDIuMTM4LDQuMTY4LDIuMjczDQoJCQkJCQkJCQkJCQkJCQljLTEuMzgxLDAuOTM2LTUuMDUzLDAuODE1LTUuMDI5LDIuODk2YzQuOTE2LTAuNDkyLDEwLjMwMywwLjI4NSwxNC44MzQsMi4yOTdjLTMuNjAyLDAuNDEtNi45NTUsMS4zLTkuMzExLDIuNTQzDQoJCQkJCQkJCQkJCQkJCQljLTYuODU0LDMuNjAzLTguNjU2LDEwLjgxMi02Ljg1NCwyMC45MTRjMS44MDcsMTAuMDk3LDkuNzQyLDQ2Ljg3MywxMi4yNTYsNTkuMTI2DQoJCQkJCQkJCQkJCQkJCQljMi41MjcsMTIuMjYtNS40MDIsMjAuMTg4LTEwLjQ0OSwyMi4zNTRsNS40MDgsMC4zNTlsLTEuODAxLDMuOTczYzYuNDg0LDAuNzIxLDEzLjY5NS0xLjQzOSwxMy42OTUtMS40MzkNCgkJCQkJCQkJCQkJCQkJCWMtMS40MzgsMy45NzQtMTEuMTc2LDUuNDA2LTExLjE3Niw1LjQwNnM0LjY4NiwxLjQzOSwxMi4yNTgtMS40NDVjNy41ODEtMi44ODMsMTIuMjY5LTQuNjg4LDEyLjI2OS00LjY4OA0KCQkJCQkJCQkJCQkJCQkJbDMuNjA0LDkuMzczTDE0NCwxNTYuMzVsMi44OTEsNy4yMTVDMTQ2Ljg3NSwxNjMuNTcyLDE1Mi4yNzksMTYxLjc2OCwxNTAuNDcxLDE1My40Nzd6Ii8+DQoJCQkJCQkJCQkJCQkJCTxwYXRoIGZpbGw9IiMyRDRGOEUiIGQ9Ik0xMDkuMDIxLDcwLjY5MWMwLTIuMDkzLDEuNjkzLTMuNzg3LDMuNzg5LTMuNzg3YzIuMDksMCwzLjc4NSwxLjY5NCwzLjc4NSwzLjc4Nw0KCQkJCQkJCQkJCQkJCQkJYzAsMi4wOTQtMS42OTUsMy43ODYtMy43ODUsMy43ODZDMTEwLjcxNCw3NC40NzgsMTA5LjAyMSw3Mi43ODUsMTA5LjAyMSw3MC42OTF6Ii8+DQoJCQkJCQkJCQkJCQkJCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0xMTMuNTA3LDY5LjQyOWMwLTAuNTQ1LDAuNDQxLTAuOTgzLDAuOTgtMC45ODNjMC41NDMsMCwwLjk4NCwwLjQzOCwwLjk4NCwwLjk4Mw0KCQkJCQkJCQkJCQkJCQkJYzAsMC41NDMtMC40NDEsMC45ODQtMC45ODQsMC45ODRDMTEzLjk0OSw3MC40MTQsMTEzLjUwNyw2OS45NzIsMTEzLjUwNyw2OS40Mjl6Ii8+DQoJCQkJCQkJCQkJCQkJCTxwYXRoIGZpbGw9IiMyRDRGOEUiIGQ9Ik0xMzQuODY3LDY4LjQ0NWMwLTEuNzkzLDEuNDYxLTMuMjUsMy4yNTItMy4yNWMxLjgwMSwwLDMuMjU2LDEuNDU3LDMuMjU2LDMuMjUNCgkJCQkJCQkJCQkJCQkJCWMwLDEuODAxLTEuNDU1LDMuMjU4LTMuMjU2LDMuMjU4QzEzNi4zMjgsNzEuNzAzLDEzNC44NjcsNzAuMjQ2LDEzNC44NjcsNjguNDQ1eiIvPg0KCQkJCQkJCQkJCQkJCQk8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMTM4LjcyNSw2Ny4zNjNjMC0wLjQ2MywwLjM3OS0wLjg0MywwLjgzOC0wLjg0M2MwLjQ3OSwwLDAuODQ2LDAuMzgsMC44NDYsMC44NDMNCgkJCQkJCQkJCQkJCQkJCWMwLDAuNDY5LTAuMzY3LDAuODQyLTAuODQ2LDAuODQyQzEzOS4xMDQsNjguMjA1LDEzOC43MjUsNjcuODMyLDEzOC43MjUsNjcuMzYzeiIvPg0KCQkJCQkJCQkJCQkJCQkNCgkJCQkJCQkJCQkJCQkJCTxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfM18iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iMTg5My4zMTg0IiB5MT0iLTIzODEuOTc5NSIgeDI9IjE5MDEuODg2NyIgeTI9Ii0yMzgxLjk3OTUiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgLTE3ODggLTIzMjEpIj4NCgkJCQkJCQkJCQkJCQkJCTxzdG9wICBvZmZzZXQ9IjAuMDA1NiIgc3R5bGU9InN0b3AtY29sb3I6IzYxNzZCOSIvPg0KCQkJCQkJCQkJCQkJCQkJPHN0b3AgIG9mZnNldD0iMC42OTEiIHN0eWxlPSJzdG9wLWNvbG9yOiMzOTRBOUYiLz4NCgkJCQkJCQkJCQkJCQkJPC9saW5lYXJHcmFkaWVudD4NCgkJCQkJCQkJCQkJCQkJPHBhdGggZmlsbD0idXJsKCNTVkdJRF8zXykiIGQ9Ik0xMTMuODg2LDU5LjcxOGMwLDAtMi44NTQtMS4yOTEtNS42MjksMC40NTNjLTIuNzcsMS43NDItMi42NjgsMy41MjMtMi42NjgsMy41MjMNCgkJCQkJCQkJCQkJCQkJCXMtMS40NzMtMy4yODMsMi40NTMtNC44OTJDMTExLjk3Miw1Ny4xOTMsMTEzLjg4Niw1OS43MTgsMTEzLjg4Niw1OS43MTh6Ii8+DQoJCQkJCQkJCQkJCQkJCQ0KCQkJCQkJCQkJCQkJCQkJPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF80XyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIxOTIwLjI3MzQiIHkxPSItMjM3OS4zNzExIiB4Mj0iMTkyOC4wNzgxIiB5Mj0iLTIzNzkuMzcxMSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAtMTc4OCAtMjMyMSkiPg0KCQkJCQkJCQkJCQkJCQkJPHN0b3AgIG9mZnNldD0iMC4wMDU2IiBzdHlsZT0ic3RvcC1jb2xvcjojNjE3NkI5Ii8+DQoJCQkJCQkJCQkJCQkJCQk8c3RvcCAgb2Zmc2V0PSIwLjY5MSIgc3R5bGU9InN0b3AtY29sb3I6IzM5NEE5RiIvPg0KCQkJCQkJCQkJCQkJCQk8L2xpbmVhckdyYWRpZW50Pg0KCQkJCQkJCQkJCQkJCQk8cGF0aCBmaWxsPSJ1cmwoI1NWR0lEXzRfKSIgZD0iTTE0MC4wNzgsNTkuNDU4YzAsMC0yLjA1MS0xLjE3Mi0zLjY0My0xLjE1MmMtMy4yNzEsMC4wNDMtNC4xNjIsMS40ODgtNC4xNjIsMS40ODgNCgkJCQkJCQkJCQkJCQkJCXMwLjU0OS0zLjQ0NSw0LjczMi0yLjc1NEMxMzkuMjczLDU3LjQxNywxNDAuMDc4LDU5LjQ1OCwxNDAuMDc4LDU5LjQ1OHoiLz4NCgkJCQkJCQkJCQkJCQk8L2c+DQoJCQkJCQkJCQkJCQk8L2c+DQoJCQkJCQkJCQkJCTwvZz4NCgkJCQkJCQkJCQk8L2c+DQoJCQkJCQkJCQk8L2c+DQoJCQkJCQkJCTwvZz4NCgkJCQkJCQk8L2c+DQoJCQkJCQk8L2c+DQoJCQkJCTwvZz4NCgkJCQk8L2c+DQoJCQk8L2c+DQoJCQk8cGF0aCBmaWxsPSIjRkREMjBBIiBkPSJNMTI0LjQsODUuMjk1YzAuMzc5LTIuMjkxLDYuMjk5LTYuNjI1LDEwLjQ5MS02Ljg4N2M0LjIwMS0wLjI2NSw1LjUxLTAuMjA1LDkuMDEtMS4wNDMNCgkJCQljMy41MS0wLjgzOCwxMi41MzUtMy4wODgsMTUuMDMzLTQuMjQyYzIuNTA0LTEuMTU2LDEzLjEwNCwwLjU3Miw1LjYzMSw0LjczOGMtMy4yMzIsMS44MDktMTEuOTQzLDUuMTMxLTE4LjE3Miw2Ljk4Nw0KCQkJCWMtNi4yMTksMS44NjEtOS45OS0xLjc3Ni0xMi4wNiwxLjI4MWMtMS42NDYsMi40MzItMC4zMzQsNS43NjIsNy4wOTksNi40NTNjMTAuMDM3LDAuOTMsMTkuNjYtNC41MjEsMjAuNzE5LTEuNjI1DQoJCQkJYzEuMDY0LDIuODk1LTguNjI1LDYuNTA4LTE0LjUyNSw2LjYyM2MtNS44OTMsMC4xMTEtMTcuNzcxLTMuODk2LTE5LjU1NS01LjEzN0MxMjYuMjg1LDkxLjIwNSwxMjMuOTA2LDg4LjMxMywxMjQuNCw4NS4yOTV6Ii8+DQoJCTwvZz4NCgkJPGc+DQoJCQk8cGF0aCBmaWxsPSIjNjVCQzQ2IiBkPSJNMTI4Ljk0MywxMTUuNTkyYzAsMC0xNC4xMDItNy41MjEtMTQuMzMyLTQuNDdjLTAuMjM4LDMuMDU2LDAsMTUuNTA5LDEuNjQzLDE2LjQ1MQ0KCQkJCWMxLjY0NiwwLjkzOCwxMy4zOTYtNi4xMDgsMTMuMzk2LTYuMTA4TDEyOC45NDMsMTE1LjU5MnoiLz4NCgkJCTxwYXRoIGZpbGw9IiM2NUJDNDYiIGQ9Ik0xMzQuMzQ2LDExNS4xMThjMCwwLDkuNjM1LTcuMjg1LDExLjc1NC02LjgxNWMyLjExMSwwLjQ3OSwyLjU4MiwxNS41MSwwLjcwMSwxNi4yMjkNCgkJCQljLTEuODgxLDAuNjktMTIuOTA4LTMuODEzLTEyLjkwOC0zLjgxM0wxMzQuMzQ2LDExNS4xMTh6Ii8+DQoJCQk8cGF0aCBmaWxsPSIjNDNBMjQ0IiBkPSJNMTI1LjUyOSwxMTYuMzg5YzAsNC45MzItMC43MDksNy4wNDksMS40MSw3LjUxOWMyLjEwOSwwLjQ3Myw2LjEwNCwwLDcuNTE4LTAuOTM4DQoJCQkJYzEuNDEtMC45MzgsMC4yMzItNy4yNzktMC4yMzItOC40NjVDMTMzLjc0OCwxMTMuMzMxLDEyNS41MjksMTE0LjI3MywxMjUuNTI5LDExNi4zODl6Ii8+DQoJCQk8cGF0aCBmaWxsPSIjNjVCQzQ2IiBkPSJNMTI2LjQyNiwxMTUuMjkyYzAsNC45MzMtMC43MDcsNy4wNSwxLjQwOSw3LjUxOWMyLjEwNiwwLjQ3OSw2LjEwNCwwLDcuNTE5LTAuOTM4DQoJCQkJYzEuNDEtMC45NDEsMC4yMzEtNy4yNzktMC4yMzYtOC40NjZDMTM0LjY0NSwxMTIuMjM0LDEyNi40MjYsMTEzLjE4LDEyNi40MjYsMTE1LjI5MnoiLz4NCgkJPC9nPg0KCTwvZz4NCgk8Y2lyY2xlIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0RFNTgzMyIgc3Ryb2tlLXdpZHRoPSI1IiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGN4PSIxMjcuMzMxIiBjeT0iNzguOTY1IiByPSI1Ny41Ii8+DQo8L2c+DQo8L3N2Zz4NCg=="
        },
        {
            command: "base64 string:\"my big string sample\"",
            qualifier: "is",
            //cspell:disable-next-line
            test: "bXkgYmlnIHN0cmluZyBzYW1wbGU="
        },
        {
            artifact: filePathEncode("absolute", testLocation),
            command: `certificate location:"${testLocation}"`,
            qualifier: "filesystem contains",
            test: filePathEncode("absolute", `${testLocation + vars.path.sep}share-file-ca.crt`)
        },
        {
            artifact: filePathEncode("absolute", testLocation),
            command: `certificate location:"${testLocation}"`,
            qualifier: "filesystem contains",
            test: filePathEncode("absolute", `${testLocation + vars.path.sep}share-file-ca.key`)
        },
        {
            artifact: filePathEncode("absolute", testLocation),
            command: `certificate location:"${testLocation}" server-fileName:"asdf"`,
            qualifier: "filesystem contains",
            test: filePathEncode("absolute", `${testLocation + vars.path.sep}asdf.crt`)
        },
        {
            artifact: filePathEncode("absolute", testLocation),
            command: `certificate location:"${testLocation}" server-fileName:"asdf"`,
            qualifier: "filesystem contains",
            test: filePathEncode("absolute", `${testLocation + vars.path.sep}share-file-ca.key`)
        },
        {
            artifact: filePathEncode("absolute", testLocation),
            command: `certificate location:"${testLocation}" intermediate-fileName:"asdf"`,
            qualifier: "filesystem not contains",
            test: filePathEncode("absolute", `${testLocation + vars.path.sep}share-file-ca.key`)
        },
        {
            command: "comm version",
            qualifier: "contains",
            test: "Prints the current version number and date to the shell."
        },
        {
            command: "commands",
            qualifier: "contains",
            test: `Commands are tested using the ${vars.text.green}test_simulation${vars.text.none} command.`
        },
        {
            command: "commands base64",
            qualifier: "contains",
            test: "base64 encode string:\"my string to encode\""
        },
        {
            command: "commands version",
            qualifier: "contains",
            test: "Prints the current version number and date to the shell."
        },
        {
            command: "copy",
            qualifier: "contains",
            test: "The copy command requires a source path and a destination path."
        },
        {
            command: "copy js",
            qualifier: "contains",
            test: "The copy command requires a source path and a destination path."
        },
        {
            command: `copy ${filePathEncode("absolute", "js")} ${filePathEncode("absolute", testLocation)}`,
            qualifier: "filesystem contains",
            test: filePathEncode("absolute", `${testLocation + vars.path.sep}js${vars.path.sep}lib${vars.path.sep}terminal${vars.path.sep}test${vars.path.sep}samples${vars.path.sep}simulation.js`)
        },
        {
            command: `copy ${filePathEncode("absolute", "js")} ${filePathEncode("absolute", testLocation)}`,
            qualifier: "filesystem contains",
            test: filePathEncode("absolute", `${testLocation + vars.path.sep}js_0${vars.path.sep}lib${vars.path.sep}terminal${vars.path.sep}test${vars.path.sep}samples${vars.path.sep}simulation.js`)
        },
        {
            artifact: filePathEncode("absolute", testLocation),
            command: `copy ${filePathEncode("absolute", "js")} ${filePathEncode("absolute", testLocation)}`,
            file: filePathEncode("absolute", `${testLocation + vars.path.sep}js_1${vars.path.sep}lib${vars.path.sep}terminal${vars.path.sep}test${vars.path.sep}samples${vars.path.sep}simulation.js`),
            qualifier: "file contains",
            test: "import vars from \"../../utilities/vars.js\";"
        },
        {
            command: `directory "${filePathEncode("relative", "./lib/typescript")}" ignore ["node_modules", ".git", ".DS_Store", "src-tauri"] --verbose`,
            qualifier: "contains",
            test: " matching items from address"
        },
        {
            command: `directory ${filePathEncode("absolute", "js")}`,
            qualifier: "contains",
            test: `${filePathEncode("relative", "js/lib/terminal/test/samples/simulation.js", true)}","file"`
        },
        {
            command: `directory ${filePathEncode("absolute", "js")} 2`,
            qualifier: "contains",
            test: ",\"ctimeMs\":"
        },
        {
            command: `directory ${filePathEncode("absolute", "js")} ignore ["test", "src-tauri"]`,
            qualifier: "not contains",
            test: `${filePathEncode("relative", "js/test/samples/simulation.js")}"`
        },
        {
            command: `directory ${filePathEncode("absolute", "js")} array`,
            qualifier: "not contains",
            test: ",\"ctime\":"
        },
        {
            command: `directory ${filePathEncode("absolute", "")} array depth:1`,
            qualifier: "not contains",
            test: filePathEncode("relative", "bin/spaces")
        },
        {
            command: `directory ${filePathEncode("absolute", "")} list depth:1`,
            qualifier: "contains",
            test: `file        34,085  ${filePathEncode("absolute", "license")}`
        },
        {
            command: `directory ${filePathEncode("absolute", "")} list relative depth:1`,
            qualifier: "contains",
            test: "file        34,085  license"
        },
        {
            command: `directory ${filePathEncode("absolute", "js")} typeof`,
            qualifier: "is",
            test: "directory"
        },
        {
            command: `directory ${filePathEncode("absolute", "tsconfig.json")} hash`,
            qualifier: "contains",
            test: hash
        },
        {
            command: `directory typeof ${filePathEncode("absolute", "js")}`,
            qualifier: "is",
            test: "directory"
        },
        {
            command: `directory typeof ${filePathEncode("absolute", "js/lib/terminal/test/samples/simulation.js")}`,
            qualifier: "is",
            test: "file"
        },
        {
            command: "get",
            qualifier: "contains",
            test: "The get command requires an address and that address must be in http/https scheme."
        },
        {
            command: "get notAnAddress",
            qualifier: "contains",
            test: "The get command requires an address in http/https scheme."
        },
        {
            command: "get https://duckduckgo.com/",
            qualifier: "contains",
            test: "<title>DuckDuckGo — Privacy, simplified.</title>"
        },
        {
            command: "hash",
            qualifier: "contains",
            test: `Command ${vars.text.cyan}hash${vars.text.none} requires some form of address of something to analyze, ${vars.text.angry}but no address is provided${vars.text.none}.`
        },
        {
            command: "hash anUnsupportedPath",
            qualifier: "contains",
            test: `${filePathEncode("relative", "/anUnsupportedPath") + vars.text.none} is not a file or directory.`
        },
        {
            command: `hash ${filePathEncode("absolute", "tsconfig.json")}`,
            qualifier: "is",
            test: hash
        },
        {
            command: `hash ${filePathEncode("absolute", "tsconfig.json")} md5`,
            qualifier: "is",
            test: md5
        },
        {
            command: "hash string:tsconfig.json md5",
            qualifier: "is",
            test: "e5e546dd2eb0351f813d63d1b39dbc48"
        },
        {
            command: "hash string:tsconfig.json shake256",
            qualifier: "is",
            test: "9a3e06cfa3f81d2e3e02957d1f573194987440206ceab8ad5456bfd0316cd2b9"
        },
        {
            command: `hash ${filePathEncode("absolute", "tsconfig.json")} --verbose`,
            qualifier: "contains",
            test: "seconds total time"
        },
        {
            command: `hash ${filePathEncode("absolute", "")} list ignore ["node_modules", ".git", "js", "lib", "src-tauri"]`,
            qualifier: "contains",
            test: `tsconfig.json:${hash}`
        },
        {
            command: `hash ${filePathEncode("absolute", "")} list ignore [.git, "node_modules", "js", "lib", "src-tauri", "space test"]`,
            qualifier: "contains",
            test: `tsconfig.json:${hash}`
        },
        {
            command: `hash ${filePathEncode("absolute", "")} list ignore [.git, "node_modules", "js", "lib", "src-tauri", "space test"]`,
            qualifier: "not contains",
            test: filePathEncode("relative", "js/lib")
        },
        {
            command: "hash https://duckduckgo.com/assets/logo_homepage.normal.v107.svg",
            qualifier: "is",
            test: "0627f9ecca62cca0c9796ff1c1f5c4b50efdcf796c3d0a4ad26b38e135b56243a72bf253f1ed791996425ad70ccf1d0f42d733b1000cb8636a074f4f2e1dc089"
        },
        {
            command: "help",
            qualifier: "contains",
            test: `To see every command example use the '${vars.text.cyan}all${vars.text.none}' argument:`
        },
        {
            command: "help 2",
            qualifier: "contains",
            test: `Commands are tested using the ${vars.text.green}test_simulation${vars.text.none} command.`
        },
        {
            command: "help 3",
            qualifier: "ends",
            test: `share commands no_color hash${vars.text.none}`
        },
        {
            command: `lint ${filePathEncode("absolute", "lib/terminal/test/application/simulation.ts")}`,
            qualifier: "contains",
            test: `${vars.text.green}Lint complete${vars.text.none} for ${vars.text.cyan + vars.text.bold + filePathEncode("absolute", "lib/terminal/test/application/simulation.ts") + vars.text.none}`
        },
        {
            command: `lint ${filePathEncode("absolute", "js/lib/terminal/test/application/simulation.js")}`,
            qualifier: "contains",
            test: "Lint command not configured to work with JavaScript files."
        },
        {
            command: `lint ${filePathEncode("relative", "./js")}`,
            qualifier: "contains",
            test: "Lint command not configured to work with JavaScript files."
        },
        {
            command: `mkdir ${filePathEncode("absolute", "lib/terminal/test/testDir")} --verbose`,
            qualifier: "contains",
            test: `Directory created at ${vars.text.cyan + filePathEncode("absolute", "lib/terminal/test/testDir") + vars.text.none}`
        },
        {
            command: `remove ${filePathEncode("absolute", "lib/terminal/test/testDir")} --verbose`,
            qualifier: "contains",
            test: `${vars.environment.name} removed ${vars.text.angry}1${vars.text.none} directory, ${vars.text.angry}0${vars.text.none} file, ${vars.text.angry}0${vars.text.none} symbolic links at ${vars.text.angry}0${vars.text.none} bytes.`
        },
        {
            command: `mkdir ${filePathEncode("absolute", "lib/terminal/test/testDir")}`,
            qualifier: "is",
            test: ""
        },
        {
            command: `remove ${filePathEncode("absolute", "lib/terminal/test/testDir")}`,
            qualifier: "is",
            test: ""
        },
        {
            command: "version 1",
            qualifier: "contains",
            test: `Version ${vars.text.angry}`
        },
        {
            command: "version 2",
            qualifier: "begins",
            test: `${vars.text.cyan + vars.text.bold + vars.text.underline + vars.environment.name} - Version${vars.text.none}`
        },
        {
            command: "version 3",
            qualifier: "contains",
            test: `git Log ${vars.text.cyan}`
        }
    ];

export default simulation;