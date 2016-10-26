//defaults

var GEODATA = "data/philippines-topo2.json"; //link to the map json source file
var THEMATIC = "data/philpopulation2015.csv"; //link to population data
var THEMATICCOL = "pop2015"; //thematic variable
var THEMATICLAB = "Population"; //label

//makes a plain cartogram
function simpleCartogram(visID,mapcolor){    
    var c = new makecartogram(visID,GEODATA,THEMATIC,THEMATICCOL,THEMATICLAB,"","","",mapcolor);
}

function thematicCartogram(visID,thematicDataSource,thematicColumn,thematicLabel,mapcolor){
    makecartogram(visID,GEODATA,thematicDataSource,thematicColumn,thematicLabel,"","","",mapcolor);

}

function sequentialCartogram(visID,sequentialDataSource,sequentialColumn,sequentialLabel,mapcolor){
    makecartogram(visID,GEODATA,THEMATIC,THEMATICCOL,THEMATICLAB,sequentialDataSource,sequentialColumn,sequentialLabel,mapcolor);
}

function makecartogram(visID,geoData,thematicDataSource,thematicColumn,thematicLabel,sequentialDataSource,sequentialColumn,sequentialLabel,mapcolor){

    //toggle
    var current = 'cartogram-button';

    //total population
    var totalpop = 0;

    //average of sequential variable
    var ave = 0;

    //format
    var commaformat = d3.format(",");

    //color
    var color = d3.scale.linear()
    .domain([0, 100])
    .range(["#fff8ef",mapcolor]);

    //draw vis
    var height = 700;
    var width  = 600;

    var vis = d3.select(visID).append("svg").attr("width", width).attr("height", height).attr("cartogram","true");

    var scale = 2200,
        translateX = -4400,
        translateY = 820;

    var projection = d3.geo.mercator()
        .scale(scale)
        .translate( [translateX, translateY]);

    var nodes = [];
    var mmnodes = [];  //metromanila nodes
    var cnodes = []; //cagayan region
    var cbnodes = []; //calabarzon region
    var nmnodes = [];  //north of manila
    var smnodes = [];  //south of manila

    var root = {};

        root.radius = 0;
        root.fixed = true; 

    var rad = d3.scale.linear().domain([1,5000000]).range([1,20]); 

    var path = d3.geo.path().projection(projection);
        
    //gradient
    var gradient = vis.append("defs")
      .append("linearGradient")
        .attr("id", visID.replace(/#/g,'')+"gradient");        

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#fff8ef")
        .attr("stop-opacity", 1);

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", mapcolor)
        .attr("stop-opacity", .9);

    //draw map
    d3.json(geoData, draw);
    function draw(geo_data) {        
        "use strict";
    
        //add the detail box
        var boxGroup = vis.append("g").attr("transform","translate(10,200)");       
        boxGroup.append("text") 
            .attr("x", 0)
            .attr("y", 40)
            .attr("class","munid")
            .text("Philippines");
      
        var provinces = topojson.feature(geo_data, geo_data.objects.philippines).features;

        //enter thematic data
        d3.csv(thematicDataSource, function(error,csv){
          
            csv.forEach(function(d, i) {
                provinces.forEach(function(e, j) {
                
                    if (d.province === e.properties.PROVINCE.toUpperCase()) {
                        e[thematicColumn] = +d[thematicColumn];              
                    }
                    if ((e.properties.PROVINCE==="Metropolitan Manila")&&(d.province === e.properties.NAME_2.toUpperCase())){                            
                        e[thematicColumn] = +d[thematicColumn];   
                    }

                })

            totalpop += parseInt(d[thematicColumn]);
            
            })

            //enter sequential data
            var counter = 0;
            var sumrate = 0;

            //add the population label
            boxGroup.append("text") 
            .attr("x", 0)
            .attr("y", 70)
            .attr("class","populationlabel")
            .text(thematicLabel+": ");  
            boxGroup.append("text") 
            .attr("x", 0)
            .attr("y", 90)
            .attr("class","population")
            .text(commaformat(totalpop));            

            if(sequentialDataSource!=""){
                

                d3.csv(sequentialDataSource, function(error,csv){
                    csv.forEach(function(f, g) {
                        provinces.forEach(function(e, j) {
    
                            if (f.province === e.properties.PROVINCE.toUpperCase()) {
                              e[sequentialColumn] = +f[sequentialColumn];             
                            }
                            if ((e.properties.PROVINCE==="Metropolitan Manila")&&(f.province === e.properties.NAME_2.toUpperCase())){                            
                              e[sequentialColumn] = +f[sequentialColumn]; 
                            }
                        });
                        counter++;
                        sumrate += +f[sequentialColumn];
                    });
                    ave = (sumrate/counter).toFixed(2);

                    //rest of the code should go here
                    drawGeographicMap(vis,visID,provinces,thematicColumn,path,totalpop,sequentialDataSource,sequentialColumn,mapcolor,color);


                });

  
                //add sequential labels
                boxGroup.append("text") 
                .attr("x", 0)
                .attr("y", 120)
                .attr("class","poverty_label")
                .text(sequentialLabel + ": ");  
                boxGroup.append("text") 
                .attr("x", 0)
                .attr("y", 140)
                .attr("class","poverty")
                .text(ave+"%");  
                
                //add legend
                boxGroup.append("text") 
                .attr("x", 0)
                .attr("y", 200)
                .attr("class","legend_label")
                .text("Legend");  
                boxGroup.append("text") 
                .attr("x", 0)
                .attr("y", 230)
                .attr("class","tiny")
                .text("0");  
                boxGroup.append("text") 
                .attr("x", 100)
                .attr("y", 230)
                .attr("class","tiny")
                .text("100");
                boxGroup.append("rect")  
                .attr("x", 0)
                .attr("y", 205)
                .attr("width", 120)
                .attr("height", 10)
                .attr("fill","url("+visID+"gradient)");

            }

            //lets make the geographic map            
            else{
                drawGeographicMap(vis,visID,provinces,thematicColumn,path,totalpop,sequentialDataSource,sequentialColumn,mapcolor,color);
            }
            function drawGeographicMap(vis,visID,provinces,thematicColumn,path,totalpop,sequentialDataSource,sequentialColumn,mapcolor,color){

                var philmap = vis.append("g").attr("class","philmap").attr("transform", "translate(0,50)");
                          
                var map = philmap.selectAll("path")
                    .data(provinces)
                    .enter()
                    .append("path")
                      .attr("class", function(d){
                        if((d.properties.NAME_1==="Metropolitan Manila")){
                            return d.properties.NAME_2.replace(/ /g,'').replace(/[^A-Za-z0-9_]/g,"").toLowerCase()+" province";
                        }
                        else
                            return d.properties.NAME_1.replace(/ /g,'').replace(/[^A-Za-z0-9_]/g,"").toLowerCase()+" province";
                      })
                      .attr("population",function(d){return d[thematicColumn];})
                      .attr("province", function(d){
                        if((d.properties.NAME_1==="Metropolitan Manila")){
                            return d.properties.NAME_2;
                        }
                        else
                            return d.properties.NAME_1;
                      })
                      .attr("d", path)              
                      .attr("r", 10)       
                      .attr("rate",function(d){
                        if(sequentialDataSource!=""){
                            return d[sequentialColumn]+"%";
                        }
                        else{
                            return 0;
                        }
                        })       
                      .style("fill", function(d) {  
                        if(sequentialDataSource!=""){    
                          if(d[sequentialColumn]==null){
                            return "#ffffff";
                          }
                          else
                            {return color(d[sequentialColumn]);} 
                        
                        }
                        else if(d.properties.NAME_1!="Laguna Lake"){
                            return mapcolor;
                        }
                        else{
                            return '#ffffff';
                        }
                    })
                      .style("stroke", "#666")
                      .style("stroke-width", 0.5)
                      .style("fill-opacity", "0.9");   

                //lets make the nodes
                var SIZER = 15;
                provinces.forEach(function(d, i) {  
                    if(d.properties.NAME_1!="Laguna Lake"){   
                        var getid = "";
                        if((d.properties.NAME_1==="Metropolitan Manila")){
                            getid = d.properties.NAME_2.replace(/ /g,'').replace(/[^A-Za-z0-9_]/g,"").toLowerCase();
                        }
                        else
                            getid = d.properties.NAME_1.replace(/ /g,'').replace(/[^A-Za-z0-9_]/g,"").toLowerCase();   
                        
                        var node = {};
                        
                        var area = 0;    
                        var pop = d[thematicColumn];

                        var vid = visID.replace(/#/g,'');

                        //compute for the new size and position of the rectangle
                        
                        var arw = document.getElementById(vid).getElementsByClassName(getid)[0].getBoundingClientRect().width;
                        var arh = document.getElementById(vid).getElementsByClassName(getid)[0].getBoundingClientRect().height;

                        var xratio = (arw/arh).toFixed(2);
                        area = (pop/totalpop*100); 

                        var rectsizer = Math.sqrt(area/xratio);

                        var xwidth = (xratio * rectsizer)*SIZER;
                        var yheight = rectsizer*SIZER;

                        var centerx = path.centroid(d)[0];
                        var centery = path.centroid(d)[1];

                        var startx = centerx - (xwidth/2);
                        var starty = centery - (yheight/2);

                        node.width = xwidth;
                        node.height = yheight;
                        node.x = startx;
                        node.y = starty;
                        node.class = "";
                        node.population = d[thematicColumn];
                        if(sequentialDataSource!=""){
                            node[sequentialColumn] = d[sequentialColumn];
                        }

                        if((d.properties.NAME_1==="Metropolitan Manila")){
                            node.province = d.properties.NAME_2;                
                            node.class = "metromanila";
                            mmnodes.push(node);
                        }
                        else{
                            node.province = d.properties.NAME_1;
                            if((d.properties.REGION==="Cagayan Valley (Region II)")){
                                node.class = "cagayan";
                                cnodes.push(node);
                            }
                            else if((d.properties.REGION==="CALABARZON (Region IV-A)")){
                                node.class = "calabarzon";                    
                                cbnodes.push(node);
                            }
                            else if((d.properties.REGION==="Ilocos Region (Region I)")
                                ||(d.properties.REGION==="Cordillera Administrative Region (CAR)")
                                ||(d.properties.REGION==="Central Luzon (Region III)")
                                ){
                                node.class = "northmanila";
                                nmnodes.push(node);
                            }
                            else{
                                node.class = "southmanila";
                                smnodes.push(node);
                            }
                        }
                                    
                    }
                });        

                //draw different node sections
                var nmnodemap = drawnodes(vis,"nmnodemap",nmnodes,0,-10,sequentialDataSource,sequentialColumn,mapcolor,color);
                var smnodemap = drawnodes(vis,"smnodemap",smnodes,0,90,sequentialDataSource,sequentialColumn,mapcolor,color);
                var mmnodemap = drawnodes(vis,"mmnodemap",mmnodes,140,-40,sequentialDataSource,sequentialColumn,mapcolor,color);
                var cnodemap = drawnodes(vis,"cnodemap",cnodes,0,0,sequentialDataSource,sequentialColumn,mapcolor,color);
                var cbnodemap = drawnodes(vis,"cbnodemap",cbnodes,0,70,sequentialDataSource,sequentialColumn,mapcolor,color);

                //adjust gravity and charge here
                forcelayout(mmnodes,mmnodemap,0.01,-.6);
                forcelayout(nmnodes,nmnodemap,0,-.5);
                forcelayout(cbnodes,cbnodemap,0.0005,-1);
                forcelayout(cnodes,cnodemap,0.0005,0.2);
                forcelayout(smnodes,smnodemap,0.001,-1);

                //add hover action    
                $(visID+' .province').on("mouseenter",munihover).on("mouseleave",hidedetail);
                d3.selectAll(visID+" .philmap").classed("hidden",true);

            }




            //make the node drawing function
            function drawnodes(vis,nodemapid,nodes,translatex,translatey,sequentialDataSource,sequentialColumn,mapcolor,color){
                var nodemap = vis.append("g").attr("class",nodemapid).attr("transform", "translate("+translatex+","+translatey+")");
                nodemap.selectAll("rect")
                    .data(nodes)
                  .enter().append("rect")
                    .attr("x", function(d) { 
  
                        if(d.x!=null)
                            {return d.x; }
                        else{
                            return 0;
                        }})
                    .attr("y", function(d) { 
                        if(d.y!=null)
                            {return d.y; }
                        else{
                            return 0;
                        }})
                    .attr("width", function(d) { 
                        if(d.width!=null)
                            {return d.width; }
                        else{
                            return 0;
                        }})
                    .attr("height", function(d) { 
                        if(d.height!=null)
                            {return d.height; }
                        else{
                            return 0;
                        }})
                    .attr("province", function(d) { return d.province; })
                    .attr("class", function(d) { return "province " + d.class; })
                    .attr("population", function(d) {                     
                        return d.population; })
                    .attr("rate", function(d) {    
                    if(sequentialDataSource!=""){            
                        return d[sequentialColumn]+"%"; 
                    }
                    else{
                        return 0;
                    }
                    })
                    .style("fill", function(d) {       
                    if(sequentialDataSource!=""){              
                        return color(d[sequentialColumn]); 
                    }
                    else{
                        return mapcolor;
                    }
                })
                    .style("fill-opacity", "0.9");  

                    return nodemap;      
            }


            //make the force function
            function forcelayout(nodes,nodemap,gravity,charge){
                var radius = 0;
                var force = d3.layout.force()
                    .gravity(gravity)
                    .charge(charge)
                    .nodes(nodes)
                    .size([50, height]);

                force.start();
                force.on("tick", function(e) {
                  var q = d3.geom.quadtree(nodes),
                      i = 0,
                      n = nodes.length;

                  while (++i < n) q.visit(collide(nodes[i]));

                  nodemap.selectAll("rect")
                      .attr("x", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
                      .attr("y", function(d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });
                });
            }

            //additional functions - thank you Eric Dobbs
            var overlap = function(a, b) {
                var ref, ref1, ref2, ref3;
                return ((a.x < (ref = b.x)) && (ref < a.x2) && (a.y < (ref1 = b.y)) && (ref1 < a.y2)) || 
                ((a.x < (ref2 = b.x2)) && (ref2 < a.x2) && (a.y < (ref3 = b.y2)) && (ref3 < a.y2));
            };

            function collide(node) {
                var nx1, nx2, ny1, ny2, padding;
                padding = 100;
                nx1 = node.x - padding;
                nx2 = node.x2 + padding;
                ny1 = node.y - padding;
                ny2 = node.y2 + padding;
                return function(quad, x1, y1, x2, y2) {
                var dx, dy;
                if (quad.point && (quad.point !== node)) {
                  if (overlap(node, quad.point)) {
                    dx = Math.min(node.x2 - quad.point.x, quad.point.x2 - node.x) / 2;
                    node.x -= dx;
                    quad.point.x += dx;
                    dy = Math.min(node.y2 - quad.point.y, quad.point.y2 - node.y) / 2;
                    node.y -= dy;
                    quad.point.y += dy;
                  }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                };
            };

    });


    //draw buttons

    var mapButton = vis.append("g")
        .attr("class", "map-button")
        .attr("transform","translate(10,5)");
    mapButton.append("rect") 
        .attr("x", 0)
        .attr("y", 0)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("width", 60)
        .attr("height", 30)
        .style('fill',"#fff")
        .style("stroke-width", 2 )
        .style("stroke", '#ef4631' );
    mapButton.append("text") 
        .attr("x", 10)
        .attr("y", 20)        
        .style("fill", '#ef4631' )
        .text('Map');   


    var cartogramButton = vis.append("g")
        .attr("class", "cartogram-button")
        .attr("transform","translate(80,5)");
    cartogramButton.append("rect") 
        .attr("x", 0)
        .attr("y", 0)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("width", 100)
        .attr("height", 30)
        .style('fill',"#ef4631")
        .style("stroke-width", 2 )
        .style("stroke", '#ef4631' );
    cartogramButton.append("text") 
        .attr("x", 10)
        .attr("y", 20)        
        .style("fill", '#fff' )
        .text('Cartogram');         


    //add actions
    $(visID+' .map-button').on('click',function(){    

        changebutton('map-button','cartogram-button',visID);            
        rendermap(visID);
    });
    $(visID+' .cartogram-button').on('click',function(){

        changebutton('cartogram-button','map-button',visID);
        rendersize(visID);
    });


    function rendermap(visID){

        var oneBar = d3.selectAll(visID+" .philmap");
        oneBar.classed("hidden", false);      

        oneBar = d3.selectAll(visID+" .mmnodemap");
        oneBar.classed("hidden", true);              

        oneBar = d3.selectAll(visID+" .nmnodemap");
        oneBar.classed("hidden", true);              

        oneBar = d3.selectAll(visID+" .cnodemap");
        oneBar.classed("hidden", true);              

        oneBar = d3.selectAll(visID+" .cbnodemap");
        oneBar.classed("hidden", true);              

        oneBar = d3.selectAll(visID+" .smnodemap");
        oneBar.classed("hidden", true);  
        
    }

    function rendersize(visID){
        var oneBar = d3.selectAll(visID+" .philmap");
        oneBar.classed("hidden", true);
        
        oneBar = d3.selectAll(visID+" .mmnodemap");
        oneBar.classed("hidden", false);              

        oneBar = d3.selectAll(visID+" .nmnodemap");
        oneBar.classed("hidden", false);              

        oneBar = d3.selectAll(visID+" .cnodemap");
        oneBar.classed("hidden", false);              

        oneBar = d3.selectAll(visID+" .cbnodemap");
        oneBar.classed("hidden", false);              

        oneBar = d3.selectAll(visID+" .smnodemap");
        oneBar.classed("hidden", false); 
                  
    }

    function changebutton(button,current,visID){        
        d3.selectAll(visID+" ."+current).select('rect').style("fill","#ffffff");
        d3.selectAll(visID+" ."+current).select('text').style("fill","#ef4631");
        d3.selectAll(visID+" ."+button).select('rect').style("fill","#ef4631");
        d3.selectAll(visID+" ."+button).select('text').style("fill","#ffffff");
    }

    function munihover(e){    
        $(visID+' .munid').text($(this).attr("province"));   
        $(visID+' .population').text(commaformat($(this).attr("population")));
        if(sequentialDataSource!=""){
        $(visID+' .poverty').text($(this).attr("rate")); }
        $(this).css("fill-opacity",0.5);           
    }

    function hidedetail(e){
        $(visID+' .munid').text("Philippines");
        $(visID+' .population').text(commaformat(totalpop));
        if(sequentialDataSource!=""){
        $(visID+' .poverty').text(ave+"%"); }
        $(this).css("fill-opacity",0.9);
    }

    return vis;

    }
}


