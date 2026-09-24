<!-- source: fixit-docs/content/en/documentation/content-management/shortcodes/extended/introduction/index.md -->
<!-- source: FixIt/layouts/_shortcodes/ -->

# Extended Shortcodes Reference

FixIt provides 29 shortcodes on top of Hugo's built-in ones. Use code fence extended syntax (`` ```mermaid ``, `` ```echarts ``, etc.) where available -- it is preferred over the shortcode form.

Override any embedded shortcode by placing a file with the same name in `layouts/_shortcodes/`.

Delimiters: use `{{% %}}` for shortcodes that process Markdown content (`tab`, `fixit-encryptor`); use `{{< >}}` for all others.

---

## Utility Shortcodes

### script

Insert inline JavaScript that executes after all third-party libraries load.

```markdown
{{< script >}}
console.log('Hello FixIt!');
{{< /script >}}
```

### style

Insert inline CSS/SCSS. Requires Hugo **extended** version. First param: CSS rules (supports SASS nesting with `&`). Second param: wrapper tag (default `div`).

```markdown
{{< style "text-align:right; strong{color:#00b1ff;}" >}}
This is a **right-aligned** paragraph.
{{< /style >}}
```

### auto-dark

Wrap content to auto-invert colors for dark mode.

```markdown
{{< auto-dark >}}
<img src="/images/logo.svg" alt="logo" />
{{< /auto-dark >}}
```

### raw

Prevent Markdown/HTML rendering of content. First param: wrapper tag (default `div`). Named form: `tag`.

```markdown
Raw content: {{< raw "span" >}}**Hello** <strong>FixIt</strong>{{< /raw >}}
```

### env

Conditionally render content based on Hugo environment.

```markdown
{{< env "production" >}}
This only renders in production.
{{< /env >}}
```

### version

Display a version badge. Params: version (required), type (`new`/`changed`/`deleted`/`deprecated`, default `new`), URL prefix, project name.

```markdown
{{< version 1.0.0 >}}
{{< version 0.3.15 changed >}}
```

---

## Layout Shortcodes

### link

Enhanced link with card mode and download support.

- Named: `href`, `content`, `title`, `class`, `rel`, `download`, `card`, `card-icon`, `external-icon`, `noreferrer`, `isGuarded`
- Positional: href, content, title, card, card-icon

```markdown
{{< link "https://github.com/hugo-fixit/FixIt" "FixIt Theme" "visit" true >}}
{{< link href="/file.pdf" content="Download" download="file.pdf" >}}
{{< link href="https://example.com" content="Site" class="btn" rel="author" external-icon=false isGuarded=true >}}
```

### image

Image shortcode with lightgallery support.

- Positional: src, alt, caption
- Named: `src`, `alt`, `caption`, `title`, `height`, `width`, `linked` (default `true`), `rel`, `class`, `loading` (lazy/eager), `optimise`, `cacheRemote`

```markdown
{{< image src="/images/photo.jpg" caption="A photo" loading="lazy" >}}
```

### details

Collapsible HTML `<details>` element.

- Positional: summary, open, class
- Named: `summary` (default `Details`), `open`, `class`, `name` (exclusive accordion group), `title`

```markdown
{{< details "Click to expand" true >}}
Hidden content here.
{{< /details >}}

{{< details summary="Grouped" name="my-details" >}}
Only one open at a time within the same `name`.
{{< /details >}}
```

### center-quote

Centered blockquote. Also available via admonition `> [!center]` or markdown attribute `{.blockquote-center}`.

```markdown
{{< center-quote >}}
Centered text.
{{< /center-quote >}}
```

### reward

Donation QR codes. Positional: wechatpay, alipay, paypal, bitcoin, author, comment, mode.

```markdown
{{< reward wechatpay="/images/wechat.png" alipay="/images/alipay.png" comment="Buy me a coffee" >}}
```

---

## Content Shortcodes

### admonition

Callout box with 13 types. Positional: type, title, open.

```markdown
{{< admonition tip "Pro Tip" true >}}
Useful information here.
{{< /admonition >}}
```

**Supported types:** note, abstract (aliases: summary, tldr), info, todo, tip (aliases: hint, important), success (aliases: check, done), question (aliases: help, faq), warning (aliases: caution, attention), failure (aliases: fail, missing), danger (alias: error), bug, example, quote (alias: cite).

Preferred: use blockquote alert syntax for cross-platform compatibility:

```markdown
> [!TIP]+ Foldable title
> Content here.
```

### tabs / tab

Tabbed content container.

- `tabs` params: `type` (underline/pill/card/segment), `placement` (`top`/`bottom`/`start`/`end`; `left`/`right` deprecated), `defaultTab` (0-based index)
- `tab` params: `title` (must use `{{% %}}` so the body is processed as Markdown)

```markdown
{{< tabs type="card" >}}
{{% tab title="HTML" %}}<div>Hello</div>{{% /tab %}}
{{% tab title="JS" %}}console.log('hi'){{% /tab %}}
{{< /tabs >}}
```

Tabbed code blocks via code fences:

````markdown
```python {group="languages", name="Python"}
print('Hello')
```
```js {group="languages", name="JS", .active}
console.log('Hello');
```
````

### typeit

Typing animation. Params: `tag`, `code` (language for syntax highlighting), `code-link` (parse Markdown links in code), `class`, `group` (sequential animation; forces `loop` false), `loop`, `speed`, `cursorSpeed`, `cursorChar`, `duration`.

```markdown
{{< typeit tag=h4 >}}
Typing animation text...
{{< /typeit >}}
```

Code with syntax highlighting:

```markdown
{{< typeit code=java >}}
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
{{< /typeit >}}
```

Grouped (sequential):

