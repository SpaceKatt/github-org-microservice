import { FileCache } from './fileCache';

const TESTING_CACHE_NAME = 'lmao_test_cache';
const badKey = 'BAD_KEY';
const sampleKey = 'ree';
const sampleData = {
    foo: 'bar',
};

describe('Testing FileCache', () => {
    const fCache = new FileCache(TESTING_CACHE_NAME);

    beforeAll(() => {
        fCache.flush();
    });

    afterAll(() => {
        fCache.flush();
    });

    afterEach(() => {
        fCache.flush();
    });

    it('Returns undefined on cache miss', async () => {
        const c = await fCache.get(badKey);

        expect(c).toBeUndefined();
    });

    it('Returns undefined on cache miss on nonempty cache', async () => {
        await fCache.set('keyOne', sampleData);
        await fCache.set('keyTwo', sampleData);
        await fCache.set('keyThree', sampleData);
        const c = await fCache.get(badKey);

        expect(c).toBeUndefined();
    });

    it('Returns data stored in cache', async () => {
        await fCache.set(sampleKey, sampleData);
        const c = await fCache.get(sampleKey);

        expect(c).toEqual(sampleData);
    });

    it('Data deleted on flush', async () => {
        await fCache.set(sampleKey, sampleData);
        const c = await fCache.get(sampleKey);

        expect(c).toEqual(sampleData);

        fCache.flush();

        const c2 = await fCache.get(sampleKey);

        expect(c2).toBeUndefined();
    });
});
