var margin = 20,
    width = 1050,
    height = 680;

var svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append('g')
    .attr('class', 'map');

var projection = d3.geoMercator()
    .scale(180)
    .translate([width / 2, height / 1.5]);

var path = d3.geoPath()
    .projection(projection)
    .pointRadius(2.5);

var voronoi = d3.voronoi()
    .extent([[-1, -1], [width + 1, height + 1]]);

var destination = [],
    yearsList = [],
    populationMax = 0;

/**
* Carrega todos os arquivos que serão usados
* unhcr_all_data: Arquivo com o país e o total de refugiados
* country: Arquivo com o pais e coordenadas
* geo: Coordenadas geométricas de todos os países
*/

d3.queue()
    .defer(d3.json, "data/geo.json")
    .defer(d3.csv, "data/unhcr_all_data.csv", formatData)
    .defer(d3.csv, "data/country.csv", formatCountry)
    .await(ready);

function ready(error, worldmap, countries, countryGeo) {
    if (error) throw error;

    // Cria mapa 
    svg.append("path")
        .datum(topojson.feature(worldmap, worldmap.objects.land))
        .attr("class", "land")
        .attr("d", path);

    svg.append("path")
        .datum(topojson.mesh(worldmap, worldmap.objects.countries,
                              function (a, b) { return a !== b; }))
        .attr("class", "country_borders")
        .attr("d", path);

    // Agrupa os dados
    var nested = d3.nest()
        .key(function (d) {
            return d['Year'];
        }).sortKeys(d3.descending)
        .key(function (d) {
            return d['Destination'];
        })
        .key(function (d) {
            return d['Origin'];
        })
        .rollup(aggCountry)
        .entries(countries);

    var countryid = d3.map(countryGeo, 
        function (d) { return d.country });

    var linkedCoords = [],
        sumPopulation = 0;

    nested.forEach(function (y) {
        yearTemp = +y.key;
        // Para cada ano, retira o conjunto de informações do filho 
        // e sobe para o mesmo nível
        y.values.forEach(function (k) {
            linkedCoords = []
            k.arcs = { type: "MultiLineString", coordinates: [] };
            var target = countryid.get(k.key);
            try {
                k[0] = +target[0];
                k[1] = +target[1];
              }
              catch (err) {
                console.log(k.key);
              }           
            k.year = yearTemp;
            sumPopulation = 0;
            k.total_origin = k.values.length;
            k.values.forEach(function (v) {
                try {
                    var source = countryid.get(v.value.origin)
                    if ((isLatitude(source[1])) && (isLongitude(source[0]))) {
                        if ((isLatitude(target[1])) && (isLongitude(target[0]))) {
                            linkedCoords.push([source, target]);
                            linkedCoords.push([target, source]);
                            sumPopulation += +v.value.total_population;
                        }
                    };//if ((isLatitude(source[1])) 
                }
                catch (err) {
                    console.log(v);
                }
            });
            linkedCoords.forEach(function (link) {
                k.arcs.coordinates.push(link)
            });
            // soma o total de refugiados dos filhos
            k.total_population = sumPopulation;
            // Apaga todos os valores dos filhos porque eles
            // já foram copiados para outras variávies no node pai
            delete k.values;
            destination.push(k);
        })
    });

    delete destination.values;
    
    destination = destination.filter(function (d) {
        return d.arcs.coordinates.length;
    });    


    // cria um novo array com um unico valor para cada ano
    var years = [...new Set(yearsList)];

    // ordena os anos em ordem crescente
    years.sort(function (a, b) { return a - b });

    //indice para controle do loop por ano
    var yearIdx = years.length - 12;
    
    var yearInterval = setInterval(function () {
        //Cria os elementos do mapa
        drawn(+years[yearIdx], destination);

        yearIdx++;

        // Encerra se não há mais nenhum ano para exibição
        if (yearIdx >= years.length) {
            clearInterval(yearInterval);

            slider(years); 

            legend();
        }
    }, 1000);// var year_interval
}//function ready(error, worldmap, countries) {

///////////Funções de suporte/////////////////////////////

function formatData(d) {
    d.Year = +d.Year;
    d.Total_Population = +d.Total_Population;
    return d;
}//altData

function formatCountry(d) {
    d[0] = +d.longitude;
    d[1] = +d.latitude;
    return d;
}//formatCountry


function isLatitude(lat) {
//code from: https://stackoverflow.com/questions/39842004/why-use-regular-expressions-to-validate-latitude-and-longitude-in-javascript
    return isFinite(lat) && Math.abs(lat) <= 90;
}

function isLongitude(lng) {
//code from: https://stackoverflow.com/questions/39842004/why-use-regular-expressions-to-validate-latitude-and-longitude-in-javascript
    return isFinite(lng) && Math.abs(lng) <= 180;
}

function aggCountry(leaves) {
/**
 * Agrega os dados por Ano/Destino/Origem
 */
    var total = d3.sum(leaves, function (d) {
        return d['Total_Population'];
    });

    var origin = leaves[0]['Origin'];
    var destination = leaves[0]['Destination'];
    var year = +leaves[0]['Year']

    if (year) { yearsList.push(year); }

    return {
        'destination': destination,
        'year': year,
        'origin': origin,
        'total_population': total,
        'arcs': { type: "MultiLineString", coordinates: [] }
    };
}//agg_country

