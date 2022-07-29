import { AppPropsType } from 'next/dist/shared/lib/utils';
import Head from 'next/head';
import { ScriptProps } from 'next/script';
import React, { createRef, ReactNode } from 'react';
import Layout, { siteTitle } from '../components/layout';
import utilStyles from '../styles/utils.module.css';
import { NumberLine, ITickMarkLabelStrategy, NumberLineViewModel, TickMarkViewModel} from './my-number-line';

const numberScaleTickMarkStrategy:ITickMarkLabelStrategy={
	labelFor(value,index,position,numberLine){
		if(index==0 || index ==5){
			return Math.round(value)+"";
		}
		return "";
	}
}
const numberScale:NumberLine = new NumberLine({
	baseLength:1000,
	baseCoverage:1000,
	breakpointLowerbound:20,
	breakpointUpperBound:40,
	labelStrategy:numberScaleTickMarkStrategy,
	pattern:[3,1,1,1,1,2,1,1,1,1],

})

interface NumberLineState{
	model:NumberLineViewModel;
}

class NumberScaleTickMarks extends React.Component<NumberLineState,NumberLineState>{
	constructor(props:NumberLineState){
		super(props);
		this.state = {model:props.model}
	}

	private tickMarkLeftClassName(v:TickMarkViewModel):string{
		if(v.label!=null){
			switch(v.label.length){
				case 1: return "-left-1"
				case 2: return "-left-2"
				case 3: return "-left-3"
				case 4: return "-left-3"
				case 5: return "-left-4"
				default: return "-left-5"
			}
		}
		return "";
	}

	render(): React.ReactNode {
		let keyCounter=0;
		return (
			<div className='flex items-end' style={{columnGap:this.state.model.gap-1}}>
				{
					this.state.model.tickMarks.map((v,i,tvm)=>{
						if(v.patternIndex==0){
							const leftClassName = this.tickMarkLeftClassName(v);
							return (
							<div key={keyCounter++ +""} className={'relative h-3 bg-black'} style={{width:"1px"}}>
								<div className={"text-xs absolute -top-6 "+leftClassName}>{v.label}</div>
							</div>)
						}else if(v.patternIndex==5){
							return (<div key={keyCounter++ +""} className={'h-2 bg-black'} style={{width:"1px"}}></div>)
						}else{
							return (<div key={keyCounter++ +""} className={'h-1 bg-black'} style={{width:"1px"}}></div>)
						}
					})
				}
			</div>
		)
	}
}


class Home extends React.Component {

	resizeObserver!:ResizeObserver;
	resizeElement:React.RefObject<HTMLDivElement> = createRef();
	numberLineContainer:React.RefObject<NumberScaleTickMarks> = createRef();

	numberLineViewModel!:NumberLineViewModel;

	constructor(props:any){
		super(props);
		// initial view model will be updated later
		this.numberLineViewModel = numberScale.buildViewModel(0)
	}

	componentDidMount(){

		this.resizeObserver = new ResizeObserver((entries)=>{
			
			for (let entry of entries) {
				console.log("Rebuilding number line view model for width "+entry.contentRect.width);
				this.numberLineContainer.current?.setState({model:numberScale.buildViewModel(entry.contentRect.width)})
			}
		});

		this.resizeObserver.observe(this.resizeElement.current!);

		
	}

	componentWillUnmount(){
		if(this.resizeObserver){
			this.resizeObserver.disconnect();
		}
	}

	render(): React.ReactNode {
		return (
			<>
				<Layout home>
					<Head>
					<title>{siteTitle}</title>
					</Head>
					<section className={'text-center '+utilStyles.headingMd}>
						<p>Virtually infinite,pannable,zoomable and completely customizable</p>
						<p>
						Drag the number line below with your mouse/trackpad. Ctrl + Mousewheel for zooming
						</p>
						<a href="https://github.com/nikhilnxvverma1/number-line">Github</a>
					</section>
				</Layout>
				<div ref={this.resizeElement} className="w-full h-12 flex flex-col justify-end bg-slate-50">
					<NumberScaleTickMarks ref={this.numberLineContainer} model={this.numberLineViewModel}></NumberScaleTickMarks>
				</div>
			</>
	  )
	}
	
}

export default Home
