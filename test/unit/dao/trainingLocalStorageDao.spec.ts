import { ModelTrainingLocalDataStorageDao } from '../../../src/dao/modelTrainingLocalDataStorageDao';

describe('modelTrainingLocalStorageDao', () => {
    it('should be able to save data read data to and from local storage', async () => {
        const storageDao = new ModelTrainingLocalDataStorageDao();
        await storageDao.saveData(
            'test_char',
            new Map([
                ['key1', 'value1'],
                ['key2', 'value2'],
            ]),
        );

        const result = await storageDao.getCurrentTrainingData('test_char');

        await storageDao.deleteSelectedModelTrainingData('test_char');

        expect(result).toBeDefined();
        expect(result.get('key1')).toEqual('value1');
        expect(result.get('key2')).toEqual('value2');
    });
});
