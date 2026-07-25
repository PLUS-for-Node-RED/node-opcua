/**
 * resources/examples/34-subscription/subscription.mjs — DataChange subscription (Node.js 24)
 */
import {
  OPCUAClient,
  ClientSubscription,
  ClientMonitoredItem,
  AttributeIds,
  TimestampsToReturn,
  MessageSecurityMode,
  SecurityPolicy
} from "node-opcua";
import os from "node:os";

const endpointUrl = `opc.tcp://${os.hostname()}:4334/UA/LearningPath`;
const client = OPCUAClient.create({
  securityMode: MessageSecurityMode.None,
  securityPolicy: SecurityPolicy.None,
  endpointMustExist: false
});

await client.connect(endpointUrl);
const session = await client.createSession();

const sub = ClientSubscription.create(session, {
  requestedPublishingInterval: 500,
  requestedLifetimeCount: 50,
  requestedMaxKeepAliveCount: 10,
  maxNotificationsPerPublish: 100,
  publishingEnabled: true,
  priority: 10
});

const item = ClientMonitoredItem.create(
  sub,
  { nodeId: "ns=1;s=Counter", attributeId: AttributeIds.Value },
  { samplingInterval: 200, discardOldest: true, queueSize: 10 },
  TimestampsToReturn.Both
);

let n = 0;
item.on("changed", (dataValue) => {
  console.log("Counter changed:", dataValue.value.value);
  n += 1;
  if (n >= 5) {
    sub.terminate().then(async () => {
      await session.close();
      await client.disconnect();
    });
  }
});
