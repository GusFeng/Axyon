// Historical slash definitions, not published automatically.
export const historicalCommands = [
  {
    "description": "Acompanhar tarefas assíncronas oficiais",
    "name": "acompanhar",
    "options": [
      {
        "description": "Status da tarefa de usuários do convite",
        "name": "atualização-do-convite",
        "options": [],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "1",
    "description": "Adicionar reação ou participante",
    "name": "adicionar",
    "options": [
      {
        "description": "Adicionar reação do bot a uma mensagem",
        "name": "reação",
        "options": [
          {
            "description": "ID da mensagem",
            "name": "mensagem",
            "required": true,
            "type": 3
          },
          {
            "description": "Emoji unicode ou personalizado (nome:id)",
            "name": "emoji",
            "required": true,
            "type": 3
          },
          {
            "description": "Canal (padrão: o atual)",
            "name": "canal",
            "required": false,
            "type": 7
          }
        ],
        "type": 1
      },
      {
        "description": "Adicionar membro a um tópico privado",
        "name": "membro-ao-tópico",
        "options": [
          {
            "description": "ID do tópico",
            "name": "topico",
            "required": true,
            "type": 3
          },
          {
            "description": "Pessoa alvo",
            "name": "pessoa",
            "required": true,
            "type": 6
          }
        ],
        "type": 1
      },
      {
        "description": "Autorizar usuário em convite direcionado",
        "name": "usuário-ao-convite",
        "options": [
          {
            "description": "Código do convite",
            "name": "codigo",
            "required": true,
            "type": 3
          },
          {
            "description": "ID numérico do usuário no Discord",
            "name": "usuario-id",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "134217728",
    "description": "Alterar apelido de membro",
    "name": "alterar",
    "options": [
      {
        "description": "Definir apelido de um membro",
        "name": "apelido",
        "options": [
          {
            "description": "Pessoa alvo",
            "name": "pessoa",
            "required": true,
            "type": 6
          },
          {
            "description": "Novo apelido (1–32)",
            "name": "apelido",
            "required": true,
            "type": 3
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "17179869184",
    "description": "Arquivar tópico",
    "name": "arquivar",
    "options": [
      {
        "description": "Arquivar um tópico",
        "name": "tópico",
        "options": [
          {
            "description": "ID do tópico",
            "name": "topico",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "32",
    "description": "Ativar regra ou áudio recebido",
    "name": "ativar",
    "options": [
      {
        "description": "Ativar uma regra de moderação automática",
        "name": "regra-de-moderação",
        "options": [
          {
            "description": "ID da regra",
            "name": "regra",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Permitir que o membro ouça o áudio da voz",
        "name": "áudio-recebido",
        "options": [
          {
            "description": "Pessoa alvo",
            "name": "pessoa",
            "required": true,
            "type": 6
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "268435456",
    "description": "Atribuir cargo a membro",
    "name": "atribuir",
    "options": [
      {
        "description": "Atribuir um cargo a um membro",
        "name": "cargo",
        "options": [
          {
            "description": "Pessoa alvo",
            "name": "pessoa",
            "required": true,
            "type": 6
          },
          {
            "description": "Cargo a atribuir",
            "name": "cargo",
            "required": true,
            "type": 8
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "32",
    "description": "Avaliar solicitações de entrada",
    "name": "avaliar",
    "options": [
      {
        "description": "Aprovar ou rejeitar solicitação de entrada",
        "name": "solicitação-de-entrada",
        "options": [
          {
            "description": "ID da solicitação",
            "name": "solicitacao",
            "required": true,
            "type": 3
          },
          {
            "choices": [
              {
                "name": "aprovar",
                "value": "aprovar"
              },
              {
                "name": "rejeitar",
                "value": "rejeitar"
              }
            ],
            "description": "Decisão",
            "name": "decisao",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "4",
    "description": "Banir usuários do servidor",
    "name": "banir",
    "options": [
      {
        "description": "Banir um usuário do servidor",
        "name": "usuário",
        "options": [
          {
            "description": "Pessoa alvo",
            "name": "pessoa",
            "required": true,
            "type": 6
          },
          {
            "description": "Remover mensagens anteriores (0–7 dias)",
            "max_value": 7,
            "min_value": 0,
            "name": "apagar-dias",
            "required": false,
            "type": 4
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "17179869184",
    "description": "Bloquear tópico",
    "name": "bloquear",
    "options": [
      {
        "description": "Bloquear novas mensagens em um tópico",
        "name": "tópico",
        "options": [
          {
            "description": "ID do tópico",
            "name": "topico",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "description": "Buscar membros, mensagens ou tópicos",
    "name": "buscar",
    "options": [
      {
        "description": "Buscar membros por nome ou apelido",
        "name": "membros",
        "options": [
          {
            "description": "Termo de busca (2–100)",
            "name": "termo",
            "required": true,
            "type": 3
          },
          {
            "description": "Quantidade de itens (padrão do comando)",
            "max_value": 100,
            "min_value": 1,
            "name": "quantidade",
            "required": false,
            "type": 4
          }
        ],
        "type": 1
      },
      {
        "description": "Buscar mensagens no servidor",
        "name": "mensagens",
        "options": [
          {
            "description": "Termo de busca (3–100)",
            "name": "termo",
            "required": true,
            "type": 3
          },
          {
            "description": "Canal (padrão: o atual)",
            "name": "canal",
            "required": false,
            "type": 7
          },
          {
            "description": "Autor para filtrar",
            "name": "autor",
            "required": false,
            "type": 6
          }
        ],
        "type": 1
      },
      {
        "description": "Buscar tópicos (operação em revisão)",
        "name": "tópicos",
        "options": [
          {
            "description": "Termo de busca",
            "name": "termo",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "8589934592",
    "description": "Cancelar evento agendado",
    "name": "cancelar",
    "options": [
      {
        "description": "Cancelar um evento agendado",
        "name": "evento",
        "options": [
          {
            "description": "ID do evento",
            "name": "id",
            "required": true,
            "type": 3
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "8589934592",
    "description": "Concluir evento agendado",
    "name": "concluir",
    "options": [
      {
        "description": "Marcar um evento como concluído",
        "name": "evento",
        "options": [
          {
            "description": "ID do evento",
            "name": "id",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "32",
    "description": "Configurar recursos nativos e o Axyon",
    "name": "configurar",
    "options": [
      {
        "description": "Configurar entrada de novos membros (onboarding)",
        "name": "entrada-de-novos-membros",
        "options": [
          {
            "description": "Ativar onboarding",
            "name": "ativo",
            "required": false,
            "type": 5
          },
          {
            "choices": [
              {
                "name": "padrao",
                "value": "onboarding_default"
              },
              {
                "name": "personalizado",
                "value": "onboarding_custom"
              }
            ],
            "description": "Modo de onboarding",
            "name": "modo",
            "required": false,
            "type": 3
          },
          {
            "description": "JSON das perguntas/canais oficiais",
            "name": "corpo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Configurar o widget do servidor",
        "name": "widget-do-servidor",
        "options": [
          {
            "description": "Habilitar widget",
            "name": "ativo",
            "required": false,
            "type": 5
          },
          {
            "description": "Canal do invite do widget",
            "name": "canal",
            "required": false,
            "type": 7
          }
        ],
        "type": 1
      },
      {
        "description": "Ver configurações do Axyon neste servidor",
        "name": "ver",
        "options": [],
        "type": 1
      },
      {
        "description": "Definir uma configuração do Axyon",
        "name": "definir",
        "options": [
          {
            "description": "Chave de configuração",
            "name": "chave",
            "required": true,
            "type": 3
          },
          {
            "description": "Novo valor",
            "name": "valor",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Redefinir uma configuração para o padrão",
        "name": "redefinir",
        "options": [
          {
            "description": "Chave a redefinir",
            "name": "chave",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Exportar configurações como JSON",
        "name": "exportar",
        "options": [],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "description": "Consultar um recurso específico",
    "name": "consultar",
    "options": [
      {
        "description": "Consultar banimento de um usuário",
        "name": "banimento",
        "options": [
          {
            "description": "ID numérico do usuário no Discord",
            "name": "usuario-id",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Consultar canal, categoria ou tópico",
        "name": "canal",
        "options": [
          {
            "description": "Canal alvo",
            "name": "canal",
            "required": true,
            "type": 7
          }
        ],
        "type": 1
      },
      {
        "description": "Consultar um cargo",
        "name": "cargo",
        "options": [
          {
            "description": "Cargo a consultar",
            "name": "cargo",
            "required": true,
            "type": 8
          }
        ],
        "type": 1
      },
      {
        "description": "Resolver e consultar um convite",
        "name": "convite",
        "options": [
          {
            "description": "Código do convite",
            "name": "codigo",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Consultar um emoji do servidor",
        "name": "emoji",
        "options": [
          {
            "description": "ID ou nome:id do emoji",
            "name": "emoji",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Consultar onboarding de novos membros",
        "name": "entrada-de-novos-membros",
        "options": [],
        "type": 1
      },
      {
        "description": "Consultar um evento agendado",
        "name": "evento",
        "options": [
          {
            "description": "ID do evento",
            "name": "id",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Consultar uma figurinha do servidor",
        "name": "figurinha",
        "options": [
          {
            "description": "ID da figurinha",
            "name": "figurinha",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Consultar vanity URL do servidor",
        "name": "link-personalizado",
        "options": [],
        "type": 1
      },
      {
        "description": "Consultar um membro do servidor",
        "name": "membro",
        "options": [
          {
            "description": "Pessoa alvo",
            "name": "pessoa",
            "required": true,
            "type": 6
          }
        ],
        "type": 1
      },
      {
        "description": "Consultar participante de um tópico",
        "name": "membro-do-tópico",
        "options": [
          {
            "description": "ID do tópico",
            "name": "topico",
            "required": true,
            "type": 3
          },
          {
            "description": "Pessoa alvo",
            "name": "pessoa",
            "required": true,
            "type": 6
          }
        ],
        "type": 1
      },
      {
        "description": "Consultar uma mensagem por ID",
        "name": "mensagem",
        "options": [
          {
            "description": "ID da mensagem",
            "name": "mensagem",
            "required": true,
            "type": 3
          },
          {
            "description": "Canal (padrão: o atual)",
            "name": "canal",
            "required": false,
            "type": 7
          }
        ],
        "type": 1
      },
      {
        "description": "Consultar mensagem enviada por webhook",
        "name": "mensagem-via-webhook",
        "options": [
          {
            "description": "ID do webhook",
            "name": "id",
            "required": true,
            "type": 3
          },
          {
            "description": "ID da mensagem",
            "name": "mensagem",
            "required": true,
            "type": 3
          },
          {
            "description": "Token do webhook (do operador)",
            "name": "token",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Consultar um modelo de servidor",
        "name": "modelo-do-servidor",
        "options": [
          {
            "description": "Código do modelo",
            "name": "codigo",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Consultar instância de palco de um canal",
        "name": "palco",
        "options": [
          {
            "description": "Canal alvo",
            "name": "canal",
            "required": true,
            "type": 7
          }
        ],
        "type": 1
      },
      {
        "description": "Consultar o próprio usuário do bot",
        "name": "perfil-do-bot",
        "options": [],
        "type": 1
      },
      {
        "description": "Consultar o perfil do bot neste servidor",
        "name": "perfil-do-bot-no-servidor",
        "options": [],
        "type": 1
      },
      {
        "description": "Consultar o registro de auditoria oficial",
        "name": "registro-de-auditoria",
        "options": [
          {
            "description": "Filtrar por autor",
            "name": "autor",
            "required": false,
            "type": 6
          },
          {
            "description": "Tipo de ação (número)",
            "name": "tipo",
            "required": false,
            "type": 4
          },
          {
            "description": "Quantidade de itens (padrão do comando)",
            "max_value": 100,
            "min_value": 1,
            "name": "quantidade",
            "required": false,
            "type": 4
          }
        ],
        "type": 1
      },
      {
        "description": "Consultar uma regra de moderação automática",
        "name": "regra-de-moderação",
        "options": [
          {
            "description": "ID da regra",
            "name": "regra",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Consultar o servidor atual",
        "name": "servidor",
        "options": [],
        "type": 1
      },
      {
        "description": "Consultar um som do servidor",
        "name": "som",
        "options": [
          {
            "description": "ID do som",
            "name": "som",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Consultar a tela de boas-vindas",
        "name": "tela-de-boas-vindas",
        "options": [],
        "type": 1
      },
      {
        "description": "Consultar perfil público de um usuário",
        "name": "usuário",
        "options": [
          {
            "description": "Pessoa alvo (padrão: você)",
            "name": "pessoa",
            "required": false,
            "type": 6
          }
        ],
        "type": 1
      },
      {
        "description": "Consultar um webhook",
        "name": "webhook",
        "options": [
          {
            "description": "ID do webhook",
            "name": "id",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Consultar configurações do widget",
        "name": "widget-do-servidor",
        "options": [],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "description": "Contagens oficiais de membros",
    "name": "contar",
    "options": [
      {
        "description": "Contar interessados em um evento (revisão)",
        "name": "interessados-no-evento",
        "options": [
          {
            "description": "ID do evento",
            "name": "id",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Contagem oficial de membros por cargo",
        "name": "membros-por-cargo",
        "options": [],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "16",
    "description": "Criar canais, cargos, eventos e recursos",
    "name": "criar",
    "options": [
      {
        "description": "Criar um canal no servidor",
        "name": "canal",
        "options": [
          {
            "description": "Nome do canal (1–100)",
            "name": "nome",
            "required": true,
            "type": 3
          },
          {
            "choices": [
              {
                "name": "texto",
                "value": "0"
              },
              {
                "name": "voz",
                "value": "2"
              },
              {
                "name": "anuncios",
                "value": "5"
              },
              {
                "name": "palco",
                "value": "13"
              },
              {
                "name": "forum",
                "value": "15"
              },
              {
                "name": "midia",
                "value": "16"
              }
            ],
            "description": "Tipo de canal",
            "name": "tipo",
            "required": false,
            "type": 3
          },
          {
            "description": "Categoria pai",
            "name": "categoria",
            "required": false,
            "type": 7
          },
          {
            "description": "Tópico do canal",
            "name": "topico",
            "required": false,
            "type": 3
          },
          {
            "description": "Marcar como adulto",
            "name": "nsfw",
            "required": false,
            "type": 5
          },
          {
            "description": "Modo lento em segundos",
            "max_value": 21600,
            "min_value": 0,
            "name": "lento",
            "required": false,
            "type": 4
          }
        ],
        "type": 1
      },
      {
        "description": "Criar um cargo",
        "name": "cargo",
        "options": [
          {
            "description": "Nome do cargo (1–100)",
            "name": "nome",
            "required": true,
            "type": 3
          },
          {
            "description": "Cor em hex (ex: #5865F2)",
            "name": "cor",
            "required": false,
            "type": 3
          },
          {
            "description": "Permitir menção ao cargo",
            "name": "mencionavel",
            "required": false,
            "type": 5
          }
        ],
        "type": 1
      },
      {
        "description": "Criar uma categoria de canais",
        "name": "categoria",
        "options": [
          {
            "description": "Nome da categoria",
            "name": "nome",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Criar um convite para o canal",
        "name": "convite",
        "options": [
          {
            "description": "Canal (padrão: o atual)",
            "name": "canal",
            "required": false,
            "type": 7
          },
          {
            "choices": [
              {
                "name": "30min",
                "value": "1800"
              },
              {
                "name": "1h",
                "value": "3600"
              },
              {
                "name": "6h",
                "value": "21600"
              },
              {
                "name": "12h",
                "value": "43200"
              },
              {
                "name": "1d",
                "value": "86400"
              },
              {
                "name": "7d",
                "value": "604800"
              },
              {
                "name": "permanente",
                "value": "0"
              }
            ],
            "description": "Validade do convite",
            "name": "validade",
            "required": false,
            "type": 3
          },
          {
            "description": "Usos máximos (0 = ilimitado)",
            "max_value": 100,
            "min_value": 0,
            "name": "usos",
            "required": false,
            "type": 4
          },
          {
            "description": "Membro temporário",
            "name": "temporario",
            "required": false,
            "type": 5
          }
        ],
        "type": 1
      },
      {
        "description": "Criar um emoji do servidor",
        "name": "emoji",
        "options": [
          {
            "description": "Nome do emoji",
            "name": "nome",
            "required": true,
            "type": 3
          },
          {
            "description": "Imagem (PNG/JPG/GIF até 256 KB)",
            "name": "imagem",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Criar uma enquete nativa",
        "name": "enquete",
        "options": [
          {
            "description": "Pergunta da enquete",
            "name": "pergunta",
            "required": true,
            "type": 3
          },
          {
            "description": "Respostas separadas por | (2–10)",
            "name": "opcoes",
            "required": true,
            "type": 3
          },
          {
            "description": "Duração em horas (1–7 dias)",
            "max_value": 168,
            "min_value": 1,
            "name": "duracao",
            "required": false,
            "type": 4
          },
          {
            "description": "Permitir múltipla escolha",
            "name": "multipla",
            "required": false,
            "type": 5
          },
          {
            "description": "Canal (padrão: o atual)",
            "name": "canal",
            "required": false,
            "type": 7
          }
        ],
        "type": 1
      },
      {
        "description": "Criar um evento agendado",
        "name": "evento",
        "options": [
          {
            "description": "Nome do evento (1–100)",
            "name": "nome",
            "required": true,
            "type": 3
          },
          {
            "choices": [
              {
                "name": "voz",
                "value": "canal-voz"
              },
              {
                "name": "externo",
                "value": "external"
              }
            ],
            "description": "Tipo do evento",
            "name": "tipo",
            "required": true,
            "type": 3
          },
          {
            "description": "Início (AAAA-MM-DDTHH:MM)",
            "name": "inicio",
            "required": true,
            "type": 3
          },
          {
            "description": "Canal de voz (tipo voz)",
            "name": "canal",
            "required": false,
            "type": 7
          },
          {
            "description": "Duração em minutos",
            "max_value": 10080,
            "min_value": 1,
            "name": "duracao-minutos",
            "required": false,
            "type": 4
          },
          {
            "description": "Descrição (1–1000)",
            "name": "descricao",
            "required": false,
            "type": 3
          },
          {
            "description": "Local (tipo externo, 1–100)",
            "name": "local",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Criar uma figurinha do servidor",
        "name": "figurinha",
        "options": [
          {
            "description": "Nome da figurinha (2–30)",
            "name": "nome",
            "required": true,
            "type": 3
          },
          {
            "description": "Anexo de imagem (PNG/APNG/GIF/Lottie)",
            "name": "arquivo",
            "required": true,
            "type": 3
          },
          {
            "description": "Tags separadas por vírgula",
            "name": "tags",
            "required": false,
            "type": 3
          },
          {
            "description": "Descrição (até 200)",
            "name": "descricao",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Criar um modelo do servidor",
        "name": "modelo-do-servidor",
        "options": [
          {
            "description": "Nome do modelo (1–100)",
            "name": "nome",
            "required": true,
            "type": 3
          },
          {
            "description": "Descrição (0–120)",
            "name": "descricao",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Criar uma regra de moderação automática",
        "name": "regra-de-moderação",
        "options": [
          {
            "description": "Nome da regra",
            "name": "nome",
            "required": true,
            "type": 3
          },
          {
            "choices": [
              {
                "name": "palavra-bloqueada",
                "value": "1"
              },
              {
                "name": "spam-de-links",
                "value": "2"
              },
              {
                "name": "palavra-permitida",
                "value": "3"
              },
              {
                "name": "mencao-excessiva",
                "value": "4"
              }
            ],
            "description": "Gatilho da regra",
            "name": "tipo",
            "required": true,
            "type": 3
          },
          {
            "description": "Termos separados por vírgula",
            "name": "termo",
            "required": false,
            "type": 3
          },
          {
            "description": "Cargo de isolamento da ação",
            "name": "cargo",
            "required": false,
            "type": 8
          },
          {
            "description": "Canal de alerta",
            "name": "canal",
            "required": false,
            "type": 7
          }
        ],
        "type": 1
      },
      {
        "description": "Criar um som no servidor",
        "name": "som",
        "options": [
          {
            "description": "Nome do som (2–14)",
            "name": "nome",
            "required": true,
            "type": 3
          },
          {
            "description": "Anexo de áudio (OGG até 512 KB)",
            "name": "arquivo",
            "required": true,
            "type": 3
          },
          {
            "description": "Volume (0–1)",
            "name": "volume",
            "required": false,
            "type": 10
          },
          {
            "description": "Emoji associado",
            "name": "emoji",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Criar um tópico ou post de fórum",
        "name": "tópico",
        "options": [
          {
            "description": "Nome do tópico (1–100)",
            "name": "nome",
            "required": true,
            "type": 3
          },
          {
            "description": "Canal base (padrão: atual)",
            "name": "canal",
            "required": false,
            "type": 7
          },
          {
            "description": "ID da mensagem de origem",
            "name": "mensagem",
            "required": false,
            "type": 3
          },
          {
            "choices": [
              {
                "name": "1h",
                "value": "60"
              },
              {
                "name": "24h",
                "value": "1440"
              },
              {
                "name": "3d",
                "value": "4320"
              },
              {
                "name": "1sem",
                "value": "10080"
              }
            ],
            "description": "Arquivamento automático",
            "name": "duracao",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Criar um webhook no canal",
        "name": "webhook",
        "options": [
          {
            "description": "Canal alvo",
            "name": "canal",
            "required": true,
            "type": 7
          },
          {
            "description": "Nome do webhook (1–80)",
            "name": "nome",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "268435456",
    "description": "Definir permissões, status e listas",
    "name": "definir",
    "options": [
      {
        "description": "Definir sobrescrita de permissões do canal",
        "name": "permissões-do-canal",
        "options": [
          {
            "description": "Canal alvo",
            "name": "canal",
            "required": true,
            "type": 7
          },
          {
            "description": "ID do cargo ou membro alvo",
            "name": "alvo",
            "required": false,
            "type": 3
          },
          {
            "choices": [
              {
                "name": "cargo",
                "value": "0"
              },
              {
                "name": "membro",
                "value": "1"
              }
            ],
            "description": "Tipo do alvo",
            "name": "tipo-alvo",
            "required": false,
            "type": 3
          },
          {
            "description": "Permissões a permitir (nomes separados por vírgula)",
            "name": "permitir",
            "required": false,
            "type": 3
          },
          {
            "description": "Permissões a negar (nomes separados por vírgula)",
            "name": "negar",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Definir presença do bot (via Gateway)",
        "name": "presença-do-bot",
        "options": [
          {
            "choices": [
              {
                "name": "online",
                "value": "online"
              },
              {
                "name": "ausente",
                "value": "idle"
              },
              {
                "name": "nao-perturbe",
                "value": "dnd"
              },
              {
                "name": "invisivel",
                "value": "invisible"
              }
            ],
            "description": "Presença do bot",
            "name": "status",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Definir status de um canal de voz",
        "name": "status-do-canal-de-voz",
        "options": [
          {
            "description": "Canal alvo",
            "name": "canal",
            "required": true,
            "type": 7
          },
          {
            "description": "Texto do status (1–500)",
            "name": "status",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Substituir lista de usuários do convite (revisão)",
        "name": "usuários-do-convite",
        "options": [
          {
            "description": "Código do convite",
            "name": "codigo",
            "required": true,
            "type": 3
          },
          {
            "description": "IDs de usuário separados por vírgula",
            "name": "usuarios",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "8192",
    "description": "Desafixar mensagem",
    "name": "desafixar",
    "options": [
      {
        "description": "Desafixar uma mensagem do canal",
        "name": "mensagem",
        "options": [
          {
            "description": "ID da mensagem",
            "name": "mensagem",
            "required": true,
            "type": 3
          },
          {
            "description": "Canal (padrão: o atual)",
            "name": "canal",
            "required": false,
            "type": 7
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "17179869184",
    "description": "Desarquivar tópico",
    "name": "desarquivar",
    "options": [
      {
        "description": "Desarquivar um tópico",
        "name": "tópico",
        "options": [
          {
            "description": "ID do tópico",
            "name": "topico",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "32",
    "description": "Desativar regra ou áudio recebido",
    "name": "desativar",
    "options": [
      {
        "description": "Desativar uma regra de moderação automática",
        "name": "regra-de-moderação",
        "options": [
          {
            "description": "ID da regra",
            "name": "regra",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Impedir que o membro ouça o áudio da voz",
        "name": "áudio-recebido",
        "options": [
          {
            "description": "Pessoa alvo",
            "name": "pessoa",
            "required": true,
            "type": 6
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "4",
    "description": "Revogar banimento",
    "name": "desbanir",
    "options": [
      {
        "description": "Revogar banimento de um usuário",
        "name": "usuário",
        "options": [
          {
            "description": "ID numérico do usuário no Discord",
            "name": "usuario-id",
            "required": true,
            "type": 3
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "17179869184",
    "description": "Desbloquear tópico",
    "name": "desbloquear",
    "options": [
      {
        "description": "Permitir novas mensagens em um tópico",
        "name": "tópico",
        "options": [
          {
            "description": "ID do tópico",
            "name": "topico",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "16777216",
    "description": "Desconectar membro da voz",
    "name": "desconectar",
    "options": [
      {
        "description": "Desconectar membro do canal de voz",
        "name": "membro",
        "options": [
          {
            "description": "Pessoa alvo",
            "name": "pessoa",
            "required": true,
            "type": 6
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "16",
    "description": "Editar canais, cargos, eventos e recursos",
    "name": "editar",
    "options": [
      {
        "description": "Alterar propriedades de um canal",
        "name": "canal",
        "options": [
          {
            "description": "Canal alvo",
            "name": "canal",
            "required": true,
            "type": 7
          },
          {
            "description": "Novo nome do canal",
            "name": "nome",
            "required": false,
            "type": 3
          },
          {
            "description": "Novo tópico do canal",
            "name": "topico",
            "required": false,
            "type": 3
          },
          {
            "description": "Marcar como adulto",
            "name": "nsfw",
            "required": false,
            "type": 5
          },
          {
            "description": "Modo lento em segundos",
            "max_value": 21600,
            "min_value": 0,
            "name": "lento",
            "required": false,
            "type": 4
          }
        ],
        "type": 1
      },
      {
        "description": "Alterar propriedades de um cargo",
        "name": "cargo",
        "options": [
          {
            "description": "Cargo a editar",
            "name": "cargo",
            "required": true,
            "type": 8
          },
          {
            "description": "Novo nome do cargo",
            "name": "nome",
            "required": false,
            "type": 3
          },
          {
            "description": "Nova cor em hex",
            "name": "cor",
            "required": false,
            "type": 3
          },
          {
            "description": "Permitir menção ao cargo",
            "name": "mencionavel",
            "required": false,
            "type": 5
          }
        ],
        "type": 1
      },
      {
        "description": "Alterar o nome de uma categoria",
        "name": "categoria",
        "options": [
          {
            "description": "Canal alvo",
            "name": "canal",
            "required": true,
            "type": 7
          },
          {
            "description": "Novo nome da categoria",
            "name": "nome",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Renomear um emoji do servidor",
        "name": "emoji",
        "options": [
          {
            "description": "Emoji a editar (nome:id)",
            "name": "emoji",
            "required": true,
            "type": 3
          },
          {
            "description": "Novo nome do emoji",
            "name": "novo-nome",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Alterar um evento agendado",
        "name": "evento",
        "options": [
          {
            "description": "ID do evento",
            "name": "id",
            "required": true,
            "type": 3
          },
          {
            "description": "Novo nome",
            "name": "nome",
            "required": false,
            "type": 3
          },
          {
            "description": "Nova descrição",
            "name": "descricao",
            "required": false,
            "type": 3
          },
          {
            "description": "Novo início (AAAA-MM-DDTHH:MM)",
            "name": "inicio",
            "required": false,
            "type": 3
          },
          {
            "description": "Novo local (evento externo)",
            "name": "local",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Alterar uma figurinha do servidor",
        "name": "figurinha",
        "options": [
          {
            "description": "ID da figurinha",
            "name": "figurinha",
            "required": true,
            "type": 3
          },
          {
            "description": "Novo nome (2–30)",
            "name": "nome",
            "required": false,
            "type": 3
          },
          {
            "description": "Novas tags separadas por vírgula",
            "name": "tags",
            "required": false,
            "type": 3
          },
          {
            "description": "Nova descrição",
            "name": "descricao",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Editar uma mensagem do bot",
        "name": "mensagem",
        "options": [
          {
            "description": "ID da mensagem",
            "name": "mensagem",
            "required": true,
            "type": 3
          },
          {
            "description": "Novo texto da mensagem",
            "name": "texto",
            "required": true,
            "type": 3
          },
          {
            "description": "Canal (padrão: o atual)",
            "name": "canal",
            "required": false,
            "type": 7
          }
        ],
        "type": 1
      },
      {
        "description": "Editar mensagem enviada por webhook",
        "name": "mensagem-via-webhook",
        "options": [
          {
            "description": "ID do webhook",
            "name": "id",
            "required": true,
            "type": 3
          },
          {
            "description": "ID da mensagem",
            "name": "mensagem",
            "required": true,
            "type": 3
          },
          {
            "description": "Novo texto",
            "name": "texto",
            "required": true,
            "type": 3
          },
          {
            "description": "Token do webhook (do operador)",
            "name": "token",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Alterar um modelo de servidor",
        "name": "modelo-do-servidor",
        "options": [
          {
            "description": "Código do modelo",
            "name": "codigo",
            "required": true,
            "type": 3
          },
          {
            "description": "Novo nome",
            "name": "nome",
            "required": false,
            "type": 3
          },
          {
            "description": "Nova descrição",
            "name": "descricao",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Alterar o tópico de um palco",
        "name": "palco",
        "options": [
          {
            "description": "Canal alvo",
            "name": "canal",
            "required": true,
            "type": 7
          },
          {
            "description": "Novo tópico do palco (1–120)",
            "name": "topico",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Editar a bio do próprio bot",
        "name": "perfil-do-bot",
        "options": [
          {
            "description": "Nova bio (1–190)",
            "name": "bio",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Alterar a máscara de permissões de um cargo",
        "name": "permissões-do-cargo",
        "options": [
          {
            "description": "Cargo a editar",
            "name": "cargo",
            "required": true,
            "type": 8
          },
          {
            "description": "Permissões (permitir=negar=herdar)",
            "name": "permissoes",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Alterar uma regra de moderação automática",
        "name": "regra-de-moderação",
        "options": [
          {
            "description": "ID da regra",
            "name": "regra",
            "required": true,
            "type": 3
          },
          {
            "description": "Novo nome",
            "name": "nome",
            "required": false,
            "type": 3
          },
          {
            "description": "Novos termos separados por vírgula",
            "name": "termo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Alterar configurações do servidor",
        "name": "servidor",
        "options": [
          {
            "description": "Novo nome do servidor (2–100)",
            "name": "nome",
            "required": false,
            "type": 3
          },
          {
            "choices": [
              {
                "name": "nenhum",
                "value": "0"
              },
              {
                "name": "baixo",
                "value": "1"
              },
              {
                "name": "medio",
                "value": "2"
              },
              {
                "name": "alto",
                "value": "3"
              }
            ],
            "description": "Nível de verificação",
            "name": "verificacao",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Alterar um som do servidor",
        "name": "som",
        "options": [
          {
            "description": "ID do som",
            "name": "som",
            "required": true,
            "type": 3
          },
          {
            "description": "Novo nome (2–14)",
            "name": "nome",
            "required": false,
            "type": 3
          },
          {
            "description": "Volume (0–1)",
            "name": "volume",
            "required": false,
            "type": 10
          },
          {
            "description": "Novo emoji associado",
            "name": "emoji",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Editar a tela de boas-vindas",
        "name": "tela-de-boas-vindas",
        "options": [
          {
            "description": "Habilitar tela de boas-vindas",
            "name": "ativo",
            "required": false,
            "type": 5
          },
          {
            "description": "Canais destacados (IDs separados por vírgula)",
            "name": "canal",
            "required": false,
            "type": 3
          },
          {
            "description": "Descrição (até 340)",
            "name": "descricao",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Alterar propriedades de um tópico",
        "name": "tópico",
        "options": [
          {
            "description": "ID do tópico",
            "name": "topico",
            "required": true,
            "type": 3
          },
          {
            "description": "Novo nome do tópico",
            "name": "nome",
            "required": false,
            "type": 3
          },
          {
            "description": "Modo lento em segundos",
            "max_value": 21600,
            "min_value": 0,
            "name": "lento",
            "required": false,
            "type": 4
          }
        ],
        "type": 1
      },
      {
        "description": "Alterar um webhook",
        "name": "webhook",
        "options": [
          {
            "description": "ID do webhook",
            "name": "id",
            "required": true,
            "type": 3
          },
          {
            "description": "Novo nome (1–80)",
            "name": "nome",
            "required": false,
            "type": 3
          },
          {
            "description": "Novo canal do webhook",
            "name": "canal",
            "required": false,
            "type": 7
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "16",
    "description": "Encerrar enquete ou palco",
    "name": "encerrar",
    "options": [
      {
        "description": "Encerrar uma enquete criada pelo bot",
        "name": "enquete",
        "options": [
          {
            "description": "ID da mensagem",
            "name": "mensagem",
            "required": true,
            "type": 3
          },
          {
            "description": "Canal (padrão: o atual)",
            "name": "canal",
            "required": false,
            "type": 7
          }
        ],
        "type": 1
      },
      {
        "description": "Encerrar a instância de palco do canal",
        "name": "palco",
        "options": [
          {
            "description": "Canal alvo",
            "name": "canal",
            "required": true,
            "type": 7
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "description": "Entrar em tópico ou canal de voz",
    "name": "entrar",
    "options": [
      {
        "description": "Conectar o bot ao canal de voz (Gateway)",
        "name": "no-canal-de-voz",
        "options": [
          {
            "description": "Canal de voz",
            "name": "canal",
            "required": true,
            "type": 7
          }
        ],
        "type": 1
      },
      {
        "description": "Ingressar o bot em um tópico",
        "name": "no-tópico",
        "options": [
          {
            "description": "ID do tópico",
            "name": "topico",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "default_member_permissions": "2048",
    "description": "Enviar mensagens",
    "name": "enviar",
    "options": [
      {
        "description": "Enviar uma mensagem em um canal",
        "name": "mensagem",
        "options": [
          {
            "description": "Conteúdo da mensagem (1–1900)",
            "name": "texto",
            "required": true,
            "type": 3
          },
          {
            "description": "Canal (padrão: o atual)",
            "name": "canal",
            "required": false,
            "type": 7
          }
        ],
        "type": 1
      },
      {
        "description": "Enviar mensagem por webhook autorizado",
        "name": "mensagem-via-webhook",
        "options": [
          {
            "description": "ID do webhook",
            "name": "id",
            "required": true,
            "type": 3
          },
          {
            "description": "Conteúdo da mensagem (1–2000)",
            "name": "texto",
            "required": true,
            "type": 3
          },
          {
            "description": "Token do webhook (do operador)",
            "name": "token",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "2",
    "description": "Estimar membros inativos",
    "name": "estimar",
    "options": [
      {
        "description": "Estimar quantos membros seriam removidos",
        "name": "membros-inativos",
        "options": [
          {
            "description": "Dias de inatividade (1–30)",
            "max_value": 30,
            "min_value": 1,
            "name": "dias",
            "required": false,
            "type": 4
          },
          {
            "description": "IDs de cargos incluídos",
            "name": "cargos",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "16",
    "description": "Excluir canais, cargos e recursos",
    "name": "excluir",
    "options": [
      {
        "description": "Excluir um canal",
        "name": "canal",
        "options": [
          {
            "description": "Canal alvo",
            "name": "canal",
            "required": true,
            "type": 7
          }
        ],
        "type": 1
      },
      {
        "description": "Excluir um cargo do servidor",
        "name": "cargo",
        "options": [
          {
            "description": "Cargo a excluir",
            "name": "cargo",
            "required": true,
            "type": 8
          }
        ],
        "type": 1
      },
      {
        "description": "Excluir uma categoria",
        "name": "categoria",
        "options": [
          {
            "description": "Canal alvo",
            "name": "canal",
            "required": true,
            "type": 7
          }
        ],
        "type": 1
      },
      {
        "description": "Excluir um emoji do servidor",
        "name": "emoji",
        "options": [
          {
            "description": "Emoji a excluir (nome:id)",
            "name": "emoji",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Excluir um evento agendado",
        "name": "evento",
        "options": [
          {
            "description": "ID do evento",
            "name": "id",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Excluir uma figurinha do servidor",
        "name": "figurinha",
        "options": [
          {
            "description": "ID da figurinha",
            "name": "figurinha",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Excluir uma integração do servidor",
        "name": "integração",
        "options": [
          {
            "description": "ID da integração",
            "name": "id",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Excluir uma mensagem específica",
        "name": "mensagem",
        "options": [
          {
            "description": "ID da mensagem",
            "name": "mensagem",
            "required": true,
            "type": 3
          },
          {
            "description": "Canal (padrão: o atual)",
            "name": "canal",
            "required": false,
            "type": 7
          }
        ],
        "type": 1
      },
      {
        "description": "Excluir mensagem enviada por webhook",
        "name": "mensagem-via-webhook",
        "options": [
          {
            "description": "ID do webhook",
            "name": "id",
            "required": true,
            "type": 3
          },
          {
            "description": "ID da mensagem",
            "name": "mensagem",
            "required": true,
            "type": 3
          },
          {
            "description": "Token do webhook (do operador)",
            "name": "token",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Excluir mensagens do canal em lote",
        "name": "mensagens",
        "options": [
          {
            "description": "Quantidade de itens (padrão do comando)",
            "max_value": 100,
            "min_value": 1,
            "name": "quantidade",
            "required": false,
            "type": 4
          },
          {
            "description": "Filtrar por autor",
            "name": "membro",
            "required": false,
            "type": 6
          },
          {
            "description": "Canal (padrão: o atual)",
            "name": "canal",
            "required": false,
            "type": 7
          },
          {
            "choices": [
              {
                "name": "quantidade",
                "value": "quantidade"
              },
              {
                "name": "todas",
                "value": "todas"
              }
            ],
            "description": "Escopo da exclusão",
            "name": "modo",
            "required": false,
            "type": 3
          },
          {
            "description": "Preservar mensagens fixadas",
            "name": "preservar-fixadas",
            "required": false,
            "type": 5
          }
        ],
        "type": 1
      },
      {
        "description": "Excluir um modelo de servidor",
        "name": "modelo-do-servidor",
        "options": [
          {
            "description": "Código do modelo",
            "name": "codigo",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Excluir uma regra de moderação automática",
        "name": "regra-de-moderação",
        "options": [
          {
            "description": "ID da regra",
            "name": "regra",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Excluir um som do servidor",
        "name": "som",
        "options": [
          {
            "description": "ID do som",
            "name": "som",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Excluir um tópico",
        "name": "tópico",
        "options": [
          {
            "description": "ID do tópico",
            "name": "topico",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Excluir um webhook",
        "name": "webhook",
        "options": [
          {
            "description": "ID do webhook",
            "name": "id",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "2",
    "description": "Expulsar membro ou inativos",
    "name": "expulsar",
    "options": [
      {
        "description": "Expulsar um membro do servidor",
        "name": "membro",
        "options": [
          {
            "description": "Pessoa alvo",
            "name": "pessoa",
            "required": true,
            "type": 6
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Expulsar membros inativos",
        "name": "membros-inativos",
        "options": [
          {
            "description": "Dias de inatividade (1–30)",
            "max_value": 30,
            "min_value": 1,
            "name": "dias",
            "required": false,
            "type": 4
          },
          {
            "description": "IDs de cargos incluídos",
            "name": "cargos",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "8192",
    "description": "Fixar mensagem",
    "name": "fixar",
    "options": [
      {
        "description": "Fixar uma mensagem no canal",
        "name": "mensagem",
        "options": [
          {
            "description": "ID da mensagem",
            "name": "mensagem",
            "required": true,
            "type": 3
          },
          {
            "description": "Canal (padrão: o atual)",
            "name": "canal",
            "required": false,
            "type": 7
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "default_member_permissions": "2048",
    "description": "Indicadores de digitação",
    "name": "indicar",
    "options": [
      {
        "description": "Acionar o indicador de digitação",
        "name": "digitação",
        "options": [
          {
            "description": "Canal (padrão: o atual)",
            "name": "canal",
            "required": false,
            "type": 7
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "8589934592",
    "description": "Iniciar evento ou palco",
    "name": "iniciar",
    "options": [
      {
        "description": "Iniciar um evento agendado",
        "name": "evento",
        "options": [
          {
            "description": "ID do evento",
            "name": "id",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Abrir uma instância de palco no canal",
        "name": "palco",
        "options": [
          {
            "description": "Canal alvo",
            "name": "canal",
            "required": true,
            "type": 7
          },
          {
            "description": "Tópico do palco (1–120)",
            "name": "topico",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "1099511627776",
    "description": "Liberar comunicação ou restrições",
    "name": "liberar",
    "options": [
      {
        "description": "Remover restrição de comunicação (timeout)",
        "name": "comunicação",
        "options": [
          {
            "description": "Pessoa alvo",
            "name": "pessoa",
            "required": true,
            "type": 6
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Liberar a criação de convites do servidor",
        "name": "convites",
        "options": [],
        "type": 1
      },
      {
        "description": "Liberar mensagens diretas entre membros",
        "name": "mensagens-diretas",
        "options": [],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "description": "Listar recursos do servidor",
    "name": "listar",
    "options": [
      {
        "description": "Listar banimentos do servidor",
        "name": "banimentos",
        "options": [
          {
            "description": "Quantidade de itens (padrão do comando)",
            "max_value": 100,
            "min_value": 1,
            "name": "quantidade",
            "required": false,
            "type": 4
          }
        ],
        "type": 1
      },
      {
        "description": "Listar canais do servidor",
        "name": "canais",
        "options": [],
        "type": 1
      },
      {
        "description": "Listar cargos do servidor",
        "name": "cargos",
        "options": [],
        "type": 1
      },
      {
        "description": "Listar cargos de um membro",
        "name": "cargos-do-membro",
        "options": [
          {
            "description": "Pessoa alvo",
            "name": "pessoa",
            "required": true,
            "type": 6
          }
        ],
        "type": 1
      },
      {
        "description": "Listar convites do canal ou servidor",
        "name": "convites",
        "options": [
          {
            "description": "Canal (padrão: o atual)",
            "name": "canal",
            "required": false,
            "type": 7
          }
        ],
        "type": 1
      },
      {
        "description": "Listar emojis do servidor",
        "name": "emojis",
        "options": [],
        "type": 1
      },
      {
        "description": "Listar eventos agendados",
        "name": "eventos",
        "options": [],
        "type": 1
      },
      {
        "description": "Listar figurinhas do servidor",
        "name": "figurinhas",
        "options": [],
        "type": 1
      },
      {
        "description": "Listar integrações do servidor",
        "name": "integrações",
        "options": [],
        "type": 1
      },
      {
        "description": "Listar interessados em um evento",
        "name": "interessados-no-evento",
        "options": [
          {
            "description": "ID do evento",
            "name": "id",
            "required": true,
            "type": 3
          },
          {
            "description": "Quantidade de itens (padrão do comando)",
            "max_value": 100,
            "min_value": 1,
            "name": "quantidade",
            "required": false,
            "type": 4
          }
        ],
        "type": 1
      },
      {
        "description": "Listar membros do servidor",
        "name": "membros",
        "options": [
          {
            "description": "Quantidade de itens (padrão do comando)",
            "max_value": 100,
            "min_value": 1,
            "name": "quantidade",
            "required": false,
            "type": 4
          }
        ],
        "type": 1
      },
      {
        "description": "Listar participantes de um tópico",
        "name": "membros-do-tópico",
        "options": [
          {
            "description": "ID do tópico",
            "name": "topico",
            "required": true,
            "type": 3
          },
          {
            "description": "Quantidade de itens (padrão do comando)",
            "max_value": 100,
            "min_value": 1,
            "name": "quantidade",
            "required": false,
            "type": 4
          }
        ],
        "type": 1
      },
      {
        "description": "Listar histórico de mensagens",
        "name": "mensagens",
        "options": [
          {
            "description": "Canal (padrão: o atual)",
            "name": "canal",
            "required": false,
            "type": 7
          },
          {
            "description": "Quantidade de itens (padrão do comando)",
            "max_value": 100,
            "min_value": 1,
            "name": "quantidade",
            "required": false,
            "type": 4
          },
          {
            "description": "ID de mensagem para paginar",
            "name": "antes",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Listar mensagens fixadas do canal",
        "name": "mensagens-fixadas",
        "options": [
          {
            "description": "Canal (padrão: o atual)",
            "name": "canal",
            "required": false,
            "type": 7
          }
        ],
        "type": 1
      },
      {
        "description": "Listar modelos do servidor",
        "name": "modelos-do-servidor",
        "options": [],
        "type": 1
      },
      {
        "description": "Listar regiões de voz disponíveis",
        "name": "regiões-de-voz",
        "options": [],
        "type": 1
      },
      {
        "description": "Listar regras de moderação automática",
        "name": "regras-de-moderação",
        "options": [],
        "type": 1
      },
      {
        "description": "Listar servidores em que o bot está",
        "name": "servidores-do-bot",
        "options": [],
        "type": 1
      },
      {
        "description": "Listar solicitações de entrada (revisão)",
        "name": "solicitações-de-entrada",
        "options": [],
        "type": 1
      },
      {
        "description": "Listar sons do servidor",
        "name": "sons",
        "options": [],
        "type": 1
      },
      {
        "description": "Listar tópicos ativos do servidor",
        "name": "tópicos",
        "options": [],
        "type": 1
      },
      {
        "description": "Listar quem reagiu com um emoji",
        "name": "usuários-da-reação",
        "options": [
          {
            "description": "ID da mensagem",
            "name": "mensagem",
            "required": true,
            "type": 3
          },
          {
            "description": "Emoji unicode ou personalizado (nome:id)",
            "name": "emoji",
            "required": true,
            "type": 3
          },
          {
            "description": "Canal (padrão: o atual)",
            "name": "canal",
            "required": false,
            "type": 7
          },
          {
            "choices": [
              {
                "name": "normal",
                "value": "0"
              },
              {
                "name": "super",
                "value": "1"
              }
            ],
            "description": "Tipo de reação",
            "name": "tipo-reacao",
            "required": false,
            "type": 3
          },
          {
            "description": "Quantidade de itens (padrão do comando)",
            "max_value": 100,
            "min_value": 1,
            "name": "quantidade",
            "required": false,
            "type": 4
          }
        ],
        "type": 1
      },
      {
        "description": "Listar usuários autorizados do convite (revisão)",
        "name": "usuários-do-convite",
        "options": [
          {
            "description": "Código do convite",
            "name": "codigo",
            "required": true,
            "type": 3
          },
          {
            "description": "Tipo de lista",
            "name": "tipo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Listar votantes de uma resposta da enquete",
        "name": "votantes",
        "options": [
          {
            "description": "ID da mensagem",
            "name": "mensagem",
            "required": true,
            "type": 3
          },
          {
            "description": "Número da resposta (1–10)",
            "max_value": 10,
            "min_value": 1,
            "name": "opcao",
            "required": true,
            "type": 4
          },
          {
            "description": "Canal (padrão: o atual)",
            "name": "canal",
            "required": false,
            "type": 7
          },
          {
            "description": "Quantidade de itens (padrão do comando)",
            "max_value": 100,
            "min_value": 1,
            "name": "quantidade",
            "required": false,
            "type": 4
          }
        ],
        "type": 1
      },
      {
        "description": "Listar webhooks do canal ou servidor",
        "name": "webhooks",
        "options": [
          {
            "description": "Canal (padrão: o atual)",
            "name": "canal",
            "required": false,
            "type": 7
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "16777216",
    "description": "Mover canais e membros",
    "name": "mover",
    "options": [
      {
        "description": "Mover canal para categoria/posição",
        "name": "canal",
        "options": [
          {
            "description": "Canal alvo",
            "name": "canal",
            "required": true,
            "type": 7
          },
          {
            "description": "Nova categoria (vazio = nenhuma)",
            "name": "categoria",
            "required": false,
            "type": 7
          },
          {
            "description": "Nova posição (0 = primeiro)",
            "max_value": 500,
            "min_value": 0,
            "name": "posicao",
            "required": false,
            "type": 4
          }
        ],
        "type": 1
      },
      {
        "description": "Mover membro conectado à voz",
        "name": "membro",
        "options": [
          {
            "description": "Pessoa alvo",
            "name": "pessoa",
            "required": true,
            "type": 6
          },
          {
            "description": "Canal de voz destino",
            "name": "canal",
            "required": true,
            "type": 7
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Mover membro para a plateia do palco",
        "name": "membro-para-plateia",
        "options": [
          {
            "description": "Pessoa alvo",
            "name": "pessoa",
            "required": true,
            "type": 6
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "16",
    "description": "Reordenar canais ou cargos",
    "name": "ordenar",
    "options": [
      {
        "description": "Reordenar um canal",
        "name": "canais",
        "options": [
          {
            "description": "Canal alvo",
            "name": "canal",
            "required": true,
            "type": 7
          },
          {
            "description": "Nova posição (0 = primeiro)",
            "max_value": 500,
            "min_value": 0,
            "name": "posicao",
            "required": true,
            "type": 4
          }
        ],
        "type": 1
      },
      {
        "description": "Reordenar um cargo",
        "name": "cargos",
        "options": [
          {
            "description": "Cargo a mover",
            "name": "cargo",
            "required": true,
            "type": 8
          },
          {
            "description": "Nova posição (0 = topo)",
            "max_value": 250,
            "min_value": 0,
            "name": "posicao",
            "required": true,
            "type": 4
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "4194304",
    "description": "Permitir fala no palco",
    "name": "permitir",
    "options": [
      {
        "description": "Convidar membro a falar no palco",
        "name": "fala-no-palco",
        "options": [
          {
            "description": "Pessoa alvo",
            "name": "pessoa",
            "required": true,
            "type": 6
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "default_member_permissions": "2048",
    "description": "Publicar mensagem ou post",
    "name": "publicar",
    "options": [
      {
        "description": "Publicar mensagem de canal de anúncios",
        "name": "mensagem",
        "options": [
          {
            "description": "ID da mensagem",
            "name": "mensagem",
            "required": true,
            "type": 3
          },
          {
            "description": "Canal (padrão: o atual)",
            "name": "canal",
            "required": false,
            "type": 7
          }
        ],
        "type": 1
      },
      {
        "description": "Criar um post em canal de fórum",
        "name": "no-fórum",
        "options": [
          {
            "description": "Título do post (1–100)",
            "name": "nome",
            "required": true,
            "type": 3
          },
          {
            "description": "Conteúdo inicial do post",
            "name": "mensagem",
            "required": true,
            "type": 3
          },
          {
            "description": "Canal de fórum/mídia",
            "name": "canal",
            "required": false,
            "type": 7
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "4194304",
    "description": "Reativar microfone",
    "name": "reativar",
    "options": [
      {
        "description": "Permitir que o membro transmita áudio",
        "name": "microfone",
        "options": [
          {
            "description": "Pessoa alvo",
            "name": "pessoa",
            "required": true,
            "type": 6
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "268435456",
    "description": "Remover cargos, participantes e reações",
    "name": "remover",
    "options": [
      {
        "description": "Remover um cargo de um membro",
        "name": "cargo",
        "options": [
          {
            "description": "Pessoa alvo",
            "name": "pessoa",
            "required": true,
            "type": 6
          },
          {
            "description": "Cargo a remover",
            "name": "cargo",
            "required": true,
            "type": 8
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Remover membro de um tópico",
        "name": "membro-do-tópico",
        "options": [
          {
            "description": "ID do tópico",
            "name": "topico",
            "required": true,
            "type": 3
          },
          {
            "description": "Pessoa alvo",
            "name": "pessoa",
            "required": true,
            "type": 6
          }
        ],
        "type": 1
      },
      {
        "description": "Remover sobrescrita e restaurar herança",
        "name": "permissões-do-canal",
        "options": [
          {
            "description": "Canal alvo",
            "name": "canal",
            "required": true,
            "type": 7
          },
          {
            "description": "ID da sobrescrita (cargo/membro)",
            "name": "overwrite",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Remover reação do bot, de alguém ou de todos",
        "name": "reação",
        "options": [
          {
            "description": "ID da mensagem",
            "name": "mensagem",
            "required": true,
            "type": 3
          },
          {
            "description": "Emoji unicode ou personalizado (nome:id)",
            "name": "emoji",
            "required": true,
            "type": 3
          },
          {
            "description": "Canal (padrão: o atual)",
            "name": "canal",
            "required": false,
            "type": 7
          },
          {
            "choices": [
              {
                "name": "minha",
                "value": "minha"
              },
              {
                "name": "pessoa",
                "value": "pessoa"
              },
              {
                "name": "emoji",
                "value": "emoji"
              },
              {
                "name": "todas",
                "value": "todas"
              }
            ],
            "description": "Escopo da remoção",
            "name": "modo",
            "required": false,
            "type": 3
          },
          {
            "description": "Pessoa alvo (modo pessoa)",
            "name": "pessoa",
            "required": false,
            "type": 6
          }
        ],
        "type": 1
      },
      {
        "description": "Remover status de um canal de voz",
        "name": "status-do-canal-de-voz",
        "options": [
          {
            "description": "Canal alvo",
            "name": "canal",
            "required": true,
            "type": 7
          }
        ],
        "type": 1
      },
      {
        "description": "Remover usuário autorizado do convite (revisão)",
        "name": "usuário-do-convite",
        "options": [
          {
            "description": "Código do convite",
            "name": "codigo",
            "required": true,
            "type": 3
          },
          {
            "description": "ID numérico do usuário no Discord",
            "name": "usuario-id",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "134217728",
    "description": "Restaurar apelido",
    "name": "restaurar",
    "options": [
      {
        "description": "Remover apelido personalizado do membro",
        "name": "apelido",
        "options": [
          {
            "description": "Pessoa alvo",
            "name": "pessoa",
            "required": true,
            "type": 6
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "1099511627776",
    "description": "Restringir comunicação e convites",
    "name": "restringir",
    "options": [
      {
        "description": "Aplicar timeout nativo ao membro",
        "name": "comunicação",
        "options": [
          {
            "description": "Pessoa alvo",
            "name": "pessoa",
            "required": true,
            "type": 6
          },
          {
            "choices": [
              {
                "name": "60s",
                "value": "60"
              },
              {
                "name": "5m",
                "value": "300"
              },
              {
                "name": "10m",
                "value": "600"
              },
              {
                "name": "1h",
                "value": "3600"
              },
              {
                "name": "1d",
                "value": "86400"
              },
              {
                "name": "1sem",
                "value": "604800"
              }
            ],
            "description": "Duração da restrição",
            "name": "duracao",
            "required": true,
            "type": 3
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Restringir criação de convites do servidor",
        "name": "convites",
        "options": [
          {
            "description": "Duração da restrição",
            "name": "duracao",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Restringir mensagens diretas entre membros",
        "name": "mensagens-diretas",
        "options": [
          {
            "description": "Duração da restrição",
            "name": "duracao",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "32",
    "description": "Revogar convite",
    "name": "revogar",
    "options": [
      {
        "description": "Revogar um convite existente",
        "name": "convite",
        "options": [
          {
            "description": "Código do convite",
            "name": "codigo",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "description": "Sair de tópico ou canal de voz",
    "name": "sair",
    "options": [
      {
        "description": "Desconectar o bot do canal de voz (Gateway)",
        "name": "do-canal-de-voz",
        "options": [
          {
            "description": "Canal de voz",
            "name": "canal",
            "required": true,
            "type": 7
          }
        ],
        "type": 1
      },
      {
        "description": "Retirar o bot de um tópico",
        "name": "do-tópico",
        "options": [
          {
            "description": "ID do tópico",
            "name": "topico",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "16",
    "description": "Seguir canal de anúncios",
    "name": "seguir",
    "options": [
      {
        "description": "Seguir publicações em canal destino",
        "name": "canal-de-anúncios",
        "options": [
          {
            "description": "Canal de anúncios",
            "name": "canal",
            "required": true,
            "type": 7
          },
          {
            "description": "Canal que receberá as publicações",
            "name": "destino",
            "required": true,
            "type": 7
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "4194304",
    "description": "Silenciar microfone",
    "name": "silenciar",
    "options": [
      {
        "description": "Impedir transmissão de áudio do membro",
        "name": "microfone",
        "options": [
          {
            "description": "Pessoa alvo",
            "name": "pessoa",
            "required": true,
            "type": 6
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "32",
    "description": "Sincronizar permissões ou modelos",
    "name": "sincronizar",
    "options": [
      {
        "description": "Sincronizar modelo com o estado do servidor",
        "name": "modelo-do-servidor",
        "options": [
          {
            "description": "Código do modelo",
            "name": "codigo",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Sincronizar permissões do canal com a categoria",
        "name": "permissões",
        "options": [
          {
            "description": "Canal alvo",
            "name": "canal",
            "required": true,
            "type": 7
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "description": "Solicitar fala no palco",
    "name": "solicitar",
    "options": [
      {
        "description": "Solicitar falar no palco (próprio bot)",
        "name": "fala-no-palco",
        "options": [
          {
            "description": "Canal alvo",
            "name": "canal",
            "required": true,
            "type": 7
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "description": "Tocar som do soundboard",
    "name": "tocar",
    "options": [
      {
        "description": "Tocar um som em canal de voz",
        "name": "som",
        "options": [
          {
            "description": "ID do som",
            "name": "som",
            "required": true,
            "type": 3
          },
          {
            "description": "Canal de voz (padrão: atual do bot)",
            "name": "canal",
            "required": false,
            "type": 7
          },
          {
            "description": "ID do servidor do som externo",
            "name": "servidor-origem",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "description": "Verificar estado de voz ou permissões",
    "name": "verificar",
    "options": [
      {
        "description": "Consultar estado de voz do membro",
        "name": "estado-de-voz",
        "options": [
          {
            "description": "Pessoa alvo (padrão: você)",
            "name": "pessoa",
            "required": false,
            "type": 6
          }
        ],
        "type": 1
      },
      {
        "description": "Consultar permissões efetivas de membro ou cargo",
        "name": "permissões",
        "options": [
          {
            "description": "Pessoa alvo (padrão: você)",
            "name": "pessoa",
            "required": false,
            "type": 6
          },
          {
            "description": "Cargo a verificar",
            "name": "cargo",
            "required": false,
            "type": 8
          },
          {
            "description": "Canal (padrão: o atual)",
            "name": "canal",
            "required": false,
            "type": 7
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "description": "Verificar latência e estado do Axyon",
    "name": "ping",
    "options": [],
    "type": 1
  },
  {
    "description": "Guia dos comandos do Axyon",
    "name": "ajuda",
    "options": [
      {
        "description": "Abrir o catálogo por áreas",
        "name": "inicio",
        "options": [],
        "type": 1
      },
      {
        "description": "Buscar comandos por nome, descrição ou área",
        "name": "buscar",
        "options": [
          {
            "description": "Termo de busca",
            "name": "termo",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Consultar opções e requisitos de um comando",
        "name": "comando",
        "options": [
          {
            "description": "Caminho do comando",
            "name": "nome",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Explorar uma área de comandos",
        "name": "modulo",
        "options": [
          {
            "description": "Nome da área ou módulo",
            "name": "nome",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "description": "Estado operacional do sistema Axyon",
    "name": "status",
    "options": [],
    "type": 1
  },
  {
    "description": "Diagnóstico do contexto atual da interação",
    "name": "diagnostico",
    "options": [],
    "type": 1
  },
  {
    "description": "Painéis interativos de gerenciamento",
    "name": "painel",
    "options": [
      {
        "description": "Painel de gestão do servidor",
        "name": "servidor",
        "options": [],
        "type": 1
      },
      {
        "description": "Painel rápido de moderação",
        "name": "moderacao",
        "options": [],
        "type": 1
      },
      {
        "description": "Navegador do catálogo de comandos",
        "name": "navegacao",
        "options": [],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "description": "Painel do sistema Axyon",
    "name": "axyon",
    "options": [
      {
        "description": "Resumo do estado do sistema",
        "name": "estado",
        "options": [],
        "type": 1
      },
      {
        "description": "Catálogo por áreas funcionais",
        "name": "modulos",
        "options": [],
        "type": 1
      },
      {
        "description": "Checklist de configuração pós-conexão",
        "name": "configurar",
        "options": [],
        "type": 1
      },
      {
        "description": "Modos de instalação do aplicativo",
        "name": "instalacoes",
        "options": [],
        "type": 1
      },
      {
        "description": "Executar operação do catálogo REST oficial (250)",
        "name": "operacao",
        "options": [
          {
            "description": "Operação do catálogo oficial (discord.*)",
            "name": "operacao",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON com valores dos caminhos {param}",
            "name": "parametros",
            "required": false,
            "type": 3
          },
          {
            "description": "JSON com pares de consulta ?chave=valor",
            "name": "consulta",
            "required": false,
            "type": 3
          },
          {
            "description": "JSON do corpo da requisição",
            "name": "corpo",
            "required": false,
            "type": 3
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Listar operações do catálogo REST oficial",
        "name": "operacoes",
        "options": [
          {
            "description": "Filtrar operações por nome, rota ou módulo",
            "name": "filtro",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "description": "Informações do aplicativo Axyon",
    "name": "aplicacao",
    "options": [
      {
        "description": "Dados do aplicativo via API",
        "name": "informacoes",
        "options": [],
        "type": 1
      },
      {
        "description": "Configurações registradas do aplicativo",
        "name": "configuracoes",
        "options": [],
        "type": 1
      },
      {
        "description": "Escopos e instalações declaradas",
        "name": "instalacoes",
        "options": [],
        "type": 1
      },
      {
        "description": "Atualizar aplicativo do Axyon",
        "name": "atualizar",
        "options": [
          {
            "description": "Nova descrição (até 400)",
            "name": "descricao",
            "required": false,
            "type": 3
          },
          {
            "description": "Nova tag (até 20)",
            "name": "tag",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Consultar aplicação por ID",
        "name": "consultar-id",
        "options": [
          {
            "description": "ID da aplicação",
            "name": "application-id",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON com pares ?chave=valor",
            "name": "consulta",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Editar aplicação por ID",
        "name": "editar-id",
        "options": [
          {
            "description": "ID da aplicação",
            "name": "application-id",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON do corpo da requisição",
            "name": "corpo",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON com pares ?chave=valor",
            "name": "consulta",
            "required": false,
            "type": 3
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Enviar anexo da aplicação",
        "name": "anexo-enviar",
        "options": [
          {
            "description": "ID da aplicação",
            "name": "application-id",
            "required": true,
            "type": 3
          },
          {
            "description": "Campos multipart em JSON",
            "name": "corpo",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON com pares ?chave=valor",
            "name": "consulta",
            "required": false,
            "type": 3
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "description": "Conexões e identidade OAuth2",
    "name": "conexoes",
    "options": [
      {
        "description": "Autorização OAuth2 atual do operador",
        "name": "estado",
        "options": [],
        "type": 1
      },
      {
        "description": "Instruções para vincular contas externas",
        "name": "vincular",
        "options": [],
        "type": 1
      },
      {
        "description": "Instruções para revogar vinculações",
        "name": "desvincular",
        "options": [],
        "type": 1
      },
      {
        "description": "Metadata de vínculo de cargos",
        "name": "metadata",
        "options": [
          {
            "description": "ID do aplicativo (padrão: o Axyon)",
            "name": "aplicativo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Atualizar metadata de vínculo de cargos",
        "name": "metadata-atualizar",
        "options": [
          {
            "description": "JSON array de campos de metadata",
            "name": "corpo",
            "required": true,
            "type": 3
          },
          {
            "description": "ID do aplicativo (padrão: o Axyon)",
            "name": "aplicativo",
            "required": false,
            "type": 3
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Meu perfil de membro em um servidor",
        "name": "membro-servidor",
        "options": [
          {
            "description": "ID do servidor",
            "name": "guild-id",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON com pares ?chave=valor",
            "name": "consulta",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Aplicação OAuth2 atual",
        "name": "app-oauth2",
        "options": [
          {
            "description": "JSON com pares ?chave=valor",
            "name": "consulta",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Informações OpenID Connect",
        "name": "userinfo",
        "options": [
          {
            "description": "JSON com pares ?chave=valor",
            "name": "consulta",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Chaves públicas de verificação",
        "name": "chaves-publicas",
        "options": [
          {
            "description": "JSON com pares ?chave=valor",
            "name": "consulta",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Servidores em que a aplicação está",
        "name": "meus-servidores",
        "options": [
          {
            "description": "JSON com pares ?chave=valor",
            "name": "consulta",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "description": "Gerar link OAuth2 do Axyon com escopos",
    "name": "autorizar",
    "options": [
      {
        "choices": [
          {
            "name": "bot",
            "value": "bot"
          },
          {
            "name": "bot+comandos",
            "value": "bot applications.commands"
          },
          {
            "name": "identidade",
            "value": "identify"
          },
          {
            "name": "servidores",
            "value": "guilds"
          },
          {
            "name": "entrar-servidor",
            "value": "guilds.join"
          },
          {
            "name": "conexoes",
            "value": "connections"
          }
        ],
        "description": "Escopos solicitados",
        "name": "escopos",
        "required": true,
        "type": 3
      },
      {
        "description": "ID do servidor para convite de guild",
        "name": "servidor",
        "required": false,
        "type": 3
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "32",
    "description": "Administração dos comandos do Axyon",
    "name": "comandos",
    "options": [
      {
        "description": "Listar comandos registrados",
        "name": "listar",
        "options": [],
        "type": 1
      },
      {
        "description": "Detalhar um comando registrado",
        "name": "info",
        "options": [
          {
            "description": "Nome do comando",
            "name": "comando",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Permissões específicas por comando",
        "name": "permissoes",
        "options": [],
        "type": 1
      },
      {
        "description": "Status da sincronização com o Discord",
        "name": "sincronizar",
        "options": [],
        "type": 1
      },
      {
        "description": "Criar comando global de aplicação",
        "name": "criar",
        "options": [
          {
            "description": "Nome do comando (1-32, minúsculas)",
            "name": "novo-nome",
            "required": true,
            "type": 3
          },
          {
            "description": "Descrição (1-100)",
            "name": "descricao",
            "required": true,
            "type": 3
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Editar comando global registrado",
        "name": "editar",
        "options": [
          {
            "description": "ID do comando registrado",
            "name": "comando-id",
            "required": true,
            "type": 3
          },
          {
            "description": "Nova descrição (1-100)",
            "name": "descricao",
            "required": true,
            "type": 3
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Remover comando global",
        "name": "remover",
        "options": [
          {
            "description": "ID do comando registrado",
            "name": "comando-id",
            "required": true,
            "type": 3
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Definir permissões por cargo/pessoa no servidor",
        "name": "permissoes-definir",
        "options": [
          {
            "description": "ID do comando registrado",
            "name": "comando-id",
            "required": true,
            "type": 3
          },
          {
            "description": "Cargo a liberar/bloquear",
            "name": "cargo",
            "required": false,
            "type": 8
          },
          {
            "description": "Pessoa a liberar/bloquear",
            "name": "pessoa",
            "required": false,
            "type": 6
          },
          {
            "description": "Verdadeiro libera, falso bloqueia",
            "name": "liberar",
            "required": false,
            "type": 5
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Listar comandos globais da aplicação",
        "name": "listar-global",
        "options": [
          {
            "description": "ID da aplicação",
            "name": "application-id",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON com pares ?chave=valor",
            "name": "consulta",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Consultar comando global por ID",
        "name": "consultar-id",
        "options": [
          {
            "description": "ID da aplicação",
            "name": "application-id",
            "required": true,
            "type": 3
          },
          {
            "description": "ID do comando",
            "name": "command-id",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON com pares ?chave=valor",
            "name": "consulta",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Substituir todos os comandos globais",
        "name": "definir-global",
        "options": [
          {
            "description": "ID da aplicação",
            "name": "application-id",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON do corpo da requisição",
            "name": "corpo",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON com pares ?chave=valor",
            "name": "consulta",
            "required": false,
            "type": 3
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Criar comando em um servidor",
        "name": "criar-servidor",
        "options": [
          {
            "description": "ID da aplicação",
            "name": "application-id",
            "required": true,
            "type": 3
          },
          {
            "description": "ID do servidor",
            "name": "guild-id",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON do corpo da requisição",
            "name": "corpo",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON com pares ?chave=valor",
            "name": "consulta",
            "required": false,
            "type": 3
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Consultar comando de servidor",
        "name": "consultar-servidor",
        "options": [
          {
            "description": "ID da aplicação",
            "name": "application-id",
            "required": true,
            "type": 3
          },
          {
            "description": "ID do servidor",
            "name": "guild-id",
            "required": true,
            "type": 3
          },
          {
            "description": "ID do comando",
            "name": "command-id",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON com pares ?chave=valor",
            "name": "consulta",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Editar comando de servidor",
        "name": "editar-servidor",
        "options": [
          {
            "description": "ID da aplicação",
            "name": "application-id",
            "required": true,
            "type": 3
          },
          {
            "description": "ID do servidor",
            "name": "guild-id",
            "required": true,
            "type": 3
          },
          {
            "description": "ID do comando",
            "name": "command-id",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON do corpo da requisição",
            "name": "corpo",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON com pares ?chave=valor",
            "name": "consulta",
            "required": false,
            "type": 3
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Remover comando de servidor",
        "name": "remover-servidor",
        "options": [
          {
            "description": "ID da aplicação",
            "name": "application-id",
            "required": true,
            "type": 3
          },
          {
            "description": "ID do servidor",
            "name": "guild-id",
            "required": true,
            "type": 3
          },
          {
            "description": "ID do comando",
            "name": "command-id",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON com pares ?chave=valor",
            "name": "consulta",
            "required": false,
            "type": 3
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Permissões de um comando de servidor",
        "name": "permissoes-consultar",
        "options": [
          {
            "description": "ID da aplicação",
            "name": "application-id",
            "required": true,
            "type": 3
          },
          {
            "description": "ID do servidor",
            "name": "guild-id",
            "required": true,
            "type": 3
          },
          {
            "description": "ID do comando",
            "name": "command-id",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON com pares ?chave=valor",
            "name": "consulta",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Substituir comandos de um servidor",
        "name": "definir-servidor",
        "options": [
          {
            "description": "ID da aplicação",
            "name": "application-id",
            "required": true,
            "type": 3
          },
          {
            "description": "ID do servidor",
            "name": "guild-id",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON do corpo da requisição",
            "name": "corpo",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON com pares ?chave=valor",
            "name": "consulta",
            "required": false,
            "type": 3
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "description": "Estado e protocolo do Gateway",
    "name": "gateway",
    "options": [
      {
        "description": "Configuração de Gateway do bot",
        "name": "estado",
        "options": [],
        "type": 1
      },
      {
        "description": "Intents declaradas pelo Axyon",
        "name": "intents",
        "options": [],
        "type": 1
      },
      {
        "description": "Tabela de opcodes do Gateway",
        "name": "opcodes",
        "options": [],
        "type": 1
      },
      {
        "description": "Eventos Gateway assinados pelos módulos",
        "name": "eventos",
        "options": [],
        "type": 1
      },
      {
        "description": "Rota do gateway sem sessão",
        "name": "rota-gateway",
        "options": [
          {
            "description": "JSON com pares ?chave=valor",
            "name": "consulta",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "description": "Assinaturas e entitlements",
    "name": "assinatura",
    "options": [
      {
        "description": "Verificar direitos premium de um usuário",
        "name": "direitos",
        "options": [
          {
            "description": "Pessoa alvo (padrão: você)",
            "name": "pessoa",
            "required": false,
            "type": 6
          }
        ],
        "type": 1
      },
      {
        "description": "Listar entitlements do aplicativo",
        "name": "entitlements",
        "options": [],
        "type": 1
      },
      {
        "description": "Listar SKUs do aplicativo",
        "name": "skus",
        "options": [],
        "type": 1
      },
      {
        "description": "Criar entitlement de teste",
        "name": "entitlement-criar",
        "options": [
          {
            "description": "ID do SKU",
            "name": "sku",
            "required": true,
            "type": 3
          },
          {
            "description": "Pessoa alvo",
            "name": "pessoa",
            "required": true,
            "type": 6
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Excluir entitlement",
        "name": "entitlement-remover",
        "options": [
          {
            "description": "ID do entitlement",
            "name": "entitlement",
            "required": true,
            "type": 3
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Marcar entitlement como consumido",
        "name": "entitlement-consumir",
        "options": [
          {
            "description": "ID do entitlement consumível",
            "name": "entitlement",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Meus entitlements de uma aplicação",
        "name": "meus-entitlements",
        "options": [
          {
            "description": "ID da aplicação",
            "name": "application-id",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON com pares ?chave=valor",
            "name": "consulta",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Consultar entitlement por ID",
        "name": "entitlement-info",
        "options": [
          {
            "description": "ID da aplicação",
            "name": "application-id",
            "required": true,
            "type": 3
          },
          {
            "description": "ID do entitlement",
            "name": "entitlement-id",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON com pares ?chave=valor",
            "name": "consulta",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Assinaturas de um SKU",
        "name": "assinaturas-sku",
        "options": [
          {
            "description": "ID do SKU",
            "name": "sku-id",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON com pares ?chave=valor",
            "name": "consulta",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Consultar assinatura por ID",
        "name": "assinatura-info",
        "options": [
          {
            "description": "ID do SKU",
            "name": "sku-id",
            "required": true,
            "type": 3
          },
          {
            "description": "ID da assinatura",
            "name": "subscription-id",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON com pares ?chave=valor",
            "name": "consulta",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "description": "Instância de atividade da aplicação",
    "name": "atividade",
    "options": [
      {
        "description": "Consultar instância de atividade",
        "name": "instancia",
        "options": [
          {
            "description": "ID da aplicação",
            "name": "application-id",
            "required": true,
            "type": 3
          },
          {
            "description": "ID da instância de atividade",
            "name": "instance-id",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON com pares ?chave=valor",
            "name": "consulta",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "description": "Responder a interações pendentes",
    "name": "interacao",
    "options": [
      {
        "description": "Enviar callback de uma interação",
        "name": "responder-callback",
        "options": [
          {
            "description": "ID da interação",
            "name": "interaction-id",
            "required": true,
            "type": 3
          },
          {
            "description": "Token da interação",
            "name": "interaction-token",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON do corpo da requisição",
            "name": "corpo",
            "required": true,
            "type": 3
          },
          {
            "description": "JSON com pares ?chave=valor",
            "name": "consulta",
            "required": false,
            "type": 3
          },
          {
            "description": "Motivo registrado na auditoria",
            "name": "motivo",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "32",
    "description": "Trabalhos agendados do Axyon",
    "name": "agenda",
    "options": [
      {
        "description": "Criar um trabalho agendado",
        "name": "criar",
        "options": [
          {
            "description": "Identificador curto (a-z 0-9 - _)",
            "name": "nome",
            "required": true,
            "type": 3
          },
          {
            "description": "Expressão cron (min hora dia mês semana)",
            "name": "cron",
            "required": true,
            "type": 3
          },
          {
            "choices": [
              {
                "name": "anuncio",
                "value": "anuncio"
              },
              {
                "name": "lembrete",
                "value": "lembrete"
              },
              {
                "name": "resumo",
                "value": "resumo"
              }
            ],
            "description": "Ação executada",
            "name": "acao",
            "required": true,
            "type": 3
          },
          {
            "description": "Canal alvo (anúncio/lembrete)",
            "name": "canal",
            "required": false,
            "type": 7
          },
          {
            "description": "Texto publicado (≤1500)",
            "name": "texto",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Listar trabalhos deste servidor",
        "name": "listar",
        "options": [],
        "type": 1
      },
      {
        "description": "Detalhar um trabalho",
        "name": "detalhar",
        "options": [
          {
            "description": "Trabalho a detalhar",
            "name": "nome",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Remover um trabalho (confirmação)",
        "name": "remover",
        "options": [
          {
            "description": "Trabalho a remover",
            "name": "nome",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Pausar um trabalho",
        "name": "pausar",
        "options": [
          {
            "description": "Trabalho a pausar",
            "name": "nome",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Retomar um trabalho",
        "name": "retomar",
        "options": [
          {
            "description": "Trabalho a retomar",
            "name": "nome",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Executar um trabalho imediatamente",
        "name": "agora",
        "options": [
          {
            "description": "Trabalho a executar agora",
            "name": "nome",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "32",
    "description": "Regras de automação do Axyon",
    "name": "automacao",
    "options": [
      {
        "description": "Criar uma regra de automação",
        "name": "criar",
        "options": [
          {
            "description": "Identificador curto (a-z 0-9 - _)",
            "name": "nome",
            "required": true,
            "type": 3
          },
          {
            "choices": [
              {
                "name": "mensagem criada",
                "value": "MESSAGE_CREATE"
              },
              {
                "name": "membro entrou",
                "value": "GUILD_MEMBER_ADD"
              },
              {
                "name": "membro saiu",
                "value": "GUILD_MEMBER_REMOVE"
              },
              {
                "name": "banimento aplicado",
                "value": "GUILD_BAN_ADD"
              },
              {
                "name": "banimento removido",
                "value": "GUILD_BAN_REMOVE"
              }
            ],
            "description": "Evento gatilho",
            "name": "evento",
            "required": true,
            "type": 3
          },
          {
            "choices": [
              {
                "name": "enviar mensagem",
                "value": "enviar_mensagem"
              },
              {
                "name": "adicionar cargo",
                "value": "adicionar_cargo"
              },
              {
                "name": "remover cargo",
                "value": "remover_cargo"
              },
              {
                "name": "apenas registrar",
                "value": "registrar"
              }
            ],
            "description": "Ação disparada",
            "name": "acao",
            "required": true,
            "type": 3
          },
          {
            "description": "Canal (mensagem) ou cargo (cargo)",
            "name": "alvo",
            "required": false,
            "type": 3
          },
          {
            "description": "Texto da mensagem (≤512)",
            "name": "texto",
            "required": false,
            "type": 3
          },
          {
            "description": "Ponteiro JSON do payload (/author/bot)",
            "name": "condicao_campo",
            "required": false,
            "type": 3
          },
          {
            "choices": [
              {
                "name": "igual",
                "value": "igual"
              },
              {
                "name": "contem",
                "value": "contem"
              },
              {
                "name": "existe",
                "value": "existe"
              }
            ],
            "description": "Comparador",
            "name": "condicao_op",
            "required": false,
            "type": 3
          },
          {
            "description": "Valor esperado",
            "name": "condicao_valor",
            "required": false,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Listar regras deste servidor",
        "name": "listar",
        "options": [],
        "type": 1
      },
      {
        "description": "Detalhar uma regra",
        "name": "detalhar",
        "options": [
          {
            "description": "Regra a detalhar",
            "name": "nome",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Remover uma regra (confirmação)",
        "name": "remover",
        "options": [
          {
            "description": "Regra a remover",
            "name": "nome",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Pausar uma regra",
        "name": "pausar",
        "options": [
          {
            "description": "Regra a pausar",
            "name": "nome",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Retomar uma regra",
        "name": "retomar",
        "options": [
          {
            "description": "Regra a retomar",
            "name": "nome",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      },
      {
        "description": "Testar a regra contra um payload sintético",
        "name": "testar",
        "options": [
          {
            "description": "Regra a testar",
            "name": "nome",
            "required": true,
            "type": 3
          }
        ],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "contexts": [
      0
    ],
    "default_member_permissions": "32",
    "description": "Diário de operações do próprio Axyon",
    "name": "registros",
    "options": [
      {
        "description": "Ver o diário de ações do Axyon",
        "name": "acoes",
        "options": [
          {
            "description": "Prefixo de ação (cmd., agenda., automacao.)",
            "name": "acao",
            "required": false,
            "type": 3
          },
          {
            "description": "Filtrar por operador",
            "name": "pessoa",
            "required": false,
            "type": 6
          }
        ],
        "type": 1
      },
      {
        "description": "Histórico de mudanças de configuração",
        "name": "config",
        "options": [],
        "type": 1
      },
      {
        "description": "Histórico de execuções agendadas",
        "name": "agenda",
        "options": [],
        "type": 1
      }
    ],
    "type": 1
  },
  {
    "description": "Painel interno do sistema Axyon",
    "name": "sistema",
    "options": [
      {
        "description": "Métricas operacionais do Axyon",
        "name": "metricas",
        "options": [],
        "type": 1
      },
      {
        "description": "Limites oficiais da plataforma em uso",
        "name": "limites",
        "options": [],
        "type": 1
      },
      {
        "description": "Estado dos subsistemas desta sessão",
        "name": "sessao",
        "options": [],
        "type": 1
      }
    ],
    "type": 1
  }
] as const;
