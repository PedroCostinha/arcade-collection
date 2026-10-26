# Preparação definitiva de Barrel Quest 1.1.0

Data: 26/10/2026, America/Sao_Paulo. Branch `feat/barrel-quest-playable`.
Base revisada: `629322d3eb1a94d56e4e022ce3daefa37337ad4e`.

O titular autorizou licenciamento, separação artística, promoção, documentação,
testes e um commit de preparação com push normal. **Merge, Pages, deploy,
tag e release permanecem sem autorização.** O PR #1 deve continuar Draft
para a aprovação final, inclusive depois de CI aprovado.

## Resultado e preservação

Versão do pacote/lockfile: `1.1.0`. Cabeçalho e rodapé: `V1.1.0`.
O patch de promoção foi aplicado e retirado após o uso. Nenhuma tag ou
GitHub Release foi criada; a versão ainda não está hospedada.

Core, geometria, colisões, passo de 120 Hz, mecânicas, pontuação e controles
permanecem idênticos à RC, exceto pelos cabeçalhos de licença nos arquivos.
A [comparação de integridade](evidence/stable-preparation/core-integrity.json)
registra os hashes dos corpos originais e confirma essa igualdade.
A orquestração só passa a importar os nomes/identidade do módulo artístico;
nenhum fluxo de jogo foi alterado.

Sprites/paleta foram movidos sem alterações para `src/art/ember7.ts`;
`src/render/sprites.ts` mantém o mesmo contrato por reexport. Composição e
parâmetros gráficos estão em `src/art/scene.ts`; identidade em
`src/art/identity.ts`. O renderer mantém os algoritmos de câmera e desenho.
CSS funcional está em `public/styles.css`; tema reservado em `public/theme.css`.
O HTML é um template funcional: o build resolve os nomes artísticos antes
da distribuição. Nenhum arquivo é buscado de um serviço externo em runtime.

## Inventário de licenças

| Material | Licença aplicada |
| --- | --- |
| Core, controles, app e renderer genérico | MIT |
| Adaptador de sprites, tipos técnicos, layout funcional, template HTML | MIT; valores de identidade incorporados continuam reservados |
| Scripts, testes, fixtures técnicas, workflows e configuração | MIT |
| Ember-7, sprites/paleta, cena e identidade em `src/art/` | `LicenseRef-Arcade-Art-Reserved`, direitos reservados |
| Tema, favicon, arte, imagens e identidade visual exclusiva | Direitos reservados |
| Documentação/textos de apresentação e evidências | Reservados, fora da concessão de código; avisos podem acompanhar a distribuição |
| TypeScript/Playwright e módulos associados | Apache-2.0, ferramentas de desenvolvimento |
| fsevents 2.3.2 opcional | MIT, não distribuído no jogo |
| Actions oficiais | MIT; dependências internas mantêm seus termos, sem distribuição no jogo |
| Navegadores e imagem de QA | Termos dos próprios titulares, sem distribuição no jogo |

Mapa normativo: [LICENSING.md](../LICENSING.md),
[MIT integral](../LICENSE-CODE.txt) e [direitos artísticos](../ART-RIGHTS.txt).
Não foi aplicada CC BY nem uma MIT geral à arte. A declaração do pacote e
do lockfile é `SEE LICENSE IN LICENSING.md`, com `private: true` preservado.

Os módulos fonte e emitidos mantêm avisos por escopo. O teste novo detectou
que o TypeScript pode remover comentários ligados a imports de tipos;
o build agora verifica a licença do fonte e repõe o aviso quando necessário.
Isso evita distribuir dados artísticos sem seu identificador de direitos.

## Validação local executada

Windows, Node 24.19.0 e npm 11.17.0. Node 22 é coberto pelo CI remoto,
não por execução local nesta rodada.

