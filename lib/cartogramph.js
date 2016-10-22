function cartogramph(visID,geoData,thematicDataSource,thematicColumn,sequentialDataSource,sequentialColumn,sequentialLabel,mapcolor){


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

    var vis = d3.select(visID).append("svg").attr("width", width).attr("height", height)

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
        .attr("id", "gradient");

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
    var boxGroup = vis.append("g").attr("id","detailbox").attr("transform","translate(10,200)");       
    boxGroup.append("text") 
        .attr("x", 0)
        .attr("y", 40)
        .attr("id","munid")
        .text("Philippines");
      


    var provinces = topojson.feature(geo_data, geo_data.objects.philippines).features;

        //enter thematic data
        d3.csv(thematicDataSource, function(error,csv){
          
            csv.forEach(function(d, i) {
              provinces.forEach(function(e, j) {
                
                  if (d.province === e.properties.PROVINCE.toUpperCase()) {
                      e.pop2015 = +d[thematicColumn];              
                  }
                  if ((e.properties.PROVINCE==="Metropolitan Manila")&&(d.province === e.properties.NAME_2.toUpperCase())){                            
                      e.pop2015 = +d[thematicColumn];   
                  }
              })
              totalpop += parseInt(d[thematicColumn]);
            })

            //enter sequential data
            var counter = 0;
            var sumrate = 0;
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


            //add the population label
            boxGroup.append("text") 
            .attr("x", 0)
            .attr("y", 70)
            .attr("id","populationlabel")
            .text("Population: ");  
            boxGroup.append("text") 
            .attr("x", 0)
            .attr("y", 90)
            .attr("id","population")
            .text(commaformat(totalpop));  

            boxGroup.append("text") 
            .attr("x", 0)
            .attr("y", 120)
            .attr("id","poverty_label")
            .text(sequentialLabel + ": ");  
            boxGroup.append("text") 
            .attr("x", 0)
            .attr("y", 140)
            .attr("id","poverty")
            .text(ave+"%");  


            boxGroup.append("text") 
            .attr("x", 0)
            .attr("y", 200)
            .attr("id","legend_label")
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
            .attr("fill","url(#gradient)");

              //lets make the geographic map
              var philmap = vis.append("g").attr("id","philmap").attr("transform", "translate(0,50)");
              
              var map = philmap.selectAll("path")
                .data(provinces)
                .enter()
                .append("path")
                  .attr("id", function(d){
                    if((d.properties.NAME_1==="Metropolitan Manila")){
                        return d.properties.NAME_2.replace(/ /g,'').replace(/[^A-Za-z0-9_]/g,"").toLowerCase();
                    }
                    else
                        return d.properties.NAME_1.replace(/ /g,'').replace(/[^A-Za-z0-9_]/g,"").toLowerCase();
                  })
                  .attr("class",function(d){
                    if((d.properties.NAME_1==="Laguna Lake")){
                        return "";
                    }
                    else
                        return "province";
                    
                  })
                  .attr("population",function(d){return d.pop2015;})
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
                    //console.log(d[sequentialColumn]);
                    return d[sequentialColumn]+"%";})       
                  .style("fill", function(d) {  
                  if(d[sequentialColumn]==null){
                    return "#ffffff";
                  }
                  else
                    {return color(d[sequentialColumn]);} 
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
                var pop = d.pop2015;

                //compute for the new size and position of the rectangle

                var arw = document.getElementById(getid).getBoundingClientRect().width;
                var arh = document.getElementById(getid).getBoundingClientRect().height;

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
                node.population = d.pop2015;
                node[sequentialColumn] = d[sequentialColumn];

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

        //make the node drawing function
        function drawnodes(nodemapid,nodes,translatex,translatey){
            var nodemap = vis.append("g").attr("id",nodemapid).attr("transform", "translate("+translatex+","+translatey+")");
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
                    return d[sequentialColumn]+"%"; })
                .style("fill", function(d) {                     
                    return color(d[sequentialColumn]); })
                .style("fill-opacity", "0.9");  

                return nodemap;      
        }

        //draw different node sections
        var nmnodemap = drawnodes("nmnodemap",nmnodes,0,-10);
        var smnodemap = drawnodes("smnodemap",smnodes,0,90);
        var mmnodemap = drawnodes("mmnodemap",mmnodes,20,30);
        var cnodemap = drawnodes("cnodemap",cnodes,0,0);
        var cbnodemap = drawnodes("cbnodemap",cbnodes,0,70);
        

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


        //adjust gravity and charge here
        forcelayout(mmnodes,mmnodemap,0.0005,-.6);
        forcelayout(nmnodes,nmnodemap,0,-.5);
        forcelayout(cbnodes,cbnodemap,0.0005,-1);
        forcelayout(cnodes,cnodemap,0.0005,0);
        forcelayout(smnodes,smnodemap,0.001,-1);

        //adjust batanes


        //add hover actiona    
        $('.province').on("mouseenter",munihover).on("mouseleave",hidedetail);
        d3.selectAll("#philmap").classed("hidden",true);
        });

    });   

    }

        //draw buttons

        var mapButton = vis.append("g")
            .attr("id", "map-button")
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
            .attr("id", "cartogram-button")
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
        $('#map-button').on('click',function(){
            if(current != 'map-button'){
                changebutton('map-button');
                rendermap();
            }
        });
        $('#cartogram-button').on('click',function(){
            if(current != 'cartogram-button'){
                changebutton('cartogram-button');
                rendersize();
            }
        });


        function rendermap(e){
            var oneBar = d3.select("#philmap");
            oneBar.classed("hidden", false);      

            oneBar = d3.select("#mmnodemap");
            oneBar.classed("hidden", true);              

            oneBar = d3.select("#nmnodemap");
            oneBar.classed("hidden", true);              

            oneBar = d3.select("#cnodemap");
            oneBar.classed("hidden", true);              

            oneBar = d3.select("#cbnodemap");
            oneBar.classed("hidden", true);              

            oneBar = d3.select("#smnodemap");
            oneBar.classed("hidden", true);  
            changebutton("map-button")
        }

        function rendersize(e){
            var oneBar = d3.select("#philmap");
            oneBar.classed("hidden", true);
            
            oneBar = d3.select("#mmnodemap");
            oneBar.classed("hidden", false);              

            oneBar = d3.select("#nmnodemap");
            oneBar.classed("hidden", false);              

            oneBar = d3.select("#cnodemap");
            oneBar.classed("hidden", false);              

            oneBar = d3.select("#cbnodemap");
            oneBar.classed("hidden", false);              

            oneBar = d3.select("#smnodemap");
            oneBar.classed("hidden", false); 
            changebutton("cartogram-button")             
        }

        function changebutton(button){
            d3.selectAll('#'+current).select('rect').style("fill","#ffffff");
            d3.selectAll('#'+current).select('text').style("fill","#ef4631");
            d3.selectAll('#'+button).select('rect').style("fill","#ef4631");
            d3.selectAll('#'+button).select('text').style("fill","#ffffff");
            current = button;
        }

        function munihover(e){    
            $('#munid').text($(this).attr("province"));   
            $('#population').text(commaformat($(this).attr("population")));
            $('#poverty').text($(this).attr("rate")); 
            $(this).css("fill-opacity",0.5);           
        }

        function hidedetail(e){
            $('#munid').text("Philippines");
            $('#population').text(commaformat(totalpop));
            $('#poverty').text(ave+"%"); 
            $(this).css("fill-opacity",0.9);
        }
    
        return vis;

    }
