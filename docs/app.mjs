const el=id=>document.getElementById(id), output=()=>el("result");
let urls=[];
function show(message) {
  for(const url of urls) URL.revokeObjectURL(url);
  urls=[];
  output().replaceChildren();
  const summary=document.createElement("p");
  summary.className="result-summary";
  summary.setAttribute("aria-live","polite");
  summary.textContent=message;
  output().append(summary);
}
function run(callback) {
  el("run").onclick=async()=>{
    el("run").disabled=true;
    try{await callback();}catch(error){show(error.message);}
    finally{el("run").disabled=false;}
  };
}
function table(rows) {
  const wrap=document.createElement("div"), data=document.createElement("table"), head=data.createTHead(), body=data.createTBody();
  wrap.className="table-wrap";
  rows.forEach((row,index)=>{
    const tr=(index?body:head).insertRow();
    for(const value of row){
      const cell=document.createElement(index?"td":"th");
      cell.textContent=String(value??"—");
      if(!index)cell.scope="col";
      tr.append(cell);
    }
  });
  wrap.append(data); output().append(wrap);
}
function download(name,contents,type) {
  const url=URL.createObjectURL(new Blob([contents],{type}));
  urls.push(url);
  const anchor=document.createElement("a");
  anchor.className="button quiet export";
  anchor.textContent="Download "+name;
  anchor.download=name;
  anchor.href=url;
  output().append(anchor);
}
function parseJson(id){try{return JSON.parse(el(id).value);}catch{throw Error("Enter valid JSON in the "+(id==="media"?"media dimensions":"fixture")+" field.");}}
import {preview} from "./tool.mjs";
el("sample").onclick=()=>{
 el("draft").value="Our workshop is open this Friday. See the sample schedule at https://events.example.test/workshop. #studio #events";
 el("source").value=JSON.stringify([
   {name:"Short update",maxChars:90,maxLinks:1,maxTags:1,maxMedia:1,linkWeight:20,ratio:[1.5,2]},
   {name:"Community",maxChars:500,maxLinks:3,maxTags:4,maxMedia:4,ratio:[0.75,2]}
 ],null,2);
 el("media").value=JSON.stringify([{width:1080,height:1080}],null,2);
};
run(()=>{
 const text=el("draft").value;
 const media=parseJson("media");
 const results=preview(text,parseJson("source"),media);
 show(results.length+" channels · "+results.filter(x=>!x.checks.length).length+" within limits");
 table([["Channel","Characters","Links","Hashtags","Media","Result"],...results.map(x=>[x.channel,x.characters+" / "+x.maxChars,x.links,x.hashtags,x.attachments,x.checks.join(" ")||"Within limits"])]);
 const box=document.createElement("textarea");
 box.setAttribute("aria-label","Draft preview");
 box.readOnly=true;box.rows=4;box.value=text;
 el("result").append(box);
 download("channel-checks.json",JSON.stringify({draft:text,media,results},null,2)+"\n","application/json");
});
