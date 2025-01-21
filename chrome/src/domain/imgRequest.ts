import IBaseRequest from './IBaseRequest';
export default interface ImgRequest extends IBaseRequest {
    url: string;
    filename: string;
    folderName: string | undefined;
}
