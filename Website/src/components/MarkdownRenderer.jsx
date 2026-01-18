import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import LinksURL from './Links';
import Images from './Images';

export const MarkdownRenderer = ({ content, sources, images }) => {
    return (
        <div className="prose prose-invert prose-sm max-w-none leading-relaxed text-zinc-300">
            {sources?.length > 0 && <LinksURL data={sources} />}
            {images?.length > 0 && <Images images={images} />}

            <ReactMarkdown
                components={{
                    body: ({ children }) => (
                        <div className="prose prose-invert max-w-none">{children}</div>
                    ),
                    h1: ({ children }) => (
                        <h1 className="text-3xl font-bold text-white mt-10 mb-5 pb-3 border-b border-zinc-800 tracking-tight">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4 tracking-tight">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-xl font-semibold text-white mt-6 mb-3 tracking-tight">
                            {children}
                        </h3>
                    ),
                    p: ({ children }) => (
                        <p className="mb-4 leading-7 text-zinc-300 text-[15px]">
                            {children}
                        </p>
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 underline underline-offset-4 decoration-blue-400/30 hover:decoration-blue-300 transition-colors duration-200"
                        >
                            <img
                                src={`https://www.google.com/s2/favicons?domain=${href}&sz=64`}
                                alt=""
                                className="w-3 h-3 rounded-sm opacity-80 group-hover:opacity-100"
                            />
                            {children}
                        </a>
                    ),
                    code({ inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                            <div className="my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/80 shadow-lg">
                                <SyntaxHighlighter
                                    language={match[1]}
                                    style={oneDark}
                                    PreTag="div"
                                    className="bg-black! p-4! text-sm"
                                    showLineNumbers
                                    {...props}
                                >
                                    {String(children).replace(/\n$/, "")}
                                </SyntaxHighlighter>
                            </div>
                        ) : (
                            <code className="rounded-md bg-zinc-900/80 border border-zinc-800 px-1.5 py-0.5 font-mono text-sm text-blue-400">
                                {children}
                            </code>
                        );
                    },
                    blockquote: ({ children }) => (
                        <blockquote className="my-5 border-l-4 border-blue-500 bg-zinc-900/60 pl-5 py-4 rounded-r-lg italic text-zinc-400 backdrop-blur-sm">
                            {children}
                        </blockquote>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc ml-6 mb-4 space-y-2 text-zinc-300">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal ml-6 mb-4 space-y-2 text-zinc-300">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="leading-7 text-[15px]">{children}</li>
                    ),
                    table: ({ children }) => (
                        <div className="my-8 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/60 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
                            <table className="min-w-full border-collapse text-sm">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-zinc-900/90 border-b border-zinc-800">
                            {children}
                        </thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-zinc-800 text-zinc-300">
                            {children}
                        </tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="transition-colors hover:bg-zinc-900/60">
                            {children}
                        </tr>
                    ),
                    th: ({ children }) => (
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-100">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-5 py-4 align-top leading-relaxed text-zinc-300">
                            {children}
                        </td>
                    ),
                    hr: () => (
                        <hr className="my-10 border-zinc-800" />
                    ),
                    strong: ({ children }) => (
                        <strong className="font-semibold text-white">{children}</strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic text-zinc-400">{children}</em>
                    ),
                    del: ({ children }) => (
                        <del className="text-zinc-500 line-through">{children}</del>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};
