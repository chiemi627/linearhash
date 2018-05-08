import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Cell extends React.Component{
  render(){
    return <span className="cell">{this.props.value}</span>; 
  }
}

class Bucket extends React.Component{

  render() {
    const listCells = this.props.bucket.cells.map((cell)=>{
        if(cell){
          return <li><Cell value={cell}/></li>;
        }else{
          return <li><Cell value="-"/></li>;
        }
      });

    return (
      <ul className="bucket">
        {listCells}
      </ul>
    );
  }

}

class Slot extends React.Component {
  
    render() {
      const listBuckets = this.props.slot.buckets.map((bucket)=>
        <li><Bucket bucket={bucket}/></li>);
      if(this.props.pointer===1){
        return (
          <ul className="slot" data-slottype="splitpointer">
            {listBuckets}
          </ul> );
      }else{
        return (
          <ul className="slot">
            {listBuckets}
          </ul>
        );
      }
    }
}

class Stage extends React.Component {
  
  constructor(props){
    super(props);
    this.state = {
      insertvalue: null,
      initialslots: 2,
      bucketsize: 2,
      level: 0,
      pointer: 0,
      slots: [
      ]
    };
    for(var i=0;i<this.state.initialslots;i++){
      this.state.slots.push({
        buckets:[
          {cells:Array(this.state.bucketsize).fill(null)}
        ]});
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

    handleSubmit(){
      const slots = this.state.slots;
      const value = parseInt(this.state.insertvalue,10);
      var level = this.state.level;
      var pointer = this.state.pointer;
      const base = this.state.initialslots*Math.pow(2,level);
      const next_base = base*2;
      var hashvalue = value % base;
      if(hashvalue<pointer){
        hashvalue = value % next_base;
      }
      var overflow = false;
      var insert = false;

      insertvalue:
      for(var i=0;i<slots[hashvalue].buckets.length;i++){
        const bucket = slots[hashvalue].buckets[i];
        for(var j=0;j<bucket.cells.length;j++){
          if(!bucket.cells[j]){ 
            slots[hashvalue].buckets[i].cells[j]=value;
            insert = true;
            break insertvalue;
          }
        }
      }
      //overflowバケットを用意してそこに入れる
      if(!insert){
        const overflowbucket = {cells: Array(this.state.bucketsize).fill(null)};
        overflowbucket.cells[0]=value;
        slots[hashvalue].buckets.push(overflowbucket);
      }
      if(slots[hashvalue].buckets.length>1){
        //分割ポインタのあるところを分割する
        var cells=[];
        slots[pointer].buckets.forEach((bucket)=>{
            Array.prototype.push.apply(cells,bucket.cells);
          }
        );
        cells = cells.filter(v=>v);
        console.log("cells="+cells.join(","));
        slots.push({buckets: [
                      {cells: Array(this.state.bucketsize).fill(null)}
                     ]});
        slots[pointer]={buckets: [                  
                      {cells: Array(this.state.bucketsize).fill(null)}
                     ]};
        cells.forEach((cell)=>{
          var index = cell%next_base;
          var inserted = false;
          for(var i=0;i<slots[index].buckets.length;i++){
            const bucket = slots[index].buckets[i];
            for(var j=0;j<bucket.cells.length;j++){
              if(!bucket.cells[j]){
                slots[index].buckets[i].cells[j]=cell;
                inserted = true;
                break; 
              }
            }
          }
          if(!inserted){
            var bucket = {cells:Array(this.state.bucketsize).fill(null)};
            bucket.cells[0]=cell;
            slots[index].buckets.push(bucket);
          }
        });
        pointer++;
        if(pointer===base){
          level++;
          pointer=0;
        }
        this.setState({pointer:pointer});
        this.setState({level:level});
      }
      this.setState({slots: slots});
    }

    handleChange(event){
      if(event.target.name === "insertvalue"){
        this.setState({insertvalue: event.target.value});
      }
    }

    render() {
      var listSlots = [];
      for(var i=0;i<this.state.slots.length;i++){
        var pnt = i === this.state.pointer ? 1 : 0;
        listSlots.push(<li><Slot slot={this.state.slots[i]} 
                        pointer={pnt}/></li>);
      }
      return (
        <form action="javascript:eval(0)" onSubmit={this.handleSubmit}>
          <input type="text" name="insertvalue" onChange={this.handleChange}/>
          <button type="submit">Insert</button>
          <ul classname="metadata">
            <li>Level = {this.state.level} </li>
          </ul>
          <ol className="stage">
            {listSlots}
          </ol>
        </form>
      );
    }
}


ReactDOM.render(
  <Stage />,
    document.getElementById('root')
    );
