import React, { useRef, useState } from 'react';
import type { Block } from '../schema';
import { freshProgress, type QuestProgress } from '../bioQuest';
import { profileSource, answerGrader, conversationSource, questBoardSource, useCurrentUser } from '../modules/bio-quest/sources';
import { rules, wordCount } from '../modules/bio-quest/grader';
import './bio-quest.css';

type BioQuestBlock = Extract<Block, { type: 'bio-quest' }>;
export function BioQuest({ block }: { block: BioQuestBlock }) {
  const profiles = profileSource.getProfiles();
  const user = useCurrentUser();
  const [started, setStarted] = useState(false);
  const [selected, setSelected] = useState(profiles[0]?.id ?? '');
  const [progress, setProgress] = useState<Record<string, QuestProgress>>({});
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const stageHeading = useRef<HTMLHeadingElement>(null);
  const profile = profileSource.getProfile(selected);
  const state = (Object.hasOwn(progress,selected) ? progress[selected] : undefined) ?? freshProgress();
  const update = (patch: Partial<QuestProgress>) => setProgress(old => ({ ...old, [selected]: { ...((Object.hasOwn(old,selected) ? old[selected] : undefined) ?? freshProgress()), ...patch } }));
  const changeStage = (stage: QuestProgress['stage']) => {
    update({ stage }); setNotice('');
    requestAnimationFrame(() => stageHeading.current?.focus());
  };
  if (!profile) return <section className="block" id={block.id}><h2>{block.heading}</h2><p>No profiles yet.</p></section>;
  return <section className="block bio-quest" id={block.id} aria-label={block.heading}>
    <div className="bq-top"><span className="bq-chip">Cuff Craft</span><span className="bq-muted">Fictional people · session only</span></div>
    <h2>{block.heading}</h2><p className="bq-description">{block.description}</p>
    <ol className="bq-start-steps" aria-label="How to meet"><li>Pick someone</li><li>Answer their quest</li><li>Let them decide</li></ol>
    {!started && <button type="button" className="bq-primary" onClick={() => {setStarted(true);requestAnimationFrame(() => stageHeading.current?.focus());}}>Try a fictional introduction →</button>}
    {started && <div>
    <nav className="bq-profiles" aria-label="Choose a fictional profile">
      {profiles.map(p => <button type="button" key={p.id} aria-pressed={p.id === selected} onClick={() => {setSelected(p.id);setMessage('');setNotice('');}}>{p.name}<span>{p.vibe}</span><span>{p.style} quest · fictional invitation</span></button>)}
    </nav>
    <article className="bq-person"><div className="bq-avatar" aria-hidden="true">{profile.avatar}</div><div><span className="bq-muted">Fictional Quest Giver</span><h3>{profile.name} <small>{profile.ageRange}</small></h3><p>{profile.bio}</p><small>{profile.tags.join(' / ')}</small><p className="bq-giver-rules"><strong>My rules:</strong> {profile.quest.giverRules}</p><small>Demo slots only. Nothing is reserved or consumed.</small></div></article>
    <ol className="bq-path" aria-label="Introduction progress">{['Quest', 'Introduction', 'Conversation'].map((label,i) => <li key={label} aria-current={i === ['quest','review','conversation'].indexOf(state.stage) ? 'step' : undefined}><span>{i + 1}</span>{label}</li>)}</ol>
    <div className="bq-panel">
      <h3 ref={stageHeading} tabIndex={-1}>{state.stage === 'quest' ? 'Your first quest' : state.stage === 'review' ? 'Review the introduction you would offer.' : 'Fictional introduction accepted.'}</h3>
      {state.stage === 'quest' && <form onSubmit={e => {e.preventDefault();const result=answerGrader.grade(state.answer,profile.quest); if(result.pass) {changeStage('review');setNotice(result.feedback.join(' '));} else setNotice(result.feedback.join(' '));}}>
        <blockquote>{profile.quest.prompt}</blockquote><p className="bq-muted">{profile.quest.hint}</p>
        <label htmlFor={`${block.id}-answer`}>Your answer</label>
        <textarea id={`${block.id}-answer`} value={state.answer} maxLength={rules.maxLength} rows={7} placeholder="Start with a small, specific detail..." aria-describedby={`${block.id}-effort ${block.id}-status`} onChange={e => update({answer:e.target.value})} />
        <p id={`${block.id}-effort`} className="bq-muted">{wordCount(state.answer)} / {rules.minWords} words for this demo writing check · {state.answer.length} / {rules.maxLength} characters</p>
        <p className="bq-fine">This local heuristic looks for length and details, not truth or AI authorship. This check does not decide whether anyone deserves a response.</p>
        <button className="bq-primary" type="submit">Review my introduction →</button>
      </form>}
      {state.stage === 'review' && <div>
        <p className="bq-muted">Nothing was sent. Try the receiving side of the demo.</p>
        <div className="bq-letter"><span className="bq-chip">Your quest answer</span><p>{state.answer}</p></div>
        <p>{profile.name} can accept the introduction or leave the door closed. Finishing a quest never guarantees a response.</p>
        <button type="button" className="bq-primary" onClick={() => {update({stage:'conversation',messages:[{author:'guest',text:state.answer},...conversationSource.getThread(selected)]});setNotice('Demo introduction accepted. The conversation is open.');requestAnimationFrame(() => stageHeading.current?.focus());}}>Simulate recipient accepting →</button>
        <button type="button" className="bq-secondary" onClick={() => {changeStage('quest');setNotice('Door stays closed. You can revise your answer and try the demo again.');}}>Keep the door closed / revise</button>
      </div>}
      {state.stage === 'conversation' && <div>
        <p className="bq-muted">Demo acceptance. The quest becomes a shared starting point.</p>
        
        <div className="bq-chat" role="log" aria-label="Simulated conversation" aria-live="polite">{state.messages.map((entry,i) => <div className={`bq-bubble ${entry.author === 'guest' ? 'bq-yours' : ''}`} key={i}><strong>{entry.author === 'guest' ? `${user.displayName} · local demo message` : `${profile.name} · scripted demo reply`}</strong><p>{entry.text}</p></div>)}</div>
        <form onSubmit={e => {e.preventDefault();if(message.trim()) {update({messages:[...state.messages,...conversationSource.send({profileId:selected,text:message.trim(),turn:state.turns})],turns:state.turns+1});setMessage('');setNotice('Added to this local demo only. No real person receives it.');}}}>
          <label htmlFor={`${block.id}-message`}>Keep the conversation going</label><textarea id={`${block.id}-message`} rows={3} maxLength={1000} value={message} onChange={e => setMessage(e.target.value)} placeholder="Ask about that first stop..." />
          <button type="submit" className="bq-primary" disabled={!message.trim()}>Add demo message</button>
        </form>
        <p className="bq-fine">Two canned follow-ups, then the demo ends. No live chat or background delivery.</p>
      </div>}
      <p id={`${block.id}-status`} role="status" className="bq-status">{notice}</p>
    </div>
    <button className="bq-secondary" type="button" onClick={() => {setProgress({});setSelected(profiles[0].id);setMessage('');setNotice('Demo reset. All answers and messages cleared.');}}>Reset demo</button>
    </div>}
    <aside className="bq-board" aria-label="Coming Soon quest board"><h3>The next quest is out there.</h3><p className="bq-muted">Coming Soon. Fictional businesses could donate experiences that become local quests. These are preview cards, not bookings or prizes on offer.</p>{questBoardSource.getQuests().map(q => <article key={q.id}><span className="bq-chip">Coming Soon / {q.type}</span><h4>{q.title}</h4><p>{q.sponsor}</p><ol>{q.steps.map(step => <li key={step}>{step}</li>)}</ol><p>{q.reward}</p></article>)}</aside>
    <p className="bq-fine">All profiles are invented adults. Your writing stays in this tab's memory. Reloading clears it. Don't put private details in a demo.</p>
  </section>;
}
