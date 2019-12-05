const projection = d3.geoNaturalEarth1().scale(354).translate([900, 470]);
const pathGenerator = d3.geoPath().projection(projection);
const svg = d3.select('svg');
const colorScaleBalance = d3.scaleLinear().domain([-8, -7, -0.00001, 0.00001, 7, 8]).range(['#f72525', '#f72525', '#ffB6B6', '#acc9ab', '#0d870b', '#0d870b']);
const colorScaleFootprintPerPerson = d3.scaleLinear().domain([0, 7, 8]).range(['#ffD6D6', '#f90505', '#f90505']);
const colorScaleBioCapacityPerPerson = d3.scaleLinear().domain([0, 7, 8]).range(['#9cc99b', '#0d870b', '#0d870b']);
const tooltip = d3.select(".tooltip");
let colorMode = "balanceBtn";
const defs = svg.append("defs");
const linearGradient = defs.append("linearGradient").attr("x2", "0%").attr("y2", "100%").attr("id", "linearGradient");

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
                d3.select(`#${d.id}`).style("fill", "gray");
                tooltip.transition()
                    .delay(100)
                    .duration(200)
                    .style("opacity", .9);

                tooltip.select(".populationGraph").remove();
                tooltip.select(".footprintBioCapacityGraph").remove();
                tooltip
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY + 5) + "px")
                    .style("display", "block");

                tooltip.select(".title").text(d.properties.name);
                tooltip.select(".capital").text(d.properties.capital);
                tooltip.select(".surfaceArea").text(d.properties.area);
                tooltip.select(".flag").attr("src", d.properties.flag_base64);

                const population = d.properties.population.filter(x => x.year < 2019);
                let populationDevelopmentSvg = tooltip.append("svg")
                    .attr("class", "populationGraph")
                    .append("g")
                    .attr("id", "populationGraph")
                    .attr("transform", `translate(${50},${10})`);

                let xScale = d3.scaleLinear()
                    .domain([d3.min(_.map(population, c => parseInt(c.year))), d3.max(_.map(population, c => parseInt(c.year)))])
                    .range([0, 250]);
                let xAxis = d3.axisBottom(xScale).ticks(8).tickFormat(d3.format("d"));

                let yScale = d3.scaleLinear()
                    .domain([0, d3.max(_.map(population, c => parseInt(c.population)))])
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
                        .y(d => yScale(d.population))
                    );

                let footprintBioCapacity = d.properties.nfa;
                let efConsTotGHA = _.map(footprintBioCapacity, c => parseInt(c.EFConsTotGHA));
                let biocapTotGHA = _.map(footprintBioCapacity, c => parseInt(c.BiocapTotGHA));

                let footprintBiocapacityDevelopmentSvg = tooltip.append("svg")
                    .datum(footprintBioCapacity)
                    .attr("class", "footprintBioCapacityGraph")
                    .append("g")
                    .attr("id", "footprintBioCapacityGraph")
                    .attr("transform", `translate(${50},${10})`);

                yScale = d3.scaleLinear()
                    .domain([0, d3.max(efConsTotGHA.concat(biocapTotGHA)) / 1000])
                    .range([100, 0]);
                yAxis = d3.axisLeft(yScale).ticks(6);

                footprintBiocapacityDevelopmentSvg.append("g")
                    .attr("id", "xAxis")
                    .attr("transform", "translate(0," + 100 + ")")
                    .call(xAxis);

                footprintBiocapacityDevelopmentSvg.append("g")
                    .attr("id", "yAxis")
                    .call(yAxis);

                footprintBiocapacityDevelopmentSvg.append("path")
                    .datum(footprintBioCapacity)
                    .attr("fill", "#9cc99b")
                    .attr("d", d3.area()
                        .x(d => xScale(d.Year))
                        .y0(d => (parseInt(d.BiocapTotGHA) > parseInt(d.EFConsTotGHA)) ? yScale(d.BiocapTotGHA / 1000) : yScale(d.EFConsTotGHA / 1000))
                        .y1(d => yScale(d.EFConsTotGHA / 1000))
                    );

                footprintBiocapacityDevelopmentSvg.append("path")
                    .datum(footprintBioCapacity)
                    .attr("fill", "#ff9696")
                    .attr("d", d3.area()
                        .x(d => xScale(d.Year))
                        .y0((d) => (parseInt(d.BiocapTotGHA) < parseInt(d.EFConsTotGHA)) ? yScale(d.EFConsTotGHA / 1000) : yScale(d.BiocapTotGHA / 1000))
                        .y1(d => yScale(d.BiocapTotGHA / 1000))
                    );

                footprintBiocapacityDevelopmentSvg.append("path")
                    .datum(footprintBioCapacity)
                    .attr("fill", "none")
                    .attr("stroke", "#f72525")
                    .attr("stroke-width", 1.5)
                    .attr("d", d3.line()
                        .x(d => xScale(d.Year))
                        .y(d => yScale(d.EFConsTotGHA / 1000))
                    );

                footprintBiocapacityDevelopmentSvg.append("path")
                    .datum(footprintBioCapacity)
                    .attr("fill", "none")
                    .attr("stroke", "#0d870b")
                    .attr("stroke-width", 1.5)
                    .attr("d", d3.line()
                        .x(d => xScale(d.Year))
                        .y(d => yScale(d.BiocapTotGHA / 1000)
                        )
                    );
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

function getCountryColor(d) {
    switch (colorMode) {
        case "balanceBtn":
            return (!d.properties.nfa || d.properties.nfa.filter(x => x.Year === "2016").length === 0) ? "lightgray" : colorScaleBalance(d.properties.nfa.filter(x => x.Year === "2016")[0].Bilance);
        case "footprintPerPersonBtn":
            return (!d.properties.nfa || d.properties.nfa.filter(x => x.Year === "2016").length === 0) ? "lightgray" : colorScaleFootprintPerPerson(d.properties.nfa.filter(x => x.Year === "2016")[0].EFConsPerCap);
        case "bioCapacityPerPersonBtn":
            return (!d.properties.nfa || d.properties.nfa.filter(x => x.Year === "2016").length === 0) ? "lightgray" : colorScaleBioCapacityPerPerson(d.properties.nfa.filter(x => x.Year === "2016")[0].BiocapPerCap);
        default:
            return "pink";
    }
}

function updateColorLegend() {
    let colorScale, range;
    svg.select(".worldLegend").remove();
    linearGradient.selectAll("stop").remove();

    switch (colorMode) {
        case "balanceBtn":
            colorScale = colorScaleBalance;
            range = 18.75;
            break;
        case "footprintPerPersonBtn":
            colorScale = colorScaleFootprintPerPerson;
            range = 262;
            break;
        case "bioCapacityPerPersonBtn":
            colorScale = colorScaleBioCapacityPerPerson;
            range = 262;
            break;
    }

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
        .attr("transform", `translate(1780,50)`)
        .style("fill", "url(#linearGradient)");

    let xAxisMap = d3.axisRight(d3.scaleLinear()
        .domain(colorScale.domain())
        .range([0, range])).ticks(8).tickFormat(d3.format("d"));

    svg.append('g')
        .attr("transform", `translate(1800,50)`)
        .attr("class", "worldLegend")
        .call(xAxisMap);
}