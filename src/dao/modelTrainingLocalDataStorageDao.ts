import { Config } from '../config';
import { ModelTrainingDataStorageDao } from './modelTrainingDataStorageDao';
import { v5 as uuidv5 } from 'uuid';
import fs from 'fs/promises';
import * as fsSync from 'fs';
import { IConfig, SavedTrainingData } from '../types/trainerTypes';
import { deleteAllFilesInFolder } from './daoUtils';
import path from 'path';

export class ModelTrainingLocalDataStorageDao extends ModelTrainingDataStorageDao {
    private config: IConfig;
    constructor(config: IConfig) {
        super();
        this.config = config;
    }

    public override async getCurrentTrainingData(character: string): Promise<Map<string, string>> {
        const uuid = uuidv5(character, this.config.modelUUID);
        const filePath = this.config.storageUrl + '/data/' + uuid + '.json';

        if (!fsSync.existsSync(filePath)) {
            return new Map();
        }

        const fileContent = (await fs.readFile(filePath)).toString();
        const trainingData: any = JSON.parse(fileContent) as SavedTrainingData;

        return new Map(trainingData.data);
    }

    public override async saveData(model: string, newData: Map<string, string>): Promise<void> {
        const uuid = uuidv5(model, this.config.modelUUID);
        const filePath = this.config.storageUrl + '/data/' + uuid + '.json';

        if (!fsSync.existsSync(this.config.storageUrl + '/data')) {
            await fs.mkdir(this.config.storageUrl + '/data', { recursive: true });
        }

        const output = JSON.stringify({ model, data: Array.from(newData.entries()) } as SavedTrainingData);

        await fs.writeFile(filePath, output);
    }

    public override async getAllTrainingData(): Promise<SavedTrainingData[]> {
        const folderPath = this.config.storageUrl + '/data';
        const savedTrainingData: SavedTrainingData[] = [];

        if (fsSync.existsSync(folderPath)) {
            const files = await fs.readdir(folderPath);

            for (let file of files) {
                const filePath = path.join(folderPath, file);
                savedTrainingData.push(JSON.parse((await fs.readFile(filePath)).toString()) as SavedTrainingData);
            }
        }

        return savedTrainingData;
    }

    public override async deleteSelectedModelTrainingData(character: string): Promise<void> {
        const uuid = uuidv5(character, this.config.modelUUID);
        const filePath = this.config.storageUrl + '/data/' + uuid + '.json';

        if (fsSync.existsSync(filePath)) {
            await fs.unlink(filePath);
        }
    }

    public override async deleteAllTrainingData(): Promise<void> {
        const folderPath = this.config.storageUrl + '/data';
        await deleteAllFilesInFolder(folderPath);
    }
}
