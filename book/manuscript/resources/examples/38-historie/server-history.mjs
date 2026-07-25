/**
 * resources/examples/38-historie/server-history.mjs — Historisierende Variable
 */
import { OPCUAServer, Variant, DataType } from "node-opcua";

const server = new OPCUAServer({
  port: 4338,
  resourcePath: "/UA/HistoryDemo"
});

await server.initialize();
const as = server.engine.addressSpace;
const ns = as.getOwnNamespace();

const device = ns.addObject({
  organizedBy: as.rootFolder.objects,
  browseName: "Historian",
  nodeId: "s=Historian"
});

let v = 0;
const variable = ns.addVariable({
  componentOf: device,
  browseName: "Signal",
  dataType: "Double",
  nodeId: "s=Signal"
});

as.installHistoricalDataNode(variable);

setInterval(() => {
  v += Math.sin(Date.now() / 1000);
  variable.setValueFromSource(
    new Variant({ dataType: DataType.Double, value: v })
  );
}, 500);

await server.start();
console.log("History-Server:", server.getEndpointUrl());
console.log("Variable ns=1;s=Signal wird historisiert.");
