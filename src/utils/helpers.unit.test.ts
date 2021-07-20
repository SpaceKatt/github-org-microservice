import { hexToUtf, utfToHex } from './helpers';

describe('Testing utility funcs', () => {
    describe('Encode/decode', () => {
        it('Encodes string from UTF-8 to hex', () => {
            const input = 'Five dozen jugs';
            const expected = '4669766520646f7a656e206a756773';

            expect(utfToHex(input)).toEqual(expected);
        });

        it('Decodes string from hex to UTF-8', () => {
            const input = '4669766520646f7a656e206a756773';
            const expected = 'Five dozen jugs';

            expect(hexToUtf(input)).toEqual(expected);
        });
    });
});
