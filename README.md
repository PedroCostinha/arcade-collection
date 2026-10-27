# ARCADE COLLECTION

**[Jogar Barrel Quest 1.1.0](https://pedrocostinha.github.io/arcade-collection/)** · [Release estável](https://github.com/PedroCostinha/arcade-collection/releases/tag/v1.1.0)

Coleção de jogos originais em TypeScript e Canvas 2D. Barrel Quest 1.1.0 já está publicado, no commit ffc56b1b312bf91889999902398ebe2fa9b74bee. O endereço atual continua abrindo Barrel Quest.

Esta branch prepara **Code Snake** para revisão local, com arte original e rota independente. Code Snake ainda não está publicado. Não há novo deploy, versão ou alteração do Barrel Quest nesta etapa.

## Executar Barrel Quest localmente

Requer Node.js 22 ou posterior e npm:

```sh
npm ci
npm run dev
```

Abra [localhost:4173](http://127.0.0.1:4173/). O build padrão gera somente Barrel Quest em `dist/`, com URLs relativas e suporte ao subcaminho `/arcade-collection/`.

Ember-7 precisa recolher cinco cargas douradas e alcançar a bandeira no quinto piso. Três vidas, checkpoints e reinício sem recarregar. Setas/A-D para mover, cima/baixo ou W-S junto às escadas, Espaço para pular, P/Escape para pausar. Há controles multitoque. Sair da janela pausa a partida.

Pontuação da partida: 250 por carga, 100 por saltar um barril e pousar em segurança e 500 pela vitória. Não representa commits ou contribuições do GitHub. Reduzir efeitos congela animações cosméticas; o movimento necessário continua ativo.

## Revisar Code Snake e estudo da home

```sh
npm run build:prototypes
npm run start:prototypes
```

- [Code Snake local](http://127.0.0.1:4175/arcade-collection/code-snake/)
- [Estudo local da coleção](http://127.0.0.1:4175/arcade-collection/collection/)
- [Barrel Quest preservado na raiz local](http://127.0.0.1:4175/arcade-collection/)

O build de revisão usa prototype-dist/, separado do artefato enviado pelo workflow Pages. Nib coleta núcleos, cresce e ganha 10 pontos por núcleo; evite bordas e corpo. Setas/WASD ou botões na tela. Pausa e reinício em HTML. Nenhum dado de contribuições é consultado ou usado na partida.

## Arquitetura e testes

Barrel Quest: src/core simula física e estados, src/browser trata entrada, src/render desenha Canvas, src/art contém dados reservados e src/app.ts integra a interface. Esses arquivos permanecem iguais à versão 1.1.0.

Code Snake: prototypes/code-snake/src contém modelo de grade, renderer interpolado, arte e adaptador DOM próprios. A home é um estudo estático em prototypes/collection. Consulte a [auditoria e os três planos de evolução](docs/CODE_SNAKE_ARCHITECTURE.md) e os [resultados efetivamente executados](docs/CODE_SNAKE_VALIDATION.md).

```sh
npm test
npm run test:snake
npm run test:snake:browser
npm run test:browser
```

npm test compila o build estável e cobre física, missão completa, referências artísticas, licenças e subcaminho. A suíte nova é separada. QA usa Playwright e Chrome; ARCADE_BROWSER=firefox seleciona Firefox instalado. Configure ARCADE_EVIDENCE_DIR para não sobrescrever evidências históricas do Barrel.

O CI existente testa Node 22/24 e Firefox. Pages só publica por disparo manual da main, com confirmação e SHA explícitos. Nenhum workflow foi modificado e nenhum deploy foi executado nesta etapa. O protótipo fica fora de dist/ mesmo após seu build local. Integração, publicação e nova release dependem de aprovação.

## Licenças e referências

Código original MIT; personagens, sprites, paleta, composição e identidade têm direitos reservados. O conjunto não é integralmente MIT. [Mapa existente](LICENSING.md) · [MIT](LICENSE-CODE.txt) · [Arte Barrel](ART-RIGHTS.txt) · [Escopos Code Snake](prototypes/code-snake/LICENSING.md).

[Revisão Barrel 1.1.0](docs/REVIEW_V1_1.md) · [Proveniência](docs/PROVENANCE.md) · [Validação histórica](docs/VALIDATION.md) · [Preparação histórica](docs/PREPARATION_1_1_0.md). Esses documentos registram etapas anteriores e não substituem o estado público atual.
