import test from "node:test";
import assert from "node:assert/strict";
import {preview} from "../docs/tool.mjs";
const limits={name:"Sample",maxChars:120,maxLinks:1,maxTags:1,maxMedia:1,linkWeight:5,ratio:[1.3,2]};
test("counts Unicode and a fixed link size without losing trailing punctuation",()=>{
 const result=preview("Hi 😊 https://example.test/test. #sample",[limits],[])[0];
 assert.equal(result.characters,19);assert.equal(result.links,1);assert.equal(result.hashtags,1);
});
test("finds independent channel violations",()=>{
 const [result]=preview("A long draft #one #two",[ {...limits,maxChars:4,maxMedia:0} ],[{width:100,height:100}]);
 assert.equal(result.checks.length,4);
 assert.throws(()=>preview("draft",[limits,limits],[]),/duplicate/);
});
