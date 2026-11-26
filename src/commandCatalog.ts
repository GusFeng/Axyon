import { ApplicationCommandOptionType, PermissionFlagsBits } from "discord.js";

export type RegisteredCommand = {
  name:string; type?:number; id?:string; description:string;
  default_member_permissions?:string|null;
  options?:readonly {name:string;type:number;description?:string;required?:boolean;min_value?:number;max_value?:number;choices?:readonly {name:string;value:string|number}[]}[];
};
const notes:Record<string,string> = {
  ping:"Responde pong e verifica a resposta no Discord.",
  deletemsg:"Exclusão irreversível. Seleciona as mensagens recentes do canal atual, inclusive fixadas; mensagens antigas são apagadas individualmente. Se houver menos mensagens, apaga somente as encontradas. O bot também precisa Ver canal e Ler histórico. A operação verifica quantas mensagens foram removidas.",
  createchannel:"Cria canal de texto ou voz no servidor atual e verifica a criação. Nomes de texto são normalizados para minúsculas e espaços viram hífens. Nome de 1 a 100 caracteres."
};
function permissions(raw:string|null|undefined):string {
  if(raw===null||raw===undefined)return "Sem permissão administrativa específica";
  const bits=BigInt(raw);
  if(bits===0n)return "Restrito por padrão";
  const result:string[]=[];
  if(bits&PermissionFlagsBits.ManageMessages)result.push("Gerenciar mensagens");
  if(bits&PermissionFlagsBits.ManageChannels)result.push("Gerenciar canais");
  if(bits&PermissionFlagsBits.Administrator)result.push("Administrador");
  const known=PermissionFlagsBits.ManageMessages|PermissionFlagsBits.ManageChannels|PermissionFlagsBits.Administrator;
  if(bits&~known)result.push("Outras permissões Discord configuradas");
  return result.join(", ")||"Permissões Discord configuradas";
}
export function describeCatalog(registered:readonly RegisteredCommand[]):string {
  return registered.map(command=>{
    const restricted=command.default_member_permissions!==null&&command.default_member_permissions!==undefined;
    const lines=[`/${command.name} | categoria: ${restricted?"administração":"geral"} | ${command.description}`,
      "Permissões padrão: "+permissions(command.default_member_permissions)];
    for(const option of command.options??[]){
      const kind=option.type===ApplicationCommandOptionType.Integer?"inteiro":option.type===ApplicationCommandOptionType.String?"texto":"opção";
      const range=option.min_value!==undefined||option.max_value!==undefined?`; limites: ${option.min_value??"sem mínimo"} a ${option.max_value??"sem máximo"}`:"";
      const choices=option.choices?.length?"; opções: "+option.choices.map(c=>`${c.name} (${c.value})`).join(", "):"";
      lines.push(`Parâmetro ${option.name}: ${kind}; ${option.required?"obrigatório":"opcional"}${range}${choices}. ${option.description??""}`);
    }
    if(Object.hasOwn(notes,command.name))lines.push(notes[command.name]);
    return lines.join("\n");
  }).join("\n\n");
}
