import {playersData} from "./scripts/utils.js";

d3.csv("data/nba.csv",d3.autoType).then(function(data){
   playersData(data)
});