```markdown
{{< typeit group=grp >}}First paragraph{{< /typeit >}}
{{< typeit group=grp >}}Second paragraph (after first finishes){{< /typeit >}}
```

### timeline

Chronological events. Data in YAML/JSON/TOML. Params: `reverse`, `animation`, `placement` (top/bottom), `size`, `node` (circle/dot), `width`, `height`, `class`, `data`, `file`.

```markdown
{{< timeline animation=true >}}
events:
  - timestamp: 2024-01-01
    content: "Project started"
    type: primary
  - timestamp: 2024-06-01
    content: "Version 1.0 released"
    type: success
{{< /timeline >}}
```

Also available via code fence: `` ```timeline ``.

### file-tree

Interactive directory tree. Data sources (priority): inline body, `file` param, `data` param, filesystem `path`. Params: `path`, `level` (expand depth, -1=all, 0=collapse), `name` (root node label; `{path}` uses full root path), `folder_slash`, `ignore_list`, `highlight_list`, `file`, `data`.

```markdown
{{< file-tree path="src" level=2 name="my-project" >}}
```

Inline YAML:

```markdown
{{< file-tree >}}
- name: src
  type: dir
  children:
    - name: index.ts
      type: file
- name: package.json
  type: file
{{< /file-tree >}}
```

Also available via code fence: `` ```file-tree ``.

---

## Media Shortcodes

### mermaid

Diagram rendering. Preferred: `` ```mermaid `` code fence.

```markdown
{{< mermaid >}}
graph LR
    A[Start] --> B[End]
{{< /mermaid >}}
```

Supports: flowchart, sequence, class, state, ER, journey, gantt, pie, requirement, git graph.

### echarts

Interactive charts. Data in JSON/YAML/TOML/JS. Params: `width`, `height`, `js` (use JS format), `async`, `file`, `data`.

```markdown
{{< echarts >}}
{
  "xAxis": { "type": "category", "data": ["A","B","C"] },
  "yAxis": { "type": "value" },
  "series": [{ "type": "bar", "data": [10, 20, 30] }]
}
{{< /echarts >}}
```

JS mode (`js=true`): content is a function body returning the option object. Preferred: `` ```echarts `` code fence.

### mapbox

Interactive map.

- Positional: lng, lat, zoom, marked, light-style, dark-style, markers
- Named: `lng`, `lat`, `zoom`, `marked`, `light-style`, `dark-style`, `markers`, `navigation`, `geolocate`, `scale`, `fullscreen`, `width` (default `100%`), `height` (default `20rem`)

```markdown
{{< mapbox 121.473701 31.230416 11 >}}
{{< mapbox lng=121.473701 lat=31.230416 zoom=11 geolocate=true fullscreen=true width="100%" height="20rem" >}}
```

### music

Music player (APlayer + MetingJS). Three modes:

1. Custom URL: `url`, `name`, `artist`, `cover` (+ `fixed`, `mini`, `autoplay`, `volume`, `mutex`)
2. Auto-detect platform URL: `auto` (or positional URL)
3. Server mode: `server`, **`type` (required)**, `id` (or positional `server type id`)

```markdown
{{< music url="/music/song.mp3" name="Song" artist="Artist" cover="/images/cover.jpg" >}}
{{< music "https://music.163.com/#/playlist?id=60198" >}}
{{< music server="netease" type="song" id="1868553" >}}
```

### aplayer / audio

Advanced APlayer controls with custom playlist and mini mode. Both support **named params only**. `audio` must be nested inside `aplayer`.

```markdown
{{< aplayer mini=true >}}
{{< audio name="Song" artist="Artist" url="/music/song.mp3" cover="/images/cover.jpg" >}}
{{< /aplayer >}}
```

`aplayer` params: `fixed`, `mini`, `autoplay`, `theme`, `loop`, `order`, `preload`, `volume`, `mutex`, `lrcType`, `listFolded`, `listMaxHeight`, `storageName`.
`audio` params: `name`, `artist`, `url`, `cover`, `lrc` (or LRC body; then set `lrcType=1`).

### spotify

Spotify embed. Requires `type` + `id` (named or positional).

```markdown
{{< spotify type=artist id=74ASZWbe4lXaubB36ztrGX >}}
{{< spotify artist 74ASZWbe4lXaubB36ztrGX >}}
{{< spotify type=track id=xxx width="100%" height="380" >}}
```

- `type` (required): `artist`, `album`, `track`, or `playlist`
- `id` (required): Spotify ID from the URL
- `width` (optional, default `100%`), `height` (optional, default `380`)

### bilibili / douyin

Video embeds. `bilibili`: `id`/positional BV id, plus `p`, `autoplay`, `poster`, `muted`, `danmaku`, `t`. `douyin`: `id`/positional video id (required).

```markdown
{{< bilibili BV1xx411c7mD >}}
{{< douyin id="xxx" >}}
```

### bluesky

Bluesky post embed. **Named param `link` only** (no positional form).

```markdown
{{< bluesky link="https://bsky.app/profile/bsky.app/post/3latotljnec2h" >}}
```

### gist

GitHub Gist embed. Positional: username, gist-id, filename (optional).

```markdown
{{< gist Lruihao fb8b2d0353465c4d40bf74818db80710 >}}
```

---

## Encryption Shortcodes

### fixit-encryptor

Encrypt partial content with a password. Positional: password, message. Supports infinite nesting. Body is Markdown -- use `{{% %}}`.

```markdown
{{% fixit-encryptor "mypassword" "Enter password to view" %}}
Secret content here.
{{% /fixit-encryptor %}}
```

For page-level encryption, use front matter `password` and `message` fields. For stronger security, use the `fixit-encrypt` tool (AES-256-GCM) as a post-build step.
