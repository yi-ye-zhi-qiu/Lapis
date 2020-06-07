<script>

function drawChart(data) {

  console.log(data);

  var margin = {top: 4, right: 10, bottom: 50, left: 30};
  var width = 1000 - margin.left - margin.right;
  var height = 600
  var duration = 450
  
  //Puts the svg element in the div specificed in the index.html as id="my_dataviz"
  var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width+margin.left+margin.right)
    .attr("height", height+margin.bottom+margin.top)
 
 
 //Standard stuff adding the g element
 var g = svg.append("g")
   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
 
 
 //This is where we get our list of "a, b, c" whatever from, they are the keys.
 var key = [];
 
 for(var i=0; i < d3.keys(data).length; i++){
   var joinin = d3.keys(data[i]).filter(d => d != "orchard")
   var key = key.concat(joinin)
 }

//What we will actually display is the key stuff sorted
 var keys = d3.set(key).values().sort(d3.ascending)


// You can use just var color = d3.scaleOrdinal.range(d3.schemeSpectral[keys.length]) if you want to use pre-made color schemes. I made my own little pastel rainbow.
 var colorrange = ["#ffffcc", "#ffeecc", "#ffddcc", "#ffcccc", "#ffbbcc", "#ffaacc", "#ffaaff", "#ffbbff", "#ffccff", "#ffddff", "#ccaaff", "#ccbbff", "#ccccff", "#ccddff", "#cceeff", "#ccffff", "#cceeee", "#ccffee", "#ccffdd", "#ccffcc"]
