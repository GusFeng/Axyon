# RaiBot — TypeScript

Bot Discord em TypeScript, Node.js 22 e discord.js 14.18.0, executado por Docker no Railway.

Comandos slash permanentes:
- /ping: responde pong e verifica a mensagem.
- /deletemsg quantidade: apaga até 100 mensagens recentes do canal atual, com verificação. Mensagens antigas são apagadas individualmente; mensagens fixadas podem ser incluídas. Exige Gerenciar mensagens e Ler histórico. Exclusão irreversível.
- /createchannel nome tipo: cria e verifica um canal de texto ou voz. Exige Gerenciar canais.

O núcleo reutilizável está em src/operations.ts. O código da interface remota permanece em src/control.ts, mas a execução remota está desativada por padrão (RAIBOT_CONTROL_ENABLED=true seria necessário para reativá-la). A chave e o escopo devem ser configurados e revisados antes de reativar. O GET /health permanece disponível. POST /operate aceita os mesmos parâmetros JSON, com chave Bearer, e não executa código arbitrário.

Variáveis: DISCORD_BOT_TOKEN (secreto), DISCORD_GUILD_ID (opcional), PORT, RAIBOT_CONTROL_ENABLED (opcional), RAIBOT_CONTROL_KEY e RAIBOT_CONTROL_GUILD (somente controle remoto).

Build: npm install; npm run build; npm test; npm start. Docker executa os testes antes de publicar a imagem.
