/**
 * resources/examples/39-sicherer-zugriff/secure-client.mjs — Session mit UserName/Password
 */
import {
  OPCUAClient,
  AttributeIds,
  MessageSecurityMode,
  SecurityPolicy,
  UserTokenType
} from "node-opcua";
import os from "node:os";

const endpointUrl = `opc.tcp://${os.hostname()}:4339/UA/SecureDemo`;
const client = OPCUAClient.create({
  securityMode: MessageSecurityMode.None,
  securityPolicy: SecurityPolicy.None,
  endpointMustExist: false
});

await client.connect(endpointUrl);

const session = await client.createSession({
  type: UserTokenType.UserName,
  userName: "operator",
  password: "geheim"
});

const dv = await session.read({
  nodeId: "ns=1;s=SecretValue",
  attributeId: AttributeIds.Value
});
console.log("SecretValue =", dv.value.value);

await session.close();
await client.disconnect();
