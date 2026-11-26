# RaiBot

Discord bot com três comandos slash permanentes:
- /ping → pong
- /deletemsg quantidade: 1–100 mensagens recentes do canal atual; exige Gerenciar mensagens e acesso ao histórico. Inclui mensagens fixadas se estiverem entre as selecionadas; mensagens antigas são apagadas individualmente quando necessário. Exclusão irreversível.
- /createchannel nome tipo: Texto ou Voz; exige Gerenciar canais.

O núcleo em operations.py é compartilhado com a interface remota control.py.
A interface HTTP aceita POST /operate via JSON com Authorization: Bearer ou formulário autenticado na raiz. Operações permitidas: ping, createchannel, deletemsg. Parâmetros: request_id único, operation, name/kind (text ou voice), channel_id e count, confirmation=DELETE para exclusão. Ping pode receber channel_id para publicar pong. Escopo remoto restrito ao servidor configurado. Não há execução arbitrária de código. Não repita uma operação de escrita sem conferir o estado; a deduplicação de request_id reside em memória e reinicia com o processo.

Railway variables: DISCORD_BOT_TOKEN (secreto), RAIBOT_CONTROL_KEY (secreto independente), RAIBOT_CONTROL_GUILD (ID de servidor autorizado), PORT (Railway). Não publique segredos no repositório ou em URLs. O bot precisa estar instalado com bot e applications.commands.
