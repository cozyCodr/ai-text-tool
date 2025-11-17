# AI Text Tool for Editor.js

An AI-powered text generation tool for **Editor.js** that provides both **block-level** and **inline** text generation capabilities. Generate and refine content with AI assistance directly within your Editor.js editor.

## Features

- **Block Tool**: Generate complete text blocks from prompts with streaming output
- **Inline Tool**: Select and transform existing text with AI (rewrite, summarize, expand, etc.)
- **Real-time Streaming**: Watch text generate in real-time with streaming support
- **Interactive Preview**: Review AI-generated changes before accepting them
- **Intuitive UX**: Clean, minimal interface with visual feedback and loading states
- **Keyboard Shortcuts**: Use Cmd/Ctrl+Enter to quickly submit prompts
- **Multi-Framework Support**: Works with Next.js, Vite, Vue, Nuxt, SvelteKit, Angular, and more
- **Flexible Configuration**: Easy API key setup from your app's environment
- **Customizable**: Configure placeholders, max tokens, and behavior

## Installation

To install and use this tool in your Editor.js project, follow these steps:

### 1. Install the Tool via npm

```bash
npm install ai-text-tool
```

### 2. Set Up Your API Key

Add your OpenAI API key to your environment configuration based on your framework:

| Framework | Environment Variable | Config File |
|-----------|---------------------|-------------|
| **Next.js** | `NEXT_PUBLIC_OPENAI_API_KEY` | `.env.local` |
| **Vite (React/Vue/Svelte)** | `VITE_OPENAI_API_KEY` | `.env` |
| **Create React App** | `REACT_APP_OPENAI_API_KEY` | `.env` |
| **Nuxt 3** | `VITE_OPENAI_API_KEY` or runtime config | `.env` / `nuxt.config.ts` |
| **SvelteKit** | `PUBLIC_OPENAI_API_KEY` | `.env` |
| **Angular** | N/A (use `environment.ts`) | `src/environments/environment.ts` |

**Example for Next.js** (`.env.local`):
```bash
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Example for Vite/Nuxt** (`.env`):
```bash
VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Example for SvelteKit** (`.env`):
```bash
PUBLIC_OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Example for Angular** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  openaiApiKey: 'sk-your-openai-api-key-here'
};
```

### 3. Import and Configure the Tool

The tool provides both a **block tool** and an **inline tool**. Import and configure both in your Editor.js setup.

**IMPORTANT**: You must pass the API key explicitly from your app's environment to the tool's config.

**Next.js Example (Recommended)**

```javascript
import AITextTool, { AITextInlineTool } from 'ai-text-tool';

// Get API key from Next.js environment
const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

const editor = new EditorJS({
  holder: 'editorjs',
  tools: {
    aiTextTool: {
      class: AITextTool,
      config: {
        apiKey: apiKey, // Pass explicitly
        promptPlaceholder: 'Enter a prompt...',
        generatedTextPlaceholder: 'Generated text will appear here...',
      },
    },
    aiInlineTool: {
      class: AITextInlineTool,
      config: {
        apiKey: apiKey, // Pass explicitly
      },
    },
  },
});
```

**Vite Example**

```javascript
import AITextTool, { AITextInlineTool } from 'ai-text-tool';

// Get API key from Vite environment
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const editor = new EditorJS({
  holder: 'editorjs',
  tools: {
    aiTextTool: {
      class: AITextTool,
      config: {
        apiKey: apiKey,
        promptPlaceholder: 'Enter a prompt...',
        generatedTextPlaceholder: 'Generated text will appear here...',
      },
    },
    aiInlineTool: {
      class: AITextInlineTool,
      config: {
        apiKey: apiKey,
      },
    },
  },
});
```

**Create React App Example**

