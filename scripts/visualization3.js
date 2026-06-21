
const colors_labels = [
    {lab:"Hot games",color:"#d73027"},
    {lab:"Normal games",color:"#fff"},
    {lab:"Cold games",color:"#4575b4"}
]
export function drawVisualization3(data,id,metric,threshold,selectedGames,onSelectStreak){
     if(data.length === 0) {
        showNoData(id,"No games available for this player and season.")
        return
    }
   
     const baseline_classif = calculateBaselineAndClassifyGames(data,metric,threshold)
     const streaks = streakDetection(baseline_classif.classification)
     const num_lines = baseline_classif.classification.length/30

     const canvas = createCanvas(num_lines,streaks.length)

     clearCanvas(id)
     
     const svg = addSvg(id,canvas)

     
     const scale = colorScale()

     addTitle(svg,canvas,baseline_classif.baseline,metric)

     addLablels(svg,baseline_classif.classification,canvas)

     addCells(svg,baseline_classif.classification,canvas,scale,selectedGames)

     addLegends(svg,canvas)

     addStreaks(svg,canvas,streaks,baseline_classif.classification,selectedGames,onSelectStreak)
     
}

function createCanvas(num_lines,streaks){
    return{
        width : 800, height: 100 * num_lines + 20 * streaks, margin:{top: 20,right:100, bottom:60, left:50}
    }
}

function clearCanvas(id){
    d3.select(id).html("")
}

function showNoData(id,message){
    d3.select(id).html(`<p class="empty-message">${message}</p>`)
}

function addSvg(id,canvas){
    return d3.select(id).append("svg").attr("viewBox",`0 0 ${canvas.width} ${canvas.height}`)
}

function convertThreshold(threshold){
    if(threshold == "medium") return 5
    else if (threshold == "loose") return 3
    else return 8
}

function calculateBaselineAndClassifyGames(data,metric,threshold)
{
  const baseline = d3.mean(data,dt=> dt[metric])
  const thre_shold = convertThreshold(threshold)

  const classification = data.map((d,j)=> {
    let perf_label = ""
    if(d[metric] > baseline + thre_shold){
        perf_label = "hot"
    }else if(d[metric] < baseline - thre_shold){
        perf_label = "cold"
    }
    else perf_label = "normal"

    return {
        ...d,
        g_num : j+1,
        perf_label:perf_label,
        difference : d[metric] - baseline
    }
  })

    return{
        baseline : baseline,
        classification : classification
    }
}

function colorScale(){
    const color_sc = d3.scaleOrdinal()
    .domain(["hot","normal","cold"])
    .range(["#d73027","#fff","#4575b4"])
    return color_sc
}

function addTitle(svg,canvas,baseline,metric){
    svg.append("text").attr("x",canvas.margin.left).attr("y",25).attr("font-size","9px")
    .attr("font-weight","bold").text("Hot/Cold Streak Explorer")

    svg.append("text").attr("x",canvas.margin.left).attr("y",45).attr("font-size","9px")
    .text(`Metric: ${metric} | Baseline: ${baseline.toFixed(2)}`)
}

function addLablels(svg, classification,canvas){
    const num = 30
    svg.selectAll(".game-label").data(classification).enter().append("text").attr("class","game-label")
    .attr("x",(d,j) => canvas.margin.left + (j%num) * 18 + 10 /2).attr("y",(d,j) => 75 + (Math.floor(j/num))*40)
    .attr("text-anchor","middle").attr("font-size","6px").text(d => `G${d.g_num}`)
}

function addCells(svg, classification,canvas,scale,selectedGames){
    const num = 30
    svg.selectAll(".game-cell").data(classification).enter().append("rect").attr("class","game-cell")
    .attr("x",(d,j) => canvas.margin.left + (j%num) * 18).attr("y",(d,j) => 85 + (Math.floor(j/num))*40)
    .attr("width",d => isSelectedGame(selectedGames,d.game_index) ? 8 : 5)
    .attr("height",d => isSelectedGame(selectedGames,d.game_index) ? 8 : 5)
    .attr("fill",d => scale(d.perf_label))
    .attr("stroke",d => isSelectedGame(selectedGames,d.game_index) ? "#000" : "#222")
    .attr("stroke-width",d => isSelectedGame(selectedGames,d.game_index) ? 1.2 : 0.5)
}

