---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: default
keywords:
  - SQL
  - Select
  - Query
  - Custom
  - Function
  - Google
  - Sheets

---

![Demmings Logo](img/logo.png)

| Project Name | Description | Link | Docs |
| ------------ | ----------- | ---- | ---  |
| [gsSQL](https://github.com/demmings/gsSQL)  | Query Google Sheet data using standard SQL SELECT syntax |  [gsSQL Notes](/notes/gssql.markdown) | [JSDoc](/docs/gssql/index.html) |
| [cachefinance](https://github.com/demmings/cachefinance) | Google Sheet custom function and/or event trigger for enhanced stock/etf data lookup | [cachefinance Notes](/notes/cachefinance.markdown/) | |

<div class="col-md-12 main content-panel">

            <div class="articles">

              <h2>Latest Articles</h2>

              <ul>
                  {% for post in site.posts limit: site.post_limit %}

                      <li>
                          <a href="{{ post.url | prepend: site.baseurl }}">{{ post.title }}</a>
                          <small class="hidden-xs">{{ post.date | date: "%B %-d, %Y" }}</small>
                      </li>

                  {% endfor %}
                  
              </ul>

            </div>

        </div>