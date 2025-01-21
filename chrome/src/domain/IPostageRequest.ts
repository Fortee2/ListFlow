import IBaseRequest from "./IBaseRequest";

export default interface IPostageRequest extends IBaseRequest {
    majorElement?: string;
    minorElement?: string;
    packageLength?: string;
    packageWidth?: string;
    packageHeight?: string;
}
