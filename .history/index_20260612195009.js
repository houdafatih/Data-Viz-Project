import {playersData,seasonData} from "./scripts/utils.js";

d3.csv("data/nba.csv",d3.autoType).then(function(data){
   playersData(data)
   seasonData(data)
});

function updateVisualization1(){
    const player = d3.select("#selectPlayer").proprety("value")
    const season = d3.select("#seasonSelect").proprety("value")
    const metric = d3.select("#metricSelect").proprety("value")
}