"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
// Function to get the folder and file structure for a given directory
function getFolderStructure(dirPath) {
    var results = [];
    var list = (0, fs_1.readdirSync)(dirPath);
    list.forEach(function (file) {
        file = (0, path_1.join)(dirPath, file);
        var stat = (0, fs_1.statSync)(file);
        if (stat && stat.isDirectory()) {
            results.push({ type: 'folder', name: file });
            results = results.concat(getFolderStructure(file)); // Recurse into the folder
        }
        else {
            results.push({ type: 'file', name: file });
        }
    });
    return results;
}
// Function to write the folder structure to a text file
function writeStructureToFile() {
    var content = '';
    // Specify the directories relative to the project root
    var directories = [(0, path_1.join)(__dirname, '..', 'server'), (0, path_1.join)(__dirname, '..', 'client')];
    directories.forEach(function (dirPath) {
        if ((0, fs_1.statSync)(dirPath).isDirectory()) {
            var folderName = (0, path_1.relative)(__dirname, dirPath);
            content += "\n[Start of ".concat(folderName, " Folder]\n");
            var structure = getFolderStructure(dirPath);
            structure.forEach(function (item) {
                var relativePath = (0, path_1.relative)(__dirname, item.name);
                var type = item.type === 'folder' ? '[Folder]' : '[File]';
                content += "".concat(type, " ").concat(relativePath, "\n");
            });
            content += "[End of ".concat(folderName, " Folder]\n");
        }
        else {
            console.log("The directory ".concat(dirPath, " does not exist."));
        }
    });
    (0, fs_1.writeFileSync)('project-structure.txt', content);
    console.log('Project structure saved to project-structure.txt');
}
// Run the function to write the structure to the text file
writeStructureToFile();
