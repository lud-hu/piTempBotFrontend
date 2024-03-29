//global Variables:

var filePath = "temperaturlog.csv";

var maxValue = ""; //max date in the csv file
var minValue = ""; //min date in the csv file

var rawData = ""; //raw text from csv

var oneDayInMillis = 86400000;

var myChart;

var initialized = false;

function inflateView() {

    var toDate = new Date();
    var fromDate = new Date(toDate - oneDayInMillis);
    //var toDate = Date.parse('2018-02-05 00:00:00');
    //var fromDate = Date.parse('2018-02-04 00:00:00');


    //load csv file
    //var rawData = ""; /

    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", filePath, false);
    xhttp.send();
    rawData = xhttp.responseText;

    var data = parseRawData(rawData, fromDate, toDate);

    //inflate the chart
    var myChart = new Chart(document.getElementById("line-chart"), {
        type: 'line',
        data: data,
        options: {
            elements: {
                point: {
                    radius: 0
                }
            },
            title: {
                display: false,
                text: 'Temp'
            },
            scales: {
                xAxes: [{
                    type: "time",
                    time: {
                        tooltipFormat: 'DD.MM. HH:mm',
                        displayFormats: {
                            hour: 'hh a'
                        },
                        unit: 'hour',
                        unitStepSize: 2
                    }
                }],
                yAxes: [{
                    id: 'A',
                    type: 'linear',
                    position: 'left',
                    id: "axis1",
                    labelString: 'Temperatur innen',
                    ticks: {
                        suggestedMin: 10,
                        suggestedMax: 25
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "Temperatur innen in °C"
                    }
                }, {
                    id: 'B',
                    type: 'linear',
                    position: 'right',
                    id: "axis2",
                    labelString: 'Luftfeuchtigkeit innen',
                    ticks: {
                        suggestedMin: 25,
                        suggestedMax: 55
                    },
                    scaleLabel: {
                        display: true,
                        labelString: "Luftfeuchtigkeit innen in %"
                    }
                }]
            },
            animation: {
                duration: 0
            },
            tooltips: {
                position: 'nearest',
                mode: 'index',
                intersect: false
            }
        }
    });

    //Slider:
    $("#slider").dateRangeSlider({
        bounds: {
            min: minValue,
            max: maxValue
        },
        defaultValues: {
            min: (maxValue - oneDayInMillis),
            max: maxValue
        },
        step: {
            minutes: 1
        },
        range: {
            min: {hours: 6}
        },
        formatter: function (val) {
            var days = (val.getDate() < 10 ? '0' : '') + val.getDate(),
                month = (val.getMonth() < 10 ? '0' : '') + (val.getMonth() + 1),
                hour = (val.getHours() < 10 ? '0' : '') + val.getHours(),
                minutes = (val.getMinutes() < 10 ? '0' : '') + val.getMinutes();

            return days + "." + month + ". " + hour + ":" + minutes;
        }
    });

    //console.log($("#slider").rangeSlider("option", "bounds"));

    $("#slider").bind("valuesChanging", function (e, data) {
        myChart.data = parseRawData(rawData, data.values.min, data.values.max);
        //myChart.data.labels.pop();
        //myChart.data.datasets.forEach((dataset) => {
        //	dataset.data.pop();
        //});
        myChart.update();
    });

    $(".download-block").click(function () {
        //creates new element in order to download it
        var element = document.createElement('a');
        element.setAttribute('href', 'data:xml/plain;charset=utf-8,' + encodeURIComponent(rawData));
        element.setAttribute('download', filePath);

        //do not display it
        element.style.display = 'none';
        document.body.appendChild(element);

        //just download it
        element.click();

        //delete it on the page again
        document.body.removeChild(element);
    });

    initialized = true;
};


