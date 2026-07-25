/**
 * resources/examples/35-methoden/server-method.mjs — Server mit Methode Multiply
 */
import { OPCUAServer, Variant, DataType, StatusCodes } from "node-opcua";

const server = new OPCUAServer({
  port: 4335,
  resourcePath: "/UA/MethodenDemo"
});

await server.initialize();
const as = server.engine.addressSpace;
const ns = as.getOwnNamespace();

const device = ns.addObject({
  organizedBy: as.rootFolder.objects,
  browseName: "Calculator",
  nodeId: "s=Calculator"
});

const method = ns.addMethod(device, {
  browseName: "Multiply",
  nodeId: "s=Multiply",
  inputArguments: [
    { name: "a", description: "Faktor A", dataType: DataType.Double },
    { name: "b", description: "Faktor B", dataType: DataType.Double }
  ],
  outputArguments: [
    { name: "result", description: "Produkt", dataType: DataType.Double }
  ]
});

method.bindMethod(async (inputArguments, context, callback) => {
  const a = inputArguments[0].value;
  const b = inputArguments[1].value;
  callback(null, {
    statusCode: StatusCodes.Good,
    outputArguments: [new Variant({ dataType: DataType.Double, value: a * b })]
  });
});

await server.start();
console.log("Methoden-Server:", server.getEndpointUrl());
