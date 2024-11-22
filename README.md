# AI Text Tool for Editor.js

An AI-powered text generation tool for **Editor.js** that allows users to input a prompt and automatically generate text content. This tool can be integrated seamlessly into any Editor.js-based project.

## Features

- **AI-powered text generation**: Generate text based on a user-defined prompt.
- **Customizable**: Easily configure prompt placeholders and behavior.
- **Seamless Integration**: Designed to be used with Editor.js.

## Installation

To install and use this tool in your Editor.js project, follow these steps:

### 1. Install the Tool via npm

```bash
npm install ai-text-tool
```

### 2. Import the Tool into Your Project

In your Editor.js configuration, import and add the tool to the tools section.

```javascript
  import AITextTool from 'ai-text-tool';

  const editor = new EditorJS({
    holder: 'editorjs',
    tools: {
      aiTextTool: {
        class: AITextTool,
        inlineToolbar: true,  // Optional: Whether this tool can be used in the inline toolbar
        config: {
          // Customize the tool's settings here
          apiKey: 'your-api-key',
          promptPlaceholder: 'Enter a prompt...',
          generatedTextPlaceholder: 'Generated text will appear here...',
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

#### Usage

1. Adding the Tool to the Editor:
   - Add the tool to your Editor.js configuration as shown in the "Import the Tool" section above.

2. Interacting with the Tool:
    - Once added, the tool will appear as a block in the editor.
    - You can type a prompt in the input area, and the generated text will automatically appear in the output section based on the AI service.

3. Saving Data:
   - The tool's data will be saved as an object with prompt and generatedText properties, which can then be used or exported as required.

#### Example Data Structure

When the tool is saved, it returns an object with the following data structure:

```json
  {
    "prompt": "Enter your prompt here",
    "generatedText": "Generated AI text based on the prompt."
  }
```

#### Contributing

We welcome contributions to this tool! To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Implement your changes and test them.
4. Open a pull request with a description of your changes.

#### License

This project is licensed under the MIT License - see the LICENSE file for details.
