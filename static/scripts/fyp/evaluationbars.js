var chart;

async function initEvaluationBars () {
    getFilters();
}

async function getFilters() {
    try {
        //Get Filters
        ///The api to get the filters, complete with query string parameters
        var api = apiRoot + "/fyp/evaluation/filter?dimension=" + $("#dimension-select").val();
        
        ///Using an API call to retrieve the filter data
        var filterData = await callGetAPI(api, "filters");

        ///An array to store the filters
        var filters = [];

        ///Populating the filters array with the filters from the back end
        filterData.forEach(element => {
            filters.push(element[0].stringValue);
        });

        ///Sorting the school array
        filters.sort();

        ///Clears the filter box of any values
        $("#filter-select").empty();

        ///Adding each filter to the select 
        filters.forEach(element => {
            $("#filter-select").append(newSelectItem(element));
        });
    } catch (e) {
        generateErrorBar(e);
    }

    getData();
}

//Compiles a string containing a select item with corresponding text and value
///text: The label and the value of the option
function newSelectItem(text) {
    //String compilation
    ///Correctly formats HTML to be appended to the input box, returned at the end of the function
    var option = "<option value='" + text + "'>" + text + "</option>";

    return option
}

async function getData() {
    try {
        //Get Data
        ///The api to get the data, complete with query string parameters
        var api = apiRoot + "/fyp/evaluation/recall?dimension=" + $("#dimension-select").val() + "&filter=" + $("#filter-select").val() + "&aspect=" + $("#aspect-select").val();

        ///Using an API call to retrieve the filter data
        var serverData = await callGetAPI(api, "data");

        var labels = [];
        var chartData = [];

        serverData.forEach(element => {
            var temp = [];
            labels.push(element[0].stringValue);

            for(i = 1; i < element.length; i++) {
                temp.push(parseFloat(element[i].stringValue))
            }

            chartData.push(temp);
        });

        drawGraph(labels, invert2DArray(chartData));
    } catch (e) {
        generateErrorBar(e);
    }
}

function invert2DArray (input) {
    var output = [];

    for(var i = 0; i < input.length; i++) {
        for(var j = 0; j < input[0].length; j++) {
            if(i == 0) {
                output.push([]);
            }

            output[j].push(input[i][j]);
        }
    }

    return output
}

async function drawGraph (labelList, inputData) {
    try {
        chart.destroy()
    } catch {

    }

    var data = {
        labels: labelList,
        datasets: [{
                label: "Assessment",
                data: inputData[0]
            }, {
                label: "Community",
                data: inputData[1]
            }, {
                label: "Effort",
                data: inputData[2]
            }, {
                label: "Resources",
                data: inputData[3]
            }, {
                label: "Support",
                data: inputData[4]
            }, {
                label: "Teaching",
                data: inputData[5]
            }
        ]
    };

    chart = new Chart("myChart", {
        type: "bar",
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                },
                title: {
                    display: true,
                    text: "Module Evaluations"
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: 5
                }
            }
        }
    });
}

//Runs when the code loads - the timeout buffers until the full page loads
///Runs the initialise function in case more than one function call is needed
window.onload = function () {
    setTimeout(initialise(), 1);
};

//Runs when the page loads
async function initialise() {
    userSession.loaderVal = 1;

    //Function calls
    await initialiseAuth();

    //Gets the current user's school
    initEvaluationBars();
}