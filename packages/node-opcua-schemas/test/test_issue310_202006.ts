import fs from "fs";
import path from "path";
import should from "should";

import { DataTypeFactory, parameters } from "node-opcua-factory";
import { encode_decode_round_trip_test } from "node-opcua-packet-analyzer/dist/test_helpers";

import { getOrCreateConstructor, parseBinaryXSD } from "..";
import { MockProvider } from "./mock_id_provider";

class MockProvider2 extends MockProvider {
    public getDataTypeAndEncodingId(key: string) {
        if (key === "Rep_BMD_ProcStepCtrl") {
            return null;
        }
        return super.getDataTypeAndEncodingId(key);
    }
}
const idProvider = new MockProvider2();

describe("BSHA - Binary Schemas Helper 1", () => {
    let dataTypeFactory: DataTypeFactory;
    let old_schema_helpers_doDebug = false;
    let sample: string;
    before(async () => {
        const sample_file = path.join(__dirname, "fixtures/simaticSchema.bsd");

        old_schema_helpers_doDebug = parameters.debugSchemaHelper;
        parameters.debugSchemaHelper = true;
        sample = fs.readFileSync(sample_file, "utf-8");
        dataTypeFactory = new DataTypeFactory([]);
    });

    after(() => {
        parameters.debugSchemaHelper = old_schema_helpers_doDebug;
    });

    it("should XCVB", async () => {
        await parseBinaryXSD(sample, idProvider, dataTypeFactory);

        const structureInfo = dataTypeFactory.getStructureInfoByTypeName("Recipe_BMD_Rep");
        const Recipe_BMD_Rep = structureInfo.constructor!;
        const a = new Recipe_BMD_Rep({
            STN1: { value: 1 },
            STN2: { value: 2 },
            STN3: { value: 3 },
            STN4: { value: 4 }
        }) as any;

        // console.log(a.toString());
        a.STN3.value.should.eql(3);

        encode_decode_round_trip_test(a);
    });
});
