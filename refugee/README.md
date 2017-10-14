# Visualização de dados eficaz
# Projeto: Refugee journey

## Objetivo

Este projeto tem o objetivo de demonstrar o tamanho da população de refugiados presente em cada país para cada ano desde 1951 a 2016. Este assunto é relevante para a organização social e foi movida pela curiosidade de saber para onde eles iam, já que é mais comum a mídia dizer de quais países eles são. 
Houve uma mudança significativa na forma como este grupo se espalhou pelo mundo após a década de 90. De acordo com o relatório de Tendências Globais da ACNUR, a partir de 1990 houve um aumento do deslocamento forçado, sendo observado nos últimos cinco anos um crescimento mais acelerado neste volume. Os conflitos na Somália, Afeganistão e Síria são exemplos de situações que colaboram para o aumento dessa população de atenção da ONU.

https://s3.amazonaws.com/unhcrsharedmedia/2016/2016-06-20-global-trends/2016-06-14-Global-Trends-2015.pdf

## Dados

unhcr_all_data: Os dados foram obtidos diretamento no site da UNHCR (The UN Refugee Agency). Este arquivo contém o nome do país de origem e destino e o total de refugiados. 
country: Como o arquivo da ONU não tinha as coordenadas de latitude e longitude dos países, foi necessário obter um outro arquivo .CSV com essas informações. 
geo: Para desenho do mapa mundi usei as coordenadas de outro arquivo em formato .JSON. 

## Feedback

OBS: Os arquivos foram alterados para uma nova pasta do github, mas o histórico das alterações permanece no diretório.

Eu coletei o feedback com os colegas de trabalho e amigos e as sugestões/críticas foram:

1. "É muito lento o tanto de informação que passa no ínicio."

Tratamento: Ao iniciar a página eu estava exibindo os dados de 1951 a 2016, não estava lento, mas como são muitos anos consumia algum tempo para concluir a exibição. O que eu fiz foi continuar carregando e trantando todos os dados, mas só exibindo a partir de 2006. No fim da exibição montei um slider com todos os anos, caso a pessoa tenha interesse em ver os dados anteriores.

2. "Se tivesse como ver pelo arco de qual país veio mais gente, seria interessante."

Tratamento: O projeto usa o efeito hover do css para definir quando exibir os arcos. Na tentativa de atender a este pedido, eu retirei o evento do css e passei para o .on( mouseover) do objeto. Criei uma escala de cor laranja em que quanto maior a população do país, mais forte seria a cor do ar. Apesar de ter conseguido reproduzir o efeito, o controle não ficou tão rápido como na camada do CSS, por isso, optei por não alterar a forma como estava implementado.

3. "São muitos botões na tela, está feio" =(

Tratamento: Eu tinha criado um botão para cada ano, e realmente não fazia sentido porque foram plotados botões para os anos de 1951 a 2016. Pesquisei outros objetos para input de dados e achei que o slider seria o mais adequado. Troquei o objeto botão por slider e tive o mesmo problema de muitos valores no eixo x. Para limpar a visualização defini os ticks() como sendo a metade dos dados e o problema foi resolvido.

4. "Falta informações do seu contato"

Tratamento: Apesar de não impactar no objetivo do projeto, achei valido criar um footer com link para a minha rede social.

5. "Dá pra por uma legenda com o tamanho da bolinha?"

Tratamento: Incluído legenda no lado direito do mapa com a representação do total da poupulação.

6. Revisão Udacity
6.1 - O país selecionado recebeu refugiados, ou foi o país de saída deles?

Tratamento: Melhorei o texto do tooltip incluíndo explicitamente no texto que era o país de destino. Fiz um teste incluído uma seta com a direção do movimento nos arcos, mas não ficou bom porque todas as setas apontam para o mesmo círculo. Numa segunda versão, mudando o foco dos dados e mostrando a informação da origem para o destino, as setas ficariam mais adequadas.

6.2 - Quantos refugiados exatamente estão associados a cada país?
Tratamento: O total de refugiados recebidos por cada país está no tooltip e foi incluído no cabeçalho um novo texto descritivo com o total de refugiados no mundo naquele ano.

## Design - Do início ao Fim

Quando eu começei o projeto eu já tinha uma idéia dos elementos básicos necessários, como 1 mapa, os desenhos do círculo e os arcos de ligação entre as informações.

A medida que o projeto foi desenvolvendo é que percebi, por exemplo, que o volume de dados que eu tinha necessitaria de uma interação do usuário para determinar se toda a informação deveria ser vista. A partir daí criei o slider. Outros elementos como Tooltip, efeitos de transição, delay e transparência de objetos foram usados para auxiliar a leitura das informações e interação com o usuário.

## Conclusão
No ínicio, apesar dos exemplos e documentação na internet, tive dúvidas quanto a minha curva de aprendizagem nesta biblioteca do D3 e no próprio JS. A medida que o trabalho foi se desenvolvendo e o conteúdo se tornou mais sólido, comecei a me divertir fazendo o projeto. O D3.js me possibilitou fazer um trabalho que não me parecia possível a um tempo atrás. Me concentrei em criar uma visualização de dados que fosse limpa e o com o mínimo de informações necessárias ao entendimento do tema. Espero que você goste! 

## Referências
<ol>
<li>https://bl.ocks.org/mbostock/7608400</li>
<li>http://mbostock.github.io/d3/talk/20111116/airports.html</li>
<li>https://www.visualcinnamon.com/</li>
<li>http://learnjsdata.com/group_data.html</li>
<li>http://curran.github.io/screencasts/introToD3/examples/viewer/#/</li>
<li>https://developer.mozilla.org/pt-BR/docs/Web/JavaScript</li>
<li>https://www.w3schools.com/js/default.asp</li>
<li>http://www.acnur.org/portugues/</li>
<li>https://bl.ocks.org/mbostock/6452972</li>
<li>https://stackoverflow.com/questions/39842004/why-use-regular-expressions-to-validate-latitude-and-longitude-in-javascript</li>
<li>https://codemyviews.com/blog/inner-shadows-in-css-images-text-and-beyond</li>
<li>https://www.w3schools.com/howto/howto_css_social_media_buttons.asp</li>
</ol>

