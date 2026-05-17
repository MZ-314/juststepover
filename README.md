# ✍️ How to Write & Publish an Article on JustStepover

Welcome! You don't need to know anything about code to publish articles.  
There's **one file** you'll ever need to touch: **`articles.json`**

---

## 📋 Quick Steps

1. Open **`articles.json`** in GitHub (just click the file, then the ✏️ pencil icon to edit)
2. Copy an existing article block and paste it at the **top** of the list
3. Fill in your article details
4. Click **"Commit changes"** — your article is live within ~2 minutes

That's it.

---

## 📝 Writing Your Article

Open `articles.json`. You'll see a list that starts with `[` and ends with `]`.  
Each article looks like this:

```json
{
  "id": "5",
  "slug": "my-article-title-here",
  "title": "The Full Title of My Article",
  "subtitle": "A one-line summary or teaser that goes under the title",
  "author": "JustStepover",
  "date": "2025-05-18",
  "category": "Premier League",
  "featured": true,
  "imageUrl": "https://images.unsplash.com/photo-XXXXXXX?w=1200&q=80",
  "imageCaption": "A short description of the photo",
  "content": [
    {
      "type": "paragraph",
      "text": "This is the first paragraph of my article. Write as much as you like here."
    },
    {
      "type": "paragraph",
      "text": "This is a second paragraph. Each paragraph is a separate block."
    },
    {
      "type": "subheading",
      "text": "This Is a Section Heading"
    },
    {
      "type": "paragraph",
      "text": "More writing under the heading."
    },
    {
      "type": "quote",
      "text": "A great quote goes here — something punchy and memorable.",
      "attribution": "Where the quote came from, or leave this line out"
    }
  ]
}
```

---

## 🔧 Field Guide

| Field | What it does | Example |
|---|---|---|
| `id` | A unique number. Just go one higher than the last one. | `"5"` |
| `slug` | The URL for your article. Use hyphens, no spaces, no capitals. | `"my-article-title"` |
| `title` | The headline of your article | `"Why Rashford Is Back"` |
| `subtitle` | One sentence teaser under the title | `"A case for patience…"` |
| `author` | Your byline | `"JustStepover"` |
| `date` | Today's date in YYYY-MM-DD format | `"2025-05-18"` |
| `category` | Topic tag | `"Premier League"` |
| `featured` | Show in the hero section? | `true` or `false` |
| `imageUrl` | A link to a photo (see below for free photos) | `"https://…"` |
| `imageCaption` | Caption shown under the image | `"Old Trafford, May 2025"` |

### Categories you can use:
- `"Premier League"`
- `"Champions League"`
- `"Culture"`
- `"Opinion"`
- `"Transfers"`

---

## 🖼️ Getting Free Photos

Use **Unsplash** for free, high-quality football photos:

1. Go to [unsplash.com](https://unsplash.com)
2. Search for "football", "soccer stadium", "Premier League", etc.
3. Click a photo, then right-click → **"Copy image address"**
4. Paste that URL into the `imageUrl` field
5. Add `?w=1200&q=80` to the end of the URL for best quality

Example: `"https://images.unsplash.com/photo-1431324155629?w=1200&q=80"`

---

## 📦 Content Block Types

Your article `content` is a list of blocks. Each block has a `type`:

### Paragraph
```json
{
  "type": "paragraph",
  "text": "Write your paragraph here. Can be as long as you like."
}
```

### Subheading (section title)
```json
{
  "type": "subheading",
  "text": "The Tactical Shift"
}
```

### Pull Quote (big styled quote)
```json
{
  "type": "quote",
  "text": "Football is nothing without fans.",
  "attribution": "Bill Shankly"
}
```
*(You can leave out `"attribution"` if it's your own words)*

---

## ⚠️ Common Mistakes to Avoid

- **Commas matter.** Every article in the list must be separated by a comma — except the very last one.
- **Don't change `"id"` values** that already exist — just add a new, higher number.
- **Slugs must be unique.** Don't use the same slug as an existing article.
- **Quotes inside text:** If you want to use `"` inside a text field, write `\"` instead. Or just use single quotes `'` — those are fine.

---

## ✅ Before You Commit

GitHub has a built-in validator. After editing, look for any red highlighting — that means there's a typo in the structure. The most common issue is a missing `,` between two article blocks.

If you're unsure, paste the contents of `articles.json` into [jsonlint.com](https://jsonlint.com) — it'll tell you exactly what's wrong.

---

## 🚀 Publishing

Once you click **"Commit changes"** on GitHub, Vercel picks up the change automatically. Your article will be live at `juststepover.com/article.html?slug=your-article-slug` within 1–2 minutes.

---

*Questions? Ask your mate who set this up for you.* ⚽