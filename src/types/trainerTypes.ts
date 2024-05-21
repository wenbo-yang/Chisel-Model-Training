export interface UploadTrainingData {
    model: string;
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
    model: string;
    data: Map<string, string>;
}

export interface SavedTrainingData {
    model: string;
    data: string[][];
}

export interface Storage {
    env: string;
    url: string;
}

export interface IConfig {
    modelUUID: string;
    trainingDataHeight: number;
    trainingDataWidth: number;
    storageUrl: string;
    env: string;
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
