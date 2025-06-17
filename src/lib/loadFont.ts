// lib/loadFont.ts
export async function loadFontAsBase64(path: string): Promise<string> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to fetch font (${res.status}): ${path}`);
  }
  // Blob API를 이용해 TTF 파일을 감싸고
  const blob = await res.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    // onloadend → reader.result 가 반드시 string이 됨
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        return reject(new Error('Expected data URL string'));
      }
      const commaIndex = result.indexOf(',');
      if (commaIndex < 0) {
        return reject(new Error('Invalid data URL'));
      }
      // “data:font/ttf;base64,AAA…” → 쉼표 뒤의 Base64 페이로드만 취함
      resolve(result.slice(commaIndex + 1));
    };
    reader.readAsDataURL(blob);
  });
}
