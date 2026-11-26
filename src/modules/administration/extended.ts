import { Fault, Json, Obj, P, str, num } from '../../contracts';
import { f, copy, read, write, cOpt, mOpt, memberOpt, roleOpt, threadOpt, eventOpt, ruleOpt, reason, channelTarget, messageTarget, memberTarget, roleTarget, threadTarget, eventTarget, ruleTarget } from '../operations/definitions';
const codeOpt = { codigo: f.s(true, 64) }, codeTarget = { code: 'codigo' };
// Additional concrete capabilities; no raw JSON or arbitrary REST paths are accepted.
write('criar/enquete', 'create-message', 'Cria enquete nativa com 2 a 10 alternativas.', { pergunta: f.s(true, 300), opcoes: f.s(true, 550), duracao: f.i(false, 1, 168), multipla: f.b(), ...cOpt }, channelTarget, i => { const answers = str(i.opcoes).split('|').map(x => x.trim()); if (answers.length < 2 || answers.length > 10 || answers.some(x => !x || x.length > 55) || new Set(answers).size !== answers.length)
    throw new Fault('invalid_poll_answers'); return { poll: { question: { text: i.pergunta }, answers: answers.map(text => ({ poll_media: { text } })), duration: i.duracao ?? 24, allow_multiselect: i.multipla ?? false, layout_type: 1 }, allowed_mentions: { parse: [] } }; }, { alias: 'poll', extra: 1n << 47n });
write('publicar/no-fórum', 'create-thread', 'Publica tópico de fórum com conteúdo inicial.', { nome: f.s(), mensagem: f.s(true, 1900), ...cOpt }, channelTarget, i => ({ name: i.nome, message: { content: i.mensagem, allowed_mentions: { parse: [] } } }), { alias: 'forum' });
write('criar/tópico-de-mensagem', 'create-thread-from-message', 'Cria tópico a partir de mensagem.', { nome: f.s(), ...mOpt, duracao: f.choice([60, 1440, 4320, 10080], false) }, messageTarget, i => ({ name: i.nome, auto_archive_duration: i.duracao ?? 1440 }));
read('listar/tópicos-arquivados', 'list-public-archived-threads', 'Lista tópicos públicos arquivados.', cOpt, channelTarget);
write('seguir/canal-de-anúncios', 'follow-channel', 'Segue anúncio em canal de destino.', { canal: f.id(), destino: f.id() }, channelTarget, i => ({ webhook_channel_id: i.destino }), { confirm: true });
const permissionMask = (v: Json | undefined) => { if (v === undefined)
    return '0'; const s = str(v); if (!/^\d{1,20}$/.test(s) || BigInt(s) > ((1n << 49n) - 1n))
    throw new Fault('invalid_permission_bits'); return s; };
write('definir/permissões-do-canal', 'set-channel-permission-overwrite', 'Define permissões por máscara decimal, após confirmação.', { canal: f.id(), alvo: f.id(), 'tipo-alvo': f.choice([0, 1]), permitir: f.s(false, 20), negar: f.s(false, 20) }, { channel: 'canal', overwrite: 'alvo' }, i => { const allow = permissionMask(i.permitir), deny = permissionMask(i.negar); if (BigInt(allow) & BigInt(deny))
    throw new Fault('overlap_permissions'); return { type: i['tipo-alvo'], allow, deny }; }, { confirm: true, extra: P.manageRoles });
