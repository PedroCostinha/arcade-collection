# Validação local / 26 de outubro de 2026

## Resultado

A primeira versão jogável passou pelos testes automatizados e por missões
completas no Chrome e no Firefox. Está pronta para avaliação local do autor.
Isso não representa aprovação de publicação, certificação de acessibilidade
ou teste de um site já hospedado no GitHub Pages.

O [PR #3 do perfil foi integrado e seus SVGs publicados pelo Actions](AUDIT.md).
Nenhum arquivo do perfil, CODE QUEST V2 ou Barrel Quest SVG foi modificado.
O novo projeto está na branch local `feat/barrel-quest-playable`, sem remoto,
workflow de deploy ou GitHub Pages configurado.

## Ambiente e execução

- Windows, Node.js 24.19.0, npm 11.17.0.
- TypeScript 7.0.2; Playwright 1.62.1; nenhuma dependência de runtime.
- Chrome instalado **155.0.8059.85**, executado em modo headless.
- Firefox **153.0**, binário do Playwright, executado em modo headless.
- Servidor HTTP local; testes também usam o subcaminho `/arcade-collection/`.
- `npm test`: **25 testes aprovados, zero falhas**, incluindo compilação strict.
- `npm run test:browser`: aprovado no Chrome.
- `ARCADE_BROWSER=firefox npm run test:browser`: aprovado no Firefox.
- `npm audit --omit=dev`: zero vulnerabilidades reportadas nas dependências
  de execução; não equivale a uma auditoria de segurança completa.
- `git diff --cached --check`: sem erros de whitespace na entrega preparada.

O navegador usa entradas de teclado do DOM e o relógio RAF do Playwright.
O piloto escolhe ações a partir de cópias do estado: não altera posições,
vidas, pontuação, inimigos ou física. Uma missão independente também roda
diretamente no modelo puro. Não é uma medição de desempenho em hardware real.

| Missão observada | Chrome | Firefox |
| --- | --- | --- |
| Estado final | Vitória | Vitória |
| Cargas | 5/5 | 5/5 |
| Vidas restantes | 1/3 | 1/3 |
| Pontos | 2.550 | 2.550 |
| Tempo simulado | 32,217 s | 32,225 s |
| Erros de console/JavaScript | 0 | 0 |
| Requisições externas | 0 | 0 |

Os 2.550 pontos correspondem a cinco entregas (1.250), oito saltos seguros
(800) e vitória (500). Não são contribuições ou commits. O jogo não consulta
o GitHub nem incorpora um calendário nesta versão. Pequenas diferenças de
tempo entre motores decorrem do agendamento de quadros e das capturas.

## Cobertura funcional

Os testes do modelo verificam estados e retorno das instruções, movimento em
ambas as direções, acompanhamento de rampas, salto e gravidade, aterrissagem,
colisão de cabeça, queda pela borda e buffer antes do pouso. Também cobrem
escadas nos dois sentidos, parar na escada, proximidade para entrar e sair
saltando; criação, rolagem e queda de barris; colisão varrida sem atravessar
o personagem; dano, proteção, checkpoint, três vidas, Game Over e reinício.

A pontuação tem testes de coleta única, salto creditado apenas após pouso,
ausência de bônus por barril em outro andar e vitória
única. O relógio produz resultados equivalentes em 30/60/120 Hz e limita a
recuperação após travamento. Entradas simultâneas de origens diferentes,
toques breves, cópias de estado, integridade dos onze sprites e 20 mil passos
determinísticos com entradas variadas também foram exercitados.

Nos dois navegadores foram executados menu, instruções, caminhada, salto,
pausa com estado congelado, pausa ao perder foco, derrota por três quedas,
reinício sem navegação, escadas, barris ativos e vitória. Após vencer,
instruções e retorno ao menu iniciam dados limpos; abrir instruções repetidas
vezes não perde o contexto de pausa. Esses dois casos foram corrigidos na QA.

## Visual, controles e acessibilidade

As capturas abaixo foram abertas e inspecionadas: cenário preto/grafite,
vigas vermelhas, escadas, robô próprio, HUD, menus e controles de toque. Não
há sprites ou fontes externos. Desktop mostra o nível inteiro; celular usa
uma câmera 480×360 que acompanha o personagem e preserva sua legibilidade.

Foram medidos layouts de **320, 390, 768 e 1.440 px**, sem overflow horizontal.
Chrome recebeu toque emulado via CDP, inclusive dois dedos simultâneos para
andar e saltar. `touchCancel` liberou as entradas e interrompeu o movimento.
Firefox recebeu viewport estreita, mas não validação equivalente de multitoque.

`prefers-reduced-motion: reduce` foi emulado nos dois motores: a opção visual
inicia marcada. O renderer mantém a pose cosmética e a rotação dos barris
estáticas; movimento necessário ao jogo e câmera permanecem ativos. Pausa
interrompe a simulação. Não há flashes, tremor de tela ou partículas.

Menus, instruções, HUD e ações são HTML. Há nomes de botões, foco visível,
atalho para o jogo, instruções associadas ao Canvas e anúncios de eventos.
O Canvas recebe foco ao jogar/continuar; a ativação nativa de botões por
teclado é preservada. O cenário visual não tem uma alternativa jogável
não visual; a documentação não promete acessibilidade integral.

Durante a QA, Chrome capturou Canvas preto com o relógio RAF simulado, embora
o buffer de pixels tivesse conteúdo. Com relógio normal a cena apareceu; no
Firefox também. A rotina de captura passa brevemente para quadros reais no
Chrome e então retoma o relógio controlado. Ela verifica pixels desenhados e
não modifica o estado do jogo. As capturas finais mostram a cena corretamente.

## Evidências

| Momento | Chrome | Firefox |
| --- | --- | --- |
| Menu | [PNG](evidence/chrome/01-menu.png) | [PNG](evidence/firefox/01-menu.png) |
| Instruções | [PNG](evidence/chrome/02-instructions.png) | [PNG](evidence/firefox/02-instructions.png) |
| Caminhada | [PNG](evidence/chrome/03-walking.png) | [PNG](evidence/firefox/03-walking.png) |
| Salto | [PNG](evidence/chrome/04-jump.png) | [PNG](evidence/firefox/04-jump.png) |
| Pausa | [PNG](evidence/chrome/05-pause.png) | [PNG](evidence/firefox/05-pause.png) |
| Game Over | [PNG](evidence/chrome/06-game-over.png) | [PNG](evidence/firefox/06-game-over.png) |
| Escada | [PNG](evidence/chrome/07-ladder.png) | [PNG](evidence/firefox/07-ladder.png) |
| Barris | [PNG](evidence/chrome/08-barrels.png) | [PNG](evidence/firefox/08-barrels.png) |
| Vitória/placar final | [PNG](evidence/chrome/09-victory.png) | [PNG](evidence/firefox/09-victory.png) |
| Menu móvel | [PNG](evidence/chrome/10-mobile-menu.png) | [PNG](evidence/firefox/10-mobile-menu.png) |
| Toque simultâneo e salto | [PNG](evidence/chrome/11-mobile-touch-jump.png) | Não executado |
| Resultado estruturado | [JSON](evidence/chrome/results.json) | [JSON](evidence/firefox/results.json) |

## Limitações e próximos passos

- Safari não executado: não há ambiente Apple compatível disponível.
- Celular físico, leitor de tela real, gamepad e sessão prolongada de usuário
  não testados. A emulação não substitui essas verificações.
- Há um nível original, sem áudio, salvamento ou outros jogos. Dificuldade e
  câmera devem ser avaliadas pelo autor antes de ampliar o conteúdo.
- Colisões de barris usam volume conservador de arcade, não uma simulação
  física de corpos rígidos nem colisão por pixel.
- URLs relativas e subcaminho foram testados localmente; HTTPS, cache de CDN,
  CI remoto e hospedagem Pages não foram executados.
- Escolher a licença do código e arte próprios antes de publicar; consultar
  [proveniência](PROVENANCE.md). Não foi escolhida uma licença pelo autor.
- Após aprovação local, obter autorização para criar o remoto
  `PedroCostinha/arcade-collection`. CI e Pages exigem etapa posterior de
  revisão e aprovação de publicação. Só então propor o link no README do perfil.
