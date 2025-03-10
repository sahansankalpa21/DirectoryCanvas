const fs = require("fs");
const path = require("path");
const readline = require("readline");

/**
 * Generate folder structure
 * @param {string} dir - Directory to scan
 * @param {string[]} skipFolders - Folders to skip
 * @param {string} prefix - Prefix for indentation
 */
function generateFolderStructure(dir, skipFolders = [], prefix = "") {
  const files = fs.readdirSync(dir);

  files.forEach((file, index) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    const isLast = index === files.length - 1;

    // Skip folders in the skipFolders list
    if (skipFolders.includes(file)) {
      return;
    }

    // Print current file/folder
    const marker = isLast ? "└── " : "├── ";
    console.log(`${prefix}${marker}${file}${stats.isDirectory() ? "/" : ""}`);

    // If it's a directory, recurse into it
    if (stats.isDirectory()) {
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      generateFolderStructure(filePath, skipFolders, newPrefix);
    }
  });
}

/**
 * Parse folder structure string to JSON
 * @param {string} folderStructure - The string representing the folder structure
 * @returns {Array} - The JSON representation of the folder structure
 */
function folderStrToJson(folderStructure) {
  const lines = folderStructure.split("\n");
  let modified_lines = [];

  // Remove comments and empty lines
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].split("#")[0].trim(); // Remove comments
    if (line.length > 0) {
      modified_lines.push(line);
    }
  }

  /**
   * Splits a string at the first letter.
   * @param {string} input - The input string.
   * @returns {[string, string]} - First letter and the rest of the string.
   */
  function splitAtFirstLetter(input) {
    if (!input) return ["", ""];

    const match = input.match(/[a-zA-Z]/);
    if (!match) return [];

    const index = match.index;
    if (index === undefined) return ["", input];
    return [input.slice(0, index), input.slice(index)];
  }

  let file_depths = [];

  // Process each line
  for (let i = 0; i < modified_lines.length; i++) {
    let separate_file_depth = splitAtFirstLetter(modified_lines[i]);
    if (separate_file_depth.length !== 0) {
      file_depths.push([
        separate_file_depth[0].length,
        separate_file_depth[separate_file_depth.length - 1],
      ]); // [depth, file]
    }
  }

  function buildFolderTree(fileDepths) {
    let root = [];
    let depthStack = [{ depth: -1, children: root }];

    for (let i = 0; i < fileDepths.length; i++) {
      let depth = fileDepths[i][0];
      let name = fileDepths[i][1];

      let node = { name, subfolders: [] };

      // Find the correct parent based on depth
      while (
        depthStack.length > 0 &&
        depthStack[depthStack.length - 1].depth >= depth
      ) {
        depthStack.pop();
      }

      let parent = depthStack[depthStack.length - 1].children;
      parent.push(node);

      // If it's a folder (ends with `/`), add it to depthStack
      if (name.endsWith("/")) {
        depthStack.push({ depth, children: node.subfolders });
      }
    }

    return root;
  }

  return buildFolderTree(file_depths);
}

/**
 * Create folders and files from JSON structure
 * @param {string} baseDir - Base directory
 * @param {Array} structure - JSON structure
 */
function createFoldersFromJson(baseDir, structure) {
  structure.forEach((item) => {
    const itemPath = path.join(baseDir, item.name);

    if (item.name.endsWith("/")) {
      // It's a directory
      const dirName = item.name.slice(0, -1); // Remove trailing slash
      const dirPath = path.join(baseDir, dirName);

      if (!fs.existsSync(dirPath)) {
        console.log(`Creating directory: ${dirPath}`);
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Process subfolders
      if (item.subfolders && item.subfolders.length > 0) {
        createFoldersFromJson(dirPath, item.subfolders);
      }
    } else {
      // It's a file
      console.log(`Creating file: ${itemPath}`);
      fs.writeFileSync(itemPath, ""); // Create empty file
    }
  });
}

/**
 * Read folder structure from file
 * @param {string} filePath
 * @returns {Promise<string>}
 */
async function readFromFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Ask a question and return the answer
 * @param {string} question
 * @returns {Promise<string>}
 */
function askQuestion(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log("Folder Structure Generator/Creator");
  console.log("=================================");

  const action = await askQuestion(
    "Choose an option (1 - Print folder structure, 2 - Make folder structure): "
  );

  if (action === "1") {
    const folderPath =
      (await askQuestion("Enter the folder path: ")) || process.cwd();
    const skipInput = await askQuestion(
      "Enter folders to skip (comma-separated, or leave empty): "
    );
    const skipFolders = skipInput
      ? skipInput.split(",").map((f) => f.trim())
      : [];

    console.log("\nFolder Structure:");
    console.log(path.basename(folderPath));
    generateFolderStructure(folderPath, skipFolders);
  } else if (action === "2") {
    const baseFolderPath =
      (await askQuestion("Enter the main folder path (parent folder): ")) ||
      process.cwd();
    console.log("\nEnter the folder structure.");
    console.log('For file input, enter the file path or "file:path/to/file".');
    console.log(
      "For manual input, just start typing and end with an empty line:"
    );

    const firstLine = await askQuestion("> ");
    let folderStructure = "";

    if (firstLine.startsWith("file:")) {
      try {
        folderStructure = await readFromFile(firstLine.substring(5).trim());
        console.log(
          `\nRead ${folderStructure.split("\n").length} lines from file.`
        );
      } catch (err) {
        console.error("\nError reading the file:", err.message);
        rl.close();
        return;
      }
    } else {
      folderStructure = firstLine + "\n";
      let line;
      console.log("Enter folder structure (empty line to finish):");
      while ((line = await askQuestion("> ")) !== "") {
        folderStructure += line + "\n";
      }
    }

    console.log("\nCreating folder structure...");
    // Parse folder structure to JSON and create folders
    const folderJson = folderStrToJson(folderStructure);
    createFoldersFromJson(baseFolderPath, folderJson);
    console.log("\nFolder structure creation complete!");
  } else {
    console.log("Invalid option selected.");
  }

  rl.close();
}

main().catch((error) => {
  console.error("An error occurred:", error);
  rl.close();
});
