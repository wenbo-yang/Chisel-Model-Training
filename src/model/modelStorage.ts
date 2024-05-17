import { INeuralNetworkJSON } from 'brain.js/dist/neural-network';
import { Config } from '../config';
import { IConfig, ModelTrainingExecution, TRAININGSTATUS } from '../types/trainerTypes';
import { ModelStorageDao } from '../dao/modelStorageDao';
import { StorageDaoFactory } from '../dao/storageDaoFactory';
import { ReadStream } from 'fs';

export class ModelStorage {
    private config: IConfig;
    private modelStorageDao: ModelStorageDao;
    constructor(config?: IConfig, modelStorageDao?: ModelStorageDao) {
        this.config = config || new Config();
        this.modelStorageDao = modelStorageDao || StorageDaoFactory.makeModelStorageDao(this.config);
    }

    public async getCharacterModel(): Promise<INeuralNetworkJSON> {
        throw new Error('getCharacterModel Not Implemented');
    }

    public async createTrainingSession(): Promise<ModelTrainingExecution> {
        return await this.modelStorageDao.createTrainingSession();
    }

    public async startModelTraining(): Promise<ModelTrainingExecution> {
        const latestModel = await this.modelStorageDao.getLatestModel();

        if (latestModel.status === TRAININGSTATUS.FINISHED) {
            return latestModel;
        }

        return await this.modelStorageDao.changeTrainingModelStatus(latestModel.executionId, TRAININGSTATUS.INPROGRESS);
    }

    public async saveModel(executionId: string, modelToBeSaved: INeuralNetworkJSON): Promise<void> {
        await this.modelStorageDao.saveModel(executionId, modelToBeSaved);
    }

    public async getModelTrainingExecution(executionId: string): Promise<ModelTrainingExecution> {
        return await this.modelStorageDao.getModelTrainingExecution(executionId);
    }

    public async getLatestTrainedModel(): Promise<ReadStream> {
        return await this.modelStorageDao.getLatestTrainedModel();
    }

    public async getTrainedModelByExecutionId(executionId: string): Promise<ReadStream> {
        return await this.modelStorageDao.getTrainedModelByExecutionId(executionId);
    }
}
