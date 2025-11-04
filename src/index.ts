import type { API, BlockAPI, BlockTool, ToolConfig } from "@editorjs/editorjs";
import './index.css';
import OpenAI from "openai";

// Interface for configuration options
export interface AITextConfig extends ToolConfig {
  apiKey: string;       // OpenAI API Key
  promptPlaceholder: string; // Placeholder for the input prompt
  maxTokens: number;    // Max tokens for AI response
}

// Interface for data structure
export interface AITextData {
  prompt: string;
  generatedText: string;
}

// Constructor parameters interface
interface AITextParams {
  data: AITextData;
  config?: AITextConfig;
  api: API;
  readOnly: boolean;
  block: BlockAPI;
}

// Export both tools
export { default as AITextInlineTool } from './inline';

export default class AITextTool implements BlockTool {
  api: API;
  readOnly: boolean;
  private _promptPlaceholder: string;
  private _data: AITextData;
  private _apiKey: string;
  private _openai: OpenAI;
  private _maxTokens: number;
  private _block: BlockAPI;

  // CSS classes for styling
  private _CSS = {
    baseClass: "cdx-ai-text",
    wrapper: "cdx-ai-text-wrapper",
    input: "cdx-ai-text-input",
    output: "cdx-ai-text-output",
    button: "cdx-ai-text-button",
    buttonContent: "cdx-ai-text-button-content",
    loader: "cdx-ai-text-loader",
  };

  constructor({ data, config, api, readOnly, block }: AITextParams) {
    this.api = api;
    this.readOnly = readOnly;

    // Initialize configuration
    this._promptPlaceholder = config?.promptPlaceholder || "Type your prompt...";
    this._apiKey = config?.apiKey || "";
    this._maxTokens = config?.maxTokens || 8000;

    // Initialize data
    this._data = {
      prompt: data.prompt || "",
      generatedText: data.generatedText || "",
    };

    // Initialize OpenAI instance with the provided API key
    this._openai = new OpenAI({
      apiKey: this._apiKey,
      dangerouslyAllowBrowser: true
    });

    this._block = block;
  }

  // Define how the tool appears in the Editor.js toolbox
  static get toolbox(): { icon: string; title: string } {
    return {
      icon: 'Ai', // Define your icon or text here
      title: "AI Text",
    };
  }

  // Render the AI Text Tool block
  render(): HTMLElement {
    // Create container div
    const container = document.createElement("div");
    container.classList.add(this._CSS.wrapper);

    // If we already have generated text, just show it as normal editable content
    if (this._data.generatedText) {
      const textDiv = document.createElement("div");
      textDiv.contentEditable = this.readOnly ? "false" : "true";
      textDiv.style.outline = "none";
      textDiv.style.minHeight = "40px";
      textDiv.textContent = this._data.generatedText;
      container.appendChild(textDiv);
      return container;
    }

    // Otherwise, show the prompt input with arrow button
    const inputWrapper = document.createElement("div");
    inputWrapper.classList.add(this._CSS.input);
    inputWrapper.style.display = "flex";
    inputWrapper.style.alignItems = "center";
    inputWrapper.style.gap = "8px";

    // Create the prompt input div
    const promptInput = document.createElement("div");
    promptInput.contentEditable = this.readOnly ? "false" : "true";
    promptInput.style.flex = "1";
    promptInput.style.outline = "none";
    promptInput.textContent = this._data.prompt || "";
    promptInput.dataset.placeholder = this._promptPlaceholder;

    // Create the generate button (arrow)
    const generateButton = document.createElement("button");
    generateButton.classList.add(this._CSS.button);
    generateButton.innerHTML = "→";
    generateButton.title = "Generate AI text";

    // Event listener for generating text
    generateButton.addEventListener("click", async () => {
      const prompt = promptInput.innerText;

      // Show loading state
      generateButton.disabled = true;
      generateButton.innerHTML = '<div class="' + this._CSS.loader + '"></div>';

      // Pass the prompt input element for real-time streaming
      const generatedText = await this.generateText(prompt, promptInput);

      // Save the final generated text and prompt
      if (generatedText) {
        this._data.generatedText = generatedText;
        this._data.prompt = prompt;

        // Replace the entire container with normal text
        const textDiv = document.createElement("div");
        textDiv.contentEditable = this.readOnly ? "false" : "true";
        textDiv.style.outline = "none";
        textDiv.style.minHeight = "40px";
        textDiv.textContent = generatedText;

        // Clear and replace container content
        container.innerHTML = "";
        container.appendChild(textDiv);
      }
    });

    // Show button when user types
    promptInput.addEventListener("input", () => {
      if (promptInput.innerText.trim() !== "") {
        generateButton.style.display = "block";
      } else {
        generateButton.style.display = "none";
      }
    });

    // Initially hide button if no prompt
    if (!promptInput.textContent.trim()) {
      generateButton.style.display = "none";
    }

    // Assemble the container
    inputWrapper.appendChild(promptInput);
    inputWrapper.appendChild(generateButton);
    container.appendChild(inputWrapper);

    return container;
  }