| Verificação | Resultado |
| --- | --- |
| Instalação `npm ci --ignore-scripts --no-audit --no-fund` | Aprovada, sem atualização de dependências |
| `npm test` | TypeScript strict e 29 testes aprovados, zero falhas |
| Strict | `strict`, `noUncheckedIndexedAccess`, noUnused e `noEmitOnError` preservados |
| Renderer | 32 sequências de comandos iguais às capturadas da RC antes da separação |
| Sprites | Hash de todas as onze poses e paleta igual à RC |
| Chrome 155.0.8059.85 | Missão completa, cinco cargas, vitória e zero erros |
| Firefox 153.0 | Missão completa, cinco cargas, vitória e zero erros |
| Controles/estados | Teclado, salto após pausa, escadas, pausa/blur, reinício, dano, checkpoint, Game Over, vitória e congelamento aprovados |
| Móvel emulado | Multitoque simultâneo/cancelamento no Chrome, câmera compacta e movimento reduzido aprovados |
| Layout | Painéis em 320/390/641/720/801/900/1100/1440 px; sem overflow nas larguras verificadas |
| Comparação visual com RC | Pixels do Canvas e todos os estilos computados iguais em menu/instruções a 390/900/1440 px, com exceções explícitas abaixo |
| Subcaminho | Grafo de módulos, CSS/tema, favicon e avisos carregam em `/arcade-collection/`; sem fallback ocultando módulos ausentes |
| Escopos distribuídos | Avisos íntegros, módulos artísticos reservados e adaptador/código MIT verificados |
| Workflow | actionlint 1.7.12 aprovado; nenhuma publicação executada |

As exceções da comparação visual são os dois rótulos de versão aprovados
e o cursor do crédito do rodapé, convertido em link para `LICENSING.txt`
com a mesma aparência. O compositor do Chrome com RAF controlado pode
capturar Canvas preto ou antialiasing de texto diferente. Por isso a prova
compara os pixels reais do backing buffer e propriedades CSS por valor,
além dos comandos fixados em 32 cenários. Capturas foram inspecionadas,
mas não são usadas como igualdade binária de PNG.

As missões usam eventos de teclado/toque no DOM, relógio RAF controlado e
piloto reativo, sem mutar o estado por hooks. Pontos/vidas podem variar pelo
agendamento das capturas; isso não representa mudança de dificuldade.

Resultados: [Chrome](evidence/stable-preparation/chrome.json),
[Firefox](evidence/stable-preparation/firefox.json),
[comparação visual](evidence/stable-preparation/visual.json) e
[smoke/manifesto](evidence/stable-preparation/runtime.json).
O smoke tem RAF real, sem `?qa=1`, sem observador QA, sem erros HTTP/console
e sem origens externas. Seu desempenho cobre apenas o começo da partida
em Chrome desktop headless; não certifica celular, sessão prolongada ou FPS
de toda a missão. Os valores e hashes efetivos constam do JSON.

## Build e publicação

O inventário exato e os hashes SHA-256 de cada arquivo estão no manifesto
acima: **21 arquivos, 71.566 bytes** no build local validado. Os bytes podem
variar por normalização de finais de linha no runner; revalidar o manifesto
do artefato efetivamente publicado. Somente JavaScript da aplicação/arte, HTML, CSS funcional/tema,
favicon, `.nojekyll` e os três avisos legais são publicados pelo workflow.
O tipo `art-types.d.ts` não gera módulo vazio. Não são enviados TypeScript,
`node_modules`, testes, screenshots, documentação de QA, scripts de servidor
ou ferramentas. O build limpa saída obsoleta e os testes aplicam allowlist.

Os avisos legais são acessíveis pelo crédito do rodapé e pelo link de licença
no HTML; o teste do servidor confirma `text/plain`. Os headers locais CSP e
`no-store` não são garantidos no Pages e ainda exigem validação hospedada.

O workflow manual exige `main`, confirmação e SHA completo aprovado; não
executa por push/PR/tag/release. Não foi disparado nem foi habilitado Pages.
Os testes locais não equivalem à integração real com o serviço.

## CI e aprovação final

Este relatório entra no próprio commit de preparação. O resultado remoto
só pode ser observado depois do push e deve ser consultado no **mesmo SHA**:
[Checks do PR #1](https://github.com/PedroCostinha/arcade-collection/pull/1/checks).
Jobs exigidos: Node 22, Node 24 e Firefox playable mission. Os checks antigos
de `629322d` não contam como validação das mudanças de preparação.
O resultado efetivo e o SHA serão entregues após a observação dos novos runs;
não se grava aqui sucesso futuro antecipadamente.

Não alterar Draft automaticamente. A próxima decisão é a aprovação final
de integração; autorização de publicação será solicitada separadamente.
[Plano operacional e checklist hospedado](RELEASE_PLAN_1_1_0.md).

## Pendências mantidas

Safari real, celular físico Android/iOS, leitor de tela real, sessão com
iniciante, avaliação prolongada e checklist da URL hospedada permanecem
**pendentes, não testados**. A QA móvel é emulada. Não houve alteração no
repositório do perfil, CODE QUEST V2, configurações de Pages ou proteção de
branches/ambiente. Sem merge, deploy, tag ou release nesta etapa.
