// src/utils/pkce.js (or similar)

// Generates a random string used for the code verifier
function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
  
  // Calculates the SHA256 hash of the code verifier
  async function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
  }
  
  // Base64 URL encodes the ArrayBuffer
  function base64urlencode(a) {
      // Convert the ArrayBuffer to string using Uint8Array to conver to what btoa accepts.
      // btoa accepts chars only within ascii 0-255 and base64 encodes them.
      // Then convert the base64 encoded string to Base64Url encoded string.
      // See https://base64.guru/standards/base64url
      let str = "";
      let bytes = new Uint8Array(a);
      let len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
          str += String.fromCharCode(bytes[i]);
      }
      return btoa(str)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
  }
  
  
  // Main function to generate verifier and challenge
  export async function generatePKCECodes() {
    const verifier = generateRandomString(128); // Generate a random verifier
    const hashed = await sha256(verifier);      // Hash it
    const challenge = base64urlencode(hashed);  // Base64Url encode the hash
    return { verifier, challenge };
  }