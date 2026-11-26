import { Fault, Json, Obj, P, str, num } from '../../contracts';
import { f, copy, read, write, cOpt, mOpt, memberOpt, roleOpt, threadOpt, eventOpt, ruleOpt, reason, channelTarget, messageTarget, memberTarget, roleTarget, threadTarget, eventTarget, ruleTarget } from '../operations/definitions';
read('verificar/estado-de-voz', 'get-voice-state', 'Consulta estado de voz de membro.', memberOpt, memberTarget);
for (const [root, field, value, mask] of [['silenciar', 'mute', true, 1n << 22n], ['reativar', 'mute', false, 1n << 22n], ['desativar', 'deaf', true, 1n << 23n], ['ativar', 'deaf', false, 1n << 23n]] as const)
    write(root + '/' + (field === 'mute' ? 'microfone' : 'áudio-recebido'), 'update-guild-member', 'Altera estado de voz.', { ...memberOpt, ...reason }, memberTarget, () => ({ [field]: value }), { alias: root, extra: mask });
write('mover/membro', 'update-guild-member', 'Move membro para canal de voz.', { ...memberOpt, canal: f.id(), ...reason }, memberTarget, i => ({ channel_id: i.canal }), { alias: 'move', extra: 1n << 24n });
write('desconectar/membro', 'update-guild-member', 'Desconecta membro de voz.', { ...memberOpt, ...reason }, memberTarget, () => ({ channel_id: null }), { alias: 'disconnect', extra: 1n << 24n, confirm: true });
write('definir/status-do-canal-de-voz', 'update-voice-channel-status', 'Define status do canal de voz.', { canal: f.id(), status: f.s(true, 500) }, channelTarget, i => ({ status: i.status }));
write('remover/status-do-canal-de-voz', 'update-voice-channel-status', 'Remove status do canal de voz.', { canal: f.id() }, channelTarget, () => ({ status: null }), { alias: 'clear' });
read('listar/regiões-de-voz', 'list-voice-regions', 'Lista regiões de voz.');

