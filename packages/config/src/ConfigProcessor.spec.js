const { assert } = require('chai');
const { ConfigProcessor } = require('./ConfigProcessor');

describe('ConfigProcessor', () => {
    it('processes JSON content', () => {
        const configProcessor = new ConfigProcessor();

        assert.deepEqual(
            configProcessor.process('json', '{"a":1,"b":"z","c": true}'),
            {
                a: 1,
                b: 'z',
                c: true,
            },
        );
    });

    it('fails if invalid JSON content is provided', () => {
        const configProcessor = new ConfigProcessor();

        assert.throws(
            () => configProcessor.process('json', 'invalid_json'),
            /Can't process JSON content:/,
        );
    });

    it('processes YAML content', () => {
        const configProcessor = new ConfigProcessor();

        assert.deepEqual(
            configProcessor.process('yaml', `
                a: 2
                b: y
                c: false
            `),
            {
                a: 2,
                b: 'y',
                c: false,
            },
        );
    });

    it('fails if invalid YAML content is provided', () => {
        const configProcessor = new ConfigProcessor();

        assert.throws(
            () => configProcessor.process('yaml', '}---1234567---{'),
            /Can't process YAML content:/,
        );
    });

    it('fails if module for working with YAML is not installed', () => {
        const configProcessor = new ConfigProcessor({
            yamlModuleId: 'improved-js-yaml',
        });

        assert.throws(
            () => configProcessor.process('yaml', 'a: 1'),
            /Module "improved-js-yaml" is not installed./,
        );
    });
});
