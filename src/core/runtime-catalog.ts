import { Access, has } from '../contracts';
export interface RuntimeEntry {root:string;sub?:string;cap:string;description:string;options:readonly string[];required:readonly string[];mask:bigint}
const norm=(s:string)=>s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
export class RuntimeCatalog {
 private snapshot:readonly RuntimeEntry[]=[];
 private verifiedAt=0;
 constructor(private clock=()=>Date.now(),private ttl=360000){}
 replace(entries:readonly RuntimeEntry[]){this.snapshot=entries.map(x=>({...x,options:[...x.options],required:[...x.required]}));this.verifiedAt=this.clock();}
 clear(){this.snapshot=[];this.verifiedAt=0;}
 entries(){return this.verifiedAt&&this.clock()-this.verifiedAt<=this.ttl?this.snapshot:[];}
 available(enabled:(id:string)=>boolean,access:Access){return this.entries().filter(x=>enabled(x.cap)&&has(access.actor,x.mask));}
 select(prompt:string,entries:readonly RuntimeEntry[],limit=12){
   const q=norm(prompt),tokens=q.split(/[^\p{L}\p{N}_-]+/u).filter(x=>x.length>2);
   const score=(e:RuntimeEntry)=>{const path=norm('/'+e.root+(e.sub?' '+e.sub:''));return (q.includes(path)?100:0)+tokens.filter(t=>norm(e.root+' '+(e.sub??'')+' '+e.description).includes(t)).length;};
   return entries.map(e=>({e,n:score(e)})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n).slice(0,limit).map(x=>x.e);
 }
 format(e:RuntimeEntry){return '/'+e.root+(e.sub?' '+e.sub:'')+(e.options.length?' '+e.options.map(x=>e.required.includes(x)?'<'+x+'>':'['+x+']').join(' '):'')+' — '+e.description;}
 answer(prompt:string,entries:readonly RuntimeEntry[]):string|null{
   const q=norm(prompt);
   if(!/(comandos?|slash|^\/(?!\s))/.test(q))return null;
   const exact=/\/([\p{L}\p{N}_-]+)(?:\s+([\p{L}\p{N}_-]+))?/u.exec(q);
   if(exact){const match=entries.filter(e=>norm(e.root)===exact[1]&&(!exact[2]||norm(e.sub??'')===exact[2]));const root=entries.filter(e=>norm(e.root)===exact[1]);const list=exact[2]&&root.some(e=>e.sub)?match:match.length?match:root;if(!list.length)return 'Esse comando não consta no catálogo confirmado e disponível para seu acesso. Consulte um administrador se precisar de acesso.';return list.slice(0,18).map(e=>this.format(e)).join('\n').slice(0,1800)+'\nAs permissões do alvo são verificadas na execução.';}
   if(/(quais|listar|lista|todos|disponiveis|existem|tem|possui|conhece|quantos|quantidade)/.test(q)){if(!entries.length)return 'Não há catálogo de comandos confirmado disponível neste momento.';return 'Comandos registrados e compatíveis com seu acesso geral ('+new Set(entries.map(e=>e.root)).size+' grupos): '+[...new Set(entries.map(e=>'/'+e.root))].join(', ')+'\nPergunte por um comando específico. Permissões do alvo são verificadas na execução.';}
   return null;
 }
}
