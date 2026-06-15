export function drawVisualization1(data,id){

    createCanvas()
}

function createCanvas(){
    return{
        width : 700, height: 300, margin:{top: 20, bottom:60,right:40, left:50}
    }
}

function addScales(data,canvas){
    const xScale = 
    d3.scaleLinear().domain(d3.extent(data,dt => dt.game_index))
    .range([canvas.margin.left,canvas.width - canvas.margin.right])

    const yScale = 
      d3.scaleLinear().domain([0,d3.max(data,d =>{Math.max(d.pts,d.rolling_pts_avg,d.baseline_pts)})])
      .nice().range([canvas.height - canvas.margin.bottom,canvas.margin.top])

    return {xScale,yScale} 
}