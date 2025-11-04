import type { API, InlineTool, SanitizerConfig } from "@editorjs/editorjs";
import OpenAI from "openai";

export interface AITextInlineConfig {
  apiKey: string;
  maxTokens?: number;
}

export default class AITextInlineTool implements InlineTool {
  private api: API;
  private button: HTMLButtonElement | null = null;
  private _apiKey: string;
  private _openai: OpenAI;
  private _maxTokens: number;
  private tag: string = "SPAN";
  private promptOverlay: HTMLDivElement | null = null;
  private isProcessing: boolean = false;

  static get isInline(): boolean {
    return true;
  }

  static get sanitize(): SanitizerConfig {
    return {
      span: {
        class: "ai-inline-text",
      },
    } as SanitizerConfig;
  }

  constructor({ api, config }: { api: API; config?: AITextInlineConfig }) {
    this.api = api;
    this._apiKey = config?.apiKey || "";
    this._maxTokens = config?.maxTokens || 8000;

    this._openai = new OpenAI({
      apiKey: this._apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  render(): HTMLElement {
    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    this.button.classList.add("ce-inline-tool");
    this.button.title = "AI Transform";

    return this.button;
  }

  surround(range: Range): void {
    if (this.isProcessing) return;

    const selectedText = range.toString().trim();
    if (!selectedText) {
      console.warn("No text selected");
      return;
    }

    // Store the range for later use
    const storedRange = range.cloneRange();

    // Show prompt overlay
    this.showPromptOverlay(selectedText, storedRange);
  }

  checkState(selection: Selection): boolean {
    return false; // Always show as inactive since we don't wrap text until after generation
  }

  private showPromptOverlay(selectedText: string, range: Range): void {
    // Remove any existing overlay
    this.removePromptOverlay();

    // Create overlay container
    this.promptOverlay = document.createElement("div");
    this.promptOverlay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      min-width: 400px;
      max-width: 500px;
    `;

    // Selected text preview
    const preview = document.createElement("div");
    preview.style.cssText = `
      background: #f5f5f5;
      padding: 8px;
      border-radius: 4px;
      margin-bottom: 12px;
      font-size: 14px;
      color: #666;
      max-height: 100px;
      overflow-y: auto;
    `;
    preview.textContent = `"${selectedText}"`;

    // Prompt input
    const promptInput = document.createElement("input");
    promptInput.type = "text";
    promptInput.placeholder = "What would you like to do? (e.g., summarize, rewrite, expand)";
    promptInput.style.cssText = `
      width: 100%;
      padding: 8px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      margin-bottom: 12px;
      font-size: 14px;
      outline: none;
    `;

    // Button container
    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    `;

    // Cancel button
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.style.cssText = `
      padding: 8px 16px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 14px;
    `;
    cancelButton.onclick = () => this.removePromptOverlay();

    // Generate button
    const generateButton = document.createElement("button");
    generateButton.textContent = "Generate";
    generateButton.style.cssText = `
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background: #000;
      color: white;
      cursor: pointer;
      font-size: 14px;
    `;
    generateButton.onclick = () => this.handleGenerate(selectedText, promptInput.value, range, generateButton);

    // Allow Enter key to generate
    promptInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        generateButton.click();
      }
    });

    // Assemble overlay
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(generateButton);
    this.promptOverlay.appendChild(preview);
    this.promptOverlay.appendChild(promptInput);
    this.promptOverlay.appendChild(buttonContainer);

    document.body.appendChild(this.promptOverlay);
    promptInput.focus();
  }

  private async handleGenerate(
    selectedText: string,
    userPrompt: string,
    range: Range,
    button: HTMLButtonElement
  ): Promise<void> {
    if (!userPrompt.trim()) {
      alert("Please enter a prompt");
      return;
    }

    this.isProcessing = true;
    button.disabled = true;
    button.innerHTML = '<div style="width: 12px; height: 12px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: white; animation: spin 0.8s linear infinite;"></div>';

    // Get surrounding context
    const context = this.getSurroundingContext(range);

    // Generate AI response
    const generatedText = await this.generateText(selectedText, userPrompt, context);

    if (generatedText && !generatedText.startsWith("Error:")) {
      this.showAcceptRejectUI(generatedText, selectedText, range);
    } else {
      alert(generatedText || "Failed to generate text");
      this.removePromptOverlay();
    }

    this.isProcessing = false;
  }

