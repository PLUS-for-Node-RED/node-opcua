/**
 * resources/examples/36-data-access/server-data-access.mjs — AnalogItem mit Engineering Unit
 */
import {
  OPCUAServer,
  Variant,
  DataType,
  StatusCodes,
  standardUnits,
  makeEUInformation
} from "node-opcua";

const server = new OPCUAServer({
  port: 4336,
  resourcePath: "/UA/DataAccess"
});

await server.initialize();
const as = server.engine.addressSpace;
const ns = as.getOwnNamespace();

const device = ns.addObject({
  organizedBy: as.rootFolder.objects,
  browseName: "Sensorik",
  nodeId: "s=Sensorik"
});

let temperature = 20;
const analog = ns.addAnalogDataItem({
  componentOf: device,
  browseName: "Temperature",
  nodeId: "s=Temperature",
  dataType: "Double",
  engineeringUnits: standardUnits.degree_celsius,
  engineeringUnitsRange: { low: -40, high: 120 },
  value: new Variant({ dataType: DataType.Double, value: temperature })
});

setInterval(() => {
  temperature += (Math.random() - 0.5);
  analog.setValueFromSource(
    new Variant({ dataType: DataType.Double, value: temperature }),
    StatusCodes.Good
  );
}, 1000);

await server.start();
console.log("DA-Server:", server.getEndpointUrl());
console.log("EU:", makeEUInformation(standardUnits.degree_celsius).displayName.text);
