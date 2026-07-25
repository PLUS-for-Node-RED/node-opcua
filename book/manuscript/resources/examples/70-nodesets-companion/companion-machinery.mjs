/**
 * resources/examples/70-nodesets-companion/companion-machinery.mjs
 * Lehre: DI + IA + Machinery laden, Device subtypen, Identification-AddIn
 *
 * Quellen/Vorbild: packages/node-opcua-samples/bin/machineryServer.js
 * Specs: OPC 10000-100 (DI), OPC 10000-200 (IA), OPC 40001-1 (Machinery)
 * https://reference.opcfoundation.org/
 */
import { OPCUAServer, nodesets } from "node-opcua";

const server = new OPCUAServer({
  port: 4340,
  resourcePath: "/UA/CompanionDemo",
  nodeset_filename: [
    nodesets.standard,
    nodesets.di,
    nodesets.ia,
    nodesets.machinery
  ]
});

await server.initialize();
const as = server.engine.addressSpace;

const nsDI = as.getNamespaceIndex("http://opcfoundation.org/UA/DI/");
const nsMachinery = as.getNamespaceIndex("http://opcfoundation.org/UA/Machinery/");

const deviceType = as.findObjectType("DeviceType", nsDI);
const machineIdentificationType = as.findObjectType(
  "MachineIdentificationType",
  nsMachinery
);

if (!deviceType || !machineIdentificationType) {
  throw new Error("NodeSets nicht vollständig geladen – Dependencies prüfen");
}

const app = as.registerNamespace("urn:book:companion-demo");
const myMachineType = app.addObjectType({
  browseName: "DemoMachineType",
  subtypeOf: deviceType
});

const machine = myMachineType.instantiate({
  browseName: "DemoMachine-1",
  organizedBy: as.rootFolder.objects.deviceSet
});

// In Machines-Ordner einsortieren (Machinery-Einstieg)
machine.addReference({
  nodeId: as.rootFolder.objects.machines,
  referenceType: "Organizes",
  isForward: false
});

const identification = machineIdentificationType.instantiate({
  browseName: "Identification",
  optionals: ["Location", "ManufacturerUri", "YearOfConstruction"]
});

identification.location.setValueFromSource({
  dataType: "String",
  value: "Linie-A / Platz-3"
});
identification.yearOfConstruction.setValueFromSource({
  dataType: "UInt32",
  value: 2024
});

identification.addReference({
  nodeId: machine,
  referenceType: "HasAddIn",
  isForward: false
});

await server.start();
console.log("Companion-Demo:", server.getEndpointUrl());
console.log("Browsen: Objects → DeviceSet / Machines → DemoMachine-1");
console.log("Specs: siehe https://reference.opcfoundation.org/");