// OPTIONAL: Adding in some darker blues and greens at the start of the pastel rainbow.
// for (var i=0; i<20; i++) {colorrange.push(d3.rgb(colorrange[i]).darker(0.3))}
// var colorrange = colorrange.reverse();
 
 // The actual color variable
 var color = d3.scaleOrdinal()
   .range(colorrange)
   
 var x0 = d3.scaleBand()
   .range([0, width-100], 0);
 x0.domain((data.map(function(d) { return d. orchard; })));
 
 svg.append("g")
   .attr("transform", `translate(22.5, ${height+25})`)
   .call(d3.axisBottom(x0).tickSizeOuter(0))
   
 var x1 = d3.scaleBand()
   .padding(0.03)
   x1.domain(keys)
   .range([0, x0.bandwidth()-10]);
   
 var y = d3.scaleLinear()
   .range([height, 0]);
   
 y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(orchard) { return d[orchard]})})]);
 
 var xStack = d3.scaleBand()
   .range([0, width-100])
   .align(0.02)
   .padding(0.08)
    xStack.domain(data.map(function(d) { return d.orchard; }));
    
    var total = [];
      data.forEach(function(d) {
        total.push(d3.sum(keys, function(orchard){return d[orchard];}))
      })
      
    var mostRecentTotal = total[total.length-1];
    
    document.getElementById('mostRecent').innerHTML = mostRecentTotal;
    
    var yStack = d3.scaleLinear()
      .range([height, 0])
    yStack.domain([0, d3.max(total)]);
    
    var y_axis = d3.axisLeft()
      .scale(yStack);
      
    svg.append("g")
      .attr("transform", "translate(20, 25)")
      .call(y_axis);
      
    var mouseover = function(d) {
    
      var subgroupName = d3.select(this.parentNode).datum().key;

          d3.selectAll(".myRect").style("opacity", 0.1)
          d3.selectAll(".myLeg").style("opacity", 0.1)
          d3.selectAll("."+subgroupName)
            .style("opacity", 1)
    
    }
    
    var mouseoverLegend = function(d) {
      
      var subgroupName = d3.select(this.parentNode).datum();
          d3.selectAll(".myRect").style("opacity", 0.1)
          d3.selectAll(".myLeg").style("opacity", 0.1)
          d3.selectAll("."+subgroupName)
            .style("opacity", 1)
         
    }
    
    var mouseleave = function(d) {
    
      d3.selectAll("g")
        .style("opacity", 1)
       d3.selectAll(".myLeg")
         .style("opacity", 1)   
    
    }
    
    var mouseleaveLegend = function(d) {
    
      d3.selectAll("g")
        .style("opacity", 1)
      d3.selectAll(".myLeg")
        .style("opacity", 1)
    
    }
    
    var grouped = g.append("g")
      .selectAll("g")
      .data(d3.stack().keys(keys)(data))
      .enter()
      .append("g")
        .attr("fill", function(d) { return color(d.key) })
        .attr("class", function(d){ return "myRect " + d.key });
    
    var rect = grouped.selectAll("rect")
      .data(function(d) { return d; })
      .enter().append("rect")
        .attr("x", function(d) { return xStack(d.data.orchard);})
        .attr("y", function(d) { return 20.3 + yStack(d[1]);})
        .attr("height", function(d) { return yStack(d[0]) - yStack(d[1]);})
        .attr("width", xStack.bandwidth())
     .on("mouseover", mouseover)
     .on("mouseleave", mouseleave)
    
    grouped.selectAll("text")
      .data(function(d) { return d; })
      .enter().append("text")
      .attr("x", function(d) { return xStack(d.data.orchard) + (xStack.bandwidth() / 2.1);})
      .attr("y", d => yStack(d[1]))
      .transition()
      .duration(900)
      .attr("y", function(d, i) { return 12 + yStack([total[i]])})
      .attr("dy", ".35em")
      .text(function(d, i) { return total[i]})
      .attr("font-size", "12px")
      
    d3.selectAll("input")
      .on("change", changed);
      
    function changed() {
      if (this.value === "grouped") goGroup();
      else if(this.value === "stacked") goStacked();
      else goWaterfall();
    }
    
    function goGroup() {
      rect.transition()
        .duration(duration)
        .delay(function(d, i){console.log(i) ; return(i*25)})
        .attr("x", function(d, i) {
          return x0(d.data.orchard) + x1(this.parentNode.__data__.key);
        })
        //By default, the below has a little bit more overlap with grouped bars. Get rid of the "+15" below to make it more standard.
        .attr("width", x1.bandwidth()+15)
        .transition()
          .duration(duration)
          .delay(function(d, i){console.log(i) ; return(i*25)})
          .attr("y", d => 20.3 + yStack(d[1] - d[0]))
          .attr("height", d => yStack(0) - yStack(d[1] - d[0]))
          
     grouped.selectAll("text").remove()
    
    }
    
    function goStacked(){
      rect.transition()
        .duration(duration)
        .delay(function(d, i) { console.log(i) ; return(i*25)})
        .attr("y", d => 20.3 + yStack(d[1]))
        .attr("height", d => yStack(d[0]) - yStack(d[1]))
     .transition()
       .duration(duration)
       .delay(function(d, i) { console.log(i) ; return(i*25)})
       .attr("x", function(d) { return xStack(d.data.orchard)})
       .attr("width", xStack.bandwidth())
       
     grouped.selectAll("text")
       .data(function(d) { return d; })
       .enter().append("text")
       .attr("x", function(d) {return xStack(d.data.orchard) + (xStack.bandwidth() /2.1);})
       .attr("y", d => yStack(d[1]))
       .transition()
       .duration(900)
       .attr("y", function(d, i) { return 12 + yStack([total[i]])})
       .attr("dy", ".35em")
       .text(function(d, i) { return total[i]})
       .attr("font-size", "12px")
      
    }
    
    function goWaterfall(){ 
      rect.transition()
        .duration(duration)
        .delay(function(d, i) { console.log(i) ; return(i*25)})
        .attr("y", d => 20.3 + yStack(d[1]))
        .attr("height", d => yStack(d[0]) - yStack(d[1]))
       .transition()
         .duration(duration)
         .delay(function(d, i) { console.log(i) ; return(i*25)})
         .attr("x", function(d, i){
           return x0(d.data.orchard) + x1(this.parentNode.__data__.key);
         })
         .attr("width", x1.bandwidth()+10)
         
       grouped.selectAll("text").remove()
    
    }
    
    var legend = svg.selectAll(".legend")
      .data(color.domain())
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d,i){ 
        return "translate(400," + i*10 + ")";
      })
    
    legend.append("path")
      .style("fill", function(d) { return color(d); })
      .attr("class", function(d) { return "myLeg " + d })
      .attr("d", d3.symbol().type(d3.symbolSquare).size(120))
      .attr("transform", function(d) { 
        return "translate (" + width/2 + "," + 10 + ")"
      })
      .on("mouseover", mouseoverLegend)
      .on("mouseleave", mouseleaveLegend)
     
    legend.append("text")
      .style("fill", function(d) { return color(d); })
      .attr("class", function(d) { return "myLeg " + d })
      .attr("x", width/2 + 15)
      .attr("y", 10)
      .attr("dy", ".30em")
      .text(function(d) { return d; })
      .on("mouseover", mouseoverLegend)
      .on("mouseleave", mouseleaveLegend)
      

}
</script>
