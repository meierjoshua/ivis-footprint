const svg = d3.select('svg');

//const projection = d3.geoNaturalEarth1();
//const pathGenerator = d3.geoPath().projection(projection);
width = 500;
height = 500;

d3.json('https://raw.githubusercontent.com/ZHB/switzerland-geojson/master/country/switzerland.geojson')
    .then(data => {

        // Create a unit projection.
        var projection = d3.geoNaturalEarth1()
            .scale(3200)
            .translate([200, 2900]);

// Create a path generator.
        var pathGenerator = d3.geoPath()
            .projection(projection);

        svg.selectAll('path').data(data.features)
            .enter().append('path')
            .attr('class', 'country')
            //    .attr('name', d => d.properties.name)
            .attr('d', pathGenerator)
            .on("mouseover", d => {
                //      console.log(d.properties);
            });
    });






// let population = data[1];


//   console.log(world.features.filter(x => x.properties.area === undefined));

/*
        world.features.forEach((x, y) => {

            if (x.properties.flag_base64)
                download(x.properties.flag_base64, `${x.properties.name}.svg`, 'text/plain');


            //     if(x.properties.)


            let countryX = population.filter(d => d.Location === x.properties.name && (d.Variant === "High" || d.Variant === "Low"));
            if (countryX.length !== 0) {
                let futureSpan = [];
                delete x.populationFutureSpan;

                countryX.forEach(x => futureSpan.push({population: x.PopTotal, year: x.Time, variant: x.Variant}));
                x.properties.populationFutureSpan = futureSpan;
            }
});*/

//    console.log(JSON.stringify(world));