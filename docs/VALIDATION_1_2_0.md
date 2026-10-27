# Validação — ARCADE COLLECTION 1.2.0 candidata

27/10/2026. Base aprovada: `42349ce5e112fff3d2fcedd69e29a7d7b6bfc164`.
Preparação para revisão; nenhum merge, deploy, tag ou Release autorizado.

## Resultados locais executados

| Ambiente | Barrel | Snake | Artefato de produção |
| --- | --- | --- | --- |
| Node 22.23.4 | 29/29 | 6/6 | 8/8 |
| Node 24.19.0 | 29/29 | 6/6 | 8/8 |

Os builds dos dois jogos usam TypeScript strict, sem relaxar as configurações
existentes. O build original do Barrel foi movido para `build-barrel.mjs`
com conteúdo canônico idêntico ao script aprovado. `src/`, `public/`,
renderer/fixtures históricos e mecânicas do Barrel não foram alterados.

- Os 21 arquivos anteriores de `dist/` coincidem com os hashes fixados de
  Barrel Quest 1.1.0, normalizando exclusivamente CRLF para LF. Nenhuma
  alteração de conteúdo ou exceção foi necessária.
- Os quatro fontes do Snake e seu CSS coincidem com hashes do protótipo
  aprovado; a promoção altera caminhos, metadados, HTML de distribuição,
  links e avisos, sem mudar ritmo, regras, entradas ou arte. Apenas o
  comentário legal do JS artístico emitido aponta ao aviso `.txt` distribuído.
- Inventário fechado de 28 arquivos: [lista exata e hashes estáveis](DIST_1_2_0.md).
- Dois builds limpos consecutivos produzem arquivos byte a byte idênticos no
  mesmo ambiente e removem arquivos obsoletos injetados pelo teste.
- Ambas as rotas e seus módulos, estilos e termos legais respondem tanto na
  raiz do servidor quanto sob `/arcade-collection/`. Tipos MIME e nosniff
  conferidos. Fontes TS, testes, evidências e `/collection/` retornam 404.
- `build:prototypes` preserva o estudo da home apenas em `prototype-dist/`;
  o teste também confirma que esse build não contamina `dist/`.
- O guardião de publicação foi testado em modo somente leitura com contexto
  simulado: rejeita evento, repositório, branch, identidade, confirmação e
  SHA incorretos, incluindo SHA abreviado. Nenhum workflow foi disparado.

## QA do artefato real no navegador

As duas suítes servem `dist/`, nunca `prototype-dist/`, em porta efêmera e no
subcaminho `/arcade-collection/`. Chrome e Firefox foram executados localmente;
as versões exatas de cada execução ficam nos JSONs abaixo. As versões de
navegador podem mudar entre execuções e no runner remoto.

Barrel: missão completa por teclado DOM, barris ativos, cinco entregas,
quatro checkpoints e vitória. Chrome: 2550 pontos/duas vidas; Firefox:
2650 pontos/uma vida. Também passaram instruções, dano, Game Over, pausa,
reinício, Espaço após pausa, câmera compacta, larguras de 320 a 1440 px e
movimento reduzido. Multitoque emulado no Chrome. Sem erros ou requests
externos nos percursos registrados.

Snake: início por Espaço, foco no Canvas, coleta +10, curvas, colisão com
parede e com corpo crescido via entradas DOM, pausa com pixels estáveis,
blur, WASD/Escape e reinício. Toque emulado cobre início, coleta, direção,
pausa/retomada com foco e reinício. Movimento reduzido e ações visíveis antes
do tabuleiro em 320/390/768/1440 × 844, sem overflow horizontal. Links legais
visíveis e destinos HTTP 200 com MIME e texto integral corretos. Retorno ao
Barrel 1.1.0 confirmado. Rede e console dos percursos de jogo sem falhas ou
requests externos.

Os avisos de texto puro são conferidos por HTTP: o visualizador autônomo do
Chrome busca `/favicon.ico` na raiz do host ao abrir um documento `.txt`,
fora do subcaminho do projeto. O HTML do Snake referencia explicitamente o
favicon já distribuído pela coleção. A QA não certifica os recursos internos
do visualizador de texto do navegador.

### Capturas e relatórios

| Jogo | Chrome | Firefox |
| --- | --- | --- |
| Barrel | [JSON](evidence/collection-1.2.0/barrel/chrome/results.json), [menu](evidence/collection-1.2.0/barrel/chrome/01-menu.png), [vitória](evidence/collection-1.2.0/barrel/chrome/09-victory.png), [móvel](evidence/collection-1.2.0/barrel/chrome/10-mobile-menu.png) | [JSON](evidence/collection-1.2.0/barrel/firefox/results.json), [menu](evidence/collection-1.2.0/barrel/firefox/01-menu.png), [vitória](evidence/collection-1.2.0/barrel/firefox/09-victory.png), [móvel](evidence/collection-1.2.0/barrel/firefox/10-mobile-menu.png) |
| Snake | [JSON](evidence/collection-1.2.0/snake/chrome/results.json), [partida](evidence/collection-1.2.0/snake/chrome/03-desktop-playing.png), [móvel](evidence/collection-1.2.0/snake/chrome/00-mobile-first-screen.png) | [JSON](evidence/collection-1.2.0/snake/firefox/results.json), [partida](evidence/collection-1.2.0/snake/firefox/03-desktop-playing.png), [móvel](evidence/collection-1.2.0/snake/firefox/00-mobile-first-screen.png) |

Capturas mantêm os direitos reservados. Hardware móvel, Safari, leitores de
tela reais e sessões prolongadas não foram certificados nesta etapa.

## CI e publicação

O CI da candidata define quatro jobs: Node 22, Node 24, Firefox playable
mission e Chrome production games. Cada job Node executa Barrel, Snake e
os oito testes de artefato. Cada navegador compila o build da coleção e
executa as duas QAs contra `dist/`. Os checks associados ao SHA final do
Draft PR são a evidência remota da execução; a configuração isolada não é
tratada como prova de sucesso.

`pages.yml` foi preparado para publicação futura da coleção 1.2.0, com
`workflow_dispatch` único, main, confirmação do titular, SHA completo exato,
permissões mínimas e upload exclusivo de `dist/`. Não foi executado.

Na verificação pública desta preparação, os 21 hashes brutos publicados
permaneciam idênticos aos registrados após o merge anterior, com Barrel
Quest V1.1.0 e HTTP 404 em `/code-snake/` e `/collection/`. Pages conservava
somente a execução `40380996980` de 26/10/2026 e o deployment `7340630054`,
no SHA estável `ffc56b1b312bf91889999902398ebe2fa9b74bee`.
Tag v1.1.0 e Release ID `425370957` permaneciam nesse commit, sem mudanças.

O perfil PedroCostinha/PedroCostinha, CODE QUEST V2 e as demonstrações SVG
não foram modificados. A revisão desta candidata não autoriza publicação.
