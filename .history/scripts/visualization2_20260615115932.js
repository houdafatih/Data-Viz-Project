export function drawVisualization2(data,id,metric,eventT){
    if(data.length === 0) {
        clearCanvas(id)
        return
    }
    
     
     let new_data = createData(data,metric)
    
     if(eventT !== "all"){
        new_data = new_data.filter(d => performance_filter(d.current_g,data,metric) === eventT)
     }
    
     const canvas = createCanvas(new_data)

     clearCanvas(id)
     
     const svg = addSvg(id,canvas)

     draw_Header(svg,200,400)
     draw_Rows(svg,new_data,200,400,canvas.margin,15)
     addSummaryCard(svg,new_data,metric,eventT,canvas)
     
}
function createCanvas(new_data){
    return{
        width : 600, height: 50 + new_data.length * 50 , margin:{top: 20,right:100, bottom:60, left:50}
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
        eventN: String.fromCharCode(65+j),
        game_idx : d.game_index,
        nextg_index : nextG.game_index,
        current_v: d[metric],
        next_v : nextG[metric],
        difference : nextG[metric] - d[metric],
        current_g : d,
        next_g : nextG
      }
   })
}

function draw_Header(svg,left,right){
    svg.append("text").attr("x",left).attr("y",30)
    .attr("text-anchor","middle").attr("font-weight","bold").attr("font-size","8px").text("Game n")

    svg.append("text").attr("x",right).attr("y",30)
    .attr("text-anchor","middle").attr("font-weight","bold").attr("font-size","8px").text("Game n+1")

}

function draw_Rows(svg,new_data,left,right,margin,r_height){

    const rows = svg.selectAll(".response-row").data(new_data).enter()
     .append("g").attr("class","response-row")
     .attr("transform",(d,j) => `translate(0,${margin.top+j*r_height})`)

    rows.append("text").attr("x",100).attr("y",35).text(d =>`Event ${d.eventN}` )
     .attr("font-size","7px").attr("font-weight","bold")
    rows.append("text").attr("x",left).attr("y",35).attr("text-anchor","end").text(d => d.current_v).attr("font-size","6px")

    rows.append("line").attr("x1",left+10).attr("x2",right-10)
    .attr("y1",35).attr("y2",35).attr("stroke","black").attr("stroke-dasharray","5 3")
    .attr("stroke-width",1.5)

    rows.append("circle").attr("cx",left+10).attr("cy",35).attr("r",2).attr("fill","#fdb927")
    rows.append("circle").attr("cx",right-10).attr("cy",35).attr("r",2).attr("fill","#fdb927")

    rows.append("text").attr("x",right).attr("y",35).text(d => d.next_v).attr("font-size","6px")

    rows.append("text").attr("x",right+50).attr("y",35).text(d => difference_label(d.difference))
    .attr("font-size","6px").attr("fill","#552503").attr("font-weight","bold")
    
}

function difference_label(diff){
    if(diff > 1) return "increase"
    if(diff < -1) return "decrease"
    return "stable"
}

function performance_filter(d,data,metric){
   const bLine = d3.mean(data,dt => dt[metric])
   const th = Math.abs(bLine) * 0.2
   const dv = d[metric] - bLine

   if(dv > th) return "hot"
   if(dv < -th) return "cold"
   return "normal"
}

function addSummaryCard(svg,new_data,metric,eventT,canvas){
    const mean_change = d3.mean(new_data,d => d.difference)

    svg.append("text").attr("x",50).attr("y",canvas.height-30)
    .attr("font-weight","bold").text(`Average change after ${eventT} games:`)

    svg.append("text").attr("x",canvas.margin.left).attr("y",canvas.height-10)
    
}