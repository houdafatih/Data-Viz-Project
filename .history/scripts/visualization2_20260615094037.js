export function drawVisualization2(data,id,metric,eventT){
    if(data.length === 0) {
        clearCanvas(id)
        return
    }
     const canvas = createCanvas()

     clearCanvas(id)
     
     const svg = addSvg(id,canvas)

     draw_Header(svg,200,400,metric)
}
function createCanvas(){
    return{
        width : 600, height: 200, margin:{top: 20,right:100, bottom:60, left:50}
    }
}

function clearCanvas(id){
    d3.select(id).html("")
}

function addSvg(id,canvas){
    return d3.select(id).append("svg").attr("viewBox",`0 0 ${canvas.width} ${canvas.height}`)
}

function createData(data,metric){
   const new_data = data.slice().sort((a,b) => a.game_index - b.game_index)

   return new_data.slice(0,-1).map((d,j) => {
      const nextG = new_data[j+1]

      return {
        game_idx : d.game_index,
        nextg_index : nextG.game_idx,
        current_v: d[metric],
        next_v : nextG[metric],
        difference : nextG[metric] - d[metric],
        current_g : d,
        next_g : nextG
      }
   })
}

function draw_Header(svg,left,right,metric){
    svg.append("text").attr("x",left).attr("y",30)
    .attr("text-anchor","middle").attr("font-weight","bold").attr("font-size","9px").text("Game n")

    svg.append("text").attr("x",right).attr("y",30)
    .attr("text-anchor","middle").attr("font-weight","bold").attr("font-size","9px").text("Game n+1")

}

function metricName(metric){
    if(metric === "pts") return "Points"
    if(metric === "fga") return "Field Goal Attempts"
    if(metric === "min") return "Minutes"
    if(metric === "fg_pct") return "Field Goal Percentage"
    if(metric === "plus_minus") return "Plus / Minus"
}