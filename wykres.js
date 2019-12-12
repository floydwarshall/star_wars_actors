var width = 800;
var namesdata = [];
var genresdata = [];
var names = {};
var genres = {};
var height = 800;

var force = d3.layout.force()
    .charge(function(d){return -d.s*20; })
    .linkDistance(200)
    .size([width, height]);
            
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
                
d3.json("data/graph.json", function(error, graph){
    if (error) throw error;
                
    force
        .nodes(graph.nodes)
        .links(graph.links)
        .start();
                
    var link = svg.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
            .attr("class", "link")
            .style("stroke-width", function(d){return Math.sqrt(d.value);});
                
    var node = svg.selectAll(".node")
        .data(graph.nodes)
        .enter().append("circle")
            .attr("class", "node")
            .attr("r", function(d){return Math.sqrt(d.s)})
            .style("fill", function(d){
                if(d.group == 1)
                    return "#a6a115";
                else
                    return "#5c5c5c";})
                    
            .on("click",function(d, i){
                var p = $("#opis");
                var face = $("#face");
                p.html("<b>" + d.name + "</b><br>");
                
                link.style("stroke", function(d2){
                    if(d2.target == d){
                        p.css("color", "#c1bd5c");
                        p.append(d2.source.name + " - " + d2.value + "<br>");
                        face.css("background-image", "url('" + d.foto + "')");
                        return "white";
                    }
                    
                    else if(d2.source == d){
                        p.css("color", "#bcbcbc");
                        p.append(d2.target.name + " - " + d2.value + "<br>");
                        face.css("background-image", "url('images/death_star.png')");
                        return "white";
                    }
                })
                if(d.group == 1) {
                    drawChart(namesdata, names, genres, d.name, d.group);
                } else {
                    drawChart(genresdata, genres, names, d.name, d.group);
                }

            })
            .call(force.drag);

    node.append("title")
        .text(function(d){return d.name;});  
    
    var text = svg.selectAll(".label")
        .data(graph.nodes)
        .enter().append("text")
        .text(function(d){return d.name;})
        .attr("text-anchor", function(d){
            if(d.group == 2)
                return "start";
            else
                return  "end";
        })
        
        
        
    force.on("tick", function(){
        node.attr("cx", function(d){
                if(d.group == 1)
                    return d.x = Math.min(400, d.x);
                else
                    return d.x = Math.max(600, d.x);
            })
            .attr("cy", function(d, i){
                return Math.min(Math.max(d.y, 0), 800);
            });
        
        text.attr("x", function(d){
                if(d.group == 1)
                    return d.x - 2 * Math.sqrt(d.s) - 10;
                else
                    return d.x + 2 * Math.sqrt(d.s) + 10;
            })
            .attr("y", function(d){return d.y + 3;});
                        
        link.attr("x1", function(d){return d.source.x;})
            .attr("y1", function(d){return d.source.y;})
            .attr("x2", function(d){return d.target.x;})
            .attr("y2", function(d){return d.target.y;});
    });
});


d3.csv("data/df2.csv")
    .row(function(d) { return {name: d.primaryName, year: +d.startYear, genre: d.genre, n: +d.n}; })
    .get(function(error, rows) {
        rows.forEach(function(row) {
            if(!(row.name in names)) {
                names[row.name] = {min: row.year, max: row.year};
            } else {
                names[row.name].min = Math.min(names[row.name].min, row.year);
                names[row.name].max = Math.max(names[row.name].max, row.year);
            }

            if(!(row.genre in genres)) {
                genres[row.genre] = {min: row.year, max: row.year};
            } else {
                genres[row.genre].min = Math.min(genres[row.genre].min, row.year);
                genres[row.genre].max = Math.max(genres[row.genre].max, row.year);
            }

            if(!(row.name in namesdata)) {
                namesdata[row.name] = {};
            }
            if(!(row.genre in namesdata[row.name])) {
                namesdata[row.name][row.genre] = {};
            }
            namesdata[row.name][row.genre][row.year] = row.n;

            if(!(row.genre in genresdata)) {
                genresdata[row.genre] = {};
            }
            if(!(row.name in genresdata[row.genre])) {
                genresdata[row.genre][row.name] = {};
            }
            genresdata[row.genre][row.name][row.year] = row.n;
        });
    });

function range(a, b) {
    var foo = [];
    for (var i = a; i <= b; i++) {
       foo.push(i);
    }
    return foo;
}

function drawChart(data, names, categories, selected, group) {
    var years = range(names[selected].min, names[selected].max);
    var series = [];
    Object.keys(categories).forEach(function(category) {
        if(category in data[selected]) {
            var dt = new Array(years.length).fill(0);
            for(var i = 0; i < years.length; i++) {
                if(years[i] in data[selected][category]) {
                    dt[i] = data[selected][category][years[i]];
                }
            }
            series.push({name: category, data: dt});
        }
    });
    var chart = Highcharts.chart('container', {
        chart: {
            type: 'column',
            backgroundColor: 'transparent'
        },
        title: {
            text: selected,
            style: {
                color: '#fff',
                fontSize: "20px"
            }
        },
        subtitle: {
            text: group == 1 ? 'Liczba filmów, w których grał(a) na przestrzeni lat' : 'Liczba filmów granych przez aktorów na przestrzeni lat',
            style: {
                color: '#fff',
                fontSize: "16px"
            }
        },
        xAxis: {
            categories: years,
            labels: { style: {
                color: '#fff'
            }}
        },
        yAxis: {
            labels: { style: {
                color: '#fff'
            }},
            title: {
                style: {
                    color: '#fff'
                }
            }
        },
        tooltip: {
            headerFormat: '<b>{point.x}</b><br/>',
            pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: false
                }
            }
        },
        series: series

    });
}