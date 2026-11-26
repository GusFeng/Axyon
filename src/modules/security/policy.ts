import { Access, Capability, Context, Fault, Plan, has, P } from '../../contracts';
import { Settings } from '../configuration/settings';
import { Registry } from '../../core/registry';
export function authorize(registry: Registry, settings: Settings, cap: Capability, ctx: Context, access: Access, plan?: Plan) {
    if (!registry.enabled(cap.module, settings.modules))
        throw new Fault('module_disabled', 'Módulo desativado.');
    const a = settings.ai;
    if (ctx.source === 'ai') {
        if (!registry.enabled('intelligence', settings.modules) || !cap.ai || !a.enabled || a.emergency || a.mode === 'chat' || a.mode === 'read' && cap.effect !== 'read')
            throw new Fault('ai_denied', 'Capacidade não autorizada para IA.');
        if (a.domains.length && !a.domains.includes(cap.module))
            throw new Fault('domain_disabled');
        if (a.denyUsers.includes(ctx.actor) || access.roles.some(r => a.denyRoles.includes(r)) || ctx.thread && !a.threads || a.blocked.includes(ctx.channel) || (!a.mentions && !a.direct.includes(ctx.channel)) || ((a.allowUsers.length || a.allowRoles.length) && !a.allowUsers.includes(ctx.actor) && !access.roles.some(r => a.allowRoles.includes(r))))
            throw new Fault('ai_access_denied');
    }
    if ((ctx.source === 'automation' || ctx.source === 'scheduler') && (!cap.automated || !registry.enabled(ctx.source, settings.modules)))
        throw new Fault('automation_denied');
    if (ctx.source === 'slash' && !registry.enabled('commands', settings.modules) && cap.module !== 'control-plane')
        throw new Fault('commands_disabled');
    if (!has(access.actor, cap.actorMask) || plan && !has(access.actor, plan.actorMask))
        throw new Fault('actor_permission', 'Permissão do solicitante insuficiente.');
    if (plan && !has(access.bot, plan.botMask))
        throw new Fault('bot_permission', 'Permissão do bot insuficiente.');
    if (plan && plan.target.guild !== ctx.guild)
        throw new Fault('guild_mismatch');
    if (plan && cap.effect !== 'read') {
        if (access.resolvedChannels?.some(c => settings.protectedChannels.includes(c)))
            throw new Fault('protected_target');
        const body = plan.body;
        if (body && typeof body === 'object' && !Array.isArray(body)) {
            for (const k of ['channel_id', 'parent_id', 'webhook_channel_id'])
                if (typeof body[k] === 'string' && settings.protectedChannels.includes(body[k] as string))
                    throw new Fault('protected_target');
        }
        if (Array.isArray(body) && body.some(v => v && typeof v === 'object' && !Array.isArray(v) && typeof v.id === 'string' && (settings.protectedChannels.includes(v.id) || settings.protectedRoles.includes(v.id))))
            throw new Fault('protected_target');
        if (plan.target.overwrite && (settings.protectedRoles.includes(plan.target.overwrite) || settings.protectedUsers.includes(plan.target.overwrite)) || plan.target.channel && settings.protectedChannels.includes(plan.target.channel) || plan.target.user && settings.protectedUsers.includes(plan.target.user) || plan.target.role && settings.protectedRoles.includes(plan.target.role))
            throw new Fault('protected_target');
        if (plan.method === 'DELETE' && /^\/channels\/\d+$/.test(plan.path) && (plan.target.channel === ctx.channel || settings.ai.direct.includes(plan.target.channel)))
            throw new Fault('protected_ingress', 'Não é permitido excluir o canal de origem ou um canal direto da IA.');
    }
}
export const needsConfirmation = (cap: Capability, ctx: Context) => cap.confirm || cap.effect === 'destructive' || ctx.source === 'ai' && cap.effect !== 'read';

