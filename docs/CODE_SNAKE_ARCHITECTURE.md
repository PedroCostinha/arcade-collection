# Code Snake — auditoria e proposta, 27/10/2026

Estado: protótipo local para revisão. Sem merge, push, deploy, tag ou release.

## Auditoria antes da implementação

Base dos jogos: `ffc56b1b312bf91889999902398ebe2fa9b74bee` (`origin/main` e `v1.1.0`). A Release pública confirma esse SHA. Consulta HTTP ao Pages em 27/10 respondeu 200 e encontrou V1.1.0. Perfil: `bceb8e1a87ac1ddf3c04d8cc816a0f17a5449868`.

O Barrel Quest tem simulação pura em `src/core`, controles DOM em `src/browser`, Canvas em `src/render`, dados artísticos reservados em `src/art` e orquestração em `src/app.ts`. O relógio usa passo fixo de 120 Hz. O build TypeScript strict emite módulos ES, resolve identidade no HTML e copia somente assets autorizados para `dist`. O servidor suporta `/arcade-collection/`, sem fallback SPA. Os testes cobrem física, entrada, missão completa, 32 sequências de desenho de referência, hashes de sprites, licenças e grafo de módulos no subcaminho; QA Playwright adicional usa Chrome/Firefox.

O README está desatualizado: diz “merge e publicação pendentes”, “Pages desativado”, manda trocar para uma branch antiga e descreve aprovação de uma etapa encerrada. A correção nesta branch deve registrar a versão pública atual e distinguir o protótipo local. Não reescrever documentação histórica da release.

CI: push restrito a main/branch antiga e PR para main, Node 22/24 e Firefox. Pages aceita somente workflow_dispatch na main, booleano de aprovação e SHA completo. Não mudar workflows, permissões, versão do pacote ou lockfile. Nenhum evento automático novo.

Licenciamento existente separa código MIT e arte/identidade reservadas; não há dependências de execução. Novos algoritmos seguirão MIT; sprites, paleta e composição ficarão em arquivos reservados próprios, com inventário adicional. Não incorporar código, referências gráficas ou personagens de franquias.

No perfil, `generate_code_quest.py` faz a única consulta GraphQL e grava `assets/code-quest/calendar.json`. `code_quest/data.py` valida login, origem, datas consecutivas, níveis, somas e semanas. CODE QUEST V2 usa data/motion/sprites/scene. `generate_arcade.py` lê o mesmo JSON offline e usa arcade/barrel/sprites/scene. O workflow diário existente (08:17 UTC) gera CODE QUEST, depois Barrel, valida e commita somente sua allowlist. Não criar outro cron, token, fetch ou cópia do calendário.

## Arquitetura incremental

Manter `src/**`, `public/**`, build padrão e rota raiz do Barrel inalterados. Criar `prototypes/code-snake/src/{core,render,art,app}.ts`, HTML/CSS próprios e tsconfig próprio. Um script separado gera `prototype-dist/`: cópia do build estável na raiz, Code Snake em `/code-snake/`. O deploy existente continua enviando exclusivamente `dist/`, que não contém o protótipo. Essa separação protege inclusive contra publicação acidental ao executar o workflow atual.

Modelo puro: estado menu/playing/paused/over/won, fila limitada de curvas, passo discreto da grade, RNG injetável, colisões, crescimento, pontuação e geração de item em célula livre. Renderizador interpola posições entre passos sem alterar colisões. Adaptador DOM controla foco, teclado, botões touch, pausa ao ocultar e preferência de movimento. Arte fica separada dos algoritmos.

Evolução após aprovação: catálogo declarativo de jogos com id, título, versão, entrada e disponibilidade; cada jogo conserva simulação, renderer e testes próprios. Compartilhar apenas contratos de lifecycle (mount/dispose), shell e utilitários comprovadamente comuns. Não extrair motor de física de plataforma para a cobrinha.

## Direção visual e experiência

Personagem original **Nib**, uma cobrinha robótica vermelha com visor claro dividido, antena curta, focinho quadrado e módulos de corpo em grafite/vermelho. Sprite de 12×12 pixels desenhado nesta implementação, sem atlas de terceiros. Itens: pequenos núcleos de dados em losango com suporte pixelado. Fundo preto #0d0d0f, painéis grafite, vermelhos contidos, textos marfim; nenhum efeito de flash ou tremor.

Playable: grade 24×16, bordas sólidas, um núcleo por vez, +10 pontos por coleta, crescimento de um segmento, velocidade fixa inicial de 150 ms/célula. Setas/WASD, D-pad de toque, pausa e reinício em HTML. A pontuação pertence somente à partida e não representa commits. Sem consulta ao calendário no jogo. Movimento suave por interpolação; reduzir efeitos remove interpolação cosmética, preservando o passo necessário ao jogo. Game Over exige reinício explícito, evitando surpresa ao jogador.

Demo SVG: loop de 18 s, rota determinística sobre um recorte recente do calendário, núcleos em dias com atividade, crescimento gradual, contador de contribuições amostradas sem multiplicação, breve conclusão e fade apenas na camada móvel antes do reset. O calendário completo, datas e contagens originais permanecem no SVG, incluindo dias zerados. Rotular claramente o recorte e o total anual. Snapshot zerado continua válido e não inventa coletas. Versões desktop/mobile e estáticas; `picture` prioriza movimento reduzido. Sem JS, fontes ou recursos externos.

## Três planos independentes

1. **Perfil demonstrativo:** novo pacote `scripts/code_snake`, gerador offline, testes de dados/movimento/XML/determinismo/segurança e SVGs em `assets/code-snake`. Vitrine compacta mostra Barrel e Code Snake abertos, lado a lado em tabela Markdown; detalhes técnicos ficam recolhidos. CODE QUEST continua exatamente igual. Sem link para jogar Code Snake. Só após aprovação integrar geração/check/allowlist no workflow já existente, depois de salvar o JSON.
2. **Pages jogável:** validar modelo, controles reais, desktop/mobile, pausa, colisão, crescimento, reinício, licenças e requests locais. Rever aparência com usuário; depois testar hardware real e Safari. Somente mediante aprovação integrar uma rota física `/code-snake/` ao build publicável, atualizar gate manual e validar a URL publicada antes de inserir link no perfil.
3. **Home da coleção:** primeiro em `/collection/` para não retirar Barrel da raiz. Catálogo só mostra “Jogar” para jogos publicados e validados. Futuro alias `/barrel-quest/` pode coexistir com a raiz, sem redirects compulsórios. Home na raiz requer decisão posterior e garantia de compatibilidade com o endereço antigo. Nesta etapa haverá apenas mockup local em `/collection/` no build de revisão.

## Riscos e critérios

SVG em img tem restrições e cache do GitHub: testar CSS em img localmente e posteriormente revisar render real na branch antes da integração. Texto de um calendário anual é pequeno no celular; usar versão móvel com recorte maior e calendário completo como contexto, com alt e link estático. Snapshot não é consulta em tempo real. Não confundir núcleos do jogo com contribuições. Interpolação nunca deve atravessar parede antes da colisão. Enfileirar direções deve impedir reversão e preservar taps rápidos. Seed/RNG não deve produzir item dentro do corpo, inclusive com tabuleiro cheio.

Testes não equivalem a aprovação visual. Safari, celular físico, leitor de tela e sessão longa permanecem gates de lançamento. A branch local não dispara CI remoto; registrar evidência local e os limites em `CODE_SNAKE_VALIDATION.md`.
