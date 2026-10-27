# Code Snake — revisão final de qualidade

27/10/2026. Complementa o registro histórico `CODE_SNAKE_VALIDATION.md`.
Base desta etapa: `eab41b362dbbf1d45adfb7a15c1dbefbc4ca3f7f`.

As ações foram movidas para antes do tabuleiro na ordem real do HTML. O
cabeçalho tem margens menores; a opção de reduzir efeitos tem alvo de 44 px
de altura. O botão inicial aparece na primeira tela de 844 px de altura.
O Canvas continua recebendo foco pelos handlers existentes. O código de
simulação, velocidade, pontuação, colisões e renderização não foi alterado.

## CI

Os mesmos três jobs permanecem: Node 22, Node 24 e missão Firefox. Os dois
jobs Node mantêm `npm test` (29 testes Barrel) e acrescentam `npm run
test:snake` (build TypeScript dos protótipos e seis testes Snake). O job
Firefox mantém toda a missão Barrel e acrescenta build dos protótipos e
`npm run test:snake:browser`. A imagem, ações fixadas por SHA, permissões
somente de leitura e checkout sem credenciais persistidas permanecem.
Nenhum workflow de publicação Pages foi alterado ou disparado.

## Validação local executada

- TypeScript strict: builds estável e protótipos aprovados.
- Domínio/arte/build: 29/29 Barrel e 6/6 Snake aprovados.
- Snake em Chrome 155.0.8059.85 e Firefox 153.0: início nativo por teclado,
  foco no Canvas, coleta +10, curvas, pausa com pixels estáveis, blur,
  Game Over, reinício, toque emulado, redução de efeitos e subcaminho.
- Em 320, 390, 768 e 1440 × 844, as ações precedem o Canvas e ficam
  integralmente visíveis sem rolagem; sem overflow horizontal. Botões de
  ação têm pelo menos 46 px de altura; direcionais móveis medem 58 × 52 px.
- Nenhum erro de página ou request externo no percurso observado.

O teste de navegador agora exige essas condições de layout, além das
regressões funcionais anteriores. Evidências desta etapa ficam separadas
das capturas históricas: [Chrome](evidence/code-snake-final/chrome/results.json),
[Firefox](evidence/code-snake-final/firefox/results.json),
[primeira tela desktop](evidence/code-snake-final/chrome/00-desktop-first-screen.png)
e [primeira tela móvel](evidence/code-snake-final/chrome/00-mobile-first-screen.png).

A regressão completa de navegador Barrel também passou em Chrome e Firefox:
cinco entregas, quatro checkpoints, vitória, danos/vidas, pausa/reinício e
layout sem overflow. Placar Chrome: 2550/duas vidas; Firefox: 2650/uma vida.
Todos os arquivos `src/`, `public/`, testes Barrel, scripts estáveis, lockfile,
licenças e workflow Pages foram comparados contra a base sem diferenças.
Os arquivos estáveis de `dist/` coincidem byte a byte com a raiz copiada
para `prototype-dist/`; as rotas Snake/coleção não entram no build estável.

O [CI remoto do commit funcional 9065f60](https://github.com/PedroCostinha/arcade-collection/actions/runs/40517205046)
executou TypeScript e as duas suítes em Node 22/24, a missão completa Barrel
e a QA Snake em Firefox. Esta atualização de evidências mantém o mesmo
código de produto; acrescenta somente captura da primeira tela móvel ao
teste existente. Os checks do head final devem ser conferidos no PR.

Parecer visual: o botão inicial tem destaque e fica acima do tabuleiro,
sem alterar a identidade ou o tamanho da grade. A primeira tela desktop
não contém o tabuleiro inteiro, mas permite iniciar imediatamente. Em
390 px, ações e tabuleiro ficam visíveis e os direcionais vêm em seguida.
Capturas/evidências da arte continuam reservadas a PedroCostinha.

Safari, hardware móvel e leitor de tela real permanecem pendentes. Toque e
viewport móveis são emulados. Essa revisão não publica Code Snake e não
autoriza merge, Release, deploy nem atualização da versão hospedada.
