# ARCADE COLLECTION / Barrel Quest

**V1.1 candidata (`1.1.0-rc.1`), em revisão no Draft PR #1.** Corrige salto
por repetição de Espaço após pausa, painéis em telas intermediárias e feedback
de objetivo, dano e checkpoint. A física e a arte do protótipo foram preservadas.
Veja [a análise, os testes e as comparações antes/depois](docs/REVIEW_V1_1.md).

Primeira versão jogável de Barrel Quest, executável **localmente**. Ember-7 sobe cinco pisos,
recolhe cargas e evita barris. Código em TypeScript, Canvas 2D e arte própria.
Repositório público: [PedroCostinha/arcade-collection](https://github.com/PedroCostinha/arcade-collection).
**GitHub Pages desativado.** O código está disponível para revisão; não há URL
de jogo hospedado nesta etapa.

## Executar

Requer **Node.js 22 ou posterior** e npm. Na pasta do projeto:

```powershell
git clone https://github.com/PedroCostinha/arcade-collection.git
cd arcade-collection
git switch feat/barrel-quest-playable
npm ci
npm run dev
```

Abra [http://127.0.0.1:4173/](http://127.0.0.1:4173/). Para encerrar, Ctrl+C no
terminal. `npm run dev` compila e serve localmente, sem hot reload: após editar
fontes, execute `npm run build` e atualize a página. Se a porta estiver ocupada:

```powershell
$env:PORT=4174
npm run dev
```

Uma compilação já existente pode ser servida com `npm start`. Abrir `index.html`
diretamente por `file://` não é o fluxo suportado, por causa dos módulos ES.

## Jogar

| Controle | Ação |
| --- | --- |
| Setas esquerda/direita ou A/D | Andar e correr |
| Setas cima/baixo ou W/S | Subir/descer quando estiver junto de uma escada |
| Espaço | Pular; solte antes do próximo salto |
| P ou Escape | Pausar/continuar enquanto o foco estiver no jogo |
| Botões na tela | Segure a direção; toque PULAR. Multitoque permite ambas as ações |

Escolha **Jogar agora**. Recolha as cinco cargas douradas e chegue à bandeira
no último piso. Barris e quedas tiram uma das três vidas. O retorno usa o
último andar alcançado, preserva cargas e pontos e oferece 1,8 s de proteção
contra barris. Cair para fora do cenário continua custando uma vida.

Pule em movimento para passar sobre os barris. A pontuação é exclusivamente
da partida: **250 por carga**, **100 por saltar um barril e pousar em segurança**,
**500 pela vitória**. Não há pontos por tempo ou simples movimento. Isso não
representa commits ou contribuições do GitHub.

Menus de instruções, pausa, vitória e Game Over são HTML acessível; é possível
reiniciar sem recarregar. Sair da janela ou ocultar a aba pausa automaticamente.
O foco volta ao Canvas ao iniciar/continuar. As teclas de jogo não interceptam
campos de formulário e os botões preservam ativação nativa por teclado.

Uma faixa abaixo do cenário informa dano, checkpoint, retorno e pontos. Após
três segundos de partida, ela volta a indicar a próxima carga pendente ou a
bandeira final. As mensagens também usam `role=status`; não há flashes ou
animação adicional. Nas instruções, aproxime-se da escada e segure W/S ou ↑/↓;
solte para parar, ou pressione Espaço para sair saltando.

Em telas estreitas, uma câmera acompanha Ember-7: o mundo e a física são os
mesmos, com maior tamanho aparente do personagem. `prefers-reduced-motion`
ativa **Reduzir efeitos visuais**, congelando ciclos cosméticos e rotação de
barris; o movimento necessário para jogar e a câmera continuam ativos. Não há
pisca-pisca ou tremor de tela. Pausar congela completamente a partida.

## Testes

```powershell
npm test
npm run test:browser
```

`npm test` compila e executa testes no runner nativo do Node. A QA de navegador
usa Chrome instalado e Playwright, já fixado no lockfile. Para Firefox:

```powershell
npx playwright install firefox
$env:ARCADE_BROWSER='firefox'
npm run test:browser
```

A QA automatizada usa eventos reais de teclado/toque no DOM e o relógio RAF
do Playwright. O observador `?qa=1` existe apenas em localhost e fornece cópias
somente para leitura; não permite mudar vidas, posições ou placar. Os testes
unitários também incluem uma missão inteira com barris ativos e entradas normais.

O CI compila e executa os 25 testes em Node 22 e 24, além da missão completa
em Firefox no Linux. As Actions estão fixadas por SHA, com `contents: read`,
sem credenciais persistidas, secrets ou permissões de deploy. Evidências de CI
ficam em `test-results/`, sem alterar as capturas de referência versionadas.
Para usar esse destino localmente, defina `ARCADE_EVIDENCE_DIR` antes da QA.

## Arquitetura

```mermaid
flowchart LR
  K[Teclado e Pointer Events] --> I[InputBuffer]
  C[Relógio fixo 120 Hz] --> G[Game: estados e simulação]
  I --> G
  L[Nível e colisões] --> G
  G --> R[CanvasRenderer]
  G --> H[HUD e menus HTML]
```

| Módulo | Responsabilidade |
| --- | --- |
| `src/core/game.ts` | Estados, vidas, checkpoint, barris, entregas e eventos de pontuação |
| `src/core/level.ts` | Geometria, escadas e constantes de física |
| `src/core/collision.ts` | Colisão varrida entre barril e corpo do personagem |
| `src/core/clock.ts` | Acumulador de passo fixo, limitado após travamentos de aba |
| `src/core/input.ts` | Ações independentes da origem e borda de salto preservada |
| `src/browser/controls.ts` | Teclado, multitoque, cancelamento, blur e eventos DOM |
| `src/render/` | Ember-7, cenário, barris e câmera; não altera o estado |
| `src/app.ts` | Orquestração, RAF, foco, menus HTML e preferências |
| `public/` | Interface, CSS e favicon próprios |
| `scripts/` | Build e servidor local com biblioteca padrão do Node |
| `tests/` | Física, estados, controles, replay completo e QA de navegador |

Não há dependências de execução, engine de terceiros, fontes remotas, áudio,
telemetria, backend, tokens, storage de usuário ou requisições autenticadas.
TypeScript e Playwright são dependências de desenvolvimento com versões fixas.

## Auditoria, arte e publicação futura

- [Auditoria do perfil e plano de implementação](docs/AUDIT.md)
- [Origem e autoria da arte](docs/PROVENANCE.md)
- [Validação e capturas observadas](docs/VALIDATION.md)
- [Preparação do repositório e CI](docs/REPOSITORY_SETUP.md)
- [Recomendação de licença por recurso](docs/LICENSING.md)

`npm run build` produz `dist/` com URLs relativas, sem roteamento de SPA e
com `.nojekyll`. O mesmo conteúdo funciona em um subcaminho como
`/arcade-collection/`. Está preparado para hospedagem estática futura, mas
**não existe workflow de deploy e o Pages permanece desativado**.

O titular autorizou a publicação do repositório e o CI. A escolha de licença
para código e recursos visuais continua pendente, assim como a aprovação da
jogabilidade e qualquer configuração futura do Pages. A mudança do README do perfil
para apontar ao jogo só deve acontecer após existir uma URL aprovada e funcional.
O CODE QUEST V2 e os SVGs do perfil não foram alterados nesta implementação.
