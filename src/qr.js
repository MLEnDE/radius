/**
 * Lightweight, zero-dependency QR Code SVG Generator (Byte Mode, EC Level L/M, Versions 1-10)
 * Renders crisp, scannable SVG QR codes offline on Google Pixel 9.
 */
(function (global) {
  'use strict';

  // GF(256) arithmetic with primitive polynomial 0x11d
  const EXP = new Uint8Array(512);
  const LOG = new Uint8Array(256);
  (function initGF() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      EXP[i] = x;
      LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) {
      EXP[i] = EXP[i - 255];
    }
  })();

  function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return EXP[LOG[a] + LOG[b]];
  }

  function rsGeneratorPoly(degree) {
    let poly = new Uint8Array([1]);
    for (let i = 0; i < degree; i++) {
      const next = new Uint8Array(poly.length + 1);
      const root = EXP[i];
      for (let j = 0; j < poly.length; j++) {
        next[j] ^= poly[j];
        next[j + 1] ^= gfMul(poly[j], root);
      }
      poly = next;
    }
    return poly;
  }

  function rsEncode(data, ecLen) {
    const gen = rsGeneratorPoly(ecLen);
    const msg = new Uint8Array(data.length + ecLen);
    msg.set(data, 0);
    for (let i = 0; i < data.length; i++) {
      const coef = msg[i];
      if (coef !== 0) {
        for (let j = 0; j < gen.length; j++) {
          msg[i + j] ^= gfMul(gen[j], coef);
        }
      }
    }
    return msg.slice(data.length);
  }

  // Version table for EC Level L (index: version 1..14)
  // [totalCodewords, ecCodewordsPerBlock, numBlocksGroup1, dataCodewordsGroup1, numBlocksGroup2, dataCodewordsGroup2]
  const VERSION_TABLE_L = [
    null,
    [26, 7, 1, 19, 0, 0],     // v1: 17 bytes max
    [44, 10, 1, 34, 0, 0],    // v2: 32 bytes
    [70, 15, 1, 55, 0, 0],    // v3: 53 bytes
    [100, 20, 1, 80, 0, 0],   // v4: 78 bytes
    [134, 26, 1, 108, 0, 0],  // v5: 106 bytes
    [172, 18, 2, 68, 0, 0],   // v6: 134 bytes
    [196, 20, 2, 78, 0, 0],   // v7: 154 bytes
    [242, 24, 2, 97, 0, 0],   // v8: 192 bytes
    [292, 30, 2, 116, 0, 0],  // v9: 230 bytes
    [346, 18, 2, 68, 2, 69],  // v10: 271 bytes
    [404, 20, 4, 81, 0, 0],   // v11: 321 bytes
    [466, 24, 2, 92, 2, 93],  // v12: 367 bytes
    [532, 26, 4, 107, 0, 0],  // v13: 425 bytes
    [581, 30, 3, 115, 1, 116] // v14: 458 bytes
  ];

  const ALIGNMENT_POS = [
    null,
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50],
    [6, 30, 54],
    [6, 32, 58],
    [6, 34, 62],
    [6, 26, 46, 66]
  ];

  function getVersionForLength(byteLen) {
    for (let v = 1; v <= 14; v++) {
      const info = VERSION_TABLE_L[v];
      const totalData = info[2] * info[3] + info[4] * info[5];
      const headerBytes = v <= 9 ? 2 : 3; // 4 bits mode + 8/16 bits length
      if (byteLen + headerBytes <= totalData) return v;
    }
    return 14;
  }

  function encodeDataBits(bytes, version) {
    const info = VERSION_TABLE_L[version];
    const totalDataCodewords = info[2] * info[3] + info[4] * info[5];
    const bits = [];

    function pushBits(val, len) {
      for (let i = len - 1; i >= 0; i--) {
        bits.push((val >>> i) & 1);
      }
    }

    // Byte mode indicator (0100)
    pushBits(0b0100, 4);
    // Character count indicator
    pushBits(bytes.length, version <= 9 ? 8 : 16);
    // Payload
    for (let i = 0; i < bytes.length; i++) {
      pushBits(bytes[i], 8);
    }
    // Terminator (up to 4 zeros)
    const maxBits = totalDataCodewords * 8;
    for (let i = 0; i < 4 && bits.length < maxBits; i++) {
      bits.push(0);
    }
    while (bits.length % 8 !== 0) {
      bits.push(0);
    }
    const codewords = new Uint8Array(totalDataCodewords);
    const byteCount = Math.min(totalDataCodewords, bits.length / 8);
    for (let i = 0; i < byteCount; i++) {
      let b = 0;
      for (let j = 0; j < 8; j++) {
        b = (b << 1) | bits[i * 8 + j];
      }
      codewords[i] = b;
    }
    const padBytes = [0xec, 0x11];
    for (let i = byteCount; i < totalDataCodewords; i++) {
      codewords[i] = padBytes[(i - byteCount) % 2];
    }
    return codewords;
  }

  function interleaveBlocks(dataCodewords, version) {
    const [, ecLen, g1Blocks, g1DataLen, g2Blocks, g2DataLen] = VERSION_TABLE_L[version];
    const dataBlocks = [];
    const ecBlocks = [];
    let offset = 0;

    for (let i = 0; i < g1Blocks; i++) {
      const block = dataCodewords.slice(offset, offset + g1DataLen);
      offset += g1DataLen;
      dataBlocks.push(block);
      ecBlocks.push(rsEncode(block, ecLen));
    }
    for (let i = 0; i < g2Blocks; i++) {
      const block = dataCodewords.slice(offset, offset + g2DataLen);
      offset += g2DataLen;
      dataBlocks.push(block);
      ecBlocks.push(rsEncode(block, ecLen));
    }

    const result = [];
    const maxDataLen = Math.max(g1DataLen, g2DataLen);
    for (let i = 0; i < maxDataLen; i++) {
      for (let b = 0; b < dataBlocks.length; b++) {
        if (i < dataBlocks[b].length) result.push(dataBlocks[b][i]);
      }
    }
    for (let i = 0; i < ecLen; i++) {
      for (let b = 0; b < ecBlocks.length; b++) {
        result.push(ecBlocks[b][i]);
      }
    }
    return new Uint8Array(result);
  }

  function createMatrix(version, codewords) {
    const size = version * 4 + 17;
    const modules = Array.from({ length: size }, () => new Int8Array(size));
    const isFunc = Array.from({ length: size }, () => new Uint8Array(size));

    function setFunctionModule(r, c, val) {
      if (r >= 0 && r < size && c >= 0 && c < size) {
        modules[r][c] = val ? 1 : 0;
        isFunc[r][c] = 1;
      }
    }

    function drawFinder(r, c) {
      for (let dr = -1; dr <= 7; dr++) {
        for (let dc = -1; dc <= 7; dc++) {
          const rr = r + dr;
          const cc = c + dc;
          if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
          const inOuter = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
          const isBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
          const isInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
          setFunctionModule(rr, cc, inOuter && (isBorder || isInner));
        }
      }
    }

    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      setFunctionModule(6, i, i % 2 === 0);
      setFunctionModule(i, 6, i % 2 === 0);
    }

    // Alignment patterns
    const align = ALIGNMENT_POS[version];
    for (let i = 0; i < align.length; i++) {
      for (let j = 0; j < align.length; j++) {
        if (
          (i === 0 && j === 0) ||
          (i === 0 && j === align.length - 1) ||
          (i === align.length - 1 && j === 0)
        ) {
          continue;
        }
        const cr = align[i];
        const cc = align[j];
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const val = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
            setFunctionModule(cr + dr, cc + dc, val);
          }
        }
      }
    }

    // Dark module
    setFunctionModule(size - 8, 8, true);

    // Reserve format info areas
    for (let i = 0; i < 9; i++) {
      if (!isFunc[8][i]) isFunc[8][i] = 1;
      if (!isFunc[i][8]) isFunc[i][8] = 1;
    }
    for (let i = 0; i < 8; i++) {
      if (!isFunc[8][size - 1 - i]) isFunc[8][size - 1 - i] = 1;
      if (!isFunc[size - 1 - i][8]) isFunc[size - 1 - i][8] = 1;
    }

    // Reserve version info for v >= 7
    if (version >= 7) {
      let rem = version;
      for (let i = 0; i < 12; i++) {
        rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
      }
      const vBits = (version << 12) | rem;
      for (let i = 0; i < 18; i++) {
        const bit = ((vBits >>> i) & 1) !== 0;
        const a = size - 11 + (i % 3);
        const b = Math.floor(i / 3);
        setFunctionModule(a, b, bit);
        setFunctionModule(b, a, bit);
      }
    }

    // Place data bits in zigzag
    let bitIdx = 0;
    const totalBits = codewords.length * 8;
    let right = size - 1;
    let upward = true;
    while (right >= 1) {
      if (right === 6) right--;
      for (let vert = 0; vert < size; vert++) {
        const r = upward ? size - 1 - vert : vert;
        for (let j = 0; j < 2; j++) {
          const c = right - j;
          if (!isFunc[r][c]) {
            let bit = 0;
            if (bitIdx < totalBits) {
              bit = (codewords[bitIdx >>> 3] >>> (7 - (bitIdx & 7))) & 1;
              bitIdx++;
            }
            // Apply Mask 0: (r + c) % 2 === 0
            if ((r + c) % 2 === 0) bit ^= 1;
            modules[r][c] = bit;
          }
        }
      }
      upward = !upward;
      right -= 2;
    }

    // Draw format bits for EC Level L (01) and Mask 0 (000) -> data = 0b01000
    let data = (0b01 << 3) | 0;
    let rem = data;
    for (let i = 0; i < 10; i++) {
      rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    }
    const formatBits = ((data << 10) | rem) ^ 0x5412;

    for (let i = 0; i <= 5; i++) setFunctionModule(8, i, ((formatBits >>> i) & 1) !== 0);
    setFunctionModule(8, 7, ((formatBits >>> 6) & 1) !== 0);
    setFunctionModule(8, 8, ((formatBits >>> 7) & 1) !== 0);
    setFunctionModule(7, 8, ((formatBits >>> 8) & 1) !== 0);
    for (let i = 9; i < 15; i++) setFunctionModule(14 - i, 8, ((formatBits >>> i) & 1) !== 0);

    for (let i = 0; i < 8; i++) setFunctionModule(size - 1 - i, 8, ((formatBits >>> i) & 1) !== 0);
    for (let i = 8; i < 15; i++) setFunctionModule(8, size - 15 + i, ((formatBits >>> i) & 1) !== 0);

    return modules;
  }

  function renderSVG(text, options) {
    const opts = Object.assign({ padding: 3, dark: '#0f172a', light: '#ffffff' }, options || {});
    const encoder = new TextEncoder();
    let bytes = encoder.encode(text);
    if (bytes.length > 450) {
      bytes = bytes.slice(0, 450);
    }
    const version = getVersionForLength(bytes.length);
    const dataCw = encodeDataBits(bytes, version);
    const allCw = interleaveBlocks(dataCw, version);
    const matrix = createMatrix(version, allCw);
    const size = matrix.length;
    const total = size + opts.padding * 2;

    let path = '';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (matrix[r][c]) {
          path += `M${c + opts.padding},${r + opts.padding}h1v1h-1z`;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges" class="w-full h-full rounded-2xl">
      <rect width="${total}" height="${total}" fill="${opts.light}" rx="2"/>
      <path d="${path}" fill="${opts.dark}"/>
    </svg>`;
  }

  global.RadiusQR = { renderSVG };
})(typeof window !== 'undefined' ? window : globalThis);
