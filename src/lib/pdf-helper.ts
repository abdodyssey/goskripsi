import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export async function generatePdf(htmlContent: string, options: any = {}) {
  const isLocal = process.env.NODE_ENV === "development";

  const browser = await puppeteer.launch({
    args: isLocal ? [] : chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: isLocal
      ? "/usr/bin/google-chrome" // Path to chrome on local linux
      : await chromium.executablePath(),
    headless: isLocal ? true : chromium.headless,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, {
      waitUntil: ["load", "networkidle0"],
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      ...options,
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}
