import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
// @ts-ignore
import { resolve } from 'path';

// @ts-ignore
const alias = Object.entries({
    "@/*": ["./src/libs/*"],
    "~/*": ["./src/*"],
})
    .reduce((acc,[key, [value]]) => {
        const aliasKey = key.substring(0, key.length - 2)
        const path = value.substring(0, value.length - 2)
        return {
            ...acc,
            // @ts-ignore
            [aliasKey]: resolve(__dirname, path)
        }
    }, {})

export default defineConfig({
    plugins: [reactRefresh()],
    resolve: {
        alias
    }
})