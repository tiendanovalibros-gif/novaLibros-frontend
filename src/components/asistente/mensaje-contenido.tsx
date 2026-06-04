import Link from "next/link";

const MARKDOWN_LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

function esEnlaceLibroSeguro(href: string): boolean {
  const trimmed = href.trim();
  if (trimmed.startsWith("/books/")) {
    const id = trimmed.slice("/books/".length);
    return id.length > 0 && !trimmed.includes(" ");
  }
  try {
    const url = new URL(trimmed, "http://localhost");
    return url.pathname.startsWith("/books/") && url.pathname.length > "/books/".length;
  } catch {
    return false;
  }
}

function hrefALibro(href: string): string {
  const trimmed = href.trim();
  if (trimmed.startsWith("/books/")) return trimmed;
  try {
    return new URL(trimmed).pathname;
  } catch {
    return trimmed;
  }
}

interface Props {
  content: string;
  variant?: "user" | "assistant";
}

/** Renderiza texto con enlaces Markdown [título](/books/id) del asistente */
export default function MensajeContenido({ content, variant = "assistant" }: Props) {
  const linkClass =
    variant === "user"
      ? "underline font-semibold text-blue-100 hover:text-white"
      : "underline font-semibold text-blue-600 hover:text-blue-800";

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(MARKDOWN_LINK.source, "g");

  while ((match = re.exec(content)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(content.slice(lastIndex, match.index));
    }
    const [, label, href] = match;
    if (esEnlaceLibroSeguro(href)) {
      nodes.push(
        <Link key={`${match.index}-${href}`} href={hrefALibro(href)} className={linkClass}>
          {label}
        </Link>
      );
    } else {
      nodes.push(match[0]);
    }
    lastIndex = re.lastIndex;
  }

  if (lastIndex < content.length) {
    nodes.push(content.slice(lastIndex));
  }

  return (
    <p className="whitespace-pre-wrap break-words leading-relaxed">
      {nodes.length > 0 ? nodes : content}
    </p>
  );
}
