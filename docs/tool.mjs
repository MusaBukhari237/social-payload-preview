const codepoints=value=>Array.from(value).length;
const isInt=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
function linkDetails(text){
  return [...text.matchAll(/https?:\/\/[^\s<>"']+/gi)].map(match=>match[0].replace(/[.,!?;:)\]]+$/,"")).filter(url=>{try{return Boolean(new URL(url).hostname);}catch{return false;}});
}
export function preview(draft,channels,media){
  if(typeof draft!=="string"||draft.length>40000||!draft.trim())throw Error("Enter a draft of up to 40,000 characters.");
  if(!Array.isArray(channels)||channels.length<1||channels.length>12)throw Error("Use 1–12 channel rules.");
  if(!Array.isArray(media)||media.length>8||media.some(item=>!isInt(item?.width,1,16000)||!isInt(item?.height,1,16000))) throw Error("Use up to eight attachments with width and height between 1 and 16,000 pixels.");
  const urls=linkDetails(draft);
  const withoutUrls=draft.replace(/https?:\/\/[^\s<>"']+/gi," ");
  const hashtagCount=[...withoutUrls.matchAll(/(?:^|[^\p{L}\p{N}_])#[\p{L}\p{N}_]+/gu)].length;
  const original=codepoints(draft);
  const linkPoints=urls.reduce((sum,url)=>sum+codepoints(url),0);
  const names=new Set();
  return channels.map(rule=>{
    if(typeof rule?.name!=="string"||!rule.name.trim()||rule.name.length>60||names.has(rule.name)||
      !isInt(rule.maxChars,1,40000)||!isInt(rule.maxLinks,0,50)||!isInt(rule.maxTags,0,100)||!isInt(rule.maxMedia,0,8)||
      (rule.linkWeight!=null&&!isInt(rule.linkWeight,0,1000))||
      (rule.ratio!=null&&(!Array.isArray(rule.ratio)||rule.ratio.length!==2||!rule.ratio.every(x=>typeof x==="number"&&Number.isFinite(x)&&x>0)||rule.ratio[0]>rule.ratio[1])))throw Error("Invalid or duplicate channel rule.");
    names.add(rule.name);
    const characters=rule.linkWeight==null?original:original-linkPoints+urls.length*rule.linkWeight;
    const checks=[];
    if(characters>rule.maxChars)checks.push("Character limit exceeded by "+(characters-rule.maxChars)+".");
    if(urls.length>rule.maxLinks)checks.push("Too many links.");
    if(hashtagCount>rule.maxTags)checks.push("Too many hashtags.");
    if(media.length>rule.maxMedia)checks.push("Too many attachments.");
    if(rule.ratio){
      for(const [index,item] of media.entries()){
        const ratio=item.width/item.height;
        if(ratio<rule.ratio[0]||ratio>rule.ratio[1])checks.push("Attachment "+(index+1)+" is outside the aspect ratio range.");
      }
    }
    return {channel:rule.name,characters,maxChars:rule.maxChars,links:urls.length,hashtags:hashtagCount,attachments:media.length,checks};
  });
}
