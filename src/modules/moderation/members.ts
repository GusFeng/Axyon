import { Fault, Json, Obj, P, str, num } from '../../contracts';
import { f, copy, read, write, cOpt, mOpt, memberOpt, roleOpt, threadOpt, eventOpt, ruleOpt, reason, channelTarget, messageTarget, memberTarget, roleTarget, threadTarget, eventTarget, ruleTarget } from '../operations/definitions';
read('consultar/membro', 'get-guild-member', 'Consulta membro do servidor.', memberOpt, memberTarget, undefined, true);
read('consultar/usuário', 'get-user', 'Consulta usuário membro do servidor.', memberOpt, memberTarget);
read('listar/membros', 'list-guild-members', 'Lista membros (intent pode ser exigida).', { quantidade: f.i(false, 1, 25) }, undefined, { quantidade: 'limit' });
read('buscar/membros', 'search-guild-members', 'Busca membros por nome.', { termo: f.s(), quantidade: f.i(false, 1, 25) }, undefined, { termo: 'query', quantidade: 'limit' });
write('alterar/apelido', 'update-guild-member', 'Altera apelido do membro.', { ...memberOpt, apelido: f.s(true, 32), ...reason }, memberTarget, i => ({ nick: i.apelido }), { alias: 'nick', extra: 1n << 27n });
write('restaurar/apelido', 'update-guild-member', 'Restaura apelido.', { ...memberOpt, ...reason }, memberTarget, () => ({ nick: null }), { alias: 'reset-nick', extra: 1n << 27n });
write('atribuir/cargo', 'add-guild-member-role', 'Atribui cargo não privilegiado a membro.', { ...memberOpt, ...roleOpt, ...reason }, { ...memberTarget, ...roleTarget }, undefined, { confirm: true });
write('remover/cargo', 'delete-guild-member-role', 'Remove cargo de membro.', { ...memberOpt, ...roleOpt, ...reason }, { ...memberTarget, ...roleTarget }, undefined, { confirm: true });
write('expulsar/membro', 'delete-guild-member', 'Expulsa membro após confirmação.', { ...memberOpt, ...reason }, memberTarget, undefined, { confirm: true });
write('banir/usuário', 'ban-user-from-guild', 'Bane membro após confirmação.', { ...memberOpt, 'apagar-dias': f.i(false, 0, 7), ...reason }, memberTarget, i => ({ delete_message_seconds: Number(i['apagar-dias'] ?? 0) * 86400 }), { confirm: true });
write('desbanir/usuário', 'unban-user-from-guild', 'Remove banimento.', { 'usuario-id': f.id(), ...reason }, { user: 'usuario-id' });
read('listar/banimentos', 'list-guild-bans', 'Lista banimentos.', { quantidade: f.i(false, 1, 25) }, undefined, { quantidade: 'limit' });
read('consultar/banimento', 'get-guild-ban', 'Consulta banimento.', { 'usuario-id': f.id() }, { user: 'usuario-id' });
write('restringir/comunicação', 'update-guild-member', 'Aplica timeout em minutos.', { ...memberOpt, duracao: f.i(true, 1, 40320), ...reason }, memberTarget, i => ({ communication_disabled_until: new Date(Date.now() + num(i.duracao) * 60000).toISOString() }), { alias: 'timeout', extra: 1n << 40n, confirm: true });
write('liberar/comunicação', 'update-guild-member', 'Remove timeout.', { ...memberOpt, ...reason }, memberTarget, () => ({ communication_disabled_until: null }), { alias: 'untimeout', extra: 1n << 40n });