function addLegends(svg,canvas){
    svg.selectAll(".legend-rec").data(colors_labels).enter().append("rect").attr("class",".legend-rec")
    .attr("x",canvas.width - 100).attr("y",(d,j) => 75 + j * 25)
    .attr("width",6).attr("height",6).attr("fill",d => d.color).attr("stroke","#222")

    svg.selectAll(".legend-tex").data(colors_labels).enter().append("text").attr("class",".legend-tex")
    .attr("x",canvas.width - 170).attr("y",(d,j) => 80 + j * 25).attr("font-size","8px").text(d => d.lab)
}

function addStreaks(svg,canvas,streaks,data,selectedGames,onSelectStreak){
    svg.append("text").attr("x",canvas.margin.left).attr("y",200).attr("font-size","8px").attr("font-weight","bold")
    .text("Detected Streaks")

    if(streaks.length == 0){
        svg.append("text").attr("x",canvas.margin.left).attr("y",210).attr("font-size","8px")
         .text(".... None a streak is detected")
        return
    }

    svg.selectAll(".streak-list").data(streaks).enter().append("text").attr("class",".streak-list")
    .attr("x",canvas.margin.left).attr("y",(d,j) => 215 + j * 20).attr("font-size","8px")
    .text(d => `${d.type} streak : G${d.start} - G${d.end}, length is ${d.length}`)
    .attr("fill",d => isSelectedStreak(selectedGames,d) ? "#d94801" : "#000")
    .attr("font-weight",d => isSelectedStreak(selectedGames,d) ? "bold" : "normal")
    .attr("cursor","pointer").style("user-select","none")
    .on("click",function(event,d){
        if(onSelectStreak) onSelectStreak(d)
        summaryPanelStreak(svg,d,data)
    })
}

function isSelectedStreak(selectedGames,streak){
    if(!selectedGames || !selectedGames.indexes || selectedGames.indexes.length === 0) return false
    return selectedGames.indexes.includes(streak.start) && selectedGames.indexes.includes(streak.end)
}

function isSelectedGame(selectedGames,gameIndex){
    return selectedGames && selectedGames.indexes && selectedGames.indexes.includes(gameIndex)
}

function streakDetection(data){
    let streak_list = []
    let type_current = null
    let start = 0

    data.forEach((element,j) => {
        if(element.perf_label === "normal"){
            if(type_current !== null){
                streak_list = pushStreak(start,j-1,streak_list,type_current,data)
                type_current = null
            }
            return
        }

        if(type_current === null){
            type_current = element.perf_label
            start = j
        }
        else if(element.perf_label !== type_current){
            streak_list = pushStreak(start,j-1,streak_list,type_current,data)
            type_current = element.perf_label
            start = j
        }

        if(j === data.length-1 && type_current !== null ){
            streak_list = pushStreak(start,j,streak_list,type_current,data)
        }
    });
    return streak_list

}

function pushStreak(start,end,streak_list,type_c,data){
    const l = end - start + 1

    if(l >= 2){
        streak_list.push({
            type:type_c,
            start:data[start].g_num,
            end : data[end].g_num,
            length:l
        })
    }

    return streak_list
}

function summaryPanelStreak(svg,streak,data){
    
    let games_list = data.filter(dt => dt.g_num >= streak.start && dt.g_num <= streak.end)

    const mean_pts = d3.mean(games_list,g=>g.pts).toFixed(2)
    const mean_min = d3.mean(games_list,g=>g.min).toFixed(2)
    const mean_fg = d3.mean(games_list,g=>g.fg_pct).toFixed(2)
    
    const next_g_diff = games_list[games_list.length-1].next_pts

    d3.selectAll(".summary").remove()

    const element = d3.select("body").append("div").attr("class","summary")

    element.html(
        `<strong>Selected ${streak.type} streak : </strong>G${streak.start} - G${streak.end}<br>
         <p><strong>Length : </strong>${streak.length}</p>
         <p><strong>Average Points : </strong>${mean_pts}</p>
         <p><strong>Average Minutes : </strong>${mean_min}</p>
         <p><strong>Average FG% : </strong>${mean_fg}</p>
         <p><strong>Next game difference : </strong>${next_g_diff}</p>
         <button id="summary-close">Close</button>`
    )
    d3.select("#summary-close").on("click",function(){
        element.remove()
    })

}