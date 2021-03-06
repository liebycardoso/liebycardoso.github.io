var margin = 75,
  width = 1600,
  height = 600;

var svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin)
  .attr("height", height + margin)
  .append('g')
  .attr('class', 'map');

var projection = d3.geoMercator()
  .scale(195)
  .translate([width / 2, height / 1.5]);

var path = d3.geoPath()
  .projection(projection)
  .pointRadius(2.5);

var voronoi = d3.voronoi()
  .extent([[-1, -1], [width + 1, height + 1]]);

var opacityScale = d3.scaleLinear()
  .range([1, 0.9, 0.4, 0.1, 0.1])
  .domain([0, 3, 4, 6, 10])
  .clamp(true);

var countryF = [],
  yearsList = [];

var colorScale = d3.scaleLinear()
  .range(['#fff7b9', '#fff196', '#ffea72', '#ffe348', '#fddc18'])
  .domain([0, 1, 2, 4, 6])
  .clamp(true);

d3.queue()
  .defer(d3.json, "geo.json")
  .defer(d3.csv, "unhcr_all_data.csv", altData)
  .defer(d3.csv, "country.csv", formatCountry)
  .await(ready);

function ready(error, worldmap, countries, countryGeo) {
  if (error) throw error;

  ///////////Cria mapa////////////////////////////////////////////////////////
  svg.append("path")
    .datum(topojson.feature(worldmap, worldmap.objects.land))
    .attr("class", "land")
    .attr("d", path);

  svg.append("path")
    .datum(topojson.mesh(worldmap, worldmap.objects.countries, function (a, b) { return a !== b; }))
    .attr("class", "country_borders")
    .attr("d", path);

  //////////////Agrupa dados////////////////////////////////////////////////////

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
    .rollup(agg_country)
    .entries(countries);

  ////////////////Formatar os dados//////////////////////////

  var countryid = d3.map(countryGeo, function (d) { return d.country });
  var linkedCoords = [],
    sumPopulation = 0;

  nested.forEach(function (y) {
    yearTemp = +y.key;
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
      });// k.values.forEach(function(v)

      linkedCoords.forEach(function (link) {
        k.arcs.coordinates.push(link)
      });
      //k.total_population = sumPopulation.toLocaleString();
      k.total_population = sumPopulation;
      delete k.values;
      countryF.push(k);
    })
  });

  delete countryF.values;



  ////////////////////////////// Prepara dados e ///////////////////////////////
  ////////////////////////////// Cria vinculos entre eles//////////////////////

  countryF = countryF.filter(function (d) {
    return d.arcs.coordinates.length;
  });

  function drawn(year) {
    var filteredYear = countryF.filter(function (d) {
      return d.year === year;
    });

    // Apura o valor maximo do total da populacao para usar como parametro de medida do tamanho dos circulos
    var population_max = d3.max(filteredYear, function (d) {
      return +d.total_population;
    });

    // Apura o raio (r) com base no máximo de populacao
    var radius = d3.scaleSqrt()
      .domain([0, population_max])
      .range([0, 15]);
    /*
    d3.select("#year")
      .text(year)
      .style("font-size", "30px");
*/

    // Calcula o voronoi para as posicoes
    var polygons = voronoi.polygons(filteredYear.map(projection));

    d3.selectAll(".country").remove();

    var country = svg.selectAll(".country")
      .data(filteredYear)
      .enter()
      .append("g")
      .attr("class", "country");

    d3.selectAll(".circle").remove();

    var circle = svg.selectAll('circle')
      .data(filteredYear)
      .enter()
      .append("g")
      .attr("class", "circle");

    // remove os dados que não estão vinculados a nova selecao
    //country.exit().remove();


    ////////////////////////////// Desenha Circulos ///////////////////////////////    

    circle.append("circle")
      .attr('cx', function (d) { return projection([d[0], d[1]])[0]; })
      .attr('cy', function (d) { return projection([d[0], d[1]])[1]; })
      .attr('r', function (d) { return radius(d.total_population); });

    //circle.exit().remove();

    country.append("title")
      .text(function (d) {
        return d.key + "\n" +
          "Refugees: " + d.total_population.toLocaleString() + "\n" +
          "From : " + d.total_origin + " countries";
      })
      .style("font-size", "16px");

    country.append("path")
      .attr("class", "country-arc")
      .attr("d", function (d) { return path(d.arcs); })
      .style("fill", function (d) { return colorScale(d.total_population) * 0.1; });

    country.append("path")
      .data(polygons)
      .attr("class", "voronoi")
      .attr("d", function (d) { return d ? "M" + d.join("L") + "Z" : null; });

    //country.exit().remove();

  }// drawn    
  ///////////////////////////////////////////////////////////////////////////
  //indice para controle do loop por ano
  var year_idx = 0;

  // cria um novo array com um unico valor para cada ano
  var years = [...new Set(yearsList)];

  // ordena os anos em ordem crescente
  years.sort(function (a, b) { return a - b });

  var yearsMenu = [];
  

  var year_interval = setInterval(function () {
    drawn(+years[year_idx]);
    
    yearsMenu.push(years[year_idx]);

    d3.selectAll("div.button").remove();

    
    year_idx++;

    if (year_idx >= years.length) {
      clearInterval(year_interval);
      var x = d3.scaleLinear()
      .domain([years[0], years.slice(-1).pop()])
      .range([0, 1600])
      .clamp(true);

      var slider = d3.select("#year").append("svg")
      .attr("width", 1600)
      .attr("height", 40)
      .append('g')
      .attr("class", "slider")
      .attr("transform", "translate(" + margin + "," + 40 / 2 + ")");

      /*
      var sliderArea = d3.select("#year")
      .style("width", 1600)
      .style("height",500)
      .style("float","left");

      var slider = sliderArea.append("svg")
          .append("g")
          .attr("class", "slider")
          .attr("transform", "translate(" + margin + "," + 500 / 2 + ")");
      */

      slider.append("line")
          .attr("class", "track")
          .attr("x1", x.range()[0])
          .attr("x2", x.range()[1])
          .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
          .attr("class", "track-inset")
          .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
          .attr("class", "track-overlay")
          .call(d3.drag()
              .on("start.interrupt", function() { slider.interrupt(); })
              .on("start drag", function() { update(x.invert(d3.event.x)); }));
      
      slider.insert("g", ".track-overlay")
          .attr("class", "ticks")
          .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(x.ticks(years.length-1))
        .enter().append("text")
          .attr("x", x)
          .attr("text-anchor", "middle")
          .text(function(d) { return d ; });
      
      var handle = slider.insert("circle", ".track-overlay")
          .attr("class", "handle")
          .attr("r", 9);

      function update(value) {
        var d = Math.round(value);
        handle.attr("cx", x(d));
        drawn(d);
      }

     
      

/*

      // SOLUCAO 2
      // slider
      d3.select("#year").append("input")
      .attr("type", "range")
      .attr("min", years[0])
      .attr("max", years.slice(-1).pop())
      .attr("value", years[0])
      .attr("id", "year")
      .text(x);

      //d3.select("body").insert("h2", ":first-child").text(headline + init_year);

      d3.select("#year").on("input", function() {
        drawn(+this.firstChild.value);
      });
*/
      /*
      var buttons = d3.select("#year")
      .selectAll("button")
      .data(years)
      .enter()
      .append("button")
      .text(function(d) {
        return d;
      });

      buttons.on("click", function(d) {
        d3.select(this)
          .transition()
          .duration(500)
          .style("background", "lightBlue")
          .style("color", "white");
        drawn(d);
        });
      */
    }// if(year_idx >= years.length) {
  }, 1000);// var year_interval
}//function ready(error, worldmap, countries) {


function altData(d) {
  d.Year = +d.Year;
  d.Total_Population = +d.Total_Population;
  return d;
}//altData

function formatCountry(d) {
  d[0] = +d.longitude;
  d[1] = +d.latitude;
  return d;
}//formatCountry

//code from: https://stackoverflow.com/questions/39842004/why-use-regular-expressions-to-validate-latitude-and-longitude-in-javascript
function isLatitude(lat) {
  return isFinite(lat) && Math.abs(lat) <= 90;
}

function isLongitude(lng) {
  return isFinite(lng) && Math.abs(lng) <= 180;
}

function agg_country(leaves) {
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

