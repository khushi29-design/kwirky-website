# Kwirky website

Next.js 15, TypeScript, Three.js and GSAP.

## Run it
    npm run dev        # http://localhost:3000 (installs packages automatically on first run)
    npm run build && npm start   # production

### In VS Code
Open this folder (or its parent `kwirky-website`). The "Kwirky: dev server" task starts automatically.
The first time, VS Code asks whether to allow automatic tasks: choose **Allow**. If you missed it, run
*Tasks: Manage Automatic Tasks* from the Command Palette (Ctrl+Shift+P) and pick **Allow Automatic Tasks**.
You can also press **F5** to start the server and open the site in your browser.

## Replace placeholders
| What | Where |
| --- | --- |
| Contact, social links, form endpoints | `src/content/site.ts` |
| Products, flavours, ingredients, prices | `src/content/products.ts` (`confirmed: true` removes the sample sticker) |
| Quiz result to product matches | `productSlug` in `src/content/quiz.ts` |
| FAQ answers | `src/content/faq.ts` |
| Real reviews and team | `src/content/people.ts` |
| Brand story | `src/app/about/page.tsx`, story section in `src/app/page.tsx` |
| Logo | `Wordmark` in `src/components/Bits.tsx` (text stand-in) |
| Can artwork | `labelTexture` in `src/lib/three/can.ts`, stills in `public/cans/` |
| Legal text (drafts, need review) | `src/app/privacy`, `src/app/terms` |

## Connect services
- Forms: set `NEXT_PUBLIC_CONTACT_ENDPOINT` and `NEXT_PUBLIC_NEWSLETTER_ENDPOINT`. Without them, forms open the visitor's email app.
- Payments: implement `CheckoutProvider` in `src/lib/commerce/provider.ts`. Until then, checkout sends a WhatsApp enquiry and takes no money.
- Accounts: the `Customer` type is reserved in `src/lib/commerce/types.ts`; no login exists yet.

## Tests
With the site running on port 3000 and Playwright available:

    NODE_PATH="$(npm root -g)" npm run qa

## GitHub Pages
1. Create an empty repository on GitHub (no README), e.g. `kwirky-website`.
2. From this folder:

       git remote add origin https://github.com/<user>/<repo>.git
       git push -u origin main

3. In the repository go to **Settings > Pages** and set **Source** to **GitHub Actions** (one time).

Every push to `main` then runs `.github/workflows/pages.yml`, which builds a static export and publishes it at
`https://<user>.github.io/<repo>/`. The repository name is picked up automatically, so links and images work under that path.
The cart, checkout and forms still work there because they run in the browser.
