import { Config } from '../config';
import { IConfig } from '../types/trainerTypes';
import { CharacterTrainingDataStorageDao } from './characterTrainingDataStorageDao';

export class CharacterTrainingDocumentDBStorageDao extends CharacterTrainingDataStorageDao {
    private config: IConfig;
    constructor(config?: IConfig) {
        super();
        this.config = config || new Config();
    }
}
