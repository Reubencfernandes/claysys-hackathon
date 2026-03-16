/**
 * ChatSidebar -- the primary chat interface component.
 *
 * Renders the full conversation panel including:
 *  - A branded header with "New Chat" and "Logout" actions.
 *  - A scrollable message list that displays user and assistant
 *    messages (with Markdown rendering), tool-call results (weather,
 *    currency, flights), and a loading indicator while streaming.
 *  - A "Download Itinerary PDF" button that appears when the
 *    assistant's response looks like a travel itinerary.
 *  - A fixed input bar at the bottom for composing new messages.
 *
 * The file also contains several helper functions for PDF export:
 *  - extractToolData: scans all messages for tool results (weather,
 *    currency, flights) to embed in the exported PDF.
 *  - buildWeatherSection / buildCurrencySection / buildFlightsSection:
 *    generate styled HTML snippets for the PDF.
 *  - exportElementToPdf: renders an HTML element to a multi-page PDF
 *    using html2canvas + jsPDF, preserving clickable hyperlinks.
 */
"use client";

import { motion } from "framer-motion";
import { MessageSquare, User, Bot, Send, Sparkles, Plus, Download, LogOut } from "lucide-react";
import { HuggingFace } from "@lobehub/icons";
import ReactMarkdown from "react-markdown";
import { SuggestionChips } from "./suggestion-chips";
import { ToolResultRenderer } from "./tool-result-renderer";
import { useRef, useEffect } from "react";

interface ChatSidebarProps {
  messages: any[];
  isLoading: boolean;
  inputValue: string;
  onInputChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSuggestionClick: (suggestion: string) => void;
  onPlaceClick: (place: any) => void;
}

/**
 * Walks through every assistant message in the conversation and extracts
 * the first successful output for each tool type (weather, currency,
 * flights). This data is embedded into the exported PDF so the itinerary
 * includes live travel context even outside the chat.
 */
function extractToolData(messages: any[]) {
  let weatherData: any = null;
  let currencyData: any = null;
  let flightsData: any = null;

  for (const msg of messages) {
    if (msg.role !== "assistant" || !msg.parts) continue;
    for (const part of msg.parts) {
      // Tool parts may be prefixed with "tool-" (e.g. "tool-getWeather")
      // or expose the name directly via `toolName`.
      const toolName = part.type?.startsWith("tool-") ? part.type.slice(5) : part.toolName;
      if (part.state === "output-available" && part.output && !part.output.error) {
        if (toolName === "getWeather" && !weatherData) weatherData = part.output;
        if (toolName === "getCurrencyRate" && !currencyData) currencyData = part.output;
        if (toolName === "searchFlights" && !flightsData) flightsData = part.output;
      }
    }
  }
  return { weatherData, currencyData, flightsData };
}

// Helper to build weather section for PDF
function buildWeatherSection(w: any): string {
  if (!w?.forecast?.length) return "";
  const today = w.forecast[0];
  let html = `<div style="background:#f0f7ff;border:1px solid #bcd4f0;border-radius:8px;padding:16px;margin-bottom:16px;">`;
  html += `<div style="font-weight:bold;color:#1a5276;margin-bottom:8px;">🌤️ Weather in ${w.city}, ${w.country}</div>`;
  html += `<div style="display:flex;justify-content:space-between;align-items:center;">`;
  html += `<div><span style="font-size:18px;">${today.description}</span></div>`;
  html += `<div style="text-align:right;"><span style="font-size:24px;font-weight:bold;">${today.temp_max}°C</span><br/><span style="color:#666;font-size:12px;">Low: ${today.temp_min}°C</span></div>`;
  html += `</div>`;
  html += `<div style="color:#666;font-size:12px;margin-top:8px;">💧 Humidity: ${today.humidity}% &nbsp; 💨 Wind: ${today.wind_speed} m/s</div>`;
  if (w.forecast.length > 1) {
    html += `<div style="display:flex;gap:8px;margin-top:12px;border-top:1px solid #bcd4f0;padding-top:12px;">`;
    for (const day of w.forecast.slice(1)) {
      html += `<div style="text-align:center;background:white;border-radius:6px;padding:6px 10px;font-size:11px;">`;
      html += `<div style="font-weight:600;color:#555;">${day.date}</div>`;
      html += `<div>${day.temp_max}° / ${day.temp_min}°</div>`;
      html += `<div style="color:#888;">${day.description}</div>`;
      html += `</div>`;
    }
    html += `</div>`;
  }
  html += `</div>`;
  return html;
}

