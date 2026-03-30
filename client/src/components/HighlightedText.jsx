/**
 * Renders analysis text with suspicious spans emphasized for reviewers.
 * Expects highlight objects: { start, end, label } in character offsets.
 */
export function HighlightedText({ text, highlights }) {
  const safeText = text ?? '';
  const spans = Array.isArray(highlights) ? [...highlights].sort((a, b) => a.start - b.start) : [];

  if (!spans.length) {
    return <p className="whitespace-pre-wrap leading-relaxed text-slate-200">{safeText}</p>;
  }

  const nodes = [];
  let cursor = 0;
  for (const h of spans) {
    const start = Math.max(0, Math.min(safeText.length, h.start));
    const end = Math.max(start, Math.min(safeText.length, h.end));
    if (start > cursor) {
      nodes.push(<span key={`t-${cursor}`}>{safeText.slice(cursor, start)}</span>);
    }
    if (end > start) {
      nodes.push(
        <mark
          key={`h-${start}-${end}`}
          title={h.label}
          className="rounded-md bg-amber-400/15 px-0.5 text-amber-100 decoration-amber-300/50 underline decoration-dotted underline-offset-4"
        >
          {safeText.slice(start, end)}
        </mark>,
      );
    }
    cursor = Math.max(cursor, end);
  }
  if (cursor < safeText.length) {
    nodes.push(<span key={`t-${cursor}`}>{safeText.slice(cursor)}</span>);
  }

  return <p className="whitespace-pre-wrap leading-relaxed text-slate-200">{nodes}</p>;
}
