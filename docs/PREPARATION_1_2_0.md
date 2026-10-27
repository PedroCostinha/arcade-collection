# ARCADE COLLECTION 1.2.0 — preparação técnica

Estado: candidata para revisão; sem autorização de merge ou publicação.
Base aprovada: `42349ce5e112fff3d2fcedd69e29a7d7b6bfc164`.
Branch: `feat/arcade-collection-1.2.0`. Versão do pacote/coleção: 1.2.0;
Barrel Quest conserva sua versão individual 1.1.0. Não criar tag ou Release.

## Estratégia definida antes da implementação

1. Preservar integralmente `src/`, `public/`, física, entradas, pontuação,
   sprites e renderer do Barrel. Manter o algoritmo do build estável em
   `scripts/build-barrel.mjs`; o build da coleção o executa antes de adicionar
   Snake. Não acrescentar navegação ou modificar o HTML raiz nesta etapa.
2. Fixar os hashes dos 21 arquivos do build 1.1.0, capturados da main aprovada
   antes da implementação. Comparar conteúdo com normalização exclusiva de
   CRLF para LF, necessária entre Windows e Linux. Todos os 21 arquivos,
   incluindo avisos legais e rótulo V1.1.0, devem coincidir; nenhuma exceção
   de conteúdo está prevista. Não regenerar o fixture para aceitar diferenças.
3. Promover `prototypes/code-snake/` para `games/code-snake/`, mantendo modelo,
   adaptadores de entrada, renderer, arte, ritmo e regras. Adaptar somente
   apresentação de distribuição, links e configuração de saída. Copiar apenas
   HTML, CSS, quatro módulos JS e o aviso próprio de licenciamento do Snake.
4. `dist/` terá Barrel na raiz e Snake em `code-snake/`. A MIT integral
   existente na raiz continua acessível; Nib e o tema continuam reservados,
   com aviso próprio em `code-snake/LICENSING.txt`. Os três avisos existentes
   do Barrel permanecem inalterados. Não copiar fontes TS, testes, documentos
   internos, evidências, ferramentas ou o mockup da home.
5. Manter `build:prototypes` apenas para desenvolvimento: copiar o build da
   coleção e acrescentar o estudo `/collection/` em `prototype-dist/`.
   Essa saída nunca é usada pelo Pages ou pela QA de produção.
6. Atualizar os testes e o CI para servir `dist/` nos subcaminhos reais,
   executar as duas suítes e QAs, verificar licenças, inventário fechado,
   ausência de requests inesperados e reprodução de dois builds limpos.
   Node 22/24 e Chrome/Firefox devem exercitar o mesmo artefato publicável.
7. Preparar o workflow Pages para a futura coleção 1.2.0, mantendo somente
   `workflow_dispatch`, confirmação booleana, repositório e branch main
   exatos, igualdade do SHA completo, permissões mínimas e upload exclusivo
   de `dist/`. Não disparar o workflow nem habilitar publicação automática.

## Revisão e evidências

Os [resultados executados e capturas](VALIDATION_1_2_0.md) e o
[inventário fechado](DIST_1_2_0.md) registram a implementação. O site público
deve continuar servindo exclusivamente Barrel
Quest 1.1.0 no SHA `ffc56b1b312bf91889999902398ebe2fa9b74bee`, com a mesma
tag/Release e o mesmo deployment. A promoção do pacote não concede aprovação
para merge, deploy ou Release.