function slider(years) {
/**
 * Este trecho foi retirado do slider criado pelo Mike Bostock:
 * fonte: //https://bl.ocks.org/mbostock/6452972
 * Objetivo: Desenhar o objeto slider
 *  @param {array} years Lista de anos
 */

    var x = d3.scaleLinear()
    .domain([years[0], years.slice(-1).pop()])
    .range([0, 960])
    .clamp(true);

    var slider = d3.select("#year").append("svg")
    .attr("width", width + margin)
    .attr("height", 40)
    .append('g')
    .attr("class", "slider")
    .attr("transform", "translate(10 ," + 20 + ")");

    slider.append("line")
    .attr("class", "track")
    .attr("x1", x.range()[0])
    .attr("x2", x.range()[1])
    .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
    .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
        .on("start.interrupt", function () { slider.interrupt(); })
        .on("start drag", function () { update(x.invert(d3.event.x)); }));

    slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
    .selectAll("text")
    .data(x.ticks(((years.length - 1) / 2)))
    .enter().append("text")
    .attr("x", x)
    .attr("text-anchor", "middle")
    .text(function (d) { return d; });

    var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

    function update(value) {
        var d = Math.round(value);
        handle.attr("cx", x(d));
        drawn(d, destination);
    }
}

function drawn(year, destination) {
    var filteredYear = destination.filter(function (d) {
        return d.year === year;
    });

    // Apura o valor maximo do total da populacao para usar 
    // como parametro de medida do tamanho dos circulos
    populationMax = d3.max(filteredYear, function (d) {
        return +d.total_population;
    });

    // Apura o raio (r) com base no máximo de populacao
    var radius = d3.scaleSqrt()
        .domain([0, populationMax])
        .range([0, 15]);

    // Inclui texto como o ano corrente 
    d3.select("h2")
        .text("Number of refugees per country in " + year);

    // Calcula o voronoi para as posicoes
    var polygons = voronoi.polygons(filteredYear.map(projection));
    
    // Remove todos os objetos vinculados a classe country
    d3.selectAll(".country").remove();

    var country = svg.selectAll(".country")
        .data(filteredYear)
        .enter()
        .append("g")
        .attr("class", "country");
  
    // Remove todos os circulos que estão desenhados       
    d3.selectAll(".circle").remove();

   // Vincula os elementos circulos com os dados filtrados  
    var circle = svg.selectAll('circle')
        .data(filteredYear)
        .enter()
        .append("g")
        .attr("class", "circle");
   
    // Desenha Circulos 
    circle.append("circle")
        .attr('cx', function (d) { return projection([d[0], d[1]])[0]; })
        .attr('cy', function (d) { return projection([d[0], d[1]])[1]; })
        .attr('r', function (d) { return radius(d.total_population); })
        .style("opacity", 0.7)
        .transition()
        .delay(500)
        .duration(750)
        .style("opacity", 1);

   // Cria a legenda para cada pais 
    country.append("title")
        .text(function (d) {
            return d.key + "\n" +
                "Refugees: " + d.total_population.toLocaleString() + "\n" +
                "From : " + d.total_origin + " countries";
        })
        .style("font-size", "16px");

    //https://github.com/d3/d3-scale-chromatic
    var scaleOrange = d3.scaleSequential(d3.interpolateOranges);
                    
    scaleOrange.domain([0,populationMax]);

    // Desenha os arcos 
    country.append("path")
        .attr("class", "country-arc")
        .attr("d", function (d) { return path(d.arcs); });
        /*
        .style("stroke", function (d) { 
            return scaleOrange(d.total_population); 
        }) 
        .style("opacity", 0)          
        //.style("stroke-opacity", 0)
        .on("mouseover", function () {
            d3.select(this).style("opacity", 1);
            
         }).on("mouseout", function () {
            d3.select(this).style("opacity", 0);
         });

*/
    // Desenha o voronoi 
    country.append("path")
        .data(polygons)
        .attr("class", "voronoi")
        .attr("d", function (d) { return d ? "M" + d.join("L") + "Z" : null; });
}// drawn  

function legend() {
    var margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
      };
    var width = 480 - margin.left - margin.right;
    var height = 130 - margin.top - margin.bottom;
            
      // Apura o raio (r) com base no máximo de populacao
    var radius = d3.scaleSqrt()
    .domain([0, populationMax])
    .range([0, 15]);

      //SVG container
    var legend = d3.select('#chart')
    .append("svg")
    .append("g")
    .attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")");

    //Legenda
    var legendData = [
        {radius: populationMax, opacity: 1,  offset: 20},
        {radius: Math.round(populationMax/2), opacity: 0.7,  offset: 65},
        {radius: Math.round(populationMax/4), opacity: 0.4,  offset: 100},
    ]
   
    legend.selectAll(".circle-legend")
        .data(legendData)
        .enter().append("circle")
        .attr("class", "circle-legend")
        .attr("cx", 20)
        .attr("cy", function(d) { return d.offset; })
        .attr("r", function (d) { return radius(d.radius); })
        .style("fill", "#ffa500" )
        .style("opacity", function(d) { return d.opacity; })

    legend.selectAll(".legend-text")
        .data(legendData)
        .enter().append("text")
        .attr("class", "legend-text")
        .attr("x", 45)
        .attr("y", function(d) { return d.offset; })
        .attr("dy", "0.4em")
        .text(function(d) { return d.radius.toLocaleString(); });
}
