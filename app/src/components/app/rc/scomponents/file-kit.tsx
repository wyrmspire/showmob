import React, { type ReactNode } from 'react';

type Children = { children: ReactNode };

type CalloutProps = Children & {
  title: string;
  tone?: 'note' | 'positive' | 'warning' | string;
};

export function FileRouter({ children }: Children) {
  return <>{children}</>;
}

export function FileCard({ children }: Children) {
  return <main className="file-card">{children}</main>;
}

export function Header({ title, fact, intro }: { title: string; fact?: string; intro?: string }) {
  return (
    <header className="file-header">
      {fact && <span className="file-fact">{fact}</span>}
      <h1>{title}</h1>
      {intro && <p>{intro}</p>}
    </header>
  );
}

export function Group({ label, children }: Children & { label?: string }) {
  return (
    <section className="file-group">
      {label && <span className="file-group-label">{label}</span>}
      {children}
    </section>
  );
}

export function Paragraph({ children }: Children) {
  return <p className="file-paragraph">{children}</p>;
}

export function Callout({ title, tone = 'note', children }: CalloutProps) {
  return (
    <aside className={`file-callout file-callout-${tone}`}>
      <strong>{title}</strong>
      <div>{children}</div>
    </aside>
  );
}

export function Closing({ children }: Children) {
  return <footer className="file-closing">{children}</footer>;
}

export function Rows({ children }: Children) {
  return <div className="file-rows">{children}</div>;
}

export function Row({ children }: Children) {
  return <div className="file-row">{children}</div>;
}
