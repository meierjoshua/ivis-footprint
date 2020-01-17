const projection = d3.geoNaturalEarth1().scale(300).translate([900, 540]);
const pathGenerator = d3.geoPath().projection(projection);
const svg = d3.select('svg');
//const colorScaleBalance = d3.scaleLinear().domain([-8, -7, -0.00001, 0.00001, 7, 8]).range(['#f72525', '#f72525', '#ffB6B6', '#acc9ab', '#0d870b', '#0d870b']);
const colorScaleBalance = d3.scaleLinear().domain([-8, -7, -0.00001, 0.00001, 7, 8]).range(['#f72525', '#f72525', '#ffB6B6', '#E0FFFF', '#008B8B', '#008B8B']);
const colorScaleFootprintPerPerson = d3.scaleLinear().domain([0, 7, 8]).range(['#ffD6D6', '#f90505', '#f90505']);
const colorScaleBioCapacityPerPerson = d3.scaleLinear().domain([0, 7, 8]).range(['#E0FFFF', '#008B8B', '#008B8B']);
const tooltip = d3.select(".tooltip");
let colorMode = "balanceBtn";
const defs = svg.append("defs");
const linearGradient = defs.append("linearGradient").attr("x2", "0%").attr("y2", "100%").attr("id", "linearGradient");
let year = "2016";

svg.append('path')
    .attr('class', 'sphere')
    .attr('d', pathGenerator({type: 'Sphere'}));

d3.selectAll(".changeWorldDisplayInfoBtn").on("click", function () {
    colorMode = d3.select(this).attr("id");

    d3.select('.changeWorldDisplayInfoBtn.selected').node().classList.remove("selected");
    d3.select(`#${colorMode}`).node().classList.add("selected");

    d3.selectAll(".country")
        .transition()
        .duration(400)
        .style('fill', d => getCountryColor(d));

    updateColorLegend();
});

d3.selectAll(".previousYearBtn").on("click", function () {
    let newYear = parseInt(d3.select(".selectedYear").text()) - 1;
    toggleYearChangeButtons(newYear);

    d3.select(".selectedYear").text(newYear);
    year = newYear.toString();
    d3.selectAll(".country")
        .transition()
        .duration(400)
        .style('fill', d => getCountryColor(d));
});

d3.selectAll(".nextYearBtn").on("click", function () {
    let newYear = parseInt(d3.select(".selectedYear").text()) + 1;
    toggleYearChangeButtons(newYear);

    d3.select(".selectedYear").text(newYear);
    year = newYear.toString();
    d3.selectAll(".country")
        .transition()
        .duration(400)
        .style('fill', d => getCountryColor(d));
});


