import { DiscordPort } from '../contracts';
import { Registry } from './registry';
import { Kernel } from './kernel';
import { Store } from '../modules/persistence/store';
import { operations, projections } from '../modules/operations/catalog';
import { administrative } from '../modules/control-plane/admin';
import { jobCapabilities, Workflows } from '../modules/workflows/engine';
import { Scheduler } from '../modules/scheduler/engine';
import { Automation } from '../modules/automation/engine';
import { blueprint } from '../modules/blueprint/engine';
import { CommandCatalog } from '../modules/commands/catalog';
import { RuntimeCatalog } from './runtime-catalog';
export function application(store: Store, discord: DiscordPort) { const registry = new Registry(); for (const id of ['persistence', 'security', 'configuration', 'operations', 'observability', 'recovery'])
    registry.register({ id, essential: true, dependencies: [], capabilities: [] }); for (const id of ['administration', 'moderation'])
    registry.register({ id, dependencies: ['operations', 'security'], capabilities: operations.filter(c => c.module === id) }); registry.register({ id: 'commands', dependencies: ['operations'], capabilities: [] }); registry.register({ id: 'intelligence', dependencies: ['operations', 'configuration'], capabilities: [] }); const admin = administrative(registry, store); registry.register({ id: 'control-plane', essential: true, dependencies: ['configuration', 'security', 'persistence'], capabilities: admin.caps }); const jobs = jobCapabilities(store, registry, () => kernel); registry.register({ id: 'workflows', dependencies: ['operations', 'persistence'], capabilities: jobs.caps.filter(c => c.module === 'workflows') }); for (const id of ['scheduler', 'automation'])
    registry.register({ id, dependencies: ['workflows'], capabilities: jobs.caps.filter(c => c.module === id) }); const blue = blueprint(() => kernel); registry.register({ id: 'blueprint', dependencies: ['administration', 'operations'], capabilities: blue.caps }); registry.seal(); const kernel = new Kernel(registry, store, discord); const catalog = new CommandCatalog([...projections, ...admin.projections, ...jobs.projections, ...blue.projections, { root: 'createchannel', cap: 'discord.create-guild-channel', description: 'Cria canal.', options: { nome: { type: 'string', required: true, max: 100 }, tipo: { type: 'string', choices: ['text', 'voice'], required: true } } }, { root: 'deletemsg', cap: 'discord.bulk-delete-messages', description: 'Exclui mensagens recentes após confirmação.', options: { quantidade: { type: 'integer', required: true, min: 1, max: 100 } } }]); const workflows = new Workflows(kernel, store); return { registry, kernel, catalog, runtimeCatalog:new RuntimeCatalog(), workflows, scheduler: new Scheduler(workflows), automation: new Automation(workflows) }; }

