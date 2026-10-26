# Licenças e escopos — Barrel Quest 1.1.0

Copyright (c) 2026 PedroCostinha.

O titular aprovou MIT exclusivamente para o código original e direitos
reservados para arte e identidade. Este projeto tem escopos distintos;
o conjunto completo não é distribuído integralmente sob MIT.

## Código original: MIT

Texto integral: [LICENSE-CODE.txt](LICENSE-CODE.txt).

- `src/core/**`, `src/browser/**` e `src/app.ts`: simulação, controles e orquestração.
- `src/render/**`: algoritmos genéricos de desenho, câmera, tipos e adaptador
  de sprites. Os dados artísticos importados não integram a concessão MIT.
- `public/index.html`: estrutura funcional e acessível, antes da resolução
  dos placeholders de identidade. Os valores inseridos de `src/art/identity.ts`
  mantêm seus direitos reservados na saída HTML.
- `public/styles.css`: layout, responsividade e interação funcionais.
- `scripts/**`, `tests/**`, `.github/workflows/**`, configuração TypeScript,
  metadados de pacote e configuração técnica do projeto.

Os arquivos de código têm avisos SPDX MIT. O adaptador
`src/render/sprites.ts` apenas reexporta `src/art/ember7.ts`: MIT no adaptador
não relicencia os pixels e a paleta importados. O renderer interpreta os
dados de `src/art/scene.ts`; os algoritmos são MIT, a composição artística
e seus parâmetros permanecem reservados. Os hashes de regressão em
`tests/fixtures/` são dados técnicos de teste, sem uma cópia da arte.

## Arte, personagem e identidade: direitos reservados

Termos e inventário artístico: [ART-RIGHTS.txt](ART-RIGHTS.txt).
Identificador local: `LicenseRef-Arcade-Art-Reserved`.

| Fonte | Conteúdo reservado | Saída equivalente no build |
| --- | --- | --- |
| `src/art/ember7.ts` | Paleta e onze poses de Ember-7 | `art/ember7.js` |
| `src/art/scene.ts` | Dados da composição visual procedural | `art/scene.js` |
| `src/art/identity.ts` | Nomes e identidade | `art/identity.js` e valores incorporados a `index.html` |
| `public/theme.css` | Tema, cores, tipografia e marca gráfica | `theme.css` |
| `public/favicon.svg` | Favicon original | `favicon.svg` |
| `docs/evidence/**` | Capturas e evidências do jogo | Não distribuídas no build |

Os mesmos limites se aplicam à representação TypeScript, JavaScript,
CSS, HTML, SVG e às imagens produzidas. Alterar o formato não altera a licença.
Quem reutilizar o código MIT deverá substituir os recursos reservados ou
obter autorização específica. A reserva da arte não acrescenta restrições
à licença MIT do código, inclusive ao uso comercial do código coberto.

Documentação e textos de apresentação originais fora dos avisos de licença
permanecem reservados; a concessão MIT está limitada ao código acima.
Os avisos de licença podem ser copiados para cumprir suas condições e
acompanhar a distribuição autorizada. Não se aplica CC BY a nenhum recurso.

## Dependências e ferramentas

| Componente | Licença de origem | Distribuído com o jogo? |
| --- | --- | --- |
| TypeScript 7.0.2 e binários opcionais associados | Apache-2.0 | Não; ferramenta de build |
| Playwright e playwright-core 1.62.1 | Apache-2.0 | Não; ferramenta de QA |
| fsevents 2.3.2, opcional no lockfile | MIT | Não; dependência de desenvolvimento opcional |
| checkout, setup-node, configure-pages, upload-pages-artifact e deploy-pages | MIT; dependências internas mantêm seus termos | Não; somente infraestrutura CI/Pages |
| Chrome, Firefox e imagem Playwright do CI | Termos dos respectivos titulares | Não; somente QA |

O lockfile mantém versões, licenças declaradas e integridades. Não há
dependência de execução, backend, fonte remota, áudio externo ou serviço
autenticado incorporado ao jogo. Ferramentas não são relicenciadas por esta MIT.

No build estático, `LICENSE-CODE.txt`, `ART-RIGHTS.txt` e `LICENSING.txt`
acompanham os módulos e assets. O link no crédito do rodapé abre o mapa de
escopos sem alterar o desenho aprovado. A escolha de licença não autoriza
merge, publicação, deploy, tag ou release.
