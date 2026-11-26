import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Fault } from '../contracts';
import { stagingConfiguration, verifyStagingApplication } from '../runtime/staging';

const app = '100000000000000001', prodApp = '100000000000000002';
const guild = '100000000000000003', prodGuild = '100000000000000004';
const fixture: NodeJS.ProcessEnv = { AXYON_ENVIRONMENT:'staging', RAILWAY_ENVIRONMENT_NAME:'staging', DISCORD_GUILD_ID:guild,
    AXYON_STAGING_APPLICATION_ID:app, AXYON_PRODUCTION_APPLICATION_ID:prodApp, AXYON_PRODUCTION_GUILD_ID:prodGuild };
const fault = (code: string) => (e: unknown) => e instanceof Fault && e.code === code;

test('staging cannot inherit production defaults or reuse application, guild, storage or global cleanup', () => {
    assert.equal(stagingConfiguration({}, guild), null);
    assert.equal(stagingConfiguration({RAILWAY_ENVIRONMENT_NAME:'production'}, guild), null);
    assert.throws(() => stagingConfiguration({RAILWAY_ENVIRONMENT_NAME:'staging'}, guild), fault('environment_mismatch'));
    assert.throws(() => stagingConfiguration({...fixture,RAILWAY_ENVIRONMENT_NAME:'production'}, guild), fault('environment_mismatch'));
    assert.throws(() => stagingConfiguration({...fixture,AXYON_STAGING_APPLICATION_ID:prodApp},guild), fault('staging_identity_overlap'));
    assert.throws(() => stagingConfiguration({...fixture,DISCORD_GUILD_ID:prodGuild},prodGuild), fault('staging_identity_overlap'));
    assert.throws(() => stagingConfiguration({...fixture,DISCORD_GUILD_ID:undefined},guild), fault('staging_guild_required'));
    for (const override of [{AXYON_DB_PATH:'/data/axyon.sqlite'},{AXYON_ENABLE_DMS:'true'},{AXYON_CLEAN_LEGACY_GLOBAL_COMMANDS:'true'}])
        assert.throws(() => stagingConfiguration({...fixture,...override},guild), fault('staging_unsafe_configuration'));
    assert.deepEqual(stagingConfiguration(fixture,guild),{application:app,productionApplication:prodApp,guild});
});

test('staging proves credential identity with official GET before gateway, rejects mismatch and sanitizes failures', async () => {
    const staging = stagingConfiguration(fixture,guild)!;
    const send: typeof fetch = async (url, options) => {
        assert.equal(url,'https://discord.com/api/v10/applications/@me');
        assert.equal(options?.method,'GET');
        assert.equal(options?.redirect,'error');
        assert.equal(new Headers(options?.headers).get('authorization'),'Bot synthetic');
        return Response.json({id:app});
    };
    await verifyStagingApplication(staging,'synthetic',send);
    await assert.rejects(verifyStagingApplication(staging,'synthetic',async()=>Response.json({id:prodApp})),fault('staging_identity_mismatch'));
    await assert.rejects(verifyStagingApplication(staging,'synthetic',async()=>Response.json({id:42})),fault('staging_identity_mismatch'));
    await assert.rejects(verifyStagingApplication(staging,'synthetic',async()=>new Response('secret',{status:401})),fault('staging_identity_unverified'));
    await assert.rejects(verifyStagingApplication(staging,'synthetic',async()=>{throw Error('secret');}),fault('staging_identity_unverified'));
});
