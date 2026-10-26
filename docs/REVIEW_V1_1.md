# Barrel Quest V1.1 / candidata em revisão

## Análise anterior às alterações

Base examinada: `0ac1276721a0a0c17b3e3ab5ae9394f96d180176`, branch
`feat/barrel-quest-playable`, Draft PR #1. A suíte original passou com
25 testes. Revisão realizada em 26/10/2026, sem alterações no perfil.

| Prioridade | Problema reproduzido | Evidência / impacto | Correção de baixo risco proposta |
| --- | --- | --- | --- |
| P1 | Painel de instruções ultrapassa o cenário em larguras intermediárias | Em 900 px, card termina em y=685,47 e viewport em y=663: sobreposição de 22,47 px. O limite/scroll só existia abaixo de 640 px | Aplicar limite de altura e scroll em todas as larguras |
| P2 | Repetição de Espaço produz salto após pausa, sem soltar a tecla | Após pousar, um keydown com repeat=true mudou floor de 0 para null e vy para -235 px/s | Ignorar repetição de teclado para salto; preservar movimento contínuo e ativação nativa de botões |
| P2 | Dano não tem mensagem visual e checkpoint não é anunciado | `#announcer` era sr-only; subir à primeira plataforma produziu checkpoint=1, eventId=0, lastEvent=null | Exibir feedback HTML discreto e informar checkpoint, retorno e proteção sem mudar as regras |
| P2 | Menu inicial não ensina controles nem condição de vitória | Captura móvel mostra somente apresentação do personagem; instruções/objetivo exigem outro botão ou rolagem externa | Trocar a frase de apresentação por objetivo e controles compactos |

Não foi observada falha que justificasse refazer o motor, a arte ou os menus.
O robô, barris, paleta e composição industrial permanecem como base aprovada.

## Física e dificuldade: diagnóstico, não teste de usabilidade humana

Simulação permanece a 120 Hz, velocidade 170 px/s, gravidade 1.000 px/s²,
impulso 285 px/s, escalada 104 px/s, barris 84 px/s e intervalo 3,1 s.
Foram medidos 125 ms para alcançar a velocidade máxima e 125 ms para parar,
com 9,625 px de deslocamento após soltar a direção. O salto tem cerca de
40 px de altura e 0,56 s de voo, com buffer de 120 ms e tolerância de borda
de 90 ms. Esses valores não foram retunados.

Em ensaio isolado no centro de cada um dos cinco pisos, saltos em movimento
contra um barril aproximando-se tiveram sucesso nas distâncias de 45–95 px
amostradas de 5 em 5 px. Esse intervalo não descreve todos os encontros
possíveis: velocidade anterior, declive, barril em queda e proximidade de
escadas alteram o resultado. A colisão varrida conservadora foi preservada.

O piloto reativo existente, sem trajetória de saltos memorizada, venceu com
amostragens de 8,3/50/100/150/200/250 ms e uma ou duas vidas restantes. Ele
conhece as escadas e usa dados do modelo para reagir a barris próximos;
não representa tempo de reação humano nem prova facilidade para iniciantes.

Também foram sondadas saídas de escada em diferentes alturas: não houve
coordenada inválida ou vínculo persistente à escada após saltar. Esses
ensaios incluem caminhar para fora de bordas e perdas de vida esperadas;
não certificam ausência de todo cenário de bloqueio.

Dados brutos anteriores às alterações:
[layout](evidence/v1.1/before/observations.json),
[teclado](evidence/v1.1/before/input.json),
[física](evidence/v1.1/before/physics.json).

## Escopo autorizado da candidata

Correções locais de controles, contenção dos painéis e feedback/onboarding.
Nenhuma alteração em geometria, hitboxes, velocidade, gravidade, salto,
vidas, proteção, checkpoints, pontuação, ordem de atualização ou passo fixo.
Sem novas dependências, recursos comerciais, licença aplicada, merge ou deploy.

## Propostas que dependem de aprovação

- Sessões curtas com iniciantes reais, observando a primeira tentativa sem
  explicar a rota. Medir entendimento do objetivo, danos nas saídas das
  escadas e tentativas até vitória antes de alterar dificuldade.
- Somente se essas sessões indicarem necessidade: janela de salto mais
  tolerante, aviso de barris em queda, ajuste de câmera ou treino inicial.
  São mudanças de mecânica/experiência que não entram automaticamente aqui.
- Áudio, novos sprites, partículas, novos níveis, minimapa e redesign dos
  controles permanecem fora da V1.1 de baixo risco.
- Confirmar licenciamento separadamente; ver [LICENSING.md](LICENSING.md).

## Validação e comparação visual

A implementação conserva `src/core/` e `src/render/` byte a byte em relação
à base da revisão. A correção de Espaço fica no adaptador DOM; notificações e
orientação ficam na apresentação. O painel tem altura limitada em todas as
larguras. A partir de 641 px, somente o texto rola e o botão Voltar permanece
visível; em telas menores, o card inteiro pode rolar para acomodar o conteúdo.

