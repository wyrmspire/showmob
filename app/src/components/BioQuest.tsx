import React, { useRef, useState } from 'react';
import type { Block } from '../schema';
import { canOffer, freshProgress, MAX_QUEST_LENGTH, MIN_QUEST_WORDS, wordCount, type QuestProgress } from '../bioQuest';
import './bio-quest.css';

type BioQuestBlock = Extract<Block, { type: 'bio-quest' }>;
export function BioQuest({ block }: { block: BioQuestBlock }) {
  const [selected, setSelected] = useState(block.profiles[0]?.key ?? '');
  const [progress, setProgress] = useState<Record<string, QuestProgress>>({});
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const stageHeading = useRef<HTMLHeadingElement>(null);
  const profile = block.profiles.find(p => p.key === selected);
  const state = progress[selected] ?? freshProgress();
  const update = (patch: Partial<QuestProgress>) => setProgress(old => ({ ...old, [selected]: { ...(old[selected] ?? freshProgress()), ...patch } }));
  const changeStage = (stage: QuestProgress['stage']) => {
    update({ stage }); setNotice('');
    requestAnimationFrame(() => stageHeading.current?.focus());
  };
  if (!profile) return <section className="block" id={block.id}><h2>{block.heading}</h2><p>No profiles yet.</p></section>;
  return <section className="block bio-quest" id={block.id} aria-label={block.heading}>
    <div className="bq-top"><span className="bq-chip">Cuff Craft</span><span className="bq-muted">Fictional people · session only</span></div>
    <h2>{block.heading}</h2><p className="bq-description">{block.description}</p>
    <nav className="bq-profiles" aria-label="Choose a fictional profile">
      {block.profiles.map(p => <button type="button" key={p.key} aria-pressed={p.key === selected} onClick={() => {setSelected(p.key);setMessage('');setNotice('');}}>{p.name.split(',')[0]}<span>{(progress[p.key]?.stage === 'conversation') ? 'Door open' : 'Meet through a quest'}</span></button>)}
    </nav>
    <article className="bq-person"><div className="bq-avatar" aria-hidden="true">{profile.name[0]}</div><div><span className="bq-muted">Fictional profile</span><h3>{profile.name}</h3><p>{profile.bio}</p><small>{profile.interests}</small></div></article>
    <ol className="bq-path" aria-label="Introduction progress">{['Quest', 'Introduction', 'Conversation'].map((label,i) => <li key={label} aria-current={i === ['quest','review','conversation'].indexOf(state.stage) ? 'step' : undefined}><span>{i + 1}</span>{label}</li>)}</ol>
    <div className="bq-panel">
      <h3 ref={stageHeading} tabIndex={-1}>{state.stage === 'quest' ? 'Your first quest' : state.stage === 'review' ? 'The answer is the introduction.' : 'Conversation unlocked.'}</h3>
      {state.stage === 'quest' && <form onSubmit={e => {e.preventDefault();if (canOffer(state.answer)) changeStage('review');else setNotice(`Write at least ${MIN_QUEST_WORDS} words before offering your introduction.`);}}>
        <blockquote>{profile.prompt}</blockquote><p className="bq-muted">{profile.hint}</p>
        <label htmlFor={`${block.id}-answer`}>Your answer</label>
        <textarea id={`${block.id}-answer`} value={state.answer} maxLength={MAX_QUEST_LENGTH} rows={7} placeholder="Start with a small, specific detail..." aria-describedby={`${block.id}-effort`} onChange={e => update({answer:e.target.value})} />
        <p id={`${block.id}-effort`} className="bq-muted">{wordCount(state.answer)} / {MIN_QUEST_WORDS} words to offer an introduction · {state.answer.length} / {MAX_QUEST_LENGTH} characters</p>
        <p className="bq-fine">This checks participation, not whether an answer is good. The person makes that call.</p>
        <button className="bq-primary" type="submit">Offer my introduction →</button>
      </form>}
      {state.stage === 'review' && <div>
        <p className="bq-muted">Nothing was sent. Try the receiving side of the demo.</p>
        <div className="bq-letter"><span className="bq-chip">Your quest answer</span><p>{state.answer}</p></div>
        <p>{profile.name.split(',')[0]} can accept the introduction or leave the door closed. Finishing a quest never guarantees a response.</p>
        <button type="button" className="bq-primary" onClick={() => changeStage('conversation')}>Simulate accepting the introduction →</button>
        <button type="button" className="bq-secondary" onClick={() => {changeStage('quest');setNotice('Door stays closed. You can revise your answer and try the demo again.');}}>Keep the door closed / revise</button>
      </div>}
      {state.stage === 'conversation' && <div>
        <p className="bq-muted">Demo acceptance. The quest becomes a shared starting point.</p>
        <div className="bq-letter"><span className="bq-chip">Your introduction</span><p>{state.answer}</p></div>
        <div className="bq-chat" role="log" aria-label="Simulated conversation" aria-live="polite"><div className="bq-bubble"><strong>{profile.name.split(',')[0]} · scripted demo reply</strong><p>{profile.reply}</p></div>{state.messages.map((text,i) => <div className="bq-bubble bq-yours" key={i}><strong>You · local demo message</strong><p>{text}</p></div>)}</div>
        <form onSubmit={e => {e.preventDefault();if(message.trim()) {update({messages:[...state.messages,message.trim()]});setMessage('');setNotice('Added to this local demo only. No real person receives it.');}}}>
          <label htmlFor={`${block.id}-message`}>Keep the conversation going</label><textarea id={`${block.id}-message`} rows={3} maxLength={1000} value={message} onChange={e => setMessage(e.target.value)} placeholder="Ask about that first stop..." />
          <button type="submit" className="bq-primary" disabled={!message.trim()}>Add demo message</button>
        </form>
        <p className="bq-fine">No live chat, automated replies, or background delivery.</p>
      </div>}
      <p role="status" className="bq-status">{notice}</p>
    </div>
    <button className="bq-secondary" type="button" onClick={() => {setProgress({});setSelected(block.profiles[0].key);setMessage('');setNotice('Demo reset. All answers and messages cleared.');}}>Reset demo</button>
    <p className="bq-fine">All profiles are invented adults. Your writing stays in this tab's memory. Reloading clears it. Don't put private details in a demo.</p>
  </section>;
}
