/**
 * resources/examples/39-sicherer-zugriff/secure-server.mjs — Server mit UserName/Password (Demo)
 * Hinweis: Security Mode None bleibt hier bewusst einfach;
 * Fokus ist Benutzerauthentifizierung. Für Produktion SignAndEncrypt nutzen.
 */
import { OPCUAServer, Variant, DataType } from "node-opcua";

const users = new Map([
  ["operator", "geheim"],
  ["admin", "admin123"]
]);

const server = new OPCUAServer({
  port: 4339,
  resourcePath: "/UA/SecureDemo",
  allowAnonymous: false,
  userManager: {
    isValidUser: (userName, password) =>
      users.has(userName) && users.get(userName) === password
  }
});

await server.initialize();
const as = server.engine.addressSpace;
const ns = as.getOwnNamespace();
const device = ns.addObject({
  organizedBy: as.rootFolder.objects,
  browseName: "SecureDevice",
  nodeId: "s=SecureDevice"
});
ns.addVariable({
  componentOf: device,
  browseName: "SecretValue",
  nodeId: "s=SecretValue",
  dataType: "String",
  value: {
    get: () =>
      new Variant({ dataType: DataType.String, value: "nur-fuer-user" })
  }
});

await server.start();
console.log("Secure Demo Server:", server.getEndpointUrl());
console.log("User: operator / geheim");
