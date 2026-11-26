import { randomUUID } from 'node:crypto';
import { Capability, Context, Fault, Json, Obj, P, str, validate, num, id } from '../../contracts';
import { Kernel } from '../../core/kernel';
import { Store, Job } from '../persistence/store';
import { fields as f, Projection } from '../operations/definitions';
export class Workflows {
    constructor(readonly kernel: Kernel, readonly store: Store) { }
    async fire(j: Job, nonce: string) { const context: Context = { guild: j.guild, channel: j.channel, actor: j.actor, nonce, source: j.kind === 'schedule' ? 'scheduler' : 'automation' }; try {
        if (j.steps?.length) {
            if (!this.store.claim(j.guild, nonce + ':flow'))
                throw new Fault('duplicate');
            const results: Json[] = [];
            try {
                for (const [index, step] of j.steps.entries()) {
                    const result = await this.kernel.execute(step.capability, step.input, { ...context, nonce: nonce + ':' + index });
                    if (result.status !== 'ok')
                        throw new Fault('job_not_executed');
                    results.push(result.data);
                }
                this.store.finish(j.guild, nonce + ':flow', 'done');
                return results;
            }
            catch (e) {
                this.store.finish(j.guild, nonce + ':flow', 'uncertain');
                throw e;
            }
        }
        const result = await this.kernel.execute(j.capability, j.input, context);
        if (result.status !== 'ok')
            throw new Fault('job_not_executed');
        return result.data;
    }
    catch (e) {
        if (e instanceof Fault && ['duplicate', 'module_disabled', 'automation_denied'].includes(e.code))
            return null;
        const fresh = this.store.jobs(j.guild).find(x => x.id === j.id);
        if (fresh?.enabled)
            try {
                this.store.saveJob({ ...fresh, enabled: false }, fresh.revision);
            }
            catch { }
        ;
        console.warn('JOB_PAUSED', j.id, e instanceof Fault ? e.code : 'uncertain');
        return null;
    } }
}
export function jobCapabilities(store: Store, registry: Kernel['registry'], getKernel: () => Kernel): {
    caps: Capability[];
    projections: Projection[];
} {
    const caps: Capability[] = [], projections: Projection[] = [];
    for (const [root, module] of [['agenda', 'scheduler'], ['automacao', 'automation']] as const) {
        function add(sub: string, description: string, options: Capability['fields'], local: NonNullable<Capability['local']>, write = false) { const c: Capability = { id: `system.${root}.${sub}`, module, description, effect: write ? 'write' : 'read', fields: options, actorMask: P.manageGuild, ai: false, local }; caps.push(c); projections.push({ root, sub, description, cap: c.id, options: { ...options } }); }
        const job = (g: string, i: Obj) => { const j = store.jobs(g).find(j => j.id === i.nome && j.kind === (root === 'agenda' ? 'schedule' : 'event')); if (!j)
            throw new Fault('job_not_found'); return j; };
        add('criar', 'Cria rotina de mensagem sem menções, executada com autorização atual.', { nome: f.s(true, 40), canal: f.id(), texto: f.s(true, 1900), ...(root === 'agenda' ? { minutos: f.i(true, 1, 10080), repetir: f.b() } : { prefixo: f.s(true, 100) }) }, async (i, c) => { if (store.jobs(c.guild).length >= 50)
            throw new Fault('job_quota'); if (!/^[a-zA-Z0-9_-]{1,40}$/.test(str(i.nome)))
            throw new Fault('invalid_job_name'); const input = validate(registry.get('discord.create-message').fields, { canal: i.canal, texto: i.texto }); const ms = root === 'agenda' ? num(i.minutos) * 60000 : 0; const j: Job = { id: str(i.nome), guild: c.guild, actor: c.actor, channel: id(i.canal), capability: 'discord.create-message', input, kind: root === 'agenda' ? 'schedule' : 'event', trigger: root === 'agenda' ? '' : str(i.prefixo), interval: i.repetir ? ms : 0, next: Date.now() + ms, enabled: true, revision: 0 }; return store.saveJob(j, 0) as unknown as Json; }, true);
        add('listar', 'Lista rotinas deste servidor.', {}, async (_, c) => store.jobs(c.guild).filter(j => j.kind === (root === 'agenda' ? 'schedule' : 'event')).map(j => ({ id: j.id, enabled: j.enabled, next: j.next, channel: j.channel })));
        add('detalhar', 'Exibe detalhes de rotina.', { nome: f.s() }, async (i, c) => job(c.guild, i) as unknown as Json);
        for (const [sub, enabled] of [['pausar', false], ['retomar', true]] as const)
            add(sub, 'Altera ativação da rotina.', { nome: f.s() }, async (i, c) => { const j = job(c.guild, i); return store.saveJob({ ...j, enabled, next: enabled && j.kind === 'schedule' ? Date.now() + Math.max(60000, j.interval) : j.next }, j.revision) as unknown as Json; }, true);
        if (root === 'agenda')
            add('agora', 'Executa rotina agora com a autorização do solicitante.', { nome: f.s() }, async (i, c) => { const j = job(c.guild, i); if (j.actor !== c.actor)
                throw new Fault('job_owner_required'); const result = await getKernel().execute(j.capability, j.input, { ...c, channel: j.channel, source: 'scheduler', nonce: c.nonce + ':run' }); if (result.status !== 'ok')
                throw new Fault('job_not_executed'); return result.data; }, true);
        if (root === 'automacao')
            add('testar', 'Valida plano sem produzir efeitos.', { nome: f.s() }, async (i, c) => { const j = job(c.guild, i); const cap = registry.get(j.capability); const input = validate(cap.fields, j.input); return { simulation: true, capability: cap.id, input }; });
        add('remover', 'Remove rotina.', { nome: f.s() }, async (i, c) => { const j = job(c.guild, i); store.removeJob(c.guild, j.id, j.revision); return { removed: true }; }, true);
    }
    const addFlow = (sub: string, description: string, fields: Capability['fields'], local: NonNullable<Capability['local']>, effect: 'read' | 'write' = 'read') => { const cap: Capability = { id: 'system.fluxo.' + sub, module: 'workflows', description, fields, local, effect, actorMask: P.manageGuild, ai: false }; caps.push(cap); projections.push({ root: 'fluxo', sub, description, cap: cap.id, options: { ...fields } }); };
    addFlow('criar', 'Cria fluxo de até 5 envios, executado uma vez após intervalo.', { nome: f.s(true, 40), canal: f.id(), minutos: f.i(true, 1, 10080), passos: f.s(true, 6000) }, async (i, c) => { if (!/^[a-zA-Z0-9_-]{1,40}$/.test(str(i.nome)) || store.jobs(c.guild).length >= 50)
        throw new Fault('invalid_flow'); let raw: unknown; try {
        raw = JSON.parse(str(i.passos));
    }
    catch {
        throw new Fault('invalid_flow_json');
    } if (!Array.isArray(raw) || !raw.length || raw.length > 5)
        throw new Fault('invalid_steps'); const steps = raw.map(step => { if (!step || typeof step !== 'object' || Array.isArray(step) || Object.keys(step).some(k => !['capability', 'input'].includes(k)))
        throw new Fault('invalid_step'); const cap = registry.get(String(step.capability)); if (!cap.automated || cap.confirm || cap.effect === 'destructive')
        throw new Fault('unsafe_step'); return { capability: cap.id, input: validate(cap.fields, step.input) }; }); const j: Job = { id: str(i.nome), guild: c.guild, actor: c.actor, channel: id(i.canal), capability: steps[0].capability, input: steps[0].input, steps, kind: 'schedule', trigger: '', interval: 0, next: Date.now() + num(i.minutos) * 60000, enabled: true, revision: 0 }; return store.saveJob(j, 0) as unknown as Json; }, 'write');
    addFlow('listar', 'Lista fluxos programados.', {}, async (_, c) => store.jobs(c.guild).filter(j => j.steps?.length).map(j => ({ id: j.id, steps: j.steps!.length, next: j.next, enabled: j.enabled })));
    return { caps, projections };
}

