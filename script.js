let data;

d3.csv("cars2017.csv").then(function(dataset) {
    data = dataset;
    data.forEach(d => {
        d.EngineCylinders = +d.EngineCylinders;
        d.AverageCityMPG = +d.AverageCityMPG;
        d.AverageHighwayMPG = +d.AverageHighwayMPG;
    });

    drawScene1(); // default scene

    // Attach event listeners to buttons
    d3.select("#scene1Btn").on("click", drawScene1);
    d3.select("#scene2Btn").on("click", drawScene2);
    d3.select("#scene3Btn").on("click", drawScene3);
    d3.select("#scene4Btn").on("click", drawScene4);
});

function clearChart() {
    d3.select("#chart").html("");
}

// Scene 1: Fuel Type Distribution
function drawScene1() {
    clearChart();
    d3.select("#chart").append("h2").text("Scene 1: Fuel Type Distribution");
    d3.select("#chart").append("p").attr("class", "annotation")
        .text("This chart shows the frequency of different fuel types among cars in 2017, with gasoline dominating the market.");

    const counts = d3.rollup(data, v => v.length, d => d.Fuel);
    const entries = Array.from(counts, ([Fuel, Count]) => ({ Fuel, Count }));

    const width = 600, height = 400, margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const svg = d3.select("#chart").append("svg")
        .attr("width", width).attr("height", height);

    const x = d3.scaleBand()
        .domain(entries.map(d => d.Fuel))
        .range([margin.left, width - margin.right])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(entries, d => d.Count)]).nice()
        .range([height - margin.bottom, margin.top]);

    svg.selectAll("rect")
        .data(entries)
        .enter()
        .append("rect")
        .attr("x", d => x(d.Fuel))
        .attr("y", d => y(d.Count))
        .attr("width", x.bandwidth())
        .attr("height", d => y(0) - y(d.Count))
        .attr("fill", "steelblue")
        .append("title")
        .text(d => `${d.Fuel}: ${d.Count}`);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
}

// Scene 2: Avg City vs Highway MPG by Fuel
function drawScene2() {
    clearChart();
    d3.select("#chart").append("h2").text("Scene 2: Avg City vs Highway MPG by Fuel");
    d3.select("#chart").append("p").attr("class", "annotation")
        .text("Average MPG for city and highway driving by fuel type, illustrating efficiency advantages of electric vehicles.");

    const grouped = d3.rollups(data, v => ({
        city: d3.mean(v, d => d.AverageCityMPG),
        highway: d3.mean(v, d => d.AverageHighwayMPG)
    }), d => d.Fuel).map(([Fuel, mpg]) => ({
        Fuel, City: mpg.city, Highway: mpg.highway
    }));

    const width = 700, height = 400, margin = { top: 30, right: 30, bottom: 40, left: 60 };
    const svg = d3.select("#chart").append("svg")
        .attr("width", width).attr("height", height);

    const x0 = d3.scaleBand()
        .domain(grouped.map(d => d.Fuel))
        .range([margin.left, width - margin.right])
        .padding(0.2);

    const x1 = d3.scaleBand()
        .domain(["City", "Highway"])
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(grouped, d => Math.max(d.City, d.Highway))]).nice()
        .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal()
        .domain(["City", "Highway"])
        .range(["#1f77b4", "#ff7f0e"]);

    const fuelGroups = svg.selectAll("g.fuel")
        .data(grouped)
        .enter().append("g")
        .attr("class", "fuel")
        .attr("transform", d => `translate(${x0(d.Fuel)},0)`);

    fuelGroups.selectAll("rect")
        .data(d => ["City", "Highway"].map(key => ({ key, value: d[key], Fuel: d.Fuel })))
        .enter().append("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => y(0) - y(d.value))
        .attr("fill", d => color(d.key))
        .append("title")
        .text(d => `${d.Fuel} - ${d.key} MPG: ${d.value.toFixed(1)}`);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x0));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
}

// Scene 3: Cylinders vs City MPG
function drawScene3() {
    clearChart();
    d3.select("#chart").append("h2").text("Scene 3: Cylinders vs City MPG");
    d3.select("#chart").append("p").attr("class", "annotation")
        .text("This scatter plot highlights how city fuel efficiency drops as engine cylinder count increases.");

    const width = 700, height = 400, margin = { top: 20, right: 20, bottom: 40, left: 50 };

    const svg = d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height);

    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.EngineCylinders)).nice()
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.AverageCityMPG)).nice()
        .range([height - margin.bottom, margin.top]);

    svg.append("g")
        .selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => x(d.EngineCylinders))
        .attr("cy", d => y(d.AverageCityMPG))
        .attr("r", 5)
        .attr("fill", "teal")
        .attr("opacity", 0.7);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("~s")));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
}

// Scene 4: Explore by Car Brand
function drawScene4() {
    clearChart();
    d3.select("#chart").append("h2").text("Scene 4: Explore by Car Brand");
    d3.select("#chart").append("p").attr("class", "annotation")
        .text("Use the dropdown to explore MPG values for different car makes across city and highway driving.");

    const width = 700, height = 400, margin = { top: 30, right: 20, bottom: 40, left: 60 };

    const svg = d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height);

    const x = d3.scaleLinear()
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .range([height - margin.bottom, margin.top]);

    const dropdown = d3.select("#chart")
        .append("label")
        .text("Choose a Make: ")
        .append("select")
        .on("change", update);

    const makes = Array.from(new Set(data.map(d => d.Make))).sort();
    dropdown.selectAll("option")
        .data(makes)
        .enter()
        .append("option")
        .text(d => d);

    const xAxis = svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`);

    const yAxis = svg.append("g")
        .attr("transform", `translate(${margin.left},0)`);

    function update() {
        const selectedMake = dropdown.property("value");
        const filtered = data.filter(d => d.Make === selectedMake);

        x.domain(d3.extent(filtered, d => d.AverageCityMPG)).nice();
        y.domain(d3.extent(filtered, d => d.AverageHighwayMPG)).nice();

        svg.selectAll("circle").remove();

        svg.selectAll("circle")
            .data(filtered)
            .enter().append("circle")
            .attr("cx", d => x(d.AverageCityMPG))
            .attr("cy", d => y(d.AverageHighwayMPG))
            .attr("r", 6)
            .attr("fill", "orange")
            .attr("opacity", 0.8)
            .append("title")
            .text(d => `${d.Make} - City: ${d.AverageCityMPG}, Highway: ${d.AverageHighwayMPG}`);

        xAxis.call(d3.axisBottom(x));
        yAxis.call(d3.axisLeft(y));
    }

    update(); // initial update
}
