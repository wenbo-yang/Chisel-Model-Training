import { IConfig, ServicePorts } from '../../src/types/trainerTypes';

export const httpsUrl = 'https://localhost:3001';

export const integrationTestConfig = {
    shortName: 'c-train',
    serviceUUID: 'c8a20000-3f40-400a-bd8c-72a10109ffff',
    serviceName: 'character-training',
    trainingDataHeight: 80,
    trainingDataWidth: 80,
    storageUrl: './dev/localStorage',
    env: 'development',
    servicePorts: { http: 5001, https: 3001 },
} as IConfig;
