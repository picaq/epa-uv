# epa-uv

View the production build on github pages (faster): https://picaq.github.io/epa-uv/<br>
Or the development build on stackblitz (slow but prettier): https://react-numuay.stackblitz.io/ 

- Uses the [United States EPA Web Services’s](https://www.epa.gov/enviro/web-services) [Envirofacts Data Service API](https://www.epa.gov/enviro/envirofacts-data-service-api) for daily updating data.
- Only works for locations in the USA.
- Link can be saved/bookmarked with a query param `?zipcode=12345` to share local UV Index charts.
- Tab updates with the UV index of the current hour.
- Vertical time indicator is set to match device time, not local time.

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/picaq/epa-uv)

<img src="https://github.com/picaq/epa-uv/assets/34908590/46d130f2-6739-4881-82c7-f08ba3b46387" width=324 align=right>
<img src="https://github.com/picaq/epa-uv/assets/34908590/f2e751fe-2bf1-45a0-a3ce-34f7777e13df" width=324 align=right>

Update: 5/10/2024: added leading zeros to UV data

### Todo:
- [x] remove clickable / pointer finger mouse hover from legend toggle
- [ ] installable pwa with offline local storage
- [ ] general bug fixes
- [x] remove unused declarations
- [ ] info button and link back to repository
- [ ] cache API calls
- [ ] move forward and back to see different graphs
