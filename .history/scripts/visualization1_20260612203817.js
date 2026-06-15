export function drawVisualization1(data,id,metric){

     const canvas = createCanvas()
     
     const svg = addSvg(id,canvas)
     const sc = addScales(data,canvas,metric)

     addAxes(svg,sc,canvas)
}

function createCanvas(){
    return{
        width : 500, height: 200, margin:{top: 20, bottom:60,right:40, left:50}
    }
}

function addSvg(id,canvas){
    return d3.select(id).append("svg").attr("viewBox",`0 0 ${canvas.width} ${canvas.height}`)
}

function addScales(data,canvas,metric){
    const xScale = 
    d3.scaleLinear().domain(d3.extent(data,dt => dt.game_index))
    .range([canvas.margin.left,canvas.width - canvas.margin.right])

    const yScale = 
      d3.scaleLinear().domain([0,d3.max(data,d => d[metric])])
      .nice().range([canvas.height - canvas.margin.bottom,canvas.margin.top])

    return {xScale,yScale} 
}

function addAxes(svg, scales, canvas){
    svg.append("g").attr("transform",`translate(0, ${canvas.height - canvas.margin.bottom})`)
    .call(d3.axisBottom(scales.xScale))

    svg.append("g").attr("transform",`translate(${canvas.margin.left},0)`)
    .call(d3.axisLeft(scales.yScale))
}