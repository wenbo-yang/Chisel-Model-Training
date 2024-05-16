import { NeuralNetwork, likely } from 'brain.js';
import { gzip, ungzip } from 'node-gzip';

describe('prototyping', () => {
    function character(string: string): number[] {
        return string.trim().split('').map(integer);
    }

    function integer(character: string): number {
        if (character === '#') return 1;
        return 0;
    }

    // prettier-ignore
    const a = character(
        '....###....' +
        '  #######  ' +
        '###     ###' +
        '###     ###' +
        '###########' +
        '###########' +
        '###     ###' +
        '###     ###' +
        '###     ###' + 
        '###     ###'
    );

    // prettier-ignore
    const a1 = character(
        '....###....' +
        '  ### ###  ' +
        '###     ###' +
        '###     ###' +
        '###########' +
        '###########' +
        '###     ###' +
        '###     ###' +
        '###     ###' + 
        '###     ###'
    );

    // prettier-ignore
    const b = character(
        '#######    ' +
        '########## ' +
        '###     ###' +
        '###     ## ' +
        '#########  ' +
        '#########  ' +
        '###.....## ' +
        '###.....###' +
        '########## ' + 
        '#########..'
    );

    // prettier-ignore
    const b1 = character(
        '#######    ' +
        '#### ##### ' +
        '###     ###' +
        '###     ## ' +
        '#########  ' +
        '#########  ' +
        '###.....## ' +
        '###.....###' +
        '########## ' + 
        '#########..'
    );

    // prettier-ignore
    const c = character(
        '###########' +
        '###########' +
        '###......  ' +
        '###......  ' +
        '###......  ' +
        '###......  ' +
        '###......  ' +
        '###......  ' +
        '###########' +
        '###########' 
    );

    // prettier-ignore
    const testChar = character(
        '...........' +
        ' ########  ' +
        ' #       # ' +
        ' #       # ' +
        ' ########  ' +
        ' #       # ' +
        ' # ..... # ' +
        ' # ..... # ' +
        ' # ##### # ' + 
        '...........'
    );

    it('can recognize character with bold stroke training set and skeleton test data', () => {
        const net = new NeuralNetwork();
        net.train([
            { input: a, output: { a: 1 } },
            { input: b, output: { b: 1 } },
            { input: c, output: { c: 1 } },
        ]);

        expect(likely(testChar, net)).toBe('b');
    });

    xit('not working!!! neural net can call and train data multiple times', () => {
        let net = new NeuralNetwork();
        net.train([
            { input: a, output: { a: 1 } },
            { input: c, output: { c: 1 } },
        ]);

        let result = expect(likely(testChar, net)).toBe('a');

        net.train([
            { input: a, output: { a: 1 } },
            { input: c, output: { c: 1 } },
            { input: b, output: { b: 1 } },
        ]);

        expect(likely(testChar, net)).toBe('b');
    });

    it('neural net can save and load', () => {
        const net = new NeuralNetwork();
        net.train([
            { input: a, output: { a: 1 } },
            { input: b, output: { b: 1 } },
            { input: c, output: { c: 1 } },
        ]);

        expect(likely(testChar, net)).toBe('b');

        const netOutput = net.toJSON();
        const newNet = new NeuralNetwork();
        newNet.fromJSON(netOutput);

        expect(likely(testChar, newNet)).toBe('b');
    });

    it('can recognize character with multiple training data', () => {
        const net = new NeuralNetwork();
        net.train([
            { input: a, output: { a: 1 } },
            { input: a1, output: { a: 1 } },
            { input: b, output: { b: 1 } },
            { input: b1, output: { b: 1 } },
            { input: c, output: { c: 1 } },
        ]);

        expect(likely(testChar, net)).toBe('b');
    });

    it('can recognize character with multiple array data declared outside of main training data array', () => {
        const net = new NeuralNetwork();

        const data = [
            { input: a, output: { a: 1 } },
            { input: a1, output: { a: 1 } },
            { input: c, output: { c: 1 } },
        ];

        let input = b;
        let output: any = {};
        output['b'] = 1;

        data.push({ input, output });

        net.train(data);

        expect(likely(testChar, net)).toBe('b');
    });

    it('gzip and unzip string', async () => {
        const gzipped = (await gzip(Buffer.from('000011110000\n000011110000'))).toString('base64');
        const ungzipped = (await ungzip(Buffer.from(gzipped, 'base64'))).toString();

        expect(ungzipped).toEqual('000011110000\n000011110000');
    });

    it('gzip and unzip string', async () => {});
});
