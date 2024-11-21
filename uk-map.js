<script src="https://unpkg.com/maplibre-gl/dist/maplibre-gl.js"></script>
<link href="https://unpkg.com/maplibre-gl/dist/maplibre-gl.css" rel="stylesheet" />

<script>
  // Initialize the map
  const map = new maplibregl.Map({
    style: 'https://tiles.openfreemap.org/styles/liberty',
    center: [-0.11792762131469203, 51.26599981116826], // Default center (London)
    zoom: 7.5, // Suitable zoom for UK-wide map
    container: 'map',
  });

  const defaultZoom = 7.5;
  const defaultCenter = [-0.11792762131469203, 51.26599981116826];
  let layerIds = []; // Track added layers
  let activeLayerId = null; // Track active layer
  let currentPopup = null; // Track current popup

  const defaultFillColor = '#ed1c24'; // Default color
  const activeFillColor = '#003f84'; // Active color
  const hoverFillColor = '#003f84';  // Hover color

  async function fetchPostcodeBoundary(postcode) {
    const url = `https://res.cloudinary.com/dxafbpndp/raw/upload/uk-postcode-polygon-geojson/${postcode}.geojson`;

    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error(`Failed to fetch GeoJSON for ${postcode}`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching GeoJSON for ${postcode}:`, error);
      return null;
    }
  }

  async function addPostalCodeBoundaries(postcode, town, coverage, filters) {
    const geoJsonData = await fetchPostcodeBoundary(postcode);

    if (geoJsonData) {
      const layerId = `boundary-${postcode}`;
      layerIds.push({ layerId, filters }); // Track layers and their filters

      map.addLayer({
        id: layerId,
        type: 'fill',
        source: {
          type: 'geojson',
          data: geoJsonData,
        },
        paint: {
          'fill-color': defaultFillColor,
          'fill-opacity': 0.5,
        },
      });

      map.on('click', layerId, (e) => {
        const coordinates = e.lngLat;
        let info = '';

        if (town) info += `<strong>Town:</strong> ${town}<br>`;
        if (postcode) info += `<strong>Postcode:</strong> ${postcode}<br>`;
        if (coverage) info += `<strong>Coverage:</strong> ${coverage}<br>`;

        if (info) {
          if (currentPopup) currentPopup.remove();
          currentPopup = new maplibregl.Popup({
            closeOnClick: false, // Keep popup open unless explicitly closed
          })
            .setLngLat(coordinates)
            .setHTML(info)
            .addTo(map);

          // Add event listener to handle the close button
          currentPopup.getElement()
            .querySelector('.maplibregl-popup-close-button')
            .addEventListener('click', (e) => {
              e.stopPropagation(); // Prevent triggering map click
              currentPopup.remove();
              currentPopup = null; // Reset current popup
            });
        }

        map.flyTo({ center: coordinates, zoom: 10 });

        if (activeLayerId) {
          map.setPaintProperty(activeLayerId, 'fill-color', defaultFillColor);
        }
        map.setPaintProperty(layerId, 'fill-color', activeFillColor);
        activeLayerId = layerId;
      });

      map.on('mouseenter', layerId, () => {
        if (activeLayerId !== layerId) {
          map.setPaintProperty(layerId, 'fill-color', hoverFillColor);
        }
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', layerId, () => {
        if (activeLayerId !== layerId) {
          map.setPaintProperty(layerId, 'fill-color', defaultFillColor);
        }
        map.getCanvas().style.cursor = '';
      });
    }
  }

  function filterMap(filter) {
    layerIds.forEach(({ layerId }) => {
      map.setLayoutProperty(layerId, 'visibility', 'none');
    });

    layerIds
      .filter(({ filters }) => filters.includes(filter))
      .forEach(({ layerId }) => {
        map.setLayoutProperty(layerId, 'visibility', 'visible');
      });

    // Reset zoom but only when filtering
    map.flyTo({ center: defaultCenter, zoom: defaultZoom });
    if (currentPopup) currentPopup.remove();
    currentPopup = null;
  }

  function resetMap() {
    layerIds.forEach(({ layerId }) => {
      map.setLayoutProperty(layerId, 'visibility', 'visible');
    });

    map.flyTo({ center: defaultCenter, zoom: defaultZoom });
    if (currentPopup) currentPopup.remove();
    currentPopup = null;

    document.querySelectorAll('.filter-button').forEach(btn => {
      btn.classList.remove('active');
    });
  }

  function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-button');

    filterButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        const filterValue = button.textContent.trim();

        event.stopPropagation();

        if (filterValue) {
          document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');
          filterMap(filterValue);
        }
      });
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.filter-button-container') && !event.target.closest('#map')) {
        resetMap();
      }
    });
  }

  async function initMap() {
    const postcodeData = [];
    const filtersSet = new Set();

    Webflow.push(() => {
      const postcodeItems = document.querySelectorAll('.w-dyn-item');
      const postcodeMap = new Map(); // Map to store unique postcodes and their data

      postcodeItems.forEach(item => {
        const postcodeElement = item.querySelector('.postcode-class');
        const townElement = item.querySelector('.town-class');
        const coverageElement = item.querySelector('.coverage-class');
        const filterElements = item.querySelectorAll('.filter-class');

        const postcode = postcodeElement ? postcodeElement.textContent.trim() : null;
        const town = townElement ? townElement.textContent.trim() : null;
        const coverage = coverageElement ? coverageElement.textContent.trim() : null;

        const filters = Array.from(filterElements).map(f => f.textContent.trim());

        if (postcode) {
          if (!postcodeMap.has(postcode)) {
            // Initialize entry for this postcode
            postcodeMap.set(postcode, { postcode, town, coverage, filters: new Set(filters) });
          } else {
            // Merge filters for duplicate postcodes
            const existingData = postcodeMap.get(postcode);
            filters.forEach(filter => existingData.filters.add(filter));
          }
        }
      });

      // Convert map back to an array and normalize filters to arrays
      postcodeMap.forEach(({ postcode, town, coverage, filters }) => {
        postcodeData.push({ postcode, town, coverage, filters: Array.from(filters) });
      });

      // Add layers and setup filter buttons
      postcodeData.forEach(async ({ postcode, town, coverage, filters }) => {
        await addPostalCodeBoundaries(postcode, town, coverage, filters);
      });

      setupFilterButtons();
    });
  }

  initMap();
</script>