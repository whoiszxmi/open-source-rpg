# Fluxo de salas (lobby)

Este documento descreve o fluxo de criação de salas (lobby), entrada de jogadores e início do combate.

## 1. Criação da sala

1. O mestre abre o painel e cria uma sessão.
2. A API retorna um `code` curto (6 caracteres) que identifica a sala.
3. O mestre compartilha esse código com os jogadores.

**Endpoint**

```http
POST /room/create
```

**Resposta (exemplo)**

```json
{
  "ok": true,
  "room": {
    "id": 12,
    "code": "AB12CD",
    "status": "LOBBY"
  }
}
```

## 2. Jogadores entram no lobby

1. O jogador escolhe o personagem.
2. Informa o código da sala.
3. A aplicação envia a entrada da sala.

**Endpoint**

```http
POST /room/join
```

**Payload**

```json
{
  "code": "AB12CD",
  "characterId": 42,
  "role": "PLAYER"
}
```

**Eventos em tempo real**

- `room:participants` → lista atualizada de participantes.

## 3. Jogadores indicam prontidão

1. O jogador clica em “Estou pronto”.
2. O servidor atualiza a flag `isReady`.

**Endpoint**

```http
POST /room/ready
```

**Payload**

```json
{
  "code": "AB12CD",
  "characterId": 42,
  "isReady": true
}
```

**Evento**

- `room:participants` → lista atualizada com os status de prontidão.

## 4. Mestre inicia o combate

1. O mestre seleciona cenário e inimigos.
2. O mestre aciona “Iniciar combate”.
3. O servidor cria o combate e muda o status da sala para `IN_COMBAT`.

**Endpoint**

```http
POST /combat/start
```

**Payload**

```json
{
  "code": "AB12CD",
  "scenarioId": 5,
  "players": [42, 43],
  "enemies": [3, 8]
}
```

**Eventos**

- `room:status` → status atualizado da sala.
- `combat:started` → notifica o combate para redirecionar mestre e jogadores.

## 5. Conexões via Socket.IO

Ao entrar no lobby, o cliente entra na sala socket correspondente:

```js
socket.emit("room:join", `room_${code}`);
```

Isso permite receber atualizações de participantes e status em tempo real.
