import { ModelStorage } from './modelStorage';
import { IConfig, ModelTrainingExecution, TRAININGSTATUS, TrainingData } from '../types/trainerTypes';
import { Config } from '../config';
import { v5 as uuidv5 } from 'uuid';
import { NeuralNetwork } from 'brain.js';
import { ungzip } from 'node-gzip';
import { INeuralNetworkData, INeuralNetworkDatum, INeuralNetworkJSON } from 'brain.js/dist/neural-network';
import { ReadStream } from 'fs';
import { ModelTrainingDataStorage } from './modelTrainingDataStorage';

export class ModelTrainingModel {
    private config: IConfig;
    private modelStorage: ModelStorage;
    private modelTrainingDataStorage: ModelTrainingDataStorage;

    constructor(config?: IConfig, modelStorage?: ModelStorage, modelTrainingDataStorage?: ModelTrainingDataStorage) {
        this.config = config || new Config();
        this.modelStorage = modelStorage || new ModelStorage(this.config);
        this.modelTrainingDataStorage = modelTrainingDataStorage || new ModelTrainingDataStorage(this.config);
    }

    public async storeTrainingData(model: string, uncompressedData: string[], compressedData: string[]): Promise<TRAININGSTATUS> {
        // ensure data size //
        // will implement later
        if (uncompressedData.find((d) => d.split('\n').length !== this.config.trainingDataHeight || d.split('\n')[0].length !== this.config.trainingDataWidth)) {
            throw new Error('Data size incompatible, resizing will be implemented later.');
        }

        const data: Map<string, string> = new Map();

        for (let i = 0; i < compressedData.length; i++) {
            const key = uuidv5(compressedData[i], this.config.modelUUID);
            if (!data.has(key)) {
                data.set(key, compressedData[i]);
            }
        }

        const trainingData: TrainingData = {
            model,
            data,
        };

        const newDataSaved = await this.modelTrainingDataStorage.saveData(trainingData);

        if (newDataSaved) {
            await this.modelStorage.createTrainingSession();
            return TRAININGSTATUS.CREATED;
        }

        return TRAININGSTATUS.NOCHANGE;
    }

    public async startModelTraining(): Promise<ModelTrainingExecution> {
        return await this.modelStorage.startModelTraining();
    }

    public async trainModel(executionId: string): Promise<void> {
        const savedTrainingData = await this.modelTrainingDataStorage.getAllTrainingData();

        const net = new NeuralNetwork();

        const trainingData: Array<INeuralNetworkDatum<INeuralNetworkData, INeuralNetworkData>> = [];

        for (let i = 0; i < savedTrainingData.length; i++) {
            for (let j = 0; j < savedTrainingData[i].data.length; j++) {
                const processedData = await this.processSavedData(savedTrainingData[i].data[j][1]); // note data[j][0] is the key

                let output: any = {};
                output[savedTrainingData[i].model] = 1;
                let input: INeuralNetworkData = processedData;
                trainingData.push({ input, output });
            }
        }

        await net.trainAsync(trainingData);
        const modelToBeSaved: INeuralNetworkJSON = net.toJSON();
        await this.modelStorage.saveModel(executionId, modelToBeSaved);
    }

    public async getModelTrainingExecution(executionId: string): Promise<ModelTrainingExecution> {
        return await this.modelStorage.getModelTrainingExecution(executionId);
    }

    public async getLatestTrainedModel(): Promise<ReadStream> {
        return await this.modelStorage.getLatestTrainedModel();
    }

    public async getTrainedModelByExecutionId(executionId: string): Promise<ReadStream> {
        return await this.modelStorage.getTrainedModelByExecutionId(executionId);
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
