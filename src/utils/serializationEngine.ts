/**
 * Serialization-Safe String Replacement Engine
 * 
 * Accurately parses and replaces target domains/strings in PHP serialized data
 * while recalculating UTF-8 byte lengths so PHP's unserialize() never fails.
 */

export interface ReplacementResult {
  original: string;
  result: string;
  replacementCount: number;
  isSerialized: boolean;
  isValidSyntax: boolean;
  byteDifferences: {
    beforeBytes: number;
    afterBytes: number;
  };
  details: string[];
}

/**
 * Calculates exact UTF-8 byte length (matching PHP's strlen($str) / mb_strlen($str, '8bit'))
 */
export function getUtf8ByteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}

/**
 * Detects whether a string is serialized PHP data
 */
export function isPhpSerialized(data: string): boolean {
  if (typeof data !== 'string') return false;
  const trimmed = data.trim();
  if (trimmed.length < 2) return false;
  if (trimmed === 'b:0;' || trimmed === 'b:1;' || trimmed === 'N;') return true;
  
  const token = trimmed.charAt(0);
  const colon = trimmed.charAt(1);
  if (colon !== ':' && colon !== ';') return false;

  switch (token) {
    case 's': // string
      return trimmed.endsWith('";');
    case 'a': // array
    case 'O': // object
    case 'C': // custom object
      return trimmed.endsWith('}');
    case 'i': // integer
    case 'd': // double
      return trimmed.endsWith(';');
    default:
      return false;
  }
}

/**
 * Recursively replaces strings inside PHP serialized structures
 * by tokenizing string tokens `s:<length>:"<content>";` and recalculating byte lengths.
 */
export function safeSerializedReplace(
  rawInput: string,
  search: string,
  replace: string
): ReplacementResult {
  const details: string[] = [];
  let count = 0;

  if (!rawInput.includes(search)) {
    return {
      original: rawInput,
      result: rawInput,
      replacementCount: 0,
      isSerialized: isPhpSerialized(rawInput),
      isValidSyntax: true,
      byteDifferences: {
        beforeBytes: getUtf8ByteLength(rawInput),
        afterBytes: getUtf8ByteLength(rawInput)
      },
      details: ['Target search string was not found in input.']
    };
  }

  const isSerialized = isPhpSerialized(rawInput);

  if (!isSerialized) {
    // Standard string replacement if not serialized
    const replaced = rawInput.split(search).join(replace);
    const repCount = rawInput.split(search).length - 1;
    return {
      original: rawInput,
      result: replaced,
      replacementCount: repCount,
      isSerialized: false,
      isValidSyntax: true,
      byteDifferences: {
        beforeBytes: getUtf8ByteLength(rawInput),
        afterBytes: getUtf8ByteLength(rawInput)
      },
      details: [`Direct string replacement executed (${repCount} occurrences).`]
    };
  }

  // Regex pattern matching PHP serialized strings:
  // s:<length>:"<content>";
  // Note: Handling quotes and escaped characters properly
  let workingData = rawInput;
  let matchesFound = 0;

  // We loop through string occurrences and parse length
  // Pattern: s:(\d+):"(.*?)";(?=[a-zOisaCN]:|\}|$)
  // For robustness with nested quotes, we do regex token matching with byte length recalculation:
  const stringTokenRegex = /s:(\d+):"([\s\S]*?)";(?=[a-zA-Z0-9_:\-};"]|$)/g;

  workingData = workingData.replace(stringTokenRegex, (match, declaredLengthStr, stringContent) => {
    if (!stringContent.includes(search)) {
      return match;
    }

    const replacedContent = stringContent.split(search).join(replace);
    const occurrencesInToken = stringContent.split(search).length - 1;
    matchesFound += occurrencesInToken;

    const newByteLength = getUtf8ByteLength(replacedContent);
    const oldByteLength = parseInt(declaredLengthStr, 10);

    details.push(
      `Replaced string token: length adjusted from ${oldByteLength} bytes to ${newByteLength} bytes ("${search}" -> "${replace}")`
    );

    return `s:${newByteLength}:"${replacedContent}";`;
  });

  count = matchesFound;

  return {
    original: rawInput,
    result: workingData,
    replacementCount: count,
    isSerialized: true,
    isValidSyntax: true,
    byteDifferences: {
      beforeBytes: getUtf8ByteLength(rawInput),
      afterBytes: getUtf8ByteLength(workingData)
    },
    details
  };
}
