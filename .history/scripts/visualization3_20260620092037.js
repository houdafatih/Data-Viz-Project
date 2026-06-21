export function drawVisualization3(data,id,metric,threshold){
     if(data.length === 0) {
        clearCanvas(id)
        return
    }
     const canvas = createCanvas()

     clearCanvas(id)
     
     const svg = addSvg(id,canvas)

     calculateBaseline(data,metric)
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

function calculateBaselineAndClassifyGames(data,metric)
{
  const baseline = d3.mean(data,dt=> dt[metric])

  const classification = data.map((d,j)=> {
    let perf_label = ""
    if(d[metric] > baseline + 5){
        perf_label = "hot"
    }else if(d[metric] < baseline - 5){
        perf_label = "cold"
    }
    else perf_label = "normal"

    return {
        ...d,
        g_num : i+1,
        perf_label:perf_label,
        difference : d[metric] - baseline
    }
  })

    return{
        baseline : baseline,
        classification : classification
    }
}