# Validação real de produção — 26/11/2026

O release 3.0 foi conectado ao serviço Railway existente e o source passou a seguir GusFeng/Axyon main. Credenciais originais mantidas; nenhuma publicada. Ambiente Node 22.23.5 e Discord.js 14.18.0; 218 testes do candidato passaram no Docker real. Lockfile extraído do npm install efetivamente executado e publicado, com npm ci validado no deploy seguinte.

SQLite em volume /data, 100 MB, uma réplica. O bootstrap prepara o volume e abandona UID 0 antes da conexão com Discord/AI. Integridade SQLite aprovada. Healthcheck /ready configurado. Não houve migração de D1 histórico nem alteração de plano de cobrança.

Discord: 67 comandos guild-only, read-back confirmado; três registros globais antigos removidos e contagem global zero. Flags da aplicação confirmaram suporte aos intents de mensagens e membros. Nenhuma permissão de usuário ou cargo existente foi alterada.

Workers AI: inferência direta Cloudflare bem-sucedida (491 ms de requisição), e inferências pelo novo container de 382, 299 e 329 ms nas inicializações observadas; conteúdo não vazio. Modelo configurado @cf/meta/llama-3.1-8b-instruct-fast; o endpoint direto respondeu com alias v2. Não são medições de latência ponta a ponta nem benchmark.

Deploy 8ca08f6: 9 passos de smoke real aprovados, zero falhas. Fixture privada criada pelo bot; kernel ping, leitura de canal, envio, edição e releitura de mensagem, cancelamento e replay de confirmação, proteção do canal de origem, dados de painéis, motor de IA e workflow de envio. Fixture removida somente após verificação de identidade e autoria das mensagens, ausência confirmada por GET. Nenhum recurso preexistente foi removido. O smoke usou a identidade do próprio bot e não simulou um usuário humano real. Não equivale a um teste genuíno de interação slash emitida pelo cliente Discord.

Limites: catálogo de 216 capacidades/67 raízes, cobertura histórica 135/153 operações e 186/267 folhas, sem garantia de paridade de parâmetros. As 18 operações e 81 folhas sem correspondência permanecem em reference/coverage.json; exclusões intencionais e funcionalidades ausentes são distinguidas. Nem todos os endpoints foram executados em produção; não testar destrutivamente recursos reais. A verificação genuína de clique/menção de usuário, operações avançadas de voz/OAuth/binários, restauração/HA, e auditoria integral das demais rotas não são certificadas por estes resultados.
