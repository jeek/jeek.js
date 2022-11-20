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
	await ns.sleep(0);
  }
  ns.tprint(data.pop());
  while (data.length == 0) {
	await ns.sleep(0);
  }
  ns.tprint(data.pop());
} */
