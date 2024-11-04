// tests/setup.ts
import { TextEncoder, TextDecoder } from 'util';

if (typeof (global as any).TextEncoder === 'undefined') {
    (global as any).TextEncoder = TextEncoder;
    (global as any).TextDecoder = TextDecoder;
}

