import test from "node:test";
import assert from "node:assert/strict";
import { ping, quantity, channelKind, channelName, InputError, unknownMessage } from "../operations";
import { authorized } from "../control";

test("ping",()=>assert.equal(ping(),"pong"));
test("quantity accepts 1, 99, 100",()=>{for(const n of [1,99,100])assert.equal(quantity(n),n);});
test("quantity rejects invalid values",()=>{for(const n of [0,101,true,"99",1.5,null])assert.throws(()=>quantity(n),InputError);});
test("channel kinds",()=>{assert.equal(channelKind("text"),"text");assert.equal(channelKind("voice"),"voice");assert.throws(()=>channelKind("other"),InputError);});
test("numeric channel names",()=>{for(const n of ["1","2","3","4","5"]){assert.equal(channelName(n,"text"),n);assert.equal(channelName(n,"voice"),n);}});
test("channel name validation",()=>{assert.equal(channelName(" Bar Azul ","text"),"bar-azul");assert.equal(channelName(" Bar Azul ","voice"),"Bar Azul");assert.throws(()=>channelName("","text"),InputError);});
test("control authorization",()=>{const key="a".repeat(32);assert.equal(authorized(key,key),true);assert.equal(authorized("wrong",key),false);assert.equal(authorized(undefined,key),false);assert.equal(authorized("short","short"),false);});
test("unexpected errors do not count as deleted",()=>assert.equal(unknownMessage(new Error("not found")),false));
