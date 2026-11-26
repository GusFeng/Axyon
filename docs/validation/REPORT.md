# Relatório técnico — reconstrução interna Axyon 3.0.0

Data: 26/11/2026. Candidato local, não implantado. A base histórica foi lida, não executada nem modificada. Este relatório não é uma certificação de paridade total ou de produção.

## Fontes efetivamente utilizadas

| Fonte | SHA-256 | Finalidade |
|---|---|---|
| Axyon-Z-main.zip | 2b0238cdf3bdca6127ec605d2389b8f9a8c82d73be62134e72e87eea38d12679 | Rust histórico recebido nesta tarefa: matriz, catálogo, handlers e contratos |
| Axyon-main.zip | 5d3b02f78948c9a108717bed96dfff0cd93aa09193615eab733f373b1b7f2b23 | Base operacional TypeScript, provider, variáveis, Docker e referência de testes |
| AXYON_ESPECIFICACAO_MESTRE_RECONSTRUCAO_TYPESCRIPT.md | 2c52231265ef4ea3b66e85933be30eeac54d08be67f417b1d9cc08914988933a | Requisitos normativos reinterpretados para Railway |

Também foram consultados o histórico disponível da conversa, o plano mestre anterior e o relatório de auditoria integral. O ZIP Rust recebido agora é uma fotografia diferente do último candidato modular anterior: seu JSON bruto tem 69 raízes, inclusive `/painel`, e 267 folhas. Não foi assumida equivalência com as 71 raízes de outro pacote nem com o registro histórico de 66 comandos no Discord. O inventário de 250 endpoints e a matriz de 153 capacidades foram extraídos do ZIP efetivamente recebido; não são um inventário atual verificado da API pública do Discord. Não foram copiados segredos, dados reais, logs operacionais antigos ou IDs ativos como defaults.

## Entrega

- 15 módulos registrados e governados por dependências; 216 capacidades (166 variantes de plano de integração, incluindo 4 cálculos de permissões locais, e 50 capacidades locais); 218 projeções slash em 67 raízes candidatas. 13 capacidades explicitamente autorizáveis pela IA; modo inicial conversacional.
- 135 de 153 IDs da matriz histórica possuem pelo menos um plano no novo catálogo; 18 não expostos. 186 de 267 nomes de folhas históricas têm correspondência no novo catálogo; 81 não possuem correspondência nominal. Uma correspondência nominal não comprova paridade de opções, comportamento ou endpoint. `reference/coverage.json` contém opções antigas/novas e razões de exclusão; não contar variantes como endpoints distintos.
- Microkernel, contratos, registro, execução única para comandos/IA/rotinas, gates de módulo por servidor, confirmação descartável, verificação de alvo e permissões independentes, deduplicação persistente e tratamento de resultado incerto. Painéis com componentes funcionais para `/ia` e `/modulos`, configurações por slash, consentimento individual de memória e controles de segurança.
- Gateway Node, cliente Discord.js encapsulado, provider configurável reaproveitado da base, comunicação por menções/canais diretos e replies, DMs opt-in exclusivamente conversacionais, seleção limitada de ferramentas. A antiga superfície HTTP administrativa não faz parte do runtime.
- SQLite real com CAS, recibos, auditoria, quotas, jobs e memória; fluxos sequenciais até 5 passos, eventos por prefixo restritos ao criador, agenda por intervalo, inventário de servidor limitado. Logs e métricas locais sem conteúdo da conversa.

## Evidências locais executadas

