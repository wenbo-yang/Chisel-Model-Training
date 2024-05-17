import { Config } from '../config';
import { ModelTrainingController } from './modelTrainingController';

export class ControllerFactory {
    public static makeModelTrainingController(config?: Config): ModelTrainingController {
        return new ModelTrainingController(config);
    }
}
