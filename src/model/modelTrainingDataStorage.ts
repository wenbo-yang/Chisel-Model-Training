import { Config } from '../config';
import { StorageDaoFactory } from '../dao/storageDaoFactory';
import { ModelTrainingDataStorageDao } from '../dao/modelTrainingDataStorageDao';
import { IConfig, SavedTrainingData, TrainingData } from '../types/trainerTypes';

export class ModelTrainingDataStorage {
    private config: IConfig;
    private modelTrainingDataStorageDao: ModelTrainingDataStorageDao;
    constructor(config: IConfig, modelTrainingDataStorageDao?: ModelTrainingDataStorageDao) {
        this.config = config;
        this.modelTrainingDataStorageDao = modelTrainingDataStorageDao || StorageDaoFactory.makeTrainingDataStorageDao(this.config);
    }

    public async saveData(trainingData: TrainingData): Promise<boolean> {
        const currentData = await this.modelTrainingDataStorageDao.getCurrentTrainingData(trainingData.model);
        const newData = new Map([...currentData, ...trainingData.data]);

        if (newData.size > currentData.size) {
            await this.modelTrainingDataStorageDao.saveData(trainingData.model, newData);
            return true;
        }

        return false;
    }

    public async getAllTrainingData(): Promise<SavedTrainingData[]> {
        return await this.modelTrainingDataStorageDao.getAllTrainingData();
    }
}
