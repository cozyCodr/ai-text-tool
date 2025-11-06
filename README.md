# AI Text Tool for Editor.js

An AI-powered text generation tool for **Editor.js** that provides both **block-level** and **inline** text generation capabilities. Generate and refine content with AI assistance directly within your Editor.js editor.

## Features

- **Block Tool**: Generate complete text blocks from prompts with streaming output
- **Inline Tool**: Select and transform existing text with AI (rewrite, summarize, expand, etc.)
- **Real-time Streaming**: Watch text generate in real-time with streaming support
- **Interactive Preview**: Review AI-generated changes before accepting them
- **Intuitive UX**: Clean, minimal interface with visual feedback and loading states
- **Keyboard Shortcuts**: Use Cmd/Ctrl+Enter to quickly submit prompts
- **Customizable**: Configure API keys, placeholders, and behavior

## Installation

To install and use this tool in your Editor.js project, follow these steps:

### 1. Install the Tool via npm

```bash
npm install ai-text-tool
```

### 2. Import and Configure the Tool

The tool provides both a **block tool** and an **inline tool**. Import and configure both in your Editor.js setup:

```javascript
import AITextTool from 'ai-text-tool';
import 'ai-text-tool/index.css'; // Import styles

const editor = new EditorJS({
  holder: 'editorjs',
  tools: {
    // Block tool for generating new text blocks
    aiTextTool: {
      class: AITextTool,
      config: {
        apiKey: 'your-openai-api-key', // Required: Your OpenAI API key
        promptPlaceholder: 'Enter a prompt...',
        generatedTextPlaceholder: 'Generated text will appear here...',
      },
    },
    // Inline tool for transforming selected text
    aiInlineTool: {
      class: AITextTool.InlineTool,
      config: {
        apiKey: 'your-openai-api-key', // Required: Your OpenAI API key
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
        <td>The API key for accessing the AI service (e.g., OpenAI API)</td>
        <td>
          <code>''</code> (Required)
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
    apiKey: string,              // Required: OpenAI API key
    promptPlaceholder: string,   // Optional: Prompt input placeholder
    generatedTextPlaceholder: string, // Optional: Output area placeholder
    readOnly: boolean           // Optional: Read-only mode (default: false)
  }
}
```

### Inline Tool

```javascript
{
  class: AITextTool.InlineTool,
  config: {
    apiKey: string  // Required: OpenAI API key
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
