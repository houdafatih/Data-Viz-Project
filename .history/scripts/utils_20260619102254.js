export function playersData(data){
    const players_list = [...new Set(data.map(dt => dt.player_name))]

    d3.select("#playerSelect").selectAll(".players-options").data(players_list)
    .enter().append("option").attr("class","players-options").attr("value",dt=>dt).text(dt => dt)
}

export function seasonData(data){
    const seasons_list = [...new Set(data.map(dt => dt.season_year))]
    d3.select("#seasonSelect").selectAll(".seasons-options").data(seasons_list)
    .enter().append("option").attr("class","seasons-options").attr("value",dt=>dt).text(dt => dt)
}