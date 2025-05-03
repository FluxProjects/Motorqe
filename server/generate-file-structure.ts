import { readdirSync, statSync, writeFileSync } from 'fs';
import { join, relative } from 'path';

// Define a type for file/folder structure
type FileStructure = {
  type: 'file' | 'folder';
  name: string;
};

// Function to get the folder and file structure for a given directory
function getFolderStructure(dirPath: string): FileStructure[] {
  let results: FileStructure[] = [];

  const list = readdirSync(dirPath);

  list.forEach(function (file) {
    file = join(dirPath, file);
    const stat = statSync(file);

    if (stat && stat.isDirectory()) {
      results.push({ type: 'folder', name: file });
      results = results.concat(getFolderStructure(file)); // Recurse into the folder
    } else {
      results.push({ type: 'file', name: file });
    }
  });

  return results;
}

// Function to write the folder structure to a text file
function writeStructureToFile(): void {
  let content = '';

  // Specify the directories relative to the project root
  const directories = [join(__dirname, '..', 'server'), join(__dirname, '..', 'client')];

  directories.forEach((dirPath) => {
    if (statSync(dirPath).isDirectory()) {
      const folderName = relative(__dirname, dirPath);
      content += `\n[Start of ${folderName} Folder]\n`;
      const structure = getFolderStructure(dirPath);

      structure.forEach((item) => {
        const relativePath = relative(__dirname, item.name);
        const type = item.type === 'folder' ? '[Folder]' : '[File]';
        content += `${type} ${relativePath}\n`;
      });

      content += `[End of ${folderName} Folder]\n`;
    } else {
      console.log(`The directory ${dirPath} does not exist.`);
    }
  });

  writeFileSync('project-structure.txt', content);
  console.log('Project structure saved to project-structure.txt');
}

// Run the function to write the structure to the text file
writeStructureToFile();
