# Auditoria e plano / 26 de outubro de 2026

## Perfil publicado

O [PR #3](https://github.com/PedroCostinha/PedroCostinha/pull/3) foi integrado em
26/10/2026 às **09:19:42 de Brasília** (12:19:42 UTC), pelo merge
`a27e8b9aa8b44e9e37ce790cddeb0abc39269d67`.

A [execução 40321685713](https://github.com/PedroCostinha/PedroCostinha/actions/runs/40321685713)
terminou com sucesso tanto no job `test` quanto no `update`. Os logs mostram
consulta real, geração das duas animações e alternativas estáticas, validação,
43 testes e publicação de cinco arquivos no commit
`3edd30c` (JSON do calendário + quatro SVGs).

Também reproduzimos, sem escrever na cópia do perfil, os quatro SVGs da
`origin/main` a partir de seu calendário: **366 dias, 295 contribuições reais**,
origem `github-graphql`, intervalo **26/10/2025–26/10/2026**. As strings geradas
coincidiram com os arquivos rastreados:

| Artefato | Bytes |
| --- | --- |
| CODE QUEST animado | 220.968 |
| CODE QUEST estático | 169.024 |
| Barrel Quest animado | 117.214 |
| Barrel Quest estático | 51.197 |

Somente referências remotas Git foram atualizadas por `git fetch`. Arquivos,
branch ativa, recursos e automações do perfil não foram modificados. Nenhuma
ação de merge, atualização manual ou deploy foi disparada nesta etapa.

## Estudo do Barrel Quest existente

Fonte: `PedroCostinha/PedroCostinha`, código funcional do commit `a92f3ed` e
revisão `24d458b`, posteriormente integrados. Foram examinados `barrel.py`,
`scene.py`, `sprites.py`, os testes, relatórios e workflow.

- `barrel.py`: rota pré-calculada de 32 s, cinco rampas, quatro escadas,
  encontros determinísticos com barris e pontuação de cinco trechos reais.
- `scene.py`: composição SVG/CSS, HUD, alternativas estáticas e validação.
- `sprites.py`: robô próprio Ember-7, grade 16×20, onze poses, paleta e barril.
- O SVG não é um motor interativo: suas parábolas, quedas e coletas estão
  previamente programadas; não convém transformar a timeline em física de entrada.

Preservamos identidade, autoria do robô, inclinações alternadas e organização
industrial. A física foi implementada do zero em TypeScript, separada da
renderização e dos controles. Os onze quadros próprios foram exportados para
dados estáticos TypeScript. Não houve cópia de bibliotecas arcade de terceiros.

## Decisões do primeiro nível

1. Simulação pura a **120 Hz**, renderização por requestAnimationFrame e
   limite de doze atualizações por frame. Abas ocultas pausam, em vez de
   acumular mortes ou recuperar minutos de simulação ao retornar.
2. Corpo do robô de 28×40 px, gravidade, velocidade horizontal, colisão
   superior/inferior, salto com buffer e tolerância breve de borda.
3. Rampas inteiras para caminhar; escadas são passagens deliberadas quando
   ativas. Barris percorrem os cantos, mudam de direção e caem com gravidade.
4. A separação dos andares foi ampliada para **106 px**, mantendo inclinação de
   16 px. O mínimo de 90 px acomoda robô de 40 px, salto de aproximadamente
   41 px e a viga de 9 px. O replay revelou que o espaçamento inicial de 88 px
   prejudicava a janela de salto sob pisos baixos; a ampliação passou a missão
   completa sem remover barris ou conceder vidas adicionais.
5. Três vidas, checkpoint por piso alcançado e proteção de 1,8 s após impacto.
   Entregas persistem após perder vida e zeram em nova partida. Uma derrota
   ou vitória congela a simulação até a escolha do jogador.
6. Pontos por entrega, salto com pouso e vitória. Um salto só pontua após
   pouso seguro; dano cancela bônus pendentes. Um barril não pontua duas vezes.
7. Estado e ações independentes do DOM. HTML para menus, instruções, placar,
   botões e mensagens acessíveis; Canvas para a cena. Não usar texto minúsculo
   no Canvas como único meio de transmitir estado ou objetivo.
8. Em celular: câmera recortada em 480×360, controles de pelo menos 44 px,
   captura de ponteiro, multitoque e liberação em cancelamento/blur.

## Contribuições, dependências e publicação

O jogo inicial **não lê calendário nenhum**. Os 295 pontos/contribuições do
perfil não são copiados para o placar: cada partida tem seus próprios eventos.
Um desafio futuro poderia usar um snapshot público, validado e identificado
por data, sem token no cliente. Isso fica fora desta primeira entrega.

Zero dependências de runtime. TypeScript 7.0.2 e Playwright 1.62.1 são ferramentas
de desenvolvimento, com lockfile. Build usa módulos ES com extensões `.js`
explícitas e URLs relativas; não requer bundler ou framework de interface.

Não criar remoto antes da autorização. Não há workflow de deploy. Uma eventual
configuração Pages deverá separar CI de publicação e só ser ativada após
aprovação. O perfil continua hospedando os SVGs independentemente deste projeto.

Referências técnicas: [resolução de módulos TypeScript](https://www.typescriptlang.org/tsconfig/moduleResolution.html),
[runner nativo Node](https://nodejs.org/api/test.html),
[Canvas e rasterização](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas),
[relógio de testes Playwright](https://playwright.dev/docs/clock).
