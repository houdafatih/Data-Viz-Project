import {playersData,seasonData} from "./scripts/utils.js";
import { drawVisualization1 } from "./scripts/visualization1.js";

d3.csv("data/nba.csv",d3.autoType).then(function(data){

   playersData(data)
   seasonData(data)
   
   const nba_data = data
  
   d3.select("#playerSelect").on("change",() => updateVisualization1(nba_data))
   d3.select("#seasonSelect").on("change",() => updateVisualization1(nba_data))
   d3.select("#metricSelect").on("change",() => updateVisualization1(nba_data))

})

function updateVisualization1(nba_data){
    const player = d3.select("#playerSelect").property("value")
    const season = d3.select("#seasonSelect").property("value")
    const metric = d3.select("#metricSelect").property("value")

    if(player === "Select a Player" || season === "Select a Season" || metric === "Select a metric"){
        return
    }

    const data_filter = nba_data.filter(d => d.player_name === player && d.season_year === season)
    console.log("here 2 :",player,season,metric)
    console.log("data filterd :",nba_data)
    
    //drawVisualization1(data_filter,"#vizual1",metric)

}