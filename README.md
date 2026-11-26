# RaiBot — TypeScript

Bot Discord em TypeScript, Node.js 22 e discord.js 14.18.0, executado por Docker no Railway.

Comandos slash permanentes:
- /ping: responde pong e verifica a mensagem.
- /deletemsg quantidade: apaga até 100 mensagens recentes do canal atual, com verificação. Mensagens antigas são apagadas individualmente; mensagens fixadas podem ser incluídas. Exige Gerenciar mensagens e Ler histórico. Exclusão irreversível.
- /createchannel nome tipo: cria e verifica um canal de texto ou voz. Exige Gerenciar canais.

O núcleo reutilizável está em src/operations.ts. O código da interface remota permanece em src/control.ts, mas a execução remota está desativada por padrão (RAIBOT_CONTROL_ENABLED=true seria necessário para reativá-la). A chave e o escopo devem ser configurados e revisados antes de reativar. O GET /health permanece disponível. POST /operate aceita os mesmos parâmetros JSON, com chave Bearer, e não executa código arbitrário.

Variáveis: DISCORD_BOT_TOKEN (secreto), DISCORD_GUILD_ID (opcional), PORT, RAIBOT_CONTROL_ENABLED (opcional), RAIBOT_CONTROL_KEY e RAIBOT_CONTROL_GUILD (somente controle remoto).

Build: npm install; npm run build; npm test; npm start. Docker executa os testes antes de publicar a imagem.

## IA por menção

No servidor autorizado, mencione @Buteco e escreva a pergunta. O bot envia somente a pergunta à API externa e publica a resposta. Não executa ações administrativas por meio da IA. Ignora outros bots, webhooks e outros servidores. As respostas não disparam menções; há limite de frequência e de simultaneidade.

Variáveis Railway:
- API (ou AI_API_KEY): credencial secreta.
- AI_API_URL: URL HTTPS completa do endpoint de geração (sem query string).
- AI_MODEL: identificador exato do modelo escolhido.
- AI_FORMAT: openai (padrão, chat completions compatível), anthropic (Messages) ou gemini (generateContent; URL deve conter o modelo).
- AI_GUILD_ID: opcional; usa RAIBOT_CONTROL_GUILD se omitida.

Sem URL e modelo, o bot não envia a chave a nenhum provedor. A IA está pronta para configuração, não há memória persistente. Não envie credenciais no Discord, logs ou repositório.

### Cloudflare Workers AI

Use AI_FORMAT=openai, AI_API_URL=https://api.cloudflare.com/client/v4/accounts/<account_id>/ai/v1/chat/completions e AI_MODEL=@cf/meta/llama-3.1-8b-instruct-fast. O token existente API precisa de permissão Workers AI Write. AI_STARTUP_CHECK=true habilita uma consulta curta de diagnóstico por inicialização, sem publicar mensagens no Discord. Respostas têm limite de 500 tokens no formato chat completions. O consumo está sujeito à franquia e ao plano Cloudflare.
