import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

// Match <svg ...> ... </svg>
const svgRegex = /(<svg\b[^>]*>[\s\S]*?<\/svg>)/gi;
let match;
let count = 0;
let hasError = false;

while ((match = svgRegex.exec(html)) !== null) {
  count++;
  const svg = match[1];
  
  // Basic tag counting in SVG
  const tagRegex = /<\/?([a-zA-Z0-9:-]+)/g;
  let tagMatch;
  const stack = [];
  
  while ((tagMatch = tagRegex.exec(svg)) !== null) {
    const tagName = tagMatch[1].toLowerCase();
    const isClosing = tagMatch[0].startsWith('</');
    const isSelfClosing = svg[tagMatch.index + tagMatch[0].length] === '/' || 
                        tagName === 'path' || tagName === 'circle' || tagName === 'line' || 
                        tagName === 'rect' || tagName === 'polygon' || tagName === 'polyline' || 
                        tagName === 'ellipse'; // most SVGs have self-closing elements or elements closed inline

    if (isClosing) {
      if (stack.length > 0) {
        const top = stack.pop();
        if (top !== tagName) {
          console.error(`SVG block ${count}: Mismatched tag </${tagName}>, expected </${top}>`);
          hasError = true;
        }
      } else {
        console.error(`SVG block ${count}: Unexpected closing tag </${tagName}>`);
        hasError = true;
      }
    } else if (!isSelfClosing && !svg.substring(tagMatch.index, svg.indexOf('>', tagMatch.index)).endsWith('/')) {
      stack.push(tagName);
    }
  }
}

if (!hasError) {
  console.log("All SVG icon blocks are structurally valid!");
}
