import { Fault, id } from '../contracts';

export interface StagingIdentity { readonly application: string; readonly productionApplication: string; readonly guild: string; }

// A Railway environment other than production may never silently inherit the
// production runtime defaults. The first staging profile is deliberately ephemeral.
export function stagingConfiguration(env: NodeJS.ProcessEnv, guild: string): StagingIdentity | null {
    const railway = env.RAILWAY_ENVIRONMENT_NAME?.trim().toLowerCase();
    const mode = env.AXYON_ENVIRONMENT?.trim() || (railway === 'production' ? 'production' : 'development');
    if (!['production', 'development', 'staging'].includes(mode)) throw new Fault('invalid_environment');
    if (railway && ((railway === 'production' && mode !== 'production') || (railway !== 'production' && mode !== 'staging')))
        throw new Fault('environment_mismatch');
    if (mode !== 'staging') return null;
    if (!env.DISCORD_GUILD_ID || env.DISCORD_GUILD_ID !== guild) throw new Fault('staging_guild_required');
    const application = id(env.AXYON_STAGING_APPLICATION_ID);
    const productionApplication = id(env.AXYON_PRODUCTION_APPLICATION_ID);
    const productionGuild = id(env.AXYON_PRODUCTION_GUILD_ID);
    if (application === productionApplication || guild === productionGuild) throw new Fault('staging_identity_overlap');
    if (env.AXYON_DB_PATH || env.AXYON_CLEAN_LEGACY_GLOBAL_COMMANDS === 'true' || env.AXYON_ENABLE_DMS === 'true')
        throw new Fault('staging_unsafe_configuration');
    return { application, productionApplication, guild };
}

// Official Discord REST v10 Get Current Application. Check the actual bot
// credential before Gateway login or initialization of a database.
export async function verifyStagingApplication(staging: StagingIdentity, token: string, send: typeof fetch = fetch): Promise<void> {
    let actual: unknown;
    try {
        const response = await send('https://discord.com/api/v10/applications/@me', {
            method: 'GET', headers: { Authorization: 'Bot ' + token }, redirect: 'error',
            signal: AbortSignal.timeout(10000)
        });
        if (!response.ok) throw Error('unavailable');
        const body: unknown = await response.json();
        actual = body && typeof body === 'object' && 'id' in body ? body.id : undefined;
    } catch { throw new Fault('staging_identity_unverified'); }
    if (actual !== staging.application || actual === staging.productionApplication)
        throw new Fault('staging_identity_mismatch');
}
