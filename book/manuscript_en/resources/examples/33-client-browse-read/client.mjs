/**
 * resources/examples/33-client-browse-read/client.mjs — Browse + Read (Node.js 24)
 * Prerequisite: 32-miniserver/miniserver.mjs is running
 */
import {
  OPCUAClient,
  AttributeIds,
  MessageSecurityMode,
  SecurityPolicy,
  makeBrowsePath
} from "node-opcua";
import os from "node:os";

const endpointUrl = `opc.tcp://${os.hostname()}:4334/UA/LearningPath`;

const client = OPCUAClient.create({
  applicationName: "LearningPathClient",
  connectionStrategy: { initialDelay: 500, maxRetry: 2 },
  securityMode: MessageSecurityMode.None,
  securityPolicy: SecurityPolicy.None,
  endpointMustExist: false
});

await client.connect(endpointUrl);
const session = await client.createSession();

const browseResult = await session.browse("RootFolder");
for (const ref of browseResult.references ?? []) {
  console.log("Root ->", ref.browseName.toString(), ref.nodeId.toString());
}

const bp = makeBrowsePath("RootFolder", "/Objects/LearningDevice.Counter");
const t = await session.translateBrowsePath(bp);
const counterId = t.targets[0].targetId;

const dv = await session.read({
  nodeId: counterId,
  attributeId: AttributeIds.Value
});
console.log("Counter =", dv.value.value);

await session.close();
await client.disconnect();
