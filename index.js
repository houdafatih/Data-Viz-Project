import {playersData,seasonData} from "./scripts/utils.js";
import { drawVisualization1 } from "./scripts/visualization1.js";
import { drawVisualization2 } from "./scripts/visualization2.js";
import { drawVisualization3 } from "./scripts/visualization3.js";
import { drawVisualization4 } from "./scripts/visualization4.js";

let selectedGames = {indexes:[], pairStart:null, source:null}

d3.csv("data/nba.csv").then(function(data){
   
   data.forEach(element => {
        element.player_id = numberValue(element.player_id)
        element.team_id = numberValue(element.team_id)
        element.game_index = numberValue(element.game_index)
        element.result_streak_length = numberValue(element.result_streak_length)
        element.pts = numberValue(element.pts)
        element.fga = numberValue(element.fga)
        element.min = numberValue(element.min)
        element.fg_pct = numberValue(element.fg_pct)
        element.plus_minus = numberValue(element.plus_minus)
        element.next_pts = numberValue(element.next_pts)
        element.next_fga = numberValue(element.next_fga)
        element.next_min = numberValue(element.next_min)
        element.next_fg_pct = numberValue(element.next_fg_pct)
        element.rolling_pts_avg_3 = numberValue(element.rolling_pts_avg_3)
        element.baseline_pts = numberValue(element.baseline_pts)
        element.pts_diff_from_baseline = numberValue(element.pts_diff_from_baseline) 
        element.next_pts_diff_from_baseline = numberValue(element.next_pts_diff_from_baseline)
        element.next_fga_change = numberValue(element.next_fga_change)
        element.streak_length = numberValue(element.streak_length)
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

   d3.select("#contextSelectV4").property("value","home_away")

   d3.select("#xMetricSelectV4").property("value","pts_diff_from_baseline")

   d3.select("#yMetricSelectV4").property("value","next_pts_diff_from_baseline")

   updateVisualizations(nba_data)


   d3.select("#playerSelect").on("change",() => resetSelection(nba_data))
   d3.select("#seasonSelect").on("change",() => {
        syncPlayerForSeason(nba_data)
        resetSelection(nba_data)
   })
   d3.select("#metricSelect").on("change",() => updateVisualizations(nba_data))
   d3.select("#performanceSelect").on("change",() => updateVisualizations(nba_data))
   d3.select("#metricSelectV3").on("change",() => updateVisualizations(nba_data))
   d3.select("#thresholdSelect").on("change",() => updateVisualizations(nba_data))
   d3.select("#contextSelectV4").on("change",() => updateVisualizations(nba_data))
   d3.select("#xMetricSelectV4").on("change",() => updateVisualizations(nba_data))
   d3.select("#yMetricSelectV4").on("change",() => updateVisualizations(nba_data))
   d3.select("#trendlineToggleV4").on("change",() => updateVisualizations(nba_data))

})

function updateVisualizations(nba_data){
    const player = d3.select("#playerSelect").property("value")
    const season = d3.select("#seasonSelect").property("value")
    const metric = d3.select("#metricSelect").property("value")

    const eventT = d3.select("#performanceSelect").property("value")

    const metricv3 = d3.select("#metricSelectV3").property("value")
    const threshold =d3.select("#thresholdSelect").property("value")
    const contextv4 = d3.select("#contextSelectV4").property("value")
    const xMetricv4 = d3.select("#xMetricSelectV4").property("value")
    const yMetricv4 = d3.select("#yMetricSelectV4").property("value")
    const showTrendlinev4 = d3.select("#trendlineToggleV4").property("checked")

    if(player === "Select a Player" || season === "Select a Season" || metric === "Select a metric"){
        return
    }
   
    let data_filter = nba_data.filter(d => d.player_name === player && d.season_year == season)
    drawVisualization1(data_filter,"#vizual1",metric,selectedGames,d => selectGamePair(d.game_index,"v1",nba_data))
    
    if(eventT === "Select event type"){
        return
    }
    drawVisualization2(data_filter,"#vizual2",metric,eventT,selectedGames)

    if(metricv3 === "Select a metric" || threshold === "Select a threshold"){
        return
    }
    drawVisualization3(data_filter,"#vizual3",metricv3,threshold,selectedGames,d => selectGameRange(d.start,d.end,"v3",nba_data))

    if(contextv4 === "Select context" || xMetricv4 === "Select x-axis" || yMetricv4 === "Select y-axis"){
        return
    }
    drawVisualization4(data_filter,"#vizual4",xMetricv4,yMetricv4,contextv4,showTrendlinev4,selectedGames,d => selectGamePair(d.game_index,"v4",nba_data))
}

function selectGamePair(gameIndex,source,nba_data){
    selectedGames = {indexes:[gameIndex,gameIndex + 1], pairStart:gameIndex, source:source}
    updateVisualizations(nba_data)
}

function selectGameRange(start,end,source,nba_data){
    selectedGames = {indexes:d3.range(start,end + 1), pairStart:null, source:source}
    updateVisualizations(nba_data)
}

function resetSelection(nba_data){
    selectedGames = {indexes:[], pairStart:null, source:null}
    updateVisualizations(nba_data)
}

function syncPlayerForSeason(nba_data){
    const season = d3.select("#seasonSelect").property("value")
    const player = d3.select("#playerSelect").property("value")
    const hasPlayerSeason = nba_data.some(d => d.player_name === player && d.season_year == season)

    if(!hasPlayerSeason){
        const firstSeasonRow = nba_data.find(d => d.season_year == season)
        if(firstSeasonRow){
            d3.select("#playerSelect").property("value",firstSeasonRow.player_name)
        }
    }
}

function numberValue(value){
    return value === "" ? NaN : +value
}