Promise.all([d3.json('data/world.geojson')])
    .then(data => {
        let world = data[0];

        svg.selectAll('#bla').data(world.features)
            .enter().append('path')
            .attr('class', 'country')
            .attr('id', d => d.id)
            .attr('name', d => d.properties.name)
            .attr('d', pathGenerator)
            .style('fill', d => getCountryColor(d))
            .on("mouseout", d => {
                d3.select(`#${d.id}`)
                    .style('fill', d => getCountryColor(d));
                tooltip
                    .style("opacity", 0)
                    .style("display", "none");
            })
            .on("mouseover", d => {
                if ((d.properties.nfa === undefined || d.properties.nfa.filter(x => x.Year === "2016").length === 0)) {
                    return;
                }

                d3.select(`#${d.id}`).style("fill", "gray");
                tooltip.transition()
                    .delay(100)
                    .duration(200)
                    .style("opacity", .9);

                tooltip.selectAll(".populationGraph").remove();
                tooltip.selectAll(".footprintBioCapacityGraph").remove();
                tooltip.selectAll(".populationDevelopmentTitle").remove();
                tooltip.selectAll(".balanceDevelopmentTitle").remove();

                tooltip
                    .style("left", (d3.event.pageX < 900 ? (d3.event.pageX + 5 + "px") : ((d3.event.pageX - 340) + "px")))
                    .style("top", (170 + "px"))
                    .style("display", "block");


                tooltip.select(".title").text(d.properties.name);
                tooltip.select(".capital").text(d.properties.capital);
                tooltip.select(".population").text(parseInt(d.properties.population.filter(x => x.year === "2019")[0].population / 1000).toLocaleString('de-CH'));
                tooltip.select(".surfaceArea").text(d.properties.area.toLocaleString('de-CH'));
                tooltip.select(".flag").attr("src", d.properties.flag_base64);


                let worlds = (d.properties.nfa.filter(x => x.Year === "2016")[0].EFConsPerCap / 1.7).toFixed(2);
                tooltip.select(".worldsNeededInput").text(worlds);

                for (let i = 0; i < 9; ++i) {
                    let clip;

                    if (worlds < 0) {
                        clip = "inset(0px 30px 0px 0px)";
                    } else if (worlds >= 1) {
                        clip = "inset(0px 0px 0px 0px)";
                        worlds -= 1;
                        console.log("fullw orld");
                    } else {
                        clip = `inset(0px ${(1 - worlds) * 30}px 0px 0px)`;
                        worlds -= 1;
                    }


                    tooltip.select(`.worldImage:nth-child(${i + 1})`)
                        .style("clip-path", clip);
                }

                tooltip.append("div").attr("class", "populationDevelopmentTitle").text("Development of Population (millions)");

                const population = d.properties.population.filter(x => x.year < 2019);
                let populationDevelopmentSvg = tooltip.append("svg")
                    .attr("class", "populationGraph")
                    .append("g")
                    .attr("id", "populationGraph")
                    .attr("transform", `translate(${40},${10})`);

                let xScale = d3.scaleLinear()
                    .domain([d3.min(_.map(population, c => parseInt(c.year))), d3.max(_.map(population, c => parseInt(c.year)))])
                    .range([0, 250]);
                let xAxis = d3.axisBottom(xScale).ticks(8).tickFormat(d3.format("d"));

                let yScale = d3.scaleLinear()
                    .domain([0, d3.max(_.map(population, c => parseInt(c.population) / 1000))])
                    .range([100, 0]);
                let yAxis = d3.axisLeft(yScale).ticks(6);

                populationDevelopmentSvg.append("g")
                    .attr("id", "xAxis")
                    .attr("transform", "translate(0," + 100 + ")")
                    .call(xAxis);

                populationDevelopmentSvg.append("g")
                    .attr("id", "yAxis")
                    .call(yAxis);

                populationDevelopmentSvg.append("path")
                    .datum(population)
                    .attr("fill", "none")
                    .attr("stroke", "steelblue")
                    .attr("stroke-width", 1.5)
                    .attr("d", d3.line()
                        .x(d => xScale(d.year))
                        .y(d => yScale(d.population / 1000))
                    );

                appendBioCapacityFootprintGraphToTooltip(tooltip, "BiocapTotGHA", "EFConsTotGHA", "Ecological Footprint vs Biocapacity - gha (millions)", d, xAxis, xScale, 1000000);
                appendBioCapacityFootprintGraphToTooltip(tooltip, "BiocapPerCap", "EFConsPerCap", "Ecological Footprint vs Biocapacity - gha (per person)", d, xAxis, xScale, 1);


            });

        d3.select("#zoomInBtn").on("click", () => mapZoom.scaleBy(svg.transition().duration(500), 1.5));
        d3.select("#zoomOutBtn").on("click", () => mapZoom.scaleBy(svg.transition().duration(500), 0.666));

        let mapZoom = d3.zoom()
            .scaleExtent([1, 6])
            .translateExtent([[0, 0], [svg.node().getBoundingClientRect().width, svg.node().getBoundingClientRect().height]])
            .on("zoom", () => svg.selectAll(".country").attr("transform", d3.event.transform));

        svg.call(mapZoom);

        updateColorLegend();
    });

function appendBioCapacityFootprintGraphToTooltip(tooltip, biocapacityDataString, footprintDataString, title, d, xAxis, xScale, divisor) {
    debugger;
    let footprintBioCapacity = d.properties.nfa;
    let efConsTotGHA = _.map(footprintBioCapacity, c => parseFloat(c[footprintDataString]));
    let biocapTotGHA = _.map(footprintBioCapacity, c => parseFloat(c[biocapacityDataString]));

    tooltip.append("div").attr("class", "balanceDevelopmentTitle").text(title);

    let footprintBiocapacityDevelopmentSvg = tooltip.append("svg")
        .datum(footprintBioCapacity)
        .attr("class", "footprintBioCapacityGraph")
        .append("g")
        .attr("id", "footprintBioCapacityGraph")
        .attr("transform", `translate(${40},${10})`);

    let yScale = d3.scaleLinear()
        .domain([0, d3.max(efConsTotGHA.concat(biocapTotGHA)) / divisor])
        .range([100, 0]);
    let yAxis = d3.axisLeft(yScale).ticks(6);

    footprintBiocapacityDevelopmentSvg.append("g")
        .attr("id", "xAxis")
        .attr("transform", "translate(0," + 100 + ")")
        .call(xAxis);

    footprintBiocapacityDevelopmentSvg.append("g")
        .attr("id", "yAxis")
        .call(yAxis);

    footprintBiocapacityDevelopmentSvg.append("path")
        .datum(footprintBioCapacity)
        .attr("fill", "#E0FFFF")
        .attr("d", d3.area()
            .x(d => xScale(d.Year))
            .y0(d => (parseFloat(d[biocapacityDataString]) > parseFloat(d[footprintDataString])) ? yScale(d[biocapacityDataString] / divisor) : yScale(d[footprintDataString] / divisor))
            .y1(d => yScale(d[footprintDataString] / divisor))
        );

    footprintBiocapacityDevelopmentSvg.append("path")
        .datum(footprintBioCapacity)
        .attr("fill", "#ff9696")
        .attr("d", d3.area()
            .x(d => xScale(d.Year))
            .y0((d) => (parseFloat(d[biocapacityDataString]) < parseFloat(d[footprintDataString])) ? yScale(d[footprintDataString] / divisor) : yScale(d[biocapacityDataString] / divisor))
            .y1(d => yScale(d[biocapacityDataString] / divisor))
        );

    footprintBiocapacityDevelopmentSvg.append("path")
        .datum(footprintBioCapacity)
        .attr("fill", "none")
        .attr("stroke", "#f72525")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => xScale(d.Year))
            .y(d => yScale(d[footprintDataString] / divisor))
        );

    footprintBiocapacityDevelopmentSvg.append("path")
        .datum(footprintBioCapacity)
        .attr("fill", "none")
        .attr("stroke", "#008B8B")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => xScale(d.Year))
            .y(d => yScale(d[biocapacityDataString] / divisor)
            )
        );
}

