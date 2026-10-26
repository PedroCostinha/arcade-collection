# Barrel Quest 1.1.0 — plano de publicação

Atualizado em **26/10/2026, America/Sao_Paulo**. Escopo exclusivo:
`PedroCostinha/arcade-collection`, branch `feat/barrel-quest-playable`, PR #1.

## Estado e autorização

O titular aprovou o licenciamento e autorizou a separação entre código e
arte, promoção do pacote para `1.1.0`, documentação, testes, commit com a
identidade PedroCostinha e push normal na branch existente.

**Continuam sem autorização: merge, habilitação/publicação Pages, deploy,
tag e GitHub Release estável.** O PR deve permanecer Draft até a próxima
aprovação final, mesmo depois de seus checks passarem. O perfil e CODE QUEST V2
estão fora do escopo. Não é permitido inferir autorização de publicação a
partir da versão do pacote ou do sucesso dos testes.

## Preparação implementada

- Patch de promoção aplicado: package/lockfile `1.1.0` e dois rótulos da
  interface agora `V1.1.0`. O patch já aplicado foi retirado da árvore.
- MIT aplicada exclusivamente ao código original. Sprites, paleta, cena,
  identidade, tema e favicon têm escopo reservado, conforme
  [LICENSING.md](../LICENSING.md) e [registro da decisão](LICENSING.md).
- Dados artísticos separados em `src/art/`; renderer e tipos técnicos em
  `src/render/`; layout funcional separado de `public/theme.css`.
- Arquitetura, física, mecânicas, pontuação, controles e aparência preservados.
  Os arquivos de core/controles só receberam cabeçalhos de licença.
- Build limpa `dist/` e distribui somente módulos, assets, `.nojekyll` e três
  avisos legais. Sem fontes TypeScript, ferramentas, testes ou documentação
  de QA no artefato. Não há backend ou dependência externa de runtime.
- Workflow Pages oficial preparado, validado por actionlint e não executado.
- Changelog, README, proveniência, relatório e evidências atualizados.

A revisão inicial de `629322d` tinha 25 testes e os três jobs verdes; a
preparação preliminar tinha 27 testes. Esses resultados históricos não
substituem os **29 testes** e os checks do novo SHA. O relatório atual é
[PREPARATION_1_1_0.md](PREPARATION_1_1_0.md); as evidências preliminares
permanecem em `docs/evidence/release-readiness/`.

## Workflow Pages

`.github/workflows/pages.yml` aceita apenas `workflow_dispatch`:
repositório correto, ref `refs/heads/main`, `publish=true` e SHA completo
em `expected_sha` igual ao SHA da execução. Confere versão do pacote e
lockfile, rótulos estáveis e executa `npm test` antes de enviar o artefato.
A branch de preparação não pode passar no gate de ref.

Permissões globais vazias; build com `contents: read`; deploy com apenas
`pages: write` e `id-token: write`. Checkout sem persistir credenciais.
Somente o token efêmero automático do Actions e OIDC; sem PAT ou secrets.
Actions oficiais fixadas por SHA: checkout v7.0.1, setup-node v7.1.0,
configure-pages v6, upload-pages-artifact v5 e deploy-pages v5.
`configure-pages` usa `enablement: false`; não habilita o serviço.

Somente `dist/` é enviado. Arquivos ocultos são incluídos para `.nojekyll`,
com allowlist de build verificada por teste. Artefato com retenção de um dia,
Ubuntu 24.04 explícito, timeout e serialização sem cancelamento em andamento.
Deploy depende do build, usa ambiente `github-pages` e não faz checkout.
Não há publicação por push, PR, tag ou release. CI de Node 22/24 e Firefox
continua separado e sem permissões de deploy.

O domínio padrão do GitHub Pages atende este repositório público no GitHub
Free, sujeito aos limites do serviço. Não são necessários domínio pago,
backend, tokens pessoais, pacote de runtime ou serviço adicional.
Referências: [workflow oficial](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages),
[Pages e planos](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages),
[HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).

## Próxima aprovação: integração — ainda não autorizada

1. Conferir o novo SHA e as evidências locais no relatório. Verificar no PR
   os três jobs do mesmo head: Node 22, Node 24 e Firefox playable mission.
   Se o head/base mudar, refazer a revisão e os checks correspondentes.
2. O titular aprova explicitamente a integração. Resolver riscos aceitos e
   testes pendentes sem marcá-los como executados. Manter Draft até essa
   decisão; não fazer auto-merge nem contornar checks.
3. Na etapa autorizada de configuração, proteger `main` com PR e os três
   checks e impedir a exclusão automática da branch após merge. Configurar
   ambiente `github-pages` permitindo explicitamente só a branch `main`
   e aprovação de deploy. Em manutenção solo, não exigir reviewer inexistente.
   Não usar “protected branches only” sem proteção de branch configurada.
4. Retirar Draft e integrar por **merge commit**, preservando todos os commits
   e a branch. Com o head revisado em `$approvedHeadSha`, comando futuro:
   `gh pr merge 1 --repo PedroCostinha/arcade-collection --merge --match-head-commit $approvedHeadSha`.
   Não usar `--admin`, squash, rebase, force push ou `--delete-branch`.
