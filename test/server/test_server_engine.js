var should = require("should");
var server_engine = require("../../lib/server/server_engine");
var resolveNodeId = require("../../lib/nodeid").resolveNodeId;
var NodeClass = require("../../lib/browse_service").NodeClass;
var browse_service = require("../../lib/browse_service");
BrowseDirection = browse_service.BrowseDirection;
var read_service = require("../../lib/read_service");
var TimestampsToReturn = read_service.TimestampsToReturn;
var util = require("util");
var NodeId = require("../../lib/nodeid").NodeId;
var assert = require('better-assert');
var AttributeIds = read_service.AttributeIds;

var DataType = require("../../lib/variant").DataType;
var StatusCodes = require("../../lib/opcua_status_code").StatusCodes;
var makeNodeId = require("../../lib/nodeid").makeNodeId;
var ReferenceType = require("../../lib/opcua_node_ids").ReferenceType;
var VariableIds = require("../../lib/opcua_node_ids").Variable;
var Variant = require("../../lib/variant").Variant;
var VariantArrayType =  require("../../lib/variant").VariantArrayType;

var server_NamespaceArray_Id =  makeNodeId(VariableIds.Server_NamespaceArray); // ns=0;i=2255

describe("ServerEngine", function () {


    var server,FolderTypeId,BaseDataVariableTypeId;
    beforeEach(function(done){
        server = new server_engine.ServerEngine();
        server.initialize(null,function(){
            FolderTypeId = server.findObject("FolderType").nodeId;
            BaseDataVariableTypeId = server.findObject("BaseDataVariableType").nodeId;
            done();
        });

    });
    afterEach(function(){
        server = null;
    });

    it("should have a rootFolder ", function () {

        server.rootFolder.hasTypeDefinition.should.eql(FolderTypeId);

    });

    it("should find the rootFolder by browseName", function () {

        var browseNode = server.findObject("RootFolder");

        browseNode.hasTypeDefinition.should.eql(FolderTypeId);
        browseNode.should.equal(server.rootFolder);

    });

    it("should find the rootFolder by nodeId", function () {

        var browseNode = server.findObject("i=84");

        browseNode.hasTypeDefinition.should.eql(FolderTypeId);
        browseNode.should.equal(server.rootFolder);

    });

    it("should have an 'Objects' folder", function () {

        var rootFolder = server.findObject("RootFolder");

        var objectFolder = server.findObject("Objects");

        assert(objectFolder !== null);
        objectFolder.parent.should.eql(rootFolder.nodeId);

    });

    it("should have an 'Server' object", function () {

        var serverObject = server.findObject("Server");
        var objectFolder = server.findObject("Objects");
        assert(serverObject !== null);
        serverObject.parent.should.eql(objectFolder.nodeId);

    });

    it("should have an 'Server.NamespaceArray' Variable", function () {

        var serverObject = server.findObject("Server");
        var objectFolder = server.findObject("Objects");

        var server_NamespaceArray_Id =  makeNodeId(VariableIds.Server_NamespaceArray);
        var server_NamespaceArray = server.findObject(server_NamespaceArray_Id);
        assert(server_NamespaceArray !== null);
        //xx server_NamespaceArray.parent.should.eql(serverObject.nodeId);

    });

    it("should have an 'Server.Server_ServerArray' Variable", function () {

        var serverObject = server.findObject("Server");
        var objectFolder = server.findObject("Objects");

        var server_NamespaceArray_Id =  makeNodeId(VariableIds.Server_ServerArray);
        var server_NamespaceArray = server.findObject(server_NamespaceArray_Id);
        assert(server_NamespaceArray !== null);
        //xx server_NamespaceArray.parent.should.eql(serverObject.nodeId);
    });

    it("should allow to create a new folder", function () {

        var rootFolder = server.findObject("RootFolder");


        var newFolder = server.createFolder("RootFolder", "MyNewFolder");
        assert(newFolder);

        newFolder.hasTypeDefinition.should.eql(FolderTypeId);
        newFolder.parent.should.equal(rootFolder.nodeId);

    });

    it("should allow to find a newly created folder by nodeId", function () {

        var newFolder = server.createFolder("ObjectsFolder", "MyNewFolder");

        // a specific node id should have been assigned by the engine
        assert(newFolder.nodeId instanceof NodeId);
        newFolder.nodeId.toString().should.eql("ns=1;i=1000");

        var result = server.findObject(newFolder.nodeId);
        result.should.eql(newFolder);

    });

    it("should allow to find a newly created folder by 'browse name'", function () {

        var newFolder = server.createFolder("ObjectsFolder", "MySecondNewFolder");
        var result = server.findObjectByBrowseName("MySecondNewFolder");
        assert(result != null);
        result.should.eql(newFolder);
    });

    xit("should not allow to create a object with an existing 'browse name'", function () {

        var newFolder1 = server.createFolder("ObjectsFolder", "NoUniqueName");

        (function(){
            server.createFolder("ObjectsFolder", "NoUniqueName");
        }).should.throw("browseName already registered");

        var result = server.findObjectByBrowseName("NoUniqueName");
        result.should.eql(newFolder1);
    });

    it("should allow to create a variable in a folder", function () {

        var rootFolder = server.findObject("ObjectsFolder");
        var newFolder = server.createFolder("ObjectsFolder", "MyNewFolder");

        var newVariable = server.addVariableInFolder("MyNewFolder",
            {
                browseName: "Temperature",
                value: {
                    get: function(){
                        return new Variant({dataType: DataType.UInt32 , value: 10.0});
                    },
                    set: function(){
                        return StatusCodes.Bad_NotWritable;
                    }
                }

            });

        newVariable.value.should.be.instanceOf(Variant);
        newVariable.value.value.should.equal(10.0);

        newVariable.hasTypeDefinition.should.equal(BaseDataVariableTypeId);
        newVariable.parent.should.equal(newFolder.nodeId);

    });



    it("should browse the 'Objects' folder for back references",function(){

        var ref_Organizes_Id = server.resolveNodeId("Organizes");
        ref_Organizes_Id.toString().should.eql("ns=0;i=35");

        var browseDescription = {
            browseDirection : BrowseDirection.Inverse,
            referenceTypeId : "Organizes"
        };

        var browseResult = server.browseSingleNode("ObjectsFolder",browseDescription);

        browseResult.statusCode.should.eql( StatusCodes.Good);
        browseResult.references.length.should.equal(1);

        browseResult.references[0].referenceTypeId.should.eql(ref_Organizes_Id);
        browseResult.references[0].isForward.should.equal(false);
        browseResult.references[0].browseName.name.should.equal("Root");
        browseResult.references [0].nodeId.toString().should.equal("ns=0;i=84");
        //xx browseResult.references[0].displayName.text.should.equal("Root");
        browseResult.references[0].typeDefinition.should.eql(resolveNodeId("FolderType"));
        browseResult.references[0].nodeClass.should.eql(NodeClass.Object);


    });

    it("should browse root folder",function(){

        var ref_Organizes_Id = server.resolveNodeId("Organizes");
        ref_Organizes_Id.toString().should.eql("ns=0;i=35");

        var browseDescription = {
            browseDirection : BrowseDirection.Both,
            referenceTypeId : "Organizes"
        };
        var browseResult = server.browseSingleNode("RootFolder",browseDescription);

        browseResult.statusCode.should.eql(StatusCodes.Good);

        browseResult.references.length.should.equal(3);

        browseResult.references[0].referenceTypeId.should.eql(ref_Organizes_Id);
        browseResult.references[0].isForward.should.equal(true);
        browseResult.references[0].browseName.name.should.equal("Objects");
        browseResult.references[0].nodeId.toString().should.equal("ns=0;i=85");
        browseResult.references[0].displayName.text.should.equal("Objects");
        browseResult.references[0].nodeClass.should.eql(NodeClass.Object);
        browseResult.references[0].typeDefinition.should.eql(resolveNodeId("FolderType"));

        browseResult.references[0].referenceTypeId.should.eql(ref_Organizes_Id);
        browseResult.references[1].isForward.should.equal(true);
        browseResult.references[1].browseName.name.should.equal("Types");
        browseResult.references[1].nodeId.toString().should.equal("ns=0;i=86");
        browseResult.references[1].typeDefinition.should.eql(resolveNodeId("FolderType"));
        browseResult.references[1].nodeClass.should.eql(NodeClass.Object);

        browseResult.references[0].referenceTypeId.should.eql(ref_Organizes_Id);
        browseResult.references[2].isForward.should.equal(true);
        browseResult.references[2].browseName.name.should.equal("Views");
        browseResult.references[2].nodeId.toString().should.equal("ns=0;i=87");
        browseResult.references[2].typeDefinition.should.eql(resolveNodeId("FolderType"));
        browseResult.references[2].nodeClass.should.eql(NodeClass.Object);

    });

    it("should browse a 'Server' object in  the 'Objects' folder",function(){

        var ref_Organizes_Id = server.resolveNodeId("Organizes");
        ref_Organizes_Id.toString().should.eql("ns=0;i=35");

        var browseDescription = {
            browseDirection : BrowseDirection.Forward,
            referenceTypeId : "Organizes"
        };
        var browseResult = server.browseSingleNode("ObjectsFolder",browseDescription);
        browseResult.statusCode.should.eql(StatusCodes.Good);

        browseResult.references.length.should.equal(1);
        console.log(browseResult.references[0].browseName.name);

        browseResult.references[0].browseName.name.should.equal("Server");

    });

    it("should handle a BrowseRequest and set StatusCode if node doesn't exist",function() {

        var browseResult = server.browseSingleNode("ns=46;id=123456");

        browseResult.statusCode.should.equal(StatusCodes.Bad_NodeIdUnknown);
        browseResult.references.length.should.equal(0);

    });

    it("should handle a BrowseRequest with multiple nodes to browse",function() {

        var browseRequest = new browse_service.BrowseRequest({
            nodesToBrowse: [
                {
                    nodeId: resolveNodeId("RootFolder"),
                    includeSubtypes: true,
                    browseDirection: browse_service.BrowseDirection.Both,
                    resultMask: 63
                },
                {
                    nodeId: resolveNodeId("ObjectsFolder"),
                    includeSubtypes: true,
                    browseDirection: browse_service.BrowseDirection.Both,
                    resultMask: 63
                }
            ]
        });

        browseRequest.nodesToBrowse.length.should.equal(2);
        var results = server.browse(browseRequest.nodesToBrowse);

        results.length.should.equal(2);

        // RootFolder should have 4 nodes ( 1 hasTypeDefinition , 3 sub-folders)
        results[0].references.length.should.equal(4);

    });


    describe("readSingleNode on Object",function(){

        it("should handle a readSingleNode - BrowseName",function() {

            var readResult = server.readSingleNode("RootFolder",AttributeIds.BrowseName);

            readResult.statusCode.should.eql( StatusCodes.Good);
            readResult.value.dataType.should.eql(DataType.QualifiedName);
            readResult.value.value.name.should.equal("Root");
        });

        it("should handle a readSingleNode - NodeClass",function() {

            var readResult = server.readSingleNode("RootFolder",AttributeIds.NodeClass);

            readResult.statusCode.should.eql( StatusCodes.Good);
            readResult.value.dataType.should.eql(DataType.Int32);
            readResult.value.value.should.equal(NodeClass.Object.value);
        });

        it("should handle a readSingleNode - NodeId",function() {

            var readResult = server.readSingleNode("RootFolder",AttributeIds.NodeId);

            readResult.statusCode.should.eql( StatusCodes.Good);
            readResult.value.dataType.should.eql(DataType.NodeId);
            readResult.value.value.toString().should.equal("ns=0;i=84");
        });

        it("should handle a readSingleNode - DisplayName",function() {

            var readResult = server.readSingleNode("RootFolder",AttributeIds.DisplayName);

            readResult.statusCode.should.eql( StatusCodes.Good);
            readResult.value.dataType.should.eql(DataType.LocalizedText);
            readResult.value.value.text.toString().should.equal("Root");
        });

        it("should handle a readSingleNode - Description",function() {

            var readResult = server.readSingleNode("RootFolder",AttributeIds.Description);
            readResult.statusCode.should.eql( StatusCodes.Good);
            readResult.value.dataType.should.eql(DataType.LocalizedText);
            readResult.value.value.text.toString().should.equal("");
        });

        it("should handle a readSingleNode - WriteMask",function() {

            var readResult = server.readSingleNode("RootFolder",AttributeIds.WriteMask);
            readResult.statusCode.should.eql( StatusCodes.Good);
            readResult.value.dataType.should.eql(DataType.UInt32);
            readResult.value.value.should.equal(0);
        });

        it("should handle a readSingleNode - UserWriteMask",function() {

            var readResult = server.readSingleNode("RootFolder",AttributeIds.UserWriteMask);
            readResult.value.dataType.should.eql(DataType.UInt32);
            readResult.value.value.should.equal(0);
        });
        it("should handle a readSingleNode - EventNotifier",function() {

            var readResult = server.readSingleNode("RootFolder",AttributeIds.EventNotifier);
            readResult.value.dataType.should.eql(DataType.Byte);
            readResult.value.value.should.equal(0   );
        });

        it("should return Bad_AttributeIdInvalid  - readSingleNode - for bad attribute    ",function() {

            var readResult = server.readSingleNode("RootFolder",AttributeIds.ContainsNoLoops);
            readResult.statusCode.should.eql(StatusCodes.Bad_AttributeIdInvalid);
            assert(readResult.value === null);
        });
    });

    describe("readSingleNode on ReferenceType",function(){

        //  --- on reference Type ....
        it("should handle a readSingleNode - IsAbstract",function() {

            var ref_Organizes_nodeId = server.findNodeIdByBrowseName("Organizes");

            var readResult = server.readSingleNode(ref_Organizes_nodeId,AttributeIds.IsAbstract);
            readResult.value.dataType.should.eql(DataType.Boolean);
            readResult.value.value.should.equal(false);
            readResult.statusCode.should.eql(StatusCodes.Good);
        });

        it("should handle a readSingleNode - Symmetric",function() {

            var ref_Organizes_nodeId = server.findNodeIdByBrowseName("Organizes");
            var readResult = server.readSingleNode(ref_Organizes_nodeId,AttributeIds.Symmetric);
            readResult.statusCode.should.eql(StatusCodes.Good);
            readResult.value.dataType.should.eql(DataType.Boolean);
            readResult.value.value.should.equal(false);
        });

        it("should handle a readSingleNode - InverseName",function() {

            var ref_Organizes_nodeId = server.findNodeIdByBrowseName("Organizes");
            var readResult = server.readSingleNode(ref_Organizes_nodeId,AttributeIds.InverseName);
            readResult.statusCode.should.eql(StatusCodes.Good);
            readResult.value.dataType.should.eql(DataType.LocalizedText);
            //xx readResult.value.value.should.equal(false);
        });

        it("should handle a readSingleNode - BrowseName",function() {

            var ref_Organizes_nodeId = server.findNodeIdByBrowseName("Organizes");
            var readResult = server.readSingleNode(ref_Organizes_nodeId,AttributeIds.BrowseName);
            readResult.statusCode.should.eql(StatusCodes.Good);
            readResult.value.dataType.should.eql(DataType.QualifiedName);
            readResult.value.value.name.should.eql("Organizes");
            //xx readResult.value.value.should.equal(false);
        });
        it("should return Bad_AttributeIdInvalid on EventNotifier",function() {

            var ref_Organizes_nodeId = server.findNodeIdByBrowseName("Organizes");
            var readResult = server.readSingleNode(ref_Organizes_nodeId,AttributeIds.EventNotifier);
            readResult.statusCode.should.eql(StatusCodes.Bad_AttributeIdInvalid);
            assert(readResult.value === null);
        });
    });

    describe("readSingleNode on VariableType",function(){
        //
        it("should handle a readSingleNode - BrowseName",function() {

            var readResult = server.readSingleNode("DataTypeDescriptionType",AttributeIds.BrowseName);
            readResult.statusCode.should.eql( StatusCodes.Good);
        });
        it("should handle a readSingleNode - IsAbstract",function() {

            var readResult = server.readSingleNode("DataTypeDescriptionType",AttributeIds.IsAbstract);

            readResult.statusCode.should.eql( StatusCodes.Good);
            readResult.value.dataType.should.eql(DataType.Boolean);
            readResult.value.value.should.equal(false);
        });
        it("should handle a readSingleNode - Value",function() {

            var readResult = server.readSingleNode("DataTypeDescriptionType",AttributeIds.Value);
            readResult.statusCode.should.eql( StatusCodes.Bad_AttributeIdInvalid);
        });

        it("should handle a readSingleNode - DataType",function() {

            var readResult = server.readSingleNode("DataTypeDescriptionType",AttributeIds.DataType);
            readResult.statusCode.should.eql( StatusCodes.Good);
        });
        it("should handle a readSingleNode - ValueRank",function() {

            var readResult = server.readSingleNode("DataTypeDescriptionType",AttributeIds.ValueRank);
            readResult.statusCode.should.eql( StatusCodes.Good);
        });
        it("should handle a readSingleNode - ArrayDimensions",function() {

            var readResult = server.readSingleNode("DataTypeDescriptionType",AttributeIds.ArrayDimensions);
            readResult.statusCode.should.eql( StatusCodes.Good);
        });
    });

    describe("readSingleNode on Variable (ProductUri)",function(){
        var productUri_id = makeNodeId(2262,0);
        it("should handle a readSingleNode - BrowseName",function() {

            var readResult = server.readSingleNode(productUri_id,AttributeIds.BrowseName);
            readResult.statusCode.should.eql( StatusCodes.Good);
        });
        it("should handle a readSingleNode - ArrayDimensions",function() {

            var readResult = server.readSingleNode(productUri_id,AttributeIds.ArrayDimensions);
            readResult.statusCode.should.eql( StatusCodes.Good);
        });
        it("should handle a readSingleNode - AccessLevel",function() {

            var readResult = server.readSingleNode(productUri_id,AttributeIds.AccessLevel);
            readResult.statusCode.should.eql( StatusCodes.Good);
        });
        it("should handle a readSingleNode - UserAccessLevel",function() {

            var readResult = server.readSingleNode(productUri_id,AttributeIds.UserAccessLevel);
            readResult.statusCode.should.eql( StatusCodes.Good);
        });
        it("should handle a readSingleNode - MinimumSamplingInterval",function() {

            var readResult = server.readSingleNode(productUri_id,AttributeIds.MinimumSamplingInterval);
            readResult.statusCode.should.eql( StatusCodes.Good);
            readResult.value.value.should.eql(1000);
        });
        it("should handle a readSingleNode - Historizing",function() {

            var readResult = server.readSingleNode(productUri_id,AttributeIds.Historizing);
            readResult.statusCode.should.eql( StatusCodes.Good);
            readResult.value.value.should.eql(false);
        });
    });

    describe("readSingleNode on View",function(){
        // for views
        xit("should handle a readSingleNode - ContainsNoLoops",function() {

            var readResult = server.readSingleNode("RootFolder",AttributeIds.ContainsNoLoops);
            readResult.value.dataType.should.eql(DataType.Boolean);
            readResult.value.value.should.equal(true);
        });
    });

    describe("readSingleNode on DataType",function(){
        // for views
        it("should have ServerStatusDataType dataType exposed",function(){
            var obj =server.findObjectByBrowseName("ServerStatusDataType");
            obj.browseName.should.eql("ServerStatusDataType");
            obj.nodeClass.should.eql(NodeClass.DataType);
        });
        it("should handle a readSingleNode - ServerStatusDataType - BrowseName",function() {

            var obj =server.findObjectByBrowseName("ServerStatusDataType");
            var serverStatusDataType_id = obj.nodeId;
            var readResult = server.readSingleNode(serverStatusDataType_id,AttributeIds.BrowseName);
            readResult.value.dataType.should.eql(DataType.QualifiedName);
            readResult.value.value.name.should.equal("ServerStatusDataType");
        });
    });

    it("should return Bad_NodeIdUnknown  - readSingleNode - with unknown object",function() {

        var readResult = server.readSingleNode("**UNKNOWN**",AttributeIds.DisplayName);
        readResult.statusCode.should.eql(StatusCodes.Bad_NodeIdUnknown);
    });

    it("should read the display name of RootFolder",function() {

        var readRequest = new read_service.ReadRequest({
            maxAge: 0,
            timestampsToReturn: TimestampsToReturn.Both,
            nodesToRead: [
                {
                    nodeId: resolveNodeId("RootFolder"),
                    attributeId: AttributeIds.DisplayName,
                    indexRange: null, /* ???? */
                    dataEncoding: null /* */
                }
            ]
        });
        var dataValues = server.read(readRequest.nodesToRead);
        dataValues.length.should.equal(1);

    });

    it("should read Server_NamespaceArray ",function() {

        var readRequest = new read_service.ReadRequest({
            maxAge: 0,
            timestampsToReturn: TimestampsToReturn.Both,
            nodesToRead: [
                {
                    nodeId: server_NamespaceArray_Id,
                    attributeId: AttributeIds.DisplayName,
                    indexRange: null, /* ???? */
                    dataEncoding: null /* */
                },
                {
                    nodeId: server_NamespaceArray_Id,
                    attributeId: AttributeIds.Value,
                    indexRange: null, /* ???? */
                    dataEncoding: null /* */
                }
            ]
        });
        var dataValues = server.read(readRequest.nodesToRead);
        dataValues.length.should.equal(2);
        dataValues[0].value.value.text.should.eql("NamespaceArray");
        dataValues[1].value.value.should.be.instanceOf(Array);
    });

    it("should read Server_NamespaceArray  DataType",function() {
        var readRequest = new read_service.ReadRequest({
            maxAge: 0,
            timestampsToReturn: TimestampsToReturn.Both,
            nodesToRead: [
                {
                    nodeId: server_NamespaceArray_Id,
                    attributeId: AttributeIds.DataType,
                    indexRange: null, /* ???? */
                    dataEncoding: null /* */
                }
            ]
        });
        var dataValues = server.read(readRequest.nodesToRead);
        dataValues.length.should.equal(1);
        dataValues[0].value.dataType.should.eql(DataType.NodeId);
        dataValues[0].value.value.toString().should.eql("ns=0;i=12"); // String
    });

    it("should read Server_NamespaceArray ValueRank",function() {

        var readRequest = new read_service.ReadRequest({
            maxAge: 0,
            timestampsToReturn: TimestampsToReturn.Both,
            nodesToRead: [
                {
                    nodeId: server_NamespaceArray_Id,
                    attributeId: AttributeIds.ValueRank,
                    indexRange: null, /* ???? */
                    dataEncoding: null /* */
                }
            ]
        });

        var dataValues = server.read(readRequest.nodesToRead);
        dataValues.length.should.equal(1);
        dataValues[0].statusCode.should.eql(StatusCodes.Good);
        dataValues[0].value.value.should.eql(VariantArrayType.Array.value);
    });




});