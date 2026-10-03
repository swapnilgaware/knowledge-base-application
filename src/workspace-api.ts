export type Book={id:string;title:string;author:string;category:string;description:string;color:string;sourceUrl:string;chapterCount:number;currentChapter:number;completed:boolean};
export type MapNode={id:string;parentId:string|null;label:string};
export type MindMap={id:string;title:string;nodes:MapNode[];version:number;updatedAt:string};
export type Chapter={chapterNumber:number;title:string;content:string};
export type ChapterHeading={chapterNumber:number;title:string};
export async function request<T>(path:string,method='GET',body?:unknown):Promise<T>{
 const headers:Record<string,string>={};
 if(method!=='GET'){
  const response=await fetch('/api/auth/csrf',{credentials:'same-origin'});
  if(!response.ok)throw new Error('Your session could not be verified. Please sign in again.');
  const token=await response.json();headers[token.headerName]=token.token;
 }
 if(body!==undefined)headers['Content-Type']='application/json';
 const response=await fetch(path,{method,headers,credentials:'same-origin',body:body===undefined?undefined:JSON.stringify(body)});
 const text=await response.text();
 if(!response.ok){
  if(response.status===401)throw new Error('Your session has expired. Please sign in again.');
  let message='Unable to complete the request. Please try again.';
  try{message=JSON.parse(text).message||message;}catch{/* Friendly fallback. */}
  throw new Error(message);
 }
 return (text?JSON.parse(text):undefined) as T;
}
