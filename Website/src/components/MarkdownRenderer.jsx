import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';
import LinksURL from './Links';
import Images from './Images';

/* ── Copy button for code blocks ─────────────────────────────── */
function CopyButton({ text }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* ignore */
        }
    }, [text]);

    return (
        <button
            onClick={handleCopy}
            title="Copy code"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                color: copied ? '#4ade80' : '#a1a1aa',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit',
                lineHeight: 1,
            }}
            onMouseEnter={e => {
                if (!copied) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                    e.currentTarget.style.color = '#e4e4e7';
                }
            }}
            onMouseLeave={e => {
                if (!copied) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.color = '#a1a1aa';
                }
            }}
        >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy'}
        </button>
    );
}

/* ── Main renderer ───────────────────────────────────────────── */
export const MarkdownRenderer = ({ content, sources, images }) => {
    return (
        <div style={{
            color: '#d1d5db',
            fontSize: '15px',
            lineHeight: '1.75',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
        }}>
            {sources?.length > 0 && <LinksURL data={sources} />}
            {images?.length > 0 && <Images images={images} />}

            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{

                    /* ── Headings ── */
                    h1: ({ children }) => (
                        <h1 style={{
                            fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
                            fontWeight: 700,
                            color: '#ffffff',
                            margin: '1.8rem 0 0.9rem',
                            paddingBottom: '0.5rem',
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                            letterSpacing: '-0.02em',
                            lineHeight: 1.3,
                        }}>{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 style={{
                            fontSize: 'clamp(1.15rem, 3vw, 1.45rem)',
                            fontWeight: 650,
                            color: '#f4f4f5',
                            margin: '1.6rem 0 0.7rem',
                            letterSpacing: '-0.015em',
                            lineHeight: 1.35,
                        }}>{children}</h2>
                    ),
                    h3: ({ children }) => (
                        <h3 style={{
                            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                            fontWeight: 600,
                            color: '#f4f4f5',
                            margin: '1.3rem 0 0.5rem',
                            letterSpacing: '-0.01em',
                            lineHeight: 1.4,
                        }}>{children}</h3>
                    ),
                    h4: ({ children }) => (
                        <h4 style={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: '#e4e4e7',
                            margin: '1rem 0 0.4rem',
                        }}>{children}</h4>
                    ),

                    /* ── Paragraph ── */
                    p: ({ children }) => (
                        <p style={{
                            margin: '0 0 1rem',
                            lineHeight: '1.8',
                            color: '#d1d5db',
                            fontSize: '15px',
                        }}>{children}</p>
                    ),

                    /* ── Strong / Em / Del ── */
                    strong: ({ children }) => (
                        <strong style={{ fontWeight: 600, color: '#f4f4f5' }}>{children}</strong>
                    ),
                    em: ({ children }) => (
                        <em style={{ fontStyle: 'italic', color: '#a1a1aa' }}>{children}</em>
                    ),
                    del: ({ children }) => (
                        <del style={{ color: '#71717a', textDecoration: 'line-through' }}>{children}</del>
                    ),

                    /* ── Links ── */
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: '#60a5fa',
                                textDecoration: 'underline',
                                textUnderlineOffset: '3px',
                                textDecorationColor: 'rgba(96,165,250,0.35)',
                                transition: 'color 0.15s',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = '#93c5fd'}
                            onMouseLeave={e => e.currentTarget.style.color = '#60a5fa'}
                        >
                            <img
                                src={`https://www.google.com/s2/favicons?domain=${href}&sz=32`}
                                alt=""
                                style={{ width: '13px', height: '13px', borderRadius: '2px', opacity: 0.8 }}
                                onError={e => { e.currentTarget.style.display = 'none'; }}
                            />
                            {children}
                        </a>
                    ),

                    /* ── Blockquote ── */
                    blockquote: ({ children }) => (
                        <blockquote style={{
                            margin: '1.2rem 0',
                            padding: '0.9rem 1.1rem',
                            borderLeft: '3px solid #3b82f6',
                            background: 'rgba(59,130,246,0.07)',
                            borderRadius: '0 8px 8px 0',
                            color: '#a1a1aa',
                            fontStyle: 'italic',
                        }}>{children}</blockquote>
                    ),

                    /* ── Lists ── */
                    ul: ({ children }) => (
                        <ul style={{
                            margin: '0.5rem 0 1rem',
                            paddingLeft: '1.5rem',
                            listStyleType: 'disc',
                            color: '#d1d5db',
                        }}>{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol style={{
                            margin: '0.5rem 0 1rem',
                            paddingLeft: '1.5rem',
                            listStyleType: 'decimal',
                            color: '#d1d5db',
                        }}>{children}</ol>
                    ),
                    li: ({ children }) => (
                        <li style={{
                            margin: '0.3rem 0',
                            lineHeight: '1.75',
                            fontSize: '15px',
                        }}>{children}</li>
                    ),

                    /* ── HR ── */
                    hr: () => (
                        <hr style={{
                            margin: '2rem 0',
                            border: 'none',
                            borderTop: '1px solid rgba(255,255,255,0.08)',
                        }} />
                    ),

                    /* ── Inline Code ── */
                    /* ── Code Block ── */
                    code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = String(children).replace(/\n$/, '');
                        const language = match ? match[1] : '';

                        if (!inline && match) {
                            return (
                                <div style={{
                                    margin: '1.2rem 0',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    background: '#0d0d0d',
                                    overflow: 'hidden',
                                    maxWidth: '100%',
                                    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                                }}>
                                    {/* Code block header */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '8px 14px',
                                        background: 'rgba(255,255,255,0.04)',
                                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                                    }}>
                                        <span style={{
                                            fontSize: '12px',
                                            color: '#71717a',
                                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                            textTransform: 'lowercase',
                                            letterSpacing: '0.02em',
                                        }}>{language || 'code'}</span>
                                        <CopyButton text={codeString} />
                                    </div>

                                    {/* Syntax highlighted code */}
                                    <div style={{ overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
                                        <SyntaxHighlighter
                                            language={language || 'text'}
                                            style={oneDark}
                                            PreTag="div"
                                            showLineNumbers
                                            customStyle={{
                                                margin: 0,
                                                padding: '1rem 1.2rem',
                                                background: 'transparent',
                                                fontSize: '13.5px',
                                                lineHeight: '1.65',
                                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, "Courier New", monospace',
                                            }}
                                            lineNumberStyle={{
                                                color: '#3f3f46',
                                                fontSize: '12px',
                                                paddingRight: '1.2em',
                                                minWidth: '2.5em',
                                                userSelect: 'none',
                                            }}
                                            {...props}
                                        >
                                            {codeString}
                                        </SyntaxHighlighter>
                                    </div>
                                </div>
                            );
                        }

                        /* Inline code */
                        return (
                            <code
                                style={{
                                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, "Courier New", monospace',
                                    fontSize: '13px',
                                    padding: '2px 7px',
                                    borderRadius: '5px',
                                    background: 'rgba(255,255,255,0.07)',
                                    border: '1px solid rgba(255,255,255,0.09)',
                                    color: '#93c5fd',
                                    whiteSpace: 'nowrap',
                                }}
                                {...props}
                            >
                                {children}
                            </code>
                        );
                    },

                    /* ── TABLE — Fully Responsive ── */
                    table: ({ children }) => (
                        <div style={{
                            width: '100%',
                            overflowX: 'auto',
                            margin: '1.4rem 0',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
                            /* Custom scrollbar inside table container */
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#3f3f46 transparent',
                        }}>
                            <table style={{
                                width: '100%',
                                minWidth: '500px',
                                borderCollapse: 'collapse',
                                fontSize: '14px',
                                lineHeight: '1.6',
                            }}>
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead style={{
                            background: 'rgba(255,255,255,0.05)',
                        }}>{children}</thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody>{children}</tbody>
                    ),
                    tr: ({ children, ...props }) => {
                        /* isHeader can't be detected directly; style both generically */
                        return (
                            <TableRow>{children}</TableRow>
                        );
                    },
                    th: ({ children }) => (
                        <th style={{
                            padding: '11px 16px',
                            textAlign: 'left',
                            fontSize: '12px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: '#e4e4e7',
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            whiteSpace: 'nowrap',
                            background: 'rgba(255,255,255,0.04)',
                        }}>{children}</th>
                    ),
                    td: ({ children }) => (
                        <td style={{
                            padding: '10px 16px',
                            color: '#d1d5db',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            verticalAlign: 'top',
                            lineHeight: '1.65',
                            wordBreak: 'break-word',
                        }}>{children}</td>
                    ),

                    /* ── Image ── */
                    img: ({ src, alt }) => (
                        <img
                            src={src}
                            alt={alt || ''}
                            style={{
                                maxWidth: '100%',
                                borderRadius: '10px',
                                margin: '0.8rem 0',
                                border: '1px solid rgba(255,255,255,0.07)',
                            }}
                        />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

/* ── Hoverable table row ─────────────────────────────────────── */
function TableRow({ children }) {
    const [hovered, setHovered] = useState(false);
    return (
        <tr
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
                transition: 'background 0.15s',
            }}
        >
            {children}
        </tr>
    );
}
