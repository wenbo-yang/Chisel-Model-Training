import { Request, Response } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { Config } from '../config';
import { ModelTrainingModel } from '../model/modelTrainingModel';
import { gzip, ungzip } from 'node-gzip';
import { COMPRESSIONTYPE, IConfig, ModelTrainingExecution, TRAININGDATATYPE, TRAININGSTATUS, UploadTrainingData } from '../types/trainerTypes';
import { ReadStream } from 'fs';

export class ModelTrainingController {
    private config: IConfig;
    private modelTrainingModel: ModelTrainingModel;

    constructor(config?: IConfig, modelTrainingModel?: ModelTrainingModel) {
        this.config = config || new Config();
        this.modelTrainingModel = modelTrainingModel || new ModelTrainingModel(this.config);
    }

    protected async uploadTrainingData(uploadTrainingData: UploadTrainingData): Promise<TRAININGSTATUS> {
        let uncompressedData: string[] = [];
        let compressedData: string[] = [];
        if (uploadTrainingData.dataType === TRAININGDATATYPE.BINARYSTRINGWITHNEWLINE) {
            uncompressedData = await this.getDecompressedData(uploadTrainingData);
            compressedData = await this.getCompressedData(uploadTrainingData);
        } else {
            // need to read and convert data, not implemented yet
            throw new Error('DataType other than BINARYSTRINGWITHNEWLINE are NOT IMPLEMENTED!!!');
        }

        const trainingDataStatus = await this.modelTrainingModel.storeTrainingData(uploadTrainingData.model, uncompressedData, compressedData);

        return trainingDataStatus;
    }

    protected async trainModel(): Promise<ModelTrainingExecution> {
        const modelTrainingExecution = await this.modelTrainingModel.startModelTraining();
        return modelTrainingExecution;
    }

    protected async getModelTrainingExecution(req: Request<{ executionId: string }, any, any, ParsedQs, Record<string, any>>): Promise<ModelTrainingExecution> {
        return await this.modelTrainingModel.getModelTrainingExecution(req.params.executionId);
    }

    protected async getLatestTrainedModel(res: Response<any, Record<string, any>, number>): Promise<ReadStream> {
        const fsReadStream = await this.modelTrainingModel.getLatestTrainedModel();
        return fsReadStream;
    }

    public async getTrainedModelByExecutionId(executionId: string): Promise<ReadStream> {
        const fsReadStream = await this.modelTrainingModel.getTrainedModelByExecutionId(executionId);
        return fsReadStream;
    }

    private async getDecompressedData(uploadTrainingData: UploadTrainingData): Promise<string[]> {
        const data: string[] = [];
        if (uploadTrainingData.compression === COMPRESSIONTYPE.GZIP) {
            for (let i = 0; i < uploadTrainingData.data.length; i++) {
                const ungzipped = await ungzip(Buffer.from(uploadTrainingData.data[i], 'base64'));
                data.push(ungzipped.toString());
            }

            return data;
        }

        return uploadTrainingData.data;
    }

    private async getCompressedData(uploadTrainingData: UploadTrainingData): Promise<string[]> {
        const data: string[] = [];
        if (uploadTrainingData.compression === COMPRESSIONTYPE.PLAIN) {
            for (let i = 0; i < uploadTrainingData.data.length; i++) {
                const gzipped = (await gzip(Buffer.from(uploadTrainingData.data[i]))).toString('base64');
                data.push(gzipped.toString());
            }

            return data;
        }

        return uploadTrainingData.data;
    }
}
