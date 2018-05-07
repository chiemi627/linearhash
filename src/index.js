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
      return (
        <ul className="slot">
          {listBuckets}
        </ul>
      );
    }
}

class Stage extends React.Component {
  
  constructor(props){
    super(props);
    this.state = {
      insertvalue: null,
      initialslots: 2,
      level: 0,
      pointer: 0,
      slots: [
        {buckets: [
          {cells: Array(2).fill(null)}
        ]},
        {buckets: [
          {cells: Array(2).fill(null)}
        ]}
      ]
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

    handleSubmit(){
      const slots = this.state.slots;
      const value = parseInt(this.state.insertvalue);
      var level = this.state.level;
      var pointer = this.state.pointer;
      const base = this.state.initialslots*Math.pow(2,level);
      const next_base = base*2;
      var hashvalue = value % base;
      if(hashvalue<pointer){
        hashvalue = value % next_base;
      }
      var cells = [];
      var overflow = false;
      slots[hashvalue].buckets.forEach((bucket)=>{
          Array.prototype.push.apply(cells,bucket.cells);
        });
      if(!cells.includes(value)){
        if(cells.includes(null)){
          for(var i=0;i<slots[hashvalue].buckets.length;i++){
            const bucket = slots[hashvalue].buckets[i];
            for(var j=0;j<bucket.cells.length;j++){
              if(!bucket.cells[j]){
                if(i>0){overflow=true;}
                slots[hashvalue].buckets[i].cells[j]=value;
                break;
              }
            }
          }
        }else{
          slots[hashvalue].buckets.push(
            {cells: [value,null]}
          );
          overflow=true;
        }
        if(overflow){
          //分割ポインタのあるところを分割する
          cells=[];
          slots[pointer].buckets.forEach((bucket)=>{
              Array.prototype.push.apply(cells,bucket.cells);
            }
          );
          cells = cells.filter(v=>v);
          console.log("cells="+cells.join(","));
          slots.push({buckets: [
                      {cells: Array(2).fill(null)}
                     ]});
          slots[pointer]={buckets: [                  
                      {cells: Array(2).fill(null)}
                     ]};
          console.log("pointer="+pointer);
          cells.forEach((cell)=>{
            var index = cell%next_base;
            var inserted = false;
            for(var i=0;i<slots[index].buckets.length;i++){
              console.log("index="+index);
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
              slots[index].buckets.push({cells:[cell,null]});
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
      }

      this.setState({slots: slots});
    }

    handleChange(event){
      if(event.target.name === "insertvalue"){
        this.setState({insertvalue: event.target.value});
      }
    }

    render() {
      const listSlots = this.state.slots.map((slot)=>
        <li><Slot slot={slot}/></li>
      );
      return (
        <form action="javascript:void(0)" onSubmit={this.handleSubmit}>
          <input type="text" name="insertvalue" onChange={this.handleChange}/>
          <button type="submit">Insert</button>
          <ul classname="metadata">
            <li>Level = {this.state.level} </li>
            <li>Split pointer = {this.state.pointer} </li>
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
