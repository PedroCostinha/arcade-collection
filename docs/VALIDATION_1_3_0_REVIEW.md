# ARCADE COLLECTION — menu 1.3.0 em revisão local

28/10/2026. Branch: `feat/collection-1.3.0-review`.
Base e main remota confirmadas: `3599c4141f908f26ca5602fadd1e1a4c27a5f551`.
Conta GitHub e autoria Git: PedroCostinha, ID 208268275.
O pacote permanece em 1.2.0. Esta etapa não autoriza merge nem publicação.

## Proteção da coleção aprovada

O [manifesto fixo](../tests/fixtures/collection-1.2.0-manifest.json) foi
criado uma única vez, antes da implementação, a partir de um checkout
separado e destacado do commit aprovado. Esse checkout compilou os scripts
originais com Node 24.19.0 e TypeScript 7.0.2, usando as dependências locais
fixadas pelo lockfile. O manifesto registra os 34 blobs Git dos insumos,
os 28 caminhos de saída e seus SHA-256. Não existe comando de atualização
automática do manifesto nos builds ou testes da candidata.

Há dois hashes previamente registrados por arquivo: os bytes do checkout
Windows com `core.autocrlf=true` e sua representação LF, normalizando apenas
CRLF. O verificador aceita exclusivamente esses valores conhecidos, sem
normalizar arbitrariamente a saída testada. Nesta execução, 27 arquivos
coincidem com os bytes do checkout Windows e `.nojekyll` coincide com o
hash LF aprovado; esse arquivo já estava em LF no checkout de trabalho.
Não houve mudança de conteúdo. Os 28 arquivos de `dist/` e as respectivas
cópias em `prototype-dist/` são idênticos byte a byte, inclusive `.nojekyll`.

Cada build de produção verifica o inventário fechado de **28 arquivos** e
seus hashes; cada build de revisão verifica esses mesmos 28 e apenas cinco
adições permitidas: `REVIEW-ONLY.txt`, `collection/index.html`,
`collection/collection.css` e dois PNGs em `collection/portraits/`.
O [relatório de integridade](evidence/collection-1.3.0/integrity.json)
registra os hashes reais, o hash do manifesto e o inventário 28/33.

Os testes adulteraram e removeram individualmente cada um dos 28 arquivos
em ambos os artefatos: **56 alterações e 56 exclusões rejeitadas**. Mais
seis arquivos adicionais foram rejeitados em três posições de cada build.
As mutações usam cópias temporárias, nunca o manifesto de referência.
Dois builds limpos de produção e revisão reproduziram todos os hashes e
removeram uma saída de revisão obsoleta injetada pelo teste.

## Menu e arte original

HTML sem JavaScript, CSS independente e dois links nativos: `../` e
`../code-snake/`. Títulos, descrições, retratos e ações continuam disponíveis
com JavaScript desabilitado. Sem engine, framework, roteador, fonte remota
ou dependência nova. O conteúdo funciona tanto em `/collection/` quanto
em `/arcade-collection/collection/`, apenas no servidor de revisão.

Os retratos PNG são codificados no build de revisão diretamente de
`SPRITES.idle`/`PALETTE` de Ember-7 e `headSprite`/`colors` de Nib.
Um teste decodifica os PNGs e confere cada pixel, inclusive transparência,
contra os dados originais. Não houve edição dos fontes artísticos ou SVGs.
Os PNGs mantêm o escopo de arte reservada; o codificador é código MIT.

Cards lado a lado a partir de 681 px e empilhados até 680 px. Há link de
salto, títulos semânticos, textos alternativos, foco visível de 3 px e
ações com altura mínima de 50 px. Contrastes de texto verificados acima de
4,95:1. A preferência por movimento reduzido elimina transições; há ajuste
para cores forçadas. As capturas desktop e celular foram inspecionadas.

## Testes locais

Ambiente: Windows, Node 24.19.0, TypeScript 7.0.2 e Playwright 1.62.1.

| Verificação | Resultado |
| --- | --- |
| `npm test` — Barrel | 29/29 |
| `npm run test:snake` | 6/6 |
| `npm run test:artifact` — produção | 8/8 |
| `node --test tests/collection/*.test.mjs` | 6/6 |
| Build de produção | 28 arquivos; hashes aprovados; sem collection/ |
| Build de revisão | 33 arquivos; 28 cópias integrais + 5 adições permitidas |
| Reprodução dos dois builds | Mesmos caminhos e hashes byte a byte |
| Menu Chrome 156.0.8078.48 | 40 combinações aprovadas |
| Menu Firefox 153.0 | 40 combinações aprovadas |

