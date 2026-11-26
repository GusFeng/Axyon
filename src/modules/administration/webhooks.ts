import { Fault, Json, Obj, P, str, num } from '../../contracts';
import { f, copy, read, write, cOpt, mOpt, memberOpt, roleOpt, threadOpt, eventOpt, ruleOpt, reason, channelTarget, messageTarget, memberTarget, roleTarget, threadTarget, eventTarget, ruleTarget } from '../operations/definitions';
read('listar/webhooks', 'get-guild-webhooks', 'Lista metadados seguros de webhooks.');
write('criar/webhook', 'create-webhook', 'Cria webhook; token nunca é exibido.', { canal: f.id(), nome: f.s(true, 80) }, channelTarget, i => ({ name: i.nome }), { confirm: true });

