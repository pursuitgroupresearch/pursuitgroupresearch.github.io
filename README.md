# PURSUIT website

Source for https://pursuitgroup.ca, served by GitHub Pages. GitHub rebuilds the site automatically a minute or two after every change.

## Where things live

| To change | Edit |
| --- | --- |
| Co-lead names, bios, photos and links | `_data/people.yml` (coleads) |
| Trainees (only people who have agreed to be listed) | `_data/people.yml` (trainees) |
| Research program cards | `_data/programs.yml` |
| News items (newest first) | `_data/news.yml` |
| Contact email, review months, application form link | `_config.yml` |
| Page layout and wording of fixed sections | `index.html` |
| Colours, fonts and spacing | `assets/site.css` |

Photos go in the `assets` folder as square JPEGs (about 600 x 600 px for co-leads, 200 x 200 px for trainees). Set `photo:` to the file path, for example `assets/teja.jpg`.

The Trainees section appears automatically once at least one trainee is listed in `_data/people.yml`; until then the page shows a short placeholder.

## Applications

The Apply button points to `/apply/`, which forwards to the Google Form set in `form_url` in `_config.yml`.

## House style

No em dashes anywhere in the site text. Keep the home page as one scrolling page. Do not mention funding, and do not mention the Alberta data (describe database work with MIMIC and eICU).
