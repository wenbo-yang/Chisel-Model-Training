export interface UploadTrainingDataRequestBody {
    character: string;
    dataType: TRAININGDATATYPE;
    compression: COMPRESSIONTYPE;
    data: string[];
}

export interface ModelTrainingExecution {
    executionId: string;
    updated: number;
    status: TRAININGSTATUS;
    modelPath?: any;
}

export type TrainModelResponse = ModelTrainingExecution;

export enum TRAININGSTATUS {
    CREATED = 'CREATED',
    INPROGRESS = 'INPROGRESS',
    FINISHED = 'FINISHED',
    VOIDED = 'VOIDED',
    NOCHANGE = 'NOCHANGE',
}

export enum TRAININGDATATYPE {
    BINARYSTRINGWITHNEWLINE = 'BINARYSTRINGWITHNEWLINE',
    PNG = 'PNG',
    PNGIMAGEPATH = 'PNGIMAGEPATH',
}

export enum COMPRESSIONTYPE {
    GZIP = 'GZIP',
    PLAIN = 'PLAIN',
}

export interface TrainingData {
    character: string;
    data: Map<string, string>;
}

export interface SavedTrainingData {
    character: string;
    data: string[][];
}

export interface ServiceConfig {
    serviceName: string;
    shortName: string;
    storage: Storage[];
}

export interface ServicePorts {
    http: number;
    https: number;
}

export interface Storage {
    env: string;
    url: string;
}

export interface IConfig {
    shortName: string;
    serviceUUID: string;
    serviceName: string;
    trainingDataHeight: number;
    trainingDataWidth: number;
    storageUrl: string;
    env: string;
    servicePorts: ServicePorts;
}

export class NotFoundError extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class DoNotRespondError extends Error {
    constructor(e: Error) {
        super(e.message);
    }
}
