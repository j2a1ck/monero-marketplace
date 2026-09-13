# Monero Wallet RPC — Setup & Usage Guide

This guide covers starting `monero-wallet-rpc` on **stagenet**, creating a wallet, verifying the connection, and sending a transaction via JSON-RPC.

## 0. Download Monero (CLI / monero-wallet-rpc)

`monero-wallet-rpc` ships inside the official Monero CLI bundle from the GetMonero project.

1. Go to **<https://www.getmonero.org/downloads/>**
2. Pick your OS (Linux, macOS, or Windows).
3. Download the CLI archive (not the GUI, unless you also want the graphical wallet).
4. Extract it:

   ```bash
   tar -xjf monero-linux-x64-v0.18.x.x.tar.bz2
   cd monero-x86_64-linux-gnu-v0.18.x.x
   ```

5. Confirm the binary is present and executable:

   ```bash
   ls monero-wallet-rpc
   chmod +x monero-wallet-rpc
   ```

6. (Optional but recommended) verify the download's PGP signature/hash listed on the downloads page to make sure the binary hasn't been tampered with.

From here, `./monero-wallet-rpc` in Step 1 below refers to this extracted binary — either run it from this folder or move it somewhere on your `PATH`.

> macOS users: Gatekeeper may block the first run — go to **System Settings → Privacy & Security** and allow it, or run `xattr -d com.apple.quarantine monero-wallet-rpc`.

---

## Prerequisites

- `monero-wallet-rpc` binary (downloaded above)
- `curl` installed
- A running/reachable stagenet daemon (using a public node below)

> ⚠️ **Stagenet only.** These commands point at a public stagenet node and use test credentials. Do not reuse this setup or these wallet passwords on mainnet.

---

## 1. Start the Wallet RPC Server

Launches the RPC server so external tools (scripts, apps, curl) can create and manage wallets and broadcast transactions.

```bash
./monero-wallet-rpc \
  --daemon-address node.monerodevs.org:38089 \
  --rpc-bind-port 18082 \
  --wallet-dir ./wallets \
  --disable-rpc-login \
  --stagenet
```

| Flag | Meaning |
| --- | --- |
| `--daemon-address` | Remote stagenet daemon node the wallet RPC will sync/broadcast through |
| `--rpc-bind-port` | Port the RPC server listens on locally |
| `--wallet-dir` | Directory where wallet files are stored/loaded from |
| `--disable-rpc-login` | Skips RPC username/password auth (fine for local dev, **not for production**) |
| `--stagenet` | Runs against the stagenet network instead of mainnet |

---

## 2. Create a Wallet

```bash
curl -X POST http://127.0.0.1:18082/json_rpc \
  -d '{
    "jsonrpc":"2.0",
    "id":"0",
    "method":"create_wallet",
    "params":{
      "filename":"<WALLET_FILENAME>",
      "password":"<WALLET_PASSWORD>",
      "language":"English"
    }
  }' \
  -H 'Content-Type: application/json'
```

**Expected response:**

```json
{
  "id": "0",
  "jsonrpc": "2.0",
  "result": {}
}
```

An empty `result` means success — the wallet file was created in `--wallet-dir`.

---

## 3. Check Connection

Confirms the RPC server is up and returns the API version — a good first sanity check before doing anything else.

```bash
curl -X POST http://127.0.0.1:18082/json_rpc \
  -d '{"jsonrpc":"2.0","id":"0","method":"get_version"}' \
  -H 'Content-Type: application/json'
```

**Expected response:**

```json
{
  "id": "0",
  "jsonrpc": "2.0",
  "result": { "version": 65552 }
}
```

---

## 4. Send Monero

Transfers funds to one or more destination addresses.

```bash
curl -X POST http://127.0.0.1:18082/json_rpc \
  -d '{
    "jsonrpc":"2.0",
    "id":"0",
    "method":"transfer",
    "params":{
      "destinations":[
        {"amount":100000000000,"address":"<DEST_ADDRESS_1>"},
        {"amount":200000000000,"address":"<DEST_ADDRESS_2>"}
      ],
      "account_index":0,
      "subaddr_indices":[0],
      "priority":0,
      "ring_size":7,
      "get_tx_key":true
    }
  }' \
  -H 'Content-Type: application/json'
```

| Field | Meaning |
| --- | --- |
| `amount` | Amount in **atomic units** — 1 XMR = 1,000,000,000,000 (1e12). `100000000000` = 0.1 XMR |
| `account_index` | Which account in the wallet to send from (0 = default) |
| `subaddr_indices` | Which subaddress(es) within the account to spend from |
| `priority` | Fee priority (0 = default) |
| `ring_size` | Number of decoys mixed in per input for privacy |
| `get_tx_key` | Returns the tx private key in the response, useful for proving a payment later |

**Expected response:**

```json
{
  "id": "0",
  "jsonrpc": "2.0",
  "result": {
    "fee": 123456789,
    "tx_hash": "...",
    "tx_key": "..."
  }
}
```

---

## Gotchas

- **Amounts are atomic units, not XMR.** Always multiply XMR by `1e12` before sending.
- **`--disable-rpc-login` is for local dev only.** Use `--rpc-login user:pass` for anything exposed beyond localhost.
- **Wallet must be open before transferring.** If `create_wallet` was called in a previous session, use `open_wallet` first — `create_wallet` will fail if the file already exists.
- **Stagenet addresses look different from mainnet.** Don't mix up stagenet/mainnet addresses — sending to the wrong network's address format will be rejected.