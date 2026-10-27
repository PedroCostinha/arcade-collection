# Changelog

## 1.2.0 — candidata em preparação, 27/10/2026

Sem merge, publicação, tag ou Release. O site e a Release estáveis continuam
em Barrel Quest 1.1.0.

- Coleção com duas rotas de produção: Barrel Quest 1.1.0 na raiz e Code Snake
  em /code-snake/, com módulos relativos e avisos legais próprios de Nib.
- Modelo, controles, ritmo, pontuação, renderer e arte dos dois jogos preservados.
- Build original do Barrel isolado sem mudança de algoritmo; comparação de
  conteúdo dos 21 arquivos anteriores, mais sete arquivos exclusivos do Snake.
- Protótipo promovido para games/code-snake; estudo da home permanece somente
  em prototype-dist/collection e não acompanha o artefato publicável.
- QA e CI orientados a dist/, com Node 22/24 e Chrome/Firefox, allowlist de
  28 arquivos, verificação de licenças e builds reproduzíveis.
- Workflow manual preparado para futura aprovação da coleção 1.2.0, mantendo
  main, confirmação do titular, SHA completo e upload exclusivo de dist/.

## 1.1.0 — preparação em 26/10/2026

Versão de pacote preparada para a primeira publicação. Ainda sem merge,
site hospedado, tag ou GitHub Release; PR #1 permanece Draft.

- Promovidos package/lockfile e rótulos de interface de `1.1.0-rc.1` para `1.1.0`.
- MIT aplicada exclusivamente ao código original, com direitos reservados
  para Ember-7, sprites, arte e identidade, conforme aprovação do titular.
- Dados artísticos de sprites, composição do cenário e identidade separados
  dos algoritmos; CSS funcional separado do tema visual. Aparência preservada.
- Avisos de licença incluídos no build estático e acessíveis pelo crédito
  do rodapé; pacote privado com indicação explícita dos escopos.
- Build limpo e testes do inventário, subcaminho `/arcade-collection/` e
  preservação de 32 sequências do renderer; todas as poses/paleta verificadas.
- Workflow oficial Pages preparado para disparo manual futuro na `main`,
  com SHA aprovado, permissões mínimas e artefato limitado a `dist/`.
- Nenhuma mudança na física, geometria de colisão, mecânicas, pontos,
  controles ou recursos artísticos aprovados. Nenhum jogo novo.

## 1.1.0-rc.1 — revisão local em 26/10/2026

- Corrigida repetição de Espaço após pausa/continuação.
- Contidos os painéis de instruções em telas intermediárias.
- Acrescentado feedback HTML de objetivo, dano e checkpoint.
- Validada missão completa em Chrome/Firefox e CI Node 22/24 e Firefox.
- Histórico e limites da QA preservados em `docs/REVIEW_V1_1.md`.