write('editar/permissões-do-cargo', 'update-guild-role', 'Altera permissões de cargo sem permitir escalada.', { ...roleOpt, permissoes: f.s(true, 20) }, roleTarget, i => ({ permissions: permissionMask(i.permissoes) }), { alias: 'permissions', confirm: true });
write('ordenar/cargos', 'bulk-update-guild-roles', 'Altera posição de cargo abaixo da hierarquia do ator e bot.', { ...roleOpt, posicao: f.i(true, 1, 250) }, undefined, i => [{ id: i.cargo, position: i.posicao }], { confirm: true });
read('consultar/perfil-do-bot', 'get-my-user', 'Consulta o próprio perfil do bot.', {}, undefined, undefined, true);
read('aplicacao/informacoes', 'get-my-application', 'Consulta metadados públicos da própria aplicação.');
read('consultar/perfil-do-bot-no-servidor', 'get-my-guild-member', 'Consulta membro correspondente ao bot.');
read('consultar/modelo-do-servidor', 'get-guild-template', 'Consulta modelo vinculado a este servidor.', codeOpt, codeTarget);
read('consultar/convite', 'invite-resolve', 'Consulta convite do próprio servidor.', codeOpt, codeTarget);
write('revogar/convite', 'invite-revoke', 'Revoga convite do próprio servidor.', codeOpt, codeTarget, undefined, { confirm: true });
read('listar/convites-do-canal', 'list-channel-invites', 'Lista convites de canal.', { canal: f.id() }, channelTarget);
write('criar/regra-de-moderação', 'create-auto-moderation-rule', 'Cria regra de palavras bloqueadas.', { nome: f.s(true, 100), termo: f.s(true, 1000) }, undefined, i => { const words = str(i.termo).split(',').map(w => w.trim()).filter(Boolean); if (!words.length || words.length > 20 || words.some(w => w.length > 60))
    throw new Fault('invalid_automod_terms'); return { name: i.nome, event_type: 1, trigger_type: 1, trigger_metadata: { keyword_filter: words }, actions: [{ type: 1 }], enabled: true }; }, { confirm: true });
write('criar/evento', 'create-guild-scheduled-event', 'Cria evento externo ou de voz com horário ISO UTC.', { nome: f.s(), tipo: f.choice(['voz', 'externo']), inicio: f.s(true, 40), canal: f.id(false), 'duracao-minutos': f.i(true, 1, 10080), descricao: f.s(false, 1000), local: f.s(false) }, undefined, i => { const raw = str(i.inicio); if (!/T.*(?:Z|[+-]\d\d:\d\d)$/.test(raw))
    throw new Fault('timezone_required'); const start = Date.parse(raw); if (!Number.isFinite(start) || start <= Date.now())
    throw new Fault('invalid_event_time'); if (i.tipo === 'voz' && !i.canal || i.tipo === 'externo' && !i.local)
    throw new Fault('event_target_required'); return { name: i.nome, privacy_level: 2, entity_type: i.tipo === 'voz' ? 2 : 3, scheduled_start_time: new Date(start).toISOString(), scheduled_end_time: new Date(start + num(i['duracao-minutos']) * 60000).toISOString(), ...(i.tipo === 'voz' ? { channel_id: i.canal } : { channel_id: null, entity_metadata: { location: i.local } }), ...copy(i, { descricao: 'description' }) }; });
