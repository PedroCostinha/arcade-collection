# ARCADE COLLECTION 1.3.0 — preparação técnica

29/10/2026. Branch `prep/collection-1.3.0`, criada da main aprovada
`f22f2069b2394cad8ff08638eb30a9e78e36f4ac`. Autoria PedroCostinha
(`208268275+PedroCostinha@users.noreply.github.com`).
Esta candidata aguarda revisão; a versão pública continua na coleção 1.2.0.

## Artefato e preservação

`npm run build` prepara **32 arquivos** em `dist/`: os **28 arquivos
históricos intactos** e exatamente quatro adições em `collection/`.
A raiz continua Barrel Quest; seus 21 arquivos permanecem em 1.1.0.
Os sete arquivos do Code Snake, inclusive HTML e rótulo **COLEÇÃO 1.2.0**,
continuam aprovados e preservados. A versão **1.3.0** pertence ao pacote,
lockfile e menu da coleção; não cria uma versão individual nova dos jogos.

O [manifesto histórico](../tests/fixtures/collection-1.2.0-manifest.json)
é o mesmo blob Git da main. Seus hashes não foram atualizados.
O [relatório de integridade](evidence/collection-1.3.0-candidate/integrity.json)
contém os 32 caminhos, tamanhos, SHA-256 reais, SHA-256 LF e a correspondência
individual dos 28 arquivos com as duas representações previamente aprovadas.
Windows e Linux podem diferir somente entre esses hashes CRLF/LF já fixados.
A reprodução de dois builds no mesmo ambiente exige igualdade byte a byte.

Os quatro hashes novos são fixados em um
[manifesto separado do menu](../tests/fixtures/collection-1.3.0-menu-manifest.json).
Nenhum comando de build/testes regenera os manifestos.
O guardião rejeita extras, exclusões, links simbólicos e alterações de hashes.
Os testes adulteram e removem cada um dos 32 arquivos públicos e os 28
históricos da revisão: **60 alterações e 60 exclusões rejeitadas**, além de
seis extras em posições diferentes. Builds limpos removem saídas obsoletas.

## Promoção do menu aprovado

Os fontes aprovados em `prototypes/collection/` permanecem inalterados.
`scripts/build-collection.mjs` produz o HTML público com mudanças limitadas:

- Remove a meta `robots` com `noindex, nofollow`.
- Retira “Estudo local” do título.
- Substitui “PRÉVIA LOCAL” por “COLEÇÃO 1.3.0”.
- Substitui o rodapé de estudo/em revisão por “ARCADE COLLECTION · 1.3.0”.
- Renomeia `review-badge` para `collection-badge` no HTML/CSS; todas as regras
  visuais permanecem iguais, sem marcadores de revisão na saída pública.

Os links aprovados são `../` e `../code-snake/`, funcionando tanto em
`/collection/` quanto em `/arcade-collection/collection/`. Não há roteador,
JavaScript, framework, fonte remota ou nova dependência de runtime no menu.
Os retratos são codificados dos pixels originais de Ember-7 e Nib; o teste
PNG verifica todas as cores e transparências contra as artes aprovadas.

`prototype-dist/` mantém a revisão histórica de 33 arquivos e seu
`REVIEW-ONLY.txt`; não é o artefato de produção. As cópias dos 28 arquivos
históricos coincidem byte a byte nos dois builds. O aviso, fontes, testes,
evidências e outros recursos internos não pertencem ao inventário de `dist/`.

## Validação local

Windows, Node **24.19.0**, TypeScript **7.0.2**, Playwright **1.62.1**.
Executar sequencialmente, porque os testes de integridade recompilam o build:

```sh
npm test
npm run test:snake
npm run test:artifact
npm run test:collection
npm run test:browser
npm run test:snake:browser
npm run test:collection:browser
```

| Suíte | Resultado |
| --- | --- |
| Barrel (`npm test`) | 29/29 |
| Snake | 6/6 |
| Produção | 8/8 |
| Menu/integridade | 6/6 |
| Inventário e hashes | 32 arquivos, 28 históricos preservados |
| Reprodução | Dois builds limpos com mesmos bytes e remoção de saídas obsoletas |

A suíte de produção também executa o guardião de publicação em processos
locais com ambiente simulado: aceita os requisitos corretos e rejeita evento,
branch/tag, identidade, repositório, confirmação e SHA inválidos/incompletos.
Isso não dispara o workflow ou realiza qualquer publicação.

O único ajuste no teste do Snake é a expectativa de rota: o menu público
agora responde 200; `REVIEW-ONLY.txt` continua 404. Mecânicas, conteúdo público
e artes dos jogos permanecem inalterados. A comparação do lockfile histórico
permite apenas os dois campos de versão da coleção; dependências e integridades
continuam idênticas, sem enfraquecer a verificação do grafo de dependências.