  private getSurroundingContext(range: Range): string {
    // Get the text content of the entire block
    const blockElement = range.commonAncestorContainer.parentElement?.closest('[data-block]');

    if (blockElement) {
      return blockElement.textContent || "";
    }

    // Fallback: get parent element text
    const parentElement = range.commonAncestorContainer.parentElement;
    return parentElement?.textContent || "";
  }

  private async generateText(
    selectedText: string,
    userPrompt: string,
    context: string
  ): Promise<string> {
    try {
      if (!this._apiKey) {
        return "Error: No API key configured.";
      }

      const systemMessage = `You are a helpful writing assistant. The user has selected some text and wants you to transform it.

Context (full text): "${context}"

Selected text: "${selectedText}"

User request: ${userPrompt}

Please provide ONLY the transformed text as your response, without any explanations or additional formatting.`;

      const stream = await this._openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userPrompt },
        ],
        max_tokens: this._maxTokens,
        stream: true,
      });

      let fullText = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullText += content;
        }
      }

      return fullText.trim();
    } catch (error) {
      console.error("Error generating text:", error);
      return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }

  private showAcceptRejectUI(generatedText: string, originalText: string, range: Range): void {
    this.removePromptOverlay();

    // Create new overlay for accept/reject
    this.promptOverlay = document.createElement("div");
    this.promptOverlay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      min-width: 400px;
      max-width: 600px;
    `;

    // Original text
    const originalSection = document.createElement("div");
    originalSection.style.cssText = `margin-bottom: 12px;`;
    const originalLabel = document.createElement("div");
    originalLabel.textContent = "Original:";
    originalLabel.style.cssText = `font-weight: 600; margin-bottom: 4px; font-size: 12px; color: #666;`;
    const originalContent = document.createElement("div");
    originalContent.textContent = originalText;
    originalContent.style.cssText = `
      background: #f5f5f5;
      padding: 8px;
      border-radius: 4px;
      font-size: 14px;
      max-height: 150px;
      overflow-y: auto;
    `;
    originalSection.appendChild(originalLabel);
    originalSection.appendChild(originalContent);

    // Generated text
    const generatedSection = document.createElement("div");
    generatedSection.style.cssText = `margin-bottom: 16px;`;
    const generatedLabel = document.createElement("div");
    generatedLabel.textContent = "Generated:";
    generatedLabel.style.cssText = `font-weight: 600; margin-bottom: 4px; font-size: 12px; color: #666;`;
    const generatedContent = document.createElement("div");
    generatedContent.textContent = generatedText;
    generatedContent.style.cssText = `
      background: #e8f5e9;
      padding: 8px;
      border-radius: 4px;
      font-size: 14px;
      max-height: 150px;
      overflow-y: auto;
    `;
    generatedSection.appendChild(generatedLabel);
    generatedSection.appendChild(generatedContent);

    // Button container
    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    `;

    // Reject button
    const rejectButton = document.createElement("button");
    rejectButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg> Reject`;
    rejectButton.style.cssText = `
      padding: 8px 16px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 4px;
    `;
    rejectButton.onclick = () => this.removePromptOverlay();

    // Accept button
    const acceptButton = document.createElement("button");
    acceptButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg> Accept`;
    acceptButton.style.cssText = `
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background: #4caf50;
      color: white;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 4px;
    `;
    acceptButton.onclick = () => this.acceptChange(generatedText, range);

    // Assemble overlay
    buttonContainer.appendChild(rejectButton);
    buttonContainer.appendChild(acceptButton);
    this.promptOverlay.appendChild(originalSection);
    this.promptOverlay.appendChild(generatedSection);
    this.promptOverlay.appendChild(buttonContainer);

    document.body.appendChild(this.promptOverlay);
  }

  private acceptChange(generatedText: string, range: Range): void {
    // Replace the selected text with generated text
    range.deleteContents();
    const textNode = document.createTextNode(generatedText);
    range.insertNode(textNode);

    // Clean up
    this.removePromptOverlay();
  }

  private removePromptOverlay(): void {
    if (this.promptOverlay && this.promptOverlay.parentNode) {
      this.promptOverlay.parentNode.removeChild(this.promptOverlay);
      this.promptOverlay = null;
    }
  }

  clear(): void {
    // Not needed for inline tool
  }
}
