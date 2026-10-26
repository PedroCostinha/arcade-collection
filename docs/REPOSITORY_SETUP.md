# Preparação do repositório público

Estado atual da preparação definitiva e licenças aplicadas: [PREPARATION_1_1_0.md](PREPARATION_1_1_0.md).

Registro da preparação inicial de código/CI. A etapa posterior de preparação
local de Pages, sem execução ou habilitação, está em
[RELEASE_PLAN_1_1_0.md](RELEASE_PLAN_1_1_0.md).

## Autorização e histórico

PedroCostinha autorizou criar `PedroCostinha/arcade-collection` público,
publicar a branch existente e abrir um Draft PR, sem merge, deploy ou Pages.
A identidade foi confirmada na API autenticada do GitHub e no GitHub CLI.

`fd48a7e033312ec00b0384e4eab7d3cdc5483bf8` é o commit raiz do projeto.
A base `main` inicial aponta para ele; `feat/barrel-quest-playable` preserva
esse ancestral e acrescenta CI e documentação de publicação. Isso conserva
o hash, os arquivos e o histórico do protótipo, sem rebase, amend ou force push.
O PR apresenta a preparação do repositório, pois a implementação original
já faz parte dessa base inicial. Não houve merge de PR.

`origin` aponta para o novo repositório sem credenciais na URL. Não havia
remotos anteriores; nenhum foi substituído. A branch de desenvolvimento
continua ativa localmente. O repositório do perfil não foi modificado.

## CI

`.github/workflows/ci.yml` executa em pushes de `main` e da branch do
protótipo, e em PRs para `main`. Não há agendamento, `pull_request_target`,
workflow de publicação ou commits automáticos.

- Node 22 e 24: instalação pelo lockfile, sem lifecycle scripts de pacotes,
  build TypeScript strict e os 25 testes no runner nativo do Node.
- Firefox / Linux / Node 24: imagem oficial Playwright 1.62.1 Noble, fixada
  por digest, com navegadores e dependências do sistema pré-instalados;
  build e missão completa com entradas DOM, pausa, reinício e responsividade.
- `contents: read` como única permissão; checkout sem persistir credenciais.
- Checkout v7.0.1 e setup-node v7.1.0 fixados por SHA completo, conferidos
  nos repositórios oficiais. Sem PAT, secrets, OIDC ou permissão de Pages.
- Limite de tempo por job e cancelamento de execução anterior da mesma ref.
- Capturas temporárias ficam em `test-results/`; o CI não regrava evidências
  versionadas nem publica artefatos, site, pacotes ou releases.

A configuração segue a orientação oficial de
[fixar Actions por SHA e limitar credenciais](https://docs.github.com/en/actions/reference/security/secure-use).
Os resultados observados ficam no PR e na aba Actions do novo repositório.

A primeira execução do PR atingiu o limite de 15 minutos durante downloads
do espelho `azure.archive.ubuntu.com`, antes do build e dos testes de navegador.
Uma repetição também demorou nessa etapa. O job passou a usar a
[imagem oficial do Playwright](https://playwright.dev/docs/docker), com a
mesma versão do pacote e digest conferido no Microsoft Container Registry.
Isso elimina a instalação APT durante a QA. A imagem é apenas uma ferramenta
de CI: não serve o jogo publicamente nem faz parte de `dist/`. Os testes e
as permissões de GitHub continuam os mesmos; o container executa como o
usuário não privilegiado `pwuser`, sem modo privilegiado ou capacidades extras.
Esse usuário também evita a recusa do Firefox quando o Actions monta seu
diretório pessoal com proprietário diferente de root. Não é necessário
alterar a variável de ambiente HOME.

## Revisão antes de enviar

A revisão abrange o conteúdo rastreado e o histórico que será enviado,
nomes de arquivos sensíveis, padrões de credenciais e metadados de PNG.
Os diretórios `node_modules/`, `dist/`, `test-results/`, arquivos `.env`,
chaves e configurações privadas não fazem parte da publicação. As imagens
versionadas são capturas do próprio jogo. Credenciais do GitHub CLI ficam
fora do repositório e não são copiadas para código ou workflow.

Os caminhos `C:\Projetos\arcade-collection` nos documentos históricos
descrevem a pasta de trabalho já informada pelo titular; não são uma chave,
credencial ou arquivo do ambiente pessoal. Nenhum log de autenticação foi
adicionado ao projeto.

## Próxima aprovação

A escolha de licença permanece explícita e separada por tipo de material em
[LICENSING.md](LICENSING.md). A próxima etapa é avaliar jogabilidade e visual
na cópia local. Um futuro merge ou GitHub Pages depende de nova aprovação.
Nenhuma URL de jogo hospedado deve ser anunciada como disponível nesta etapa.