```javascript
import AITextTool, { AITextInlineTool } from 'ai-text-tool';

// Get API key from CRA environment
const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

const editor = new EditorJS({
  holder: 'editorjs',
  tools: {
    aiTextTool: {
      class: AITextTool,
      config: {
        apiKey: apiKey,
        promptPlaceholder: 'Enter a prompt...',
        generatedTextPlaceholder: 'Generated text will appear here...',
      },
    },
    aiInlineTool: {
      class: AITextInlineTool,
      config: {
        apiKey: apiKey,
      },
    },
  },
});
```

**Nuxt 3 / Vue 3 Example**

```javascript
import AITextTool, { AITextInlineTool } from 'ai-text-tool';

// Get API key from Nuxt runtime config
// Add to nuxt.config.ts: runtimeConfig.public.openaiApiKey
const config = useRuntimeConfig();
const apiKey = config.public.openaiApiKey;

// Or use Vite env vars in Nuxt
// const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const editor = new EditorJS({
  holder: 'editorjs',
  tools: {
    aiTextTool: {
      class: AITextTool,
      config: {
        apiKey: apiKey,
        promptPlaceholder: 'Enter a prompt...',
        generatedTextPlaceholder: 'Generated text will appear here...',
      },
    },
    aiInlineTool: {
      class: AITextInlineTool,
      config: {
        apiKey: apiKey,
      },
    },
  },
});
```

**SvelteKit Example**

```javascript
import AITextTool, { AITextInlineTool } from 'ai-text-tool';
import { env } from '$env/dynamic/public';

// Get API key from SvelteKit public env
// Add PUBLIC_OPENAI_API_KEY to your .env file
const apiKey = env.PUBLIC_OPENAI_API_KEY;

// Or use static imports
// import { PUBLIC_OPENAI_API_KEY } from '$env/static/public';

const editor = new EditorJS({
  holder: 'editorjs',
  tools: {
    aiTextTool: {
      class: AITextTool,
      config: {
        apiKey: apiKey,
        promptPlaceholder: 'Enter a prompt...',
        generatedTextPlaceholder: 'Generated text will appear here...',
      },
    },
    aiInlineTool: {
      class: AITextInlineTool,
      config: {
        apiKey: apiKey,
      },
    },
  },
});
```

**Angular Example**

```typescript
import AITextTool, { AITextInlineTool } from 'ai-text-tool';
import { environment } from './environments/environment';

// Get API key from Angular environment
// Add openaiApiKey to your environment.ts
const apiKey = environment.openaiApiKey;

const editor = new EditorJS({
  holder: 'editorjs',
  tools: {
    aiTextTool: {
      class: AITextTool,
      config: {
        apiKey: apiKey,
        promptPlaceholder: 'Enter a prompt...',
        generatedTextPlaceholder: 'Generated text will appear here...',
      },
    },
    aiInlineTool: {
      class: AITextInlineTool,
      config: {
        apiKey: apiKey,
      },
    },
  },
});
```

#### Configuration Options

The following configuration options are available for customization:

<html>
  <table>
    <thead>
      <tr>
        <th>Option</th>
        <th>Description</th>
        <th>Default Value</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <code>apiKey</code>
        </td>
        <td>The API key for accessing the AI service (e.g., OpenAI API). Must be passed explicitly from your app's environment variables (e.g., process.env.NEXT_PUBLIC_OPENAI_API_KEY)</td>
        <td>
          <code>undefined (required)</code>
        </td>
      </tr>
      <tr>
        <td><code>promptPlaceholder</code></td>
        <td>Placeholder text in the input field where users type the prompt</td>
        <td><code>Enter a prompt...</code></td>
      </tr>
      <tr>
        <td><code>generatedTextPlaceholder</code></td>
        <td>Placeholder text for the output area where generated text will appear</td>
        <td>
          <code>Generated text will appear here...</code>
        </td>
      </tr>
      <tr>
        <td><code>readOnly</code></td>
        <td>Whether the tool is in read-only mode (cannot be edited by the user)</td>
        <td><code>false</code></td>
      </tr>
    </tbody>
  </table>
