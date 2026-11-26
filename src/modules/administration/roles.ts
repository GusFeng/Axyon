import { Fault, Json, Obj, P, str, num } from '../../contracts';
import { f, copy, read, write, cOpt, mOpt, memberOpt, roleOpt, threadOpt, eventOpt, ruleOpt, reason, channelTarget, messageTarget, memberTarget, roleTarget, threadTarget, eventTarget, ruleTarget } from '../operations/definitions';
read('listar/cargos', 'list-guild-roles', 'Lista cargos.', {}, undefined, undefined, true);
read('consultar/cargo', 'get-guild-role', 'Consulta cargo.', roleOpt, roleTarget, undefined, true);
const color = (v: Json | undefined) => { if (v === undefined)
    return undefined; const s = str(v); if (!/^#?[0-9a-fA-F]{6}$/.test(s))
    throw new Fault('invalid_color'); return parseInt(s.replace('#', ''), 16); };
const roleBody = (i: Obj) => ({ ...copy(i, { nome: 'name', mencionavel: 'mentionable' }), ...(i.cor === undefined ? {} : { color: color(i.cor)! }) });
write('criar/cargo', 'create-guild-role', 'Cria cargo sem permissões privilegiadas.', { nome: f.s(), cor: f.s(false, 7), mencionavel: f.b() }, undefined, i => ({ ...roleBody(i), permissions: '0' }), { ai: true });
write('editar/cargo', 'update-guild-role', 'Edita nome e cor do cargo.', { ...roleOpt, nome: f.s(false), cor: f.s(false, 7), mencionavel: f.b() }, roleTarget, roleBody);
write('excluir/cargo', 'delete-guild-role', 'Exclui cargo após confirmação.', roleOpt, roleTarget, undefined, { confirm: true });
read('contar/membros-por-cargo', 'guild-role-member-counts', 'Conta membros por cargo.');
read('verificar/permissões', 'get-channel-member-permissions', 'Consulta permissões efetivas de membro.', { pessoa: f.id(), ...cOpt }, { channel: 'canal', user: 'pessoa' }); // local adapter, never private endpoint

