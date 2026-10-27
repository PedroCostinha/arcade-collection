# Inventário de produção — coleção 1.2.0 candidata

28 arquivos: 21 preservados do Barrel Quest 1.1.0 e sete exclusivos de Code Snake.
Diretório de publicação: `dist/`. O estudo `/collection/` não é distribuído.

```text
.nojekyll
ART-RIGHTS.txt
LICENSE-CODE.txt
LICENSING.txt
app.js
art/ember7.js
art/identity.js
art/scene.js
browser/controls.js
code-snake/LICENSING.txt
code-snake/index.html
code-snake/modules/app.js
code-snake/modules/art.js
code-snake/modules/core.js
code-snake/modules/render.js
code-snake/style.css
core/clock.js
core/collision.js
core/game.js
core/input.js
core/level.js
core/types.js
favicon.svg
index.html
render/canvas.js
render/sprites.js
styles.css
theme.css
```

## Referência dos 21 arquivos estáveis

Origem: main aprovada `42349ce5e112fff3d2fcedd69e29a7d7b6bfc164`, cujo
build Barrel coincide com o commit/tag estável `ffc56b1b312bf91889999902398ebe2fa9b74bee`.
Hashes SHA-256 de conteúdo com normalização exclusiva de CRLF para LF.
Nenhuma exceção de conteúdo autorizada ou necessária. Fixture fixo em
`tests/fixtures/barrel-1.1.0-manifest.json`; não atualizar para aceitar regressões.

| Arquivo em dist/ | SHA-256 |
| --- | --- |
| `.nojekyll` | `01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b` |
| `app.js` | `ab5e635d441deb3bd156b76c45f9ce8a124539f7e5d7bff2450066d92e4f309f` |
| `ART-RIGHTS.txt` | `0bf23dd3fa2d90c10bd93c3fc67ab80e59f44e612d8d5dcb569eff9675f60ae0` |
| `art/ember7.js` | `a6570ffbf4772120fb072da9832c16b4f2b0baaf1b62e1c4d1d02b651d47360f` |
| `art/identity.js` | `0da9f9e0cac91dcc04e0fd9cd6e9cafc8ffa50152e73cdbdb545fa701bb210b8` |
| `art/scene.js` | `a0a6c6fcb81acbc3a7b7ab2bf822add35327222bc94232ad03bba056221c3566` |
| `browser/controls.js` | `aeab237f8cb6e289aec221e2fa7a9e4f663ef0634a0f8d9b9fdb02e4d3517599` |
| `core/clock.js` | `ec27054104fc84279cf846e7f3b2862d6fbdaa8bb2b285c88f26a9716d734029` |
| `core/collision.js` | `0c115668b9480b25bddae986a2943d75e16eea38c3f2333c5de50fa13e1fdcee` |
| `core/game.js` | `10ac7568c0886d50c04d229740891cfcf964791fbfbb55cd1375720ffe98bfe1` |
| `core/input.js` | `f0e436d04f462978bd1e0e1d0d9fff5e1442d4882b7c9bf7b38267dfe3f6f980` |
| `core/level.js` | `9738cd9ac9c55dd8176f0157ba91524b53548305c06536293fc5272d25d996f0` |
| `core/types.js` | `639e6acf03b0de8f5a8e0fceff32e1273ae33b2ec5d04a4eb31c3092e7b24612` |
| `favicon.svg` | `71050c8f0ccdbb4890bf8f55a751c22a1617a9681aadd2e826b4658aa038540a` |
| `index.html` | `954925d73dc9e02090ead724bb474851d48c6eb270a459e6474e77927569606e` |
| `LICENSE-CODE.txt` | `b42772928e2cc0a7e7ef60fcc094ae06711e63f6cc4759cec2894f26e594794e` |
| `LICENSING.txt` | `6b9e0b530e697c0033f40465ae52220f121b0e887490405c84533dc347b6677e` |
| `render/canvas.js` | `d86cb0cb8d7b8d418e51b1ecbc5d489b2b6f25dac34727f76efc56718f92357f` |
| `render/sprites.js` | `5000f1d08ee74dc8f94a3ad596300b825d1aa0b12c6d1949acd4075330d5c470` |
| `styles.css` | `9b07b9505256849bf8fe3e624c2cd286687928c298c9b04fecbba3e0a71f8c1f` |
| `theme.css` | `3482825aa8732d17497d9b2f42a830a4d0a778ff06e112de44fbe4924ad1728a` |

## Licenças e exclusões

Barrel conserva seus três avisos. Snake acrescenta `code-snake/LICENSING.txt`,
com escopos MIT e reserva explícita de Nib/arte, e referencia a MIT integral
existente em `LICENSE-CODE.txt`. O HTML do Snake liga ambos os textos.

Nenhuma fonte TypeScript, teste, evidência, dependência de desenvolvimento,
script de ferramenta, documentação interna ou arquivo do mockup é admitido.
A allowlist é verificada no CI; o teste injeta arquivos obsoletos em dist/
e exige sua remoção no build limpo seguinte. Dois builds consecutivos devem
ser idênticos byte a byte no mesmo ambiente.
