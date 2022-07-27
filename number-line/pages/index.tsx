import Head from 'next/head';
import React, { createRef, ReactNode } from 'react';
import Layout, { siteTitle } from '../components/layout';
import utilStyles from '../styles/utils.module.css';
import { NumberLine, ITickMarkLabelStrategy, NumberLineViewModel} from './my-number-line';

const numberScaleTickMarkStrategy:ITickMarkLabelStrategy={
	labelFor(value,index,position,numberLine){
		if(index==0 || index ==5){
			return value+"";
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

const NumberScaleTickMarks=(props:{model:NumberLineViewModel}):JSX.Element=>{
	let keyCounter=0;
	return (
		<div className='flex' style={{columnGap:props.model.gap-1}}>
			{
				props.model.tickMarks.map((v,i,tvm)=>{
					if(v.patternIndex==0){
						return (<div key={keyCounter++ +""} className={'h-3 bg-black'} style={{width:"1px"}}></div>)
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

class Home extends React.Component {

	resizeObserver!:ResizeObserver;
	resizeElement:React.RefObject<HTMLDivElement> = createRef();

	numberLineViewModel!:NumberLineViewModel;

	constructor(){
		super({});
		// initial view model will be updated later
		this.numberLineViewModel = numberScale.buildViewModel(0)
	}

	componentDidMount(){

		
		this.resizeObserver = new ResizeObserver((entries)=>{
			let width:number =0;
			let height:number =0;
			
			for (let entry of entries) {
				// if(entry.contentBoxSize) {
				//   // Firefox implements `contentBoxSize` as a single content rect, rather than an array
				//   const contentBoxSize = Array.isArray(entry.contentBoxSize) ? entry.contentBoxSize[0] : entry.contentBoxSize;
					
				//   width= contentBoxSize.width;
				//   height = contentBoxSize.height;
				// } else {
				// 	width= entry.contentRect.width;
				// 	height = entry.contentRect.height;
				// }
				console.log("Rebuilding number line view model for width "+entry.contentRect.width);
				this.numberLineViewModel = numberScale.buildViewModel(entry.contentRect.width)
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
				<div ref={this.resizeElement} className="w-full h-12 bg-red-300">
					<NumberScaleTickMarks model={this.numberLineViewModel}></NumberScaleTickMarks>
				</div>
			</>
	  )
	}
	
}

export default Home