| Caso | Antes | Candidata |
| --- | --- | --- |
| Menu móvel / 390 px | [Captura](evidence/v1.1/before/menu-390.png) | [Captura](evidence/v1.1/after/visual/menu-390.png) |
| Instruções / 900 px | [Captura](evidence/v1.1/before/instructions-900.png) | [Captura](evidence/v1.1/after/visual/instructions-900.png) |
| Menu desktop / 1.440 px | [Captura](evidence/v1.1/before/menu-1440.png) | [Captura](evidence/v1.1/after/visual/menu-1440.png) |
| Checkpoint visível | Mensagem ausente | [Captura](evidence/v1.1/after/chrome/13-checkpoint-feedback.png) |
| Dano e retorno visíveis | Mensagem oculta (`sr-only`) | [Captura](evidence/v1.1/after/chrome/14-damage-feedback.png) |
| Vitória | Fluxo já existente | [Captura](evidence/v1.1/after/chrome/09-victory.png) |
| Salto por toque emulado | Fluxo já existente | [Captura](evidence/v1.1/after/chrome/11-mobile-touch-jump.png) |

Os links de capturas representam execuções reais da versão correspondente,
sem editar pixels ou injetar posições/vidas na partida. Cenas em movimento
não são frames idênticos; os menus comparados usam as mesmas larguras. Os
ensaios isolados de física usam fixtures explicitamente descritas acima.

### Efetivamente testado

- Build TypeScript strict e os 25 testes existentes, todos aprovados após
  as alterações de apresentação/controles. Nenhum novo teste unitário foi
  adicionado para espelhar regras que não mudaram.
- Regressões de navegador para os problemas concretos: instruções contidas,
  retorno acessível, menu com objetivo/controles, mensagem de dano e os
  quatro checkpoints, repetição de Espaço após pausa e novo salto ao soltar
  e pressionar novamente. Ativação nativa de botão por Espaço preservada.
- Missões completas via teclado nos dois motores, barris ativos, cinco cargas,
  vitória, três vidas, queda, Game Over, pausa, reinício e retorno das instruções.
- Evento `blur` simulado, limpeza de entradas e congelamento do modelo em pausa.
- Painéis em 320/390/641/720/801/900/1.100/1.440 px; largura da página em
  320/390/768/1.440 px, sem overflow horizontal.
- Chrome: toque emulado de dois dedos, cancelamento de ponteiro e mistura de
  teclado/toque, liberando uma origem enquanto a outra continua pressionada.
- Preferência de movimento reduzido emulada, câmera compacta e ausência de
  erros de JavaScript/console ou requisições externas nas execuções aprovadas.

As capturas foram abertas para inspeção visual. Placar e vidas continuam em
texto, as cargas têm progresso no HUD e a faixa contextual orienta a próxima
carga/saída. Não foram acrescentados ícones de vidas, partículas ou animações
de vitória: os indicadores e a pose próprios existentes foram suficientes
para esta correção pontual. Alterações cosméticas maiores continuam propostas.

### Não executado / aprovação pendente

- Safari e celular físico: não há ambiente compatível disponível.
- Leitor de tela real, zoom/escala de SO em hardware móvel, latência física
  de teclado/tela e troca de janela pelo sistema operacional não executados.
- Firefox recebeu viewport móvel, sem validação equivalente do multitoque.
- Nenhuma sessão com iniciante real foi realizada; dificuldade, percepção
  dos barris e diversão precisam da avaliação do autor e de usuários.
- Sem avaliação de versão Pages: hospedagem continua desativada. Sem merge,
  deploy, release ou nova licença. A versão é candidata, não aprovação final.

Resultados estruturados da rodada final:
[Chrome](evidence/v1.1/after/chrome/results.json) e
[Firefox](evidence/v1.1/after/firefox/results.json).

| Execução local final | Resultado |
| --- | --- |
| Compilação strict / suíte Node | 25 aprovados, zero falhas |
| Chrome 155.0.8059.85 | Vitória, 5 cargas, 2.550 pontos, 2 vidas, 28,700 s simulados, zero erros |
| Firefox 153.0 | Vitória, 5 cargas, 2.650 pontos, 1 vida, 32,308 s simulados, zero erros |
| Painel em 900 px | Card termina em y=643, dentro da viewport que termina em y=663; botão Voltar visível |
| Diff / arquitetura | `git diff --check` aprovado; nenhum diff em core, renderer ou workflow |

Diferenças de tempo/pontos/vidas dos replays decorrem do agendamento e das
capturas, incluindo quadros reais no Chrome; não são uma medição de ganho
de habilidade nem de redução de dificuldade. A simulação não foi retunada.

## Arquivos e entrega

- `src/browser/controls.ts`: ignorar apenas repetição de Espaço, preservando
  entradas normais e semântica de botões.
- `src/app.ts`: feedback de checkpoint/dano/objetivo e textos das instruções.
- `public/index.html` e `public/styles.css`: faixa contextual, contenção e
  scroll do conteúdo dos painéis; identificação da candidata.
- `tests/browser.mjs`: regressões dos problemas e preservação de teclado/toque.
- `package.json` e lockfile: versão `1.1.0-rc.1`; dependências inalteradas.
- `README.md`, `docs/VALIDATION.md`, este relatório e `docs/evidence/v1.1/`:
  instruções, resultados e comparações rastreáveis.

O PR #1 permanece Draft; as verificações remotas da candidata serão visíveis
em Checks após o push. Sem merge, deploy ou alteração de Pages. A aprovação
da V1.1 exige revisão de jogabilidade/visual do titular, e não é inferida a
partir dos testes automatizados.
