import { Fault, Json, Obj, P, str, num } from '../../contracts';
import { f, copy, read, write, cOpt, mOpt, memberOpt, roleOpt, threadOpt, eventOpt, ruleOpt, reason, channelTarget, messageTarget, memberTarget, roleTarget, threadTarget, eventTarget, ruleTarget } from '../operations/definitions';
read('listar/eventos', 'list-guild-scheduled-events', 'Lista eventos agendados.', {}, undefined, undefined, true);
read('consultar/evento', 'get-guild-scheduled-event', 'Consulta evento.', eventOpt, eventTarget);
for (const [r, v] of [['iniciar', 2], ['concluir', 3], ['cancelar', 4]] as const)
    write(r + '/evento', 'update-guild-scheduled-event', 'Altera estado do evento.', { ...eventOpt, ...reason }, eventTarget, () => ({ status: v }), { alias: r, confirm: true });
write('editar/evento', 'update-guild-scheduled-event', 'Edita nome e descrição do evento.', { ...eventOpt, nome: f.s(false), descricao: f.s(false, 1000) }, eventTarget, i => copy(i, { nome: 'name', descricao: 'description' }));
write('excluir/evento', 'delete-guild-scheduled-event', 'Exclui evento.', eventOpt, eventTarget, undefined, { confirm: true });
read('listar/interessados-no-evento', 'list-guild-scheduled-event-users', 'Lista interessados.', { ...eventOpt, quantidade: f.i(false, 1, 25) }, eventTarget, { quantidade: 'limit' });

