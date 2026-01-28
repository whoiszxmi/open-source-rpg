# Visual Packs

## Formato do ZIP
O arquivo zip deve conter um `manifest.json` na raiz e todos os assets referenciados no manifest.

Estrutura sugerida:

```
manifest.json
sprites/
fx/
scenes/
```

## Manifest mínimo

```json
{
  "packId": "base_pack",
  "name": "Base Pack",
  "version": "1.0.0",
  "sprites": {
    "default": {
      "image": "sprites/placeholder.png",
      "frameWidth": 32,
      "frameHeight": 32,
      "animations": { "idle": [0] }
    }
  },
  "fx": {
    "spark": {
      "image": "fx/spark.png",
      "frameWidth": 32,
      "frameHeight": 32,
      "animations": { "play": [0] }
    }
  },
  "scenes": {
    "default": { "background": "scenes/background.png" }
  },
  "mappings": {
    "default": {
      "ATTACK": { "actorAnim": "idle", "targetAnim": "hit", "fx": "spark" }
    }
  }
}
```

## Upload
Use o dashboard em `/dashboard/visualpacks` para enviar o zip. O backend valida o manifest e instala os assets em:

```
/public/assets/packs/<packId>/
```

## Aplicar aparência
No dashboard de personagens, selecione o pack e o `skinKey`. A configuração fica em `CharacterAppearance`.

## Mapeamento de técnicas
O resolver segue a ordem:
1. `mappings.techniques[techniqueId]`
2. `mappings.techniques[techniqueKey]`
3. `mappings.default[action]`

Se nenhum mapeamento existir, o fallback é não renderizar FX.
