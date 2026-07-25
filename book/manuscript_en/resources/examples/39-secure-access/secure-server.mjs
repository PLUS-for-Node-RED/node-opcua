/**
 * resources/examples/39-secure-access/secure-server.mjs — Server with UserName/Password (demo)
 * Note: Security Mode None is kept deliberately simple here;
 * the focus is user authentication. Use SignAndEncrypt in production.
 */
import { OPCUAServer, Variant, DataType } from "node-opcua";

const users = new Map([
  ["operator", "secret"],
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
      new Variant({ dataType: DataType.String, value: "authenticated-users-only" })
  }
});

await server.start();
console.log("Secure demo server:", server.getEndpointUrl());
console.log("User: operator / secret");
