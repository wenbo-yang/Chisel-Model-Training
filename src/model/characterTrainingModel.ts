import { CharacterModelStorage } from './characterModelStorage';
import { CharacterTrainingDataStorage } from './characterTrainingDataStorage';
import { IConfig, ModelTrainingExecution, TRAININGSTATUS, TrainingData } from '../types/trainerTypes';
import { Config } from '../config';
import { v5 as uuidv5 } from 'uuid';
import { NeuralNetwork } from 'brain.js';
import { ungzip } from 'node-gzip';
import { INeuralNetworkData, INeuralNetworkDatum, INeuralNetworkJSON } from 'brain.js/dist/neural-network';
import { ReadStream } from 'fs';

export class CharacterTrainingModel {
    private config: IConfig;
    private characterModelStorage: CharacterModelStorage;
    private characterTrainingDataStorage: CharacterTrainingDataStorage;

    constructor(config?: IConfig, characterModelStorage?: CharacterModelStorage, characterTrainingDataStorage?: CharacterTrainingDataStorage) {
        this.config = config || new Config();
        this.characterModelStorage = characterModelStorage || new CharacterModelStorage(this.config);
        this.characterTrainingDataStorage = characterTrainingDataStorage || new CharacterTrainingDataStorage(this.config);
    }

    public async storeTrainingData(character: string, uncompressedData: string[], compressedData: string[]): Promise<TRAININGSTATUS> {
        // ensure data size //
        // will implement later
        if (uncompressedData.find((d) => d.split('\n').length !== this.config.trainingDataHeight || d.split('\n')[0].length !== this.config.trainingDataWidth)) {
            throw new Error('Data size incompatible, resizing will be implemented later.');
        }

        const data: Map<string, string> = new Map();

        for (let i = 0; i < compressedData.length; i++) {
            const key = uuidv5(compressedData[i], this.config.serviceUUID);
            if (!data.has(key)) {
                data.set(key, compressedData[i]);
            }
        }

        const trainingData: TrainingData = {
            character,
            data,
        };

        const newDataSaved = await this.characterTrainingDataStorage.saveData(trainingData);

        if (newDataSaved) {
            await this.characterModelStorage.createTrainingSession();
            return TRAININGSTATUS.CREATED;
        }

        return TRAININGSTATUS.NOCHANGE;
    }

    public async startModelTraining(): Promise<ModelTrainingExecution> {
        return await this.characterModelStorage.startModelTraining();
    }

    public async trainModel(executionId: string): Promise<void> {
        const savedTrainingData = await this.characterTrainingDataStorage.getAllTrainingData();

        const net = new NeuralNetwork();

        const trainingData: Array<INeuralNetworkDatum<INeuralNetworkData, INeuralNetworkData>> = [];

        for (let i = 0; i < savedTrainingData.length; i++) {
            for (let j = 0; j < savedTrainingData[i].data.length; j++) {
                const processedData = await this.processSavedData(savedTrainingData[i].data[j][1]); // note data[j][0] is the key

                let output: any = {};
                output[savedTrainingData[i].character] = 1;
                let input: INeuralNetworkData = processedData;
                trainingData.push({ input, output });
            }
        }

        await net.trainAsync(trainingData);
        const modelToBeSaved: INeuralNetworkJSON = net.toJSON();
        await this.characterModelStorage.saveModel(executionId, modelToBeSaved);
    }

    public async getModelTrainingExecution(executionId: string): Promise<ModelTrainingExecution> {
        return await this.characterModelStorage.getModelTrainingExecution(executionId);
    }

    public async getLatestTrainedModel(): Promise<ReadStream> {
        return await this.characterModelStorage.getLatestTrainedModel();
    }

    public async getTrainedModelByExecutionId(executionId: string): Promise<ReadStream> {
        return await this.characterModelStorage.getTrainedModelByExecutionId(executionId);
    }

    private async processSavedData(data: string): Promise<number[]> {
        const zeroOneString = (await ungzip(Buffer.from(data, 'base64'))).toString();

        const zeroOneArray: number[] = [];

        for (let i = 0; i < zeroOneString.length; i++) {
            const c = zeroOneString.charAt(i);
            if (c === '1') {
                zeroOneArray.push(1);
            } else if (c === '0') {
                zeroOneArray.push(0);
            }
        }

        return zeroOneArray;
    }
}
