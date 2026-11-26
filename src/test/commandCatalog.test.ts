import test from "node:test";
import assert from "node:assert/strict";
import { commands } from "../commands";
import { describeCatalog, RegisteredCommand } from "../commandCatalog";
const registered=commands.map(c=>c.toJSON()) as RegisteredCommand[];
test("catalog is derived from slash registration definitions",()=>{const doc=describeCatalog(registered);for(const cmd of registered)assert.ok(doc.includes("/"+cmd.name+" |"));assert.match(doc,/\/ping \| categoria: geral/);assert.match(doc,/\/deletemsg \| categoria: administração/);assert.match(doc,/\/createchannel \| categoria: administração/);assert.match(doc,/1 a 100/);assert.match(doc,/Gerenciar mensagens/);assert.match(doc,/Gerenciar canais/);assert.match(doc,/Texto \(text\)/);assert.match(doc,/Voz \(voice\)/);});
test("catalog reflects actual commands rather than a fixed list",()=>{const doc=describeCatalog([{name:"exemplo",description:"Exemplo",default_member_permissions:null}]);assert.match(doc,/\/exemplo/);assert.ok(!doc.includes("/ping"));});
