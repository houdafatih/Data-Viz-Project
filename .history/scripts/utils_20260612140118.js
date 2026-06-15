export function playersData(data){
    const players_list = [...new Set(data.map(dt => dt.player_name))];

    d3.select("#selectPlayer").selectAll("option").data(players_list)
    .enter().append("option").attr("value",dt=>dt).text(dt => dt);
}