write('iniciar/palco', 'create-stage-instance', 'Inicia palco no canal informado.', { canal: f.id(), topico: f.s(true, 120) }, undefined, i => ({ channel_id: i.canal, topic: i.topico, privacy_level: 2 }), { extra: P.manageChannels });
read('consultar/palco', 'get-stage-instance', 'Consulta palco.', { canal: f.id() }, channelTarget);
write('editar/palco', 'update-stage-instance', 'Edita tópico do palco.', { canal: f.id(), topico: f.s(true, 120) }, channelTarget, i => ({ topic: i.topico }));
write('encerrar/palco', 'delete-stage-instance', 'Encerra palco após confirmação.', { canal: f.id() }, channelTarget, undefined, { confirm: true });
read('consultar/webhook', 'get-webhook', 'Consulta metadados de webhook sem token.', { id: f.id() }, { webhook: 'id' });
write('editar/webhook', 'update-webhook', 'Edita nome de webhook pertencente ao servidor.', { id: f.id(), nome: f.s(true, 80) }, { webhook: 'id' }, i => ({ name: i.nome }), { confirm: true });
write('excluir/webhook', 'delete-webhook', 'Exclui webhook pertencente ao servidor.', { id: f.id() }, { webhook: 'id' }, undefined, { confirm: true });
read('contar/interessados-no-evento', 'count-guild-scheduled-event-users', 'Consulta número de interessados.', eventOpt, eventTarget);
read('estimar/membros-inativos', 'preview-prune-guild', 'Estima membros inativos, sem efeitos.', { dias: f.i(false, 1, 30) }, undefined, { dias: 'days' });
write('remover/reação-de-usuário', 'delete-user-message-reaction', 'Remove reação específica de membro.', { ...mOpt, emoji: f.s(), ...memberOpt }, { ...messageTarget, emoji: 'emoji', ...memberTarget }, undefined, { confirm: true });
write('remover/reações-do-emoji', 'delete-all-message-reactions-by-emoji', 'Remove todas as reações do emoji informado.', { ...mOpt, emoji: f.s() }, { ...messageTarget, emoji: 'emoji' }, undefined, { confirm: true });
write('remover/todas-as-reações', 'delete-all-message-reactions', 'Remove todas as reações da mensagem.', mOpt, messageTarget, undefined, { confirm: true });
read('listar/tópicos-privados-arquivados', 'list-private-archived-threads', 'Lista tópicos privados arquivados autorizados.', { canal: f.id() }, channelTarget);
read('listar/tópicos-privados-do-bot', 'list-my-private-archived-threads', 'Lista tópicos privados do bot visíveis ao ator.', { canal: f.id() }, channelTarget);
read('inventario/webhooks-do-canal', 'list-channel-webhooks', 'Lista metadados de webhooks do canal.', { canal: f.id() }, channelTarget);
read('consultar/prévia-do-servidor', 'get-guild-preview', 'Consulta prévia do servidor.');
read('inventario/regiões-do-servidor', 'list-guild-voice-regions', 'Lista regiões disponíveis no servidor.');
read('inspecionar/estado-de-voz-do-bot', 'get-self-voice-state', 'Consulta estado de voz do bot.');
read('inventario/pacotes-de-figurinhas', 'list-sticker-packs', 'Lista pacotes públicos de figurinhas.');
read('inspecionar/pacote-de-figurinhas', 'get-sticker-pack', 'Consulta pacote público de figurinhas.', { id: f.id() }, { pack: 'id' });
read('inspecionar/figurinha-pública', 'get-sticker', 'Consulta figurinha pública.', { id: f.id() }, { sticker: 'id' });
read('inventario/sons-padrão', 'get-soundboard-default-sounds', 'Lista sons padrão do Discord.');
write('alterar/apelido-do-bot', 'update-my-guild-member', 'Altera apelido do bot no servidor.', { apelido: f.s(true, 32) }, undefined, i => ({ nick: i.apelido }), { extra: 1n << 27n });
read('verificar/permissões-do-membro', 'get-guild-member-permissions', 'Consulta permissões de membro no servidor.', memberOpt, memberTarget);
read('verificar/permissões-do-cargo', 'get-guild-role-permissions', 'Consulta permissões de cargo no servidor.', roleOpt, roleTarget);
read('verificar/permissões-do-cargo-no-canal', 'get-channel-role-permissions', 'Consulta permissões de cargo em canal.', { ...roleOpt, canal: f.id() }, { ...roleTarget, ...channelTarget });
for (const [root, field, active] of [['restringir', 'invites_disabled_until', true], ['liberar', 'invites_disabled_until', false], ['restringir', 'dms_disabled_until', true], ['liberar', 'dms_disabled_until', false]] as const) {
    const sub = field.startsWith('invites') ? 'convites' : 'mensagens-diretas';
    write(root + '/' + sub, 'update-guild-incident-actions', `${root} ${sub} no servidor.`, active ? { duracao: f.i(true, 1, 1440) } : {}, undefined, i => ({ [field]: active ? new Date(Date.now() + num(i.duracao) * 60000).toISOString() : null }), { alias: root + '.' + sub, confirm: true, extra: P.manageGuild });
}
write('criar/emoji', 'create-guild-emoji', 'Cria emoji usando imagem PNG/JPEG/GIF em data URI.', { nome: { type: 'string', required: true, min: 2, max: 32 }, imagem: f.s(true, 6000) }, undefined, i => { const image = str(i.imagem); if (!/^data:image\/(?:png|jpeg|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(image) || image.length > 6000)
    throw new Fault('invalid_image_data'); if (!/^[A-Za-z0-9_]{2,32}$/.test(str(i.nome)))
    throw new Fault('invalid_emoji_name'); return { name: i.nome, image }; });

