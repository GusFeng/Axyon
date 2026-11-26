import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Fault } from '../contracts';
import { operationalReadiness, assertDatabaseIntegrity } from '../runtime/readiness';

test('readiness requires initialization, Discord connectivity and no shutdown', () => {
    for (const initialized of [false, true])
        for (const connected of [false, true])
            for (const stopping of [false, true])
                assert.equal(operationalReadiness(initialized, connected, stopping), initialized && connected && !stopping);
});

test('database integrity check fails closed and does not expose diagnostic details', () => {
    assert.doesNotThrow(() => assertDatabaseIntegrity(() => [{quick_check:'ok'}]));
    const fail = (e: unknown) => e instanceof Fault && e.code === 'database_integrity_failed' && e.message === e.code;
    for (const rows of [[], [{quick_check:'bad page'}], [{quick_check:'ok'}, {quick_check:'bad page'}], [{}]])
        assert.throws(() => assertDatabaseIntegrity(() => rows), fail);
    assert.throws(() => assertDatabaseIntegrity(() => { throw Error('private path'); }), fail);
});
