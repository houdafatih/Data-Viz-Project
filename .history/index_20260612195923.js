import {playersData,seasonData} from "./scripts/utils.js";

d3.csv("data/nba.csv",d3.autoType).then(function(data){

   playersData(data)
   seasonData(data)
   
   nba = data
   d3.select("#selectPlayer").on("change",updateVisualization1)
   d3.select("#seasonSelect").on("change",updateVisualization1)
   d3.select("#metricSelect").on("change",updateVisualization1)

})

function updateVisualization1(){
    const player = d3.select("#selectPlayer").proprety("value")
    const season = d3.select("#seasonSelect").proprety("value")
    const metric = d3.select("#metricSelect").proprety("value")

    if(player === "Select a Player" || season === "Select a Season" || metric === "Select a metric"){
        return
    }

    const data_filter = nba.filter(d => d.player_name === player && d.season_year === season)
}