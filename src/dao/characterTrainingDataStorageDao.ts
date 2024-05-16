import { SavedTrainingData } from '../types/trainerTypes';

export abstract class CharacterTrainingDataStorageDao {
    constructor() {}

    public async getCurrentTrainingData(character: string): Promise<Map<string, string>> {
        throw new Error('getCurrentTrainingData Abstract class');
    }

    public async saveData(character: string, newData: Map<string, string>): Promise<void> {
        throw new Error('saveData Abstract class');
    }

    public async getAllTrainingData(): Promise<SavedTrainingData[]> {
        throw new Error('getAllTrainingData Abstract class');
    }

    public async deleteAllTrainingData(): Promise<void> {
        throw new Error('deleteAllTrainingData Abstract class');
    }

    public async deleteSelectedCharacterTrainingData(character?: string): Promise<void> {
        throw new Error('deleteSelectedCharacterTrainingData Abstract class');
    }
}
