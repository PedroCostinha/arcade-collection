# Code Snake — licenças e direitos de Nib

Copyright (c) 2026 PedroCostinha.

Esta distribuição tem escopos distintos; o conjunto não é integralmente MIT.
O aviso acompanha Code Snake em code-snake/LICENSING.txt. O mapa do Barrel
Quest 1.1.0 permanece separado em ../LICENSING.txt na distribuição.

## Código original: MIT

src/core.ts, src/render.ts e src/app.ts, a estrutura funcional de
public/index.html, scripts de build/servidor e testes são MIT. O texto MIT
integral acompanha o artefato em ../LICENSE-CODE.txt, acessível também pelo
rodapé do jogo. No repositório, consulte ../../LICENSE-CODE.txt.

Os módulos distribuídos modules/core.js, modules/render.js e modules/app.js
conservam os avisos SPDX MIT. A MIT dos algoritmos não concede licença sobre
os recursos artísticos importados pelo renderer.

## Nib, arte e identidade: direitos reservados

SPDX-License-Identifier: LicenseRef-Arcade-Art-Reserved

Todos os direitos sobre src/art.ts, sprite Nib, paleta, identidade, composição
visual, public/style.css e capturas são reservados a PedroCostinha. Esses
recursos permanecem reservados quando transpilados para modules/art.js,
incorporados ao HTML/CSS, desenhados no Canvas ou reproduzidos em imagens.
O código MIT não relicencia Nib ou a arte.

O carregamento e a execução normais no navegador para jogar na distribuição
oficial autorizada pelo titular são permitidos. Reutilização separada,
modificação, redistribuição ou exploração da arte exigem autorização do
titular, ressalvados os direitos previstos em lei. Não se afirma registro
de marca. As restrições artísticas não acrescentam restrições ao código MIT.

Nib é criação original deste projeto: sprite 12×12 desenhado em matriz
textual, sem atlas, biblioteca de jogo ou personagens de terceiros. A grade
é decorativa e não usa dados reais de contribuições. Pontos são da partida.

## Ferramentas

Canvas e APIs DOM são nativos do navegador. TypeScript 7.0.2 e Playwright
1.62.1 são ferramentas de desenvolvimento sob Apache-2.0, não distribuídas
com o jogo; suas dependências conservam os termos do lockfile. Não há
dependências de execução, backend, telemetria ou fontes remotas.

Este aviso não autoriza merge, deploy, tag ou Release e não altera o escopo
ou o conteúdo da Release Barrel Quest 1.1.0.
