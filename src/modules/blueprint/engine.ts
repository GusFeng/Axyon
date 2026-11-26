import { Capability, Fault, Json, P } from '../../contracts';
import { Kernel } from '../../core/kernel';
import { Projection } from '../operations/definitions';
export function blueprint(getKernel: () => Kernel): {
    caps: Capability[];
    projections: Projection[];
} { const cap: Capability = { id: 'system.blueprint.export', module: 'blueprint', description: 'Exporta inventário visível de canais e cargos, sem restaurar ou aplicar alterações.', effect: 'read', fields: {}, actorMask: P.manageGuild, ai: false, local: async (_, c) => { const k = getKernel(); const [channels, roles] = await Promise.all([k.execute('discord.list-guild-channels', {}, { ...c, nonce: c.nonce + ':channels' }), k.execute('discord.list-guild-roles', {}, { ...c, nonce: c.nonce + ':roles' })]); if (channels.status !== 'ok' || roles.status !== 'ok')
        throw new Fault('blueprint_incomplete'); return { schema: 1, guild: c.guild, scope: 'visible bounded inventory', channels: channels.data, roles: roles.data }; } }; return { caps: [cap], projections: [{ root: 'blueprint', sub: 'exportar', cap: cap.id, description: cap.description, options: {} }] }; }

