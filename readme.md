# DirectoryCanvas - a Simple Folder Structure Generator

This Node.js application allows you to generate or create folder structures either by printing an existing folder's structure or by creating a folder structure based on a manual input or file.

## Features

1. **Print Folder Structure**: View the directory structure of a folder, with an option to skip specific folders.
2. **Create Folder Structure**: Create folders and files based on a manual input or by reading the folder structure from a file.

## Prerequisites

- Node.js installed on your system.
- Basic knowledge of how to use Node.js in the command line.

## Getting Started

1. Clone or download this repository.
2. Navigate to the folder where the script is located.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Run the script:
   ```bash
   node app.js
   ```

## Usage

When you run the script, you'll be prompted with the following options:

### Option 1: Print Folder Structure

- **Input**: Provide a folder path to print its structure.
- **Output**: The folder structure will be displayed in the terminal.
  - Optionally, you can skip certain folders by entering a comma-separated list of folder names.

### Option 2: Make Folder Structure

- **Input**: Provide the parent folder path where the new structure will be created.
- **Output**: You can input a folder structure manually or load it from a file.
  - **Manual input**: Type the folder structure, and end the input with an empty line.
  - **File input**: Specify the path to a text file containing the folder structure in the format (e.g., "file:path/to/file").
- The script will create the folder structure as per the input.

## Folder Structure Format

The folder structure is represented in a tree format using the following syntax:

- Use `├──` and `└──` for file/folder names.
- Use `/` at the end of folder names to distinguish folders from files.

Example:

```
root/
├── folder1/
│   ├── file1.txt
│   └── file2.txt
├── folder2/
└── file3.txt
```

This represents the following structure:

- `root/` (folder)
  - `folder1/` (folder)
    - `file1.txt` (file)
    - `file2.txt` (file)
  - `folder2/` (folder)
  - `file3.txt` (file)