Cada navegador cobre 320, 390, 768, 1024 e 1440 px, duas bases de URL,
JavaScript ligado/desligado e movimento reduzido ligado/desligado.
Em cada combinação são verificados layout, ausência de overflow, CSS,
retratos e alvos de toque. Cada contexto cobre salto por teclado, ordem de
Tab, foco visível, Enter, destinos dos dois jogos por mouse e contraste.
Contextos de toque emulado abrem ambos os jogos com e sem JavaScript.
Os recursos do menu retornam 200 no servidor de revisão e 404 na produção,
nas duas bases de URL. Sem erros de console/rede ou pedidos externos nos
percursos aprovados.

As suítes existentes de jogo em navegador também foram executadas contra
`dist/`: missão completa de Barrel, instruções, pausa, reinício, dano,
checkpoints, vitória e controles; Snake cobre coleta, curvas, colisões,
pausa, reinício, toque e links legais. Os resultados de produção ficam em
[Chrome](evidence/collection-1.3.0/production/chrome/) e
[Firefox](evidence/collection-1.3.0/production/firefox/).

O primeiro percurso de Barrel no Firefox atingiu timeout de 30 s ao esperar
estabilidade de um elemento em `tests/browser.mjs:69`, enquanto outras QAs
rodavam. A repetição isolada passou integralmente, sem mudar o teste ou o
jogo. Chrome terminou com 2550 pontos/duas vidas; Firefox, 2650/uma vida.
Essa instabilidade inicial não foi ocultada nem tratada como sucesso.

### Capturas e relatórios do menu

| Navegador | Desktop 1440 px | Celular 390 px | Matriz |
| --- | --- | --- | --- |
| Chrome | [PNG](evidence/collection-1.3.0/chrome/menu-1440.png) | [PNG](evidence/collection-1.3.0/chrome/menu-390.png) | [JSON](evidence/collection-1.3.0/chrome/results.json) |
| Firefox | [PNG](evidence/collection-1.3.0/firefox/menu-1440.png) | [PNG](evidence/collection-1.3.0/firefox/menu-390.png) | [JSON](evidence/collection-1.3.0/firefox/results.json) |

Para reproduzir, executar em sequência:

```sh
npm test
npm run test:snake
npm run test:artifact
npm run build:prototypes
node --test tests/collection/*.test.mjs
node tests/collection/browser.mjs
```

Repetir a última linha com `ARCADE_BROWSER=firefox`. As QAs dos jogos são
`npm run test:browser` e `npm run test:snake:browser`; usar diretórios de
evidência em `test-results/` para preservar as capturas históricas.
Para inspecionar o menu, `npm run start:prototypes` e abrir
`http://127.0.0.1:4175/arcade-collection/collection/`.

## Limitações e limites desta entrega

- Chrome/Firefox executados em modo headless; toque emulado, sem hardware
  móvel real, Safari ou leitores de tela reais. Não é uma auditoria WCAG
  exaustiva. A lógica de cores forçadas existe, mas não foi certificada com
  tecnologia assistiva real.
- A matriz local desta etapa usa Node 24. Node 22 não foi repetido
  localmente. Checks remotos do PR devem ser consultados separadamente;
  a configuração de CI não é prova de execução.
- Sem JavaScript, o menu funciona integralmente. Os jogos mantêm sua
  necessidade existente de JavaScript para iniciar partidas.
- Nenhum workflow foi modificado. A nova QA completa do menu é local;
  os comandos de build existentes também executam o guardião dos 28 arquivos.
- O checkout temporário independente da referência permanece em
  `C:\Users\55149\AppData\Local\Temp\arcade-approved-3599c414`.
  A revisão automática de aprovação rejeitou sua limpeza com
  `blocked by policy`, inclusive a remoção isolada da junction de dependências.
  Nenhum arquivo desse checkout entra no commit ou nos artefatos entregues.
- Nenhuma alteração em mecânicas, controles, fontes/artes dos jogos, HTML
  raiz, package.json/lockfile, workflows, perfil, CODE QUEST V2 ou SVGs.
  Sem deploy, publicação de protótipo, tag, Release ou merge.

O Draft PR aguarda aprovação visual e técnica do titular antes de qualquer
decisão sobre publicação de 1.3.0.

## Arquivos desta alteração

- `prototypes/collection/index.html` e `collection.css`: menu e identidade própria.
- `scripts/build.mjs`, `build-prototypes.mjs`, `verify-collection.mjs` e
  `collection-portraits.mjs`: proteção dos artefatos e geração dos retratos.
- `scripts/serve.mjs` e `serve-prototypes.mjs`: MIME PNG e endereço local do menu.
- `tests/fixtures/collection-1.2.0-manifest.json`,
  `tests/collection/integrity.test.mjs` e `tests/collection/browser.mjs`:
  referência fixa e testes.
- `README.md`, este relatório e 11 evidências em
  `docs/evidence/collection-1.3.0/`: quatro capturas, duas matrizes JSON,
  quatro resultados JSON dos jogos e um relatório de integridade.