function parseRawData(rawData, fromDate, toDate) {

    var data = { //jsonData
        labels: [],
        datasets: []
    };

    //parse csv file to json data for ChartJS
    Papa.parse(rawData, {
        complete: function (results) {
            //got parsed file in "results"

            //prepare datasets:

            dataset1 = {
                //temp inner
                data: [],
                label: results.data[0][2],
                borderColor: "#ffa94f",
                fill: true,
                backgroundColor: "#ffa94d40",
                yAxisID: "axis1"
                //hidden: true
            };

            dataset2 = {
                //humidity inner
                data: [],
                label: results.data[0][3],
                borderColor: "#157fef",
                fill: false,
                yAxisID: "axis2"
            };

            dataset3 = {
                //temp outer
                data: [],
                label: results.data[0][4],
                borderColor: "#ef0008",
                fill: true,
                backgroundColor: "#e500094d",
                yAxisID: "axis1",
                borderDash: [2, 2]
            };

            dataset4 = {
                //humidity outer
                data: [],
                label: results.data[0][5],
                borderColor: "#0009ef",
                fill: false,
                yAxisID: "axis2",
                borderDash: [2, 2],
                hidden: true
            };

            //MAIN LOOP
            //iterate through labels and all datasets
            for (var i = 1; i < results.data.length; i++) { //use i = 0 for including header

                //if a line is empty, skip it
                if (results.data[i] == "") continue;

                //get data only from the last day
                var dataTime = Date.parse(results.data[i][0] + " " + results.data[i][1]);
                if ((dataTime >= toDate) || (dataTime <= fromDate)) continue;
                //if ((currentDate - dataTime) > oneDayInMillis) continue;
                //if ((currentDate - dataTime) < 0) continue;

                //labels:
                //var label = results.data[i][0] + " " + results.data[i][1];
                //var labelTrimmed = label.substring(0, label.length - 3)
                //data.labels.push(labelTrimmed);
                //use Date Objects as labels now:
                var label = Date.parse(results.data[i][0] + " " + results.data[i][1]);
                data.labels.push(label);

                //datasets:
                var floatData1 = parseFloat(results.data[i][2].replace(",", "."));
                var floatData2 = parseFloat(results.data[i][3].replace(",", "."));
                var floatData3 = parseFloat(results.data[i][4].replace(",", "."));
                var floatData4 = parseFloat(results.data[i][5].replace(",", "."));

                dataset1.data.push(floatData1);
                dataset2.data.push(floatData2);
                dataset3.data.push(floatData3);
                dataset4.data.push(floatData4);
            }

            data.datasets.push(dataset1);
            data.datasets.push(dataset2);
            data.datasets.push(dataset3);
            data.datasets.push(dataset4);

            minValue = Date.parse(results.data[1][0] + " " + results.data[1][1]);
            if (results.data[results.data.length - 1][0] == "") {
                maxValue = Date.parse(results.data[results.data.length - 2][0] + " " + results.data[results.data.length - 2][1]);
            } else {
                maxValue = Date.parse(results.data[results.data.length - 1][0] + " " + results.data[results.data.length - 1][1]);
            }

            //set Info Section Values and Ventilation Recommendation (if not already set):
            if (initialized) return data;

            if (results.data[results.data.length - 1][0] == "") {
                $('#inner-temp-value').text(results.data[results.data.length - 2][2]);
                $('#inner-humidity-value').text(results.data[results.data.length - 2][3]);
                $('#outer-temp-value').text(results.data[results.data.length - 2][4]);
                $('#outer-humidity-value').text(results.data[results.data.length - 2][5]);

                setVentRec(results.data[results.data.length - 2][9]);
            } else {

                $('#inner-temp-value').text(results.data[results.data.length - 1][2]);
                $('#inner-humidity-value').text(results.data[results.data.length - 1][3]);
                $('#outer-temp-value').text(results.data[results.data.length - 1][4]);
                $('#outer-humidity-value').text(results.data[results.data.length - 1][5]);

                setVentRec(results.data[results.data.length - 1][9]);
            }
        }
    });

    return data;
}

function setVentRec(value) {
    value = parseFloat(value.replace(",", "."));
    if (value <= 0) {
        $('.ventRec#false').css('display', 'block');
    } else {
        $('.ventRec#true').css('display', 'block');
    }
}