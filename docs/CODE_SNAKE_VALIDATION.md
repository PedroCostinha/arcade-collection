# Revisão local — Code Snake, 27/10/2026

Branch local: `feat/code-snake-playable`, base `ffc56b1b312bf91889999902398ebe2fa9b74bee`. Nenhum push, merge, deploy ou release. Versão do Barrel e tag v1.1.0 preservadas.

## Resultado executado

- Node 24.19.0 neste ambiente; TypeScript strict compilou ambos os builds. O perfil foi validado com Python 3.12.14.
- `npm test`: 29/29, incluindo missão completa com barris ativos e comparação de 32 sequências de desenho e hashes da arte aprovada.
- `npm run test:snake`: 6/6. Crescimento e +10 exatos, filas e reversões, pausa/retomada/reset, colisão com corpo/parede/cauda, tabuleiro cheio, RNG nos extremos, grafo de assets no subcaminho, escopos emitidos e exclusão do protótipo do build estável.
- `npm run test:snake:browser`: aprovado em Chrome 155.0.8059.85 e Firefox 153.0. Eventos reais de teclado no DOM, ativação por Espaço no botão, foco no Canvas, primeira coleta, curvas, pausa com pixels estáveis, pausa por blur, Game Over na parede, reinício, toque emulado, movimento reduzido e larguras 320/390/768/1280 sem overflow. A home volta à raiz estável. Sem erros de página ou requests externos no percurso observado.
- `npm run test:browser` do Barrel em Chrome: aprovado, missão completa com cinco cargas, vitória, 2550 pontos e duas vidas, controles e pausa, multitoque emulado e layouts até 1440 px. Evidência nova em `test-results/barrel-regression/chrome/`, sem sobrescrever capturas históricas.
- `git diff --check`: sem problemas de whitespace. Verificação de integridade em [integrity.json](evidence/code-snake/integrity.json).

Capturas e resultados novos: [Chrome](evidence/code-snake/chrome/results.json), [Firefox](evidence/code-snake/firefox/results.json), [desktop](evidence/code-snake/chrome/03-desktop-playing.png), [celular emulado](evidence/code-snake/chrome/04-mobile-reduced.png), [mockup da home](evidence/code-snake/chrome/05-collection.png).

## Proteção da versão estável

`src/**`, `public/**`, testes existentes, tsconfig, scripts estáveis, lockfile, workflows e licenças do Barrel não foram editados. Somente README, novos scripts npm e exclusão de prototype-dist foram acrescentados à infraestrutura atual. O build de revisão copia os arquivos estáveis, byte a byte, para sua raiz e acrescenta as duas rotas independentes. `dist/` continua sem Code Snake ou home. Nenhum workflow novo; gate manual existente permanece intacto.

## Ajustes encontrados durante a QA

O compilador descartou o cabeçalho legal preso a um type export; o build de revisão agora verifica a fonte e preserva os avisos emitidos. Pausar agora consolida posições anteriores, evitando que a interpolação retorne um passo ao continuar. Os testes de navegador aguardam atualização de media query e inicialização dos módulos; relógio de QA é pausado em instante futuro relativo, permitindo o startup mais lento do Firefox.

## Limites e riscos para lançamento

Sem teste em Safari, celular físico, leitor de tela, sessão prolongada ou usuários iniciantes. O toque é emulado. QA funcional não avalia dificuldade humana. O mockup da coleção é estático e deliberadamente local; ainda não há catálogo reutilizável implementado nem alias público do Barrel. A animação do perfil usa CSS dentro de img, validada localmente; renderização e cache no GitHub real continuam pendentes, pois a branch não foi enviada.

O modelo usa velocidade fixa e placa 24×16; itens posteriores são aleatórios, sem recorde persistido, áudio ou backend. Esses limites tornam o protótipo revisável e não representam promessa de features da versão final. Revisar rosto, escala dos segmentos, ritmo, densidade da grade e controles no celular antes de aprovar integração.

## Reprodução

Executar `npm ci`, `npm run test:snake`, `npm run test:snake:browser` e, com Firefox instalado, definir `ARCADE_BROWSER=firefox` e repetir somente a QA de navegador. `npm run start:prototypes` serve a revisão em localhost:4175. Para atualizar evidências de revisão, usar `SNAKE_EVIDENCE_DIR`; testes não mudam os arquivos históricos. Build padrão: `npm test`. Não enviar prototype-dist ao Pages.
