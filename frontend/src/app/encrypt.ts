export async function encrypt(data: string, password: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const passwordBuffer = encoder.encode(password);

    const hashed = await crypto.subtle.digest('SHA-256', passwordBuffer);
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        await crypto.subtle.importKey('raw', hashed, { name: 'AES-GCM' }, false, ['encrypt']),
        dataBuffer
    );

    const ivBase64 = btoa(String.fromCharCode(...iv));
    const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));

    return `${ivBase64}:${encryptedBase64}`;
}

export async function decrypt(encryptedData: string, password: string): Promise<string> {
    const decoder = new TextDecoder();

    const [ivBase64, encryptedBase64] = encryptedData.split(':');
    const iv = new Uint8Array(atob(ivBase64).split('').map(c => c.charCodeAt(0)));
    const encryptedBuffer = new Uint8Array(atob(encryptedBase64).split('').map(c => c.charCodeAt(0)));

    const passwordBuffer = new TextEncoder().encode(password);
    const hashed = await crypto.subtle.digest('SHA-256', passwordBuffer);

    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        await crypto.subtle.importKey('raw', hashed, { name: 'AES-GCM' }, false, ['decrypt']),
        encryptedBuffer
    );

    return decoder.decode(decryptedBuffer);
}