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
     addSummaryCard(svg,new_data,eventT,canvas)
     
}
function createCanvas(new_data){
    console.log(100 + new_data.length *20)
    return{
        width : 600, height: 100 + new_data.length *20 , margin:{top: 20,right:100, bottom:60, left:50}
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
        eventN: j+1,
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
    const tooltip = toolTip2(new_data)

    const rows = svg.selectAll(".response-row").data(new_data).enter()
     .append("g").attr("class","response-row")
     .attr("transform",(d,j) => `translate(0,${margin.top+j*r_height})`)

    rows.append("text").attr("x",100).attr("y",35).text(d =>`Event ${d.eventN}` )
     .attr("font-size","7px").attr("font-weight","bold")
    rows.append("text").attr("x",left).attr("y",35).attr("text-anchor","end").text(d => d.current_v).attr("font-size","6px")

    const line_scale = d3.scaleLinear().domain([0,d3.max(new_data, d => Math.abs(d.difference))]).range([20,180])
   
    rows.append("line").attr("x1",left+10).attr("class","line2")
    .attr("x2",d => { const l= line_scale(Math.abs(d.difference))
        return left+l

    })
    .attr("y1",35).attr("y2",35).attr("stroke","black").attr("stroke-dasharray","5 3")
    .on("mouseover",function(event,d){
        tooltip.style("visibility","visible").html(tooltipInformations2(d))
     })
     .on("mousemove",function(event){
        tooltip.style("left",event.clientX+15+"px")
          .style("top",event.clientY-20+"px")
     })
     .on("mouseout",function(){
        tooltip.style("visibility","hidden")
     })

    rows.append("circle").attr("cx",left+10).attr("cy",35).attr("r",2).attr("fill","#fdb927")
    rows.append("circle").attr("cx",d => { const l= line_scale(Math.abs(d.difference))
        return left+l

    }).attr("cy",35).attr("r",2).attr("fill","#fdb927")

    rows.append("text").attr("x",right).attr("y",35).text(d => d.next_v).attr("font-size","6px")

    rows.append("text").attr("x",right+50).attr("y",35).text(d => difference_label(d.difference))
    .attr("font-size","6px").attr("fill","#552503").attr("font-weight","bold")
    
}

function difference_label(diff){
    if(diff > 1) return "increase"
    if(diff < -1) return "decrease"
    if(diff < 0) return "slightly decrease"
    if(diff > 0) return "slightly increase"
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

function addSummaryCard(svg,new_data,eventT,canvas){
    
    svg.append("text").attr("x",50).attr("y",canvas.height-50)
    .attr("font-weight","bold").text(`Average change after ${eventT} games:`).attr("font-size","7px")

    const metrics_change = new_data.map(d => {
        const pts = d.current_g["next_pts"] - d.current_g["pts"]
        const fga = d.current_g["next_fga"] - d.current_g["fga"]
        const min = d.current_g["next_min"] - d.current_g["min"]
        const fg_pct = d.current_g["next_fg_pct"] - d.current_g["fg_pct"]

        return {"pts":pts,"fga":fga,"min":min,"fg_pct":fg_pct}
    })
    
    const means = [
        {"avg":d3.mean(metrics_change,d => d.pts),"name":"PTS"},
        {"avg":d3.mean(metrics_change,d => d.fga),"name":"FGA"},
        {"avg":d3.mean(metrics_change,d => d.min),"name":"MIN"},
        {"avg":d3.mean(metrics_change,d => d.fg_pct),"name":"FG%"}
    ]
    
    means.forEach((element,i) => {
        let position = canvas.margin.left+i*50
        svg.append("text").attr("x",position).attr("y",canvas.height-30)
        .attr("font-size","6px").attr("font-weight","bold")
        .text(`${element.name} : `)   
        svg.append("text").attr("x",position+20).attr("y",canvas.height-30)
        .attr("font-size","6px")
        .text(`${element.avg.toFixed(2)}`)
 
    });
    
}

function toolTip2(){
    let tooltip = d3.select("body").select(".tooltip2")
    if(tooltip.empty()){
        tooltip = d3.select("body").append("div").attr("class","tooltip2")
    }

    return tooltip
}

function tooltipInformations2(data){
    console.log(data)
    return `<strong> Game n - Date: ${data.current_g["game_date"]} </strong><br>
            <strong> Game n - Opponent: ${data.current_g["opponent"]} </strong><br>
            <strong> Game n - Points: ${data.current_g["pts"]} </strong><br>
            <strong> Game n+1 - Date: ${data.next_g["game_date"]} </strong><br>
            <strong> Game n+1 - Opponent: ${data.next_g["opponent"]} </strong><br>
            <strong> Game n+1 - Points: ${data.next_g["pts"]} </strong><br>
    `
}