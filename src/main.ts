import { render } from "../lib/html-renderer";
import { INumberLineOptions, ITickMarkLabelStrategy, NumberLine } from "../lib/number-line";

const labelStrategy:ITickMarkLabelStrategy={
	labelFor:(value,index,position, numberLine)=>{
		if(index%5==0){
			// return value in string to just on precision on floating point
			return value.toFixed(0);
		}
		return null;
	}
	
}
const defaultOptions:INumberLineOptions={
	pattern:[3,1,1,1,1,2,1,1,1,1],
	breakpointLowerbound:100,
	breakpointUpperBound:150,
	labelStrategy:labelStrategy
}


const panLine = new NumberLine(defaultOptions);
// panLine.panBy(-205);
// panLine.panBy(-130);
const panDiv = document.querySelector("#pan") as HTMLElement;
render(panLine,panDiv);

let draggingPanDiv = false;
let lastX = -1;

panDiv.onmousedown = (event)=>{draggingPanDiv = true,lastX = event.clientX;}
panDiv.onmouseup = (event)=>{draggingPanDiv = false}
panDiv.onmousemove = (event)=>{
	if(draggingPanDiv){
		panLine.panBy(lastX - event.clientX);
		// remove all children from panDiv element
		panDiv.innerHTML = '';
		render(panLine,panDiv);

		lastX = event.clientX;
	}
}


const zoomLine = new NumberLine(defaultOptions);
// zoomLine.zoomBy(-205);
// zoomLine.zoomAround(300,5);
// zoomLine.zoomAround(300,1);
// zoomLine.zoomAround(300,1);
// zoomLine.zoomAround(300,2);
// zoomLine.zoomAround(300,1);

const zoomDiv = document.querySelector("#positional-zoom") as HTMLElement;
render(zoomLine,zoomDiv);

let draggingzoomDiv = false;
let lastXInZoomDiv = -1;

zoomDiv.onmousedown = (event)=>{draggingzoomDiv = true,lastXInZoomDiv = event.clientX;}
zoomDiv.onmouseup = (event)=>{draggingzoomDiv = false}
zoomDiv.onmousemove = (event)=>{
	if(draggingzoomDiv){
		zoomLine.panBy(lastXInZoomDiv - event.clientX);
		// remove all children from zoomDiv element
		zoomDiv.innerHTML = '';
		render(zoomLine,zoomDiv);

		lastXInZoomDiv = event.clientX;
	}
}

zoomDiv.onwheel = (event)=>{
	if(event.metaKey || event.ctrlKey){
		console.log(event.deltaY * 0.001);
		zoomLine.zoomAround(event.clientX, event.deltaY);
		console.log(zoomLine.magnification);
	}

	// remove all children from zoomDiv element
	zoomDiv.innerHTML = '';
	render(zoomLine,zoomDiv);
}