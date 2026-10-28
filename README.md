# ARCADE COLLECTION

**[Jogar Barrel Quest 1.1.0](https://pedrocostinha.github.io/arcade-collection/)** ·
**[Jogar Code Snake](https://pedrocostinha.github.io/arcade-collection/code-snake/)** ·
[Release oficial v1.2.0](https://github.com/PedroCostinha/arcade-collection/releases/tag/v1.2.0)

Coleção de jogos originais em TypeScript e Canvas 2D. A **coleção 1.2.0 foi
publicada oficialmente em 28/10/2026**, com Barrel Quest 1.1.0 e Code Snake em
rotas independentes no GitHub Pages. A raiz do site abre Barrel Quest;
Code Snake está disponível em `/arcade-collection/code-snake/`.

## Executar o artefato de produção localmente

Requer Node.js 22 ou posterior e npm:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run dev
```

- [Barrel Quest 1.1.0](http://127.0.0.1:4173/arcade-collection/)
- [Code Snake](http://127.0.0.1:4173/arcade-collection/code-snake/)

> **Observação:** os links locais acima funcionam somente
> enquanto o servidor de desenvolvimento estiver em execução.
> Para jogar a versão publicada, utilize os links públicos dos dois jogos
> no início deste README.

`npm run build` gera `dist/`; `npm start` serve o artefato já gerado. O
subcaminho `/arcade-collection/` é exercitado pelo servidor local e pelos
testes. A raiz continua abrindo Barrel Quest, sem nova home ou mudança de
navegação. O pacote/coleção tem versão 1.2.0; a versão individual exibida
pelo Barrel permanece 1.1.0.

Barrel: recolha cinco cargas e alcance a bandeira. Setas/A-D para mover,
cima/baixo ou W-S nas escadas, Espaço para pular, P/Escape para pausar.
Três vidas, checkpoints e multitoque. Code Snake: Nib coleta núcleos,
cresce um segmento e ganha 10 pontos por núcleo; evite bordas e corpo.
Setas/WASD ou botões na tela, P/Escape para pausar, reinício em HTML.
Os pontos são da partida e não representam contribuições do GitHub.

## Build e preservação

O build original foi preservado em `scripts/build-barrel.mjs`. O novo
`scripts/build.mjs` executa esse build limpo e acrescenta exclusivamente
`code-snake/`: HTML, CSS, quatro módulos e o aviso próprio de licenciamento.
Não são publicados fontes TS, testes, evidências ou ferramentas.

Os 21 arquivos estáveis do Barrel são comparados ao fixture da versão
1.1.0, sem exceções de conteúdo. Normaliza-se exclusivamente CRLF/LF para
comparar Windows e Linux. Física, colisões, controles, sprites, pontuação e
HTML raiz permanecem preservados. O código e a arte do Snake também têm
hashes fixados contra o protótipo aprovado.

[Preparação e estratégia](docs/PREPARATION_1_2_0.md) ·
[Inventário exato de produção](docs/DIST_1_2_0.md) ·
[Validação da preparação](docs/VALIDATION_1_2_0.md).

## Testes

```sh
npm test
npm run test:snake
npm run test:artifact
npm run test:browser
npm run test:snake:browser
```

As duas QAs de navegador servem **dist/**. Chrome é o padrão;
`ARCADE_BROWSER=firefox` seleciona Firefox instalado. Use
`ARCADE_EVIDENCE_DIR=test-results/barrel/chrome` para evitar sobrescrever as
capturas históricas do Barrel. `SNAKE_EVIDENCE_DIR` configura as capturas do
Snake. Os testes de artefato verificam inventário fechado, licenças, módulos,
rotas, dois builds reproduzíveis e remoção de arquivos obsoletos.

O CI executa as três suítes em Node 22/24 e as duas experiências em Chrome
e Firefox. Nenhuma dessas verificações depende de `prototype-dist/` para
validar o jogo de produção.

## Estudo da home, somente desenvolvimento

```sh
npm run build:prototypes
npm run start:prototypes
```

[Estudo local da coleção](http://127.0.0.1:4175/arcade-collection/collection/).
Esse comando copia o artefato de produção e acrescenta o mockup exclusivamente
em `prototype-dist/`. O estudo permanece inalterado e fora de `dist/`.

## Publicação oficial

A publicação da coleção 1.2.0 foi concluída em **28/10/2026**. A tag e a
Release oficial v1.2.0 identificam o SHA publicado
`e370011593572ead3252397089af816759c08eb5`.

Pages mantém `workflow_dispatch` como único gatilho. A publicação exige a
main, identidade do titular, confirmação explícita e SHA completo exato do
commit aprovado. O workflow verifica a coleção 1.2.0 e conserva Barrel
1.1.0, executa as suítes e envia exclusivamente `dist/` com permissões mínimas.
Esse workflow foi executado na publicação oficial. A tag e a Release v1.1.0
permanecem inalteradas.

## Licenças

Código original MIT; personagens, sprites, paleta, composição e identidade
reservados. O conjunto não é integralmente MIT. [MIT integral](LICENSE-CODE.txt)
· [Mapa Barrel preservado](LICENSING.md) · [Arte Barrel](ART-RIGHTS.txt)
· [Escopos de Nib e Code Snake](games/code-snake/LICENSING.md).

O Snake distribui seu aviso em `code-snake/LICENSING.txt` e mantém links para
esse aviso e para a MIT integral no rodapé. Os três avisos do Barrel continuam
iguais aos da versão 1.1.0.

Os documentos históricos de protótipo e de Barrel registram suas próprias
etapas; os caminhos antigos `prototypes/code-snake/` foram promovidos para
`games/code-snake/` na versão 1.2.0. [Revisão Barrel 1.1.0](docs/REVIEW_V1_1.md)
· [Revisão do protótipo aprovado](docs/CODE_SNAKE_FINAL_REVIEW.md).