// Helper to build currency section for PDF
function buildCurrencySection(c: any): string {
  if (!c) return "";
  let html = `<div style="background:#fff8e6;border:1px solid #f0d78c;border-radius:8px;padding:16px;margin-bottom:16px;">`;
  html += `<div style="font-weight:bold;color:#7d6608;margin-bottom:8px;">💱 Exchange Rate</div>`;
  html += `<div style="text-align:center;font-size:16px;font-weight:bold;">${c.amount?.toLocaleString()} ${c.from} ⇄ ${c.converted_amount?.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${c.to}</div>`;
  html += `<div style="text-align:center;color:#888;font-size:12px;margin-top:4px;">1 ${c.from} = ${c.rate?.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${c.to}</div>`;
  html += `<div style="display:flex;gap:8px;justify-content:center;margin-top:12px;">`;
  for (const amt of [100, 500, 1000]) {
    html += `<div style="background:white;border-radius:6px;padding:6px 12px;text-align:center;font-size:11px;">`;
    html += `<span style="color:#888;">${amt} ${c.from}</span><br/>`;
    html += `<span style="font-weight:600;">${(amt * c.rate).toLocaleString(undefined, { maximumFractionDigits: 0 })} ${c.to}</span>`;
    html += `</div>`;
  }
  html += `</div></div>`;
  return html;
}

// Helper to build flights section for PDF
function buildFlightsSection(f: any): string {
  if (!f?.flights?.length) return "";
  let html = `<div style="background:#f3f0ff;border:1px solid #c4b5fd;border-radius:8px;padding:16px;margin-bottom:16px;">`;
  html += `<div style="font-weight:bold;color:#5b21b6;margin-bottom:12px;">✈️ Flights: ${f.dep_city} → ${f.arr_city}</div>`;
  for (const flight of f.flights) {
    const depTime = flight.departure?.scheduled ? new Date(flight.departure.scheduled).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "--:--";
    const arrTime = flight.arrival?.scheduled ? new Date(flight.arrival.scheduled).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "--:--";
    html += `<div style="background:white;border-radius:6px;padding:10px 14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">`;
    html += `<div><span style="font-weight:600;font-size:13px;">${flight.airline?.name || "Airline"}</span><br/><span style="color:#888;font-size:11px;">${flight.flight?.iata || ""}</span></div>`;
    html += `<div style="text-align:center;"><span style="font-weight:700;font-size:14px;">${flight.departure?.iata || ""}</span><span style="color:#888;margin:0 6px;">→</span><span style="font-weight:700;font-size:14px;">${flight.arrival?.iata || ""}</span><br/><span style="color:#888;font-size:11px;">${depTime} to ${arrTime}</span></div>`;
    html += `<div style="text-align:right;"><span style="font-size:11px;padding:2px 8px;border-radius:10px;background:#e8e3ff;color:#5b21b6;text-transform:capitalize;">${flight.flight_status || "scheduled"}</span></div>`;
    html += `</div>`;
  }
  html += `</div>`;
  return html;
}

