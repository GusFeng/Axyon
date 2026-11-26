import { Fault, Json, Obj, P, str, num } from '../../contracts';
import { f, copy, read, write, cOpt, mOpt, memberOpt, roleOpt, threadOpt, eventOpt, ruleOpt, reason, channelTarget, messageTarget, memberTarget, roleTarget, threadTarget, eventTarget, ruleTarget } from '../operations/definitions';
read('listar/canais', 'list-guild-channels', 'Lista canais visíveis ao ator e ao bot.', {}, undefined, undefined, true);
read('consultar/canal', 'get-channel', 'Consulta canal do servidor.', { canal: f.id() }, channelTarget, undefined, true);
const channelTypes = { texto: 0, voz: 2, categoria: 4, anuncios: 5, forum: 15 } as const;
write('criar/canal', 'create-guild-channel', 'Cria canal de texto, voz, anúncio ou fórum.', { nome: f.s(), tipo: f.choice(['texto', 'voz', 'anuncios', 'forum'], false), categoria: f.id(false), topico: f.s(false, 1024), nsfw: f.b(), lento: f.i(false, 0, 21600) }, undefined, i => ({ name: i.nome, type: channelTypes[(i.tipo ?? 'texto') as keyof typeof channelTypes], ...copy(i, { categoria: 'parent_id', topico: 'topic', nsfw: 'nsfw', lento: 'rate_limit_per_user' }) }), { ai: true });
write('criar/categoria', 'create-guild-channel', 'Cria categoria.', { nome: f.s() }, undefined, i => ({ name: i.nome, type: 4 }), { alias: 'category', ai: true });
write('editar/canal', 'update-channel', 'Edita propriedades do canal.', { canal: f.id(), nome: f.s(false), topico: f.s(false, 1024), nsfw: f.b(), lento: f.i(false, 0, 21600) }, channelTarget, i => copy(i, { nome: 'name', topico: 'topic', nsfw: 'nsfw', lento: 'rate_limit_per_user' }));
write('editar/categoria', 'update-channel', 'Renomeia categoria.', { canal: f.id(), nome: f.s() }, channelTarget, i => ({ name: i.nome }), { alias: 'category' });
for (const [sub, alias] of [['canal', ''], ['categoria', 'category'], ['tópico', 'thread']])
    write('excluir/' + sub, 'delete-channel', 'Exclui alvo explícito após confirmação.', { [sub === 'tópico' ? 'topico' : 'canal']: f.id() }, sub === 'tópico' ? threadTarget : channelTarget, undefined, { alias: alias || undefined, confirm: true, ai: sub === 'canal' });
write('mover/canal', 'update-channel', 'Move canal para uma categoria.', { canal: f.id(), categoria: f.id(), posicao: f.i(false, 0, 500) }, channelTarget, i => ({ parent_id: i.categoria, ...copy(i, { posicao: 'position' }) }), { alias: 'move' });
write('ordenar/canais', 'bulk-update-guild-channels', 'Altera posição de canal.', { canal: f.id(), posicao: f.i(true, 0, 500) }, undefined, i => [{ id: i.canal, position: i.posicao }], { confirm: true });
read('listar/tópicos', 'get-active-guild-threads', 'Lista tópicos ativos visíveis.');
write('criar/tópico', 'create-thread', 'Cria tópico público sem mensagem inicial.', { nome: f.s(), ...cOpt, duracao: f.choice([60, 1440, 4320, 10080], false) }, channelTarget, i => ({ name: i.nome, type: 11, auto_archive_duration: i.duracao ?? 1440 }));
for (const [name, prop, value] of [['arquivar', 'archived', true], ['desarquivar', 'archived', false], ['bloquear', 'locked', true], ['desbloquear', 'locked', false]] as const)
    write(name + '/tópico', 'update-channel', `${name} tópico.`, threadOpt, threadTarget, () => ({ [prop]: value }), { alias: name, extra: P.manageThreads });
write('editar/tópico', 'update-channel', 'Edita tópico.', { ...threadOpt, nome: f.s(false), lento: f.i(false, 0, 21600) }, threadTarget, i => copy(i, { nome: 'name', lento: 'rate_limit_per_user' }), { alias: 'thread', extra: P.manageThreads });
write('entrar/no-tópico', 'join-thread', 'Adiciona bot ao tópico.', threadOpt, threadTarget);
write('sair/do-tópico', 'leave-thread', 'Remove bot do tópico.', threadOpt, threadTarget);
write('adicionar/membro-ao-tópico', 'add-thread-member', 'Adiciona membro ao tópico.', { ...threadOpt, ...memberOpt }, { ...threadTarget, ...memberTarget }, undefined, { extra: P.manageThreads });
write('remover/membro-do-tópico', 'delete-thread-member', 'Remove membro do tópico.', { ...threadOpt, ...memberOpt }, { ...threadTarget, ...memberTarget }, undefined, { extra: P.manageThreads });
read('consultar/membro-do-tópico', 'get-thread-member', 'Consulta membro do tópico.', { ...threadOpt, ...memberOpt }, { ...threadTarget, ...memberTarget });
read('listar/membros-do-tópico', 'list-thread-members', 'Lista membros do tópico.', { ...threadOpt, quantidade: f.i(false, 1, 25) }, threadTarget, { quantidade: 'limit' });

