export type ThemeId = 'paper' | 'signal' | 'workshop' | 'night' | 'field';
export type Status = 'draft' | 'preview' | 'published' | 'archived';
export type Block =
  | { id:string; type:'hero'; eyebrow?:string; title:string; body:string }
  | { id:string; type:'text'; heading:string; body:string }
  | { id:string; type:'stat-strip'; items:{value:string;label:string}[] }
  | { id:string; type:'steps'; heading:string; items:string[] }
  | { id:string; type:'comparison'; heading:string; columns:{name:string;detail:string}[] }
  | { id:string; type:'quote'; quote:string; attribution:string }
  | { id:string; type:'note-callout'; title:string; body:string; tone?:'note'|'positive'|'warning' }
  | { id:string; type:'cta-band'; heading:string; body:string }
  | { id:string; type:'checklist'; heading:string; items:{label:string;detail?:string}[] }
  | { id:string; type:'timeline'; heading:string; items:{time:string;title:string;detail:string}[] }
  | { id:string; type:'code'; heading:string; language?:string; code:string }
  | { id:string; type:'embed'; heading:string; source:string; caption:string; url?:string }
  | { id:string; type:'image'; heading?:string; src:string; alt:string; caption:string; sourceUrl?:string }
  | { id:string; type:'resource-list'; heading:string; items:{label:string;detail:string;url:string}[] }
  | { id:string; type:'exercise'; heading:string; prompt:string; options:string[]; answer:number; explanation:string; correctFeedback?:string; wrongFeedback?:string }
  | { id:string; type:'compact-table'; heading:string; columns:string[]; rows:string[][]; caption?:string }
  | { id:string; type:'diagram'; heading:string; nodes:{title:string;detail:string}[] }
  | { id:string; type:'slideshow'; heading:string; slides:{title:string;body:string}[] }
  | { id:string; type:'divider'; label?:string };
export type Artifact={schemaVersion:1;slug:string;title:string;summary:string;contributor:string;status:Status;theme:ThemeId;series?:{id:string;title:string;order:number};tags?:string[];updated?:string;blocks:Block[]};
export function defineArtifact(value:Artifact):Artifact{return value}
