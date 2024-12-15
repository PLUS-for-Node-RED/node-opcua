// ----- this file has been automatically generated - do not edit
import { UAObject } from "node-opcua-address-space-base"
import { DataType } from "node-opcua-variant"
import { LocalizedText, QualifiedName } from "node-opcua-data-model"
import { UAString } from "node-opcua-basic-types"
import { DTArgument } from "node-opcua-nodeset-ua/source/dt_argument"
import { UAFolder } from "node-opcua-nodeset-ua/source/ua_folder"
import { UAFunctionalGroup } from "node-opcua-nodeset-di/source/ua_functional_group"
import { UAJoiningSystemAssetMethodSet } from "./ua_joining_system_asset_method_set"
import { UAJoiningSystemIdentification } from "./ua_joining_system_identification"
import { UAJoiningSystemResultManagement } from "./ua_joining_system_result_management"
import { UAJoiningProcessManagement } from "./ua_joining_process_management"
import { UAJointManagement } from "./ua_joint_management"
export interface UAJoiningSystem_assetManagement extends UAFunctionalGroup { // Object
      /**
       * assets
       * The Assets Object is an instance of FolderType to
       * group set of assets available in the given system.
       */
      assets: UAFolder;
      /**
       * methodSet
       * The MethodSet Object is an instance of
       * JoiningSystemAssetMethodSetType which provides
       * set of methods for various assets in a joining
       * system.
       */
      methodSet?: UAJoiningSystemAssetMethodSet;
}
export interface UAJoiningSystem_machineryBuildingBlocks extends UAFolder { // Object
      /**
       * identification
       * The Identification Object provides identification
       * parameters of the joining system.
       */
      identification: UAJoiningSystemIdentification;
      /**
       * resultManagement
       * The ResultManagement Object is an instance of
       * JoiningSystemResultManagementType which provides
       * mechanisms to access results generated by the
       * joining system.
       */
      resultManagement?: UAJoiningSystemResultManagement;
}
/**
 * The JoiningSystemType provides the overview of
 * the information exposed from a given joining
 * system.
 *
 * |                |                                                            |
 * |----------------|------------------------------------------------------------|
 * |namespace       |http://opcfoundation.org/UA/IJT/Base/                       |
 * |nodeClass       |ObjectType                                                  |
 * |typedDefinition |JoiningSystemType i=1005                                    |
 * |isAbstract      |false                                                       |
 */
export interface UAJoiningSystem_Base {
    /**
     * assetManagement
     * The AssetManagement Object is an instance of
     * FolderType to group assets and related objects in
     * the joining system.
     */
    assetManagement?: UAJoiningSystem_assetManagement;
    /**
     * identification
     * The Identification Object provides identification
     * parameters of the joining system.
     */
    identification: UAJoiningSystemIdentification;
    /**
     * joiningProcessManagement
     * The JoiningProcessManagement Object is an
     * instance of JoiningProcessManagementType which
     * provides mechanisms to manage joining processes
     * in the joining system.
     */
    joiningProcessManagement?: UAJoiningProcessManagement;
    /**
     * jointManagement
     * The JointManagement Object is an instance of
     * JointManagementType which provides mechanisms to
     * manage joint and associated information.
     */
    jointManagement?: UAJointManagement;
    machineryBuildingBlocks?: UAJoiningSystem_machineryBuildingBlocks;
    /**
     * resultManagement
     * The ResultManagement Object is an instance of
     * JoiningSystemResultManagementType which provides
     * mechanisms to access results generated by the
     * joining system.
     */
    resultManagement?: UAJoiningSystemResultManagement;
}
export interface UAJoiningSystem extends UAObject, UAJoiningSystem_Base {
}