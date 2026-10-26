# Licenciamento aplicado em 1.1.0

Em 26/10/2026, o titular PedroCostinha aprovou explicitamente:

- MIT exclusivamente para o código original do projeto.
- Direitos reservados para Ember-7, sprites, arte, elementos visuais exclusivos
  e identidade do projeto.
- Separação dos dados artísticos, preservando aparência e comportamento.

A decisão está aplicada no [mapa normativo da raiz](../LICENSING.md), na
[MIT do código](../LICENSE-CODE.txt) e nos [direitos da arte](../ART-RIGHTS.txt).
A proposta anterior de CC BY não foi adotada. Não há licença MIT genérica
para o conjunto do jogo.

## Separação implementada

| Antes | Agora | Escopo |
| --- | --- | --- |
| Paleta e grades em `src/render/sprites.ts` | `src/art/ember7.ts`; o caminho antigo é um reexport técnico | Dados reservados; adaptador MIT |
| Composição artística embutida em `src/render/canvas.ts` | `src/art/scene.ts` com constantes tipadas | Dados reservados; algoritmos do renderer MIT |
| Nomes e identidade misturados à estrutura HTML/app | `src/art/identity.ts`, importado pela app e resolvido pelo build no HTML | Valores reservados; estrutura e orquestração MIT |
| Layout, cores e tipografia juntos em CSS | `public/styles.css` funcional e `public/theme.css` visual | Layout MIT; tema reservado |
| Favicon sem aviso no arquivo | Mesmo desenho, com aviso de direitos reservados | Reservado |

As grades e paleta permanecem idênticas à RC. Os tipos de arte em
`src/render/art-types.d.ts` são MIT e não geram módulo desnecessário no build.
O renderer não contém paletas ou composições exclusivas embutidas. A cena
artística é representada por dados; a simulação continua independente dela.

A declaração de pacote é `SEE LICENSE IN LICENSING.md`, também no lockfile,
com `private: true` preservado. Os avisos SPDX identificam os arquivos MIT
ou `LicenseRef-Arcade-Art-Reserved`, conforme o inventário.

## Distribuição e verificação

O build inclui `LICENSE-CODE.txt`, `ART-RIGHTS.txt` e `LICENSING.txt`.
O crédito no rodapé passou a ser um link para o mapa de escopos, com a mesma
aparência. Nenhum aviso modifica a MIT padrão para proibir uso comercial,
forks ou redistribuição do código coberto. Quem reutilizar o código deverá
substituir a arte reservada ou obter autorização específica para ela.

Os testes verificam o inventário do build, a íntegra dos avisos distribuídos,
os identificadores dos módulos artísticos e do adaptador, e o campo de
licença do pacote/lockfile. A preservação visual é verificada por hashes dos
sprites e das sequências do renderer, pixels do Canvas e estilos computados.
Veja [PREPARATION_1_1_0.md](PREPARATION_1_1_0.md).

A autorização de licenciamento e commit/push não autoriza merge, habilitar
Pages, publicar, fazer deploy, criar tag ou release. O repositório do perfil
e o CODE QUEST V2 não foram alterados. A origem dos recursos permanece
registrada em [PROVENANCE.md](PROVENANCE.md).

O texto MIT padrão foi conferido na
[Open Source Initiative](https://opensource.org/license/mit).
Ferramentas externas mantêm suas licenças; o inventário está na raiz.