</html>

## Usage

### Block Tool Usage

The block tool generates complete text blocks from scratch:

1. Click the "+" button in Editor.js to add a new block
2. Select **AI Text Tool** from the block menu
3. Enter your prompt in the input field (e.g., "Write a paragraph about climate change")
4. Press **Enter** or **Cmd/Ctrl+Enter** to generate
5. Watch the text stream in real-time
6. The generated text appears in the output area and can be edited

### Inline Tool Usage

The inline tool transforms existing text with AI:

1. **Select text** in any Editor.js block (paragraph, heading, etc.)
2. Click the **AI icon** (✨) in the inline toolbar that appears
3. Enter a transformation prompt in the modal:
   - "Make this more professional"
   - "Summarize this"
   - "Expand on this idea"
   - "Fix grammar and spelling"
4. Press **Enter** or click the **→** button
5. Watch the transformation happen with a **loading spinner**
6. The transformed text appears **highlighted in blue**
7. **Accept** (green ✓) or **Reject** (red ×) the changes

#### Inline Tool Features

- **Real-time Preview**: See changes before accepting them
- **Visual Feedback**:
  - Loading spinner during generation
  - Blue highlight on generated text
  - Minimal accept/reject controls
- **Context-Aware**: Uses surrounding text for better results
- **Non-Destructive**: Original text preserved until you accept
- **Keyboard Shortcuts**: Cmd/Ctrl+Enter to submit prompts quickly

## Data Structure

### Block Tool Data

When the block tool is saved, it returns:

```json
{
  "prompt": "Write a paragraph about climate change",
  "generatedText": "Climate change is one of the most pressing challenges..."
}
```

### Inline Tool Data

The inline tool modifies existing text in place and doesn't create separate data structures. Changes are applied directly to the text content of the block.

## Requirements

- **Editor.js** v2.0.0 or higher
- **OpenAI API Key** (for text generation)
- Modern browser with ES6 support

## Styling

The tool includes default styles via `index.css`. The CSS includes:
- Loading spinner animations
- Modal styling for the inline tool
- Accept/reject button styles
- Responsive design for mobile devices

Import the styles in your project:

```javascript
import 'ai-text-tool/index.css';
```

## API Reference

### Block Tool

```javascript
{
  class: AITextTool,
  config: {
    apiKey?: string,             // Optional: OpenAI API key (auto-detected from env if not provided)
    promptPlaceholder?: string,  // Optional: Prompt input placeholder
    generatedTextPlaceholder?: string, // Optional: Output area placeholder
    readOnly?: boolean          // Optional: Read-only mode (default: false)
  }
}
```

### Inline Tool

```javascript
{
  class: AITextInlineTool,
  config: {
    apiKey?: string,   // Optional: OpenAI API key (auto-detected from env if not provided)
    maxTokens?: number // Optional: Maximum tokens for generation (default: 8000)
  }
}
```

## Contributing

We welcome contributions to this tool! To contribute:

1. Fork the repository
2. Create a feature branch
3. Implement your changes and test them
4. Open a pull request with a description of your changes

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Support

For issues, questions, or feature requests, please open an issue on the [GitHub repository](https://github.com/cozyCodr/ai-text-tool).

## Changelog

### v1.2.0
- **Environment Variable Auto-detection**: Automatically detects OpenAI API key from framework-specific environment variables (Next.js, Vite, Create React App)
- Made `apiKey` config optional - can now omit it entirely if using environment variables
- Added cross-framework compatibility for easier setup

### v1.1.0
- Added inline tool for transforming selected text
- Implemented real-time streaming for both block and inline tools
- Added interactive preview with accept/reject controls
- Improved UX with loading states and visual feedback
- Added keyboard shortcuts (Cmd/Ctrl+Enter)
- Refined modal UI with minimal design
- Context-aware generation using surrounding text

### v1.0.x
- Initial release with block tool
- Basic AI text generation functionality
