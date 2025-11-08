import type { API, InlineTool, SanitizerConfig } from "@editorjs/editorjs";
import OpenAI from "openai";
import { getClientSideEnvVar } from "./envUtils";

export interface AITextInlineConfig {
  apiKey?: string;      // OpenAI API Key (optional, will auto-detect from env)
  maxTokens?: number;
}

export default class AITextInlineTool implements InlineTool {
  private api: API;
  private button: HTMLButtonElement | null = null;
  private _apiKey: string;
  private _openai: OpenAI;
  private _maxTokens: number;
  private tag: string = "SPAN";
  private isProcessing: boolean = false;
  private previewSpan: HTMLSpanElement | null = null;
  private originalText: string = "";
  private controlsContainer: HTMLDivElement | null = null;
  private currentRange: Range | null = null;
  private currentSelectedText: string = "";
  private actionsContainer: HTMLDivElement | null = null;
  private outsideClickHandler: ((e: MouseEvent) => void) | null = null;

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
    // Priority: config.apiKey > environment variables
    this._apiKey = config?.apiKey || getClientSideEnvVar('OPENAI_API_KEY') || "";
    this._maxTokens = config?.maxTokens || 8000;

    this._openai = new OpenAI({
      apiKey: this._apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  render(): HTMLElement {
    this.button = document.createElement("button");
    this.button.type = "button";
    this.button.innerHTML = "Ai";
    this.button.classList.add("ce-inline-tool");
    this.button.style.fontWeight = "bold";
    this.button.style.fontSize = "14px";
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

    // Store the range and original text
    this.originalText = selectedText;
    this.currentRange = range.cloneRange();
    this.currentSelectedText = selectedText;
  }

  checkState(selection: Selection): boolean {
    return false;
  }

  renderActions(): HTMLElement {
    // Create outer container (vertical layout)
    this.actionsContainer = document.createElement("div");
    this.actionsContainer.style.cssText = `
      display: flex !important;
      flex-direction: column !important;
      padding: 0 !important;
      background: transparent !important;
      border: none !important;
      width: min(720px, calc(100vw - 32px)) !important;
      max-width: calc(100vw - 32px) !important;
      min-width: 0 !important;
      overflow: visible !important;
      gap: 8px !important;
      box-sizing: border-box !important;
    `;

    // Prompt textarea (no border/outline)
    const promptInput = document.createElement("textarea");
    promptInput.placeholder = "What to do? (e.g., summarize, rewrite)";
    promptInput.style.cssText = `
      padding: 8px !important;
      border: none !important;
      outline: none !important;
      background: #f5f5f5 !important;
      border-radius: 6px !important;
      font-size: 14px !important;
      width: 100% !important;
      height: 140px !important;
      box-sizing: border-box !important;
      resize: vertical !important;
      white-space: pre-wrap !important;
      font-family: inherit !important;
    `;

    // Button container (aligned to the right)
    const buttonContainer = document.createElement("div");
    buttonContainer.style.cssText = `
      display: flex !important;
      justify-content: flex-end !important;
      width: 100% !important;
    `;

    // Arrow button (→) on the right
    const goButton = document.createElement("button");
    goButton.innerHTML = "→";
    goButton.style.cssText = `
      padding: 8px 12px !important;
      border: none !important;
      border-radius: 4px !important;
      background: #000 !important;
      color: white !important;
      cursor: pointer !important;
      font-size: 16px !important;
      font-weight: bold !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: background 0.2s !important;
    `;
    goButton.onmouseover = () => goButton.style.background = "#333";
    goButton.onmouseout = () => goButton.style.background = "#000";
    goButton.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleGenerate(this.currentSelectedText, promptInput.value, this.currentRange!);
    };

    // Allow Enter key to submit
    promptInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        e.stopPropagation();
        goButton.click();
      }
    });

    // Assemble container
    buttonContainer.appendChild(goButton);
    this.actionsContainer.appendChild(promptInput);
    this.actionsContainer.appendChild(buttonContainer);

    // Auto-focus the input
    setTimeout(() => promptInput.focus(), 0);

    return this.actionsContainer;
  }

  private async handleGenerate(
    selectedText: string,
    userPrompt: string,
    range: Range
  ): Promise<void> {
    if (!userPrompt.trim()) {
      alert("Please enter a prompt");
      return;
    }

    this.isProcessing = true;

    // Close the inline toolbar by simulating a click outside
    // This removes the entire EditorJS inline toolbar container
    const editorElement = document.querySelector('.codex-editor');
    if (editorElement) {
      // Trigger a click on the editor to close the toolbar
      (editorElement as HTMLElement).click();
    }

    // Small delay to ensure toolbar is closed
    await new Promise(resolve => setTimeout(resolve, 50));

    // Get surrounding context
    const context = this.getSurroundingContext(range);

    // Create a loading spinner
    const loadingSpinner = document.createElement("span");
    loadingSpinner.className = "cdx-ai-text-loader";
    loadingSpinner.style.cssText = `
      margin-right: 4px;
      display: inline-block;
    `;

    // Create preview span WITHOUT highlight initially (no background)
    this.previewSpan = document.createElement("span");
    this.previewSpan.textContent = selectedText; // Keep original text visible
    this.previewSpan.style.cssText = `
      padding: 2px 4px;
      border-radius: 3px;
      transition: background-color 0.3s;
    `;

    // Replace selected text with: [spinner][preview span]
    range.deleteContents();
    range.insertNode(this.previewSpan);
    this.previewSpan.parentNode?.insertBefore(loadingSpinner, this.previewSpan);

    // Generate with streaming
    await this.generateTextWithStreaming(selectedText, userPrompt, context, this.previewSpan);

    // Remove the loading spinner
    if (loadingSpinner.parentNode) {
      loadingSpinner.parentNode.removeChild(loadingSpinner);
    }

    // Add highlight ONLY after generation completes
    this.previewSpan.style.backgroundColor = "#ADD8E6";

    // Show accept/reject controls below the highlighted text
    this.showAcceptRejectControls(this.previewSpan, range);

    this.isProcessing = false;
  }

  private getSurroundingContext(range: Range): string {
    const blockElement = range.commonAncestorContainer.parentElement?.closest('[data-block]');
    if (blockElement) {
      return blockElement.textContent || "";
    }
    const parentElement = range.commonAncestorContainer.parentElement;
    return parentElement?.textContent || "";
  }

  private async generateTextWithStreaming(
    selectedText: string,
    userPrompt: string,
    context: string,
    outputElement: HTMLSpanElement
  ): Promise<void> {
    try {
      if (!this._apiKey) {
        outputElement.textContent = "Error: No API key configured.";
        return;
      }

      const systemMessage = `You are a helpful writing assistant. The user has selected some text and wants you to transform it.

Context (full text): "${context}"

Selected text: "${selectedText}"

User request: ${userPrompt}

IMPORTANT: Provide ONLY the transformed text as your response. Do not use any markdown formatting (no asterisks, underscores, backticks, etc.). Do not add explanations or additional text. Output plain text only.`;

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
          outputElement.textContent = fullText;

          // Small delay for smooth streaming effect
          await new Promise(resolve => setTimeout(resolve, 20));
        }
      }

      if (!fullText.trim()) {
        outputElement.textContent = "Error: No content received from AI.";
      }
    } catch (error) {
      console.error("Error generating text:", error);
      outputElement.textContent = `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }

  private showAcceptRejectControls(previewSpan: HTMLSpanElement, range: Range): void {
    // Create controls container
    this.controlsContainer = document.createElement("div");
    this.controlsContainer.style.cssText = `
      display: inline-flex;
      gap: 8px;
      margin-left: 8px;
      vertical-align: middle;
    `;

    // Reject button (×) - red, no background/border
    const rejectButton = document.createElement("button");
    rejectButton.innerHTML = "×";
    rejectButton.title = "Reject";
    rejectButton.style.cssText = `
      padding: 0;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 20px;
      font-weight: bold;
      color: #dc3545;
      transition: opacity 0.2s;
    `;
    rejectButton.onmouseover = () => rejectButton.style.opacity = "0.7";
    rejectButton.onmouseout = () => rejectButton.style.opacity = "1";
    rejectButton.onclick = () => this.rejectChange(previewSpan);

    // Accept button (✓) - green, no background/border
    const acceptButton = document.createElement("button");
    acceptButton.innerHTML = "✓";
    acceptButton.title = "Accept";
    acceptButton.style.cssText = `
      padding: 0;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 20px;
      font-weight: bold;
      color: #28a745;
      transition: opacity 0.2s;
    `;
    acceptButton.onmouseover = () => acceptButton.style.opacity = "0.7";
    acceptButton.onmouseout = () => acceptButton.style.opacity = "1";
    acceptButton.onclick = () => this.acceptChange(previewSpan);

    // Add buttons to container
    this.controlsContainer.appendChild(rejectButton);
    this.controlsContainer.appendChild(acceptButton);

    // Insert controls right after the preview span
    if (previewSpan.parentNode) {
      previewSpan.parentNode.insertBefore(this.controlsContainer, previewSpan.nextSibling);
    }

    // Make the preview span clickable to restore controls if they get hidden
    // Use mousedown instead of onclick for contenteditable compatibility
    previewSpan.style.cursor = "pointer";
    previewSpan.style.userSelect = "none"; // Prevent text selection on click
    previewSpan.contentEditable = "false"; // Make span non-editable to capture clicks

    previewSpan.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!this.controlsContainer || !this.controlsContainer.parentNode) {
        // Controls were removed, restore them
        this.showAcceptRejectControls(previewSpan, range);
      }
    });

    // Setup outside click handler to hide controls but keep highlight
    this.setupOutsideClickHandler(previewSpan);
  }

  private setupOutsideClickHandler(previewSpan: HTMLSpanElement): void {
    // Remove existing handler if any
    if (this.outsideClickHandler) {
      document.removeEventListener("click", this.outsideClickHandler);
    }

    // Create new handler
    this.outsideClickHandler = (e: MouseEvent) => {
      const target = e.target as Node;

      // Check if click is outside both the preview span and controls
      if (
        this.previewSpan &&
        this.controlsContainer &&
        !this.previewSpan.contains(target) &&
        !this.controlsContainer.contains(target)
      ) {
        // Hide controls but keep highlight and span
        this.removeControls();
      }
    };

    // Add listener with a small delay to avoid immediate triggering
    setTimeout(() => {
      if (this.outsideClickHandler) {
        document.addEventListener("click", this.outsideClickHandler);
      }
    }, 100);
  }

  private acceptChange(previewSpan: HTMLSpanElement): void {
    // Remove highlight and controls, keep the generated text
    if (previewSpan && previewSpan.parentNode) {
      const generatedText = previewSpan.textContent || "";
      const parent = previewSpan.parentNode;

      // Create text node and replace the span
      const textNode = document.createTextNode(generatedText);
      parent.replaceChild(textNode, previewSpan);

      // Force a reflow to ensure DOM is updated
      parent.normalize();

      // Trigger EditorJS change detection for undo support
      this.triggerEditorChange(parent);
    }

    // Clean up
    this.removeControls();
    this.cleanupEventHandlers();
    this.previewSpan = null;
  }

  private rejectChange(previewSpan: HTMLSpanElement): void {
    // Remove highlight and controls, restore original text
    if (previewSpan && previewSpan.parentNode) {
      const parent = previewSpan.parentNode;

      // Create text node with original text and replace the span
      const textNode = document.createTextNode(this.originalText);
      parent.replaceChild(textNode, previewSpan);

      // Force a reflow to ensure DOM is updated
      parent.normalize();

      // Trigger EditorJS change detection for undo support
      this.triggerEditorChange(parent);
    }

    // Clean up
    this.removeControls();
    this.cleanupEventHandlers();
    this.previewSpan = null;
  }

  private triggerEditorChange(node: Node): void {
    // Dispatch input event to trigger EditorJS's change detection
    const blockElement = (node as HTMLElement).closest('[contenteditable="true"]');
    if (blockElement) {
      const inputEvent = new Event('input', { bubbles: true, cancelable: true });
      blockElement.dispatchEvent(inputEvent);
    }
  }

  private cleanupEventHandlers(): void {
    // Remove outside click handler
    if (this.outsideClickHandler) {
      document.removeEventListener("click", this.outsideClickHandler);
      this.outsideClickHandler = null;
    }
  }

  private removeControls(): void {
    if (this.controlsContainer && this.controlsContainer.parentNode) {
      this.controlsContainer.parentNode.removeChild(this.controlsContainer);
      this.controlsContainer = null;
    }
  }

  clear(): void {
    this.removeControls();
    this.cleanupEventHandlers();
    if (this.actionsContainer && this.actionsContainer.parentNode) {
      this.actionsContainer.parentNode.removeChild(this.actionsContainer);
      this.actionsContainer = null;
    }
  }
}
