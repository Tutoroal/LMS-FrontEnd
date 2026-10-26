import {mkdirSync,copyFileSync,cpSync} from "node:fs";
mkdirSync("public/pdfjs",{recursive:true});copyFileSync("node_modules/pdfjs-dist/build/pdf.worker.min.mjs","public/pdfjs/pdf.worker.mjs");

cpSync("node_modules/pdfjs-dist/standard_fonts","public/pdfjs/standard_fonts",{recursive:true});
