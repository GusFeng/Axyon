import { Fault, Json, Obj, P, str, num } from '../../contracts';
import { f, copy, read, write, cOpt, mOpt, memberOpt, roleOpt, threadOpt, eventOpt, ruleOpt, reason, channelTarget, messageTarget, memberTarget, roleTarget, threadTarget, eventTarget, ruleTarget } from '../operations/definitions';
read('listar/regras-de-moderação', 'list-auto-moderation-rules', 'Lista regras de AutoMod.');
read('consultar/regra-de-moderação', 'get-auto-moderation-rule', 'Consulta regra de AutoMod.', ruleOpt, ruleTarget);
for (const [r, v] of [['ativar', true], ['desativar', false]] as const)
    write(r + '/regra-de-moderação', 'update-auto-moderation-rule', 'Altera ativação da regra.', ruleOpt, ruleTarget, () => ({ enabled: v }), { alias: r, confirm: true });
write('editar/regra-de-moderação', 'update-auto-moderation-rule', 'Renomeia regra de AutoMod.', { ...ruleOpt, nome: f.s() }, ruleTarget, i => ({ name: i.nome }), { confirm: true });
write('excluir/regra-de-moderação', 'delete-auto-moderation-rule', 'Exclui regra de AutoMod.', ruleOpt, ruleTarget, undefined, { confirm: true });

