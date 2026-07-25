/**
 * resources/examples/35-methods/client-method.mjs — Calling the Multiply method
 */
import {
  OPCUAClient,
  MessageSecurityMode,
  SecurityPolicy,
  DataType,
  Variant
} from "node-opcua";
import os from "node:os";

const endpointUrl = `opc.tcp://${os.hostname()}:4335/UA/MethodDemo`;
const client = OPCUAClient.create({
  securityMode: MessageSecurityMode.None,
  securityPolicy: SecurityPolicy.None,
  endpointMustExist: false
});

await client.connect(endpointUrl);
const session = await client.createSession();

const result = await session.call({
  objectId: "ns=1;s=Calculator",
  methodId: "ns=1;s=Multiply",
  inputArguments: [
    new Variant({ dataType: DataType.Double, value: 6 }),
    new Variant({ dataType: DataType.Double, value: 7 })
  ]
});

console.log("Status:", result.statusCode.toString());
console.log("6 * 7 =", result.outputArguments?.[0]?.value);

await session.close();
await client.disconnect();
