import { Config } from '../config';
import { CharacterTrainingController } from './characterTrainingController';

export class ControllerFactory {
    public static makeCharacterTrainingController(config?: Config): CharacterTrainingController {
        return new CharacterTrainingController(config);
    }
}
