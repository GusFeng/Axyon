# RaiBot

Bot experimental do Discord, independente do Axyon-Z. Único comando: `/ping` → `pong`.

Deploy pelo Railway, a partir da branch `main`. Configure `DISCORD_BOT_TOKEN` como variável secreta no Railway (nunca no GitHub). Use uma aplicação Discord dedicada a este teste, instalada no servidor com o escopo `bot` e `applications.commands`. Opcionalmente defina `DISCORD_GUILD_ID` para registrar o comando imediatamente no servidor de teste.

O runtime executa autotestes, verifica a conectividade HTTPS com Discord e, quando houver token, conecta ao Gateway, registra `/ping` e confirma o registro por leitura da API. Os logs registram a execução real e a confirmação da resposta sem expor credenciais. Sem token, o processo termina após o diagnóstico para não manter consumo contínuo.

Teste local: `python -m unittest -v`. Execução: `python bot.py`.
