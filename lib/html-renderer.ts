import { NumberLine, NumberLineViewModel, TickMarkViewModel } from "number-line";

export function render(numberLine:NumberLine,container:HTMLElement|string,lengthwise = true) {
	let div!:HTMLElement;
	if(container instanceof HTMLElement){
		div = container;
	}else{
		div = document.querySelector(container)! as HTMLElement;
	}

	div.style.position = "relative";
	div.style.width = "100%";
	div.style.height = "50px";
	div.style.borderBottom = '1px solid black';
	div.style.background = 'rgb(246, 246, 246)';
	// prevent the user from selecting any label text
	div.style.userSelect = 'none';
	
	// compute the bounding client rect of the div
	const size = div.getBoundingClientRect();
	let length!:number;
	if(lengthwise){
		length = size.width;
		div.style.overflowX = 'clip';
	}else{
		length = size.height;
		div.style.overflowY = 'clip';
	}

	const numberLineViewModel = numberLine.buildViewModel(length);
	for(let i =0;i<numberLineViewModel.tickMarks.length;i++){
		const tickMark = numberLineViewModel.tickMarks[i];
		const tickMarkElement = createTickMark(tickMark,lengthwise,numberLine,true);
		div.append(tickMarkElement);
		if(tickMark.label!=null){
			const label = createLabel(tickMark);
			div.append(label);

		}
	}
	return div;
}

function createTickMark(tickMark: TickMarkViewModel,lengthwise:boolean,numberLine:NumberLine,stickToOpposite=false):HTMLDivElement {
	const tickMarkElement = document.createElement("div");
	tickMarkElement.style.opacity = `${tickMark.height}`;
	tickMarkElement.style.position = `absolute`;
	tickMarkElement.style.background = 'black';
	if(lengthwise){
		tickMarkElement.style.left = `${tickMark.position}px`;
		tickMarkElement.style.width = `1px`;
		tickMarkElement.style.height = `${(tickMark.height/numberLine.biggestTickPatternValue)*100}%`;
		if(stickToOpposite){
			tickMarkElement.style.bottom = `0px`;
		}else{
			tickMarkElement.style.top = `0px`;
		}
	}else{
		tickMarkElement.style.top = `${tickMark.position}px`;
		tickMarkElement.style.height = `1px`;
		tickMarkElement.style.width = `${(tickMark.height/numberLine.biggestTickPatternValue)*100}%`;
		if(stickToOpposite){
			tickMarkElement.style.right = `0px`;
		}else{
			tickMarkElement.style.left = `0px`;
		}
	}
	return tickMarkElement;
}

function createLabel(tickMark: TickMarkViewModel):HTMLDivElement {
	const label = document.createElement("div");
	label.style.opacity = `${tickMark.height}`;
	label.style.position = `absolute`;
	label.style.color = 'black';
	label.style.left = `${tickMark.position}px`;
	label.innerHTML = tickMark.label;
	label.style.top = `100%`;
	label.style.transform = 'translate(-50%,0%)';
	return label;
}