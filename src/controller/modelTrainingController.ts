import { Request, Response } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { Config } from '../config';
import { ModelTrainingModel } from '../model/modelTrainingModel';
import { gzip, ungzip } from 'node-gzip';
import { COMPRESSIONTYPE, DoNotRespondError, IConfig, ModelTrainingExecution, NotFoundError, TRAININGDATATYPE, TRAININGSTATUS, TrainModelResponse, UploadTrainingDataRequestBody } from '../types/trainerTypes';
import { HttpStatusCode } from 'axios';

export class ModelTrainingController {

    private config: IConfig;
    private modelTrainingModel: ModelTrainingModel;

    constructor(config?: IConfig, modelTrainingModel?: ModelTrainingModel) {
        this.config = config || new Config();
        this.modelTrainingModel = modelTrainingModel || new ModelTrainingModel(this.config);
    }

    public async uploadTrainingData(req: Request<{}, any, any, ParsedQs, Record<string, any>>): Promise<HttpStatusCode> {
        const requestBody = req.body as UploadTrainingDataRequestBody;
        let uncompressedData: string[] = [];
        let compressedData: string[] = [];
        if (requestBody.dataType === TRAININGDATATYPE.BINARYSTRINGWITHNEWLINE) {
            uncompressedData = await this.getDecompressedData(requestBody);
            compressedData = await this.getCompressedData(requestBody);
        } else {
            // need to read and convert data, not implemented yet
            throw new Error('DataType other than BINARYSTRINGWITHNEWLINE are NOT IMPLEMENTED!!!');
        }

        const trainingDataStatus = await this.modelTrainingModel.storeTrainingData(requestBody.model, uncompressedData, compressedData);

        let responseCode = HttpStatusCode.Ok;
        if (trainingDataStatus === TRAININGSTATUS.CREATED) {
            responseCode = HttpStatusCode.Created;
        } else if (trainingDataStatus === TRAININGSTATUS.NOCHANGE) {
            responseCode = HttpStatusCode.AlreadyReported;
        }

        return responseCode;
    }

    public async trainModel(res: Response<any, Record<string, any>, number>): Promise<void> {
        const modelTrainingExecution = await this.modelTrainingModel.startModelTraining();
        if (modelTrainingExecution.status === TRAININGSTATUS.FINISHED) {
            res.status(HttpStatusCode.AlreadyReported).send(modelTrainingExecution);
        } else {
            res.status(HttpStatusCode.Created).send(modelTrainingExecution);
        }

        try {
            await this.modelTrainingModel.trainModel(modelTrainingExecution.executionId);
        } catch (e) {
            throw new DoNotRespondError(e as Error);
        }
    }

    public async getModelTrainingExecution(req: Request<{ executionId: string }, any, any, ParsedQs, Record<string, any>>): Promise<ModelTrainingExecution> {
        return await this.modelTrainingModel.getModelTrainingExecution(req.params.executionId);
    }

    public async getLatestTrainedModel(res: Response<any, Record<string, any>, number>): Promise<void> {
        try {
            const fsReadStream = await this.modelTrainingModel.getLatestTrainedModel();
            fsReadStream.pipe(res);
        }
        catch (e) {
            if (e instanceof NotFoundError) {
                throw e;
            }
            else {
                throw new DoNotRespondError(e as Error);
            }
        }
    }

    public async getTrainedModelByExecutionId(req: Request<{ executionId: string; }, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>, number>): Promise<void> {
        try {
            const executionId = req.params.executionId

            const fsReadStream = await this.modelTrainingModel.getTrainedModelByExecutionId(executionId);
            fsReadStream.pipe(res);
        }
        catch (e) {
            if (e instanceof NotFoundError) {
                throw e;
            }
            else {
                throw new DoNotRespondError(e as Error);
            }
        }
    }

    private async getDecompressedData(requestBody: UploadTrainingDataRequestBody): Promise<string[]> {
        const data: string[] = [];
        if (requestBody.compression === COMPRESSIONTYPE.GZIP) {
            for (let i = 0; i < requestBody.data.length; i++) {
                const ungzipped = await ungzip(Buffer.from(requestBody.data[i], 'base64'));
                data.push(ungzipped.toString());
            }

            return data;
        }

        return requestBody.data;
    }

    private async getCompressedData(requestBody: UploadTrainingDataRequestBody): Promise<string[]> {
        const data: string[] = [];
        if (requestBody.compression === COMPRESSIONTYPE.PLAIN) {
            for (let i = 0; i < requestBody.data.length; i++) {
                const gzipped = (await gzip(Buffer.from(requestBody.data[i]))).toString('base64');
                data.push(gzipped.toString());
            }

            return data;
        }

        return requestBody.data;
    }
}
