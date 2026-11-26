import { Fault, Json, Obj, P, str, num } from '../../contracts';
import { f, copy, read, write, cOpt, mOpt, memberOpt, roleOpt, threadOpt, eventOpt, ruleOpt, reason, channelTarget, messageTarget, memberTarget, roleTarget, threadTarget, eventTarget, ruleTarget } from '../operations/definitions';
read('consultar/registro-de-auditoria', 'list-guild-audit-log-entries', 'Consulta registro de auditoria.', { autor: f.id(false), tipo: f.i(false, 1, 200), quantidade: f.i(false, 1, 25) }, undefined, { autor: 'user_id', tipo: 'action_type', quantidade: 'limit' });

