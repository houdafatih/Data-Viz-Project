export function playersData(data,season){
    const season_data = season ? data.filter(dt => dt.season_year == season) : data
    const players_list = [...new Set(season_data.map(dt => dt.player_name))].sort()

    d3.select("#playerSelect").selectAll(".players-options").remove()
    d3.select("#playerSelect").selectAll(".players-options").data(players_list)
    .enter().append("option").attr("class","players-options").attr("value",dt=>dt).text(dt => dt)

    return players_list
}

export function seasonData(data){
    const seasons_list = [...new Set(data.map(dt => dt.season_year))]
    .sort((a,b) => seasonStart(b) - seasonStart(a))
    d3.select("#seasonSelect").selectAll(".seasons-options").data(seasons_list)
    .enter().append("option").attr("class","seasons-options").attr("value",dt=>dt).text(dt => dt)
}

function seasonStart(season){
    return +String(season).slice(0,4)
}