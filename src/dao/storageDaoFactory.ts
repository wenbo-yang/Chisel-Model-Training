import { ModelTrainingLocalDataStorageDao } from './modelTrainingLocalDataStorageDao';
import { ModelTrainingDocumentDBStorageDao } from './modelTrainingDocumentDBStorageDao';
import { ModelTrainingDataStorageDao } from './modelTrainingDataStorageDao';
import { ModelStorageDao } from './modelStorageDao';
import { ModelLocalDataStorageDao } from './modelLocalDataStorageDao';
import { ModelDocumentDBStorageDao } from './modelDocumentDBStorageDao';
import { IConfig } from '../types/trainerTypes';

export class StorageDaoFactory {
    public static makeTrainingDataStorageDao(config: IConfig): ModelTrainingDataStorageDao {
        return config.env === 'development' ? new ModelTrainingLocalDataStorageDao(config) : new ModelTrainingDocumentDBStorageDao(config);
    }

    public static makeModelStorageDao(config: IConfig): ModelStorageDao {
        return config.env === 'development' ? new ModelLocalDataStorageDao(config) : new ModelDocumentDBStorageDao(config);
    }
}