| Gate | Resultado | Observações |
|---|---|---|
| Node.js | v22.16.0 | runtime real disponível |
| TypeScript | 5.8.3 | `npm run build` e `npm run typecheck` passaram |
| Node test runner | 218 aprovados, 0 falhas | `npm test`; 166 contratos de plano e 52 outros testes |
| SQLite | aprovado | SQL executado em banco real, isolamento, CAS com duas conexões, recibos, consumo de confirmações, quotas e persistência |
| HTTP local | aprovado | servidor real `/ready` e rejeição de rota de controle; Gateway simulado |
| Discord adapter | aprovado em simulação | alvo entre guilds, hierarquia, redaction, readback e cálculo local de permissão |
| AI | aprovado em simulação | resposta do provider injetada, memória consentida, rejeição de plano desconhecido/ID não expresso |
| Grafo de imports relativos | aprovado | 39 arquivos TS; sem ciclos detectados; IA e Commands independentes |
| npm registry | bloqueado | `npm install --ignore-scripts --no-audit --no-fund --fetch-retries=0 --fetch-timeout=8000` retornou EAI_AGAIN para registry.npmjs.org/@types%2fnode |
| Discord.js real | não executado | dependência não instalada; fronteira estrutural compilada, sem alegação de validação contra os tipos reais da SDK |
| Lockfile | ausente | base não o tinha; não foi possível resolver dependências no registry. Docker aceita instalação inicial; gerar lockfile e passar a npm ci no ambiente conectado |
| Docker/Railway/Discord/Cloudflare | não executado | escopo atual somente engenharia interna; nenhum deploy ou API externa autenticada |

A compilação local utilizou `@types/node` 25.1.0 disponível no ambiente, não a versão 22.15.3 fixada no manifesto. A versão exata de dependências de produção deve ser validada após instalação. Não foram usados stubs de tipos do Discord.js para fingir integração real. A SDK é carregada somente no limite de runtime; testes injetam um transporte sintético explicitamente. O arquivo `LOCAL-GATES.txt` é a saída efetiva de `npm run check`. Não foram executados ESLint/Prettier nem benchmark de latência/custo real. Os testes de contrato demonstram a construção de planos, não a aceitação de todas as rotas pela API remota.

## Lacunas funcionais — não confundir com limitações do ambiente

A reconstrução **não atingiu paridade total**. O inventário explicita o que foi e o que não foi implementado. Entre as lacunas: APIs de busca de mensagens não verificadas, remoção segura de sobrescrita, banimento/prune em massa com alvos congelados, OAuth/consentimento de usuário, comandos arbitrários de outras aplicações, monetização, integração de voz e áudio, anexos binários de stickers/soundboard, onboarding mutável complexo, operações de webhook com token e mutação global da própria aplicação. Algumas foram excluídas deliberadamente por escopo/segurança; outras são implementações ainda ausentes. Não declarar que todas são bloqueios externos. Opções de vários comandos foram reduzidas/alteradas para tipos explícitos e limites conservadores. A automação oferece ações de mensagem, não o antigo motor genérico completo; o blueprint é exportação limitada sem import/restauração. IA executa uma proposta por vez, não planejamento autônomo multioperações. A interface administrativa usa botões e slash, não todos os seletores/modais avançados da especificação. Não há HA, banco PostgreSQL, métricas distribuídas, preço por token ou restauração automática de efeitos externos.

## Critérios antes de promoção

1. Em ambiente conectado, instalar dependências reais, gerar lockfile, executar `npm ci` e `npm run check` com as versões exatas; revisar vulnerabilidades e build Docker.
2. Verificar superfície candidata e autorização de todos os endpoints com API oficial atual, especialmente os historicamente condicionados; complementar contratos e testes de SDK reais. Não registrar operação não aprovada.
3. Definir armazenamento durável/volume e backup, orçamento Railway e estratégia de uma réplica. Não importar D1 ou dados antigos implicitamente.
4. Em ambiente autorizado, validar Gateway, intents, registro guild-only, interações e políticas efetivas. Operações mutáveis/destrutivas apenas em recursos de teste explicitamente autorizados. Validar provider IA e limites, latência, métricas e recuperação.
5. Corrigir lacunas de produto conforme matriz de rastreabilidade. A especificação mestre foi usada como objetivo, não como alegação de conclusão de todos os 50 critérios.

Nenhuma mudança foi realizada em GitHub, Railway, Discord ou Cloudflare nesta execução. Nenhuma credencial foi necessária ou criada. O pacote é uma única entrega local do código reconstruído, com limitações registradas, não uma versão certificada para implantação.
