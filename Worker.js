/* Worker Test Code
let workerCode = "postMessage(`I'm working before postMessage('ali').`); console.log('BOOTED'); onmessage = (event) => { postMessage(`Hi, ${event.data}`);};";

export async function main(ns) {
  var win=eval("window");
  var blob = new Blob([workerCode], {type: "application/javascript"});
  const myWorker = new Worker(URL.createObjectURL(blob));
  let data = [];
  myWorker.postMessage('ali');
  myWorker.onmessage = (event) => {
	data.push(`Worker said : ${event.data}`);
  };
  while (data.length == 0) {
	await ns.asleep(0);
  }
  ns.tprint(data.pop());
  while (data.length == 0) {
	await ns.asleep(0);
  }
  ns.tprint(data.pop());
} */

// https://discord.com/channels/415207508303544321/944647347625930762/1046962547582058496
// (()=>{let times=[],fn=(off)=>{if (times.length >= 100) {if (times.length == 100) {console.log(times.join("\n"))}; return}; let n=Date.now(); let m=n%4==off?4:8-(n-off)%4; times.push(off+","+m+","+n); setTimeout(fn, m, off)};[0,1,2,3].forEach(fn)})()
