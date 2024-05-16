import { Config } from '../config';
import { IConfig } from '../types/trainerTypes';
import { CharacterModelStorageDao } from './characterModelStorageDao';

export class CharacterModelDocumentDBStorageDao extends CharacterModelStorageDao {
    private config: IConfig;
    constructor(config?: IConfig) {
        super();
        this.config = config || new Config();
    }
}
