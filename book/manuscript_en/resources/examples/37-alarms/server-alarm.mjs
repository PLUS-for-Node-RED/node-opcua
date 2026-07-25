/**
 * resources/examples/37-alarms/server-alarm.mjs — OffNormalAlarm on a MultiState variable (learning example)
 */
import { OPCUAServer, DataType } from "node-opcua";

const server = new OPCUAServer({
  port: 4337,
  resourcePath: "/UA/AlarmDemo"
});

await server.initialize();
const as = server.engine.addressSpace;
const ns = as.getOwnNamespace();

const tank = ns.addObject({
  organizedBy: as.rootFolder.objects,
  browseName: "Tank",
  eventNotifier: 1,
  nodeId: "s=Tank"
});

const stateVar = ns.addMultiStateDiscrete({
  componentOf: tank,
  browseName: "FillState",
  nodeId: "s=FillState",
  enumStrings: ["Low", "Normal", "High"],
  value: 1
});

const normalState = ns.addMultiStateDiscrete({
  componentOf: tank,
  browseName: "NormalFillState",
  nodeId: "s=NormalFillState",
  enumStrings: ["Low", "Normal", "High"],
  value: 1
});

const alarm = ns.instantiateOffNormalAlarm({
  browseName: "FillOffNormalAlarm",
  conditionSource: tank,
  organizedBy: tank,
  inputNode: stateVar,
  normalState: normalState.nodeId
});

let t = 0;
setInterval(() => {
  // alternates periodically between Normal (1) and High (2)
  t += 1;
  const value = t % 4 === 0 ? 2 : 1;
  stateVar.setValueFromSource({ dataType: DataType.UInt32, value });
  console.log(
    "FillState=",
    value,
    "active=",
    alarm.activeState.getValue()
  );
}, 2000);

await server.start();
console.log("Alarm server:", server.getEndpointUrl());
console.log("OffNormalAlarm on FillState - active when state != Normal");