function getCountryColor(d) {
    let minYear = d3.min(_.map(d.properties.nfa, c => parseInt(c.Year)));
    if (minYear !== undefined && minYear <= parseInt(year)) {
        minYear = year;
    } else if (minYear !== undefined) {
        minYear = minYear.toString();
    }

    switch (colorMode) {
        case "balanceBtn":
            return (!d.properties.nfa || d.properties.nfa.filter(x => x.Year === minYear).length === 0) ? "lightgray" : colorScaleBalance(d.properties.nfa.filter(x => x.Year === minYear)[0].Bilance);
        case "footprintPerPersonBtn":
            return (!d.properties.nfa || d.properties.nfa.filter(x => x.Year === minYear).length === 0) ? "lightgray" : colorScaleFootprintPerPerson(d.properties.nfa.filter(x => x.Year === minYear)[0].EFConsPerCap);
        case "bioCapacityPerPersonBtn":
            return (!d.properties.nfa || d.properties.nfa.filter(x => x.Year === minYear).length === 0) ? "lightgray" : colorScaleBioCapacityPerPerson(d.properties.nfa.filter(x => x.Year === minYear)[0].BiocapPerCap);
        default:
            return "pink";
    }
}

function toggleYearChangeButtons(newYear) {
    if (newYear === 1961)
        d3.select(".previousYearBtn").style("display", "none");
    else
        d3.select(".previousYearBtn").style("display", "inline");

    if (newYear === 2016)
        d3.select(".nextYearBtn").style("display", "none");
    else
        d3.select(".nextYearBtn").style("display", "inline");

}

function updateColorLegend() {
    let colorScale, range, legendTooltip;
    svg.select(".worldLegend").remove();
    linearGradient.selectAll("stop").remove();

    switch (colorMode) {
        case "balanceBtn":
            colorScale = colorScaleBalance;
            legendTooltip = "<div><b>ECOLOGICAL DEFICIT/RESERVE</b></div><div>An ecological deficit occurs when the Ecological Footprint of a population exceeds the biocapacityof the area available to that population. A national ecological deficit means that the nation is importing biocapacity through trade, liquidating national ecological assets or emitting carbon dioxide waste into the atmosphere. An ecological reserve exists when the biocapacity of a region exceeds its population's Ecological Footprint.</div><ul style=\"padding-left:15px;\"><li>Red: How many <b>times</b> footprint is greater than biocapacity</li><li>Blue: How many <b>times</b> biocapacity is greater than footprint</li></ul>";
            range = 18.75;
            break;
        case "footprintPerPersonBtn":
            colorScale = colorScaleFootprintPerPerson;
            legendTooltip = "<div><b>ECOLOGICAL FOOTPRINT PER PERSON</b></div><div>The Ecological Footprint per person is a nation's total Ecological Footprint divided by the total population of the nation. To live within the means of our planet's resources, the world's Ecological Footprint would have to equal the available biocapacity per person on our planet, which is currently 1.7 global hectares.</div>";
            range = 262;
            break;
        case "bioCapacityPerPersonBtn":
            colorScale = colorScaleBioCapacityPerPerson;
            legendTooltip = "<div><b>BIOCAPACITY PER PERSON</b></div><div>Biocapacity per person equals total biocapacity of a region divided by the region's population. The average biocapacity per person for the entire world is 1.7 global hectares. Countries with an average biocapacity of 3.4 global hectares per person have twice as many resources as the world average.</div>";
            range = 262;
            break;
    }

    d3.select(".legendTooltip").html(legendTooltip);

    linearGradient.selectAll("stop")
        .data(colorScale.ticks(120).map((t, i, n) => ({
            offset: `${100 * i / n.length}%`,
            color: colorScale(t)
        })))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    svg.append('g')
        .append("rect")
        .attr("width", 20)
        .attr("height", 300)
        .attr("transform", `translate(1810,140)`)
        .style("fill", "url(#linearGradient)");

    let xAxisMap = d3.axisRight(d3.scaleLinear()
        .domain(colorScale.domain())
        .range([0, range])).ticks(8).tickFormat(d3.format("d"));

    svg.append('g')
        .attr("transform", `translate(1830,140)`)
        .attr("class", "worldLegend")
        .call(xAxisMap);
}