// ✅ postcss.config.mjs
import tailwindcss from "tailwindcss"
import autoprefixer from "autoprefixer"
import postcssImport from "postcss-import"

export default {
  plugins: {
    "postcss-import": postcssImport(),
    "tailwindcss/nesting": {},
    tailwindcss: {},
    autoprefixer: {},
  },
}
