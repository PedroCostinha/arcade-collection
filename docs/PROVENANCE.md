# Origem dos recursos

Ember-7 é o personagem original desenvolvido para o perfil de PedroCostinha.
Os onze quadros de 16×20 pixels em `src/render/sprites.ts` foram exportados,
sem alteração da fonte, do módulo próprio `scripts/arcade/sprites.py` em
`PedroCostinha/PedroCostinha`, revisão `24d458b` (código integrado na main).

A composição industrial, paleta preta/grafite/vermelha, rampas, escadas e barris
reinterpretam os elementos próprios do protótipo em Canvas. Física, entradas,
estados, câmera, UI, testes e código do jogo foram escritos para este projeto.
O favicon é uma letra E geométrica desenhada aqui. Não há recursos baixados
de jogos comerciais, personagens de terceiros, sons ou marcas de franquias.

O projeto Pac-Man estudado anteriormente **não é dependência nem fonte de
código/sprites** desta implementação. Seus problemas de autorização não são
contornados ao mudar de SVG para Canvas.

O repositório do perfil não declara uma licença pública geral. Este projeto
reaproveita recursos próprios sob instrução de seu titular, que autorizou
publicar o novo repositório. Isso não estabelece uma licença geral de
redistribuição para terceiros. A escolha de licença para código e recursos
próprios continua pendente; nenhuma licença foi aplicada em seu nome.
Consulte a [recomendação separada por recurso](LICENSING.md).

Ferramentas de desenvolvimento instaladas via npm têm suas próprias licenças;
o lockfile registra versões e integridades. Elas não são enviadas em `dist/`.
