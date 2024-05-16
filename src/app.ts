import express from 'express';
import http from 'http';
import https from 'https';
import fs from 'fs';
import { Config } from './config';
import { ControllerFactory } from './controller/controllerFactory';
import { HttpStatusCode } from 'axios';
import { processError } from './error';

const config = new Config();

const servicePorts = config.servicePorts;

const privateKey = fs.readFileSync('./certs/key.pem');
const certificate = fs.readFileSync('./certs/cert.crt');

const credentials = { key: privateKey, cert: certificate };

process.title = config.shortName;

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.text({ limit: '50mb' }));

app.get('/healthCheck', (req, res) => {
    res.send('i am healthy!!!');
});

app.post('/trainingData', async (req, res) => {
    try {
        const characterTrainingController = ControllerFactory.makeCharacterTrainingController(config);
        const trainingDataStatus = await characterTrainingController.uploadTrainingData(req);

        res.sendStatus(trainingDataStatus);
    } catch (e) {
        console.log(e as Error);
        processError(e, res);
    }
});

app.post('/trainModel', async (req, res) => {
    try {
        const characterTrainingController = ControllerFactory.makeCharacterTrainingController(config);
        await characterTrainingController.trainModel(res);
    } catch (e) {
        console.log(e as Error);
        processError(e, res);
    }
});

app.get('/modelExecution/:executionId', async (req, res) => {
    try {
        const characterTrainingController = ControllerFactory.makeCharacterTrainingController(config);
        const response = await characterTrainingController.getModelTrainingExecution(req);

        return res.status(HttpStatusCode.Ok).send(response);
    } catch (e) {
        console.log(e as Error);
        processError(e, res);
    }
});

app.get('/latestModel', async (req, res) => {
    try {
        const characterTrainingController = ControllerFactory.makeCharacterTrainingController(config);
        await characterTrainingController.getLatestTrainedModel(res);
    } catch (e) {
        console.log(e as Error);
        processError(e, res);
    }
});

app.get('/model/:executionId', async (req, res) => {
    try {
        const characterTrainingController = ControllerFactory.makeCharacterTrainingController(config);
        await characterTrainingController.getTrainedModelByExecutionId(req, res);
    } catch (e) {
        console.log(e as Error);
        processError(e, res);
    }
});

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(servicePorts.https, () => {
    console.log(`https server is listening at port ${servicePorts.https}`);
});

httpServer.listen(servicePorts.http, () => {
    console.log(`http server is listening at port ${servicePorts.http}`);
});
