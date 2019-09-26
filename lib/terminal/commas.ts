
// converts numbers into a string of comma separated triplets
const commas = function node_apps_commas(number:number):string {
    const str:string = String(number);
    let arr:string[] = [],
        a:number   = str.length;
    if (a < 4) {
        return str;
    }
    arr = String(number).split("");
    a   = arr.length;
    do {
        a      = a - 3;
        arr[a] = "," + arr[a];
    } while (a > 3);
    return arr.join("");
};

export default commas;