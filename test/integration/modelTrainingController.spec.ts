import { integrationTestConfig } from '../unit/testUtils';
import fs from 'fs/promises';
import { COMPRESSIONTYPE, IConfig, ModelTrainingExecution, TRAININGDATATYPE, TRAININGSTATUS, UploadTrainingData } from '../../src/types/trainerTypes';
import { StorageDaoFactory } from '../../src/dao/storageDaoFactory';
import { v4 as uuidv4 } from 'uuid';
import { ModelTrainingController } from '../../src/controller/modelTrainingController';
import { ReadStream } from 'fs';

export class SampleModelTrainingController extends ModelTrainingController {
    constructor(config?: IConfig) {
        super(config || integrationTestConfig);
    }

    public override async uploadTrainingData(uploadTrainingData: UploadTrainingData): Promise<TRAININGSTATUS> {
        return await super.uploadTrainingData(uploadTrainingData);
    }

    public override async startModelTraining(): Promise<ModelTrainingExecution> {
        return super.startModelTraining();
    }

    public async trainSampleModel(): Promise<ModelTrainingExecution> {
        const modelTrainingExecution = await super.startModelTraining();
        await super.trainModel(modelTrainingExecution.executionId);
        return { ...modelTrainingExecution, status: TRAININGSTATUS.FINISHED };
    }

    public override async getModelTrainingExecution(executionId: string): Promise<ModelTrainingExecution> {
        return await super.getModelTrainingExecution(executionId);
    }

    public override async getLatestTrainedModel(): Promise<ReadStream> {
        return await super.getLatestTrainedModel();
    }

    public override async getTrainedModelByExecutionId(executionId: string): Promise<ReadStream> {
        return await super.getTrainedModelByExecutionId(executionId);
    }
}

