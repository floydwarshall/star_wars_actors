var width = 960,
height = 800;

var force = d3.layout.force()
    .charge(function(d){return -d.sajz*50; })
    .linkDistance(200)
    .size([width, height]);
            
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
                
d3.json("data.json", function(error, graph){
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
            .attr("r", function(d){return 2 * Math.sqrt(d.sajz)})
            .style("fill", function(d){
                if(d.group == 1)
                    return "#a6a115";
                else
                    return "#5c5c5c";})
                    
            .on("click",function(d, i){
                var p = document.getElementsByTagName("div")[0];
                var face = document.getElementsByTagName("div")[1];
                p.innerHTML = "<b>" + d.name + "</b>" + "<br>";
                
                link.style("stroke", function(d2){
                    if(d2.source == d){
                        p.style.color = "#c1bd5c";
                        p.innerHTML += d2.target.name + " - " + d2.value + "<br>";
                        face.style.backgroundImage = "url('" + d.foto + "')";
                        return "white";
                    }
                    
                    else if(d2.target == d){
                        p.style.color = "#bcbcbc";
                        p.innerHTML += d2.source.name + " - " + d2.value + "<br>";
                        face.style.backgroundImage = "url('obrazy/death_star.png')";
                        return "white";
                    }
                })
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
                return d.y;
            });
        
        text.attr("x", function(d){
                if(d.group == 1)
                    return d.x - Math.sqrt(d.sajz);
                else
                    return d.x + Math.sqrt(d.sajz);
            })
            .attr("y", function(d){return d.y;});
                        
        link.attr("x1", function(d){return d.source.x;})
            .attr("y1", function(d){return d.source.y;})
            .attr("x2", function(d){return d.target.x;})
            .attr("y2", function(d){return d.target.y;});
    });
});
