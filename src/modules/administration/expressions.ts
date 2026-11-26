import { Fault, Json, Obj, P, str, num } from '../../contracts';
import { f, copy, read, write, cOpt, mOpt, memberOpt, roleOpt, threadOpt, eventOpt, ruleOpt, reason, channelTarget, messageTarget, memberTarget, roleTarget, threadTarget, eventTarget, ruleTarget } from '../operations/definitions';
for (const [plural, singular, op, target] of [['emojis', 'emoji', 'emoji', 'emoji'], ['figurinhas', 'figurinha', 'sticker', 'figurinha'], ['sons', 'som', 'soundboard-sound', 'som']] as const) {
    const t = op === 'soundboard-sound' ? 'sound' : op;
    read('listar/' + plural, 'list-guild-' + (op === 'emoji' ? 'emojis' : op === 'sticker' ? 'stickers' : 'soundboard-sounds'), 'Lista ' + plural + '.');
    read('consultar/' + singular, 'get-guild-' + op, 'Consulta ' + singular + '.', { [target]: f.id() }, { [t]: target });
    write('excluir/' + singular, 'delete-guild-' + op, 'Exclui ' + singular + ' após confirmação.', { [target]: f.id() }, { [t]: target }, undefined, { confirm: true });
}
write('editar/emoji', 'update-guild-emoji', 'Renomeia emoji.', { emoji: f.id(), 'novo-nome': f.s(true, 32) }, { emoji: 'emoji' }, i => ({ name: i['novo-nome'] }));
write('editar/figurinha', 'update-guild-sticker', 'Edita figurinha.', { figurinha: f.id(), nome: f.s(false, 30), tags: f.s(false, 200), descricao: f.s(false, 100) }, { sticker: 'figurinha' }, i => copy(i, { nome: 'name', tags: 'tags', descricao: 'description' }));
write('editar/som', 'update-guild-soundboard-sound', 'Renomeia som.', { som: f.id(), nome: f.s(true, 32) }, { sound: 'som' }, i => ({ name: i.nome }));

