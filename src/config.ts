import * as staticServiceConfig from '../configs/service.config.json';
import * as globalServicePortMappings from '../Chisel-Global-Service-Configs/configs/globalServicePortMappings.json';
import { IConfig, ServiceConfig, ServicePorts } from './types/trainerTypes';

export class Config implements IConfig {
    private serviceConfig: ServiceConfig;
    private globalServicePortMappings: any;

    constructor(serviceConfig?: ServiceConfig, parsedGlobalServicePortMappings?: any) {
        this.serviceConfig = serviceConfig || staticServiceConfig;
        this.globalServicePortMappings = parsedGlobalServicePortMappings || globalServicePortMappings;
    }

    public get shortName(): string {
        return this.serviceConfig.shortName;
    }

    public get serviceUUID(): string {
        return 'c8a20000-3f40-400a-bd8c-72a10109ffff'; // alias for char---training
    }

    public get serviceName(): string {
        return this.serviceConfig.serviceName;
    }

    public get trainingDataHeight(): number {
        return 50;
    }

    public get trainingDataWidth(): number {
        return 40;
    }

    public get storageUrl(): string {
        return (this.serviceConfig.storage.find((s) => s.env === this.env) || { env: 'development', url: './dev/localStorage' }).url;
    }

    public get env() {
        return process.env.NODE_ENV || 'development';
    }

    public get servicePorts(): ServicePorts {
        return this.globalServicePortMappings.hasOwnProperty(this.serviceConfig.serviceName) && this.globalServicePortMappings[this.serviceConfig.serviceName].hasOwnProperty(this.env) ? this.globalServicePortMappings[this.serviceConfig.serviceName][this.env] : { http: 5000, https: 3000 };
    }
}
