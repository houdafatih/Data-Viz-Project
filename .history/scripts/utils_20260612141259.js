export function playersData(data){
    const players_list = [...new Set(data.map(dt => dt.player_name))];

    d3.select("#selectPlayer").selectAll("option").data(players_list)
    .enter().append("option").attr("value",dt=>dt).text(dt => dt);
}

export function seasonData(data){
    const seasons_list = [...new Set(data.map(dt => dt.season_year))];
    console.log(seasons_list)
    d3.select("#seasonSelect").selectAll("option").data(seasons_list)
    .enter().append("option").attr("value",dt=>dt).text(dt => dt);
}