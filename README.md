# PURSUIT website

Source for https://pursuitgroup.ca, served by GitHub Pages (Jekyll builds it automatically on every change).

## Where things live

| To change | Edit |
| --- | --- |
| Co-lead names, bios, photos and links | `_data/people.yml` |
| Research program cards | `_data/programs.yml` |
| News items (newest first) | `_data/news.yml` |
| Contact email, review months, application form link | `_config.yml` |
| Page layout and wording of fixed sections | `index.html` |
| Colours, fonts and spacing | `assets/site.css` |

Photos go in `assets/people/` as square JPEGs (about 600 x 600 px). Set `photo:` to the file path, for example `assets/people/teja.jpg`.

## Applications

The Apply button points to `/apply/`, which forwards to the Google Form set in `form_url` in `_config.yml`.
