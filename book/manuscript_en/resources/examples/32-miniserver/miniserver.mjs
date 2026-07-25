/**
 * resources/examples/32-miniserver/miniserver.mjs — Minimal OPC UA server (Node.js 24)
 * Start: node resources/examples/32-miniserver/miniserver.mjs
 */
import { OPCUAServer, Variant, DataType } from "node-opcua";
import os from "node:os";

const server = new OPCUAServer({
  port: 4334,
  resourcePath: "/UA/LearningPath",
  buildInfo: {
    productName: "LearningPathMiniServer",
    buildNumber: "1",
    buildDate: new Date()
  }
});

await server.initialize();

const addressSpace = server.engine.addressSpace;
const namespace = addressSpace.getOwnNamespace();

const device = namespace.addObject({
  organizedBy: addressSpace.rootFolder.objects,
  browseName: "LearningDevice"
});

let counter = 0;
const counterVar = namespace.addVariable({
  componentOf: device,
  browseName: "Counter",
  dataType: "Double",
  nodeId: "s=Counter"
});

const timer = setInterval(() => {
  counter += 1;
  counterVar.setValueFromSource(
    new Variant({ dataType: DataType.Double, value: counter })
  );
}, 500);
addressSpace.registerShutdownTask(() => clearInterval(timer));

namespace.addVariable({
  componentOf: device,
  browseName: "FreeMemoryPercent",
  dataType: "Double",
  nodeId: "s=FreeMemory",
  minimumSamplingInterval: 1000,
  value: {
    get: () =>
      new Variant({
        dataType: DataType.Double,
        value: (os.freemem() / os.totalmem()) * 100
      })
  }
});

await server.start();
console.log("Server running:", server.getEndpointUrl());
console.log("Press CTRL+C to stop");
