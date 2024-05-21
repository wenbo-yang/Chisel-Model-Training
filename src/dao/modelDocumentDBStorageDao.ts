import { Config } from '../config';
import { IConfig } from '../types/trainerTypes';
import { ModelStorageDao } from './modelStorageDao';

export class ModelDocumentDBStorageDao extends ModelStorageDao {
    private config: IConfig;
    constructor(config: IConfig) {
        super();
        this.config = config;
    }
}
