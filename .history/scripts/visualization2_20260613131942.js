export function drawVisualization2(data,id,metric){
    if(data.length === 0) {
        clearCanvas(id)
        return
    }
     const canvas = createCanvas()

     clearCanvas(id)
     
     const svg = addSvg(id,canvas)
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
        game_idx : d.game_index
      }
   })
}