/** Describes a clickable link region mapped onto the PDF coordinate space. */
interface PdfLinkRegion {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Escapes a string for safe inclusion inside an HTML attribute value. */
function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Resolves a potentially relative or malformed href into an absolute URL
 * suitable for embedding as a clickable link in a PDF.
 *
 * Returns null for fragment-only links (#...) and javascript: URIs which
 * have no meaning outside a browser context.
 */
function normalizePdfLinkUrl(rawHref: string, baseUrl: string) {
  const href = rawHref.trim();
  if (!href) return null;

  const lowerHref = href.toLowerCase();
  if (href.startsWith("#") || lowerHref.startsWith("javascript:")) {
    return null;
  }

  if (
    lowerHref.startsWith("http://") ||
    lowerHref.startsWith("https://") ||
    lowerHref.startsWith("mailto:") ||
    lowerHref.startsWith("tel:")
  ) {
    return href;
  }

  // Protocol-relative URLs (e.g. "//example.com/page")
  if (href.startsWith("//")) {
    return `https:${href}`;
  }

  // Bare domain names (e.g. "example.com/page") -- heuristic match
  if (/^[a-z0-9.-]+\.[a-z]{2,}(?:[/:?#].*)?$/i.test(href)) {
    return `https://${href}`;
  }

  // Fall back to resolving against the document base URL
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return null;
  }
}

/**
 * Iterates over all `<a>` tags inside an element, normalizing their
 * hrefs to absolute URLs. Links that can't be resolved are stripped
 * so they don't appear as broken in the PDF.
 */
function normalizePdfAnchorLinks(element: HTMLElement, baseUrl: string) {
  for (const anchor of Array.from(element.querySelectorAll<HTMLAnchorElement>("a[href]"))) {
    const rawHref = anchor.getAttribute("href");
    if (!rawHref) continue;

    const normalizedHref = normalizePdfLinkUrl(rawHref, baseUrl);
    if (!normalizedHref) {
      anchor.removeAttribute("href");
      continue;
    }

    anchor.href = normalizedHref;
    anchor.setAttribute("href", normalizedHref);
    anchor.setAttribute("target", "_blank");
    anchor.setAttribute("rel", "noopener noreferrer");
  }
}

/**
 * Strips all external stylesheets and inline <style> blocks from the
 * cloned document used for PDF rendering, except for the one we inject
 * ourselves (marked with `data-pdf-export-style`). This prevents the
 * app's dark-mode Tailwind styles from leaking into the light-themed PDF.
 */
function sanitizeClonedPdfDocument(doc: Document) {
  const safeBackground = "#ffffff";
  const safeText = "#111827";

  doc.documentElement.style.backgroundColor = safeBackground;
  doc.documentElement.style.color = safeText;
  doc.documentElement.style.setProperty("color-scheme", "light");

  if (doc.body) {
    doc.body.style.backgroundColor = safeBackground;
    doc.body.style.color = safeText;
  }

  for (const node of Array.from(doc.querySelectorAll('link[rel="stylesheet"], style'))) {
    if (node instanceof HTMLStyleElement && node.dataset.pdfExportStyle === "true") {
      continue;
    }

    node.remove();
  }
}

/**
 * Converts a DOM element into a multi-page A4 PDF and triggers a
 * browser download.
 *
 * Approach:
 *  1. Render the element to a high-res canvas via html2canvas.
 *     During the clone phase we also record every <a> tag's bounding
 *     rect so we can overlay invisible clickable link annotations.
 *  2. Slice the single tall canvas image across multiple A4 pages.
 *  3. Map each link's pixel coordinates to PDF mm coordinates,
 *     splitting links that span a page break across both pages.
 *
 * Libraries are dynamically imported so they are not included in the
 * main JS bundle -- they are only loaded when the user clicks "Download".
 */
async function exportElementToPdf(element: HTMLElement, filename: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ]);

  // Collect link positions from the cloned element inside onclone,
  // ensuring coordinates match what html2canvas actually renders.
  const rawLinks: Array<{url: string; x: number; y: number; width: number; height: number}> = [];
  let cloneRootWidth = 0;

  const canvas = await html2canvas(element, {
    scale: 2,               // 2x for crisp text on retina displays
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    windowWidth: 800,
    windowHeight: Math.max(
      element.scrollHeight,
      element.ownerDocument.documentElement.scrollHeight,
      element.ownerDocument.body?.scrollHeight ?? 0
    ),
    onclone: (clonedDoc: Document, clonedElement: HTMLElement) => {
      sanitizeClonedPdfDocument(clonedDoc);
      // Record every link's position relative to the root element so
      // we can add PDF link annotations in the correct locations.
      const rootRect = clonedElement.getBoundingClientRect();
      cloneRootWidth = rootRect.width || clonedElement.scrollWidth || 1;
      for (const anchor of Array.from(clonedElement.querySelectorAll<HTMLAnchorElement>("a[href]"))) {
        const href = anchor.getAttribute("href")?.trim();
        if (!href) continue;
        const resolved = normalizePdfLinkUrl(href, clonedDoc.baseURI || document.baseURI);
        if (!resolved) continue;
        for (const rect of Array.from(anchor.getClientRects())) {
          if (rect.width <= 0 || rect.height <= 0) continue;
          rawLinks.push({
            url: resolved,
            x: rect.left - rootRect.left,
            y: rect.top - rootRect.top,
            width: rect.width,
            height: rect.height,
          });
        }
      }
    },
  });

  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
    compress: true,
  });

  // Calculate how the rendered canvas maps onto A4 pages.
  const margin = 10;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const printableWidth = pageWidth - margin * 2;
  const printableHeight = pageHeight - margin * 2;
  const renderedHeight = (canvas.height * printableWidth) / canvas.width;
  const imageData = canvas.toDataURL("image/jpeg", 0.98);

  // Scale factor from source pixel coordinates to PDF mm coordinates.
  const rootWidth = cloneRootWidth || element.getBoundingClientRect().width || element.scrollWidth || 1;
  const pdfScale = printableWidth / rootWidth;
  // Small padding around each link region to make them easier to tap/click.
  const hitPadding = 1.2;
  const linkRegions: PdfLinkRegion[] = rawLinks.map(r => ({
    url: r.url,
    x: Math.max(0, r.x * pdfScale - hitPadding),
    y: Math.max(0, r.y * pdfScale - hitPadding),
    width: r.width * pdfScale + hitPadding * 2,
    height: r.height * pdfScale + hitPadding * 2,
  }));
  const totalPages = Math.max(1, Math.ceil(renderedHeight / printableHeight));

  // Stamp the same full-height image onto each page, offset vertically
  // so each page shows the correct slice.
  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    if (pageIndex > 0) {
      pdf.addPage();
    }

    const offsetY = margin - pageIndex * printableHeight;
    pdf.addImage(imageData, "JPEG", margin, offsetY, printableWidth, renderedHeight, undefined, "FAST");
  }

  // Overlay invisible clickable link annotations on each page.
  // Links that span a page boundary are split into segments.
  for (const link of linkRegions) {
    const linkX = Math.max(0, link.x);
    const linkWidth = Math.min(link.width, printableWidth - linkX);
    if (linkWidth <= 0.01) continue;

    const firstPage = Math.max(0, Math.floor(link.y / printableHeight));
    const lastPage = Math.min(
      totalPages - 1,
      Math.floor((link.y + link.height - 0.01) / printableHeight)
    );

    for (let pageIndex = firstPage; pageIndex <= lastPage; pageIndex++) {
      const pageTop = pageIndex * printableHeight;
      const segmentTop = Math.max(link.y, pageTop);
      const segmentBottom = Math.min(link.y + link.height, pageTop + printableHeight);
      const segmentHeight = segmentBottom - segmentTop;

      if (segmentHeight <= 0.01) continue;

      pdf.setPage(pageIndex + 1);
      pdf.link(
        margin + linkX,
        margin + (segmentTop - pageTop),
        linkWidth,
        segmentHeight,
        { url: link.url }
      );
    }
  }

  pdf.setPage(1);
  pdf.save(filename);
}

