import { INeuralNetworkJSON } from 'brain.js/dist/neural-network';
import { Config } from '../config';
import { IConfig, ModelTrainingExecution, TRAININGSTATUS, TrainModelResponse } from '../types/trainerTypes';
import { CharacterModelStorageDao } from '../dao/characterModelStorageDao';
import { CharacterStorageDaoFactory } from '../dao/characterStorageDaoFactory';
import { ReadStream } from 'fs';

export class CharacterModelStorage {

    private config: IConfig;
    private characterModelStorageDao: CharacterModelStorageDao;
    constructor(config?: IConfig, characterModelStorageDao?: CharacterModelStorageDao) {
        this.config = config || new Config();
        this.characterModelStorageDao = characterModelStorageDao || CharacterStorageDaoFactory.makeModelStorageDao(this.config);
    }

    public async getCharacterModel(): Promise<INeuralNetworkJSON> {
        throw new Error('getCharacterModel Not Implemented');
    }

    public async createTrainingSession(): Promise<ModelTrainingExecution> {
        return await this.characterModelStorageDao.createTrainingSession();
    }

    public async startModelTraining(): Promise<ModelTrainingExecution> {
        const latestModel = await this.characterModelStorageDao.getLatestModel();

        if (latestModel.status === TRAININGSTATUS.FINISHED) {
            return latestModel;
        }

        return await this.characterModelStorageDao.changeTrainingModelStatus(latestModel.executionId, TRAININGSTATUS.INPROGRESS);
    }

    public async saveModel(executionId: string, modelToBeSaved: INeuralNetworkJSON): Promise<void> {
        await this.characterModelStorageDao.saveModel(executionId, modelToBeSaved);
    }

    public async getModelTrainingExecution(executionId: string): Promise<ModelTrainingExecution> {
        return await this.characterModelStorageDao.getModelTrainingExecution(executionId);
    }

    public async getLatestTrainedModel(): Promise<ReadStream> {
        return await this.characterModelStorageDao.getLatestTrainedModel();
    }

    public async getTrainedModelByExecutionId(executionId: string): Promise<ReadStream> {
        return await this.characterModelStorageDao.getTrainedModelByExecutionId(executionId);
    }
}