describe('train and get model', () => {
    const trainingDataUrl = './test/integration/data/test_data_for_character_training_running_man.json';
    let trainingData: any = {};
    const modelStorage = StorageDaoFactory.makeModelStorageDao(integrationTestConfig);
    const trainingDataStroage = StorageDaoFactory.makeTrainingDataStorageDao(integrationTestConfig);

    async function readableToString(readable: ReadStream) {
        let result = '';
        for await (const chunk of readable) {
            result += chunk;
        }
        return result;
    }

    beforeAll(async () => {
        trainingData = JSON.parse((await fs.readFile(trainingDataUrl)).toString());
    });

    describe('training a character', () => {
        describe('POST /trainingData', () => {
            afterEach(async () => {
                await modelStorage.deleteAllTrainingExecutions();
                await trainingDataStroage.deleteAllTrainingData();
            });

            it('should return model training status of created when uploading data', async () => {
                const trainingStatus = await new SampleModelTrainingController().uploadTrainingData({
                    model: '走',
                    dataType: TRAININGDATATYPE.BINARYSTRINGWITHNEWLINE,
                    compression: COMPRESSIONTYPE.PLAIN,
                    data: [trainingData.transformedData.find((s: any) => s.type === 'ORIGINAL').stroke],
                } as UploadTrainingData);

                expect(trainingStatus).toBe(TRAININGSTATUS.CREATED);
            });

            it('should respond with training status created with new data request of the same character', async () => {
                const firstStatus = await new SampleModelTrainingController().uploadTrainingData({
                    model: '走',
                    dataType: TRAININGDATATYPE.BINARYSTRINGWITHNEWLINE,
                    compression: COMPRESSIONTYPE.PLAIN,
                    data: [trainingData.transformedData.find((s: any) => s.type === 'ORIGINAL').stroke],
                } as UploadTrainingData);

                const secondStatus = await new SampleModelTrainingController().uploadTrainingData({
                    model: '走',
                    dataType: TRAININGDATATYPE.BINARYSTRINGWITHNEWLINE,
                    compression: COMPRESSIONTYPE.PLAIN,
                    data: [trainingData.transformedData.find((s: any) => s.type === 'SKELETON').stroke],
                } as UploadTrainingData);

                expect(firstStatus).toEqual(TRAININGSTATUS.CREATED);
                expect(secondStatus).toEqual(TRAININGSTATUS.CREATED);
            });

            it('should respond with no change when sending same data of the same character', async () => {
                const firstStatus = await new SampleModelTrainingController().uploadTrainingData({
                    model: '走',
                    dataType: TRAININGDATATYPE.BINARYSTRINGWITHNEWLINE,
                    compression: COMPRESSIONTYPE.PLAIN,
                    data: [trainingData.transformedData.find((s: any) => s.type === 'ORIGINAL').stroke],
                } as UploadTrainingData);

                const secondStatus = await new SampleModelTrainingController().uploadTrainingData({
                    model: '走',
                    dataType: TRAININGDATATYPE.BINARYSTRINGWITHNEWLINE,
                    compression: COMPRESSIONTYPE.PLAIN,
                    data: [trainingData.transformedData.find((s: any) => s.type === 'ORIGINAL').stroke],
                } as UploadTrainingData);

                expect(firstStatus).toEqual(TRAININGSTATUS.CREATED);
                expect(secondStatus).toEqual(TRAININGSTATUS.NOCHANGE);
            });
        });

        describe('POST /trainModel', () => {
            afterEach(async () => {
                await modelStorage.deleteAllTrainingExecutions();
                await trainingDataStroage.deleteAllTrainingData();
            });

            it('should respond with with 201 created when request train a new model', async () => {
                const modelTrainingController = new SampleModelTrainingController();
                const uploadTrainingDataStatus = await modelTrainingController.uploadTrainingData({
                    model: '走',
                    dataType: TRAININGDATATYPE.BINARYSTRINGWITHNEWLINE,
                    compression: COMPRESSIONTYPE.PLAIN,
                    data: [trainingData.transformedData.find((s: any) => s.type === 'SKELETON').stroke, trainingData.transformedData.find((s: any) => s.type === 'ORIGINAL').stroke],
                } as UploadTrainingData);

                expect(uploadTrainingDataStatus).toEqual(TRAININGSTATUS.CREATED);
                const modelTrainingExecution = await modelTrainingController.startModelTraining();

                expect(modelTrainingExecution.status).toEqual(TRAININGSTATUS.INPROGRESS);
            });
        });

        describe('GET /modelExecution', () => {
            afterEach(async () => {
                await modelStorage.deleteAllTrainingExecutions();
                await trainingDataStroage.deleteAllTrainingData();
            });

            it('should throw error when trying to get a non-existing execution', async () => {
                await expect(new SampleModelTrainingController().getModelTrainingExecution(uuidv4())).rejects.toThrow('Not Found: getModelTrainingExecution: execution is not found');
            });

            it('should respond in progress when getting the status of an existing training execution', async () => {
                const modelTrainingController = new SampleModelTrainingController();
                const uploadTrainingDataStatus = await modelTrainingController.uploadTrainingData({
                    model: '走',
                    dataType: TRAININGDATATYPE.BINARYSTRINGWITHNEWLINE,
                    compression: COMPRESSIONTYPE.PLAIN,
                    data: [trainingData.transformedData.find((s: any) => s.type === 'SKELETON').stroke, trainingData.transformedData.find((s: any) => s.type === 'ORIGINAL').stroke],
                } as UploadTrainingData);

                expect(uploadTrainingDataStatus).toEqual(TRAININGSTATUS.CREATED);

                const modelTraingExecution = await modelTrainingController.startModelTraining();
                expect(modelTraingExecution.status).toEqual(TRAININGSTATUS.INPROGRESS);

                const existingModelTrainingExecution = await modelTrainingController.getModelTrainingExecution(modelTraingExecution.executionId);
                expect(existingModelTrainingExecution.status).toEqual(TRAININGSTATUS.INPROGRESS);
            });

            it('should eventually get a finished execution when waiting for that execution', async () => {
                const modelTrainingController = new SampleModelTrainingController();
                const uploadTrainingDataStatus = await modelTrainingController.uploadTrainingData({
                    model: '走',
                    dataType: TRAININGDATATYPE.BINARYSTRINGWITHNEWLINE,
                    compression: COMPRESSIONTYPE.PLAIN,
                    data: [trainingData.transformedData.find((s: any) => s.type === 'SKELETON').stroke, trainingData.transformedData.find((s: any) => s.type === 'ORIGINAL').stroke],
                } as UploadTrainingData);

                expect(uploadTrainingDataStatus).toEqual(TRAININGSTATUS.CREATED);

                const sampleModelExecution = await modelTrainingController.trainSampleModel();

                expect(sampleModelExecution.status).toEqual(TRAININGSTATUS.FINISHED);
            }, 10000);
        });

        describe('GET /latestModel', () => {
            afterEach(async () => {
                await modelStorage.deleteAllTrainingExecutions();
                await trainingDataStroage.deleteAllTrainingData();
            });

            it('should be able to get latest trained execution', async () => {
                const modelTrainingController = new SampleModelTrainingController();
                const uploadTrainingDataStatus = await modelTrainingController.uploadTrainingData({
                    model: '走',
                    dataType: TRAININGDATATYPE.BINARYSTRINGWITHNEWLINE,
                    compression: COMPRESSIONTYPE.PLAIN,
                    data: [trainingData.transformedData.find((s: any) => s.type === 'SKELETON').stroke, trainingData.transformedData.find((s: any) => s.type === 'ORIGINAL').stroke],
                } as UploadTrainingData);

                expect(uploadTrainingDataStatus).toEqual(TRAININGSTATUS.CREATED);

                const sampleModelExecution = await modelTrainingController.trainSampleModel();

                expect(sampleModelExecution.status).toEqual(TRAININGSTATUS.FINISHED);

                const readStream = await modelTrainingController.getLatestTrainedModel();

                expect(readStream).toBeDefined();

                const result = JSON.parse(await readableToString(readStream));
                expect(result.type).toEqual('NeuralNetwork');
            }, 10000);
        });

        describe('GET /model', () => {
            afterEach(async () => {
                await modelStorage.deleteAllTrainingExecutions();
                await trainingDataStroage.deleteAllTrainingData();
            });

            it('should get model of a finished training by execution_id', async () => {
                const modelTrainingController = new SampleModelTrainingController();
                const uploadTrainingDataStatus = await modelTrainingController.uploadTrainingData({
                    model: '走',
                    dataType: TRAININGDATATYPE.BINARYSTRINGWITHNEWLINE,
                    compression: COMPRESSIONTYPE.PLAIN,
                    data: [trainingData.transformedData.find((s: any) => s.type === 'SKELETON').stroke, trainingData.transformedData.find((s: any) => s.type === 'ORIGINAL').stroke],
                } as UploadTrainingData);

                expect(uploadTrainingDataStatus).toEqual(TRAININGSTATUS.CREATED);

                const sampleModelExecution = await modelTrainingController.trainSampleModel();

                expect(sampleModelExecution.status).toEqual(TRAININGSTATUS.FINISHED);

                const readStream = await modelTrainingController.getTrainedModelByExecutionId(sampleModelExecution.executionId);
                expect(readStream).toBeDefined();

                const result = JSON.parse(await readableToString(readStream));
                expect(result.type).toEqual('NeuralNetwork');
            }, 10000);
        });
    });
});
