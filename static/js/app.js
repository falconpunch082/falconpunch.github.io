// Using then wrapper to ensure json is loaded before starting any other function
d3.json('https://falconpunch082.github.io/samples.json').then(function(d){
    // Ensuring that data is read
    console.log(d);

    // Populate dropdown list with names of individuals with for loop 
    for (let i = 0; i < d["names"].length; i++) {
        d3.select("#selDataset").append("option").text(d["names"][i]);
    }

    console.log("Populated dropdown list");

    // Transforming json file so that each subarray contains info of each
    // individual
    let td = [];

    for (let i = 0; i < d.names.length; i++) {
        td.push({
            name: d.names[i],
            metadata: d.metadata[i],
            samples: d.samples[i]
        });
    }

    /*
    -dev notes-
    To sort based on values
    - combine(zip) each id, value and label together to become a list of key-value pairs
    - sort them based on value
    - unzip them back to previous format for plotly to read
    with this you can then filter out top 10 and assign to new variable
    */

    // For each individual available in td
    for (let i = 0; i < td.length; i++){
        // Loading in key 'samples' value into temporary variable s
        let s = td[i].samples;
      
        // Associating each otu_id with its respective value and label
        let zippedSamples = s.otu_ids.map((otu_id, index) => ({
            id: otu_id, 
            value: s.sample_values[index], 
            label: s.otu_labels[index]
        }))
        
        // Sorting in descending order of values (so that slicing can occur)
        zippedSamples.sort((a,b) => b.value - a.value);
        
        // Unzipping zippedSamples and adding individual ids, values and labels
        // into td. At this point, they would have been sorted and associated correctly.
        s.otu_ids = zippedSamples.map(item => item["id"].toString());
        s.sample_values = zippedSamples.map(item => item.value);
        s.otu_labels = zippedSamples.map(item => item.label);
        // Reassigning values of samples in td with values of s
        td[i].samples = s;
    }

    // This is a function that will create a bar chart of the top 10 OTUs in
    // one individual.
    // As such, slicing code will be implemented in the function.
    function bar(id) {
        // Load data of requested individual's number
        let data = td.filter(td => td.name === id);
        let samples = data[0]["samples"];

        // Choosing top 10
        let top10otu = samples["otu_ids"].slice(0, 10);
        let top10otu_renamed = top10otu.map(n => "OTU " + n.toString());
        let top10values = samples["sample_values"].slice(0, 10);
        let top10labels = samples["otu_labels"].slice(0, 10);

        // Creating bar chart
        let chartData = {
            y: top10otu_renamed,
            x: top10values,
            type: 'bar',
            orientation: 'h',
            transforms: [{
                type: 'sort',
                target: 'y',
                order: 'descending'
            }],
            text: top10labels
        }

        let layout = {
            title: `Top 10 OTUs of individual ${samples["id"]}`,
            yaxis: {
                    tickmode: 'array',
                    tickvals: top10otu_renamed,
                    ticktext: top10otu_renamed,
                   },
            xaxis: {title: 'Count'}
        }

        Plotly.newPlot("bar", [chartData], layout);
    }
    
    // This is a function that will make a bubble chart displaying all the
    // OTUs in an individual.
    function bubble(id) {
        // Load data of requested individual's number
        let data = td.filter(td => td.name === id);
        let samples = data[0]["samples"];
        
        let chartData = {
            x: samples["otu_ids"],
            y: samples["sample_values"],
            text: samples["otu_labels"],
            mode: 'markers',
            marker: {
                color: samples["sample_values"],
                size: samples["sample_values"],
                colorscale: 'Portland'
            },
        }

        let layout = {
            title: `OTUs present in individual ${samples["id"]}`,
            xaxis: {title: 'OTU'},
            yaxis: {title: 'Count'}
        }

        Plotly.newPlot("bubble", [chartData], layout);

    }

    // This is a function that will make a gauge displaying how many times
    // the chosen individual washes their belly button
    function gauge(id) {
        // Load data of requested individual's number
        let data = td.filter(td => td.name === id);
        let wfreq = data[0]["metadata"]["wfreq"];

        let chartData = {
            gauge: { axis: { visible: true, range: [0, 9] } },
            value: wfreq,
            title: {text: "Washing Frequency (scrubs/week)"},
            type: 'indicator',
            mode: 'gauge+number'
        }

        Plotly.newPlot("gauge", [chartData]);
    }
    
    // This is a function to fill in the demographics panel with data
    // from the chosen individual.
    function demographic(id){
        // Clear any existing data
        d3.selectAll("p").remove();

        // Load data of requested individual's number
        let data = td.filter(td => td.name === id);
        let demo = data[0]["metadata"];

        d3.select("#sample-metadata").append("p").text('id: ' + demo["id"].toString());
        d3.select("#sample-metadata").append("p").text('ethnicity: ' + demo["ethnicity"]);
        d3.select("#sample-metadata").append("p").text('gender: ' + demo["gender"]);
        d3.select("#sample-metadata").append("p").text('age: ' + demo["age"].toString());
        d3.select("#sample-metadata").append("p").text('location: ' + demo["location"]);
        d3.select("#sample-metadata").append("p").text('bbtype: ' + demo["bbtype"]);
        d3.select("#sample-metadata").append("p").text('wfreq: ' + demo["wfreq"].toString());
    }
    
    // This is a function to initialise the website with data from
    // individual 940 so charts can be populated.
    function init(){
        bar("940");
        bubble("940");
        gauge("940")
        demographic("940");

        console.log('Successfully loaded 940\'s data.')
    }

    // This is a function to fill in data with chosen individual once a selection
    // from the dropdown list has been made
    function optionChanged(event) {
        // Identifying dropdown menu
        let dropdownMenu = d3.select("#selDataset");
        // determining value chosen
        let sel = dropdownMenu.property("value");
      
        // Updating charts with selected individual 
        bar(sel);
        bubble(sel);
        gauge(sel);
        demographic(sel);

        console.log(`Successfully loaded ${sel}\'s data.`)
    }

    // Initialising and listening
    init();
    d3.select("#selDataset").on("change", optionChanged);
});
