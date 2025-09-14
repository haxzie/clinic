interface URLPart {
    className: string;
    value: string;
    position: [number, number];
  }
  
  /**
   * Parse a URL into its constituent parts with position information
   * @param url - The URL string to parse
   * @returns Array of URL parts with their positions
   */
  const urlParts = (url: string): URLPart[] => {
    // Define regex patterns and their configurations in a single structure
    const regexConfigs = [
      { regex: /^(https?:\/\/)/, className: "protocol", group: 1 },
      { regex: /^https?:\/\/(?:[^@/]+@)?([^/:#?]+)/, className: "domain", group: 1 },
      { regex: /:(\d+)(?=\/|$|[?#])/, className: "port", group: 1 }, // Fixed: group should be 1, not 0
      { regex: /^https?:\/\/(?:[^@/]+@)?[^/:#?]+(?::\d+)?(\/[^?#]+?)(?=[?#]|$)/, className: "path", group: 1 },
      { regex: /(\?[^#]+)(?=#|$)/, className: "query", group: 1 },
      { regex: /(#.*)$/, className: "hash", group: 1 }
    ];
    
    // File pattern used for path processing
    const filePattern = /\/([^/]+\.[^./?#]+)(?=[?#]|$)/;
  
    const highlightedURLParts: URLPart[] = [];
  
    // Extract each part
    for (const config of regexConfigs) {
      const match = url.match(config.regex);
      
      if (!match || !match[config.group]) continue;
      
      const value = match[config.group];
      // Find the actual position in URL, accounting for possible duplicate strings
      let position;
      
      // For domain, we need to find it after the protocol
      if (config.className === "domain") {
        const protocolMatch = url.match(/^(https?:\/\/)/);
        if (protocolMatch) {
          position = url.indexOf(value, protocolMatch[0].length);
        } else {
          position = url.indexOf(value);
        }
      } else {
        position = url.indexOf(value);
      }
      
      if (position === -1) continue;
  
      // Special handling for path with filename
      if (config.className === "path") {
        const fileMatch = value.match(filePattern);
        
        if (fileMatch && fileMatch[1]) {
          const fileName = fileMatch[1];
          const fileNamePosition = value.lastIndexOf(fileName); // Fixed: use lastIndexOf
          
          // Add path portion
          highlightedURLParts.push({
            className: "path",
            value: value.substring(0, fileNamePosition),
            position: [position, position + fileNamePosition]
          });
          
          // Add file portion
          highlightedURLParts.push({
            className: "file",
            value: fileName,
            position: [
              position + fileNamePosition,
              position + fileNamePosition + fileName.length
            ]
          });
          
          continue;
        }
      }
      
      // Add regular part
      highlightedURLParts.push({
        className: config.className,
        value,
        position: [position, position + value.length]
      });
    }
  
    // Sort parts by their position to ensure correct order
    return highlightedURLParts.sort((a, b) => a.position[0] - b.position[0]);
  };
  
  export default urlParts;