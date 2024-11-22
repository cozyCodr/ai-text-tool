// webpack.config.js

const path = require("path");

module.exports = {
  entry: "./src/index.ts", // Adjust if your entry file is different
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js", // This will be the output file
    library: "AITextTool", // Expose your tool as a global object
    libraryTarget: "umd", // UMD for compatibility with multiple module systems
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader", // To compile TypeScript
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"], // Bundle CSS files
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", ".css"], // Resolve .ts, .js, .css extensions
  },
  externals: {
    // Specify any dependencies that should not be bundled (e.g., Editor.js)
    "@editorjs/editorjs": "EditorJS", // Assuming EditorJS is expected to be loaded externally
  },
  devtool: "source-map", // Enable source maps for debugging
};
