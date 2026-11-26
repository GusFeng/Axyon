import test from "node:test";
import assert from "node:assert/strict";
import { ConversationStore } from "../ai/conversation";
test("history is isolated by conversation",()=>{const s=new ConversationStore();s.append("a","oi","olá",0);assert.equal(s.get("a",1).length,2);assert.equal(s.get("b",1).length,0);});
test("history expires after inactivity",()=>{const s=new ConversationStore(100);s.append("a","oi","olá",0);assert.equal(s.get("a",100).length,0);});
test("history remains bounded",()=>{const s=new ConversationStore(1000,2,4);for(let i=0;i<5;i++)s.append("a","q"+i,"a"+i,i);assert.equal(s.get("a",6).length,4);assert.equal(s.get("a",6)[0].content,"q3");s.append("b","q","a",6);s.append("c","q","a",7);assert.equal(s.get("a",8).length,0);});
