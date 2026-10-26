# Recomendação de licenciamento / decisão pendente

O titular autorizou a criação do repositório público, mas não escolheu uma
licença. **Este documento é uma recomendação, não uma concessão de licença.**
Não foi adicionado um `LICENSE` genérico nem um campo `license` no pacote.
`private: true` no package.json evita publicação acidental no npm; não define
a visibilidade ou licença do repositório GitHub.

## Proposta para decisão do titular

| Material | Origem / escopo | Recomendação, ainda não aplicada |
| --- | --- | --- |
| Motor, controles, renderer, scripts, testes, HTML e CSS | Código escrito para este projeto | MIT, para permitir reutilização com preservação do aviso de copyright e licença |
| Dados dos onze sprites Ember-7 e paleta em `src/render/sprites.ts` | Arte própria exportada do perfil, revisão `24d458b` | CC BY 4.0, com atribuição a PedroCostinha e indicação de alterações |
| Favicon próprio e capturas em `docs/evidence/` | Desenho e renderizações próprios | CC BY 4.0, separadamente do código que os produz |
| Textos de documentação | Escritos para este projeto | CC BY 4.0, se o titular desejar o mesmo regime dos materiais de apresentação |
| Dependências e Actions | Projetos externos | Mantêm suas próprias licenças; não recebem automaticamente a licença do jogo |

A [MIT](https://choosealicense.com/licenses/mit/) é uma opção permissiva para
código e requer preservar seus avisos. A
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) permite compartilhar
e adaptar materiais, inclusive comercialmente, exigindo crédito, referência
à licença e indicação de modificações. Cabe ao titular confirmar se deseja
permitir esses usos da arte antes de adotá-la.

Se aprovadas, as licenças deverão ter escopos explícitos: um arquivo para
código, outro para arte/documentação e avisos por caminho. Em `sprites.ts`,
a grade/paleta visual e qualquer código auxiliar precisam ser distinguidos.
Não aplicar automaticamente uma licença de código a todos os pixels ou vice-versa.
Os nomes Barrel Quest, Ember-7 e a identidade do perfil precisam de orientação
própria de uso de marca; uma licença de copyright não é um endosso do titular.

## Recursos externos

Não há sprites, personagens, sons ou código do projeto Pac-Man incorporados.
Os detalhes de autoria estão em [PROVENANCE.md](PROVENANCE.md). Uma inspiração
de mecânica não concede autorização para copiar personagens, marcas ou arte
de franquias comerciais.

TypeScript e Playwright 1.62.1 são ferramentas de desenvolvimento sob
Apache-2.0 conforme os pacotes instalados; o pacote opcional fsevents declara
MIT. O lockfile registra cada dependência e sua integridade. Navegadores
usados para QA e a imagem oficial Playwright do CI têm licenças próprias e
não são redistribuídos no jogo.
Actions e ferramentas não são enviadas no `dist/`. Qualquer futuro asset ou
dependência deve entrar no inventário com sua origem e licença específica.

Antes de anunciar o projeto como open source ou adicionar selos de licença,
obter a escolha explícita do titular e aplicar os textos corretos. A
publicação pública autorizada nesta etapa permite revisão do código, sem
inventar uma licença abrangente para terceiros.
