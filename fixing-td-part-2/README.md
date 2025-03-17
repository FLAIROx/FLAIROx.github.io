# Distill v2 Template

This is a template for making a web publication or blog about your research.


## Local Development

### Spinning up
You'll want to clone this repo into a new project folder, e.g.
```
git clone https://github.com/FLAIROx/distillv2.git my-project
```

After you `cd` into your new project folder, run this command:
```
python -m http.server
```

It will spin up a basic HTTP server that will load the page contents on [localhost:8000](https://localhost:8000) (visit this link your browser to see the rendered contents).


### Updating page contents

- You shouldn't need to compile anything to update the website. To update the content, simply update the main html file, `index.html`.
- Add new static assets (e.g. videos and images) into the corresponding folders in `dist/` and link them up in the html.
- If you really want to change some of the JavaScript rendering logic, directly update the rendering logic in `dist/template.v2.js`.

When refreshing your browser to see updates, try `cmd + shift + R` to ensure you clear any cached css or javascript files before refreshing the page, and thus see the latest version of your site.

## Publishing your post
The simplest way to publish your content with free hosting is to create a new GitHub account and publish the site as a free GitHub page for that account. You should choose the account username based on what you want the web URL for your page to be. If you register the username, `my-username`, then the published GitHub page will be under the URL `https://my-username.github.io`.

For an example site built using the above process, check out [https://accelagent.github.io](https://accelagent.github.io).


## Disclaimer & License

This is a fork of the original Distill template.

Licensed under the Apache License, Version 2.0