## Navegadores e capturas

Chrome **156.0.8078.48** e Firefox **153.0**, modo headless, servindo **dist/**.
Cada navegador cobre **40 combinações** do menu: 320/390/768/1024/1440 px ×
duas bases de URL × JavaScript ligado/desligado × movimento reduzido
ligado/desligado. Inclui títulos semânticos, idioma, retratos/textos alternativos,
contraste de texto >=4,5:1, salto/Tab/foco/Enter, destinos por mouse e toque
emulado, alvos >=44 px e ausência de overflow, erros e pedidos externos.
O menu funciona sem JavaScript; partidas dos jogos mantêm seu requisito de JS.

| Navegador | Desktop | Celular | Matriz |
| --- | --- | --- | --- |
| Chrome | [1440 px](evidence/collection-1.3.0-candidate/chrome/menu-1440.png) | [390 px](evidence/collection-1.3.0-candidate/chrome/menu-390.png) | [JSON](evidence/collection-1.3.0-candidate/chrome/results.json) |
| Firefox | [1440 px](evidence/collection-1.3.0-candidate/firefox/menu-1440.png) | [390 px](evidence/collection-1.3.0-candidate/firefox/menu-390.png) | [JSON](evidence/collection-1.3.0-candidate/firefox/results.json) |

As capturas desktop/celular foram inspecionadas visualmente.
Uma repetição local no Firefox registrou um favicon cancelado durante troca
rápida de rotas. O runner agora aguarda a rede ociosa nas navegações, sem
ignorar falhas de requisição; as matrizes foram repetidas com esse ajuste.
As QAs dos jogos também servem `dist/`: missão completa do Barrel, instruções,
pausa, retomada, dano, checkpoints, vitória, teclado e controles móveis;
Snake cobre coleta, curvas, colisões, pausa, reinício, toque e links legais.
Relatórios: [Chrome](evidence/collection-1.3.0-candidate/production/chrome/) e
[Firefox](evidence/collection-1.3.0-candidate/production/firefox/).

## CI e publicação futura

O CI do PR inclui **seis jobs**: suítes Barrel/Snake/produção/menu em
Node **22 e 24**, mais jogos e matriz do menu em **Chrome/Firefox × Node 22/24**.
Checkout com histórico no job de integridade permite resolver os blobs antigos
em um runner limpo. As evidências dos quatro jobs de navegador são anexadas
por 14 dias, em `test-results/`. Consultar os checks do Draft PR para o estado
remoto do SHA final; a configuração, sozinha, não prova aprovação do CI.

Pages muda somente a identificação da candidata para 1.3.0, o teste do menu
e o histórico necessário a esse teste. Permanecem: `workflow_dispatch` único,
confirmação explícita padrão false, titular PedroCostinha, main, SHA completo
igual ao commit executado, permissões mínimas, configuração Pages sem habilitação
automática e upload exclusivo de `dist/`. **O workflow Pages não foi executado.**

Esta etapa não faz merge, deploy, tag ou Release. A publicação 1.3.0 exige
aprovação posterior do titular e será uma etapa independente.

## Limitações

- Node 22 é verificado no CI remoto; a execução local usa Node 24.
- Navegadores headless e toque emulado; sem hardware móvel físico, Safari ou
  leitor de tela real. Os testes não equivalem a uma auditoria WCAG completa.
- Builds reproduzíveis são comparados byte a byte no mesmo ambiente; entre
  Windows/Linux só são aceitas as representações CRLF/LF já fixadas.
- Sem publicação, esta etapa não valida cache, headers ou disponibilidade do
  futuro menu no ambiente hospedado.

## Arquivos modificados

- `package.json`, `package-lock.json`: versão 1.3.0 e comandos da QA do menu.
- `scripts/build.mjs`, `build-collection.mjs`, `build-prototypes.mjs`,
  `verify-collection.mjs`, `verify-publication.mjs`: promoção e proteção do artefato.
- `tests/static.test.mjs`, `tests/production/artifact.test.mjs`,
  `tests/collection/integrity.test.mjs`, `tests/collection/browser.mjs`,
  `games/code-snake/tests/core.test.mjs`: expectativas, matriz pública e integridade.
- `tests/fixtures/collection-1.3.0-menu-manifest.json`: somente as quatro adições.
- `.github/workflows/ci.yml`, `.github/workflows/pages.yml`: QA remota e candidata.
- `README.md`, `CHANGELOG.md`, este documento e evidências em
  `docs/evidence/collection-1.3.0-candidate/`.

Sem alterações no manifesto histórico, fontes/HTML/CSS/arte dos jogos,
fontes aprovados do menu, animações ou perfil GitHub.
