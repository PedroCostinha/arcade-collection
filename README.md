# ARCADE COLLECTION

**[Jogar Barrel Quest 1.1.0](https://pedrocostinha.github.io/arcade-collection/)** ·
**[Jogar Code Snake](https://pedrocostinha.github.io/arcade-collection/code-snake/)** ·
[Release oficial v1.2.0](https://github.com/PedroCostinha/arcade-collection/releases/tag/v1.2.0)

A coleção pública continua na versão **1.2.0**, publicada em 28/10/2026.
Esta branch prepara a **candidata 1.3.0** para revisão e publicação futura.
O menu aprovado passa a integrar o build em `collection/`; Barrel Quest
continua na raiz e Code Snake em `code-snake/`.

## Executar a candidata localmente

Requer Node.js 22 ou posterior e npm:

~~~sh
npm ci --ignore-scripts --no-audit --no-fund
npm run dev
~~~

- [Menu 1.3.0](http://127.0.0.1:4173/arcade-collection/collection/)
- [Barrel Quest 1.1.0](http://127.0.0.1:4173/arcade-collection/)
- [Code Snake](http://127.0.0.1:4173/arcade-collection/code-snake/)

Os links locais exigem o servidor em execução. `npm run build` gera
`dist/`; `npm start` serve o artefato já gerado, com e sem subcaminho.

## Versões e preservação

O pacote e seu lockfile identificam a **coleção 1.3.0**. Barrel Quest
permanece individualmente em **1.1.0**. O HTML aprovado do Code Snake
continua exibindo **COLEÇÃO 1.2.0**, o contexto de sua publicação original;
esse rótulo não acompanha a versão atual do pacote nem define uma versão
individual nova do jogo. Seu conteúdo não foi alterado para atualizar rótulos.

Cada build valida os 28 arquivos publicados da coleção 1.2.0 contra o
[manifesto histórico imutável](tests/fixtures/collection-1.2.0-manifest.json).
Ele registra a referência independente `3599c4141f908f26ca5602fadd1e1a4c27a5f551`
e duas representações previamente aprovadas de bytes (CRLF/LF), sem aceitar
novos hashes. Os 21 arquivos do Barrel e sete do Snake permanecem intactos.
Física, controles, pontuação, sprites, HTML dos jogos e raiz são preservados.

O inventário público é fechado em **32 arquivos**: os 28 históricos e apenas
`collection/index.html`, `collection/collection.css`,
`collection/portraits/ember7.png` e `collection/portraits/nib.png`.
O [manifesto novo do menu](tests/fixtures/collection-1.3.0-menu-manifest.json)
fixa as quatro adições; nenhum manifesto é regenerado pelo build/testes.

O build usa o HTML/CSS aprovado de `prototypes/collection/`, retirando apenas
indicadores de revisão. A classe do indicador é renomeada sem alterar suas
regras visuais; os retratos usam os pixels originais de Ember-7 e Nib.
O menu usa links relativos nativos e funciona sem JavaScript. Os jogos
mantêm sua necessidade de JavaScript para iniciar partidas. Não há fontes
remotas, framework ou novas dependências de runtime.

## Testes e evidências

Executar em sequência:

~~~sh
npm test
npm run test:snake
npm run test:artifact
npm run test:collection
npm run test:browser
npm run test:snake:browser
npm run test:collection:browser
~~~

Barrel 29/29, Snake 6/6, produção 8/8 e menu/integridade 6/6.
Chrome é o padrão; `ARCADE_BROWSER=firefox` seleciona Firefox instalado.
As variáveis `ARCADE_EVIDENCE_DIR`, `SNAKE_EVIDENCE_DIR` e
`COLLECTION_EVIDENCE_DIR` configuram as saídas. Use `test-results/`
para preservar as evidências históricas dos jogos.

O CI remoto inclui as quatro suítes em Node 22 e 24 e ambos os jogos e o
menu em **Chrome e Firefox × Node 22 e 24**. A QA do menu serve `dist/` e
cobre 40 combinações por job: cinco larguras, duas bases de URL,
JavaScript ligado/desligado e movimento reduzido ligado/desligado.
As capturas e relatórios dos navegadores são anexados ao CI por 14 dias.

[Preparação, hashes, inventário, capturas e limitações](docs/PREPARATION_1_3_0.md).
[Revisão local anterior](docs/VALIDATION_1_3_0_REVIEW.md) ·
[Validação histórica 1.2.0](docs/VALIDATION_1_2_0.md).

## Ambiente de revisão histórico

`npm run build:prototypes` e `npm run start:prototypes` mantêm a prévia
histórica em `prototype-dist/`, com indicadores locais e `REVIEW-ONLY.txt`.
Esse diretório não pode ser publicado. O build de produção não inclui o aviso
nem os indicadores de revisão. Os 28 arquivos dos jogos coincidem byte a byte
nos dois builds.

## Publicação futura

O workflow Pages permanece exclusivamente manual (`workflow_dispatch`),
com titular PedroCostinha, branch main, confirmação explícita, SHA completo
exato e upload somente de `dist/`. O guardião reconhece a candidata 1.3.0,
valida as versões e os 32 arquivos. A preparação não dispara esse workflow.
Merge, deploy, tag e Release exigem aprovação posterior em etapa independente.
A Release pública 1.2.0 identifica `e370011593572ead3252397089af816759c08eb5`.

## Licenças

Código original MIT; personagens, sprites, paleta, composição e identidade
reservados. O conjunto não é integralmente MIT. [MIT integral](LICENSE-CODE.txt)
· [Mapa Barrel preservado](LICENSING.md) · [Arte Barrel](ART-RIGHTS.txt)
· [Escopos de Nib e Code Snake](games/code-snake/LICENSING.md).

Os avisos dos dois jogos continuam iguais. O CSS/composição e retratos do
menu seguem os escopos de arte reservada; o codificador PNG é código MIT.
