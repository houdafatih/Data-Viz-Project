import {playersData,seasonData} from "./scripts/utils.js";
import { drawVisualization1 } from "./scripts/visualization1.js";
import { drawVisualization2 } from "./scripts/visualization2.js";
import { drawVisualization3 } from "./scripts/visualization3.js";

d3.csv("data/nba.csv").then(function(data){
   
   data.forEach(element => {
        element.player_id = +element.player_id
        element.game_index = +element.game_index
        element.pts = +element.pts
        element.fga = +element.fga
        element.min = +element.min
        element.fg_pct = +element.fg_pct
        element.plus_minus = +element.plus_minus
        element.next_pts = +element.next_pts
        element.next_fga = +element.next_fga
        element.next_min = +element.next_min
        element.next_fg_pct = +element.next_fg_pct
        element.rolling_pts_avg_3 = +element.rolling_pts_avg_3
        element.baseline_pts = +element.baseline_pts
        element.pts_diff_from_baseline = +element.pts_diff_from_baseline 
        element.streak_length = +element.streak_length
   });
  
   playersData(data)
   seasonData(data)
   
   const nba_data = data

   d3.select("#playerSelect").property("value",nba_data[0].player_name)

   d3.select("#seasonSelect").property("value",nba_data[0].season_year)

   d3.select("#metricSelect").property("value","pts")

   d3.select("#performanceSelect").property("value","hot")

   d3.select("#metricSelectV3").property("value","pts")

   d3.select("#thresholdSelect").property("value","medium")

   updateVisualizations(nba_data)


   d3.select("#playerSelect").on("change",() => updateVisualizations(nba_data))
   d3.select("#seasonSelect").on("change",() => updateVisualizations(nba_data))
   d3.select("#metricSelect").on("change",() => updateVisualizations(nba_data))
   d3.select("#performanceSelect").on("change",() => updateVisualizations(nba_data))
   d3.select("#metricSelectV3").on("change",() => updateVisualizations(nba_data))
   d3.select("#thresholdSelect").on("change",() => updateVisualizations(nba_data))

})

function updateVisualizations(nba_data){
    const player = d3.select("#playerSelect").property("value")
    const season = d3.select("#seasonSelect").property("value")
    const metric = d3.select("#metricSelect").property("value")

    const eventT = d3.select("#performanceSelect").property("value")

    const metricv3 = d3.select("#metricSelectV3").property("value")
    const threshold =d3.select("#thresholdSelect").property("value")

    if(player === "Select a Player" || season === "Select a Season" || metric === "Select a metric"){
        return
    }
   
    let data_filter = nba_data.filter(d => d.player_name === player && d.season_year == season)
    drawVisualization1(data_filter,"#vizual1",metric)
    
    if(eventT === "Select event type"){
        return
    }
    drawVisualization2(data_filter,"#vizual2",metric,eventT)

    if(metricv3 === "Select a metric" || threshold === "Select a threshold"){
        return
    }
    drawVisualization3(data_filter,"#vizual3",metricv3,threshold)
}