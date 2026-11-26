import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock
from bot import respond_ping
from operations import ping, quantity, channel_name

class PingTests(unittest.IsolatedAsyncioTestCase):
    async def test_ping_sends_and_verifies_pong(self):
        response=AsyncMock()
        interaction=SimpleNamespace(id=1,response=response,original_response=AsyncMock(return_value=SimpleNamespace(id=2,content="pong")))
        await respond_ping(interaction)
        response.send_message.assert_awaited_once_with("pong")

    async def test_mismatch(self):
        interaction=SimpleNamespace(id=1,response=AsyncMock(),original_response=AsyncMock(return_value=SimpleNamespace(id=2,content="wrong")))
        with self.assertRaises(RuntimeError):
            await respond_ping(interaction)

class OperationsTests(unittest.TestCase):
    def test_ping(self):
        self.assertEqual(ping(),"pong")
    def test_quantity(self):
        for valid in (1,99,100):
            self.assertEqual(quantity(valid),valid)
        for invalid in (0,101,True,"99"):
            with self.assertRaises(ValueError):
                quantity(invalid)
    def test_channel_name(self):
        self.assertEqual(channel_name(" bar "),"bar")
        with self.assertRaises(ValueError):
            channel_name("")
