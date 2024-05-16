import { CharacterTrainingLocalDataStorageDao } from './characterTrainingLocalDataStorageDao';
import { CharacterTrainingDocumentDBStorageDao } from './characterTrainingDocumentDBStorageDao';
import { CharacterTrainingDataStorageDao } from './characterTrainingDataStorageDao';
import { CharacterModelStorageDao } from './characterModelStorageDao';
import { CharacterModelLocalDataStorageDao } from './characterModelLocalDataStorageDao';
import { CharacterModelDocumentDBStorageDao } from './characterModelDocumentDBStorageDao';
import { IConfig } from '../types/trainerTypes';

export class CharacterStorageDaoFactory {
    public static makeTrainingDataStorageDao(config: IConfig): CharacterTrainingDataStorageDao {
        return config.env === 'development' ? new CharacterTrainingLocalDataStorageDao(config) : new CharacterTrainingDocumentDBStorageDao(config);
    }

    public static makeModelStorageDao(config: IConfig): CharacterModelStorageDao {
        return config.env === 'development' ? new CharacterModelLocalDataStorageDao(config) : new CharacterModelDocumentDBStorageDao(config);
    }
}
