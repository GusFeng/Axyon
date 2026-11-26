import { Fault, Json, Obj, P, str, num } from '../../contracts';
import { f, copy, read, write, cOpt, mOpt, memberOpt, roleOpt, threadOpt, eventOpt, ruleOpt, reason, channelTarget, messageTarget, memberTarget, roleTarget, threadTarget, eventTarget, ruleTarget } from '../operations/definitions';
read('listar/mensagens', 'list-messages', 'Consulta mensagens recentes.', { ...cOpt, quantidade: f.i(false, 1, 25), antes: f.id(false) }, channelTarget, { quantidade: 'limit', antes: 'before' });
read('consultar/mensagem', 'get-message', 'Consulta mensagem pelo ID.', mOpt, messageTarget);
write('enviar/mensagem', 'create-message', 'Envia mensagem sem menções automáticas.', { texto: f.s(true, 1900), ...cOpt }, channelTarget, i => ({ content: i.texto, allowed_mentions: { parse: [] } }), { ai: true, automated: true });
write('editar/mensagem', 'update-message', 'Edita mensagem do próprio bot.', { ...mOpt, texto: f.s(true, 1900) }, messageTarget, i => ({ content: i.texto, allowed_mentions: { parse: [] } }));
write('excluir/mensagem', 'delete-message', 'Exclui mensagem pelo ID.', mOpt, messageTarget, undefined, { confirm: true, effect: 'destructive' });
write('excluir/mensagens', 'bulk-delete-messages', 'Exclui mensagens recentes, preservando fixadas e antigas.', { ...cOpt, quantidade: f.i(true, 1, 100), membro: f.id(false) }, channelTarget, i => ({ count: i.quantidade, author: i.membro ?? null }), { local: 'purge', confirm: true, effect: 'destructive' });
write('publicar/mensagem', 'crosspost-message', 'Publica mensagem de anúncio.', mOpt, messageTarget);
write('fixar/mensagem', 'create-pin', 'Fixa mensagem.', mOpt, messageTarget);
write('desafixar/mensagem', 'delete-pin', 'Desafixa mensagem.', mOpt, messageTarget);
read('listar/mensagens-fixadas', 'list-pins', 'Lista mensagens fixadas.', cOpt, channelTarget);
write('adicionar/reação', 'add-my-message-reaction', 'Adiciona reação do bot.', { ...mOpt, emoji: f.s() }, { ...messageTarget, emoji: 'emoji' });
read('listar/usuários-da-reação', 'list-message-reactions-by-emoji', 'Lista usuários de uma reação.', { ...mOpt, emoji: f.s(), quantidade: f.i(false, 1, 25) }, { ...messageTarget, emoji: 'emoji' }, { quantidade: 'limit' });
write('remover/reação', 'delete-my-message-reaction', 'Remove reação do próprio bot.', { ...mOpt, emoji: f.s() }, { ...messageTarget, emoji: 'emoji' });
write('indicar/digitação', 'trigger-typing-indicator', 'Indica digitação.', cOpt, channelTarget);
read('listar/votantes', 'get-answer-voters', 'Lista votantes de uma opção.', { ...mOpt, opcao: f.i(true, 1, 10), quantidade: f.i(false, 1, 25) }, { ...messageTarget, answer: 'opcao' }, { quantidade: 'limit' });
write('encerrar/enquete', 'poll-expire', 'Encerra enquete do bot.', mOpt, messageTarget, undefined, { confirm: true });