export function ChatSidebar({
  messages,
  isLoading,
  inputValue,
  onInputChange,
  onSubmit,
  onSuggestionClick,
  onPlaceClick
}: ChatSidebarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom whenever new messages arrive or
  // the loading state changes, so the user always sees the latest content.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  /**
   * Generates a styled PDF from a single assistant message.
   *
   * The approach uses a hidden <iframe> to isolate the PDF content from
   * the app's own styles (dark Tailwind theme). Inside the iframe we
   * render a light-themed HTML document containing:
   *   - The assistant's Markdown converted to HTML via `marked`.
   *   - Enrichment sections for weather, currency, and flights
   *     pulled from tool-call results across the whole conversation.
   *
   * The resulting DOM is then passed to `exportElementToPdf` which
   * rasterizes it and saves the PDF.
   */
  const handleDownloadPDF = async (messageParts: any[], messageId: string) => {
    let iframe: HTMLIFrameElement | null = null;

    try {
      const { marked } = await import('marked');

      // Extract tool data from all messages in the conversation
      const { weatherData, currencyData, flightsData } = extractToolData(messages);

      // Collect all text content from this message
      const textParts = messageParts.filter((p: any) => p.type === "text").map((p: any) => p.text);
      const fullMarkdown = textParts.join("\n\n");
      const htmlContent = await marked.parse(fullMarkdown);

      const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Build subtitle parts
      const subtitleParts: string[] = [];
      subtitleParts.push(`📅 Generated on ${currentDate}`);
      if (weatherData?.forecast?.[0]) {
        subtitleParts.push(`🌤️ ${weatherData.city}: ${weatherData.forecast[0].temp_max}°C, ${weatherData.forecast[0].description}`);
      }
      if (currencyData) {
        subtitleParts.push(`💱 1 ${currencyData.from} = ${currencyData.rate?.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${currencyData.to}`);
      }

      // Render the PDF inside an isolated iframe so app-level Tailwind styles do not leak in.
      iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '0';
      iframe.style.top = '0';
      iframe.style.width = '800px';
      iframe.style.height = '1200px';
      iframe.style.border = 'none';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      iframe.style.zIndex = '-9999';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error("Could not access iframe document");

      iframeDoc.open();
      iframeDoc.write(`<!DOCTYPE html>
<html style="background:#ffffff;"><head>
<base href="${escapeHtmlAttribute(document.baseURI)}">
<style data-pdf-export-style="true">
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { background: #fff; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; background: #fff; line-height: 1.7; }
  h1 { font-size: 22px; color: #1a1a2e; margin-top: 28px; margin-bottom: 8px; font-weight: 800; border-bottom: 2px solid #2563eb; padding-bottom: 6px; }
  h2 { font-size: 18px; color: #1a1a2e; margin-top: 24px; margin-bottom: 8px; font-weight: 700; }
  h3 { font-size: 15px; color: #2563eb; margin-top: 20px; margin-bottom: 8px; font-weight: 700; }
  p { margin-bottom: 10px; font-size: 13px; color: #333; }
  ul { margin-left: 18px; margin-bottom: 12px; padding-left: 0; }
  li { margin-bottom: 6px; font-size: 13px; list-style-type: disc; color: #333; }
  a { color: #2563eb; text-decoration: underline; }
  hr { border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0; }
  strong { color: #111; font-weight: 700; }
</style>
</head><body style="background:#ffffff;">
<div id="pdf-root" style="padding: 40px;">
  <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #2563eb;">
    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #2563eb; font-weight: 700;">Hugging Travel Agent · By Reuben</div>
  </div>
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 12px; color: #555; display: flex; flex-wrap: wrap; gap: 16px; justify-content: center;">
    ${subtitleParts.map(s => `<span>${s}</span>`).join("")}
  </div>
  ${buildWeatherSection(weatherData)}
  ${buildCurrencySection(currencyData)}
  ${buildFlightsSection(flightsData)}
  <div>${htmlContent}</div>
  <div style="margin-top: 32px; padding-top: 16px; border-top: 2px solid #e2e8f0; text-align: center; font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 2px;">
    Generated by Hugging Travel Agent · By Reuben
  </div>
</div>
</body></html>`);
      iframeDoc.close();

      // Wait for iframe to fully render
      await new Promise(resolve => setTimeout(resolve, 500));

      const element = iframeDoc.getElementById('pdf-root');
      if (!element) throw new Error("Could not find pdf-root in iframe");

      normalizePdfAnchorLinks(element, document.baseURI);

      await exportElementToPdf(
        element,
        `travel-itinerary-${messageId || Date.now()}.pdf`
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      if (iframe?.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }
  };

  return (
    <div className="w-full flex flex-col bg-[#0a0a0a] h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#1a1a1a] flex items-center justify-between">
        <div className="flex items-center gap-2">
           <HuggingFace.Color size={24} />
           <span className="text-sm font-bold text-white tracking-tight">Hugging Travel Agent</span>
        </div>
        <div className="flex gap-4 items-center">
           <button
             onClick={() => { window.location.href = "/"; }}
             title="New Chat"
             className="text-white/40 cursor-pointer hover:text-white transition-colors"
           >
             <Plus size={16} />
           </button>
           <button
             onClick={async () => {
               try {
                 await fetch("/api/auth/token", { method: "DELETE" });
               } finally {
                 window.location.href = "/login";
               }
             }}
             title="Logout"
             className="text-white/40 cursor-pointer hover:text-red-400 transition-colors"
           >
             <LogOut size={16} />
           </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <div className="space-y-4 opacity-40">
              <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mx-auto">
                <MessageSquare size={24} />
              </div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase">Where do you want to go?</p>
            </div>
            <SuggestionChips onSuggestionClick={onSuggestionClick} />
          </div>
        ) : (
          messages.map((message, idx) => (
            <motion.div 
              key={message.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${message.role === "user" ? "flex-reverse items-end justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="h-8 w-8 rounded-lg bg-blue-900/40 border border-blue-500/20 flex items-center justify-center shrink-0 mt-1">
                  <Bot size={16} className="text-blue-400" />
                </div>
              )}
              
              <div className={`flex flex-col gap-2 max-w-[85%] ${message.role === "user" ? "items-end text-right" : "items-start text-left"}`}>
                {message.parts.map((part: any, i: number) => {
                  if (part.type === "text") {
                    return (
                       <div 
                        key={i} 
                        className={message.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"}
                      >
                         <div className="text-sm prose prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-strong:text-blue-400">
                           <ReactMarkdown>
                            {part.text}
                          </ReactMarkdown>
                         </div>
                      </div>
                    );
                  }
                  if (part.type.startsWith("tool-") || part.type === "dynamic-tool") {
                    return (
                      <div key={i} className="w-full" onClick={() => onPlaceClick(part.result)}>
                         <ToolResultRenderer part={part} />
                      </div>
                    );
                  }
                  return null;
                })}

                {/* Download PDF button -- only shown when the assistant's
                    response looks like a travel itinerary. The heuristic
                    checks for "Day 1/2/..." combined with budget or
                    time-of-day keywords to avoid showing the button on
                    generic responses. */}
                {message.role === "assistant" && !isLoading && (() => {
                  const fullText = message.parts
                    .filter((p: any) => p.type === "text")
                    .map((p: any) => p.text)
                    .join("\n");
                  const hasItinerary =
                    /Day\s+\d/i.test(fullText) &&
                    (/Budget\s+Summary/i.test(fullText) || /Total\s+Estimated/i.test(fullText) || /Morning|Afternoon|Evening/i.test(fullText));
                  return hasItinerary;
                })() && (
                  <motion.button
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleDownloadPDF(message.parts, message.id || String(idx))}
                    className="flex items-center gap-2 mt-2 px-4 py-2 text-xs text-white bg-blue-600 hover:bg-blue-500 rounded-xl border border-blue-500/30 transition-all shadow-lg shadow-blue-500/10"
                    title="Download Itinerary as PDF"
                  >
                    <Download size={14} />
                    <span>Download Itinerary PDF</span>
                  </motion.button>
                )}
              </div>

              {message.role === "user" && (
                <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                  <User size={16} className="text-white/40" />
                </div>
              )}
            </motion.div>
          ))
        )}
        
        {isLoading && (() => {
          // Don't show the loading indicator with bot icon if the last message
          // is already an assistant message (it already has its own bot icon)
          const lastMsg = messages[messages.length - 1];
          const lastIsAssistantWithContent = lastMsg?.role === "assistant" &&
            lastMsg.parts?.some((p: any) => p.type === "text" && p.text?.length > 0);
          if (lastIsAssistantWithContent) return null;
          return (
            <div className="flex gap-4 items-center">
               <div className="h-8 w-8 rounded-lg bg-blue-900/40 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-blue-400" />
               </div>
               <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
               <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse delay-75" />
               <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse delay-150" />
            </div>
          );
        })()}
      </div>

      {/* Input Overlay */}
      <div className="bg-linear-to-t from-[#0a0a0a] to-transparent p-6">
        <form onSubmit={onSubmit} className="relative group">
          <input
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            disabled={isLoading}
            placeholder="Ask anything..."
            className="w-full h-14 bg-[#151515] border border-[#222] rounded-2xl pl-5 pr-16 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium disabled:opacity-50"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
             <button
               type="submit"
               disabled={isLoading || !inputValue.trim()}
               className="bg-blue-600 p-2 rounded-xl text-white shadow-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
              >
                <Send size={18} />
             </button>
          </div>
        </form>
        <p className="text-center text-[9px] uppercase font-bold tracking-[0.2em] text-white/20 mt-4">
           Hugging Travel Agent may make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
