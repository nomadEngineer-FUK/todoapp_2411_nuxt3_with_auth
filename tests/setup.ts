import { setup } from '@nuxt/test-utils';
import { TextEncoder, TextDecoder } from 'util';

// Nuxtのテスト環境を設定
setup({
    server: false, // サーバーを起動せずテストを実行
});

// TextEncoderとTextDecoderの設定
if (typeof (global as any).TextEncoder === 'undefined') {
    (global as any).TextEncoder = TextEncoder;
    (global as any).TextDecoder = TextDecoder;
}