  // Save the block's data
  save(blockContent: HTMLElement): AITextData {
    // If we have generated text, get it from the simple text div
    if (this._data.generatedText) {
      const textDiv = blockContent.querySelector('div[contenteditable]') as HTMLElement;
      const currentText = textDiv ? textDiv.textContent?.trim() || "" : "";

      return {
        prompt: this._data.prompt || "",
        generatedText: currentText,
      };
    }

    // Otherwise, save the prompt
    const inputWrapper = blockContent.querySelector(`.${this._CSS.input}`) as HTMLElement;
    const contentElement = inputWrapper?.querySelector('div[contenteditable]') as HTMLElement;
    const text = contentElement ? contentElement.textContent?.trim() || "" : "";

    return {
      prompt: text,
      generatedText: "",
    };
  }

  // Async function to generate text using the OpenAI SDK with streaming
  async generateText(prompt: string, outputElement?: HTMLElement): Promise<string> {
    try {
      console.log("Generating text with prompt:", prompt);
      console.log("API Key present:", !!this._apiKey);

      if (!this._apiKey) {
        console.error("No API key provided");
        return "Error: No API key configured. Please add your OpenAI API key.";
      }

      if (!prompt || prompt.trim() === "") {
        console.warn("Empty prompt provided");
        return "Please enter a prompt first.";
      }

      const stream = await this._openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt },
        ],
        max_tokens: this._maxTokens,
        stream: true,
      });

      console.log("Streaming started...");

      let fullText = "";
      let chunkCount = 0;

      // Stream the response
      for await (const chunk of stream) {
        chunkCount++;

        // Log first few chunks to debug
        if (chunkCount <= 3) {
          console.log(`Chunk ${chunkCount}:`, JSON.stringify(chunk));
        }

        // GPT-5 models may have reasoning in delta, check both content and reasoning
        const delta = chunk.choices[0]?.delta;
        const content = delta?.content || "";

        if (content) {
          fullText += content;
          // Update the output element in real-time if provided
          if (outputElement) {
            // Use textContent for better performance and preserve formatting
            outputElement.textContent = fullText;

            // Add a small delay to create a typing effect (20ms per chunk)
            await new Promise(resolve => setTimeout(resolve, 20));
          }
        }
      }

      console.log(`Total chunks received: ${chunkCount}`);

      console.log("Streaming complete. Full text:", fullText);
      console.log("Full text length:", fullText.length);

      if (fullText && fullText.trim().length > 0) {
        return fullText.trim();
      } else {
        console.warn("OpenAI response did not contain any content.");
        return "Error: No content received from AI.";
      }
    } catch (error) {
      console.error("Error generating text:", error);
      return `Error generating text: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  // Define what elements can be sanitized
  static get sanitize() {
    return {
      prompt: {
        br: true,
      },
      generatedText: {
        br: true,
      },
    };
  }
}
