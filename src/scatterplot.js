const canvHeight = 600, canvWidth = 800;
const margin = {top: 100, right: 80, bottom: 60, left: 80};
const width = canvWidth - margin.left - margin.right;
const height = canvHeight - margin.top - margin.bottom;

d3.csv("data/persons.csv").then(persons => {

    const svg = d3.select("body").append("svg")
        .attr("width", canvWidth)
        .attr("height", canvHeight)
        .style("border", "1px solid");

    const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("padding", "10px")
        .style("background", "white")
        .style("opacity", 0);


    const chart = svg.append("g")
        .attr("id", "chart-area")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const legendDomain = ["S", "M", "L"];

    const colorScale = d3.scaleOrdinal()
        .range(d3.schemeCategory10);

    createLegend(legendDomain, colorScale);

    const yScale = d3.scaleLinear().rangeRound([height, 0])
        .domain([50, d3.max(_.map(persons, d => parseInt(d.Weight)))]);

    const xScale = d3.scaleLinear().rangeRound([0, width])
        .domain([150, d3.max(_.map(persons, d => parseInt(d.Height)))]);

    const yAxis = d3.axisLeft(yScale);
    const xAxis = d3.axisBottom(xScale);

    chart.append("text")
        .attr("id", "chart-title")
        .attr("x", margin.left)
        .attr("y", 30 - margin.top)
        .attr("dy", "1.5em")  // line height
        .attr("font-family", "sans-serif")
        .attr("font-size", "24px")
        .style("text-anchor", "left")
        .text("Weight vs. Height");

    chart.append("text")
        .attr("id", "y-title")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (height / 2))
        .attr("y", 20 - margin.left)
        .attr("dy", "1em")
        .attr("font-family", "sans-serif")
        .attr("font-size", ".93em")
        .style("text-anchor", "middle")
        .text("Weight");

    chart.append("text")
        .attr("id", "y-title")
        .attr("x", (width / 2))
        .attr("y", height + 25)
        .attr("dy", "1em")
        .attr("font-family", "sans-serif")
        .attr("font-size", ".93em")
        .style("text-anchor", "middle")
        .text("Height");

    chart.append("g")
        .attr("id", "yAxis")
        .call(yAxis);

    chart.append("g")
        .attr("id", "xAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    chart.append("g")
        .attr("id", "dataPoints")
        .selectAll("circle")
        .data(persons)
        .enter().append("circle")
        .attr("id", d => "scatterDot_" + d.Index)
        .attr("class", "scatterDot")
        .attr("r", 0)
        .attr("cx", d => 80)
        .attr("cy", d => 80)
        .attr("fill", (d, i) => colorScale(legendDomain.indexOf(d.ShirtSize)))
        .on("mouseover", d => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);

            tooltip.html(`<b>${d.FirstName} ${d.LastName}</b><br />${d.Height} cm<br />${d.Weight} kg`)
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY + 5) + "px");


        })
        .on("mouseout", d => {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        });

    chart.selectAll(".scatterDot").transition()
        .duration(600)
        .attr("cx", d => xScale(d.Height))
        .attr("cy", d => yScale(d.Weight))
        .attr("r", 5)
        .delay((d, i) => i)
});


function createLegend(legendDomain, colorScale) {
    const legendX = 30;
    const legendY = 30;
    const offset = 5;
    const size = 20;


    d3.select("#chart-area")
        .append("g")
        .attr("id", "legend")
        .selectAll("rect")
        .data(legendDomain)
        .enter().append("rect")
        .attr("x", (d, i) => legendX)
        .attr("y", (d, i) => legendY + (i * (offset + size)))
        .attr("width", size)
        .attr("height", size)
        .attr("fill", (d, i) => colorScale(i));

    d3.select("#legend")
        .selectAll("text")
        .data(legendDomain)
        .enter().append("text")
        .attr("x", (d, i) => legendX + offset + size)
        .attr("y", (d, i) => legendY + (i * (offset + size)))
        .attr("width", size)
        .attr("height", size)
        .attr("alignment-baseline", "before-edge")
        .text((d) => d);

}

