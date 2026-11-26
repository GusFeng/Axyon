"""Authenticated, allowlisted remote control; no arbitrary code execution."""
import asyncio
import hmac
import logging
import os
import time
import re
from aiohttp import web
import discord
from operations import ping, create_channel, delete_messages, quantity

log = logging.getLogger("raibot.control")
PAGE = """<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>RaiBot Control</title>
<style>body{font:16px system-ui;max-width:620px;margin:40px auto;padding:16px}label{display:block;margin:12px 0}input,select,button{display:block;padding:8px;width:100%;box-sizing:border-box}button{margin-top:18px}</style>
<h1>RaiBot Control</h1><p>Interface operacional autenticada.</p>
<form method="post" action="/operate" autocomplete="off">
<label>Chave de controle <input type="password" name="key" required></label>
<label>Operação <select name="operation"><option value="ping">ping</option><option value="createchannel">createchannel</option><option value="deletemsg">deletemsg</option></select></label>
<label>ID da solicitação (único) <input name="request_id" required maxlength="80"></label>
<label>Nome do canal (criação) <input name="name" maxlength="100"></label>
<label>Tipo <select name="kind"><option value="text">Texto</option><option value="voice">Voz</option></select></label>
<label>ID do canal (exclusão ou ping opcional) <input name="channel_id" inputmode="numeric"></label>
<label>Quantidade <input name="count" type="number" min="1" max="100"></label>
<label>Confirmação de exclusão (digite DELETE) <input name="confirmation"></label>
<button type="submit">Executar</button></form></html>"""

async def start_control(client):
    key = os.environ.get("RAIBOT_CONTROL_KEY", "")
    guild_id = os.environ.get("RAIBOT_CONTROL_GUILD", "")
    if len(key) < 32 or not guild_id.isdecimal():
        log.warning("CONTROL_DISABLED missing configuration")
        return None
    lock = asyncio.Lock()
    seen = {}
    attempts = {}
    def response(data, status=200):
        return web.json_response(data, status=status, headers={"Cache-Control":"no-store"})
    async def home(request):
        return web.Response(text=PAGE, content_type="text/html", headers={"Cache-Control":"no-store","Content-Security-Policy":"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"})
    async def health(request):
        return response({"ready":client.is_ready()})
    async def operate(request):
        now = time.monotonic()
        peer = request.remote or "unknown"
        attempts[peer] = [t for t in attempts.get(peer, []) if now-t < 60]
        if len(attempts[peer]) >= 15:
            return response({"error":"rate limited"},429)
        attempts[peer].append(now)
        try:
            data = await request.json() if request.content_type == "application/json" else dict(await request.post())
        except Exception:
            return response({"error":"invalid request"},400)
        if not isinstance(data, dict):
            return response({"error":"invalid request"},400)
        provided = request.headers.get("Authorization", "").removeprefix("Bearer ") or data.get("key","")
        if not isinstance(provided,str) or not hmac.compare_digest(provided.encode(),key.encode()):
            return response({"error":"unauthorized"},401)
        rid = data.get("request_id","")
        op = data.get("operation","")
        if not isinstance(rid,str) or not re.fullmatch(r"[A-Za-z0-9_-]{8,80}",rid) or op not in ("ping","createchannel","deletemsg"):
            return response({"error":"invalid operation or request_id"},400)
        if not client.is_ready():
            return response({"error":"bot not ready"},503)
        async with lock:
            if rid in seen:
                return response({"error":"request_id already used; inspect logs"},409)
            if len(seen)>=5000:
                return response({"error":"request capacity reached"},503)
            seen[rid]=True
            try:
                guild=client.get_guild(int(guild_id))
                if guild is None:
                    raise ValueError("Authorized guild unavailable")
                async def target():
                    raw=str(data.get("channel_id",""))
                    if not raw.isdecimal():
                        raise ValueError("channel_id required")
                    channel=await client.fetch_channel(int(raw))
                    if not isinstance(channel,(discord.TextChannel,discord.Thread)) or channel.guild.id!=guild.id:
                        raise ValueError("Channel outside authorized guild")
                    return channel
                if op=="ping":
                    result={"reply":ping()}
                    if data.get("channel_id"):
                        channel=await target()
                        message=await channel.send(result["reply"], allowed_mentions=discord.AllowedMentions.none())
                        verified=await channel.fetch_message(message.id)
                        if verified.content!=result["reply"] or verified.author.id!=client.user.id:
                            raise RuntimeError("Reply verification failed")
                        result["message_id"]=str(verified.id)
                        result["channel_id"]=str(channel.id)
                elif op=="createchannel":
                    if not isinstance(data.get("name"),str):
                        raise ValueError("name required")
                    result=await create_channel(client,guild,data["name"],data.get("kind"))
                else:
                    if data.get("confirmation")!="DELETE":
                        raise ValueError("Explicit DELETE confirmation required")
                    raw=data.get("count")
                    if type(raw) is not int and (not isinstance(raw,str) or not raw.isdecimal()):
                        raise ValueError("Invalid count")
                    result=await delete_messages(await target(),quantity(int(raw)))
                log.info("CONTROL_RESULT request_id=%s operation=%s result=%s",rid,op,result)
                return response({"ok":True,"request_id":rid,"operation":op,"result":result})
            except (ValueError,PermissionError) as error:
                log.warning("CONTROL_REJECTED request_id=%s operation=%s type=%s",rid,op,type(error).__name__)
                return response({"ok":False,"error":str(error),"request_id":rid},400)
            except Exception as error:
                log.error("CONTROL_FAILED request_id=%s operation=%s type=%s status=%s",rid,op,type(error).__name__,getattr(error,"status",None))
                return response({"ok":False,"error":"Operation failed; inspect state before retry","request_id":rid},502)
    app=web.Application(client_max_size=8192)
    app.router.add_get("/",home)
    app.router.add_get("/health",health)
    app.router.add_post("/operate",operate)
    runner=web.AppRunner(app,access_log=None)
    await runner.setup()
    await web.TCPSite(runner,"0.0.0.0",int(os.environ.get("PORT","8080"))).start()
    log.info("CONTROL_LISTENING")
    return runner
