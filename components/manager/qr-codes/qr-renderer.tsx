"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { cn } from "../managerUtils";

interface QrSvgOptions {
  size?: number;
  margin?: number;
}

interface QrSvgPreviewProps extends QrSvgOptions {
  value: string;
  title: string;
  className?: string;
  svgClassName?: string;
}

interface PrintQrOptions extends QrSvgOptions {
  title: string;
  subtitle?: string;
}

const DEFAULT_RENDER_SIZE = 320;
const DEFAULT_MARGIN = 2;
const qrSvgMarkupCache = new Map<string, string>();

function getCacheKey(value: string, size: number, margin: number) {
  return `${value}::${size}::${margin}`;
}

function escapeAttributeValue(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function injectSvgMetadata(markup: string, title: string) {
  return markup.replace(
    "<svg ",
    `<svg role="img" aria-label="${escapeAttributeValue(title)}" focusable="false" `,
  );
}

export async function createQrSvgMarkup(
  value: string,
  title: string,
  options?: QrSvgOptions,
) {
  const size = options?.size ?? DEFAULT_RENDER_SIZE;
  const margin = options?.margin ?? DEFAULT_MARGIN;
  const cacheKey = getCacheKey(value, size, margin);
  const cachedMarkup = qrSvgMarkupCache.get(cacheKey);

  if (cachedMarkup) {
    return injectSvgMetadata(cachedMarkup, title);
  }

  const markup = await QRCode.toString(value, {
    type: "svg",
    width: size,
    margin,
    errorCorrectionLevel: "M",
    color: {
      dark: "#111111",
      light: "#FFFFFF",
    },
  });

  qrSvgMarkupCache.set(cacheKey, markup);
  return injectSvgMetadata(markup, title);
}

export async function downloadQrSvg(
  value: string,
  title: string,
  fileName: string,
  options?: QrSvgOptions,
) {
  const markup = await createQrSvgMarkup(value, title, options);
  const file = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
  const objectUrl = URL.createObjectURL(file);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = fileName;
  link.click();

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 1000);
}

export async function printQrSvg(
  value: string,
  options: PrintQrOptions,
) {
  const markup = await createQrSvgMarkup(value, options.title, {
    size: options.size ?? 640,
    margin: options.margin ?? DEFAULT_MARGIN,
  });
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=760,height=900");

  if (!printWindow) {
    return;
  }

  printWindow.document.write(`<!doctype html>
<html>
  <head>
    <title>${options.title}</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #ffffff;
        color: #111111;
        font-family: Arial, sans-serif;
      }
      main {
        width: min(86vw, 560px);
        text-align: center;
      }
      .qr {
        border: 1px solid #d1d5db;
        border-radius: 24px;
        padding: 24px;
      }
      .qr svg {
        display: block;
        width: 100%;
        height: auto;
      }
      h1 {
        margin: 0 0 10px;
        font-size: 28px;
      }
      p {
        margin: 0 0 24px;
        font-size: 16px;
        color: #4b5563;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>${options.title}</h1>
      ${options.subtitle ? `<p>${options.subtitle}</p>` : ""}
      <div class="qr">${markup}</div>
    </main>
    <script>
      window.addEventListener('load', () => {
        window.print();
      });
    </script>
  </body>
</html>`);
  printWindow.document.close();
}

export function QrSvgPreview({
  value,
  title,
  size = DEFAULT_RENDER_SIZE,
  margin = DEFAULT_MARGIN,
  className,
  svgClassName,
}: QrSvgPreviewProps) {
  const [markup, setMarkup] = useState<string | null>(null);
  const cacheKey = useMemo(() => getCacheKey(value, size, margin), [margin, size, value]);

  useEffect(() => {
    let cancelled = false;

    createQrSvgMarkup(value, title, { size, margin }).then((nextMarkup) => {
      if (!cancelled) {
        setMarkup(nextMarkup);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [cacheKey, margin, size, title, value]);

  return (
    <div className={className}>
      {markup ? (
        <div
          className={cn(
            "h-full w-full [&_svg]:block [&_svg]:h-full [&_svg]:w-full",
            svgClassName,
          )}
          dangerouslySetInnerHTML={{ __html: markup }}
        />
      ) : (
        <div className="h-full w-full rounded-[14px] bg-white" aria-hidden="true" />
      )}
    </div>
  );
}
