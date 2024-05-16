import { INeuralNetworkJSON } from 'brain.js/dist/neural-network';
import { ModelTrainingExecution, TRAININGSTATUS } from '../types/trainerTypes';
import { ReadStream } from 'fs';

export abstract class CharacterModelStorageDao {


    constructor() {}

    public async getLatestModel(): Promise<ModelTrainingExecution> {
        throw new Error('getLastestModel Abstract class');
    }

    public async getLatestModelByStatus(status: TRAININGSTATUS): Promise<ModelTrainingExecution | undefined> {
        throw new Error('getLastestModel Abstract class');
    }

    public async createTrainingSession(): Promise<ModelTrainingExecution> {
        throw new Error('initiateTraining Abstract class');
    }

    public async deleteAllTrainingExecutions(): Promise<void> {
        throw new Error('deleteAllTrainingExecutions Abstract class');
    }

    public async deleteSelectedTrainingExecution(executionId: string): Promise<void> {
        throw new Error('deleteTrainingExecutions Abstract class');
    }

    public async changeTrainingModelStatus(executionId: string, INPROGRESS: TRAININGSTATUS): Promise<ModelTrainingExecution> {
        throw new Error('changeTrainingModelStatus Abstract class');
    }

    public async saveModel(executionId: string, modelToBeSaved: INeuralNetworkJSON): Promise<void> {
        throw new Error('saveModel Abstract class');
    }

    public async getModelTrainingExecution(executionId: string): Promise<ModelTrainingExecution> {
        throw new Error('getModelTrainingExecution Abstract class');
    }

    public async getLatestTrainedModel(): Promise<ReadStream> {
        throw new Error('getLatestTrainedModel Abstract class');
    }

    public async getTrainedModelByExecutionId(executionId: string): Promise<ReadStream> {
        throw new Error('getLatestTrainedModel Abstract class');
    }
}
