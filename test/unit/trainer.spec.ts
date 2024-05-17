import { integrationTestConfig } from './utils';
import axios, { HttpStatusCode } from 'axios';
import https from 'https';
import fs from 'fs/promises';
import { COMPRESSIONTYPE, ModelTrainingExecution, TRAININGDATATYPE, TRAININGSTATUS } from '../../src/types/trainerTypes';
import { StorageDaoFactory } from '../../src/dao/storageDaoFactory';
import { v4 as uuidv4 } from 'uuid';

const axiosClient = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false,
    }),
});

const httpsUrl = ''

describe('skeletonize request', () => {
    const trainingDataUrl = './test/integration/data/test_data_for_character_training_running_man.json';
    let trainingData: any = {};
    const modelStorage = StorageDaoFactory.makeModelStorageDao(integrationTestConfig);
    const trainingDataStroage = StorageDaoFactory.makeTrainingDataStorageDao(integrationTestConfig);

    beforeAll(async () => {
        trainingData = JSON.parse((await fs.readFile(trainingDataUrl)).toString());
    });

    describe('GET /healthCheck', () => {
        it('should respond with 200', async () => {
            const response = await axiosClient.get(httpsUrl + '/healthCheck');

            expect(response.status).toBe(200);
            expect(response.data).toBe('i am healthy!!!');
        });
    });

    describe('training a character', () => {
        describe('POST /trainingData', () => {
            const uploadTrainingDataUrl = httpsUrl + '/trainingData';

            afterEach(() => {
                modelStorage.deleteAllTrainingExecutions();
                trainingDataStroage.deleteAllTrainingData();
            });

            it('should respond with 201 created with new train request', async () => {
                const response = await axiosClient.post(uploadTrainingDataUrl, {
                    model: '走',
                    dataType: TRAININGDATATYPE.BINARYSTRINGWITHNEWLINE,
                    compression: COMPRESSIONTYPE.PLAIN,
                    data: [trainingData.transformedData.find((s: any) => s.type === 'ORIGINAL').stroke],
                });

                expect(response.status).toEqual(HttpStatusCode.Created);
            });

            it('should respond with 201 created with new data request of the same character', async () => {
                const firstResponse = await axiosClient.post(uploadTrainingDataUrl, {
                    model: '走',
                    dataType: TRAININGDATATYPE.BINARYSTRINGWITHNEWLINE,
                    compression: COMPRESSIONTYPE.PLAIN,
                    data: [trainingData.transformedData.find((s: any) => s.type === 'ORIGINAL').stroke],
                });

                const secondResponse = await axiosClient.post(uploadTrainingDataUrl, {
                    character: '走',
                    dataType: TRAININGDATATYPE.BINARYSTRINGWITHNEWLINE,
                    compression: COMPRESSIONTYPE.PLAIN,
                    data: [trainingData.transformedData.find((s: any) => s.type === 'SKELETON').stroke],
                });

                expect(firstResponse.status).toEqual(HttpStatusCode.Created);
                expect(secondResponse.status).toEqual(HttpStatusCode.Created);
            });

            it('should respond with 208 AlreadyReported when sending same data of the same character', async () => {
                const firstResponse = await axiosClient.post(uploadTrainingDataUrl, {
                    model: '走',
                    dataType: TRAININGDATATYPE.BINARYSTRINGWITHNEWLINE,
                    compression: COMPRESSIONTYPE.PLAIN,
                    data: [trainingData.transformedData.find((s: any) => s.type === 'ORIGINAL').stroke],
                });

                const secondResponse = await axiosClient.post(uploadTrainingDataUrl, {
                    character: '走',
                    dataType: TRAININGDATATYPE.BINARYSTRINGWITHNEWLINE,
                    compression: COMPRESSIONTYPE.PLAIN,
                    data: [trainingData.transformedData.find((s: any) => s.type === 'ORIGINAL').stroke],
                });

                expect(firstResponse.status).toEqual(HttpStatusCode.Created);
                expect(secondResponse.status).toEqual(HttpStatusCode.AlreadyReported);
            });
        });

        describe('POST /trainModel', () => {
            const uploadTrainingDataUrl = httpsUrl + '/trainingData';
            const trainModelUrl = httpsUrl + '/trainModel';

            afterEach(async () => {
                await modelStorage.deleteAllTrainingExecutions();
                await trainingDataStroage.deleteAllTrainingData();
            });

            it('should respond with with 201 created when request train a new model', async () => {
                const uploadTrainingDataResponse = await axiosClient.post(uploadTrainingDataUrl, {
                    model: '走',
                    dataType: TRAININGDATATYPE.BINARYSTRINGWITHNEWLINE,
                    compression: COMPRESSIONTYPE.PLAIN,
                    data: [trainingData.transformedData.find((s: any) => s.type === 'SKELETON').stroke, trainingData.transformedData.find((s: any) => s.type === 'ORIGINAL').stroke],
                });

                expect(uploadTrainingDataResponse.status).toEqual(HttpStatusCode.Created);
                const trainModelResponse = await axiosClient.post(trainModelUrl, {});

                expect(trainModelResponse.status).toEqual(HttpStatusCode.Created);
                expect((trainModelResponse.data as ModelTrainingExecution).status).toEqual(TRAININGSTATUS.INPROGRESS);
            });
        });

        describe('GET /modelExecution', () => {
            const uploadTrainingDataUrl = httpsUrl + '/trainingData';
            const trainModelUrl = httpsUrl + '/trainModel';
            const getModelTrainingExecutionUrl = httpsUrl + '/modelExecution';

            afterEach(async () => {
                await modelStorage.deleteAllTrainingExecutions();
                await trainingDataStroage.deleteAllTrainingData();
            });

            it(' should respond with 404 not found when trying to fiind an non-existing training execution', async () => {
                const notExistingExecutionUrl = getModelTrainingExecutionUrl + '/' + uuidv4();
                await expect(axiosClient.get(notExistingExecutionUrl)).rejects.toThrowError('Request failed with status code 404');
            });

            it('should respond with with 200 created when getting the status of an existing training execution', async () => {
                const uploadTrainingDataResponse = await axiosClient.post(uploadTrainingDataUrl, {
                    model: '走',
                    dataType: TRAININGDATATYPE.BINARYSTRINGWITHNEWLINE,
                    compression: COMPRESSIONTYPE.PLAIN,
                    data: [trainingData.transformedData.find((s: any) => s.type === 'SKELETON').stroke, trainingData.transformedData.find((s: any) => s.type === 'ORIGINAL').stroke],
                });

                expect(uploadTrainingDataResponse.status).toEqual(HttpStatusCode.Created);

                const trainModelResponse = await axiosClient.post(trainModelUrl, {});
                expect(trainModelResponse.status).toEqual(HttpStatusCode.Created);
                expect((trainModelResponse.data as ModelTrainingExecution).status).toEqual(TRAININGSTATUS.INPROGRESS);

                const executionUrl = getModelTrainingExecutionUrl + '/' + (trainModelResponse.data as ModelTrainingExecution).executionId;
                const getModelTrainingExecutionResponse = await axiosClient.get(executionUrl);

                expect(getModelTrainingExecutionResponse.status).toEqual(HttpStatusCode.Ok);
                expect((getModelTrainingExecutionResponse.data as ModelTrainingExecution).status).toEqual(TRAININGSTATUS.INPROGRESS);
            });

            it('should respond with with 200 when getting the status of a finished execution', async () => {
                const uploadTrainingDataResponse = await axiosClient.post(uploadTrainingDataUrl, {
                    model: '走',
                    dataType: TRAININGDATATYPE.BINARYSTRINGWITHNEWLINE,
                    compression: COMPRESSIONTYPE.PLAIN,
                    data: [trainingData.transformedData.find((s: any) => s.type === 'SKELETON').stroke, trainingData.transformedData.find((s: any) => s.type === 'ORIGINAL').stroke],
                });

                expect(uploadTrainingDataResponse.status).toEqual(HttpStatusCode.Created);

                const trainModelResponse = await axiosClient.post(trainModelUrl, {});
                expect(trainModelResponse.status).toEqual(HttpStatusCode.Created);
                expect((trainModelResponse.data as ModelTrainingExecution).status).toEqual(TRAININGSTATUS.INPROGRESS);

                const executionUrl = getModelTrainingExecutionUrl + '/' + (trainModelResponse.data as ModelTrainingExecution).executionId;
                let getModelTrainingExecutionResponse: any;

                do {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    getModelTrainingExecutionResponse = await axiosClient.get(executionUrl);
                } while ((getModelTrainingExecutionResponse.data as ModelTrainingExecution).status === TRAININGSTATUS.INPROGRESS);

                expect((getModelTrainingExecutionResponse.data as ModelTrainingExecution).status).toEqual(TRAININGSTATUS.FINISHED);
                expect((getModelTrainingExecutionResponse.data as ModelTrainingExecution).modelPath).toBeDefined();
            }, 10000);
        });

        describe('GET /latestModel', () => {
            const uploadTrainingDataUrl = httpsUrl + '/trainingData';
            const trainModelUrl = httpsUrl + '/trainModel';
            const getModelTrainingExecutionUrl = httpsUrl + '/modelExecution';
            const getLatestModel = httpsUrl + '/latestModel';

            afterEach(async () => {
                await modelStorage.deleteAllTrainingExecutions();
                await trainingDataStroage.deleteAllTrainingData();
            });

            it('should respond with with 200 when getting the model of the latest trained execution', async () => {
                const uploadTrainingDataResponse = await axiosClient.post(uploadTrainingDataUrl, {
                    model: '走',
                    dataType: TRAININGDATATYPE.BINARYSTRINGWITHNEWLINE,
                    compression: COMPRESSIONTYPE.PLAIN,
                    data: [trainingData.transformedData.find((s: any) => s.type === 'SKELETON').stroke, trainingData.transformedData.find((s: any) => s.type === 'ORIGINAL').stroke],
                });

                expect(uploadTrainingDataResponse.status).toEqual(HttpStatusCode.Created);

                const trainModelResponse = await axiosClient.post(trainModelUrl, {});
                expect(trainModelResponse.status).toEqual(HttpStatusCode.Created);
                expect((trainModelResponse.data as ModelTrainingExecution).status).toEqual(TRAININGSTATUS.INPROGRESS);

                const executionUrl = getModelTrainingExecutionUrl + '/' + (trainModelResponse.data as ModelTrainingExecution).executionId;
                let getModelTrainingExecutionResponse: any;

                do {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    getModelTrainingExecutionResponse = await axiosClient.get(executionUrl);
                } while ((getModelTrainingExecutionResponse.data as ModelTrainingExecution).status === TRAININGSTATUS.INPROGRESS);

                expect((getModelTrainingExecutionResponse.data as ModelTrainingExecution).status).toEqual(TRAININGSTATUS.FINISHED);
                expect((getModelTrainingExecutionResponse.data as ModelTrainingExecution).modelPath).toBeDefined();

                const latestModel =  await axiosClient.get(getLatestModel);
                
                expect(latestModel.data).toBeDefined()
                expect(latestModel.data.type).toEqual('NeuralNetwork')
            }, 10000);
        });

        describe('GET /model', () => {
            const uploadTrainingDataUrl = httpsUrl + '/trainingData';
            const trainModelUrl = httpsUrl + '/trainModel';
            const getModelTrainingExecutionUrl = httpsUrl + '/modelExecution';
            const getModelByExeutionId = httpsUrl + '/model';

            afterEach(async () => {
                await modelStorage.deleteAllTrainingExecutions();
                await trainingDataStroage.deleteAllTrainingData();
            });

            it('should respond with with 200 when getting the model of a finished execution_id', async () => {
                const uploadTrainingDataResponse = await axiosClient.post(uploadTrainingDataUrl, {
                    model: '走',
                    dataType: TRAININGDATATYPE.BINARYSTRINGWITHNEWLINE,
                    compression: COMPRESSIONTYPE.PLAIN,
                    data: [trainingData.transformedData.find((s: any) => s.type === 'SKELETON').stroke, trainingData.transformedData.find((s: any) => s.type === 'ORIGINAL').stroke],
                });

                expect(uploadTrainingDataResponse.status).toEqual(HttpStatusCode.Created);

                const trainModelResponse = await axiosClient.post(trainModelUrl, {});
                expect(trainModelResponse.status).toEqual(HttpStatusCode.Created);
                expect((trainModelResponse.data as ModelTrainingExecution).status).toEqual(TRAININGSTATUS.INPROGRESS);

                const executionUrl = getModelTrainingExecutionUrl + '/' + (trainModelResponse.data as ModelTrainingExecution).executionId;
                let getModelTrainingExecutionResponse: any;

                do {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    getModelTrainingExecutionResponse = await axiosClient.get(executionUrl);
                } while ((getModelTrainingExecutionResponse.data as ModelTrainingExecution).status === TRAININGSTATUS.INPROGRESS);

                expect((getModelTrainingExecutionResponse.data as ModelTrainingExecution).status).toEqual(TRAININGSTATUS.FINISHED);
                expect((getModelTrainingExecutionResponse.data as ModelTrainingExecution).modelPath).toBeDefined();

                const modelByExecutionIdResponse =  await axiosClient.get(getModelByExeutionId + '/' + (getModelTrainingExecutionResponse.data as ModelTrainingExecution).executionId);
                
                expect(modelByExecutionIdResponse.data).toBeDefined()
                expect(modelByExecutionIdResponse.data.type).toEqual('NeuralNetwork')
            }, 10000);
        });
    });
});
