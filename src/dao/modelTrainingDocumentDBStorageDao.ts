import { IConfig } from '../types/trainerTypes';
import { ModelTrainingDataStorageDao } from './modelTrainingDataStorageDao';

export class ModelTrainingDocumentDBStorageDao extends ModelTrainingDataStorageDao {
    private config: IConfig;
    constructor(config: IConfig) {
        super();
        this.config = config;
    }
}
