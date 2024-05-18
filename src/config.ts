import { IConfig } from './types/trainerTypes';

export class Config implements IConfig {
    public modelUUID: string = '63ac5ca1-248e-4424-8c14-99b491207592';
    trainingDataHeight: number = 50;
    trainingDataWidth: number = 40;
    storageUrl: string = './dev/storage';
    env: string = 'development';
}
