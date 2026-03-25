"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimFileName = trimFileName;
function trimFileName(filePath) {
    const filePathArr = filePath.split('/');
    const fileName = filePathArr[filePathArr.length - 1];
    return fileName;
}
//# sourceMappingURL=trim_file_name.js.map