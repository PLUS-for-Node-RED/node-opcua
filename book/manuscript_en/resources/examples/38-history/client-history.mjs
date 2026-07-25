/**
 * resources/examples/38-history/client-history.mjs — HistoryRead on the Signal variable
 */
import {
  OPCUAClient,
  MessageSecurityMode,
  SecurityPolicy,
  TimestampsToReturn
} from "node-opcua";
import os from "node:os";

const endpointUrl = `opc.tcp://${os.hostname()}:4338/UA/HistoryDemo`;
const client = OPCUAClient.create({
  securityMode: MessageSecurityMode.None,
  securityPolicy: SecurityPolicy.None,
  endpointMustExist: false
});

await client.connect(endpointUrl);
const session = await client.createSession();

const end = new Date();
const start = new Date(end.getTime() - 15_000);

const history = await session.readHistoryValue(
  "ns=1;s=Signal",
  start,
  end
);

console.log("History-Status:", history.statusCode?.toString?.() ?? history.statusCode);
const values = history.historyData?.dataValues ?? history.dataValues ?? [];
for (const dv of values.slice(-5)) {
  console.log(dv.sourceTimestamp?.toISOString?.(), dv.value?.value);
}

await session.close();
await client.disconnect();
