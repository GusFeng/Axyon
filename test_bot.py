import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch
from bot import respond_ping, probe_discord


class PingTests(unittest.IsolatedAsyncioTestCase):
    async def test_ping_sends_and_verifies_pong(self):
        response = AsyncMock()
        interaction = SimpleNamespace(id=1, response=response,
            original_response=AsyncMock(return_value=SimpleNamespace(id=2, content="pong")))
        await respond_ping(interaction)
        response.send_message.assert_awaited_once_with("pong")
        interaction.original_response.assert_awaited_once()

    async def test_mismatch_is_not_success(self):
        interaction = SimpleNamespace(id=1, response=AsyncMock(),
            original_response=AsyncMock(return_value=SimpleNamespace(id=2, content="wrong")))
        with self.assertRaises(RuntimeError):
            await respond_ping(interaction)


class NetworkTests(unittest.TestCase):
    @patch("bot.urllib.request.urlopen")
    def test_gateway_probe(self, open_url):
        response = open_url.return_value.__enter__.return_value
        response.status = 200
        response.read.return_value = b'{"url":"wss://gateway.discord.gg"}'
        self.assertTrue(probe_discord())

    @patch("bot.urllib.request.urlopen", side_effect=OSError("offline"))
    def test_network_failure(self, open_url):
        self.assertFalse(probe_discord())


if __name__ == "__main__":
    unittest.main()