5. Aguardar os três jobs do merge commit em `main` e guardar o SHA completo
   como `$deploymentSha`. Confirmar a inclusão do head aprovado e a ausência
   de alteração posterior. O merge não publica o jogo.

## Aprovação separada: publicação — ainda não autorizada

1. Obter autorização explícita para habilitar Pages e publicar o SHA definido.
2. Em Settings > Pages selecionar **GitHub Actions**. Confirmar o ambiente
   `github-pages`, regra somente `main` e revisão de deploy. Habilitar ou
   confirmar Enforce HTTPS quando disponível. Sem domínio/CNAME ou DNS novo.
3. Disparar uma única execução de `pages.yml` na `main`, com `publish=true`
   e `expected_sha=$deploymentSha`. Comando futuro:
   `gh workflow run pages.yml --repo PedroCostinha/arcade-collection --ref main -f publish=true -f expected_sha=$deploymentSha`.
   Se a ref mudou, a condição impede o avanço; revisar o novo SHA, sem
   reduzir o gate. Conferir build, artefato e SHA antes de aprovar o ambiente.
4. Esperar `deploy-pages` concluir. Registrar run, SHA, artefato, URL e horário.
   URL esperada, ainda não hospedada/testada:
   `https://pedrocostinha.github.io/arcade-collection/`.
5. Executar o checklist abaixo na URL efetiva, em sessão limpa e hard reload.
   Corrigir qualquer defeito impeditivo antes de anunciar o jogo.
6. Atualizar o README do **jogo** com a URL efetiva e o caminho de execução
   pela `main`. Não alterar o README do perfil ou CODE QUEST V2.
7. Só após aprovação específica e validação hospedada, criar `v1.1.0` e
   GitHub Release apontando exatamente a `$deploymentSha` publicada, nunca
   à `main` posterior por conveniência. A preparação atual não cria nenhum.

Proteções de ambiente em repositórios públicos:
[documentação oficial](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments).

## Checklist hospedado — todos pendentes

- [ ] HTTPS, certificado válido, HTTP redirecionado e ausência de mixed content.
- [ ] Abrir diretamente `/arcade-collection/`, manter barra final e fazer
  hard reload; nenhum asset depende da raiz ou de fallback de SPA.
- [ ] HTML, CSS funcional/tema, favicon, imports JS e avisos legais retornam
  200 com MIME correto. Arquivos inexistentes retornam erro real.
- [ ] Só recursos do build foram publicados; sem testes, fontes, ferramentas,
  dados privados ou requisições externas de runtime.
- [ ] Rótulos `V1.1.0`, avisos íntegros, commit e manifesto do artefato corretos.
- [ ] Crédito do rodapé abre o mapa de licenças; links de documentação,
  repositório e skip link funcionam nos respectivos locais.
- [ ] Observador `window.__BARREL_QUEST__` ausente no domínio público,
  inclusive com `?qa=1`.
- [ ] Menu/instruções, foco visível, navegação por teclado e objetivo legíveis.
- [ ] Setas/WASD, Espaço, escadas, P/Esc, pausa por troca de aba, reinício,
  dano/checkpoint, derrota e vitória funcionam sem reload ou input preso.
- [ ] Multitoque mover+pular, cancelamento, rotação, scroll e retorno de aba
  funcionam em mobile; câmera e botões cabem na tela.
- [ ] Console sem erros e assets sem respostas 4xx/5xx.
- [ ] Medir quadros longos/FPS e memória na missão completa, sessão prolongada
  e vários reinícios, em desktop e mobile. Não certificar com smoke curto.
- [ ] Chrome e Firefox na URL efetiva, desktop/estreito, zoom e movimento reduzido.
- [ ] **Safari real: pendente, não testado.** WebKit emulado não seria Safari.
- [ ] **Celular físico Android/iOS: pendente, não testado.** QA atual é emulação.
- [ ] **Leitor de tela real: pendente, não testado.** HTML/ARIA não comprovam a experiência.
- [ ] Sessão com iniciante real: pendente; piloto automatizado não a substitui.

## Riscos e recuperação

Os escopos artísticos foram separados e as licenças aplicadas com aprovação.
Permanecem pendentes a configuração real de Pages/permissões, proteções
operacionais, compatibilidade nos dispositivos citados e desempenho prolongado.
As capturas e testes locais não comprovam a URL hospedada. Headers `no-store`
e CSP do servidor local não são garantidos no Pages; validar cache e sessão
limpa para evitar mistura de módulos após atualizações.

Se a estreia falhar, não criar tag/release nem anunciar o jogo. Diante de
defeito impeditivo no site, retirar a publicação mediante autorização
operacional e corrigir na branch com novo commit e CI. Não há versão pública
anterior para rollback nesta estreia. Depois de existir versão boa, reverter
via novo commit/PR ou reconstruir um SHA aprovado, publicar manualmente e
revalidar; nunca reset/force push. Preservar runs e SHAs para diagnóstico.
