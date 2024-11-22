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
  };

  constructor({ data, config, api, readOnly, block }: AITextParams) {
    this.api = api;
    this.readOnly = readOnly;

    // Initialize configuration
    this._promptPlaceholder = config?.promptPlaceholder || "Type your prompt...";
    this._apiKey = config?.apiKey || "";
    this._maxTokens = config?.maxTokens || 150;

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

    // Create the prompt input div
    const promptInput = document.createElement("div");
    promptInput.classList.add(this._CSS.input);
    promptInput.contentEditable = this.readOnly ? "false" : "true";
    promptInput.innerHTML = this._data.prompt || "";
    promptInput.dataset.placeholder = this._promptPlaceholder;

    // Create the generate button
    const generateButton = document.createElement("button");
    generateButton.classList.add(this._CSS.button);
    generateButton.innerText = "Generate";

    // Create the output div
    const outputText = document.createElement("div");
    outputText.classList.add(this._CSS.output);
    outputText.contentEditable = "false";
    outputText.innerHTML = this._data.generatedText || "";

    // Event listener for generating text
    generateButton.addEventListener("click", async () => {
      const prompt = promptInput.innerText;
      const generatedText = await this.generateText(prompt);
      if (generatedText) {
        outputText.innerHTML = generatedText;
        this._data.generatedText = generatedText;
      }
    });

    // Assemble the container
    container.appendChild(promptInput);
    container.appendChild(generateButton);
    container.appendChild(outputText);

    return container;
  }

  // Save the block's data
  save(blockContent: HTMLElement): AITextData {
    const promptElement = blockContent.querySelector(`.${this._CSS.input}`) as HTMLElement;
    const generatedTextElement = blockContent.querySelector(`.${this._CSS.output}`) as HTMLElement;

    const prompt = promptElement ? promptElement.innerText : "";
    const generatedText = generatedTextElement ? generatedTextElement.innerText : "";

    return {
      prompt: prompt,
      generatedText: generatedText,
    };
  }

  // Async function to generate text using the OpenAI SDK
  async generateText(prompt: string): Promise<string> {
    try {
      const completion = await this._openai.chat.completions.create({
        model: "gpt-4", // Replace with the appropriate model if necessary
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt },
        ],
        max_tokens: this._maxTokens,
      });

      // Ensure choices and message content are present
      const choice = completion.choices?.[0];
      const messageContent = choice?.message?.content;

      if (messageContent) {
        return messageContent.trim();
      } else {
        console.warn("OpenAI response did not contain a valid message.");
        return "No valid response from the AI.";
      }
    } catch (error) {
      console.error("Error generating text:", error);
      return "Error generating text.";
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
